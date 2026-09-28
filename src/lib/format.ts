import { PROJECT } from '@/config/project';
import type { Locale } from '@/i18n/locales';

/** Espace insécable entre le montant et la devise */
const NBSP = ' ';

const NUMBER_LOCALES: Record<Locale, string> = { fr: 'fr-FR', en: 'en-US' };

/** Prix en dinars entiers : « 245 000 DA ». */
export function formatPrice(amount: number, locale: Locale): string {
  const value = new Intl.NumberFormat(NUMBER_LOCALES[locale], { maximumFractionDigits: 0 }).format(amount);
  return `${value}${NBSP}${PROJECT.currency.symbol}`;
}

/** Nombre avec une décimale au plus (dimensions, notes). */
export function formatNumber(value: number, locale: Locale): string {
  return new Intl.NumberFormat(NUMBER_LOCALES[locale], { maximumFractionDigits: 1 }).format(value);
}

/** Libellé de la langue active pour les textes du catalogue. */
export function localized(text: { fr: string; en: string }, locale: Locale): string {
  return text[locale];
}

/** Date et heure lisibles : « 28 sept. 2026, 14:05 ». */
export function formatDateTime(iso: string, locale: Locale): string {
  return new Intl.DateTimeFormat(NUMBER_LOCALES[locale], { dateStyle: 'medium', timeStyle: 'short' }).format(new Date(iso));
}
