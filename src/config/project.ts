import { ENV } from '@/lib/env';

/** Identité du magasin et réglages commerciaux globaux. */
export const PROJECT = {
  storeName: 'Saluna',
  /** Préfixe des clés de stockage local (zustand persist) */
  storageKeyPrefix: 'saluna',
  /** Numéro WhatsApp international sans « + » */
  whatsappNumber: ENV.storeWhatsapp ?? '213550000000',
  siteUrl: ENV.publicSiteUrl ?? 'http://localhost:5173',
  currency: { code: 'DZD', symbol: 'DA', locale: 'fr-DZ' },
} as const;
