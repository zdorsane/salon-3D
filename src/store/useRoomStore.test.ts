import { beforeEach, describe, expect, it } from 'vitest';
import { DEFAULT_COMPOSITION, PRESETS } from '@/config/presets';
import { useRoomStore } from './useRoomStore';

const ARMCHAIR = { productId: 'chauffeuse-tlemcen', variantId: 'chauffeuse-tlemcen--x' };
const ROCKER = { productId: 'rocking-chair-djurdjura', variantId: 'rocking-chair-djurdjura--x' };

describe('useRoomStore', () => {
  beforeEach(() => useRoomStore.setState({ composition: DEFAULT_COMPOSITION, trial: null, outgoing: {} }));

  it('met un modèle à l’essai et garde l’ancien pour l’animation de sortie', () => {
    useRoomStore.getState().tryProduct('fauteuil', ARMCHAIR);
    const state = useRoomStore.getState();
    expect(state.composition.fauteuil).toEqual(ARMCHAIR);
    expect(state.trial).toEqual({ slotId: 'fauteuil', previous: DEFAULT_COMPOSITION.fauteuil });
    expect(state.outgoing.fauteuil).toEqual(DEFAULT_COMPOSITION.fauteuil);
  });

  it('« Revenir au précédent » restaure le modèle d’origine même après plusieurs essais', () => {
    const { tryProduct, cancelTrial } = useRoomStore.getState();
    tryProduct('fauteuil', ARMCHAIR);
    tryProduct('fauteuil', ROCKER);
    cancelTrial();
    const state = useRoomStore.getState();
    expect(state.composition.fauteuil).toEqual(DEFAULT_COMPOSITION.fauteuil);
    expect(state.trial).toBeNull();
  });

  it('« Garder celui-ci » confirme l’essai', () => {
    const { tryProduct, keepTrial } = useRoomStore.getState();
    tryProduct('fauteuil', ARMCHAIR);
    keepTrial();
    expect(useRoomStore.getState().composition.fauteuil).toEqual(ARMCHAIR);
    expect(useRoomStore.getState().trial).toBeNull();
  });

  it('un essai sur un autre slot annule le précédent', () => {
    const { tryProduct } = useRoomStore.getState();
    tryProduct('fauteuil', ARMCHAIR);
    tryProduct('canape', { productId: 'canape-3p-tipaza', variantId: 'canape-3p-tipaza--x' });
    const state = useRoomStore.getState();
    expect(state.composition.fauteuil).toEqual(DEFAULT_COMPOSITION.fauteuil);
    expect(state.trial?.slotId).toBe('canape');
  });

  it('changer de variante n’anime pas de sortie', () => {
    useRoomStore.getState().setVariant('canape', 'canape-angle-oran--anthracite');
    const state = useRoomStore.getState();
    expect(state.composition.canape?.variantId).toBe('canape-angle-oran--anthracite');
    expect(state.outgoing.canape).toBeUndefined();
  });

  it('retirer vide le slot puis l’animation de sortie se termine', () => {
    const { removeFromSlot, clearOutgoing } = useRoomStore.getState();
    removeFromSlot('deco3');
    expect(useRoomStore.getState().composition.deco3).toBeNull();
    clearOutgoing('deco3');
    expect(useRoomStore.getState().outgoing.deco3).toBeUndefined();
  });

  it('appliquer une ambiance anime chaque meuble changé et annule l’essai', () => {
    const { tryProduct, applyComposition } = useRoomStore.getState();
    tryProduct('fauteuil', ARMCHAIR);
    applyComposition(PRESETS.scandinave);
    const state = useRoomStore.getState();
    expect(state.composition).toEqual(PRESETS.scandinave);
    expect(state.trial).toBeNull();
    // Même table basse (seule la finition change) : pas d’animation de sortie
    expect(state.outgoing.tableBasse).toBeUndefined();
    expect(state.outgoing.canape).toEqual(DEFAULT_COMPOSITION.canape);
  });
});
