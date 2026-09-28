import { Block, Cyl, type PlaceholderProps } from './primitives';
import type { PartMaterials } from '@/lib/materials';
import type { Vec3 } from '@/types/geometry';

const TOP_THICKNESS = 0.035;

interface RoundTopProps {
  diameter: number;
  height: number;
  position?: Vec3;
  legs: 'pedestal' | 'tripod';
  materials: PartMaterials;
}

/** Table ronde : plateau (partie accent) sur pied central ou trois pieds fins. */
function RoundTop({ diameter, height, position, legs, materials }: RoundTopProps) {
  const radius = diameter / 2;
  const legHeight = height - TOP_THICKNESS;
  return (
    <group position={position}>
      <Cyl radius={radius} height={TOP_THICKNESS} position={[0, height - TOP_THICKNESS / 2, 0]} material={materials.accent} />
      {legs === 'pedestal' ? (
        <>
          <Cyl radius={radius * 0.22} radiusBottom={radius * 0.3} height={legHeight} position={[0, legHeight / 2, 0]} material={materials.wood} />
          <Cyl radius={radius * 0.45} height={0.02} position={[0, 0.01, 0]} material={materials.wood} />
        </>
      ) : (
        [0, 1, 2].map((i) => {
          const angle = (i * Math.PI * 2) / 3;
          return (
            <Cyl
              key={i}
              radius={0.01}
              height={legHeight}
              position={[Math.cos(angle) * radius * 0.7, legHeight / 2, Math.sin(angle) * radius * 0.7]}
              material={materials.metal}
            />
          );
        })
      )}
    </group>
  );
}

export function RoundTable({ size, materials }: PlaceholderProps) {
  return <RoundTop diameter={Math.min(size.width, size.depth)} height={size.height} legs="pedestal" materials={materials} />;
}

/** Deux tables rondes imbriquées, la petite devant la grande. */
export function NestingTables({ size, materials }: PlaceholderProps) {
  const big = size.depth;
  const small = big * 0.72;
  return (
    <group>
      <RoundTop diameter={big} height={size.height} position={[-(size.width - big) / 2, 0, 0]} legs="tripod" materials={materials} />
      <RoundTop
        diameter={small}
        height={size.height * 0.82}
        position={[size.width / 2 - small / 2, 0, (big - small) / 2]}
        legs="tripod"
        materials={materials}
      />
    </group>
  );
}

/** Table rectangulaire : plateau arrondi, tablette basse, pieds métal. */
export function RectTable({ size, materials }: PlaceholderProps) {
  const { width, depth, height } = size;
  const legHeight = height - TOP_THICKNESS;
  const inset = 0.05;
  return (
    <group>
      <Block size={[width, TOP_THICKNESS, depth]} position={[0, height - TOP_THICKNESS / 2, 0]} radius={0.015} material={materials.accent} />
      <Block size={[width - 0.1, 0.02, depth - 0.1]} position={[0, 0.12, 0]} radius={0.008} material={materials.wood} />
      {[-1, 1].flatMap((sx) =>
        [-1, 1].map((sz) => (
          <Cyl
            key={`${sx}:${sz}`}
            radius={0.014}
            height={legHeight}
            position={[sx * (width / 2 - inset), legHeight / 2, sz * (depth / 2 - inset)]}
            material={materials.metal}
          />
        )),
      )}
    </group>
  );
}
