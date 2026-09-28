import type { DeliveryMethod } from '@/config/shipping.ts';
import type { LocalizedText } from './catalog.ts';

/** Types partagés des commandes (navigateur, edge functions, base de données). */

export const PAYMENT_METHODS = ['cod', 'cib', 'edahabia'] as const;
/** cod = paiement à la livraison ; cib / edahabia = carte via passerelle (plus tard) */
export type PaymentMethod = (typeof PAYMENT_METHODS)[number];

/** `order` = commande ferme ; `quote` = demande de devis (pas de paiement). */
export type OrderKind = 'order' | 'quote';

export const ORDER_STATUSES = ['pending', 'confirmed', 'preparing', 'shipped', 'delivered', 'cancelled'] as const;
export type OrderStatus = (typeof ORDER_STATUSES)[number];

export interface Customer {
  firstName: string;
  lastName: string;
  /** Normalisé au format 0XXXXXXXXX */
  phone: string;
  email?: string;
}

export interface ShippingAddress {
  wilayaCode: number;
  commune: string;
  street: string;
  notes?: string;
}

export interface OrderItemInput {
  productId: string;
  variantId: string;
  quantity: number;
}

/** Ce que le navigateur envoie : aucun prix (recalculé côté serveur). */
export interface OrderInput {
  kind: OrderKind;
  customer: Customer;
  address: ShippingAddress;
  deliveryMethod: DeliveryMethod;
  paymentMethod: PaymentMethod;
  items: OrderItemInput[];
  promoCode?: string;
}

/** Ligne figée au moment de la commande (le catalogue peut changer ensuite). */
export interface OrderLine {
  productId: string;
  variantId: string;
  sku: string;
  name: LocalizedText;
  variantLabel: LocalizedText;
  unitPrice: number;
  quantity: number;
}

export interface OrderTotals {
  subtotal: number;
  discount: number;
  shipping: number;
  total: number;
}

export interface Order extends OrderInput {
  id: string;
  /** SAL-AAAA-XXXXXX (commande) ou DEV-AAAA-XXXXXX (devis) */
  number: string;
  createdAt: string;
  status: OrderStatus;
  lines: OrderLine[];
  totals: OrderTotals;
  /** Code promo réellement appliqué (absent si refusé) */
  appliedPromo?: string;
  estimatedDays: [number, number];
}

/** Vue publique du suivi (renvoyée par `track-order` : ni adresse ni téléphone). */
export interface OrderTracking {
  number: string;
  kind: OrderKind;
  status: OrderStatus;
  createdAt: string;
  wilayaCode: number;
  deliveryMethod: DeliveryMethod;
  estimatedDays: [number, number];
  totals: OrderTotals;
  lines: { name: LocalizedText; variantLabel: LocalizedText; quantity: number }[];
  /** Historique des statuts, du plus ancien au plus récent */
  events: { status: OrderStatus; at: string }[];
}
