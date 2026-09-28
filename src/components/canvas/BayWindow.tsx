import { useMemo } from 'react';
import { ROOM, ROOM_MATERIALS } from '@/config/room';
import { CAMERA_COLLIDER } from '@/lib/camera';
import { computeWindowFrame } from '@/lib/geometry/roomGeometry';
import { BoxMesh } from './BoxMesh';
import { Curtains } from './Curtains';
import { Outdoor } from './Outdoor';

/** Baie vitrée du mur du fond : menuiserie alu noir, vitrage, rideaux et vue extérieure. */
export function BayWindow() {
  const frame = useMemo(() => computeWindowFrame(ROOM), []);
  const { glass } = ROOM_MATERIALS;

  return (
    <group>
      {frame.bars.map((bar, index) => (
        <BoxMesh key={index} box={bar} castShadow>
          <meshStandardMaterial {...ROOM_MATERIALS.aluminium} />
        </BoxMesh>
      ))}

      {/* Vitrage : ne projette pas d'ombre mais bloque la caméra */}
      <mesh position={frame.glass.position} userData={CAMERA_COLLIDER}>
        <planeGeometry args={[frame.glass.size[0], frame.glass.size[1]]} />
        <meshPhysicalMaterial
          color={glass.color}
          roughness={glass.roughness}
          metalness={0}
          transparent
          opacity={glass.opacity}
          depthWrite={false}
        />
      </mesh>

      <Curtains />
      <Outdoor />
    </group>
  );
}
