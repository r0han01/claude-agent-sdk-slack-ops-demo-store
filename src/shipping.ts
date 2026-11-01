import type { Cents } from "./types.js";

export const FREE_SHIPPING_THRESHOLD_CENTS: Cents = 5000;
export const FLAT_SHIPPING_CENTS: Cents = 599;

/** Orders of $50 or more (after discounts) ship free. */
export function shippingCost(subtotalCents: Cents, discountCents: Cents): Cents {
  return subtotalCents - discountCents >= FREE_SHIPPING_THRESHOLD_CENTS ? 0 : FLAT_SHIPPING_CENTS;
}
