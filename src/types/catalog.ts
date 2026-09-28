/** Types partagés du catalogue (front, seed Supabase, fonctions serveur). */

export const SLOT_IDS = [
  'canape',
  'tableBasse',
  'tapis',
  'fauteuil',
  'meubleTV',
  'rangement',
  'luminaire1',
  'luminaire2',
  'deco1',
  'deco2',
  'deco3',
] as const;

export type SlotId = (typeof SLOT_IDS)[number];

export const PRODUCT_CATEGORIES = [
  'canapeAngle',
  'canape3Places',
  'canapeModulable',
  'tableRonde',
  'tableRectangulaire',
  'tableGigogne',
  'tapis',
  'fauteuil',
  'chauffeuse',
  'rockingChair',
  'meubleTV',
  'console',
  'bibliotheque',
  'vaisselier',
  'etagereMurale',
  'suspension',
  'lampadaire',
  'plante',
  'vase',
  'tableau',
] as const;

export type ProductCategory = (typeof PRODUCT_CATEGORIES)[number];

export const BADGES = ['nouveau', 'promo', 'fabriqueEnAlgerie', 'bestSeller'] as const;
export type Badge = (typeof BADGES)[number];

export const PRODUCT_STYLES = ['moderne', 'scandinave', 'classique', 'oriental'] as const;
export type ProductStyle = (typeof PRODUCT_STYLES)[number];

export const VARIANT_OPTION_KEYS = ['tissu', 'couleur', 'bois', 'taille'] as const;
export type VariantOptionKey = (typeof VARIANT_OPTION_KEYS)[number];

/**
 * Parties d'un modèle 3D auxquelles s'appliquent les matériaux.
 * Dans un .glb, le nom du matériau doit être l'une de ces valeurs.
 */
export const MATERIAL_PARTS = ['fabric', 'wood', 'metal', 'accent', 'foliage', 'glass', 'light'] as const;
export type MaterialPart = (typeof MATERIAL_PARTS)[number];

export interface LocalizedText {
  fr: string;
  en: string;
}

/** Dimensions en centimètres : largeur (L) × profondeur (P) × hauteur (H). */
export interface Dimensions {
  width: number;
  depth: number;
  height: number;
}

/** Réglages PBR d'une partie (couleurs hexadécimales). */
export interface MaterialSpec {
  color: string;
  roughness?: number;
  metalness?: number;
  sheen?: number;
  sheenColor?: string;
  sheenRoughness?: number;
  clearcoat?: number;
  clearcoatRoughness?: number;
  transmission?: number;
  opacity?: number;
  emissive?: string;
  emissiveIntensity?: number;
}

export type MaterialSet = Partial<Record<MaterialPart, MaterialSpec>>;

export interface Variant {
  id: string;
  productId: string;
  sku: string;
  label: LocalizedText;
  /** Codes d'options (filtrage, sélecteurs) */
  options: Partial<Record<VariantOptionKey, string>>;
  /** Couleur de la pastille dans le sélecteur */
  swatch: string;
  /** Prix en dinars entiers */
  price: number;
  compareAtPrice?: number;
  stock: number;
  /** Surcharges appliquées au modèle déjà chargé */
  materials: MaterialSet;
  /** Dimensions propres à cette variante (options de taille) */
  dimensions?: Dimensions;
}

export interface Product {
  id: string;
  slug: string;
  name: LocalizedText;
  brand: string;
  category: ProductCategory;
  style: ProductStyle;
  description: LocalizedText;
  dimensions: Dimensions;
  weightKg: number;
  materialsLabel: LocalizedText;
  deliveryDays: number;
  rating: number;
  ratingCount: number;
  badges: Badge[];
  /** .glb optimisé ; null = forme provisoire générée selon la catégorie */
  modelUrl: string | null;
  images: string[];
  datasheetUrl?: string;
  /** Hauteur de pose au-dessus du sol en cm (objets muraux) */
  elevation?: number;
  /** Variante de forme provisoire (démo, sans .glb) : globe, cone, arc… */
  placeholder?: string;
  /** Matériaux de base, complétés par ceux de la variante */
  materials: MaterialSet;
  variants: Variant[];
}

export interface Catalog {
  products: Product[];
}
