import { useMemo } from 'react';
import { ROOM, ROOM_MATERIALS } from '@/config/room';
import { computeTerrace } from '@/lib/geometry/roomGeometry';
import { BoxMesh } from './BoxMesh';
import { Panorama } from './Panorama';

/** Extérieur visible par la baie : terrasse en pierre, garde-corps vitré et panorama. */
export function Outdoor() {
  const terrace = useMemo(() => computeTerrace(ROOM), []);
  const { glass } = ROOM_MATERIALS;

  return (
    <group>
      <BoxMesh box={terrace.slab} receiveShadow>
        <meshStandardMaterial {...ROOM_MATERIALS.terraceStone} />
      </BoxMesh>

      <BoxMesh box={terrace.glass}>
        <meshPhysicalMaterial
          color={glass.color}
          roughness={glass.roughness}
          transparent
          opacity={glass.opacity * 2}
          depthWrite={false}
        />
      </BoxMesh>

      {[terrace.rail, ...terrace.posts].map((box) => (
        <BoxMesh key={box.position.join(':')} box={box} castShadow>
          <meshStandardMaterial {...ROOM_MATERIALS.aluminium} />
        </BoxMesh>
      ))}

      <Panorama />
    </group>
  );
}
