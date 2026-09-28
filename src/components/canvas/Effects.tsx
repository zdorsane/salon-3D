import { Bloom, EffectComposer, N8AO, Outline, SMAA, ToneMapping } from '@react-three/postprocessing';
import { ToneMappingMode } from 'postprocessing';
import { EFFECTS } from '@/config/render';
import { SELECTION_COLORS } from '@/config/shop';
import { useIsMobile } from '@/lib/useIsMobile';
import { useUIStore } from '@/store/useUIStore';

/**
 * Post-traitement sur ordinateur : occlusion ambiante, contour de sélection, bloom la nuit, anticrénelage.
 * Le composeur désactive le tone mapping du renderer : on le réapplique en dernier effet.
 */
export function Effects() {
  const isMobile = useIsMobile();
  const night = useUIStore((state) => state.timeOfDay === 'night');

  if (isMobile) return null;

  return (
    <EffectComposer multisampling={0} autoClear={false}>
      <N8AO {...EFFECTS.ao} />
      <Outline
        {...EFFECTS.outline}
        visibleEdgeColor={SELECTION_COLORS.outline}
        hiddenEdgeColor={SELECTION_COLORS.hiddenOutline}
      />
      <Bloom {...EFFECTS.bloomNight} intensity={night ? EFFECTS.bloomNight.intensity : 0} mipmapBlur />
      <ToneMapping mode={ToneMappingMode.ACES_FILMIC} />
      <SMAA />
    </EffectComposer>
  );
}
