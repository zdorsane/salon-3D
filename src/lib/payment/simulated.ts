import type { PaymentProvider } from './types';

/** Paiement à la livraison : la commande est confirmée par téléphone puis payée au livreur. */
export const cashOnDelivery: PaymentProvider = {
  method: 'cod',
  isAvailable: () => true,
  start: () => Promise.resolve({ kind: 'onDelivery' }),
};
