import { useGLTF } from '@react-three/drei';
import { useLayoutEffect, useMemo } from 'react';
import { effectiveDimensions, resolveMaterials } from '@/lib/catalog';
import { bindGltfMaterials, type PartMaterials } from '@/lib/materials';
import { dimensionsToMeters } from '@/lib/units';
import { usePartMaterials } from '@/lib/usePartMaterials';
import type { Product, Variant } from '@/types/catalog';
import type { Vec3 } from '@/types/geometry';
import { PlaceholderModel } from './placeholders/PlaceholderModel';

interface ProductModelProps {
  product: Product;
  variant: Variant;
}

/**
 * Modèle 3D d'un produit dans sa variante : .glb s'il existe, sinon forme provisoire.
 * Changer de variante met à jour les matériaux existants, sans recharger le modèle.
 */
export function ProductModel({ product, variant }: ProductModelProps) {
  const materialSet = useMemo(() => resolveMaterials(product, variant), [product, variant]);
  const materials = usePartMaterials(materialSet);
  const size = useMemo(() => dimensionsToMeters(effectiveDimensions(product, variant)), [product, variant]);

  if (product.modelUrl) {
    // Une option de taille étire le modèle à ses nouvelles dimensions
    const base = dimensionsToMeters(product.dimensions);
    const scale: Vec3 = [size.width / base.width, size.height / base.height, size.depth / base.depth];
    return <GltfModel url={product.modelUrl} materials={materials} scale={scale} />;
  }

  return (
    <PlaceholderModel
      category={product.category}
      size={size}
      materials={materials}
      {...(product.placeholder ? { shape: product.placeholder } : {})}
    />
  );
}

interface GltfModelProps {
  url: string;
  materials: PartMaterials;
  scale: Vec3;
}

/** .glb (Draco / meshopt) mis en cache par useGLTF, cloné pour chaque emplacement. */
function GltfModel({ url, materials, scale }: GltfModelProps) {
  const { scene } = useGLTF(url, true, true);
  const root = useMemo(() => scene.clone(true), [scene]);

  useLayoutEffect(() => bindGltfMaterials(root, materials), [root, materials]);

  return <primitive object={root} scale={scale} />;
}
