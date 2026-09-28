import type { SlotDefinition } from '@/config/slots';
import type { Vec3 } from '@/types/geometry';
import type { DimensionsM } from './units';

export interface Transform {
  position: Vec3;
  rotationY: number;
}

/**
 * Position et orientation d'un produit dans son slot.
 * Aligné « back », le dos du produit touche le fond de la boîte (le mur).
 * La hauteur de pose (objets muraux) s'ajoute sauf pour les suspensions.
 */
/** Hauteur locale du bas du produit : sous l'ancre pour une suspension, sinon au sol. */
export function localBase(slot: SlotDefinition, size: DimensionsM): number {
  return slot.mount === 'ceiling' ? -size.height : 0;
}

/** Centre du produit dans la pièce (cible de la caméra). */
export function worldCenter(slot: SlotDefinition, transform: Transform, size: DimensionsM): Vec3 {
  const [x, y, z] = transform.position;
  return [x, y + localBase(slot, size) + size.height / 2, z];
}

export function placementTransform(slot: SlotDefinition, size: DimensionsM, elevationM = 0): Transform {
  const localZ = slot.align === 'back' ? -(slot.maxSize.depth - size.depth) / 2 : 0;
  const [x, y, z] = slot.position;
  const lift = slot.mount === 'ceiling' ? 0 : elevationM;
  return {
    position: [x + Math.sin(slot.rotationY) * localZ, y + lift, z + Math.cos(slot.rotationY) * localZ],
    rotationY: slot.rotationY,
  };
}
