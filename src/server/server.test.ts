import { describe, expect, it } from 'vitest';
import { PROMO_CODES } from '@/config/promo';
import { ZONE_RATES } from '@/config/shipping';
import catalogData from '@/data/catalog.json';
import { parseCatalog } from '@/lib/catalogSchema';
import type { Order } from '@/types/order';
import { createOrder, handleCreateOrder, type CreateOrderDeps } from './createOrder';
import { parseOrderInput } from './orderInput';
import { orderToRow, rowToTracking } from './orderRows';
import { trackOrder } from './trackOrder';

const catalog = parseCatalog(catalogData);
const TABLE = { productId: 'table-ronde-atlas', variantId: 'table-ronde-atlas--chene', quantity: 1 };
const BODY = {
  kind: 'order',
  customer: { firstName: ' Amina ', lastName: 'Benali', phone: '+213 555 12 34 56' },
  address: { wilayaCode: 16, commune: 'Hydra', street: '5 rue Didouche' },
  deliveryMethod: 'home',
  paymentMethod: 'cod',
  items: [TABLE],
};

function fakeDeps(overrides: Partial<CreateOrderDeps> = {}) {
  const saved: Order[] = [];
  const deps: CreateOrderDeps = {
    loadCatalog: (ids) => Promise.resolve({ products: catalog.products.filter((p) => ids.includes(p.id)) }),
    findPromo: (code) => Promise.resolve(PROMO_CODES.find((promo) => promo.code === code) ?? null),
    insertOrder: (order) => {
      if (saved.some((o) => o.number === order.number)) return Promise.resolve('duplicate');
      saved.push(order);
      return Promise.resolve('ok');
    },
    now: () => new Date('2026-09-28T10:00:00Z'),
    random: Math.random,
    uuid: () => `id-${saved.length}`,
    ...overrides,
  };
  return { deps, saved };
}

describe('validation serveur de la commande', () => {
  it('normalise une commande valide', () => {
    expect(parseOrderInput(BODY)?.customer).toEqual({ firstName: 'Amina', lastName: 'Benali', phone: '0555123456' });
  });

  it.each([
    ['quantité hors limites', { items: [{ ...TABLE, quantity: 99 }] }],
    ['quantité décimale', { items: [{ ...TABLE, quantity: 1.5 }] }],
    ['panier vide', { items: [] }],
    ['téléphone étranger', { customer: { ...BODY.customer, phone: '+33 6 12 34 56 78' } }],
    ['wilaya inconnue', { address: { ...BODY.address, wilayaCode: 59 } }],
    ['adresse manquante', { address: { wilayaCode: 16 } }],
    ['mode de livraison inconnu', { deliveryMethod: 'drone' }],
  ])('refuse : %s', (_, patch) => {
    expect(parseOrderInput({ ...BODY, ...patch })).toBeNull();
  });

  it('fusionne une variante envoyée deux fois', () => {
    expect(parseOrderInput({ ...BODY, items: [TABLE, { ...TABLE, quantity: 2 }] })?.items).toEqual([{ ...TABLE, quantity: 3 }]);
  });
});

