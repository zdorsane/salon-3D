import { useMemo } from 'react';
import { Vector2 } from 'three';
import { Ball, Cyl, Segment, type PlaceholderProps } from './primitives';

/** Houppier de l'olivier : positions [x, y, z] et rayon, normalisés (largeur, hauteur). */
const OLIVE_CANOPY = [
  [0, 0.86, 0, 0.3],
  [0.22, 0.78, 0.1, 0.22],
  [-0.2, 0.8, -0.08, 0.24],
  [0.05, 0.72, -0.22, 0.2],
  [-0.08, 0.7, 0.22, 0.2],
  [0.18, 0.94, -0.12, 0.18],
  [-0.16, 0.95, 0.1, 0.18],
] as const;

const LEAF_COUNT = 9;

/** Plante en pot. Formes : olive (défaut), monstera. */
export function Plant({ size, materials, shape }: PlaceholderProps) {
  const { width, height } = size;
  const potHeight = Math.min(0.38, height * 0.28);

  return (
    <group>
      <Cyl radius={width * 0.32} radiusBottom={width * 0.24} height={potHeight} position={[0, potHeight / 2, 0]} material={materials.accent} />
      {shape === 'monstera' ? (
        Array.from({ length: LEAF_COUNT }, (_, i) => {
          const angle = (i / LEAF_COUNT) * Math.PI * 2;
          const reach = width * (0.25 + (i % 3) * 0.08);
          const tipY = potHeight + (height - potHeight) * (0.45 + (i % 4) * 0.15);
          const tip: [number, number, number] = [Math.cos(angle) * reach, tipY, Math.sin(angle) * reach];
          return (
            <group key={i}>
              <Segment from={[0, potHeight, 0]} to={tip} radius={0.006} material={materials.foliage} />
              <Ball radius={width * 0.2} position={tip} scale={[1, 0.08, 0.75]} rotation={[0, -angle, 0.35]} material={materials.foliage} />
            </group>
          );
        })
      ) : (
        <>
          <Segment from={[0, potHeight, 0]} to={[0.02, height * 0.72, 0]} radius={0.028} material={materials.wood} />
          {OLIVE_CANOPY.map(([x, y, z, r]) => (
            <Ball key={`${x}:${z}`} radius={r * width} position={[x * width, y * height, z * width]} scale={[1, 0.8, 1]} material={materials.foliage} />
          ))}
        </>
      )}
    </group>
  );
}

/** Profil de vase haut (rayon, hauteur) normalisés, tourné autour de Y. */
const TALL_PROFILE = [
  [0, 0],
  [0.32, 0.02],
  [0.46, 0.3],
  [0.4, 0.62],
  [0.2, 0.84],
  [0.24, 0.9],
] as const;

/** Vase garni de tiges séchées. Formes : tall (défaut), round. */
export function Vase({ size, materials, shape }: PlaceholderProps) {
  const { width, height } = size;
  const bodyHeight = height * (shape === 'round' ? 0.4 : 0.6);
  const points = useMemo(
    () => TALL_PROFILE.map(([r, y]) => new Vector2(r * width, y * bodyHeight)),
    [width, bodyHeight],
  );

  return (
    <group>
      {shape === 'round' ? (
        <>
          <Ball radius={width * 0.45} position={[0, width * 0.45, 0]} scale={[1, 0.9, 1]} material={materials.accent} />
          <Cyl radius={width * 0.12} height={bodyHeight - width * 0.7} position={[0, width * 0.7 + (bodyHeight - width * 0.7) / 2, 0]} material={materials.accent} />
        </>
      ) : (
        <mesh material={materials.accent} castShadow receiveShadow>
          <latheGeometry args={[points, 32]} />
        </mesh>
      )}
      {[-0.35, -0.1, 0.15, 0.4].map((lean, i) => {
        const tip: [number, number, number] = [lean * width, height * (0.92 + (i % 2) * 0.08), (i - 1.5) * 0.05];
        return (
          <group key={lean}>
            <Segment from={[0, bodyHeight * 0.8, 0]} to={tip} radius={0.004} material={materials.foliage} />
            <Ball radius={width * 0.16} position={tip} scale={[0.6, 1.4, 0.6]} material={materials.foliage} />
          </group>
        );
      })}
    </group>
  );
}
