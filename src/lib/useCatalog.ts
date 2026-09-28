import { use } from 'react';
import type { Catalog } from '@/types/catalog';
import { loadCatalog } from './catalogSource';

let catalogPromise: Promise<Catalog> | null = null;

/** Promesse unique du catalogue, partagée par toute l'application. */
export function getCatalog(): Promise<Catalog> {
  catalogPromise ??= loadCatalog();
  return catalogPromise;
}

/** Catalogue chargé ; suspend le composant (Suspense) pendant le chargement. */
export function useCatalog(): Catalog {
  return use(getCatalog());
}
