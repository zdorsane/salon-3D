import { SLOT_IDS, type Catalog, type Product, type SlotId, type Variant } from '@/types/catalog.ts';
import type { Composition } from '@/types/room.ts';
import { findProduct, findVariant } from './catalog.ts';

/** Un meuble du salon avec son prix (dinars entiers). */
export interface RoomLine {
  slotId: SlotId;
  product: Product;
  variant: Variant;
}

export interface RoomTotal {
  /** Total indicatif ; le montant qui fait foi est recalculé côté serveur */
  total: number;
  /** Total sans les promotions (prix barrés), égal à `total` s'il n'y en a pas */
  compareAtTotal: number;
  count: number;
}

/** Lignes du salon dans l'ordre des slots ; les placements introuvables sont ignorés. */
export function roomLines(composition: Composition, catalog: Catalog): RoomLine[] {
  return SLOT_IDS.flatMap((slotId) => {
    const placement = composition[slotId];
    const product = placement ? findProduct(catalog, placement.productId) : undefined;
    const variant = product && placement ? findVariant(product, placement.variantId) : undefined;
    return product && variant ? [{ slotId, product, variant }] : [];
  });
}

export function roomTotal(lines: RoomLine[]): RoomTotal {
  return lines.reduce<RoomTotal>(
    (sum, { variant }) => ({
      total: sum.total + variant.price,
      compareAtTotal: sum.compareAtTotal + (variant.compareAtPrice ?? variant.price),
      count: sum.count + 1,
    }),
    { total: 0, compareAtTotal: 0, count: 0 },
  );
}

/** Article du panier tel qu'il est enregistré (sans prix : recalculé depuis le catalogue). */
export interface CartItem {
  productId: string;
  variantId: string;
  quantity: number;
}

export interface CartLine {
  product: Product;
  variant: Variant;
  quantity: number;
  /** Prix × quantité */
  lineTotal: number;
}

export interface CartTotals {
  /** Somme des lignes aux prix actuels */
  subtotal: number;
  /** Somme sans les promotions produit (prix barrés) */
  compareAtSubtotal: number;
  /** Remise du code promo */
  discount: number;
  /** Total indicatif hors livraison ; le montant qui fait foi est recalculé côté serveur */
  total: number;
  itemCount: number;
}

/** Lignes valides du panier ; les articles disparus du catalogue sont ignorés. */
export function cartLines(items: CartItem[], catalog: Catalog): CartLine[] {
  return items.flatMap((item) => {
    const product = findProduct(catalog, item.productId);
    const variant = product ? findVariant(product, item.variantId) : undefined;
    if (!product || !variant || item.quantity <= 0) return [];
    return [{ product, variant, quantity: item.quantity, lineTotal: variant.price * item.quantity }];
  });
}

/** Totaux du panier ; `discount` vient du code promo (voir `lib/promo.ts`). */
export function cartTotals(lines: CartLine[], discount = 0): CartTotals {
  const subtotal = lines.reduce((sum, line) => sum + line.lineTotal, 0);
  const compareAtSubtotal = lines.reduce(
    (sum, line) => sum + (line.variant.compareAtPrice ?? line.variant.price) * line.quantity,
    0,
  );
  const itemCount = lines.reduce((sum, line) => sum + line.quantity, 0);
  const safeDiscount = Math.min(Math.max(0, Math.floor(discount)), subtotal);
  return { subtotal, compareAtSubtotal, discount: safeDiscount, total: subtotal - safeDiscount, itemCount };
}
