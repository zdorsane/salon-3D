/** Régénère supabase/seed.sql : `npm run db:seed` (Node ≥ 23, exécute le TypeScript directement). */
import { readFileSync, writeFileSync } from 'node:fs';
import { PROMO_CODES } from '../src/config/promo.ts';
import { parseCatalog } from '../src/lib/catalogSchema.ts';
import { buildSeedSql } from '../src/server/seedSql.ts';

const root = new URL('..', import.meta.url);
// Même validation que l'application : un catalogue invalide arrête la génération
const catalog = parseCatalog(JSON.parse(readFileSync(new URL('src/data/catalog.json', root), 'utf8')));
writeFileSync(new URL('supabase/seed.sql', root), buildSeedSql(catalog, PROMO_CODES));
console.log(`supabase/seed.sql : ${catalog.products.length} produits, ${PROMO_CODES.length} codes promo`);
