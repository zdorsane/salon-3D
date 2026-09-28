import { Block, Cyl, type PlaceholderProps } from './primitives';
import { SofaBody } from './Seating';

export function Armchair({ size, materials }: PlaceholderProps) {
  return <SofaBody {...size} arms="both" cushions={1} legs materials={materials} />;
}

export function SlipperChair({ size, materials }: PlaceholderProps) {
  return <SofaBody {...size} arms="none" cushions={1} legs materials={materials} />;
}

const RUNNER_RADIUS = 1.1;
const RUNNER_ARC = 0.9;

/** Rocking-chair : structure bois sur patins cintrés, coussins d'assise et de dossier. */
export function RockingChair({ size, materials }: PlaceholderProps) {
  const { width, depth, height } = size;
  const seatY = 0.42;
  const seatDepth = depth * 0.6;
  const backHeight = height - seatY;
  const halfWidth = width / 2 - 0.03;

  return (
    <group>
      {/* Patins : arcs de tore centrés sous l'assise */}
      {[-1, 1].map((side) => (
        <group key={side} position={[side * halfWidth, RUNNER_RADIUS + 0.015, 0]} rotation-y={Math.PI / 2}>
          <mesh rotation-z={-Math.PI / 2 - RUNNER_ARC / 2} material={materials.wood} castShadow receiveShadow>
            <torusGeometry args={[RUNNER_RADIUS, 0.015, 8, 32, RUNNER_ARC]} />
          </mesh>
        </group>
      ))}
      {[-1, 1].flatMap((sx) =>
        [-1, 1].map((sz) => (
          <Cyl
            key={`${sx}:${sz}`}
            radius={0.015}
            height={seatY - 0.04}
            position={[sx * halfWidth, seatY / 2 + 0.02, sz * seatDepth * 0.4]}
            material={materials.wood}
          />
        )),
      )}
      <Block size={[width, 0.04, seatDepth]} position={[0, seatY, 0]} radius={0.015} material={materials.wood} />
      <Block size={[width - 0.08, 0.08, seatDepth - 0.04]} position={[0, seatY + 0.06, 0.01]} radius={0.035} material={materials.accent} />
      <group position={[0, seatY, -seatDepth / 2]} rotation-x={-0.22}>
        <Block size={[width - 0.04, backHeight, 0.035]} position={[0, backHeight / 2, 0]} radius={0.015} material={materials.wood} />
        <Block size={[width - 0.12, backHeight * 0.7, 0.07]} position={[0, backHeight * 0.45, 0.05]} radius={0.03} material={materials.fabric} />
      </group>
      {[-1, 1].map((side) => (
        <Block key={side} size={[0.04, 0.03, seatDepth]} position={[side * halfWidth, seatY + 0.24, 0]} radius={0.012} material={materials.wood} />
      ))}
    </group>
  );
}
