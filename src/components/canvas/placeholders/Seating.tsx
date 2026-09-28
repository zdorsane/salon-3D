import type { PartMaterials } from '@/lib/materials';
import { Block, Cyl, type PlaceholderProps } from './primitives';

type Arms = 'both' | 'left' | 'none';

interface SofaBodyProps {
  width: number;
  depth: number;
  height: number;
  arms: Arms;
  cushions: number;
  legs: boolean;
  materials: PartMaterials;
}

const BASE_HEIGHT = 0.2;
const ARM_WIDTH = 0.16;
const ARM_HEIGHT = 0.62;

/** Corps de canapé ou de fauteuil : socle, dossier, accoudoirs, coussins et pieds. */
export function SofaBody({ width, depth, height, arms, cushions, legs, materials }: SofaBodyProps) {
  const legHeight = legs ? 0.08 : 0.02;
  const backDepth = Math.min(0.22, depth * 0.25);
  const armHeight = Math.min(ARM_HEIGHT, height) - legHeight;
  const leftArm = arms !== 'none';
  const rightArm = arms === 'both';
  const innerStart = -width / 2 + (leftArm ? ARM_WIDTH : 0);
  const innerWidth = width / 2 - (rightArm ? ARM_WIDTH : 0) - innerStart;
  const cushionWidth = innerWidth / cushions;
  const seatY = legHeight + BASE_HEIGHT;
  const cushionDepth = depth - backDepth - 0.02;
  const seatZ = -depth / 2 + backDepth + cushionDepth / 2;
  const backCushionHeight = Math.max(0.1, Math.min(0.42, height - seatY - 0.12));
  const armX = width / 2 - ARM_WIDTH / 2;
  const legInset = 0.06;

  return (
    <group>
      <Block size={[width, BASE_HEIGHT, depth]} position={[0, legHeight + BASE_HEIGHT / 2, 0]} radius={0.04} material={materials.fabric} />
      <Block
        size={[width, height - legHeight, backDepth]}
        position={[0, legHeight + (height - legHeight) / 2, -depth / 2 + backDepth / 2]}
        radius={0.07}
        material={materials.fabric}
      />
      {leftArm && (
        <Block size={[ARM_WIDTH, armHeight, depth]} position={[-armX, legHeight + armHeight / 2, 0]} radius={0.07} material={materials.fabric} />
      )}
      {rightArm && (
        <Block size={[ARM_WIDTH, armHeight, depth]} position={[armX, legHeight + armHeight / 2, 0]} radius={0.07} material={materials.fabric} />
      )}
      {Array.from({ length: cushions }, (_, index) => {
        const x = innerStart + cushionWidth * (index + 0.5);
        return (
          <group key={index}>
            <Block size={[cushionWidth - 0.015, 0.16, cushionDepth]} position={[x, seatY + 0.08, seatZ]} radius={0.06} material={materials.accent} />
            <Block
              size={[cushionWidth - 0.03, backCushionHeight, 0.16]}
              position={[x, seatY + 0.16 + backCushionHeight / 2, -depth / 2 + backDepth + 0.08]}
              rotation={[-0.12, 0, 0]}
              radius={0.06}
              material={materials.accent}
            />
          </group>
        );
      })}
      {legs &&
        [-1, 1].flatMap((sx) =>
          [-1, 1].map((sz) => (
            <Cyl
              key={`${sx}:${sz}`}
              radius={0.018}
              radiusBottom={0.013}
              height={legHeight}
              position={[sx * (width / 2 - legInset), legHeight / 2, sz * (depth / 2 - legInset)]}
              material={materials.wood}
            />
          )),
        )}
    </group>
  );
}

export function StraightSofa({ size, materials }: PlaceholderProps) {
  return <SofaBody {...size} arms="both" cushions={size.width > 1.9 ? 3 : 2} legs materials={materials} />;
}

export function ModularSofa({ size, materials }: PlaceholderProps) {
  return <SofaBody {...size} arms="none" cushions={Math.max(2, Math.round(size.width / 0.8))} legs={false} materials={materials} />;
}

/** Canapé d'angle : corps principal au fond, méridienne à droite sur toute la profondeur. */
export function CornerSofa({ size, materials }: PlaceholderProps) {
  const mainDepth = Math.min(size.depth, 0.95);
  const chaiseWidth = Math.min(0.95, size.width * 0.4);
  const extensionDepth = size.depth - mainDepth;
  const x = size.width / 2 - chaiseWidth / 2;
  const z = -size.depth / 2 + mainDepth + extensionDepth / 2;

  return (
    <group>
      <group position={[0, 0, -size.depth / 2 + mainDepth / 2]}>
        <SofaBody width={size.width} depth={mainDepth} height={size.height} arms="left" cushions={3} legs materials={materials} />
      </group>
      <Block size={[chaiseWidth, BASE_HEIGHT, extensionDepth + 0.02]} position={[x, 0.08 + BASE_HEIGHT / 2, z - 0.01]} radius={0.04} material={materials.fabric} />
      <Block size={[chaiseWidth - 0.03, 0.16, extensionDepth - 0.02]} position={[x, 0.08 + BASE_HEIGHT + 0.08, z]} radius={0.06} material={materials.accent} />
      {[-1, 1].map((side) => (
        <Cyl
          key={side}
          radius={0.018}
          radiusBottom={0.013}
          height={0.08}
          position={[x + side * (chaiseWidth / 2 - 0.06), 0.04, size.depth / 2 - 0.06]}
          material={materials.wood}
        />
      ))}
    </group>
  );
}
