import { useEffect, useMemo } from 'react';
import { BackSide } from 'three';
import { RENDER } from '@/config/render';
import { PANORAMA_PALETTES, ROOM } from '@/config/room';
import { createPanoramaTexture } from '@/lib/textures/panoramaTexture';
import { useIsMobile } from '@/lib/useIsMobile';
import { useUIStore } from '@/store/useUIStore';

const { panorama } = ROOM;
const HEIGHT = panorama.top - panorama.bottom;
/** Position de l'horizon depuis le haut du cylindre (0–1) */
const HORIZON = (panorama.top - panorama.horizonY) / HEIGHT;

/** Paysage méditerranéen (jour / nuit) sur un demi-cylindre derrière la terrasse. */
export function Panorama() {
  const timeOfDay = useUIStore((state) => state.timeOfDay);
  const isMobile = useIsMobile();

  const texture = useMemo(() => {
    const width = isMobile ? RENDER.panoramaWidth.mobile : RENDER.panoramaWidth.desktop;
    return createPanoramaTexture(PANORAMA_PALETTES[timeOfDay], HORIZON, width);
  }, [timeOfDay, isMobile]);

  useEffect(() => () => texture.dispose(), [texture]);

  return (
    <mesh position={[0, (panorama.top + panorama.bottom) / 2, 0]}>
      <cylinderGeometry
        args={[panorama.radius, panorama.radius, HEIGHT, panorama.segments, 1, true, Math.PI / 2, Math.PI]}
      />
      <meshBasicMaterial map={texture} side={BackSide} toneMapped={false} fog={false} />
    </mesh>
  );
}
