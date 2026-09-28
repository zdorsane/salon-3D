import { useSyncExternalStore } from 'react';
import { RENDER } from '@/config/render';

const query = window.matchMedia(RENDER.mobileQuery);

function subscribe(onChange: () => void): () => void {
  query.addEventListener('change', onChange);
  return () => query.removeEventListener('change', onChange);
}

/** Vrai sur écran étroit ou tactile : sert à alléger le rendu 3D. */
export function useIsMobile(): boolean {
  return useSyncExternalStore(subscribe, () => query.matches);
}
