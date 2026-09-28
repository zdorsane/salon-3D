import { useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router';
import { DEFAULT_COMPOSITION } from '@/config/presets';
import { ROUTES } from '@/config/routes';
import { useT } from '@/i18n/useT';
import { useRoomStore } from '@/store/useRoomStore';
import { useUIStore } from '@/store/useUIStore';
import { getCatalog } from './useCatalog';
import { decodeComposition, encodeComposition, sharePath, URL_PARAM } from './urlState';

/**
 * Sur `/salon?c=…` : charge le salon partagé, puis garde l'adresse à jour à chaque
 * modification (le lien de la barre d'adresse reste toujours partageable).
 */
export function useSharedRoom(): void {
  const t = useT();
  const navigate = useNavigate();
  const { pathname, search } = useLocation();
  const onSharedRoute = pathname === ROUTES.sharedRoom;
  const encoded = new URLSearchParams(search).get(URL_PARAM);

  // Chargement : ignoré si l'adresse correspond déjà au salon affiché (mise à jour ci-dessous)
  useEffect(() => {
    if (!onSharedRoute || !encoded) return;
    let cancelled = false;
    void getCatalog().then((catalog) => {
      if (cancelled || encoded === encodeComposition(useRoomStore.getState().composition, catalog)) return;
      const decoded = decodeComposition(encoded, catalog, DEFAULT_COMPOSITION);
      const { showToast } = useUIStore.getState();
      if (!decoded) {
        showToast({ message: t('share.invalid') });
        return;
      }
      useRoomStore.getState().applyComposition(decoded.composition);
      showToast({ message: t(decoded.corrected ? 'share.corrected' : 'share.loaded') });
    });
    return () => {
      cancelled = true;
    };
  }, [onSharedRoute, encoded, t]);

  // Synchronisation de l'adresse avec le salon
  useEffect(() => {
    if (!onSharedRoute) return;
    return useRoomStore.subscribe((state, previous) => {
      if (state.composition === previous.composition) return;
      void getCatalog().then((catalog) => navigate(sharePath(state.composition, catalog), { replace: true }));
    });
  }, [onSharedRoute, navigate]);
}
