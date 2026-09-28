import type { Catalog } from '@/types/catalog';
import { rowsToCatalogData, type ProductWithVariantsRow } from './catalogRows';
import { parseCatalog } from './catalogSchema';
import { supabase } from './supabase';

async function loadDemoCatalog(): Promise<Catalog> {
  const data: unknown = (await import('@/data/catalog.json')).default;
  return parseCatalog(data);
}

/**
 * Charge le catalogue : Supabase si configuré (produits et variantes actifs, règles RLS),
 * sinon `src/data/catalog.json`. En cas d'échec réseau, le catalogue de démo prend le relais :
 * les prix affichés restent indicatifs, le serveur recalcule toujours la commande.
 */
export async function loadCatalog(): Promise<Catalog> {
  if (!supabase) return loadDemoCatalog();
  const { data, error } = await supabase
    .from('products')
    .select('*, variants(*)')
    .eq('active', true)
    .eq('variants.active', true)
    .order('sort_order');
  if (error) {
    console.warn('Catalogue Supabase indisponible, catalogue de démo utilisé :', error.message);
    return loadDemoCatalog();
  }
  return parseCatalog(rowsToCatalogData(data as ProductWithVariantsRow[]));
}
