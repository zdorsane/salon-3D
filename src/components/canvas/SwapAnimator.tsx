import { useEffect, useEffectEvent, useLayoutEffect, useRef, type ReactNode } from 'react';
import type { Group } from 'three';
import { animateIn, animateOut } from '@/lib/swapAnimation';

interface SwapAnimatorProps {
  /** Le produit va être remplacé ou retiré : lancer la disparition */
  leaving: boolean;
  onAppeared: () => void;
  onLeft: () => void;
  children: ReactNode;
}

/** Anime l'apparition (au montage) et la disparition (quand `leaving` passe à vrai) d'un meuble. */
export function SwapAnimator({ leaving, onAppeared, onLeft, children }: SwapAnimatorProps) {
  const ref = useRef<Group>(null);
  const appeared = useEffectEvent(onAppeared);
  const left = useEffectEvent(onLeft);

  useLayoutEffect(() => {
    const group = ref.current;
    if (!group) return;
    const tween = animateIn(group, () => appeared());
    return () => void tween.kill();
  }, []);

  useEffect(() => {
    const group = ref.current;
    if (!leaving || !group) return;
    const tween = animateOut(group, () => left());
    return () => void tween.kill();
  }, [leaving]);

  return <group ref={ref}>{children}</group>;
}