describe('create-order', () => {
  it('recalcule le total depuis la base et ignore tout prix envoyé', async () => {
    const { deps, saved } = fakeDeps();
    const result = await createOrder({ ...BODY, total: 1, totals: { total: 1 }, items: [{ ...TABLE, price: 1 }] }, deps);
    expect(result.status).toBe(201);
    const price = catalog.products.find((p) => p.id === TABLE.productId)?.variants.find((v) => v.id === TABLE.variantId)?.price ?? 0;
    expect(saved[0]?.totals).toEqual({ subtotal: price, discount: 0, shipping: ZONE_RATES.centre.base.home, total: price + ZONE_RATES.centre.base.home });
  });

  it('applique uniquement un code promo présent en base', async () => {
    const withCode = await createOrder({ ...BODY, items: [{ productId: 'canape-angle-oran', variantId: 'canape-angle-oran--lin-sable', quantity: 1 }], promoCode: 'bienvenue10' }, fakeDeps().deps);
    expect('order' in withCode.body && withCode.body.order.appliedPromo).toBe('BIENVENUE10');
    const noCode = await createOrder({ ...BODY, promoCode: 'BIENVENUE10' }, fakeDeps({ findPromo: () => Promise.resolve(null) }).deps);
    expect('order' in noCode.body && noCode.body.order.totals.discount).toBe(0);
  });

  it('refuse un article retiré de la vente', async () => {
    const result = await createOrder(BODY, fakeDeps({ loadCatalog: () => Promise.resolve({ products: [] }) }).deps);
    expect(result).toEqual({ status: 422, body: { error: 'emptyCart' } });
    const partial = await createOrder({ ...BODY, items: [TABLE, { productId: 'disparu', variantId: 'disparu--x', quantity: 1 }] }, fakeDeps().deps);
    expect(partial).toEqual({ status: 409, body: { error: 'unavailable' } });
  });

  it('refuse un paiement par carte tant que la passerelle n’est pas branchée', async () => {
    expect((await createOrder({ ...BODY, paymentMethod: 'cib' }, fakeDeps().deps)).body).toEqual({ error: 'payment' });
    // Un devis ne déclenche aucun paiement
    expect((await createOrder({ ...BODY, kind: 'quote', paymentMethod: 'cib' }, fakeDeps().deps)).status).toBe(201);
  });

  it('tire un nouveau numéro en cas de collision', async () => {
    const values = [0, 0, 0, 0, 0, 0, 0.5, 0.5, 0.5, 0.5, 0.5, 0.5];
    const { deps, saved } = fakeDeps({ random: () => values.shift() ?? 0.9 });
    await createOrder(BODY, { ...deps, random: () => 0 });
    await createOrder(BODY, deps);
    expect(saved.map((o) => o.number)).toEqual(['SAL-2026-222222', 'SAL-2026-JJJJJJ']);
  });

  it('répond en HTTP avec CORS, refuse GET et un corps non JSON', async () => {
    const { deps } = fakeDeps();
    expect((await handleCreateOrder(new Request('http://x', { method: 'OPTIONS' }), deps)).headers.get('Access-Control-Allow-Origin')).toBe('*');
    expect((await handleCreateOrder(new Request('http://x'), deps)).status).toBe(405);
    expect((await handleCreateOrder(new Request('http://x', { method: 'POST', body: '{oups' }), deps)).status).toBe(400);
    const ok = await handleCreateOrder(new Request('http://x', { method: 'POST', body: JSON.stringify(BODY) }), deps);
    expect(ok.status).toBe(201);
    expect(((await ok.json()) as { order: Order }).order.number).toMatch(/^SAL-2026-/);
  });
});

describe('track-order', () => {
  it('retrouve une commande par numéro + téléphone, sans données personnelles', async () => {
    const { deps, saved } = fakeDeps();
    await createOrder(BODY, deps);
    const order = saved[0];
    if (!order) throw new Error('commande absente');
    const row = orderToRow(order);
    const findTracking = (number: string, phone: string) =>
      Promise.resolve(number === row.number && phone === row.customer_phone ? rowToTracking(row, [{ status: 'pending', created_at: row.created_at }]) : null);

    const found = await trackOrder({ number: order.number.toLowerCase(), phone: '0555 12 34 56' }, { findTracking });
    expect(found.status).toBe(200);
    const tracking = 'tracking' in found.body ? found.body.tracking : null;
    expect(tracking?.events).toEqual([{ status: 'pending', at: order.createdAt }]);
    expect(JSON.stringify(tracking)).not.toContain('0555123456');
    expect(JSON.stringify(tracking)).not.toContain('Didouche');

    expect((await trackOrder({ number: order.number, phone: '0666000000' }, { findTracking })).status).toBe(404);
    expect((await trackOrder({ number: 42 }, { findTracking })).status).toBe(400);
  });
});
