import { PROMO_CODES, type PromoDefinition } from '@/config/promo.ts';
import type { DeliveryMethod } from '@/config/shipping.ts';
import type { Catalog } from '@/types/catalog.ts';
import type { OrderItemInput, OrderKind, OrderLine, OrderTotals } from '@/types/order.ts';
import { cartLines, cartTotals, type CartLine } from './pricing.ts';
import { evaluatePromo } from './promo.ts';
import { quoteShipping, type ShippingQuote } from './shipping.ts';

export interface OrderComputation {
  lines: CartLine[];
  totals: OrderTotals;
  shipping: ShippingQuote | null;
  appliedPromo?: string;
}

/**
 * Calcul complet d'une commande à partir des seuls identifiants et quantités :
 * prix du catalogue, code promo, livraison. C'est ce calcul que le serveur refait
 * (phase 08) ; le total affiché par le navigateur n'est jamais cru sur parole.
 */
export function computeOrder(
  items: OrderItemInput[],
  catalog: Catalog,
  delivery: { wilayaCode: number; method: DeliveryMethod },
  promoCode?: string,
  codes: PromoDefinition[] = PROMO_CODES,
  now: Date = new Date(),
): OrderComputation {
  const lines = cartLines(items, catalog);
  const base = cartTotals(lines);
  const promo = promoCode ? evaluatePromo(promoCode, base, codes, now) : null;
  const withDiscount = cartTotals(lines, promo?.ok ? promo.discount : 0);
  const shipping = quoteShipping(lines, delivery.wilayaCode, delivery.method, withDiscount.total);
  const shippingFee = shipping?.fee ?? 0;

  return {
    lines,
    shipping,
    totals: {
      subtotal: withDiscount.subtotal,
      discount: withDiscount.discount,
      shipping: shippingFee,
      total: withDiscount.total + shippingFee,
    },
    ...(promo?.ok ? { appliedPromo: promo.promo.code } : {}),
  };
}

/** Lignes figées pour l'historique de la commande. */
export function snapshotLines(lines: CartLine[]): OrderLine[] {
  return lines.map(({ product, variant, quantity }) => ({
    productId: product.id,
    variantId: variant.id,
    sku: variant.sku,
    name: product.name,
    variantLabel: variant.label,
    unitPrice: variant.price,
    quantity,
  }));
}

const NUMBER_PREFIX: Record<OrderKind, string> = { order: 'SAL', quote: 'DEV' };

/** Numéro lisible : SAL-2026-4K7Q2M (6 caractères sans 0/O ni 1/I pour la dictée au téléphone). */
export function orderNumber(kind: OrderKind, date: Date, random: () => number = Math.random): string {
  const alphabet = '23456789ABCDEFGHJKLMNPQRSTUVWXYZ';
  const suffix = Array.from({ length: 6 }, () => alphabet[Math.floor(random() * alphabet.length)]).join('');
  return `${NUMBER_PREFIX[kind]}-${date.getFullYear()}-${suffix}`;
}
