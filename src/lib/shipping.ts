import {
  BULKY_CATEGORIES,
  FREE_SHIPPING_MIN,
  WILAYAS,
  ZONE_RATES,
  type DeliveryMethod,
  type Wilaya,
} from '@/config/shipping.ts';
import type { CartLine } from './pricing.ts';

export function findWilaya(code: number): Wilaya | undefined {
  return WILAYAS.find((wilaya) => wilaya.code === code);
}

export interface ShippingQuote {
  /** Frais de livraison en dinars entiers (0 si offerte) */
  fee: number;
  /** Frais avant la livraison offerte */
  fullFee: number;
  free: boolean;
  bulkyCount: number;
  /** Délai estimé en jours (fabrication la plus longue + transport) */
  estimatedDays: [number, number];
}

/**
 * Frais de livraison d'un panier vers une wilaya : forfait de la zone selon le mode,
 * plus un supplément par meuble volumineux ; offerte dès FREE_SHIPPING_MIN (après remise)
 * si la zone y a droit.
 */
export function quoteShipping(
  lines: CartLine[],
  wilayaCode: number,
  method: DeliveryMethod,
  discountedSubtotal: number,
): ShippingQuote | null {
  const wilaya = findWilaya(wilayaCode);
  if (!wilaya || lines.length === 0) return null;
  const rates = ZONE_RATES[wilaya.zone];

  const bulkyCount = lines.reduce(
    (count, line) => count + (BULKY_CATEGORIES.includes(line.product.category) ? line.quantity : 0),
    0,
  );
  const fullFee = rates.base[method] + bulkyCount * rates.bulkySurcharge;
  const free = rates.freeShippingEligible && discountedSubtotal >= FREE_SHIPPING_MIN;
  const production = Math.max(...lines.map((line) => line.product.deliveryDays));
  const [minTransit, maxTransit] = rates.transitDays;

  return {
    fee: free ? 0 : fullFee,
    fullFee,
    free,
    bulkyCount,
    estimatedDays: [production + minTransit, production + maxTransit],
  };
}
