import type { Order, PaymentMethod } from '@/types/order';

/**
 * Résultat du démarrage d'un paiement :
 * - `onDelivery` : rien à payer maintenant (paiement à la livraison) ;
 * - `redirect` : aller sur la page de la passerelle (CIB / Edahabia). Aucune donnée de
 *   carte ne transite par nos serveurs.
 */
export type PaymentStart = { kind: 'onDelivery' } | { kind: 'redirect'; url: string };

/** Moyen de paiement branchable (simulé aujourd'hui, passerelle SATIM demain). */
export interface PaymentProvider {
  method: PaymentMethod;
  isAvailable: () => boolean;
  start: (order: Order) => Promise<PaymentStart>;
}
