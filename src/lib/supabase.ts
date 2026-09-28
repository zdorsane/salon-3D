import { createClient, type SupabaseClient } from '@supabase/supabase-js';
import { ENV } from './env';

/**
 * Client Supabase du navigateur (clé publique « anon », protégée par les règles RLS).
 * null en mode démo : catalogue JSON et commandes gardées dans le navigateur.
 */
export const supabase: SupabaseClient | null =
  ENV.supabaseUrl && ENV.supabaseAnonKey
    ? createClient(ENV.supabaseUrl, ENV.supabaseAnonKey, { auth: { persistSession: false } })
    : null;

export const isSupabaseConfigured = supabase !== null;
