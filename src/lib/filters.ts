import { QUICK_DELIVERY_DAYS } from '@/config/shop';
import type { Product, ProductStyle } from '@/types/catalog';

/** Filtres du carrousel d'alternatives (valeurs vides = pas de filtre). */
export interface ProductFilters {
  maxPrice: number | null;
  styles: ProductStyle[];
  /** Couleurs de pastille (hex) */
  colors: string[];
  /** Codes de matière (options tissu / bois) */
  materials: string[];
  quickDelivery: boolean;
}

export const EMPTY_FILTERS: ProductFilters = { maxPrice: null, styles: [], colors: [], materials: [], quickDelivery: false };

export function lowestPrice(product: Product): number {
  return Math.min(...product.variants.map((variant) => variant.price));
}

export function priceBounds(products: Product[]): { min: number; max: number } {
  const prices = products.map(lowestPrice);
  return { min: Math.min(...prices), max: Math.max(...prices) };
}

export function productMaterials(product: Product): string[] {
  return [...new Set(product.variants.flatMap((v) => [v.options.tissu, v.options.bois]).filter((code) => code !== undefined))];
}

export function productColors(product: Product): string[] {
  return [...new Set(product.variants.map((variant) => variant.swatch))];
}

export function isQuickDelivery(product: Product): boolean {
  return product.deliveryDays <= QUICK_DELIVERY_DAYS && product.variants.some((variant) => variant.stock > 0);
}

const intersects = (a: string[], b: string[]) => a.some((item) => b.includes(item));

export function filterProducts(products: Product[], filters: ProductFilters): Product[] {
  return products.filter(
    (product) =>
      (filters.maxPrice === null || lowestPrice(product) <= filters.maxPrice) &&
      (filters.styles.length === 0 || filters.styles.includes(product.style)) &&
      (filters.colors.length === 0 || intersects(productColors(product), filters.colors)) &&
      (filters.materials.length === 0 || intersects(productMaterials(product), filters.materials)) &&
      (!filters.quickDelivery || isQuickDelivery(product)),
  );
}

export function countActiveFilters(filters: ProductFilters): number {
  return (
    (filters.maxPrice === null ? 0 : 1) +
    filters.styles.length +
    filters.colors.length +
    filters.materials.length +
    (filters.quickDelivery ? 1 : 0)
  );
}
