import type { TimeOfDay } from './lighting';

/** Géométrie de la pièce en mètres ; origine au centre du sol, mur du fond en z négatif. */
export const ROOM = {
  width: 6,
  depth: 5,
  height: 2.8,
  wallThickness: 0.12,
  baseboard: { height: 0.1, depth: 0.015 },
  cornice: { height: 0.07, depth: 0.05 },
  /** Baie vitrée du mur du fond */
  bayWindow: { xMin: -0.7, xMax: 2.7, yMin: 0.04, yMax: 2.5, panels: 3, frameWidth: 0.055, frameDepth: 0.07 },
  curtains: {
    rodHeight: 2.62,
    rodRadius: 0.012,
    rodStart: -1.12,
    rodEnd: 2.96,
    /** Distance entre le mur et le rideau */
    wallOffset: 0.14,
    foldsPerMeter: 11,
    amplitude: 0.035,
    panels: [
      { xCenter: -0.72, width: 0.7 },
      { xCenter: 2.62, width: 0.62 },
    ],
  },
  terrace: { depth: 3.2, width: 7.5, level: -0.03, thickness: 0.25, balustradeHeight: 1, postSpacing: 1.5 },
  /** Décor extérieur : cylindre ouvert derrière la terrasse */
  panorama: { radius: 45, bottom: -8, top: 20, horizonY: 1.1, segments: 96 },
};

export type RoomSpec = typeof ROOM;

/** Parquet généré procéduralement (remplacé par des textures PBR en phase de finition). */
export const FLOOR = {
  base: '#b08655',
  seam: '#3b2a1c',
  /** Amplitude de variation de luminosité entre lames */
  variation: 0.14,
  roughness: 0.52,
  plankWidth: 0.19,
  plankLength: 1.4,
  /** Nombre de lames dans la largeur d'une tuile de texture */
  columns: 12,
  textureSize: { desktop: 2048, mobile: 1024 },
};

/** Matériaux fixes de la pièce. */
export const ROOM_MATERIALS = {
  wall: { color: '#eee9e0', roughness: 0.92 },
  ceiling: { color: '#f5f2ec', roughness: 0.95 },
  trim: { color: '#f4f1ea', roughness: 0.6 },
  aluminium: { color: '#1c1c1e', roughness: 0.38, metalness: 0.85 },
  glass: { color: '#e4eef2', opacity: 0.12, roughness: 0.03 },
  linen: { color: '#e9e2d5', roughness: 0.95, sheen: 1, sheenRoughness: 0.75, sheenColor: '#ffffff' },
  terraceStone: { color: '#cbbfae', roughness: 0.85 },
};

export interface PanoramaPalette {
  skyTop: string;
  skyHorizon: string;
  seaHorizon: string;
  sea: string;
  hillsFar: string;
  hillsNear: string;
  /** Halo du soleil ou de la lune */
  glow: string;
  glowPosition: [number, number];
  glowRadius: number;
  stars: number;
  /** Lumières de ville sur les collines (0 le jour) */
  cityLights: number;
  cityLightColor: string;
}

export const PANORAMA_PALETTES: Record<TimeOfDay, PanoramaPalette> = {
  day: {
    skyTop: '#6fa7d8',
    skyHorizon: '#e3eef4',
    seaHorizon: '#9cc2d6',
    sea: '#3f7899',
    hillsFar: '#9fb2a4',
    hillsNear: '#6f8663',
    glow: 'rgba(255, 246, 220, 0.9)',
    glowPosition: [0.62, 0.18],
    glowRadius: 0.12,
    stars: 0,
    cityLights: 0,
    cityLightColor: '#ffd9a0',
  },
  night: {
    skyTop: '#03060f',
    skyHorizon: '#1a2644',
    seaHorizon: '#16223b',
    sea: '#070d1a',
    hillsFar: '#111a26',
    hillsNear: '#0a0f14',
    glow: 'rgba(200, 215, 255, 0.55)',
    glowPosition: [0.3, 0.14],
    glowRadius: 0.05,
    stars: 700,
    cityLights: 260,
    cityLightColor: '#ffc978',
  },
};
