import { useLayoutEffect, useRef } from 'react';
import type { SpotLight } from 'three';
import { LIGHTING, RECESSED_SPOTS } from '@/config/lighting';
import { ROOM } from '@/config/room';
import { useUIStore } from '@/store/useUIStore';

/** Spots encastrés au plafond : pastilles toujours visibles, lumière 2700 K la nuit. */
export function RecessedSpots() {
  const timeOfDay = useUIStore((state) => state.timeOfDay);
  const emissive = LIGHTING[timeOfDay].fixtureEmissive;

  return (
    <group>
      {RECESSED_SPOTS.positions.map(([x, z]) => (
        <group key={`${x}:${z}`} position={[x, ROOM.height - 0.002, z]}>
          <mesh rotation-x={Math.PI / 2}>
            <circleGeometry args={[RECESSED_SPOTS.fixtureRadius, 24]} />
            <meshStandardMaterial
              color={RECESSED_SPOTS.fixtureColor}
              emissive={RECESSED_SPOTS.color}
              emissiveIntensity={emissive}
            />
          </mesh>
          {emissive > 0 && <Downlight />}
        </group>
      ))}
    </group>
  );
}

/** Faisceau dirigé vers le sol ; la cible est rattachée à la lampe. */
function Downlight() {
  const ref = useRef<SpotLight>(null);

  useLayoutEffect(() => {
    const light = ref.current;
    if (!light) return;
    light.add(light.target);
    light.target.position.set(0, -1, 0);
  }, []);

  return (
    <spotLight
      ref={ref}
      color={RECESSED_SPOTS.color}
      intensity={RECESSED_SPOTS.intensity}
      angle={RECESSED_SPOTS.angle}
      penumbra={RECESSED_SPOTS.penumbra}
      distance={RECESSED_SPOTS.distance}
      decay={RECESSED_SPOTS.decay}
    />
  );
}
