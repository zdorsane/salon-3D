import { useEffect, useMemo } from 'react';
import { DoubleSide } from 'three';
import { ROOM, ROOM_MATERIALS } from '@/config/room';
import { createCurtainGeometry } from '@/lib/geometry/curtainGeometry';

const { curtains } = ROOM;
const CURTAIN_HEIGHT = curtains.rodHeight - 0.02;
const CURTAIN_Z = -ROOM.depth / 2 + curtains.wallOffset;

/** Rideaux en lin ouverts de part et d'autre de la baie, sur une tringle noire. */
export function Curtains() {
  const geometries = useMemo(
    () =>
      curtains.panels.map((panel) =>
        createCurtainGeometry(panel.width, CURTAIN_HEIGHT, panel.width * curtains.foldsPerMeter, curtains.amplitude),
      ),
    [],
  );

  useEffect(() => () => geometries.forEach((geometry) => geometry.dispose()), [geometries]);

  return (
    <group>
      {curtains.panels.map((panel, index) => (
        <mesh
          key={panel.xCenter}
          geometry={geometries[index]}
          position={[panel.xCenter, CURTAIN_HEIGHT / 2 + 0.01, CURTAIN_Z]}
          castShadow
          receiveShadow
        >
          <meshPhysicalMaterial {...ROOM_MATERIALS.linen} side={DoubleSide} />
        </mesh>
      ))}

      <mesh
        position={[(curtains.rodStart + curtains.rodEnd) / 2, curtains.rodHeight, CURTAIN_Z]}
        rotation-z={Math.PI / 2}
      >
        <cylinderGeometry args={[curtains.rodRadius, curtains.rodRadius, curtains.rodEnd - curtains.rodStart, 12]} />
        <meshStandardMaterial {...ROOM_MATERIALS.aluminium} />
      </mesh>
    </group>
  );
}
