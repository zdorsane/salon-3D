import { SLOTS } from '@/config/slots';
import { ROUTES } from '@/config/routes';
import { SLOT_IDS, type Catalog, type Product, type Variant } from '@/types/catalog';
import type { Composition } from '@/types/room';
import { compatibility, findProduct, findVariant } from './catalog';

/**
 * Salon encodé dans l'URL : `1.SKU.SKU._.SKU…`
 * version, puis un SKU par slot dans l'ordre de SLOT_IDS (`_` = slot vide).
 */
export const URL_PARAM = 'c';
const VERSION = '1';
const SEPARATOR = '.';
const EMPTY = '_';

export function encodeComposition(composition: Composition, catalog: Catalog): string {
  const tokens = SLOT_IDS.map((slotId) => {
    const placement = composition[slotId];
    const product = placement ? findProduct(catalog, placement.productId) : undefined;
    const variant = product && placement ? findVariant(product, placement.variantId) : undefined;
    return variant?.sku ?? EMPTY;
  });
  return [VERSION, ...tokens].join(SEPARATOR);
}

export interface DecodedComposition {
  composition: Composition;
  /** Des SKU inconnus ou incompatibles ont été remplacés par la valeur par défaut */
  corrected: boolean;
}

/**
 * Décode un salon partagé. Chaque slot invalide (SKU inconnu, produit d'une autre catégorie
 * ou trop grand) reprend sa valeur dans `fallback`. Retourne null si le format est inconnu.
 */
export function decodeComposition(value: string, catalog: Catalog, fallback: Composition): DecodedComposition | null {
  const [version, ...tokens] = value.split(SEPARATOR);
  if (version !== VERSION) return null;

  const bySku = new Map<string, { product: Product; variant: Variant }>(
    catalog.products.flatMap((product) => product.variants.map((variant) => [variant.sku, { product, variant }] as const)),
  );
  let corrected = false;
  const entries = SLOT_IDS.map((slotId, index) => {
    const token = tokens[index];
    if (token === EMPTY) return [slotId, null] as const;
    const found = token === undefined ? undefined : bySku.get(token);
    if (found && compatibility(found.product, SLOTS[slotId], found.variant) === 'ok') {
      return [slotId, { productId: found.product.id, variantId: found.variant.id }] as const;
    }
    // Un slot absent (ajouté depuis le partage) n'est pas une correction
    if (token !== undefined) corrected = true;
    return [slotId, fallback[slotId]] as const;
  });
  return { composition: Object.fromEntries(entries) as Composition, corrected };
}

/** Chemin partageable du salon : `/salon?c=…`. */
export function sharePath(composition: Composition, catalog: Catalog): string {
  const params = new URLSearchParams({ [URL_PARAM]: encodeComposition(composition, catalog) });
  return `${ROUTES.sharedRoom}?${params.toString()}`;
}
