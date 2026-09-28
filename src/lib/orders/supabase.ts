import { FunctionsHttpError, type SupabaseClient } from '@supabase/supabase-js';
import { useOrdersStore } from '@/store/useOrdersStore';
import type { Order, OrderTracking } from '@/types/order';
import { OrderError, type OrderErrorCode, type OrderService } from './types';

const KNOWN_ERRORS: OrderErrorCode[] = ['emptyCart', 'wilaya', 'payment', 'unavailable', 'invalid'];

/** Erreur d'edge function → OrderError (le corps JSON porte le code, ex. { error: 'unavailable' }). */
async function toOrderError(error: unknown): Promise<OrderError> {
  if (error instanceof FunctionsHttpError) {
    const body: unknown = await (error.context as Response).json().catch(() => null);
    const code = typeof body === 'object' && body !== null && 'error' in body ? body.error : null;
    if (KNOWN_ERRORS.includes(code as OrderErrorCode)) return new OrderError(code as OrderErrorCode);
  }
  return new OrderError('network');
}

/**
 * Service de production : la commande est recalculée et enregistrée par l'edge function
 * `create-order` ; une copie est gardée dans le navigateur pour la page de confirmation.
 */
export function supabaseOrderService(client: SupabaseClient): OrderService {
  return {
    async create(input) {
      const { data, error } = await client.functions.invoke<{ order: Order }>('create-order', { body: input });
      if (error || !data) throw await toOrderError(error);
      useOrdersStore.getState().save(data.order);
      return data.order;
    },
    async track(number, phone) {
      const { data, error } = await client.functions.invoke<{ tracking: OrderTracking }>('track-order', { body: { number, phone } });
      if (error instanceof FunctionsHttpError && (error.context as Response).status === 404) return null;
      if (error || !data) throw await toOrderError(error);
      return data.tracking;
    },
  };
}
