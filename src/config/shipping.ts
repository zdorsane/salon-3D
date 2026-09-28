import type { ProductCategory } from '@/types/catalog.ts';

/**
 * Livraison — tarifs de DÉMONSTRATION en dinars entiers, à remplacer par ceux du transporteur.
 * Chaque wilaya est rattachée à une zone ; la zone porte les tarifs et les délais.
 */
export const SHIPPING_ZONES = ['centre', 'nord', 'hautsPlateaux', 'sud', 'grandSud'] as const;
export type ShippingZone = (typeof SHIPPING_ZONES)[number];

export const DELIVERY_METHODS = ['home', 'stopDesk'] as const;
export type DeliveryMethod = (typeof DELIVERY_METHODS)[number];

export interface ZoneRates {
  /** Forfait par commande selon le mode de livraison */
  base: Record<DeliveryMethod, number>;
  /** Supplément par meuble volumineux (manutention, camion) */
  bulkySurcharge: number;
  /** Délai de transport en jours (min–max), après fabrication */
  transitDays: [number, number];
  /** La livraison offerte s'applique-t-elle dans cette zone ? */
  freeShippingEligible: boolean;
}

export const ZONE_RATES: Record<ShippingZone, ZoneRates> = {
  centre: { base: { home: 1_500, stopDesk: 800 }, bulkySurcharge: 1_000, transitDays: [1, 3], freeShippingEligible: true },
  nord: { base: { home: 2_500, stopDesk: 1_200 }, bulkySurcharge: 2_000, transitDays: [2, 5], freeShippingEligible: true },
  hautsPlateaux: { base: { home: 3_000, stopDesk: 1_500 }, bulkySurcharge: 2_500, transitDays: [3, 6], freeShippingEligible: true },
  sud: { base: { home: 4_500, stopDesk: 2_500 }, bulkySurcharge: 4_000, transitDays: [5, 9], freeShippingEligible: true },
  grandSud: { base: { home: 7_000, stopDesk: 4_000 }, bulkySurcharge: 6_000, transitDays: [7, 14], freeShippingEligible: false },
};

/** Sous-total (après remise) à partir duquel la livraison est offerte. */
export const FREE_SHIPPING_MIN = 400_000;

/** Catégories livrées en camion avec manutention (supplément par article). */
export const BULKY_CATEGORIES: ProductCategory[] = [
  'canapeAngle',
  'canape3Places',
  'canapeModulable',
  'meubleTV',
  'bibliotheque',
  'vaisselier',
];

export interface Wilaya {
  /** Code officiel (1–58) */
  code: number;
  name: string;
  zone: ShippingZone;
}

/** Les 58 wilayas (découpage de 2019). */
export const WILAYAS: Wilaya[] = [
  { code: 1, name: 'Adrar', zone: 'sud' },
  { code: 2, name: 'Chlef', zone: 'nord' },
  { code: 3, name: 'Laghouat', zone: 'hautsPlateaux' },
  { code: 4, name: 'Oum El Bouaghi', zone: 'nord' },
  { code: 5, name: 'Batna', zone: 'hautsPlateaux' },
  { code: 6, name: 'Béjaïa', zone: 'nord' },
  { code: 7, name: 'Biskra', zone: 'hautsPlateaux' },
  { code: 8, name: 'Béchar', zone: 'sud' },
  { code: 9, name: 'Blida', zone: 'centre' },
  { code: 10, name: 'Bouira', zone: 'centre' },
  { code: 11, name: 'Tamanrasset', zone: 'grandSud' },
  { code: 12, name: 'Tébessa', zone: 'hautsPlateaux' },
  { code: 13, name: 'Tlemcen', zone: 'nord' },
  { code: 14, name: 'Tiaret', zone: 'hautsPlateaux' },
  { code: 15, name: 'Tizi Ouzou', zone: 'centre' },
  { code: 16, name: 'Alger', zone: 'centre' },
  { code: 17, name: 'Djelfa', zone: 'hautsPlateaux' },
  { code: 18, name: 'Jijel', zone: 'nord' },
  { code: 19, name: 'Sétif', zone: 'nord' },
  { code: 20, name: 'Saïda', zone: 'hautsPlateaux' },
  { code: 21, name: 'Skikda', zone: 'nord' },
  { code: 22, name: 'Sidi Bel Abbès', zone: 'nord' },
  { code: 23, name: 'Annaba', zone: 'nord' },
  { code: 24, name: 'Guelma', zone: 'nord' },
  { code: 25, name: 'Constantine', zone: 'nord' },
  { code: 26, name: 'Médéa', zone: 'centre' },
  { code: 27, name: 'Mostaganem', zone: 'nord' },
  { code: 28, name: "M'Sila", zone: 'hautsPlateaux' },
  { code: 29, name: 'Mascara', zone: 'nord' },
  { code: 30, name: 'Ouargla', zone: 'sud' },
  { code: 31, name: 'Oran', zone: 'nord' },
  { code: 32, name: 'El Bayadh', zone: 'hautsPlateaux' },
  { code: 33, name: 'Illizi', zone: 'grandSud' },
  { code: 34, name: 'Bordj Bou Arréridj', zone: 'nord' },
  { code: 35, name: 'Boumerdès', zone: 'centre' },
  { code: 36, name: 'El Tarf', zone: 'nord' },
  { code: 37, name: 'Tindouf', zone: 'grandSud' },
  { code: 38, name: 'Tissemsilt', zone: 'hautsPlateaux' },
  { code: 39, name: 'El Oued', zone: 'sud' },
  { code: 40, name: 'Khenchela', zone: 'hautsPlateaux' },
  { code: 41, name: 'Souk Ahras', zone: 'nord' },
  { code: 42, name: 'Tipaza', zone: 'centre' },
  { code: 43, name: 'Mila', zone: 'nord' },
  { code: 44, name: 'Aïn Defla', zone: 'centre' },
  { code: 45, name: 'Naâma', zone: 'hautsPlateaux' },
  { code: 46, name: 'Aïn Témouchent', zone: 'nord' },
  { code: 47, name: 'Ghardaïa', zone: 'sud' },
  { code: 48, name: 'Relizane', zone: 'nord' },
  { code: 49, name: 'Timimoun', zone: 'sud' },
  { code: 50, name: 'Bordj Badji Mokhtar', zone: 'grandSud' },
  { code: 51, name: 'Ouled Djellal', zone: 'hautsPlateaux' },
  { code: 52, name: 'Béni Abbès', zone: 'sud' },
  { code: 53, name: 'In Salah', zone: 'grandSud' },
  { code: 54, name: 'In Guezzam', zone: 'grandSud' },
  { code: 55, name: 'Touggourt', zone: 'sud' },
  { code: 56, name: 'Djanet', zone: 'grandSud' },
  { code: 57, name: "El M'Ghair", zone: 'sud' },
  { code: 58, name: 'El Meniaa', zone: 'sud' },
];
