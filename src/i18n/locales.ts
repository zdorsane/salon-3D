import { en } from './en';
import { fr } from './fr';
import type { Messages } from './translate';

/** Définition d'une langue ; `dir` prépare l'arrivée de l'arabe (rtl). */
export interface LocaleDefinition {
  readonly messages: Messages;
  readonly dir: 'ltr' | 'rtl';
  readonly label: string;
  readonly shortLabel: string;
}

export const LOCALES = {
  fr: { messages: fr, dir: 'ltr', label: 'Français', shortLabel: 'FR' },
  en: { messages: en, dir: 'ltr', label: 'English', shortLabel: 'EN' },
} as const satisfies Record<string, LocaleDefinition>;

export type Locale = keyof typeof LOCALES;

export const DEFAULT_LOCALE: Locale = 'fr';

export const LOCALE_ORDER = Object.keys(LOCALES) as Locale[];

/** Langue suivante dans le cycle du sélecteur. */
export function nextLocale(current: Locale): Locale {
  const index = LOCALE_ORDER.indexOf(current);
  return LOCALE_ORDER[(index + 1) % LOCALE_ORDER.length] ?? DEFAULT_LOCALE;
}
