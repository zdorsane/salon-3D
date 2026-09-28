import { describe, expect, it } from 'vitest';
import { FREE_SHIPPING_MIN, SHIPPING_ZONES, WILAYAS, ZONE_RATES } from '@/config/shipping';
import catalogData from '@/data/catalog.json';
import { parseCatalog } from './catalogSchema';
import { cartLines } from './pricing';
import { findWilaya, quoteShipping } from './shipping';

const catalog = parseCatalog(catalogData);
const SOFA = { productId: 'canape-angle-oran', variantId: 'canape-angle-oran--lin-sable' };
const TABLE = { productId: 'table-ronde-atlas', variantId: 'table-ronde-atlas--chene' };
const ALGER = 16;
const TAMANRASSET = 11;

describe('wilayas', () => {
  it('liste les 58 wilayas, codes 1 à 58 sans doublon', () => {
    expect(WILAYAS).toHaveLength(58);
    expect(WILAYAS.map((w) => w.code)).toEqual(Array.from({ length: 58 }, (_, i) => i + 1));
    expect(new Set(WILAYAS.map((w) => w.name)).size).toBe(58);
  });

  it('chaque zone a des tarifs entiers et un délai cohérent', () => {
    for (const zone of SHIPPING_ZONES) {
      const rates = ZONE_RATES[zone];
      for (const value of [rates.base.home, rates.base.stopDesk, rates.bulkySurcharge]) expect(Number.isInteger(value)).toBe(true);
      expect(rates.base.stopDesk).toBeLessThanOrEqual(rates.base.home);
      expect(rates.transitDays[0]).toBeLessThanOrEqual(rates.transitDays[1]);
      expect(WILAYAS.some((w) => w.zone === zone)).toBe(true);
    }
  });

  it('retrouve une wilaya par son code', () => {
    expect(findWilaya(ALGER)?.name).toBe('Alger');
    expect(findWilaya(99)).toBeUndefined();
  });
});

describe('frais de livraison', () => {
  it('forfait de zone selon le mode de livraison', () => {
    const lines = cartLines([{ ...TABLE, quantity: 1 }], catalog);
    expect(quoteShipping(lines, ALGER, 'home', 38_000)?.fee).toBe(ZONE_RATES.centre.base.home);
    expect(quoteShipping(lines, ALGER, 'stopDesk', 38_000)?.fee).toBe(ZONE_RATES.centre.base.stopDesk);
  });

  it('supplément par meuble volumineux (quantités comprises)', () => {
    const lines = cartLines([{ ...SOFA, quantity: 1 }, { ...TABLE, quantity: 2 }], catalog);
    const quote = quoteShipping(lines, TAMANRASSET, 'home', 100_000);
    expect(quote?.bulkyCount).toBe(1);
    expect(quote?.fee).toBe(ZONE_RATES.grandSud.base.home + ZONE_RATES.grandSud.bulkySurcharge);
  });

  it('livraison offerte dès le seuil, sauf dans le Grand Sud', () => {
    const lines = cartLines([{ ...SOFA, quantity: 2 }], catalog);
    expect(quoteShipping(lines, ALGER, 'home', FREE_SHIPPING_MIN)).toMatchObject({ fee: 0, free: true });
    expect(quoteShipping(lines, ALGER, 'home', FREE_SHIPPING_MIN - 1)?.free).toBe(false);
    expect(quoteShipping(lines, TAMANRASSET, 'home', FREE_SHIPPING_MIN * 2)?.free).toBe(false);
  });

  it('délai = fabrication la plus longue + transport de la zone', () => {
    const lines = cartLines([{ ...SOFA, quantity: 1 }, { ...TABLE, quantity: 1 }], catalog);
    const production = Math.max(...lines.map((line) => line.product.deliveryDays));
    const [min, max] = ZONE_RATES.centre.transitDays;
    expect(quoteShipping(lines, ALGER, 'home', 0)?.estimatedDays).toEqual([production + min, production + max]);
  });

  it('pas de devis sans wilaya valide ni article', () => {
    expect(quoteShipping([], ALGER, 'home', 0)).toBeNull();
    expect(quoteShipping(cartLines([{ ...TABLE, quantity: 1 }], catalog), 0, 'home', 0)).toBeNull();
  });
});
