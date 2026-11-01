import { applyDiscount } from "./discounts.js";
import { chargeOrder } from "./payments.js";
import { shippingCost } from "./shipping.js";
import type { Store } from "./store.js";
import type { Order, OrderItem } from "./types.js";

export interface CheckoutRequest {
  customerId: number;
  items: { productId: number; qty: number }[];
  discountCode?: string;
  idempotencyKey: string;
}

export class CheckoutError extends Error {}

export function checkout(store: Store, req: CheckoutRequest, now: Date = new Date()): Order {
  // A retried or double-clicked "Pay" sends the same key: return the order it already created.
  const previous = store.payments.find((p) => p.idempotencyKey === req.idempotencyKey);
  if (previous) {
    const order = store.getOrder(previous.orderId);
    if (order.customerId !== req.customerId) {
      throw new CheckoutError("Idempotency key was already used by another checkout");
    }
    return order;
  }

  if (req.items.length === 0) throw new CheckoutError("Cart is empty");
  if (!store.customers.some((c) => c.id === req.customerId)) throw new CheckoutError("Unknown customer");

  for (const line of req.items) {
    if (!Number.isInteger(line.qty) || line.qty <= 0) throw new CheckoutError("Quantity must be a positive whole number");
    const product = store.getProduct(line.productId);
    if (product.stock < line.qty) throw new CheckoutError(`Not enough stock for ${product.name}`);
  }

  const orderId = store.nextId("order");
  const items: OrderItem[] = req.items.map((line) => {
    const product = store.getProduct(line.productId);
    return {
      id: store.nextId("orderItem"),
      orderId,
      productId: product.id,
      qty: line.qty,
      unitPriceCents: product.priceCents,
    };
  });

  const subtotalCents = items.reduce((sum, i) => sum + i.unitPriceCents * i.qty, 0);
  const discountCents = req.discountCode
    ? applyDiscount(store, req.discountCode, subtotalCents, req.customerId, now)
    : 0;
  const shippingCents = shippingCost(subtotalCents, discountCents);
  const totalCents = subtotalCents - discountCents + shippingCents;

  const order: Order = {
    id: orderId,
    customerId: req.customerId,
    items,
    subtotalCents,
    discountCents,
    discountCode: req.discountCode?.trim().toUpperCase() ?? null,
    shippingCents,
    totalCents,
    createdAt: now,
  };

  for (const item of items) store.getProduct(item.productId).stock -= item.qty;
  store.orders.push(order);
  chargeOrder(store, order.id, totalCents, req.idempotencyKey);
  return order;
}
