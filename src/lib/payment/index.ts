import { ENABLED_PAYMENT_METHODS } from '@/config/payment';
import type { PaymentMethod } from '@/types/order';
import { cashOnDelivery } from './simulated';
import type { PaymentProvider } from './types';

export type { PaymentProvider, PaymentStart } from './types';

/**
 * Moyens de paiement branchés. CIB et Edahabia arriveront avec la passerelle
 * (nouveau provider ajouté ici, sans toucher aux composants).
 */
const PROVIDERS: Partial<Record<PaymentMethod, PaymentProvider>> = {
  cod: cashOnDelivery,
};

export function getPaymentProvider(method: PaymentMethod): PaymentProvider | undefined {
  const provider = ENABLED_PAYMENT_METHODS.includes(method) ? PROVIDERS[method] : undefined;
  return provider?.isAvailable() ? provider : undefined;
}
