/** Animations de la scène (secondes, courbes gsap). */
export const SWAP_ANIMATION = {
  outDuration: 0.25,
  outEase: 'power2.in',
  inDuration: 0.6,
  inEase: 'back.out(1.7)',
  /** Échelle de départ / d'arrivée (0 exact casse les matrices) */
  minScale: 0.001,
};

/** Seuil (px) au-delà duquel un clic est en fait un glissé de caméra. */
export const CLICK_TOLERANCE_PX = 6;

/** Vitesse de rotation de l'indicateur de chargement (rad/s). */
export const SPINNER_SPEED = 4;
