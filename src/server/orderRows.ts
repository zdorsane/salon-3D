/**
 * Conversion commande ↔ ligne de la table `orders` (et `order_events` pour le suivi).
 * Exécuté par les edge functions (Deno) : imports avec extension `.ts`.
 */
import type { DeliveryMethod } from '@/config/shipping.ts';
import type { Order, OrderKind, OrderLine, OrderStatus, OrderTracking, PaymentMethod } from '@/types/order.ts';

export interface OrderRow {
  id: string;
  number: string;
  kind: OrderKind;
  status: OrderStatus;
  customer_first_name: string;
  customer_last_name: string;
  customer_phone: string;
  customer_email: string | null;
  wilaya_code: number;
  commune: string;
  street: string;
  address_notes: string | null;
  delivery_method: DeliveryMethod;
  payment_method: PaymentMethod;
  items: Order['items'];
  lines: OrderLine[];
  subtotal: number;
  discount: number;
  shipping: number;
  total: number;
  promo_code: string | null;
  applied_promo: string | null;
  estimated_days_min: number;
  estimated_days_max: number;
  created_at: string;
}

export interface OrderEventRow {
  status: OrderStatus;
  created_at: string;
}

export function orderToRow(order: Order): OrderRow {
  return {
    id: order.id,
    number: order.number,
    kind: order.kind,
    status: order.status,
    customer_first_name: order.customer.firstName,
    customer_last_name: order.customer.lastName,
    customer_phone: order.customer.phone,
    customer_email: order.customer.email ?? null,
    wilaya_code: order.address.wilayaCode,
    commune: order.address.commune,
    street: order.address.street,
    address_notes: order.address.notes ?? null,
    delivery_method: order.deliveryMethod,
    payment_method: order.paymentMethod,
    items: order.items,
    lines: order.lines,
    subtotal: order.totals.subtotal,
    discount: order.totals.discount,
    shipping: order.totals.shipping,
    total: order.totals.total,
    promo_code: order.promoCode ?? null,
    applied_promo: order.appliedPromo ?? null,
    estimated_days_min: order.estimatedDays[0],
    estimated_days_max: order.estimatedDays[1],
    created_at: order.createdAt,
  };
}

/** Vue publique du suivi : ni adresse, ni téléphone, ni e-mail. */
export function rowToTracking(row: OrderRow, events: OrderEventRow[]): OrderTracking {
  return {
    number: row.number,
    kind: row.kind,
    status: row.status,
    createdAt: row.created_at,
    wilayaCode: row.wilaya_code,
    deliveryMethod: row.delivery_method,
    estimatedDays: [row.estimated_days_min, row.estimated_days_max],
    totals: { subtotal: row.subtotal, discount: row.discount, shipping: row.shipping, total: row.total },
    lines: row.lines.map((line) => ({ name: line.name, variantLabel: line.variantLabel, quantity: line.quantity })),
    events: [...events]
      .sort((a, b) => a.created_at.localeCompare(b.created_at))
      .map((event) => ({ status: event.status, at: event.created_at })),
  };
}
