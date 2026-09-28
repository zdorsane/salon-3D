import { supabase } from '../supabase';
import { localOrderService } from './local';
import { supabaseOrderService } from './supabase';
import type { OrderService } from './types';

export { OrderError, type OrderErrorCode, type OrderService } from './types';

/** Supabase si configuré (commandes enregistrées sur le serveur), sinon mode démo local. */
export const orderService: OrderService = supabase ? supabaseOrderService(supabase) : localOrderService;
