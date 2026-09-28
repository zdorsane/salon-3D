import { beforeEach, describe, expect, it } from 'vitest';
import { useOrdersStore } from '@/store/useOrdersStore';
import type { OrderInput } from '@/types/order';
import { localOrderService } from './local';
import { OrderError } from './types';

const INPUT: OrderInput = {
  kind: 'order',
  customer: { firstName: 'Amina', lastName: 'Benali', phone: '0555123456' },
  address: { wilayaCode: 31, commune: 'Bir El Djir', street: '12 rue des Oliviers' },
  deliveryMethod: 'home',
  paymentMethod: 'cod',
  items: [{ productId: 'table-ronde-atlas', variantId: 'table-ronde-atlas--chene', quantity: 1 }],
};

describe('service de commandes (démo)', () => {
  beforeEach(() => useOrdersStore.setState({ orders: [] }));

  it('recalcule, numérote et enregistre la commande', async () => {
    const order = await localOrderService.create(INPUT);
    expect(order.number).toMatch(/^SAL-\d{4}-/);
    expect(order.status).toBe('pending');
    expect(order.totals.total).toBe(order.totals.subtotal - order.totals.discount + order.totals.shipping);
    expect(order.lines[0]?.unitPrice).toBe(order.totals.subtotal);
    const tracking = await localOrderService.track(order.number.toLowerCase(), '+213 555 12 34 56');
    expect(tracking).toMatchObject({ number: order.number, status: 'pending', events: [{ status: 'pending' }] });
    expect(await localOrderService.track(order.number, '0666000000')).toBeNull();
  });

  it('numérote une demande de devis DEV-…', async () => {
    const quote = await localOrderService.create({ ...INPUT, kind: 'quote' });
    expect(quote.number).toMatch(/^DEV-/);
  });

  it('refuse un panier vide ou une wilaya inconnue', async () => {
    await expect(localOrderService.create({ ...INPUT, items: [] })).rejects.toBeInstanceOf(OrderError);
    await expect(localOrderService.create({ ...INPUT, address: { ...INPUT.address, wilayaCode: 77 } })).rejects.toThrow('wilaya');
  });
});
