import { readFileSync } from 'node:fs';
import { describe, expect, it } from 'vitest';
import { PROMO_CODES } from '@/config/promo';
import catalogData from '@/data/catalog.json';
import { parseCatalog } from '@/lib/catalogSchema';
import { buildSeedSql } from './seedSql';

describe('supabase/seed.sql', () => {
  it('est à jour avec le catalogue et les codes promo (sinon : npm run db:seed)', () => {
    const committed = readFileSync(new URL('../../supabase/seed.sql', import.meta.url), 'utf8');
    expect(committed).toBe(buildSeedSql(parseCatalog(catalogData), PROMO_CODES));
  });

  it('échappe les apostrophes des textes', () => {
    expect(buildSeedSql(parseCatalog(catalogData), [])).toContain("Canapé d''angle Oran");
  });
});
