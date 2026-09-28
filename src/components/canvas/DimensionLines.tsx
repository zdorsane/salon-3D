import { Html, Line } from '@react-three/drei';
import { SELECTION_COLORS } from '@/config/shop';
import { useT } from '@/i18n/useT';
import { formatNumber } from '@/lib/format';
import type { DimensionsM } from '@/lib/units';
import { useUIStore } from '@/store/useUIStore';
import type { Vec3 } from '@/types/geometry';

interface DimensionLinesProps {
  size: DimensionsM;
  /** Hauteur locale du bas du produit */
  base: number;
}

const OFFSET = 0.1;
const TICK = 0.04;

/** Une cote : ligne, petits traits aux extrémités et valeur en cm au milieu (toujours visible, par-dessus les meubles). */
function Cote({ from, to, tickAxis, value }: { from: Vec3; to: Vec3; tickAxis: Vec3; value: number }) {
  const locale = useUIStore((state) => state.locale);
  const t = useT();
  const tick = (point: Vec3): [Vec3, Vec3] => [
    [point[0] - tickAxis[0] * TICK, point[1] - tickAxis[1] * TICK, point[2] - tickAxis[2] * TICK],
    [point[0] + tickAxis[0] * TICK, point[1] + tickAxis[1] * TICK, point[2] + tickAxis[2] * TICK],
  ];
  const middle: Vec3 = [(from[0] + to[0]) / 2, (from[1] + to[1]) / 2, (from[2] + to[2]) / 2];

  return (
    <group>
      <Line points={[from, to]} color={SELECTION_COLORS.dimension} lineWidth={1.5} depthTest={false} renderOrder={10} />
      <Line points={tick(from)} color={SELECTION_COLORS.dimension} lineWidth={1.5} depthTest={false} renderOrder={10} />
      <Line points={tick(to)} color={SELECTION_COLORS.dimension} lineWidth={1.5} depthTest={false} renderOrder={10} />
      <Html position={middle} center zIndexRange={[30, 0]} style={{ pointerEvents: 'none' }}>
        <span className="glass rounded-md px-2 py-0.5 font-mono text-xs whitespace-nowrap text-brass">
          {t('units.cm', { value: formatNumber(value * 100, locale) })}
        </span>
      </Html>
    </group>
  );
}

/** Cotes 3D (largeur, profondeur, hauteur) autour du meuble, dans son repère local. */
export function DimensionLines({ size, base }: DimensionLinesProps) {
  const x = size.width / 2;
  const z = size.depth / 2;
  const floor = base + 0.01;

  return (
    <group>
      <Cote from={[-x, floor, z + OFFSET]} to={[x, floor, z + OFFSET]} tickAxis={[0, 0, 1]} value={size.width} />
      <Cote from={[x + OFFSET, floor, -z]} to={[x + OFFSET, floor, z]} tickAxis={[1, 0, 0]} value={size.depth} />
      <Cote
        from={[x + OFFSET, base, z + OFFSET]}
        to={[x + OFFSET, base + size.height, z + OFFSET]}
        tickAxis={[1, 0, 0]}
        value={size.height}
      />
    </group>
  );
}
