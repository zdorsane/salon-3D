import type { Order, OrderInput, OrderTracking } from '@/types/order';

/** Service de commandes : local en démo, edge functions Supabase si configuré. */
export interface OrderService {
  create: (input: OrderInput) => Promise<Order>;
  /** Suivi par numéro + téléphone (null si aucune commande ne correspond aux deux) */
  track: (number: string, phone: string) => Promise<OrderTracking | null>;
}

export type OrderErrorCode = 'emptyCart' | 'wilaya' | 'payment' | 'unavailable' | 'invalid' | 'network';

/** Refus du service, code = clé i18n `checkout.errors.*`. */
export class OrderError extends Error {
  readonly code: OrderErrorCode;

  constructor(code: OrderErrorCode) {
    super(code);
    this.name = 'OrderError';
    this.code = code;
  }
}
