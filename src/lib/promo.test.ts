import { describe, expect, it } from 'vitest';
import { PROMO_CODES, type PromoDefinition } from '@/config/promo';
import { evaluatePromo, normalizePromoCode } from './promo';

const CODES: PromoDefinition[] = [
  { code: 'DIX', kind: 'percent', value: 10, minSubtotal: 50_000, maxDiscount: 30_000 },
  { code: 'FIXE', kind: 'fixed', value: 5_000 },
  { code: 'SALON', kind: 'percent', value: 15, minItems: 8 },
  { code: 'ANCIEN', kind: 'fixed', value: 1_000, expiresAt: '2026-01-01T00:00:00Z' },
];
const NOW = new Date('2026-09-27T12:00:00Z');

describe('codes promo', () => {
  it('normalise la saisie (espaces, casse)', () => {
    expect(normalizePromoCode('  bien venue10 ')).toBe('BIENVENUE10');
    expect(evaluatePromo(' dix ', { subtotal: 100_000, itemCount: 1 }, CODES, NOW).ok).toBe(true);
  });

  it('pourcentage arrondi au dinar inférieur', () => {
    const result = evaluatePromo('DIX', { subtotal: 123_459, itemCount: 1 }, CODES, NOW);
    expect(result).toMatchObject({ ok: true, discount: 12_345 });
  });

  it('plafonne la remise', () => {
    expect(evaluatePromo('DIX', { subtotal: 900_000, itemCount: 3 }, CODES, NOW)).toMatchObject({ ok: true, discount: 30_000 });
  });

  it('montant fixe jamais supérieur au sous-total', () => {
    expect(evaluatePromo('FIXE', { subtotal: 3_000, itemCount: 1 }, CODES, NOW)).toMatchObject({ ok: true, discount: 3_000 });
  });

  it('refuse un code inconnu, expiré ou sous le minimum', () => {
    const cart = { subtotal: 40_000, itemCount: 2 };
    expect(evaluatePromo('NOPE', cart, CODES, NOW)).toMatchObject({ ok: false, reason: 'unknown' });
    expect(evaluatePromo('ANCIEN', cart, CODES, NOW)).toMatchObject({ ok: false, reason: 'expired' });
    expect(evaluatePromo('DIX', cart, CODES, NOW)).toMatchObject({ ok: false, reason: 'minSubtotal' });
    expect(evaluatePromo('SALON', cart, CODES, NOW)).toMatchObject({ ok: false, reason: 'minItems' });
  });

  it('accepte un code expirant plus tard', () => {
    expect(evaluatePromo('ANCIEN', { subtotal: 10_000, itemCount: 1 }, CODES, new Date('2025-12-31T00:00:00Z')).ok).toBe(true);
  });

  it('les codes de démo sont uniques et en forme canonique', () => {
    const codes = PROMO_CODES.map((promo) => promo.code);
    expect(new Set(codes).size).toBe(codes.length);
    for (const code of codes) expect(normalizePromoCode(code)).toBe(code);
  });

  it('toutes les remises sont des dinars entiers', () => {
    for (const subtotal of [49_999, 50_001, 77_777, 1_234_567]) {
      const result = evaluatePromo('DIX', { subtotal, itemCount: 1 }, CODES, NOW);
      if (result.ok) expect(Number.isInteger(result.discount)).toBe(true);
    }
  });
});
