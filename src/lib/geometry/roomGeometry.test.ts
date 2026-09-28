import { describe, expect, it } from 'vitest';
import { ROOM } from '@/config/room';
import type { Box } from '@/types/geometry';
import { computePerimeterRuns, computeTerrace, computeWallBoxes, computeWindowFrame } from './roomGeometry';

const volume = ({ size }: Box) => size[0] * size[1] * size[2];
const minX = ({ position, size }: Box) => position[0] - size[0] / 2;
const maxX = ({ position, size }: Box) => position[0] + size[0] / 2;

describe('computeWallBoxes', () => {
  const walls = computeWallBoxes(ROOM);
  const { width, depth, height, wallThickness: t, bayWindow: w } = ROOM;

  it('le mur du fond laisse exactement la place de la baie', () => {
    const back = walls.filter((box) => box.position[2] < -depth / 2);
    const backVolume = back.reduce((sum, box) => sum + volume(box), 0);
    const opening = (w.xMax - w.xMin) * (w.yMax - w.yMin) * t;
    expect(backVolume).toBeCloseTo((width + 2 * t) * height * t - opening, 6);
  });

  it('aucun mur ne déborde dans le volume intérieur', () => {
    for (const box of walls) {
      const [x, , z] = box.position;
      const [sx, , sz] = box.size;
      const outsideX = Math.abs(x) - sx / 2 >= width / 2 - 1e-9;
      const outsideZ = Math.abs(z) - sz / 2 >= depth / 2 - 1e-9;
      expect(outsideX || outsideZ).toBe(true);
    }
  });
});

describe('computePerimeterRuns', () => {
  it('les plinthes s’interrompent au droit de la baie', () => {
    const runs = computePerimeterRuns(ROOM, {
      y: 0.05,
      height: 0.1,
      depth: 0.015,
      backGap: { xMin: ROOM.bayWindow.xMin, xMax: ROOM.bayWindow.xMax },
    });
    const back = runs.filter((box) => box.position[2] < 0 && box.size[0] > box.size[2]);
    expect(back).toHaveLength(2);
    for (const box of back) {
      const overlaps = maxX(box) > ROOM.bayWindow.xMin + 1e-9 && minX(box) < ROOM.bayWindow.xMax - 1e-9;
      expect(overlaps).toBe(false);
    }
  });

  it('sans interruption, le mur du fond a une seule moulure', () => {
    const runs = computePerimeterRuns(ROOM, { y: 2.7, height: 0.07, depth: 0.05 });
    expect(runs).toHaveLength(4);
  });
});

describe('computeWindowFrame', () => {
  it('le vitrage reste à l’intérieur de la menuiserie', () => {
    const { glass, bars } = computeWindowFrame(ROOM);
    expect(minX(glass)).toBeGreaterThanOrEqual(ROOM.bayWindow.xMin);
    expect(maxX(glass)).toBeLessThanOrEqual(ROOM.bayWindow.xMax);
    expect(bars).toHaveLength(4 + ROOM.bayWindow.panels - 1);
  });
});

describe('computeTerrace', () => {
  it('la terrasse est dehors, derrière le mur du fond', () => {
    const { slab, posts } = computeTerrace(ROOM);
    expect(slab.position[2] + slab.size[2] / 2).toBeLessThanOrEqual(-ROOM.depth / 2 - ROOM.wallThickness + 1e-9);
    expect(posts.length).toBeGreaterThan(1);
  });
});
