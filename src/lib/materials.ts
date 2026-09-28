import { Mesh, MeshPhysicalMaterial, type Object3D } from 'three';
import { DEFAULT_PART_MATERIALS } from '@/config/materials';
import { MATERIAL_PARTS, type MaterialPart, type MaterialSet, type MaterialSpec } from '@/types/catalog';

/** Un matériau PBR par partie, partagé par tous les maillages de cette partie. */
export type PartMaterials = Record<MaterialPart, MeshPhysicalMaterial>;

export function isMaterialPart(name: string): name is MaterialPart {
  return (MATERIAL_PARTS as readonly string[]).includes(name);
}

export function createPartMaterials(set: MaterialSet): PartMaterials {
  const entries = MATERIAL_PARTS.map((part) => {
    const material = new MeshPhysicalMaterial({ name: part });
    applyMaterialSpec(material, set[part] ?? DEFAULT_PART_MATERIALS[part]);
    return [part, material] as const;
  });
  return Object.fromEntries(entries) as PartMaterials;
}

/** Applique une variante sur des matériaux existants, sans recharger le modèle. */
export function applyMaterialSet(materials: PartMaterials, set: MaterialSet): void {
  for (const part of MATERIAL_PARTS) applyMaterialSpec(materials[part], set[part] ?? DEFAULT_PART_MATERIALS[part]);
}

export function disposePartMaterials(materials: PartMaterials): void {
  for (const part of MATERIAL_PARTS) materials[part].dispose();
}

function applyMaterialSpec(material: MeshPhysicalMaterial, spec: MaterialSpec): void {
  const opacity = spec.opacity ?? 1;
  const transmission = spec.transmission ?? 0;
  // Changer la transparence ou la transmission impose de recompiler le shader
  const programChanged = material.transparent !== opacity < 1 || material.transmission > 0 !== transmission > 0;

  material.color.set(spec.color);
  material.roughness = spec.roughness ?? 0.7;
  material.metalness = spec.metalness ?? 0;
  material.sheen = spec.sheen ?? 0;
  material.sheenColor.set(spec.sheenColor ?? '#ffffff');
  material.sheenRoughness = spec.sheenRoughness ?? 1;
  material.clearcoat = spec.clearcoat ?? 0;
  material.clearcoatRoughness = spec.clearcoatRoughness ?? 0;
  material.transmission = transmission;
  material.opacity = opacity;
  material.transparent = opacity < 1;
  material.emissive.set(spec.emissive ?? '#000000');
  material.emissiveIntensity = spec.emissiveIntensity ?? 1;
  if (programChanged) material.needsUpdate = true;
}

/**
 * Prépare un .glb cloné : ombres, et remplacement des matériaux nommés d'après une
 * partie (fabric, wood…) par les matériaux pilotés par la variante.
 */
export function bindGltfMaterials(root: Object3D, materials: PartMaterials): void {
  root.traverse((object) => {
    if (!(object instanceof Mesh)) return;
    object.castShadow = true;
    object.receiveShadow = true;
    const name = Array.isArray(object.material) ? '' : object.material.name;
    if (isMaterialPart(name)) object.material = materials[name];
  });
}
