import { describe, expect, it } from "vitest";
import { FLAT_SHIPPING_CENTS, shippingCost } from "../src/shipping.js";

describe("shipping", () => {
  it("is free at $60", () => {
    expect(shippingCost(6000, 0)).toBe(0);
  });

  it("is free at exactly $50", () => {
    expect(shippingCost(5000, 0)).toBe(0);
  });

  it("charges the flat rate under $50", () => {
    expect(shippingCost(3000, 0)).toBe(FLAT_SHIPPING_CENTS);
  });

  it("is still free when a discount leaves the order above $50", () => {
    expect(shippingCost(8000, 1000)).toBe(0);
  });

  it("charges the flat rate when a discount takes the order under $50", () => {
    expect(shippingCost(5200, 500)).toBe(FLAT_SHIPPING_CENTS);
  });

  it("is free when a discount leaves the order at exactly $50", () => {
    expect(shippingCost(5500, 500)).toBe(0);
  });
});
