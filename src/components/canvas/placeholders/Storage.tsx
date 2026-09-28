import { Block, Cyl, type PlaceholderProps } from './primitives';

const PANEL = 0.025;

/** Meuble TV : caisson sur pieds, portes en façade et poignées. */
export function Cabinet({ size, materials }: PlaceholderProps) {
  const { width, depth, height } = size;
  const legHeight = 0.1;
  const bodyHeight = height - legHeight;
  const doors = width > 1.5 ? 3 : 2;
  const doorWidth = width / doors;
  return (
    <group>
      <Block size={[width, bodyHeight, depth]} position={[0, legHeight + bodyHeight / 2, 0]} radius={0.015} material={materials.wood} />
      {Array.from({ length: doors }, (_, i) => {
        const x = -width / 2 + doorWidth * (i + 0.5);
        return (
          <group key={i}>
            <Block size={[doorWidth - 0.02, bodyHeight - 0.04, 0.02]} position={[x, legHeight + bodyHeight / 2, depth / 2 + 0.005]} radius={0.006} material={materials.accent} />
            <Block size={[0.12, 0.012, 0.015]} position={[x, legHeight + bodyHeight - 0.08, depth / 2 + 0.022]} radius={0.004} material={materials.metal} />
          </group>
        );
      })}
      {[-1, 1].flatMap((sx) =>
        [-1, 1].map((sz) => (
          <Cyl key={`${sx}:${sz}`} radius={0.015} height={legHeight} position={[sx * (width / 2 - 0.08), legHeight / 2, sz * (depth / 2 - 0.06)]} material={materials.metal} />
        )),
      )}
    </group>
  );
}

/** Console : plateau fin (accent) sur structure métallique. */
export function Console({ size, materials }: PlaceholderProps) {
  const { width, depth, height } = size;
  const legHeight = height - 0.03;
  return (
    <group>
      <Block size={[width, 0.03, depth]} position={[0, height - 0.015, 0]} radius={0.01} material={materials.accent} />
      <Block size={[width - 0.08, 0.015, depth - 0.06]} position={[0, 0.18, 0]} radius={0.005} material={materials.metal} />
      {[-1, 1].flatMap((sx) =>
        [-1, 1].map((sz) => (
          <Cyl key={`${sx}:${sz}`} radius={0.012} height={legHeight} position={[sx * (width / 2 - 0.04), legHeight / 2, sz * (depth / 2 - 0.04)]} material={materials.metal} />
        )),
      )}
    </group>
  );
}

/** Bibliothèque ouverte : montants, fond et tablettes régulières. */
export function Bookcase({ size, materials }: PlaceholderProps) {
  const { width, depth, height } = size;
  const shelves = Math.max(3, Math.round(height / 0.38));
  return (
    <group>
      {[-1, 1].map((side) => (
        <Block key={side} size={[PANEL, height, depth]} position={[side * (width / 2 - PANEL / 2), height / 2, 0]} radius={0.008} material={materials.wood} />
      ))}
      <Block size={[width - 2 * PANEL, height, 0.01]} position={[0, height / 2, -depth / 2 + 0.005]} radius={0.003} material={materials.accent} />
      {Array.from({ length: shelves + 1 }, (_, i) => (
        <Block
          key={i}
          size={[width - 2 * PANEL, PANEL, depth - 0.01]}
          position={[0, 0.04 + (i * (height - 0.08)) / shelves, 0.005]}
          radius={0.006}
          material={materials.wood}
        />
      ))}
    </group>
  );
}

/** Vaisselier : buffet bas à portes et vitrine haute vitrée. */
export function Dresser({ size, materials }: PlaceholderProps) {
  const { width, depth, height } = size;
  const lowerHeight = 0.85;
  const upperHeight = height - lowerHeight - 0.02;
  const upperWidth = width * 0.92;
  const upperDepth = depth * 0.65;
  const upperZ = -depth / 2 + upperDepth / 2;
  const upperY = lowerHeight + 0.02 + upperHeight / 2;
  return (
    <group>
      <Block size={[width, lowerHeight, depth]} position={[0, lowerHeight / 2, 0]} radius={0.015} material={materials.wood} />
      {[-1, 1].map((side) => (
        <group key={side}>
          <Block size={[width / 2 - 0.03, lowerHeight - 0.12, 0.02]} position={[side * width / 4, lowerHeight / 2 + 0.02, depth / 2 + 0.005]} radius={0.006} material={materials.accent} />
          <Cyl radius={0.012} height={0.02} position={[side * 0.06, lowerHeight * 0.6, depth / 2 + 0.025]} rotation={[Math.PI / 2, 0, 0]} material={materials.metal} />
        </group>
      ))}
      <Block size={[upperWidth, upperHeight, upperDepth]} position={[0, upperY, upperZ]} radius={0.012} material={materials.wood} />
      <Block size={[upperWidth - 0.06, upperHeight - 0.06, 0.01]} position={[0, upperY, upperZ + upperDepth / 2 + 0.006]} radius={0.003} material={materials.glass} />
    </group>
  );
}

/** Étagère murale : trois tablettes flottantes décalées (origine à la hauteur de pose). */
export function WallShelf({ size, materials }: PlaceholderProps) {
  const { width, depth, height } = size;
  const rows = [
    { y: 0, scale: 1, offset: 0 },
    { y: height / 2, scale: 0.75, offset: -0.12 },
    { y: height - 0.03, scale: 0.85, offset: 0.08 },
  ];
  return (
    <group>
      {rows.map((row) => (
        <Block
          key={row.y}
          size={[width * row.scale, 0.03, depth]}
          position={[row.offset * width, row.y + 0.015, 0]}
          radius={0.008}
          material={materials.wood}
        />
      ))}
    </group>
  );
}
