import type { PaymentMethod } from '@/types/order.ts';

/**
 * Moyens de paiement acceptés (navigateur ET serveur). CIB / Edahabia seront ajoutés
 * ici quand leur provider (passerelle SATIM) sera branché.
 */
export const ENABLED_PAYMENT_METHODS: PaymentMethod[] = ['cod'];
