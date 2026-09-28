import type { PromoDefinition } from '@/config/promo.ts';

export type PromoRefusal = 'unknown' | 'expired' | 'minSubtotal' | 'minItems';

export type PromoResult =
  | { ok: true; promo: PromoDefinition; discount: number }
  | { ok: false; reason: PromoRefusal; promo?: PromoDefinition };

/** Forme canonique d'un code saisi : sans espaces, en majuscules. */
export function normalizePromoCode(input: string): string {
  return input.replace(/\s+/g, '').toUpperCase();
}

/**
 * Évalue un code promo sur un panier. Remise en dinars entiers, arrondie à l'inférieur,
 * plafonnée et jamais supérieure au sous-total.
 */
export function evaluatePromo(
  input: string,
  cart: { subtotal: number; itemCount: number },
  codes: PromoDefinition[],
  now: Date = new Date(),
): PromoResult {
  const code = normalizePromoCode(input);
  const promo = codes.find((entry) => entry.code === code);
  if (!promo) return { ok: false, reason: 'unknown' };
  if (promo.expiresAt && now.getTime() > new Date(promo.expiresAt).getTime()) return { ok: false, reason: 'expired', promo };
  if (promo.minSubtotal !== undefined && cart.subtotal < promo.minSubtotal) return { ok: false, reason: 'minSubtotal', promo };
  if (promo.minItems !== undefined && cart.itemCount < promo.minItems) return { ok: false, reason: 'minItems', promo };

  const raw = promo.kind === 'percent' ? Math.floor((cart.subtotal * promo.value) / 100) : promo.value;
  const capped = promo.maxDiscount === undefined ? raw : Math.min(raw, promo.maxDiscount);
  return { ok: true, promo, discount: Math.min(capped, cart.subtotal) };
}
