import type { CameraControlsImpl } from '@react-three/drei';
import gsap from 'gsap';
import { PerspectiveCamera, Vector3, type Camera, type Object3D } from 'three';
import type { RoomSpec } from '@/config/room';
import type { CameraLimits, PanelLayout, Viewpoint } from '@/config/viewpoints';
import type { Vec3 } from '@/types/geometry';
import type { DimensionsM } from './units';

/** Marqueur posé sur les maillages que la caméra ne doit pas traverser. */
export const CAMERA_COLLIDER = { cameraCollider: true } as const;

export function isCameraCollider(object: Object3D): boolean {
  return object.userData.cameraCollider === true;
}

export interface Bounds {
  min: Vec3;
  max: Vec3;
}

/** Volume autorisé pour la caméra : l'intérieur de la pièce moins les marges. */
export function cameraBounds(room: RoomSpec, limits: CameraLimits): Bounds {
  const hw = room.width / 2 - limits.wallMargin;
  const hd = room.depth / 2 - limits.wallMargin;
  return {
    min: [-hw, limits.floorMargin, -hd],
    max: [hw, room.height - limits.ceilingMargin, hd],
  };
}

export function isInsideBounds(point: Vec3, bounds: Bounds): boolean {
  return point.every((value, axis) => value >= (bounds.min[axis] ?? 0) && value <= (bounds.max[axis] ?? 0));
}

function clamp(value: number, min: number, max: number): number {
  return Math.min(max, Math.max(min, value));
}

/**
 * Point de vue centré sur un meuble : caméra devant sa face avant, un peu au-dessus,
 * à une distance proportionnelle à sa taille (multipliée sur écran étroit), ramenée dans la pièce.
 */
export function focusViewpoint(center: Vec3, rotationY: number, size: DimensionsM, bounds: Bounds, distanceScale = 1): Viewpoint {
  const distance = (Math.max(size.width, size.height, 0.8) * 1.3 + 0.9) * distanceScale;
  const position: Vec3 = [
    clamp(center[0] + Math.sin(rotationY) * distance, bounds.min[0], bounds.max[0]),
    clamp(center[1] + 0.6, bounds.min[1], bounds.max[1]),
    clamp(center[2] + Math.cos(rotationY) * distance, bounds.min[2], bounds.max[2]),
  ];
  return { position, target: center };
}

/** Décalage de la projection (px) pour centrer la vue dans la zone laissée libre par un panneau. */
export function panelViewOffset(width: number, height: number, isMobile: boolean, panel: PanelLayout): [number, number] {
  return isMobile ? [0, (height * panel.mobileHeightRatio) / 2] : [Math.min(panel.desktopWidth, width / 2) / 2, 0];
}

/** Change le champ de vision d'une caméra perspective. */
export function setCameraFov(camera: Camera, fov: number): void {
  if (!(camera instanceof PerspectiveCamera) || camera.fov === fov) return;
  camera.fov = fov;
  camera.updateProjectionMatrix();
}

/** Transition gsap de la position et de la cible de la caméra vers un point de vue. */
export function flyTo(
  controls: CameraControlsImpl,
  to: Viewpoint,
  transition: { duration: number; ease: string },
): gsap.core.Tween {
  const fromPosition = controls.getPosition(new Vector3());
  const fromTarget = controls.getTarget(new Vector3());
  const toPosition = new Vector3(...to.position);
  const toTarget = new Vector3(...to.target);
  const position = new Vector3();
  const target = new Vector3();
  const progress = { value: 0 };

  return gsap.to(progress, {
    value: 1,
    duration: transition.duration,
    ease: transition.ease,
    onUpdate: () => {
      position.lerpVectors(fromPosition, toPosition, progress.value);
      target.lerpVectors(fromTarget, toTarget, progress.value);
      void controls.setLookAt(position.x, position.y, position.z, target.x, target.y, target.z, false);
    },
  });
}
