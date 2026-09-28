import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { PROJECT } from '@/config/project';

/** Produits mis en favoris, conservés entre les visites. */
interface FavoritesState {
  productIds: string[];
  toggle: (productId: string) => void;
  add: (productId: string) => void;
}

export const useFavoritesStore = create<FavoritesState>()(
  persist(
    (set) => ({
      productIds: [],
      toggle: (productId) =>
        set((state) => ({
          productIds: state.productIds.includes(productId)
            ? state.productIds.filter((id) => id !== productId)
            : [...state.productIds, productId],
        })),
      add: (productId) =>
        set((state) => (state.productIds.includes(productId) ? state : { productIds: [...state.productIds, productId] })),
    }),
    { name: `${PROJECT.storageKeyPrefix}-favorites`, version: 1 },
  ),
);
