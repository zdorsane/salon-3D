/**
 * Suivi de commande (edge function `track-order`) : numéro + téléphone de la commande.
 * Réponse identique que le numéro ou le téléphone soit faux (ne révèle rien).
 */
import { normalizeAlgerianPhone } from '@/lib/validation.ts';
import type { OrderTracking } from '@/types/order.ts';
import { handleJsonPost } from './http.ts';

export interface TrackOrderDeps {
  findTracking: (number: string, phone: string) => Promise<OrderTracking | null>;
}

const MAX_NUMBER_LENGTH = 32;

/** Numéro saisi → forme canonique (majuscules, sans espaces). */
export function normalizeOrderNumber(input: string): string {
  return input.replace(/\s+/g, '').toUpperCase();
}

export async function trackOrder(body: unknown, deps: TrackOrderDeps): Promise<{ status: number; body: { tracking: OrderTracking } | { error: 'invalid' | 'notFound' } }> {
  if (typeof body !== 'object' || body === null) return { status: 400, body: { error: 'invalid' } };
  const { number, phone } = body as Record<string, unknown>;
  if (typeof number !== 'string' || typeof phone !== 'string' || number.length > MAX_NUMBER_LENGTH) {
    return { status: 400, body: { error: 'invalid' } };
  }
  const normalizedPhone = normalizeAlgerianPhone(phone);
  const normalizedNumber = normalizeOrderNumber(number);
  if (!normalizedPhone || normalizedNumber === '') return { status: 404, body: { error: 'notFound' } };

  const tracking = await deps.findTracking(normalizedNumber, normalizedPhone);
  return tracking ? { status: 200, body: { tracking } } : { status: 404, body: { error: 'notFound' } };
}

export function handleTrackOrder(request: Request, deps: TrackOrderDeps): Promise<Response> {
  return handleJsonPost(request, (body) => trackOrder(body, deps));
}
