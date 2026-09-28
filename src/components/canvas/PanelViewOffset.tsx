import { useFrame, useThree } from '@react-three/fiber';
import { useRef } from 'react';
import { PerspectiveCamera } from 'three';
import { PRODUCT_PANEL } from '@/config/viewpoints';
import { panelViewOffset } from '@/lib/camera';
import { useIsMobile } from '@/lib/useIsMobile';
import { useUIStore } from '@/store/useUIStore';

/** Vitesse d'amortissement du décalage (1/s). */
const EASING = 6;
/** Écart (px) sous lequel le décalage a atteint sa cible. */
const EPSILON = 0.5;

/**
 * Quand le panneau produit est ouvert, décale la projection de la caméra pour que le centre
 * de la vue (le meuble ciblé) tombe au milieu de la zone restée visible. Transition amortie.
 */
export function PanelViewOffset() {
  const camera = useThree((state) => state.camera);
  const size = useThree((state) => state.size);
  const panelOpen = useUIStore((state) => state.selectedSlotId !== null);
  const isMobile = useIsMobile();
  const current = useRef<[number, number]>([0, 0]);

  useFrame((_, delta) => {
    if (!(camera instanceof PerspectiveCamera)) return;
    const [targetX, targetY] = panelOpen ? panelViewOffset(size.width, size.height, isMobile, PRODUCT_PANEL) : [0, 0];
    const [x, y] = current.current;
    const settled = Math.abs(targetX - x) < EPSILON && Math.abs(targetY - y) < EPSILON;
    const k = Math.min(1, delta * EASING);
    const [nextX, nextY] = settled ? [targetX, targetY] : [x + (targetX - x) * k, y + (targetY - y) * k];
    current.current = [nextX, nextY];

    const view = camera.view;
    if (nextX === 0 && nextY === 0) {
      if (view?.enabled) camera.clearViewOffset();
      return;
    }
    // Rien à faire si la projection est déjà à jour (y compris après un redimensionnement)
    const upToDate =
      view?.enabled && view.offsetX === nextX && view.offsetY === nextY && view.fullWidth === size.width && view.fullHeight === size.height;
    if (!upToDate) camera.setViewOffset(size.width, size.height, nextX, nextY, size.width, size.height);
  });

  return null;
}
