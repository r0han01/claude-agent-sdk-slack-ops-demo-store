import type { Store } from "./store.js";
import type { Cents, DiscountCode } from "./types.js";

export class DiscountError extends Error {}

export function findCode(store: Store, code: string): DiscountCode | undefined {
  const normalized = code.trim().toUpperCase();
  return store.discountCodes.find((d) => d.code === normalized);
}

/** Works out the discount for a cart. Throws DiscountError if the code can't be used. */
export function applyDiscount(
  store: Store,
  code: string,
  subtotalCents: Cents,
  customerId: number,
  now: Date = new Date(),
): Cents {
  const discount = findCode(store, code);
  if (!discount) throw new DiscountError(`Unknown discount code: ${code}`);
  if (discount.expiresAt && discount.expiresAt <= now) throw new DiscountError("Discount code has expired");
  if (discount.minSubtotalCents !== undefined && subtotalCents < discount.minSubtotalCents) {
    throw new DiscountError("Cart total too low for this code");
  }
  if (
    discount.singleUsePerCustomer &&
    store.redemptions.some((r) => r.code === discount.code && r.customerId === customerId)
  ) {
    throw new DiscountError("Discount code already used");
  }

  const amount =
    discount.type === "percent" ? Math.round((subtotalCents * discount.value) / 100) : discount.value;
  return Math.min(amount, subtotalCents);
}

export function recordRedemption(store: Store, code: string, customerId: number, orderId: number): void {
  const discount = findCode(store, code);
  if (!discount) return;
  store.redemptions.push({ code: discount.code, customerId, orderId });
}
