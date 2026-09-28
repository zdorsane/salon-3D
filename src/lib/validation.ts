/**
 * Validation des coordonnées de commande (partagée avec l'edge function en phase 08).
 * Les messages sont des clés i18n `checkout.errors.*`.
 */

/**
 * Normalise un numéro algérien au format national 0XXXXXXXXX.
 * Accepte espaces, tirets, points, et les préfixes +213 / 00213 / 213.
 * Mobile : 05, 06, 07 + 8 chiffres ; fixe : 0 + indicatif (2, 3, 4) + 7 chiffres.
 * Retourne null si le numéro n'est pas valide.
 */
export function normalizeAlgerianPhone(input: string): string | null {
  let digits = input.replace(/[\s.\-()]/g, '');
  if (digits.startsWith('+213')) digits = `0${digits.slice(4)}`;
  else if (digits.startsWith('00213')) digits = `0${digits.slice(5)}`;
  else if (digits.startsWith('213') && digits.length === 12) digits = `0${digits.slice(3)}`;
  if (/^0[567]\d{8}$/.test(digits)) return digits;
  if (/^0[234]\d{7}$/.test(digits)) return digits;
  return null;
}

/** Affichage lisible : 0555 12 34 56 (mobile) ou 021 23 45 67 (fixe). */
export function formatAlgerianPhone(phone: string): string {
  if (phone.length === 10) return `${phone.slice(0, 4)} ${phone.slice(4, 6)} ${phone.slice(6, 8)} ${phone.slice(8)}`;
  return `${phone.slice(0, 3)} ${phone.slice(3, 5)} ${phone.slice(5, 7)} ${phone.slice(7)}`;
}

export function isValidEmail(input: string): boolean {
  return /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(input.trim());
}

export type FieldError = 'required' | 'phone' | 'email' | 'tooLong';

/** Longueur maximale d'un champ texte libre. */
export const MAX_FIELD_LENGTH = 200;

export function checkRequiredText(value: string): FieldError | null {
  const trimmed = value.trim();
  if (trimmed === '') return 'required';
  if (trimmed.length > MAX_FIELD_LENGTH) return 'tooLong';
  return null;
}
