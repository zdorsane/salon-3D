/** Réglages de rendu selon l'appareil. */
export const RENDER = {
  /** Écran étroit ou tactile : qualité allégée, FOV plus large */
  mobileQuery: '(max-width: 767px), (pointer: coarse)',
  dpr: {
    desktop: [1, 2] as [number, number],
    mobile: [1, 1.5] as [number, number],
  },
  camera: { near: 0.05, far: 150, fov: { desktop: 50, mobile: 62 } },
  environmentResolution: { desktop: 256, mobile: 128 },
  /** Largeur de la texture du panorama extérieur (format 4:1) */
  panoramaWidth: { desktop: 4096, mobile: 2048 },
};

/** Post-traitement (ordinateur uniquement). */
export const EFFECTS = {
  ao: { aoRadius: 0.6, distanceFalloff: 1, intensity: 1.4, quality: 'medium' as const },
  bloomNight: { intensity: 0.6, luminanceThreshold: 0.9, luminanceSmoothing: 0.2 },
  /** Contour du meuble survolé / sélectionné */
  outline: { edgeStrength: 4, blur: true, xRay: false },
};

/** Éclairage de l'aperçu 3D de la fiche produit. */
export const VIEWER_LIGHTS = { sky: '#fff4e6', ground: '#3a3029', hemisphere: 1.6, key: 2.2 };
