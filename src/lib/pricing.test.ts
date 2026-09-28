import { describe, expect, it } from 'vitest';
import { DEFAULT_COMPOSITION } from '@/config/presets';
import catalogData from '@/data/catalog.json';
import { SLOT_IDS } from '@/types/catalog';
import type { Composition } from '@/types/room';
import { findProduct, findVariant } from './catalog';
import { parseCatalog } from './catalogSchema';
import { cartLines, cartTotals, roomLines, roomTotal } from './pricing';

const catalog = parseCatalog(catalogData);

function priceOf(productId: string, variantId: string): { price: number; compareAt: number } {
  const product = findProduct(catalog, productId);
  const variant = product && findVariant(product, variantId);
  if (!variant) throw new Error(`Variante ${variantId} absente`);
  return { price: variant.price, compareAt: variant.compareAtPrice ?? variant.price };
}

describe('prix du salon', () => {
  it('additionne le prix de chaque meuble placé, en dinars entiers', () => {
    const lines = roomLines(DEFAULT_COMPOSITION, catalog);
    const expected = SLOT_IDS.reduce((sum, slotId) => {
      const placement = DEFAULT_COMPOSITION[slotId];
      return placement ? sum + priceOf(placement.productId, placement.variantId).price : sum;
    }, 0);
    const total = roomTotal(lines);
    expect(total.count).toBe(SLOT_IDS.length);
    expect(total.total).toBe(expected);
    expect(Number.isInteger(total.total)).toBe(true);
  });

  it('le total avant promo compte les prix barrés', () => {
    const composition: Composition = { ...DEFAULT_COMPOSITION, canape: { productId: 'canape-angle-oran', variantId: 'canape-angle-oran--anthracite' } };
    const total = roomTotal(roomLines(composition, catalog));
    const sofa = priceOf('canape-angle-oran', 'canape-angle-oran--anthracite');
    expect(sofa.compareAt).toBeGreaterThan(sofa.price);
    expect(total.compareAtTotal - total.total).toBeGreaterThanOrEqual(sofa.compareAt - sofa.price);
  });

  it('ignore les slots vides et les produits inconnus', () => {
    const composition: Composition = {
      ...DEFAULT_COMPOSITION,
      deco3: null,
      deco1: { productId: 'produit-disparu', variantId: 'produit-disparu--x' },
    };
    const lines = roomLines(composition, catalog);
    expect(lines).toHaveLength(SLOT_IDS.length - 2);
    expect(lines.map((line) => line.slotId)).not.toContain('deco1');
  });

  it('un salon vide coûte 0 DA', () => {
    const empty = Object.fromEntries(SLOT_IDS.map((id) => [id, null])) as Composition;
    expect(roomTotal(roomLines(empty, catalog))).toEqual({ total: 0, compareAtTotal: 0, count: 0 });
  });
});

describe('prix du panier', () => {
  const sofa = { productId: 'canape-angle-oran', variantId: 'canape-angle-oran--anthracite' };
  const table = { productId: 'table-ronde-atlas', variantId: 'table-ronde-atlas--chene' };

  it('multiplie le prix par la quantité et additionne les lignes', () => {
    const lines = cartLines([{ ...sofa, quantity: 2 }, { ...table, quantity: 1 }], catalog);
    const totals = cartTotals(lines);
    const expected = priceOf(sofa.productId, sofa.variantId).price * 2 + priceOf(table.productId, table.variantId).price;
    expect(totals).toMatchObject({ subtotal: expected, total: expected, discount: 0, itemCount: 3 });
    expect(lines[0]?.lineTotal).toBe(priceOf(sofa.productId, sofa.variantId).price * 2);
  });

  it('compte les prix barrés dans le total avant promotions', () => {
    const totals = cartTotals(cartLines([{ ...sofa, quantity: 1 }], catalog));
    expect(totals.compareAtSubtotal).toBe(priceOf(sofa.productId, sofa.variantId).compareAt);
  });

  it('applique une remise entière, jamais supérieure au sous-total', () => {
    const lines = cartLines([{ ...table, quantity: 1 }], catalog);
    const price = priceOf(table.productId, table.variantId).price;
    expect(cartTotals(lines, 1000.9)).toMatchObject({ discount: 1000, total: price - 1000 });
    expect(cartTotals(lines, price * 5)).toMatchObject({ discount: price, total: 0 });
    expect(cartTotals(lines, -50).discount).toBe(0);
  });

  it('ignore les articles disparus du catalogue et les quantités nulles', () => {
    const lines = cartLines(
      [
        { productId: 'disparu', variantId: 'disparu--x', quantity: 1 },
        { ...table, quantity: 0 },
        { ...sofa, quantity: 1 },
      ],
      catalog,
    );
    expect(lines).toHaveLength(1);
  });
});
