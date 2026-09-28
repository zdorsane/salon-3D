import type { Vec3 } from '@/types/geometry';

export type TimeOfDay = 'day' | 'night';

/** Blanc chaud 2700 K des luminaires. */
export const WARM_WHITE_2700K = '#ffb46b';

export interface DirectionalSpec {
  position: Vec3;
  target: Vec3;
  color: string;
  intensity: number;
  castShadow: boolean;
}

interface LightformerSpec {
  position: Vec3;
  rotation: Vec3;
  scale: Vec3;
  color: string;
  intensity: number;
}

interface AmbianceSpec {
  /** Couleur de fond (visible sous le panorama) */
  background: string;
  hemisphere: { sky: string; ground: string; intensity: number };
  /** Soleil le jour, lune la nuit */
  directional: DirectionalSpec;
  environmentIntensity: number;
  /** Panneaux lumineux de l'IBL (côté baie + plafond) */
  lightformers: LightformerSpec[];
  /** Intensité émissive des spots encastrés (0 = éteints) */
  fixtureEmissive: number;
}

export const LIGHTING: Record<TimeOfDay, AmbianceSpec> = {
  day: {
    background: '#9ec3de',
    hemisphere: { sky: '#dce8f2', ground: '#e6d8c4', intensity: 0.9 },
    directional: {
      position: [3.5, 6.5, -9],
      target: [0.4, 0, 0.6],
      color: '#fff1dc',
      intensity: 3.4,
      castShadow: true,
    },
    environmentIntensity: 1.5,
    lightformers: [
      { position: [1, 1.3, -3.2], rotation: [0, 0, 0], scale: [3.4, 2.4, 1], color: '#eaf2ff', intensity: 4 },
      { position: [0, 2.9, 0], rotation: [Math.PI / 2, 0, 0], scale: [4, 3, 1], color: '#ffffff', intensity: 1.5 },
    ],
    fixtureEmissive: 0,
  },
  night: {
    background: '#070b16',
    hemisphere: { sky: '#1c2744', ground: '#2a1e14', intensity: 0.08 },
    directional: {
      position: [-4, 7, -10],
      target: [0.5, 0, 0],
      color: '#8ea4d6',
      intensity: 0.25,
      castShadow: false,
    },
    environmentIntensity: 0.15,
    lightformers: [
      { position: [0, 2.9, 0], rotation: [Math.PI / 2, 0, 0], scale: [4, 3, 1], color: WARM_WHITE_2700K, intensity: 0.6 },
    ],
    fixtureEmissive: 6,
  },
};

/** Spots encastrés au plafond (positions x, z) : allumés la nuit. */
export const RECESSED_SPOTS = {
  positions: [
    [-1.9, -1.3],
    [-1.9, 1.2],
    [0.6, -1.3],
    [0.6, 1.2],
    [2.1, -0.3],
  ] satisfies [number, number][],
  color: WARM_WHITE_2700K,
  intensity: 10,
  angle: 0.95,
  penumbra: 0.85,
  distance: 6,
  decay: 2,
  fixtureRadius: 0.045,
  fixtureColor: '#f4f1ea',
};

/** Réglages des ombres du soleil. */
export const SHADOWS = {
  mapSize: { desktop: 2048, mobile: 1024 },
  bias: -0.0003,
  normalBias: 0.025,
  radius: 4,
  /** Demi-largeur du volume d'ombre (m) */
  extent: 5.5,
  near: 1,
  far: 30,
};
