import { CameraControls, type CameraControlsImpl } from '@react-three/drei';
import { useThree } from '@react-three/fiber';
import { useEffect, useRef } from 'react';
import { Box3, Vector3, type Object3D } from 'three';
import { RENDER } from '@/config/render';
import { ROOM } from '@/config/room';
import { CAMERA_LIMITS, DEFAULT_VIEWPOINT, VIEWPOINTS } from '@/config/viewpoints';
import { cameraBounds, flyTo, isCameraCollider, setCameraFov } from '@/lib/camera';
import { useIsMobile } from '@/lib/useIsMobile';
import { useUIStore } from '@/store/useUIStore';

/** Caméra orbitale bornée à la pièce, avec transitions gsap entre points de vue. */
export function CameraRig() {
  const controlsRef = useRef<CameraControlsImpl>(null);
  const tweenRef = useRef<gsap.core.Tween | null>(null);
  const scene = useThree((state) => state.scene);
  const isMobile = useIsMobile();
  const cameraRequest = useUIStore((state) => state.cameraRequest);
  const clearViewpoint = useUIStore((state) => state.clearViewpoint);

  // Murs, sol, plafond et vitrage bloquent la caméra ; la cible reste dans la pièce
  useEffect(() => {
    const controls = controlsRef.current;
    if (!controls) return;
    const colliders: Object3D[] = [];
    scene.traverse((object) => {
      if (isCameraCollider(object)) colliders.push(object);
    });
    controls.colliderMeshes = colliders;
    const { min, max } = cameraBounds(ROOM, CAMERA_LIMITS);
    controls.setBoundary(new Box3(new Vector3(...min), new Vector3(...max)));
    const { position, target } = VIEWPOINTS[DEFAULT_VIEWPOINT];
    void controls.setLookAt(...position, ...target, false);
  }, [scene]);

  // FOV plus large sur mobile (le Canvas ne lit sa config caméra qu'au montage)
  useEffect(() => {
    const camera = controlsRef.current?.camera;
    if (camera) setCameraFov(camera, isMobile ? RENDER.camera.fov.mobile : RENDER.camera.fov.desktop);
  }, [isMobile]);

  // Vol vers le point de vue demandé (bouton de la barre ou meuble sélectionné)
  useEffect(() => {
    const controls = controlsRef.current;
    if (!controls || !cameraRequest) return;
    tweenRef.current?.kill();
    tweenRef.current = flyTo(controls, cameraRequest.viewpoint, CAMERA_LIMITS.transition);
  }, [cameraRequest]);

  useEffect(() => () => void tweenRef.current?.kill(), []);

  // Toute interaction manuelle interrompt la transition et désactive le point de vue actif
  const handleStart = () => {
    tweenRef.current?.kill();
    clearViewpoint();
  };

  return (
    <CameraControls
      ref={controlsRef}
      makeDefault
      minDistance={CAMERA_LIMITS.minDistance}
      maxDistance={CAMERA_LIMITS.maxDistance}
      smoothTime={CAMERA_LIMITS.smoothTime}
      dollyToCursor
      onStart={handleStart}
    />
  );
}
