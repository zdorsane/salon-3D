import { useLayoutEffect, useRef } from 'react';
import type { DirectionalLight } from 'three';
import { SHADOWS, type DirectionalSpec } from '@/config/lighting';
import { useIsMobile } from '@/lib/useIsMobile';

interface SunLightProps {
  spec: DirectionalSpec;
}

/** Lumière directionnelle entrant par la baie (soleil le jour, lune la nuit). */
export function SunLight({ spec }: SunLightProps) {
  const ref = useRef<DirectionalLight>(null);
  const isMobile = useIsMobile();
  const mapSize = isMobile ? SHADOWS.mapSize.mobile : SHADOWS.mapSize.desktop;

  // La cible doit avoir sa matrice à jour pour orienter la lumière et ses ombres
  useLayoutEffect(() => {
    const light = ref.current;
    if (!light) return;
    light.target.position.set(...spec.target);
    light.target.updateMatrixWorld();
  }, [spec, mapSize]);

  return (
    <directionalLight
      key={mapSize}
      ref={ref}
      position={spec.position}
      color={spec.color}
      intensity={spec.intensity}
      castShadow={spec.castShadow}
      shadow-mapSize={[mapSize, mapSize]}
      shadow-bias={SHADOWS.bias}
      shadow-normalBias={SHADOWS.normalBias}
      shadow-radius={SHADOWS.radius}
      shadow-camera-left={-SHADOWS.extent}
      shadow-camera-right={SHADOWS.extent}
      shadow-camera-top={SHADOWS.extent}
      shadow-camera-bottom={-SHADOWS.extent}
      shadow-camera-near={SHADOWS.near}
      shadow-camera-far={SHADOWS.far}
    />
  );
}
