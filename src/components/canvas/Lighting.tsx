import { Environment, Lightformer } from '@react-three/drei';
import { LIGHTING } from '@/config/lighting';
import { RENDER } from '@/config/render';
import { useIsMobile } from '@/lib/useIsMobile';
import { useUIStore } from '@/store/useUIStore';
import { RecessedSpots } from './RecessedSpots';
import { SunLight } from './SunLight';

/** Éclairage jour / nuit : ciel, IBL par panneaux lumineux, soleil ou lune, spots encastrés. */
export function Lighting() {
  const timeOfDay = useUIStore((state) => state.timeOfDay);
  const isMobile = useIsMobile();
  const ambiance = LIGHTING[timeOfDay];

  return (
    <>
      <hemisphereLight
        color={ambiance.hemisphere.sky}
        groundColor={ambiance.hemisphere.ground}
        intensity={ambiance.hemisphere.intensity}
      />

      {/* Carte d'environnement calculée une seule fois par ambiance */}
      <Environment
        key={timeOfDay}
        frames={1}
        resolution={isMobile ? RENDER.environmentResolution.mobile : RENDER.environmentResolution.desktop}
        environmentIntensity={ambiance.environmentIntensity}
      >
        {ambiance.lightformers.map((former) => (
          <Lightformer key={former.position.join(':')} form="rect" {...former} />
        ))}
      </Environment>

      <SunLight spec={ambiance.directional} />
      <RecessedSpots />
    </>
  );
}
