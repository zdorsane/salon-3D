import { describe, expect, it } from 'vitest';
import { FREE_SHIPPING_MIN, ZONE_RATES } from '@/config/shipping';
import catalogData from '@/data/catalog.json';
import { parseCatalog } from './catalogSchema';
import { computeOrder, orderNumber, snapshotLines } from './checkout';
import { formatAlgerianPhone, isValidEmail, normalizeAlgerianPhone } from './validation';

const catalog = parseCatalog(catalogData);
const TABLE = { productId: 'table-ronde-atlas', variantId: 'table-ronde-atlas--chene', quantity: 2 };
const SOFA = { productId: 'canape-angle-oran', variantId: 'canape-angle-oran--lin-sable', quantity: 2 };
const ALGER = { wilayaCode: 16, method: 'home' as const };

describe('calcul de la commande', () => {
  it('sous-total, livraison et total en dinars entiers', () => {
    const { totals, lines } = computeOrder([TABLE], catalog, ALGER);
    const unit = lines[0]?.variant.price ?? 0;
    expect(totals).toEqual({
      subtotal: unit * 2,
      discount: 0,
      shipping: ZONE_RATES.centre.base.home,
      total: unit * 2 + ZONE_RATES.centre.base.home,
    });
  });

  it('applique le code promo avant de tester la livraison offerte', () => {
    const { totals, appliedPromo } = computeOrder([SOFA], catalog, ALGER, 'bienvenue10');
    expect(appliedPromo).toBe('BIENVENUE10');
    expect(totals.discount).toBe(30_000);
    const discounted = totals.subtotal - totals.discount;
    expect(totals.shipping === 0).toBe(discounted >= FREE_SHIPPING_MIN);
    expect(totals.total).toBe(discounted + totals.shipping);
  });

  it('ignore un code refusé sans bloquer la commande', () => {
    const { totals, appliedPromo } = computeOrder([TABLE], catalog, ALGER, 'FAUX');
    expect(appliedPromo).toBeUndefined();
    expect(totals.discount).toBe(0);
  });

  it('fige les lignes (SKU, libellés, prix unitaire)', () => {
    const [line] = snapshotLines(computeOrder([TABLE], catalog, ALGER).lines);
    expect(line).toMatchObject({ productId: TABLE.productId, quantity: 2, sku: expect.stringMatching(/^SAL-/) });
    expect(Number.isInteger(line?.unitPrice)).toBe(true);
  });
});

describe('numéro de commande', () => {
  it('préfixe selon le type, année, 6 caractères lisibles', () => {
    const date = new Date('2026-09-28T10:00:00Z');
    expect(orderNumber('order', date, () => 0)).toBe('SAL-2026-222222');
    expect(orderNumber('quote', date)).toMatch(/^DEV-2026-[2-9A-HJ-NP-Z]{6}$/);
  });
});

describe('téléphone algérien', () => {
  it.each([
    ['0555 12 34 56', '0555123456'],
    ['+213 661-23-45-67', '0661234567'],
    ['00213771234567', '0771234567'],
    ['213555123456', '0555123456'],
    ['021 23 45 67', '021234567'],
  ])('accepte %s', (input, expected) => {
    expect(normalizeAlgerianPhone(input)).toBe(expected);
  });

  it.each(['0855123456', '055512345', '12345', '', '+33612345678'])('refuse %s', (input) => {
    expect(normalizeAlgerianPhone(input)).toBeNull();
  });

  it('affiche le numéro par groupes', () => {
    expect(formatAlgerianPhone('0555123456')).toBe('0555 12 34 56');
    expect(formatAlgerianPhone('021234567')).toBe('021 23 45 67');
  });
});

describe('e-mail', () => {
  it('valide les formes simples', () => {
    expect(isValidEmail('client@exemple.dz')).toBe(true);
    expect(isValidEmail('client@exemple')).toBe(false);
    expect(isValidEmail('pas un mail')).toBe(false);
  });
});
