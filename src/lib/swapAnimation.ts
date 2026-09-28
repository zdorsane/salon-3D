import gsap from 'gsap';
import type { Object3D } from 'three';
import { SWAP_ANIMATION } from '@/config/animation';

/** Apparition avec léger rebond. */
export function animateIn(object: Object3D, onComplete: () => void): gsap.core.Tween {
  const { minScale, inDuration, inEase } = SWAP_ANIMATION;
  return gsap.fromTo(
    object.scale,
    { x: minScale, y: minScale, z: minScale },
    { x: 1, y: 1, z: 1, duration: inDuration, ease: inEase, onComplete },
  );
}

/** Disparition par réduction d'échelle. */
export function animateOut(object: Object3D, onComplete: () => void): gsap.core.Tween {
  const { minScale, outDuration, outEase } = SWAP_ANIMATION;
  return gsap.to(object.scale, { x: minScale, y: minScale, z: minScale, duration: outDuration, ease: outEase, onComplete });
}
