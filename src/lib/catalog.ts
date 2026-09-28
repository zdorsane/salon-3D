/**
 * Fonctions pures sur le catalogue, partagées avec les edge functions (Deno) :
 * imports avec extension `.ts`, aucune dépendance au navigateur. Chargement : `catalogSource.ts`.
 */
import type { SlotDefinition } from '@/config/slots.ts';
import { MATERIAL_PARTS, type Catalog, type Dimensions, type MaterialSet, type Product, type Variant } from '@/types/catalog.ts';
import { cmToM, dimensionsToMeters } from './units.ts';

/** Tolérance de mesure (m) pour absorber les arrondis. */
const FIT_TOLERANCE = 0.005;

export function findProduct(catalog: Catalog, productId: string): Product | undefined {
  return catalog.products.find((product) => product.id === productId);
}

export function findVariant(product: Product, variantId: string): Variant | undefined {
  return product.variants.find((variant) => variant.id === variantId);
}

/** Variante par défaut : la première en stock, sinon la première. */
export function defaultVariant(product: Product): Variant | undefined {
  return product.variants.find((variant) => variant.stock > 0) ?? product.variants[0];
}

/** Dimensions effectives : celles de la variante (option de taille) ou du produit. */
export function effectiveDimensions(product: Product, variant?: Variant): Dimensions {
  return variant?.dimensions ?? product.dimensions;
}

/** Matériaux finaux : base du produit surchargée partie par partie par la variante. */
export function resolveMaterials(product: Product, variant?: Variant): MaterialSet {
  const merged: MaterialSet = { ...product.materials };
  for (const part of MATERIAL_PARTS) {
    const spec = variant?.materials[part];
    if (!spec) continue;
    const base = merged[part];
    merged[part] = base ? { ...base, ...spec } : spec;
  }
  return merged;
}

export type Compatibility = 'ok' | 'wrongCategory' | 'tooLarge';

/** Le produit (dans sa variante) tient-il dans la boîte max du slot ? */
export function fitsSlot(dimensions: Dimensions, slot: SlotDefinition, elevationCm = 0): boolean {
  const size = dimensionsToMeters(dimensions);
  const max = slot.maxSize;
  const usedHeight = size.height + (slot.mount === 'ceiling' ? 0 : cmToM(elevationCm));
  return (
    size.width <= max.width + FIT_TOLERANCE &&
    size.depth <= max.depth + FIT_TOLERANCE &&
    usedHeight <= max.height + FIT_TOLERANCE
  );
}

/** Compatibilité produit ↔ slot : catégorie acceptée puis encombrement. */
export function compatibility(product: Product, slot: SlotDefinition, variant?: Variant): Compatibility {
  if (!slot.categories.includes(product.category)) return 'wrongCategory';
  return fitsSlot(effectiveDimensions(product, variant), slot, product.elevation) ? 'ok' : 'tooLarge';
}

/** Produits de catégorie acceptée par le slot (les trop grands sont inclus, pour être grisés). */
export function productsForSlot(catalog: Catalog, slot: SlotDefinition): Product[] {
  return catalog.products.filter((product) => slot.categories.includes(product.category));
}

/** Première variante qui tient dans le slot (sinon la variante par défaut, qui sera grisée). */
export function fittingVariant(product: Product, slot: SlotDefinition): Variant | undefined {
  return product.variants.find((variant) => compatibility(product, slot, variant) === 'ok') ?? defaultVariant(product);
}
