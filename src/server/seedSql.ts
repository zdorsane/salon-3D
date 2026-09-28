/**
 * Génère `supabase/seed.sql` (catalogue + codes promo de démo) — `npm run db:seed`.
 * Exécuté aussi par Node sans compilation : imports relatifs, types seulement pour le reste.
 */
import type { PromoDefinition } from '../config/promo.ts';
import type { Catalog } from '../types/catalog.ts';
import { catalogToRows } from '../lib/catalogRows.ts';

type SqlValue = string | number | boolean | null | string[] | object;

/** Littéral SQL : textes échappés, tableaux text[], objets en jsonb. */
function literal(value: SqlValue): string {
  if (value === null) return 'null';
  if (typeof value === 'number' || typeof value === 'boolean') return String(value);
  if (typeof value === 'string') return `'${value.replaceAll("'", "''")}'`;
  if (Array.isArray(value) && value.every((item) => typeof item === 'string')) {
    return value.length === 0 ? "'{}'::text[]" : `array[${value.map((item) => literal(item)).join(', ')}]::text[]`;
  }
  return `${literal(JSON.stringify(value))}::jsonb`;
}

/** INSERT … ON CONFLICT DO UPDATE : relancer le seed met les lignes à jour sans doublon. */
function upsert(table: string, key: string, rows: Record<string, SqlValue>[]): string {
  const first = rows[0];
  if (!first) return '';
  const columns = Object.keys(first);
  const values = rows.map((row) => `  (${columns.map((column) => literal(row[column] ?? null)).join(', ')})`).join(',\n');
  const updates = columns.filter((column) => column !== key).map((column) => `${column} = excluded.${column}`).join(', ');
  return `insert into public.${table} (${columns.join(', ')}) values\n${values}\non conflict (${key}) do update set ${updates};\n`;
}

export function buildSeedSql(catalog: Catalog, promos: PromoDefinition[]): string {
  const { products, variants } = catalogToRows(catalog);
  const promoRows = promos.map((promo) => ({
    code: promo.code,
    kind: promo.kind,
    value: promo.value,
    min_subtotal: promo.minSubtotal ?? null,
    min_items: promo.minItems ?? null,
    max_discount: promo.maxDiscount ?? null,
    expires_at: promo.expiresAt ?? null,
  }));
  return [
    '-- Fichier généré par `npm run db:seed` à partir de src/data/catalog.json et src/config/promo.ts.',
    '-- Ne pas modifier à la main.',
    '',
    upsert('products', 'id', products as unknown as Record<string, SqlValue>[]),
    upsert('variants', 'id', variants as unknown as Record<string, SqlValue>[]),
    upsert('promo_codes', 'code', promoRows),
  ].join('\n');
}
