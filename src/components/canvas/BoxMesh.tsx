import type { ThreeElements } from '@react-three/fiber';
import type { Box } from '@/types/geometry';

type BoxMeshProps = Omit<ThreeElements['mesh'], 'position'> & { box: Box };

/** Pavé positionné à partir d'une boîte calculée ; le matériau est passé en enfant. */
export function BoxMesh({ box, children, ...props }: BoxMeshProps) {
  return (
    <mesh position={box.position} {...props}>
      <boxGeometry args={box.size} />
      {children}
    </mesh>
  );
}
