import { useEffect, useLayoutEffect, useState } from 'react';
import type { MaterialSet } from '@/types/catalog';
import { applyMaterialSet, createPartMaterials, disposePartMaterials, type PartMaterials } from './materials';

/** Matériaux d'un modèle, créés une fois puis mis à jour à chaque changement de variante. */
export function usePartMaterials(set: MaterialSet): PartMaterials {
  const [materials] = useState(() => createPartMaterials(set));

  useLayoutEffect(() => applyMaterialSet(materials, set), [materials, set]);
  useEffect(() => () => disposePartMaterials(materials), [materials]);

  return materials;
}
