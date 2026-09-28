import { useFrame } from '@react-three/fiber';
import { useRef } from 'react';
import type { Mesh } from 'three';
import { SPINNER_SPEED } from '@/config/animation';
import { SELECTION_COLORS } from '@/config/shop';

/** Petit anneau laiton qui tourne à la place du meuble pendant le chargement de son .glb. */
export function SwapSpinner({ y }: { y: number }) {
  const ref = useRef<Mesh>(null);

  useFrame((_, delta) => {
    if (ref.current) ref.current.rotation.z -= delta * SPINNER_SPEED;
  });

  return (
    <mesh ref={ref} position={[0, y, 0]}>
      <torusGeometry args={[0.12, 0.012, 8, 48, Math.PI * 1.5]} />
      <meshBasicMaterial color={SELECTION_COLORS.outline} toneMapped={false} />
    </mesh>
  );
}
