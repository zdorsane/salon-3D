import type { RoomSpec } from '@/config/room';
import type { Box } from '@/types/geometry';

/**
 * Murs de la pièce, posés à l'extérieur du volume intérieur.
 * Le mur du fond est découpé en 4 morceaux autour de la baie vitrée.
 */
export function computeWallBoxes(room: RoomSpec): Box[] {
  const { width, depth, height, wallThickness: t, bayWindow: w } = room;
  const hw = width / 2;
  const hd = depth / 2;
  const zBack = -hd - t / 2;
  const windowWidth = w.xMax - w.xMin;
  const windowCenter = (w.xMin + w.xMax) / 2;
  const leftWidth = w.xMin + hw + t;
  const rightWidth = hw + t - w.xMax;

  return [
    { position: [-hw - t / 2, height / 2, 0], size: [t, height, depth] },
    { position: [hw + t / 2, height / 2, 0], size: [t, height, depth] },
    { position: [0, height / 2, hd + t / 2], size: [width + 2 * t, height, t] },
    { position: [-hw - t + leftWidth / 2, height / 2, zBack], size: [leftWidth, height, t] },
    { position: [w.xMax + rightWidth / 2, height / 2, zBack], size: [rightWidth, height, t] },
    { position: [windowCenter, (w.yMax + height) / 2, zBack], size: [windowWidth, height - w.yMax, t] },
    { position: [windowCenter, w.yMin / 2, zBack], size: [windowWidth, w.yMin, t] },
  ];
}

interface PerimeterRunSpec {
  /** Hauteur du centre de la moulure */
  y: number;
  height: number;
  depth: number;
  /** Interruption sur le mur du fond (baie vitrée) */
  backGap?: { xMin: number; xMax: number };
}

/** Moulures (plinthes, corniche) plaquées contre l'intérieur des quatre murs. */
export function computePerimeterRuns(room: RoomSpec, spec: PerimeterRunSpec): Box[] {
  const hw = room.width / 2;
  const hd = room.depth / 2;
  const { y, height: h, depth: d, backGap } = spec;
  const zBack = -hd + d / 2;

  const runs: Box[] = [
    { position: [-hw + d / 2, y, 0], size: [d, h, room.depth] },
    { position: [hw - d / 2, y, 0], size: [d, h, room.depth] },
    { position: [0, y, hd - d / 2], size: [room.width, h, d] },
  ];

  const backSegments: [number, number][] = backGap
    ? [
        [-hw, backGap.xMin],
        [backGap.xMax, hw],
      ]
    : [[-hw, hw]];

  for (const [start, end] of backSegments) {
    if (end - start <= 0) continue;
    runs.push({ position: [(start + end) / 2, y, zBack], size: [end - start, h, d] });
  }
  return runs;
}

/** Terrasse devant la baie : dalle, garde-corps vitré, main courante et poteaux. */
export function computeTerrace(room: RoomSpec): { slab: Box; glass: Box; rail: Box; posts: Box[] } {
  const { terrace: tr, depth, wallThickness, bayWindow: w } = room;
  const cx = (w.xMin + w.xMax) / 2;
  const zStart = -depth / 2 - wallThickness;
  const zEdge = zStart - tr.depth + 0.05;
  const h = tr.balustradeHeight;
  const postCount = Math.floor(tr.width / tr.postSpacing) + 1;
  const firstPost = cx - ((postCount - 1) * tr.postSpacing) / 2;

  return {
    slab: { position: [cx, tr.level - tr.thickness / 2, zStart - tr.depth / 2], size: [tr.width, tr.thickness, tr.depth] },
    glass: { position: [cx, tr.level + h / 2, zEdge], size: [tr.width, h - 0.04, 0.012] },
    rail: { position: [cx, tr.level + h, zEdge], size: [tr.width, 0.04, 0.05] },
    posts: Array.from({ length: postCount }, (_, i) => ({
      position: [firstPost + i * tr.postSpacing, tr.level + h / 2, zEdge],
      size: [0.04, h, 0.04],
    })),
  };
}

/** Menuiserie de la baie : montants, traverses, meneaux et vitrage. */
export function computeWindowFrame(room: RoomSpec): { bars: Box[]; glass: Box } {
  const { bayWindow: w, depth, wallThickness } = room;
  const z = -depth / 2 - wallThickness / 2;
  const { frameWidth: fw, frameDepth: fd } = w;
  const width = w.xMax - w.xMin;
  const height = w.yMax - w.yMin;
  const cx = (w.xMin + w.xMax) / 2;
  const cy = (w.yMin + w.yMax) / 2;

  const bars: Box[] = [
    { position: [w.xMin + fw / 2, cy, z], size: [fw, height, fd] },
    { position: [w.xMax - fw / 2, cy, z], size: [fw, height, fd] },
    { position: [cx, w.yMax - fw / 2, z], size: [width, fw, fd] },
    { position: [cx, w.yMin + fw / 2, z], size: [width, fw, fd] },
  ];
  for (let i = 1; i < w.panels; i++) {
    bars.push({ position: [w.xMin + (width * i) / w.panels, cy, z], size: [fw, height - 2 * fw, fd] });
  }

  return { bars, glass: { position: [cx, cy, z], size: [width - 2 * fw, height - 2 * fw, 0.01] } };
}
