import { Canvas } from '@react-three/fiber';
import { Selection } from '@react-three/postprocessing';
import { Suspense, useEffect } from 'react';
import { CLICK_TOLERANCE_PX } from '@/config/animation';
import { LIGHTING } from '@/config/lighting';
import { RENDER } from '@/config/render';
import { DEFAULT_VIEWPOINT, VIEWPOINTS } from '@/config/viewpoints';
import { useT } from '@/i18n/useT';
import { useIsMobile } from '@/lib/useIsMobile';
import { useUIStore } from '@/store/useUIStore';
import { BayWindow } from './BayWindow';
import { CameraRig } from './CameraRig';
import { Effects } from './Effects';
import { Furniture } from './Furniture';
import { Lighting } from './Lighting';
import { PanelViewOffset } from './PanelViewOffset';
import { Room } from './Room';

interface SceneProps {
  /** Appelé quand la pièce est prête à être affichée */
  onReady: () => void;
}

/** Canvas 3D du showroom : pièce, baie vitrée, éclairage, caméra, meubles et post-traitement. */
export function Scene({ onReady }: SceneProps) {
  const t = useT();
  const isMobile = useIsMobile();
  const timeOfDay = useUIStore((state) => state.timeOfDay);
  const selectSlot = useUIStore((state) => state.selectSlot);
  const { camera } = RENDER;

  return (
    <Canvas
      shadows="percentage"
      dpr={isMobile ? RENDER.dpr.mobile : RENDER.dpr.desktop}
      camera={{
        fov: isMobile ? camera.fov.mobile : camera.fov.desktop,
        near: camera.near,
        far: camera.far,
        position: VIEWPOINTS[DEFAULT_VIEWPOINT].position,
      }}
      aria-label={t('a11y.scene')}
      role="img"
      className="touch-none"
    >
      <color attach="background" args={[LIGHTING[timeOfDay].background]} />
      <Selection>
        <Suspense fallback={null}>
          {/* Un clic sur la pièce (hors meuble) désélectionne */}
          <group onClick={(event) => event.delta <= CLICK_TOLERANCE_PX && selectSlot(null)}>
            <Room />
            <BayWindow />
          </group>
          <Lighting />
          <CameraRig />
          <PanelViewOffset />
          <Effects />
          <ReadySignal onReady={onReady} />
        </Suspense>
        {/* Les meubles arrivent après la pièce, slot par slot */}
        <Furniture />
      </Selection>
    </Canvas>
  );
}

/** Se monte une fois le contenu de Suspense résolu. */
function ReadySignal({ onReady }: SceneProps) {
  useEffect(() => onReady(), [onReady]);
  return null;
}
