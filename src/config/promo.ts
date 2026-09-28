/**
 * Codes promo de démonstration (remplacés par la table Supabase en phase 08).
 * Montants en dinars entiers ; la remise définitive est recalculée côté serveur.
 */
export interface PromoDefinition {
  code: string;
  kind: 'percent' | 'fixed';
  /** Pourcentage (0–100) ou montant en DA */
  value: number;
  minSubtotal?: number;
  minItems?: number;
  /** Plafond de remise en DA (codes en pourcentage) */
  maxDiscount?: number;
  /** Date ISO après laquelle le code n'est plus valable */
  expiresAt?: string;
}

export const PROMO_CODES: PromoDefinition[] = [
  { code: 'BIENVENUE10', kind: 'percent', value: 10, minSubtotal: 50_000, maxDiscount: 30_000 },
  { code: 'SALUNA5000', kind: 'fixed', value: 5_000, minSubtotal: 100_000 },
  { code: 'SALONCOMPLET', kind: 'percent', value: 15, minItems: 8 },
];
