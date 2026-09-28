import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { DEFAULT_COMPOSITION } from '@/config/presets';
import { PROJECT } from '@/config/project';
import { SLOT_IDS, type SlotId } from '@/types/catalog';
import type { Composition, SlotPlacement } from '@/types/room';

/** Essai d'un autre modèle : on garde le précédent pour pouvoir revenir en arrière. */
interface Trial {
  slotId: SlotId;
  previous: SlotPlacement | null;
}

/** Salon composé par le client ; seule la composition est conservée entre les visites. */
interface RoomState {
  composition: Composition;
  trial: Trial | null;
  /** Meubles remplacés, encore affichés le temps de leur animation de sortie */
  outgoing: Partial<Record<SlotId, SlotPlacement>>;
  setVariant: (slotId: SlotId, variantId: string) => void;
  removeFromSlot: (slotId: SlotId) => void;
  /** Place un autre modèle à l'essai (« Garder celui-ci » confirme) */
  tryProduct: (slotId: SlotId, placement: SlotPlacement) => void;
  keepTrial: () => void;
  cancelTrial: () => void;
  clearOutgoing: (slotId: SlotId) => void;
  /** Remplace tout le salon (ambiance, lien partagé) ; annule l'essai en cours */
  applyComposition: (composition: Composition) => void;
}

/** Nouvelle composition + meubles sortants (animés) pour chaque slot dont le produit change. */
function swap(state: RoomState, composition: Composition): Pick<RoomState, 'composition' | 'outgoing'> {
  const outgoing = { ...state.outgoing };
  for (const slotId of SLOT_IDS) {
    const before = state.composition[slotId];
    if (before && before.productId !== composition[slotId]?.productId) outgoing[slotId] = before;
  }
  return { composition, outgoing };
}

export const useRoomStore = create<RoomState>()(
  persist(
    (set) => ({
      composition: DEFAULT_COMPOSITION,
      trial: null,
      outgoing: {},
      setVariant: (slotId, variantId) =>
        set((state) => {
          const current = state.composition[slotId];
          if (!current) return state;
          return { composition: { ...state.composition, [slotId]: { ...current, variantId } } };
        }),
      removeFromSlot: (slotId) =>
        set((state) => ({ ...swap(state, { ...state.composition, [slotId]: null }), trial: null })),
      tryProduct: (slotId, placement) =>
        set((state) => {
          // Un essai sur un autre slot est d'abord annulé
          const base = state.trial && state.trial.slotId !== slotId
            ? { ...state.composition, [state.trial.slotId]: state.trial.previous }
            : state.composition;
          const previous = state.trial?.slotId === slotId ? state.trial.previous : base[slotId];
          return { ...swap(state, { ...base, [slotId]: placement }), trial: { slotId, previous } };
        }),
      keepTrial: () => set({ trial: null }),
      cancelTrial: () =>
        set((state) => {
          if (!state.trial) return state;
          const { slotId, previous } = state.trial;
          return { ...swap(state, { ...state.composition, [slotId]: previous }), trial: null };
        }),
      applyComposition: (composition) => set((state) => ({ ...swap(state, composition), trial: null })),
      clearOutgoing: (slotId) =>
        set((state) => ({
          outgoing: Object.fromEntries(Object.entries(state.outgoing).filter(([id]) => id !== slotId)),
        })),
    }),
    {
      name: `${PROJECT.storageKeyPrefix}-room`,
      version: 1,
      partialize: (state) => ({ composition: state.composition }),
      // Les slots ajoutés depuis la dernière visite reprennent leur valeur par défaut
      merge: (persisted, current) => {
        const saved = (persisted as Partial<RoomState> | undefined)?.composition;
        return { ...current, composition: { ...DEFAULT_COMPOSITION, ...saved } };
      },
    },
  ),
);
