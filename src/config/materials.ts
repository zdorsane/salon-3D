import type { MaterialPart, MaterialSpec } from '@/types/catalog';

/** Matériau neutre d'une partie non renseignée par le produit ou la variante. */
export const DEFAULT_PART_MATERIALS: Record<MaterialPart, MaterialSpec> = {
  fabric: { color: '#d8cbb3', roughness: 0.9, sheen: 0.5, sheenColor: '#ffffff', sheenRoughness: 0.8 },
  wood: { color: '#b8895a', roughness: 0.55 },
  metal: { color: '#1e1e1e', roughness: 0.45, metalness: 0.8 },
  accent: { color: '#e9e2d5', roughness: 0.8 },
  foliage: { color: '#4e6b3a', roughness: 0.8 },
  glass: { color: '#dfe9ec', roughness: 0.05, transmission: 0.9, opacity: 0.35 },
  light: { color: '#fff6e8', roughness: 0.4, emissive: '#ffe2b8', emissiveIntensity: 0.25 },
};
