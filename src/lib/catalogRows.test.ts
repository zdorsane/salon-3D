import { describe, expect, it } from 'vitest';
import catalogData from '@/data/catalog.json';
import { catalogToRows, rowsToCatalogData, type ProductWithVariantsRow } from './catalogRows';
import { parseCatalog } from './catalogSchema';

const catalog = parseCatalog(catalogData);

/** Simule la réponse de Supabase : produits avec leurs variantes, colonnes nulles, numeric en texte. */
function asSupabaseRows(): ProductWithVariantsRow[] {
  const { products, variants } = catalogToRows(catalog);
  return products.map((product) => ({
    ...product,
    weight_kg: String(product.weight_kg) as unknown as number,
    rating: String(product.rating) as unknown as number,
    variants: variants.filter((variant) => variant.product_id === product.id).reverse(),
  }));
}

describe('catalogue ↔ lignes Supabase', () => {
  it('aller-retour sans perte (ordre, colonnes nulles, numeric en texte)', () => {
    expect(parseCatalog(rowsToCatalogData(asSupabaseRows().reverse()))).toEqual(catalog);
  });

  it('une ligne par variante, SKU uniques, prix entiers', () => {
    const { products, variants } = catalogToRows(catalog);
    expect(products).toHaveLength(catalog.products.length);
    expect(new Set(variants.map((v) => v.sku)).size).toBe(variants.length);
    expect(variants.every((v) => Number.isInteger(v.price))).toBe(true);
  });

  it('garde modelUrl nul (forme provisoire)', () => {
    const parsed = parseCatalog(rowsToCatalogData(asSupabaseRows()));
    expect(parsed.products.every((product) => product.modelUrl === null)).toBe(true);
  });
});
