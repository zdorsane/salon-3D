import { Edges } from '@react-three/drei';
import { Select } from '@react-three/postprocessing';
import type { ReactNode } from 'react';
import { SELECTION_COLORS } from '@/config/shop';
import type { DimensionsM } from '@/lib/units';
import { useIsMobile } from '@/lib/useIsMobile';

interface SelectionOutlineProps {
  active: boolean;
  size: DimensionsM;
  /** Hauteur locale du bas du produit */
  base: number;
  children: ReactNode;
}

const MARGIN = 0.03;

/**
 * Contour doré du meuble survolé ou sélectionné : effet Outline sur ordinateur,
 * arêtes de sa boîte englobante sur mobile (sans post-traitement).
 */
export function SelectionOutline({ active, size, base, children }: SelectionOutlineProps) {
  const isMobile = useIsMobile();

  return (
    <>
      <Select enabled={active && !isMobile}>{children}</Select>
      {active && isMobile && (
        <mesh position={[0, base + size.height / 2, 0]}>
          <boxGeometry args={[size.width + MARGIN, size.height + MARGIN, size.depth + MARGIN]} />
          <meshBasicMaterial visible={false} />
          <Edges color={SELECTION_COLORS.outline} />
        </mesh>
      )}
    </>
  );
}
