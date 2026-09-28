import { useMemo } from 'react';
import { ROOM, ROOM_MATERIALS } from '@/config/room';
import { CAMERA_COLLIDER } from '@/lib/camera';
import { computePerimeterRuns, computeWallBoxes } from '@/lib/geometry/roomGeometry';
import { BoxMesh } from './BoxMesh';
import { Floor } from './Floor';

/** Coque de la pièce : murs, plafond, sol, plinthes et corniche. */
export function Room() {
  const { walls, trims } = useMemo(() => {
    const { height, baseboard, cornice, bayWindow } = ROOM;
    return {
      walls: computeWallBoxes(ROOM),
      trims: [
        ...computePerimeterRuns(ROOM, {
          y: baseboard.height / 2,
          height: baseboard.height,
          depth: baseboard.depth,
          backGap: { xMin: bayWindow.xMin, xMax: bayWindow.xMax },
        }),
        ...computePerimeterRuns(ROOM, {
          y: height - cornice.height / 2,
          height: cornice.height,
          depth: cornice.depth,
        }),
      ],
    };
  }, []);
  const ceilingSpan = ROOM.wallThickness * 2;

  return (
    <group>
      {walls.map((box, index) => (
        <BoxMesh key={index} box={box} castShadow receiveShadow userData={CAMERA_COLLIDER}>
          <meshStandardMaterial {...ROOM_MATERIALS.wall} />
        </BoxMesh>
      ))}

      <mesh
        position={[0, ROOM.height, 0]}
        rotation-x={Math.PI / 2}
        castShadow
        receiveShadow
        userData={CAMERA_COLLIDER}
      >
        <planeGeometry args={[ROOM.width + ceilingSpan, ROOM.depth + ceilingSpan]} />
        <meshStandardMaterial {...ROOM_MATERIALS.ceiling} />
      </mesh>

      <Floor />

      {trims.map((box, index) => (
        <BoxMesh key={index} box={box} receiveShadow>
          <meshStandardMaterial {...ROOM_MATERIALS.trim} />
        </BoxMesh>
      ))}
    </group>
  );
}
