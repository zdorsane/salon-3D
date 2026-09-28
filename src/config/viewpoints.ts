import type { Vec3 } from '@/types/geometry';

export const VIEWPOINT_IDS = ['overview', 'sofa', 'tv', 'bayWindow', 'reading'] as const;

export type ViewpointId = (typeof VIEWPOINT_IDS)[number];

export interface Viewpoint {
  position: Vec3;
  target: Vec3;
}

/** Points de vue prédéfinis (libellés : i18n `viewpoints.<id>`). */
export const VIEWPOINTS: Record<ViewpointId, Viewpoint> = {
  overview: { position: [-2.6, 2.1, 2.2], target: [0.6, 0.6, -0.5] },
  sofa: { position: [-0.8, 1.3, 0.9], target: [2.2, 0.5, -0.3] },
  tv: { position: [1.8, 1.2, 0.2], target: [-2.7, 0.8, -0.35] },
  bayWindow: { position: [0.3, 1.5, 2.1], target: [1, 1.2, -2.5] },
  reading: { position: [0.2, 1.4, -0.6], target: [-2, 0.7, 1.7] },
};

export const DEFAULT_VIEWPOINT: ViewpointId = 'overview';

/** Limites et comportement de la caméra. */
export const CAMERA_LIMITS = {
  /** Marge minimale entre la caméra et les murs / sol / plafond (m) */
  wallMargin: 0.3,
  floorMargin: 0.35,
  ceilingMargin: 0.25,
  minDistance: 0.4,
  maxDistance: 6.5,
  /** Lissage des mouvements manuels (s) */
  smoothTime: 0.25,
  transition: { duration: 1.6, ease: 'power2.inOut' },
};

export type CameraLimits = typeof CAMERA_LIMITS;

/** Recul de la caméra sur un meuble sélectionné (écran étroit = plus loin). */
export const FOCUS_DISTANCE_SCALE = { desktop: 1, mobile: 1.4 };

/** Place occupée par le panneau produit, pour recentrer la vue 3D dans la zone libre. */
export interface PanelLayout {
  /** Largeur du panneau latéral sur ordinateur (px) */
  desktopWidth: number;
  /** Hauteur du tiroir sur mobile, en fraction de l'écran */
  mobileHeightRatio: number;
}

export const PRODUCT_PANEL: PanelLayout = { desktopWidth: 412, mobileHeightRatio: 0.55 };
