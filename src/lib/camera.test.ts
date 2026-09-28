import { describe, expect, it } from 'vitest';
import { ROOM } from '@/config/room';
import { CAMERA_LIMITS, VIEWPOINT_IDS, VIEWPOINTS } from '@/config/viewpoints';
import { cameraBounds, focusViewpoint, isInsideBounds, panelViewOffset } from './camera';

const bounds = cameraBounds(ROOM, CAMERA_LIMITS);

describe('cameraBounds', () => {
  it('reste à distance des murs, du sol et du plafond', () => {
    expect(bounds.min).toEqual([-2.7, CAMERA_LIMITS.floorMargin, -2.2]);
    expect(bounds.max[1]).toBeCloseTo(ROOM.height - CAMERA_LIMITS.ceilingMargin);
  });

  it('détecte un point hors de la pièce', () => {
    expect(isInsideBounds([0, 1.5, 0], bounds)).toBe(true);
    expect(isInsideBounds([0, 1.5, -2.6], bounds)).toBe(false);
    expect(isInsideBounds([0, 3, 0], bounds)).toBe(false);
  });
});

describe('points de vue', () => {
  it.each(VIEWPOINT_IDS)('« %s » place la caméra dans la pièce', (id) => {
    const { position, target } = VIEWPOINTS[id];
    expect(isInsideBounds(position, bounds)).toBe(true);
    const distance = Math.hypot(...position.map((value, axis) => value - (target[axis] ?? 0)));
    expect(distance).toBeGreaterThanOrEqual(CAMERA_LIMITS.minDistance);
    expect(distance).toBeLessThanOrEqual(CAMERA_LIMITS.maxDistance);
  });
});

describe('focusViewpoint', () => {
  const bounds = cameraBounds(ROOM, CAMERA_LIMITS);
  const size = { width: 1, depth: 0.8, height: 0.8 };

  it('place la caméra devant la face avant du meuble, dans la pièce', () => {
    const { position, target } = focusViewpoint([0, 0.4, -1], 0, size, bounds);
    expect(target).toEqual([0, 0.4, -1]);
    expect(position[2]).toBeGreaterThan(-1);
    expect(isInsideBounds(position, bounds)).toBe(true);
  });

  it('recule davantage sur écran étroit', () => {
    const near = focusViewpoint([0, 0.4, -1], 0, size, bounds);
    const far = focusViewpoint([0, 0.4, -1], 0, size, bounds, 1.4);
    expect(far.position[2]).toBeGreaterThan(near.position[2]);
  });
});

describe('panelViewOffset', () => {
  const panel = { desktopWidth: 400, mobileHeightRatio: 0.5 };

  it('décale vers la gauche sur ordinateur, vers le haut sur mobile', () => {
    expect(panelViewOffset(1280, 800, false, panel)).toEqual([200, 0]);
    expect(panelViewOffset(390, 844, true, panel)).toEqual([0, 211]);
  });

  it('ne décale jamais de plus d’un quart de l’écran', () => {
    expect(panelViewOffset(600, 800, false, panel)).toEqual([150, 0]);
  });
});
