/**
 * Création d'une commande côté serveur (edge function `create-order`).
 * Les prix, la remise et la livraison sont recalculés depuis la base : le total envoyé
 * par le navigateur n'existe même pas dans la requête.
 */
import { ENABLED_PAYMENT_METHODS } from '@/config/payment.ts';
import type { PromoDefinition } from '@/config/promo.ts';
import { computeOrder, orderNumber, snapshotLines } from '@/lib/checkout.ts';
import type { Catalog } from '@/types/catalog.ts';
import type { Order } from '@/types/order.ts';
import { handleJsonPost } from './http.ts';
import { parseOrderInput } from './orderInput.ts';

/** Accès aux données, injecté (Supabase en production, faux en test). */
export interface CreateOrderDeps {
  /** Produits actifs demandés, avec leurs variantes actives */
  loadCatalog: (productIds: string[]) => Promise<Catalog>;
  /** Code promo actif, ou null */
  findPromo: (code: string) => Promise<PromoDefinition | null>;
  /** 'duplicate' si le numéro de commande existe déjà (on en tire un autre) */
  insertOrder: (order: Order) => Promise<'ok' | 'duplicate'>;
  now: () => Date;
  random: () => number;
  uuid: () => string;
}

export type CreateOrderError = 'invalid' | 'emptyCart' | 'unavailable' | 'payment' | 'server';

/** Tentatives de numérotation en cas de collision (très improbable : 32⁶ numéros par an). */
const NUMBER_ATTEMPTS = 5;

export async function createOrder(body: unknown, deps: CreateOrderDeps): Promise<{ status: number; body: { order: Order } | { error: CreateOrderError } }> {
  const input = parseOrderInput(body);
  if (!input) return { status: 400, body: { error: 'invalid' } };
  if (input.kind === 'order' && !ENABLED_PAYMENT_METHODS.includes(input.paymentMethod)) {
    return { status: 422, body: { error: 'payment' } };
  }

  const catalog = await deps.loadCatalog([...new Set(input.items.map((item) => item.productId))]);
  const promo = input.promoCode ? await deps.findPromo(input.promoCode) : null;
  const now = deps.now();
  const { lines, totals, shipping, appliedPromo } = computeOrder(
    input.items,
    catalog,
    { wilayaCode: input.address.wilayaCode, method: input.deliveryMethod },
    input.promoCode,
    promo ? [promo] : [],
    now,
  );
  if (lines.length === 0 || !shipping) return { status: 422, body: { error: 'emptyCart' } };
  // Un article retiré de la vente depuis l'ajout au panier : le client doit revoir son panier
  if (lines.length < input.items.length) return { status: 409, body: { error: 'unavailable' } };

  const base: Omit<Order, 'number'> = {
    ...input,
    id: deps.uuid(),
    createdAt: now.toISOString(),
    status: 'pending',
    lines: snapshotLines(lines),
    totals,
    estimatedDays: shipping.estimatedDays,
    ...(appliedPromo ? { appliedPromo } : {}),
  };
  for (let attempt = 0; attempt < NUMBER_ATTEMPTS; attempt += 1) {
    const order: Order = { ...base, number: orderNumber(input.kind, now, deps.random) };
    if ((await deps.insertOrder(order)) === 'ok') return { status: 201, body: { order } };
  }
  return { status: 500, body: { error: 'server' } };
}

/** Point d'entrée HTTP (CORS, POST, JSON). */
export function handleCreateOrder(request: Request, deps: CreateOrderDeps): Promise<Response> {
  return handleJsonPost(request, (body) => createOrder(body, deps));
}
