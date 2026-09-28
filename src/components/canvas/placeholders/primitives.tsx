import { RoundedBox } from '@react-three/drei';
import { Euler, Quaternion, Vector3, type Material } from 'three';
import type { PartMaterials } from '@/lib/materials';
import type { DimensionsM } from '@/lib/units';
import type { Vec3 } from '@/types/geometry';

/** Props communes des formes provisoires : repère local, pivot au sol, face avant +Z. */
export interface PlaceholderProps {
  size: DimensionsM;
  materials: PartMaterials;
  shape?: string;
}

interface BlockProps {
  size: Vec3;
  position?: Vec3;
  rotation?: Vec3;
  radius?: number;
  material: Material;
}

/** Pavé à arêtes arrondies (le rayon est borné par la plus petite dimension). */
export function Block({ size, position, rotation, radius = 0.02, material }: BlockProps) {
  const safeRadius = Math.max(0.0005, Math.min(radius, ...size.map((s) => s / 2 - 0.0005)));
  return (
    <RoundedBox
      args={size}
      radius={safeRadius}
      smoothness={3}
      position={position}
      rotation={rotation}
      material={material}
      castShadow
      receiveShadow
    />
  );
}

interface CylProps {
  radius: number;
  radiusBottom?: number;
  height: number;
  position?: Vec3;
  rotation?: Vec3;
  openEnded?: boolean;
  material: Material;
}

export function Cyl({ radius, radiusBottom, height, position, rotation, openEnded = false, material }: CylProps) {
  return (
    <mesh position={position} rotation={rotation} material={material} castShadow receiveShadow>
      <cylinderGeometry args={[radius, radiusBottom ?? radius, height, 32, 1, openEnded]} />
    </mesh>
  );
}

interface BallProps {
  radius: number;
  position?: Vec3;
  scale?: Vec3;
  rotation?: Vec3;
  material: Material;
}

export function Ball({ radius, position, scale, rotation, material }: BallProps) {
  return (
    <mesh position={position} scale={scale} rotation={rotation} material={material} castShadow receiveShadow>
      <sphereGeometry args={[radius, 32, 16]} />
    </mesh>
  );
}

/** Disque horizontal tourné vers le bas (fond d'abat-jour lumineux). */
export function DownDisc({ radius, y, material }: { radius: number; y: number; material: Material }) {
  return (
    <mesh position={[0, y, 0]} rotation-x={Math.PI / 2} material={material}>
      <circleGeometry args={[radius, 32]} />
    </mesh>
  );
}

const UP = new Vector3(0, 1, 0);

/** Tige cylindrique entre deux points (pieds de trépied, bras de lampe). */
export function Segment({ from, to, radius, material }: { from: Vec3; to: Vec3; radius: number; material: Material }) {
  const start = new Vector3(...from);
  const direction = new Vector3(...to).sub(start);
  const length = direction.length();
  const middle = start.addScaledVector(direction, 0.5);
  const rotation = new Euler().setFromQuaternion(new Quaternion().setFromUnitVectors(UP, direction.normalize()));
  return (
    <Cyl
      radius={radius}
      height={length}
      position={[middle.x, middle.y, middle.z]}
      rotation={[rotation.x, rotation.y, rotation.z]}
      material={material}
    />
  );
}
