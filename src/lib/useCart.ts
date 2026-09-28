import { PROMO_CODES } from '@/config/promo';
import { useCartStore } from '@/store/useCartStore';
import { cartLines, cartTotals, type CartLine, type CartTotals } from './pricing';
import { evaluatePromo, type PromoResult } from './promo';
import { useCatalog } from './useCatalog';

export interface CartView {
  lines: CartLine[];
  totals: CartTotals;
  /** Résultat du code saisi (null si aucun code) */
  promo: PromoResult | null;
}

/** Panier calculé : lignes aux prix du catalogue, code promo réévalué, totaux. */
export function useCart(): CartView {
  const catalog = useCatalog();
  const items = useCartStore((state) => state.items);
  const promoCode = useCartStore((state) => state.promoCode);

  const lines = cartLines(items, catalog);
  const base = cartTotals(lines);
  const promo = promoCode ? evaluatePromo(promoCode, base, PROMO_CODES) : null;
  return { lines, totals: cartTotals(lines, promo?.ok ? promo.discount : 0), promo };
}
