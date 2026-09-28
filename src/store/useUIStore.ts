import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { TimeOfDay } from '@/config/lighting';
import { PROJECT } from '@/config/project';
import { COMPARE_MAX } from '@/config/shop';
import { DEFAULT_VIEWPOINT, VIEWPOINTS, type Viewpoint, type ViewpointId } from '@/config/viewpoints';
import { DEFAULT_LOCALE, type Locale } from '@/i18n/locales';
import type { SlotId } from '@/types/catalog';

/** Demande de déplacement de caméra ; `id` croît à chaque demande. */
interface CameraRequest {
  id: number;
  viewpoint: Viewpoint;
}

/** Message court affiché en bas de l'écran, avec une action facultative (« Annuler »…). */
export interface Toast {
  id: number;
  message: string;
  action?: { label: string; run: () => void };
}

/** État de l'interface ; seule la langue est conservée entre les visites. */
interface UIState {
  locale: Locale;
  timeOfDay: TimeOfDay;
  /** Point de vue prédéfini actif (null dès que la caméra bouge autrement) */
  viewpointId: ViewpointId | null;
  cameraRequest: CameraRequest | null;
  selectedSlotId: SlotId | null;
  hoveredSlotId: SlotId | null;
  dimensionsVisible: boolean;
  /** Produits du comparateur (même slot, 3 au plus) */
  compareIds: string[];
  toast: Toast | null;
  cartOpen: boolean;
  setLocale: (locale: Locale) => void;
  toggleTimeOfDay: () => void;
  goToViewpoint: (id: ViewpointId) => void;
  focusCamera: (viewpoint: Viewpoint) => void;
  clearViewpoint: () => void;
  selectSlot: (slotId: SlotId | null) => void;
  hoverSlot: (slotId: SlotId | null) => void;
  toggleDimensions: () => void;
  toggleCompare: (productId: string) => void;
  showToast: (toast: Omit<Toast, 'id'>) => void;
  dismissToast: () => void;
  setCartOpen: (open: boolean) => void;
}

export const useUIStore = create<UIState>()(
  persist(
    (set) => ({
      locale: DEFAULT_LOCALE,
      timeOfDay: 'day',
      viewpointId: DEFAULT_VIEWPOINT,
      cameraRequest: null,
      selectedSlotId: null,
      hoveredSlotId: null,
      dimensionsVisible: false,
      compareIds: [],
      toast: null,
      cartOpen: false,
      setLocale: (locale) => set({ locale }),
      toggleTimeOfDay: () => set((state) => ({ timeOfDay: state.timeOfDay === 'day' ? 'night' : 'day' })),
      goToViewpoint: (id) =>
        set((state) => ({
          viewpointId: id,
          cameraRequest: { id: (state.cameraRequest?.id ?? 0) + 1, viewpoint: VIEWPOINTS[id] },
        })),
      focusCamera: (viewpoint) =>
        set((state) => ({ viewpointId: null, cameraRequest: { id: (state.cameraRequest?.id ?? 0) + 1, viewpoint } })),
      clearViewpoint: () => set({ viewpointId: null }),
      selectSlot: (slotId) =>
        set((state) => ({
          selectedSlotId: slotId,
          dimensionsVisible: false,
          // Le comparateur ne mélange pas les slots
          compareIds: slotId === state.selectedSlotId ? state.compareIds : [],
        })),
      hoverSlot: (slotId) => set({ hoveredSlotId: slotId }),
      toggleDimensions: () => set((state) => ({ dimensionsVisible: !state.dimensionsVisible })),
      toggleCompare: (productId) =>
        set((state) => {
          if (state.compareIds.includes(productId)) {
            return { compareIds: state.compareIds.filter((id) => id !== productId) };
          }
          if (state.compareIds.length >= COMPARE_MAX) return state;
          return { compareIds: [...state.compareIds, productId] };
        }),
      showToast: (toast) => set((state) => ({ toast: { ...toast, id: (state.toast?.id ?? 0) + 1 } })),
      dismissToast: () => set({ toast: null }),
      setCartOpen: (open) => set({ cartOpen: open }),
    }),
    {
      name: `${PROJECT.storageKeyPrefix}-ui`,
      partialize: (state) => ({ locale: state.locale }),
    },
  ),
);
