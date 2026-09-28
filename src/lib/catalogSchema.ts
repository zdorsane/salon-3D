import {
  BADGES,
  MATERIAL_PARTS,
  PRODUCT_CATEGORIES,
  PRODUCT_STYLES,
  VARIANT_OPTION_KEYS,
  type Catalog,
  type Dimensions,
  type LocalizedText,
  type MaterialSet,
  type MaterialSpec,
  type Product,
  type Variant,
} from '../types/catalog.ts';

/** Donnée de catalogue invalide : le chemin indique le champ fautif. */
export class CatalogError extends Error {
  constructor(path: string, expected: string) {
    super(`Catalogue invalide : ${path} doit être ${expected}`);
    this.name = 'CatalogError';
  }
}

type Json = Record<string, unknown>;

function record(value: unknown, path: string): Json {
  if (typeof value !== 'object' || value === null || Array.isArray(value)) throw new CatalogError(path, 'un objet');
  return value as Json;
}

function list(value: unknown, path: string): unknown[] {
  if (!Array.isArray(value)) throw new CatalogError(path, 'une liste');
  return value;
}

function textValue(value: unknown, path: string): string {
  if (typeof value !== 'string' || value === '') throw new CatalogError(path, 'un texte non vide');
  return value;
}

function text(obj: Json, key: string, path: string): string {
  return textValue(obj[key], `${path}.${key}`);
}

function number(obj: Json, key: string, path: string, integer = false): number {
  const value = obj[key];
  if (typeof value !== 'number' || !Number.isFinite(value) || value < 0 || (integer && !Number.isInteger(value))) {
    throw new CatalogError(`${path}.${key}`, integer ? 'un entier positif' : 'un nombre positif');
  }
  return value;
}

function optional<T>(obj: Json, key: string, read: () => T): T | undefined {
  return obj[key] === undefined ? undefined : read();
}

function oneOf<T extends string>(value: unknown, allowed: readonly T[], path: string): T {
  const match = allowed.find((item) => item === value);
  if (match === undefined) throw new CatalogError(path, `l'une des valeurs ${allowed.join(', ')}`);
  return match;
}

function localized(obj: Json, key: string, path: string): LocalizedText {
  const value = record(obj[key], `${path}.${key}`);
  return { fr: text(value, 'fr', `${path}.${key}`), en: text(value, 'en', `${path}.${key}`) };
}

function dimensions(value: unknown, path: string): Dimensions {
  const obj = record(value, path);
  return { width: number(obj, 'width', path), depth: number(obj, 'depth', path), height: number(obj, 'height', path) };
}

function materialSpec(value: unknown, path: string): MaterialSpec {
  const obj = record(value, path);
  const spec: MaterialSpec = { color: text(obj, 'color', path) };
  for (const key of ['roughness', 'metalness', 'sheen', 'sheenRoughness', 'clearcoat', 'clearcoatRoughness', 'transmission', 'opacity', 'emissiveIntensity'] as const) {
    const n = optional(obj, key, () => number(obj, key, path));
    if (n !== undefined) spec[key] = n;
  }
  for (const key of ['sheenColor', 'emissive'] as const) {
    const s = optional(obj, key, () => text(obj, key, path));
    if (s !== undefined) spec[key] = s;
  }
  return spec;
}

function materialSet(value: unknown, path: string): MaterialSet {
  const obj = record(value, path);
  const set: MaterialSet = {};
  for (const key of Object.keys(obj)) set[oneOf(key, MATERIAL_PARTS, `${path}.${key}`)] = materialSpec(obj[key], `${path}.${key}`);
  return set;
}

function variant(value: unknown, path: string, productId: string): Variant {
  const obj = record(value, path);
  const optionsObj = record(obj.options, `${path}.options`);
  const options: Variant['options'] = {};
  for (const key of Object.keys(optionsObj)) options[oneOf(key, VARIANT_OPTION_KEYS, `${path}.options`)] = text(optionsObj, key, `${path}.options`);
  if (text(obj, 'productId', path) !== productId) throw new CatalogError(`${path}.productId`, productId);

  const result: Variant = {
    id: text(obj, 'id', path),
    productId,
    sku: text(obj, 'sku', path),
    label: localized(obj, 'label', path),
    options,
    swatch: text(obj, 'swatch', path),
    price: number(obj, 'price', path, true),
    stock: number(obj, 'stock', path, true),
    materials: materialSet(obj.materials ?? {}, `${path}.materials`),
  };
  const compareAtPrice = optional(obj, 'compareAtPrice', () => number(obj, 'compareAtPrice', path, true));
  if (compareAtPrice !== undefined) result.compareAtPrice = compareAtPrice;
  const size = optional(obj, 'dimensions', () => dimensions(obj.dimensions, `${path}.dimensions`));
  if (size) result.dimensions = size;
  return result;
}

function product(value: unknown, path: string): Product {
  const obj = record(value, path);
  const id = text(obj, 'id', path);
  const modelUrl = obj.modelUrl === null ? null : text(obj, 'modelUrl', path);
  const variants = list(obj.variants, `${path}.variants`).map((item, i) => variant(item, `${path}.variants[${i}]`, id));
  if (variants.length === 0) throw new CatalogError(`${path}.variants`, 'non vide');

  const result: Product = {
    id,
    slug: text(obj, 'slug', path),
    name: localized(obj, 'name', path),
    brand: text(obj, 'brand', path),
    category: oneOf(obj.category, PRODUCT_CATEGORIES, `${path}.category`),
    style: oneOf(obj.style, PRODUCT_STYLES, `${path}.style`),
    description: localized(obj, 'description', path),
    dimensions: dimensions(obj.dimensions, `${path}.dimensions`),
    weightKg: number(obj, 'weightKg', path),
    materialsLabel: localized(obj, 'materialsLabel', path),
    deliveryDays: number(obj, 'deliveryDays', path, true),
    rating: number(obj, 'rating', path),
    ratingCount: number(obj, 'ratingCount', path, true),
    badges: list(obj.badges, `${path}.badges`).map((badge, i) => oneOf(badge, BADGES, `${path}.badges[${i}]`)),
    modelUrl,
    images: list(obj.images, `${path}.images`).map((item, i) => textValue(item, `${path}.images[${i}]`)),
    materials: materialSet(obj.materials, `${path}.materials`),
    variants,
  };
  const elevation = optional(obj, 'elevation', () => number(obj, 'elevation', path));
  if (elevation !== undefined) result.elevation = elevation;
  const placeholder = optional(obj, 'placeholder', () => text(obj, 'placeholder', path));
  if (placeholder !== undefined) result.placeholder = placeholder;
  const datasheetUrl = optional(obj, 'datasheetUrl', () => text(obj, 'datasheetUrl', path));
  if (datasheetUrl !== undefined) result.datasheetUrl = datasheetUrl;
  return result;
}

/** Valide des données brutes (JSON démo ou Supabase) et renvoie un catalogue typé. */
export function parseCatalog(data: unknown): Catalog {
  const root = record(data, 'catalogue');
  return { products: list(root.products, 'products').map((item, i) => product(item, `products[${i}]`)) };
}
