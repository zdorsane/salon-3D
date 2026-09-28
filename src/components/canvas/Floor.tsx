import { useThree } from '@react-three/fiber';
import { useEffect, useMemo } from 'react';
import { FLOOR, ROOM } from '@/config/room';
import { CAMERA_COLLIDER } from '@/lib/camera';
import { createPlankTexture } from '@/lib/textures/plankTexture';
import { useIsMobile } from '@/lib/useIsMobile';

/** Parquet chêne à lames orientées vers la baie vitrée. */
export function Floor() {
  const isMobile = useIsMobile();
  const maxAnisotropy = useThree((state) => state.gl.capabilities.getMaxAnisotropy());

  const texture = useMemo(() => {
    const size = isMobile ? FLOOR.textureSize.mobile : FLOOR.textureSize.desktop;
    const { texture: map, tileSize } = createPlankTexture(FLOOR, size);
    map.repeat.set(ROOM.width / tileSize[0], ROOM.depth / tileSize[1]);
    map.anisotropy = maxAnisotropy;
    return map;
  }, [isMobile, maxAnisotropy]);

  useEffect(() => () => texture.dispose(), [texture]);

  return (
    <mesh rotation-x={-Math.PI / 2} receiveShadow userData={CAMERA_COLLIDER}>
      <planeGeometry args={[ROOM.width, ROOM.depth]} />
      <meshStandardMaterial map={texture} roughness={FLOOR.roughness} />
    </mesh>
  );
}
