/**
 * Validation stricte d'une commande reçue par le serveur (le navigateur n'est jamais cru).
 * Exécuté par l'edge function `create-order` (Deno) : imports avec extension `.ts`.
 */
import { DELIVERY_METHODS } from '@/config/shipping.ts';
import { CART_MAX_QUANTITY } from '@/config/shop.ts';
import { normalizePromoCode } from '@/lib/promo.ts';
import { findWilaya } from '@/lib/shipping.ts';
import { isValidEmail, MAX_FIELD_LENGTH, normalizeAlgerianPhone } from '@/lib/validation.ts';
import { PAYMENT_METHODS, type OrderInput, type OrderItemInput } from '@/types/order.ts';

/** Nombre maximal de lignes par commande (protection contre les requêtes abusives). */
export const MAX_ORDER_LINES = 50;
const MAX_ID_LENGTH = 100;
const MAX_PROMO_LENGTH = 40;

type Json = Record<string, unknown>;

function isRecord(value: unknown): value is Json {
  return typeof value === 'object' && value !== null && !Array.isArray(value);
}

/** Texte nettoyé ; `required` refuse le vide. null = invalide. */
function cleanText(value: unknown, required: boolean): string | null {
  if (value === undefined || value === null) return required ? null : '';
  if (typeof value !== 'string') return null;
  const trimmed = value.trim();
  if (trimmed.length > MAX_FIELD_LENGTH || (required && trimmed === '')) return null;
  return trimmed;
}

function oneOf<T extends string>(value: unknown, allowed: readonly T[]): T | null {
  return typeof value === 'string' && (allowed as readonly string[]).includes(value) ? (value as T) : null;
}

function parseItems(value: unknown): OrderItemInput[] | null {
  if (!Array.isArray(value) || value.length === 0 || value.length > MAX_ORDER_LINES) return null;
  const items: OrderItemInput[] = [];
  for (const entry of value) {
    if (!isRecord(entry)) return null;
    const { productId, variantId, quantity } = entry;
    if (typeof productId !== 'string' || productId === '' || productId.length > MAX_ID_LENGTH) return null;
    if (typeof variantId !== 'string' || variantId === '' || variantId.length > MAX_ID_LENGTH) return null;
    if (typeof quantity !== 'number' || !Number.isInteger(quantity) || quantity < 1 || quantity > CART_MAX_QUANTITY) return null;
    // Une même variante en double est fusionnée (quantité plafonnée)
    const existing = items.find((item) => item.variantId === variantId);
    if (existing) existing.quantity = Math.min(CART_MAX_QUANTITY, existing.quantity + quantity);
    else items.push({ productId, variantId, quantity });
  }
  return items;
}

/** Données brutes → OrderInput valide et normalisé, ou null si quoi que ce soit est invalide. */
export function parseOrderInput(body: unknown): OrderInput | null {
  if (!isRecord(body) || !isRecord(body.customer) || !isRecord(body.address)) return null;
  const kind = oneOf(body.kind, ['order', 'quote'] as const);
  const deliveryMethod = oneOf(body.deliveryMethod, DELIVERY_METHODS);
  const paymentMethod = oneOf(body.paymentMethod, PAYMENT_METHODS);
  const items = parseItems(body.items);
  if (!kind || !deliveryMethod || !paymentMethod || !items) return null;

  const firstName = cleanText(body.customer.firstName, true);
  const lastName = cleanText(body.customer.lastName, true);
  const phone = typeof body.customer.phone === 'string' ? normalizeAlgerianPhone(body.customer.phone) : null;
  const email = cleanText(body.customer.email, false);
  if (!firstName || !lastName || !phone || email === null || (email !== '' && !isValidEmail(email))) return null;

  const wilayaCode = body.address.wilayaCode;
  const addressRequired = kind === 'order';
  const commune = cleanText(body.address.commune, addressRequired);
  const street = cleanText(body.address.street, addressRequired);
  const notes = cleanText(body.address.notes, false);
  if (typeof wilayaCode !== 'number' || !findWilaya(wilayaCode) || commune === null || street === null || notes === null) return null;

  let promoCode: string | undefined;
  if (body.promoCode !== undefined && body.promoCode !== null) {
    if (typeof body.promoCode !== 'string' || body.promoCode.length > MAX_PROMO_LENGTH) return null;
    promoCode = normalizePromoCode(body.promoCode) || undefined;
  }

  return {
    kind,
    customer: { firstName, lastName, phone, ...(email ? { email } : {}) },
    address: { wilayaCode, commune, street, ...(notes ? { notes } : {}) },
    deliveryMethod,
    paymentMethod,
    items,
    ...(promoCode ? { promoCode } : {}),
  };
}
