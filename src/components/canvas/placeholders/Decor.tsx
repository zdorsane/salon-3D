import type { ReactNode } from 'react';
import type { Material } from 'three';
import { Block, type PlaceholderProps } from './primitives';
import type { Vec3 } from '@/types/geometry';

/** Aplat posé à plat sur le sol (motifs de tapis). */
function FlatPlane({ size, position, angle = 0, material }: { size: [number, number]; position: Vec3; angle?: number; material: Material }) {
  return (
    <mesh position={position} rotation={[-Math.PI / 2, 0, angle]} material={material} receiveShadow>
      <planeGeometry args={size} />
    </mesh>
  );
}

/** Tapis : bordure (accent), champ (fabric) et motif. Formes : berber, stripes, plain. */
export function Rug({ size, materials, shape }: PlaceholderProps) {
  const { width, depth } = size;
  const thickness = Math.max(size.height, 0.008);
  const top = thickness + 0.0015;
  const border = Math.min(width, depth) * 0.06;

  return (
    <group>
      <Block size={[width, thickness, depth]} position={[0, thickness / 2 + 0.001, 0]} radius={0.003} material={materials.accent} />
      <FlatPlane size={[width - border * 2, depth - border * 2]} position={[0, top, 0]} material={materials.fabric} />
      {shape === 'berber' &&
        [-2, -1, 0, 1, 2].map((i) => (
          <FlatPlane key={i} size={[depth * 0.16, depth * 0.16]} position={[(i * width) / 6, top + 0.001, 0]} angle={Math.PI / 4} material={materials.accent} />
        ))}
      {shape === 'stripes' &&
        [-2, -1, 0, 1, 2].map((i) => (
          <FlatPlane key={i} size={[width - border * 2, depth * 0.035]} position={[0, top + 0.001, (i * depth) / 6]} material={materials.accent} />
        ))}
    </group>
  );
}

/** Aplat vertical sur la toile d'un tableau. */
function ArtShape({ children, position, scale, angle = 0, material }: { children: ReactNode; position: Vec3; scale?: Vec3; angle?: number; material: Material }) {
  return (
    <mesh position={position} scale={scale} rotation-z={angle} material={material}>
      {children}
    </mesh>
  );
}

/**
 * Tableau : cadre (wood), toile (accent), motif (fabric).
 * Dos contre le mur, origine en bas au centre. Formes : dunes, arch, calligraphy.
 */
export function Artwork({ size, materials, shape }: PlaceholderProps) {
  const { width, height, depth } = size;
  const frame = 0.03;
  const innerWidth = width - frame * 2;
  const innerHeight = height - frame * 2;
  const z = depth / 2 + 0.001;
  const artZ = z + 0.001;

  return (
    <group>
      <Block size={[width, frame, depth]} position={[0, frame / 2, 0]} radius={0.005} material={materials.wood} />
      <Block size={[width, frame, depth]} position={[0, height - frame / 2, 0]} radius={0.005} material={materials.wood} />
      {[-1, 1].map((side) => (
        <Block key={side} size={[frame, height, depth]} position={[side * (width / 2 - frame / 2), height / 2, 0]} radius={0.005} material={materials.wood} />
      ))}
      <mesh position={[0, height / 2, z]} material={materials.accent}>
        <planeGeometry args={[innerWidth, innerHeight]} />
      </mesh>

      {shape === 'arch' && (
        <>
          <ArtShape position={[0, frame + innerHeight * 0.3, artZ]} material={materials.fabric}>
            <planeGeometry args={[innerWidth * 0.4, innerHeight * 0.5]} />
          </ArtShape>
          <ArtShape position={[0, frame + innerHeight * 0.55, artZ]} material={materials.fabric}>
            <circleGeometry args={[innerWidth * 0.2, 32, 0, Math.PI]} />
          </ArtShape>
        </>
      )}
      {shape === 'calligraphy' &&
        [-0.3, -0.12, 0.05, 0.22, 0.36].map((x, i) => (
          <ArtShape key={x} position={[x * innerWidth, height / 2 + (i % 2 ? 0.04 : -0.03), artZ]} angle={0.5 - i * 0.25} material={materials.fabric}>
            <planeGeometry args={[innerWidth * 0.2, innerHeight * 0.04]} />
          </ArtShape>
        ))}
      {shape !== 'arch' && shape !== 'calligraphy' &&
        [
          { x: -0.2, s: 0.7 },
          { x: 0.25, s: 0.5 },
        ].map((dune) => (
          <ArtShape key={dune.x} position={[dune.x * innerWidth, frame, artZ]} scale={[innerWidth * dune.s, innerHeight * dune.s * 0.9, 1]} material={materials.fabric}>
            <circleGeometry args={[0.5, 48, 0, Math.PI]} />
          </ArtShape>
        ))}
    </group>
  );
}
