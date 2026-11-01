import type { Store } from "./store.js";
import type { Cents, Payment } from "./types.js";

/**
 * Charges the customer's card for an order.
 * The idempotency key comes from the checkout page, so a retried or double-clicked
 * "Pay" sends the same key.
 */
export function chargeOrder(store: Store, orderId: number, amountCents: Cents, idempotencyKey: string): Payment {
  if (amountCents <= 0) throw new Error("Charge amount must be positive");
  const existing = store.payments.find((p) => p.idempotencyKey === idempotencyKey);
  if (existing) {
    if (existing.orderId !== orderId || existing.amountCents !== amountCents) {
      throw new Error("Idempotency key was already used for a different charge");
    }
    return existing;
  }
  const payment: Payment = {
    id: store.nextId("payment"),
    orderId,
    amountCents,
    idempotencyKey,
    status: "succeeded",
  };
  store.payments.push(payment);
  return payment;
}
