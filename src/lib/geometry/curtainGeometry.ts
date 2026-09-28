import { PlaneGeometry } from 'three';

/** Panneau de rideau ondulé : plis sinusoïdaux le long de la largeur. */
export function createCurtainGeometry(
  width: number,
  height: number,
  folds: number,
  amplitude: number,
): PlaneGeometry {
  const segments = Math.max(8, Math.round(folds * 8));
  const geometry = new PlaneGeometry(width, height, segments, 1);
  const position = geometry.attributes.position;
  if (!position) return geometry;

  for (let i = 0; i < position.count; i++) {
    const u = position.getX(i) / width + 0.5;
    position.setZ(i, amplitude * Math.sin(u * folds * Math.PI * 2));
  }
  position.needsUpdate = true;
  geometry.computeVertexNormals();
  return geometry;
}
