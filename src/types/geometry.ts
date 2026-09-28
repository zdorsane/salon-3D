/** Vecteur 3D en mètres [x, y, z] (mutable pour être accepté tel quel par three / R3F). */
export type Vec3 = [number, number, number];

/** Boîte alignée sur les axes : centre et dimensions complètes. */
export interface Box {
  position: Vec3;
  size: Vec3;
}
