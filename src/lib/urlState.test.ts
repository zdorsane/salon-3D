import { describe, expect, it } from 'vitest';
import { DEFAULT_COMPOSITION, PRESET_IDS, PRESETS } from '@/config/presets';
import { SLOTS } from '@/config/slots';
import catalogData from '@/data/catalog.json';
import { SLOT_IDS } from '@/types/catalog';
import type { Composition } from '@/types/room';
import { compatibility, findProduct, findVariant } from './catalog';
import { parseCatalog } from './catalogSchema';
import { decodeComposition, encodeComposition, sharePath, URL_PARAM } from './urlState';

const catalog = parseCatalog(catalogData);

describe('encodage du salon dans l’URL', () => {
  it.each(PRESET_IDS)('aller-retour sans perte : ambiance « %s »', (id) => {
    const encoded = encodeComposition(PRESETS[id], catalog);
    expect(decodeComposition(encoded, catalog, DEFAULT_COMPOSITION)).toEqual({ composition: PRESETS[id], corrected: false });
  });

  it('produit un lien court et lisible', () => {
    const encoded = encodeComposition(DEFAULT_COMPOSITION, catalog);
    expect(encoded.startsWith('1.')).toBe(true);
    expect(encoded.length).toBeLessThan(160);
    expect(encodeURIComponent(encoded)).toBe(encoded);
  });

  it('conserve les slots vides', () => {
    const composition: Composition = { ...DEFAULT_COMPOSITION, deco1: null, tapis: null };
    const decoded = decodeComposition(encodeComposition(composition, catalog), catalog, DEFAULT_COMPOSITION);
    expect(decoded?.composition.deco1).toBeNull();
    expect(decoded?.composition.tapis).toBeNull();
  });

  it('remplace un SKU inconnu par la valeur par défaut et le signale', () => {
    const tokens = encodeComposition(DEFAULT_COMPOSITION, catalog).split('.');
    tokens[1] = 'SAL-XXX-999';
    const decoded = decodeComposition(tokens.join('.'), catalog, DEFAULT_COMPOSITION);
    expect(decoded?.corrected).toBe(true);
    expect(decoded?.composition.canape).toEqual(DEFAULT_COMPOSITION.canape);
  });

  it('refuse un produit placé dans un slot incompatible', () => {
    const tokens = encodeComposition(DEFAULT_COMPOSITION, catalog).split('.');
    // SKU du tapis placé dans le slot canapé
    tokens[1] = tokens[3] ?? '';
    const decoded = decodeComposition(tokens.join('.'), catalog, DEFAULT_COMPOSITION);
    expect(decoded?.corrected).toBe(true);
    expect(decoded?.composition.canape).toEqual(DEFAULT_COMPOSITION.canape);
  });

  it('complète un lien plus ancien (moins de slots) sans le signaler', () => {
    const tokens = encodeComposition(PRESETS.oriental, catalog).split('.').slice(0, -2);
    const decoded = decodeComposition(tokens.join('.'), catalog, DEFAULT_COMPOSITION);
    expect(decoded?.corrected).toBe(false);
    expect(decoded?.composition.deco3).toEqual(DEFAULT_COMPOSITION.deco3);
    expect(decoded?.composition.canape).toEqual(PRESETS.oriental.canape);
  });

  it('ignore un format de version inconnue', () => {
    expect(decodeComposition('9.abc', catalog, DEFAULT_COMPOSITION)).toBeNull();
    expect(decodeComposition('', catalog, DEFAULT_COMPOSITION)).toBeNull();
  });

  it('construit le chemin /salon?c=…', () => {
    const path = sharePath(DEFAULT_COMPOSITION, catalog);
    const url = new URL(path, 'https://saluna.dz');
    expect(url.pathname).toBe('/salon');
    expect(url.searchParams.get(URL_PARAM)).toBe(encodeComposition(DEFAULT_COMPOSITION, catalog));
  });
});

describe('ambiances', () => {
  it.each(PRESET_IDS)('l’ambiance « %s » place un produit valide dans chaque slot', (id) => {
    for (const slotId of SLOT_IDS) {
      const placement = PRESETS[id][slotId];
      expect(placement, slotId).not.toBeNull();
      if (!placement) continue;
      const product = findProduct(catalog, placement.productId);
      const variant = product && findVariant(product, placement.variantId);
      expect(variant, `${id} / ${slotId}`).toBeDefined();
      if (product && variant) expect(compatibility(product, SLOTS[slotId], variant), `${id} / ${slotId}`).toBe('ok');
    }
  });
});
