/**
 * Accès base des edge functions : client service_role (contourne la RLS, jamais exposé
 * au navigateur) et implémentation des dépendances de src/server/.
 */
import { createClient, type SupabaseClient } from '@supabase/supabase-js';
import type { PromoDefinition } from '@/config/promo.ts';
import { rowsToCatalogData, type ProductWithVariantsRow } from '@/lib/catalogRows.ts';
import { parseCatalog } from '@/lib/catalogSchema.ts';
import type { CreateOrderDeps } from '@/server/createOrder.ts';
import { orderToRow, rowToTracking, type OrderEventRow, type OrderRow } from '@/server/orderRows.ts';
import type { TrackOrderDeps } from '@/server/trackOrder.ts';

/** Variables fournies automatiquement par Supabase à chaque edge function. */
export function serviceClient(): SupabaseClient {
  const url = Deno.env.get('SUPABASE_URL');
  const key = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY');
  if (!url || !key) throw new Error('SUPABASE_URL ou SUPABASE_SERVICE_ROLE_KEY manquant');
  return createClient(url, key, { auth: { persistSession: false } });
}

interface PromoRow {
  code: string;
  kind: 'percent' | 'fixed';
  value: number;
  min_subtotal: number | null;
  min_items: number | null;
  max_discount: number | null;
  expires_at: string | null;
}

function toPromo(row: PromoRow): PromoDefinition {
  return {
    code: row.code,
    kind: row.kind,
    value: row.value,
    ...(row.min_subtotal === null ? {} : { minSubtotal: row.min_subtotal }),
    ...(row.min_items === null ? {} : { minItems: row.min_items }),
    ...(row.max_discount === null ? {} : { maxDiscount: row.max_discount }),
    ...(row.expires_at === null ? {} : { expiresAt: row.expires_at }),
  };
}

/** Code d'erreur Postgres « violation d'unicité ». */
const UNIQUE_VIOLATION = '23505';

export function createOrderDeps(db: SupabaseClient): CreateOrderDeps {
  return {
    async loadCatalog(productIds) {
      const { data, error } = await db
        .from('products')
        .select('*, variants(*)')
        .in('id', productIds)
        .eq('active', true)
        .eq('variants.active', true);
      if (error) throw error;
      return parseCatalog(rowsToCatalogData(data as ProductWithVariantsRow[]));
    },
    async findPromo(code) {
      const { data, error } = await db.from('promo_codes').select('*').eq('code', code).eq('active', true).maybeSingle();
      if (error) throw error;
      return data ? toPromo(data as PromoRow) : null;
    },
    async insertOrder(order) {
      const { error } = await db.from('orders').insert(orderToRow(order));
      if (!error) return 'ok';
      if (error.code === UNIQUE_VIOLATION && error.message.includes('number')) return 'duplicate';
      throw error;
    },
    now: () => new Date(),
    random: () => (crypto.getRandomValues(new Uint32Array(1))[0] ?? 0) / 2 ** 32,
    uuid: () => crypto.randomUUID(),
  };
}

export function trackOrderDeps(db: SupabaseClient): TrackOrderDeps {
  return {
    async findTracking(number, phone) {
      const { data, error } = await db
        .from('orders')
        .select('*, order_events(status, created_at)')
        .eq('number', number)
        .eq('customer_phone', phone)
        .maybeSingle();
      if (error) throw error;
      if (!data) return null;
      const { order_events: events, ...row } = data as OrderRow & { order_events: OrderEventRow[] };
      return rowToTracking(row, events);
    },
  };
}
