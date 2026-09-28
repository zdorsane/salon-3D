import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { PROJECT } from '@/config/project';
import type { Order } from '@/types/order';

/** Nombre de commandes gardées dans le navigateur (mode démo). */
const MAX_ORDERS = 20;

/** Commandes passées depuis ce navigateur (démo ; en production elles vivent dans Supabase). */
interface OrdersState {
  orders: Order[];
  save: (order: Order) => void;
}

export const useOrdersStore = create<OrdersState>()(
  persist(
    (set) => ({
      orders: [],
      save: (order) => set((state) => ({ orders: [order, ...state.orders.filter((o) => o.id !== order.id)].slice(0, MAX_ORDERS) })),
    }),
    { name: `${PROJECT.storageKeyPrefix}-orders`, version: 1 },
  ),
);
