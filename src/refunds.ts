import type { Store } from "./store.js";
import type { Refund } from "./types.js";

export class RefundError extends Error {}

/** Refunds one line item of an order. The refundable amount is what was paid for that line. */
export function refundItem(store: Store, orderId: number, orderItemId: number, reason: string): Refund {
  const order = store.getOrder(orderId);
  const item = order.items.find((i) => i.id === orderItemId);
  if (!item) throw new RefundError(`Item ${orderItemId} is not on order ${orderId}`);
  if (!store.payments.some((p) => p.orderId === orderId)) throw new RefundError("Order was never paid");

  // What was paid for this line: its price minus its pro-rata share of any order discount.
  // The share is rounded up so refunds across all lines never exceed what was charged.
  const lineCents = item.unitPriceCents * item.qty;
  const discountShare =
    order.subtotalCents > 0 ? Math.ceil((order.discountCents * lineCents) / order.subtotalCents) : 0;
  const linePaidCents = lineCents - discountShare;

  const orderRefunds = store.refunds.filter((r) => r.orderId === orderId);
  const sum = (rs: Refund[]) => rs.reduce((s, r) => s + r.amountCents, 0);
  const itemRefunded = sum(orderRefunds.filter((r) => r.orderItemId === orderItemId));
  // Never refund more across the order than was paid for its items.
  const orderRemaining = order.totalCents - order.shippingCents - sum(orderRefunds);
  const amountCents = Math.min(linePaidCents - itemRefunded, orderRemaining);
  if (amountCents <= 0) throw new RefundError("Item already fully refunded");

  const refund: Refund = { id: store.nextId("refund"), orderId, orderItemId, amountCents, reason };
  store.refunds.push(refund);
  return refund;
}
