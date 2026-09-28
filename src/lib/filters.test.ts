import { describe, expect, it } from 'vitest';
import { SLOTS } from '@/config/slots';
import catalogData from '@/data/catalog.json';
import { productsForSlot } from './catalog';
import { parseCatalog } from './catalogSchema';
import { countActiveFilters, EMPTY_FILTERS, filterProducts, isQuickDelivery, lowestPrice } from './filters';
import { formatPrice } from './format';

const sofas = productsForSlot(parseCatalog(catalogData), SLOTS.canape);

describe('filtres des alternatives', () => {
  it('sans filtre, tout est visible', () => {
    expect(filterProducts(sofas, EMPTY_FILTERS)).toHaveLength(sofas.length);
  });

  it('filtre par prix maximum (prix le plus bas du produit)', () => {
    const cheapest = Math.min(...sofas.map(lowestPrice));
    const result = filterProducts(sofas, { ...EMPTY_FILTERS, maxPrice: cheapest });
    expect(result.length).toBeGreaterThan(0);
    expect(result.every((product) => lowestPrice(product) <= cheapest)).toBe(true);
  });

  it('combine style et livraison rapide', () => {
    const style = sofas[0]?.style ?? 'moderne';
    const result = filterProducts(sofas, { ...EMPTY_FILTERS, styles: [style], quickDelivery: true });
    expect(result.every((product) => product.style === style && isQuickDelivery(product))).toBe(true);
  });

  it('compte les filtres actifs', () => {
    expect(countActiveFilters(EMPTY_FILTERS)).toBe(0);
    expect(countActiveFilters({ ...EMPTY_FILTERS, maxPrice: 1, styles: ['oriental', 'moderne'], quickDelivery: true })).toBe(4);
  });
});

describe('formatPrice', () => {
  it('affiche des dinars entiers avec espace insécable', () => {
    expect(formatPrice(245000, 'fr').replace(/\s/g, ' ')).toBe('245 000 DA');
    expect(formatPrice(245000, 'en')).toBe('245,000 DA');
  });
});
