/**
 * Conversion catalogue ↔ lignes des tables `products` et `variants` (Supabase).
 * Partagé avec les edge functions et le script de seed : n'importe que des types,
 * pour rester exécutable tel quel par Deno et par Node.
 */
import type { Catalog, Product, Variant } from '@/types/catalog.ts';

export interface VariantRow {
  id: string;
  product_id: string;
  sku: string;
  label: unknown;
  options: unknown;
  swatch: string;
  price: number;
  compare_at_price: number | null;
  stock: number;
  materials: unknown;
  dimensions: unknown;
  sort_order: number;
}

export interface ProductRow {
  id: string;
  slug: string;
  category: string;
  style: string;
  name: unknown;
  description: unknown;
  brand: string;
  dimensions: unknown;
  weight_kg: number;
  materials_label: unknown;
  delivery_days: number;
  rating: number;
  rating_count: number;
  badges: string[];
  model_url: string | null;
  images: string[];
  datasheet_url: string | null;
  elevation: number | null;
  placeholder: string | null;
  materials: unknown;
  sort_order: number;
}

/** Produit tel que renvoyé par `select('*, variants(*)')`. */
export type ProductWithVariantsRow = ProductRow & { variants: VariantRow[] };

/** Retire les clés nulles (colonnes facultatives) : le schéma du catalogue attend leur absence. */
function withoutNulls(entry: Record<string, unknown>): Record<string, unknown> {
  return Object.fromEntries(Object.entries(entry).filter(([, value]) => value !== null && value !== undefined));
}

/**
 * Lignes SQL → données brutes du catalogue, à valider ensuite par `parseCatalog`
 * (Postgres renvoie `numeric` en texte : les nombres sont reconvertis).
 */
export function rowsToCatalogData(rows: ProductWithVariantsRow[]): unknown {
  const products = [...rows]
    .sort((a, b) => a.sort_order - b.sort_order)
    .map((row) => ({
      // modelUrl null a un sens (forme provisoire) : il reste présent même nul
      modelUrl: row.model_url,
      ...withoutNulls({
        id: row.id,
        slug: row.slug,
        name: row.name,
        brand: row.brand,
        category: row.category,
        style: row.style,
        description: row.description,
        dimensions: row.dimensions,
        weightKg: Number(row.weight_kg),
        materialsLabel: row.materials_label,
        deliveryDays: row.delivery_days,
        rating: Number(row.rating),
        ratingCount: row.rating_count,
        badges: row.badges,
        images: row.images,
        datasheetUrl: row.datasheet_url,
        elevation: row.elevation,
        placeholder: row.placeholder,
        materials: row.materials,
        variants: [...row.variants]
          .sort((a, b) => a.sort_order - b.sort_order)
          .map((variant) =>
            withoutNulls({
              id: variant.id,
              productId: variant.product_id,
              sku: variant.sku,
              label: variant.label,
              options: variant.options,
              swatch: variant.swatch,
              price: variant.price,
              compareAtPrice: variant.compare_at_price,
              stock: variant.stock,
              materials: variant.materials,
              dimensions: variant.dimensions,
            }),
          ),
      }),
    }));
  return { products };
}

/** Catalogue → lignes à insérer (seed, import depuis l'administration). */
export function catalogToRows(catalog: Catalog): { products: ProductRow[]; variants: VariantRow[] } {
  const products = catalog.products.map((product: Product, index): ProductRow => ({
    id: product.id,
    slug: product.slug,
    category: product.category,
    style: product.style,
    name: product.name,
    description: product.description,
    brand: product.brand,
    dimensions: product.dimensions,
    weight_kg: product.weightKg,
    materials_label: product.materialsLabel,
    delivery_days: product.deliveryDays,
    rating: product.rating,
    rating_count: product.ratingCount,
    badges: product.badges,
    model_url: product.modelUrl,
    images: product.images,
    datasheet_url: product.datasheetUrl ?? null,
    elevation: product.elevation ?? null,
    placeholder: product.placeholder ?? null,
    materials: product.materials,
    sort_order: index,
  }));
  const variants = catalog.products.flatMap((product) =>
    product.variants.map((variant: Variant, index): VariantRow => ({
      id: variant.id,
      product_id: product.id,
      sku: variant.sku,
      label: variant.label,
      options: variant.options,
      swatch: variant.swatch,
      price: variant.price,
      compare_at_price: variant.compareAtPrice ?? null,
      stock: variant.stock,
      materials: variant.materials,
      dimensions: variant.dimensions ?? null,
      sort_order: index,
    })),
  );
  return { products, variants };
}
