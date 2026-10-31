import type { Store } from "./store.js";
import type { Refund } from "./types.js";

export class RefundError extends Error {}

/** Refunds one line item of an order. The refundable amount is what was paid for that line. */
export function refundItem(store: Store, orderId: number, orderItemId: number, reason: string): Refund {
  const order = store.getOrder(orderId);
  const item = order.items.find((i) => i.id === orderItemId);
  if (!item) throw new RefundError(`Item ${orderItemId} is not on order ${orderId}`);
  if (!store.payments.some((p) => p.orderId === orderId)) throw new RefundError("Order was never paid");

  const alreadyRefunded = store.refunds
    .filter((r) => r.orderId === orderId)
    .reduce((sum, r) => sum + r.amountCents, 0);
  const amountCents = order.totalCents - alreadyRefunded;
  if (amountCents <= 0) throw new RefundError("Item already fully refunded");

  const refund: Refund = { id: store.nextId("refund"), orderId, orderItemId, amountCents, reason };
  store.refunds.push(refund);
  return refund;
}
