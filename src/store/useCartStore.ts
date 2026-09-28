import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { PROJECT } from '@/config/project';
import { CART_MAX_QUANTITY } from '@/config/shop';
import type { CartItem } from '@/lib/pricing';
import { normalizePromoCode } from '@/lib/promo';

/** Panier conservé entre les visites ; les prix ne sont jamais stockés. */
interface CartState {
  items: CartItem[];
  /** Code promo saisi (validé à chaque calcul, voir `useCart`) */
  promoCode: string | null;
  /** Ajoute des articles ; une variante déjà présente voit sa quantité augmenter */
  add: (items: Omit<CartItem, 'quantity'>[], quantity?: number) => void;
  setQuantity: (variantId: string, quantity: number) => void;
  remove: (variantId: string) => void;
  clear: () => void;
  setPromoCode: (code: string | null) => void;
}

function clampQuantity(quantity: number): number {
  return Math.min(CART_MAX_QUANTITY, Math.max(1, Math.round(quantity)));
}

export const useCartStore = create<CartState>()(
  persist(
    (set) => ({
      items: [],
      promoCode: null,
      add: (additions, quantity = 1) =>
        set((state) => {
          const items = [...state.items];
          for (const addition of additions) {
            const index = items.findIndex((item) => item.variantId === addition.variantId);
            const existing = items[index];
            if (existing) items[index] = { ...existing, quantity: clampQuantity(existing.quantity + quantity) };
            else items.push({ ...addition, quantity: clampQuantity(quantity) });
          }
          return { items };
        }),
      setQuantity: (variantId, quantity) =>
        set((state) => ({
          items: state.items.map((item) => (item.variantId === variantId ? { ...item, quantity: clampQuantity(quantity) } : item)),
        })),
      remove: (variantId) => set((state) => ({ items: state.items.filter((item) => item.variantId !== variantId) })),
      clear: () => set({ items: [], promoCode: null }),
      setPromoCode: (code) => set({ promoCode: code === null ? null : normalizePromoCode(code) || null }),
    }),
    { name: `${PROJECT.storageKeyPrefix}-cart`, version: 1 },
  ),
);
