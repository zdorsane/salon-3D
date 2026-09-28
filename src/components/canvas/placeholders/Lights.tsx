import { Ball, Block, Cyl, DownDisc, Segment, type PlaceholderProps } from './primitives';

/**
 * Suspension : origine au point d'accroche du plafond, le luminaire descend en -Y.
 * Formes : globe (défaut), dome (rotin), cone.
 */
export function Pendant({ size, materials, shape }: PlaceholderProps) {
  const radius = size.width / 2;
  const shadeHeight = shape === 'cone' ? 0.35 : shape === 'dome' ? radius * 0.9 : size.width;
  const cordLength = size.height - shadeHeight;
  const shadeTop = -cordLength;

  return (
    <group>
      <Cyl radius={0.06} height={0.03} position={[0, -0.015, 0]} material={materials.metal} />
      <Cyl radius={0.004} height={cordLength} position={[0, -cordLength / 2, 0]} material={materials.metal} />
      {shape === 'cone' && (
        <>
          <Cyl radius={0.05} radiusBottom={radius} height={shadeHeight} position={[0, shadeTop - shadeHeight / 2, 0]} openEnded material={materials.accent} />
          <DownDisc radius={radius - 0.005} y={-size.height + 0.002} material={materials.light} />
        </>
      )}
      {shape === 'dome' && (
        <>
          <mesh position={[0, -size.height, 0]} scale={[1, 0.9, 1]} material={materials.accent} castShadow>
            <sphereGeometry args={[radius, 32, 16, 0, Math.PI * 2, 0, Math.PI / 2]} />
          </mesh>
          <DownDisc radius={radius - 0.005} y={-size.height + 0.002} material={materials.light} />
        </>
      )}
      {shape !== 'cone' && shape !== 'dome' && (
        <Ball radius={radius} position={[0, -size.height + radius, 0]} material={materials.accent} />
      )}
    </group>
  );
}

/** Lampadaire. Formes : drum (défaut), arc, tripod. */
export function FloorLamp({ size, materials, shape }: PlaceholderProps) {
  const { width, height } = size;
  const shadeHeight = 0.32;
  const shadeRadius = width / 2;
  const shadeY = height - shadeHeight / 2;

  if (shape === 'arc') {
    const poleTop = height - 0.2;
    const reach = width * 0.75;
    const baseZ = -width / 4;
    return (
      <group>
        <Block size={[width * 0.5, 0.05, width * 0.5]} position={[0, 0.025, baseZ]} radius={0.01} material={materials.accent} />
        <Segment from={[0, 0.05, baseZ]} to={[0, poleTop, baseZ]} radius={0.012} material={materials.metal} />
        <Segment from={[0, poleTop, baseZ]} to={[0, poleTop + 0.12, baseZ + reach]} radius={0.012} material={materials.metal} />
        <Ball radius={0.15} position={[0, poleTop - 0.05, baseZ + reach]} material={materials.fabric} />
      </group>
    );
  }

  const shade = (
    <>
      <Cyl radius={shadeRadius * 0.85} radiusBottom={shadeRadius} height={shadeHeight} position={[0, shadeY, 0]} material={materials.fabric} />
      <DownDisc radius={shadeRadius - 0.01} y={height - shadeHeight - 0.001} material={materials.light} />
    </>
  );

  if (shape === 'tripod') {
    const top = height - shadeHeight + 0.02;
    return (
      <group>
        {[0, 1, 2].map((i) => {
          const angle = (i * Math.PI * 2) / 3;
          const foot: [number, number, number] = [Math.cos(angle) * width * 0.42, 0, Math.sin(angle) * width * 0.42];
          return <Segment key={i} from={foot} to={[0, top, 0]} radius={0.014} material={materials.wood} />;
        })}
        {shade}
      </group>
    );
  }

  return (
    <group>
      <Cyl radius={width * 0.3} height={0.03} position={[0, 0.015, 0]} material={materials.metal} />
      <Cyl radius={0.014} height={height - shadeHeight} position={[0, (height - shadeHeight) / 2, 0]} material={materials.wood} />
      {shade}
    </group>
  );
}
