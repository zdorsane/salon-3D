import { useOrdersStore } from '@/store/useOrdersStore';
import type { Order, OrderInput } from '@/types/order';
import { computeOrder, orderNumber, snapshotLines } from '../checkout';
import { getCatalog } from '../useCatalog';
import { findWilaya } from '../shipping';
import { normalizeAlgerianPhone } from '../validation';
import { orderToRow, rowToTracking } from '@/server/orderRows';
import { normalizeOrderNumber } from '@/server/trackOrder';
import { OrderError, type OrderService } from './types';

/**
 * Service de démonstration : recalcule tout depuis le catalogue (comme le serveur)
 * et garde les commandes dans le navigateur ; le suivi ne voit que les commandes de cet appareil.
 */
export const localOrderService: OrderService = {
  async create(input: OrderInput): Promise<Order> {
    const catalog = await getCatalog();
    if (!findWilaya(input.address.wilayaCode)) throw new OrderError('wilaya');
    const { lines, totals, shipping, appliedPromo } = computeOrder(
      input.items,
      catalog,
      { wilayaCode: input.address.wilayaCode, method: input.deliveryMethod },
      input.promoCode,
    );
    if (lines.length === 0 || !shipping) throw new OrderError('emptyCart');

    const now = new Date();
    const order: Order = {
      ...input,
      id: crypto.randomUUID(),
      number: orderNumber(input.kind, now),
      createdAt: now.toISOString(),
      status: 'pending',
      lines: snapshotLines(lines),
      totals,
      estimatedDays: shipping.estimatedDays,
      ...(appliedPromo ? { appliedPromo } : {}),
    };
    useOrdersStore.getState().save(order);
    return order;
  },
  track(number, phone) {
    const normalizedPhone = normalizeAlgerianPhone(phone);
    const order = useOrdersStore
      .getState()
      .orders.find((entry) => entry.number === normalizeOrderNumber(number) && entry.customer.phone === normalizedPhone);
    const tracking = order ? rowToTracking(orderToRow(order), [{ status: order.status, created_at: order.createdAt }]) : null;
    return Promise.resolve(tracking);
  },
};
