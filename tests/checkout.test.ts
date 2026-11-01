import { describe, expect, it } from "vitest";
import { checkout } from "../src/checkout.js";
import { FLAT_SHIPPING_CENTS } from "../src/shipping.js";
import { seedStore } from "./helpers.js";

const NOW = new Date("2026-10-01");

describe("checkout", () => {
  it("totals a cart under $50 with flat shipping", () => {
    const { store, jane } = seedStore();
    const order = checkout(store, { customerId: jane.id, items: [{ productId: 1, qty: 2 }], idempotencyKey: "k1" }, NOW);
    expect(order.subtotalCents).toBe(3600);
    expect(order.shippingCents).toBe(FLAT_SHIPPING_CENTS);
    expect(order.totalCents).toBe(3600 + FLAT_SHIPPING_CENTS);
  });

  it("ships free over $50", () => {
    const { store, jane } = seedStore();
    const order = checkout(store, { customerId: jane.id, items: [{ productId: 2, qty: 1 }], idempotencyKey: "k1" }, NOW);
    expect(order.shippingCents).toBe(0);
    expect(order.totalCents).toBe(6000);
  });

  it("applies a discount code", () => {
    const { store, jane } = seedStore();
    const order = checkout(
      store,
      { customerId: jane.id, items: [{ productId: 2, qty: 1 }], discountCode: "save10", idempotencyKey: "k1" },
      NOW,
    );
    expect(order.discountCents).toBe(600);
    expect(order.discountCode).toBe("SAVE10");
    expect(order.totalCents).toBe(5400);
  });

  it("charges the order total once", () => {
    const { store, jane } = seedStore();
    const order = checkout(store, { customerId: jane.id, items: [{ productId: 3, qty: 2 }], idempotencyKey: "k1" }, NOW);
    expect(store.payments).toHaveLength(1);
    expect(store.payments[0]!.amountCents).toBe(order.totalCents);
  });

  it("charges once when Pay is double-clicked with the same idempotency key", () => {
    const { store, jane } = seedStore();
    const req = { customerId: jane.id, items: [{ productId: 2, qty: 1 }], idempotencyKey: "k1" };
    const first = checkout(store, req, NOW);
    const second = checkout(store, req, NOW);
    expect(second).toBe(first);
    expect(store.payments).toHaveLength(1);
    expect(store.orders).toHaveLength(1);
    expect(store.getProduct(2).stock).toBe(9);
  });

  it("charges separately for different idempotency keys", () => {
    const { store, jane } = seedStore();
    checkout(store, { customerId: jane.id, items: [{ productId: 2, qty: 1 }], idempotencyKey: "k1" }, NOW);
    checkout(store, { customerId: jane.id, items: [{ productId: 2, qty: 1 }], idempotencyKey: "k2" }, NOW);
    expect(store.payments).toHaveLength(2);
    expect(store.orders).toHaveLength(2);
  });

  it("refuses an idempotency key already used by another customer", () => {
    const { store, jane } = seedStore();
    checkout(store, { customerId: jane.id, items: [{ productId: 2, qty: 1 }], idempotencyKey: "k1" }, NOW);
    store.customers.push({ id: 99, name: "Other", email: "other@email.com", passwordHash: "x" });
    expect(() =>
      checkout(store, { customerId: 99, items: [{ productId: 2, qty: 1 }], idempotencyKey: "k1" }, NOW),
    ).toThrow(/idempotency key/i);
    expect(store.payments).toHaveLength(1);
  });

  it("takes stock off the shelf", () => {
    const { store, jane } = seedStore();
    checkout(store, { customerId: jane.id, items: [{ productId: 2, qty: 3 }], idempotencyKey: "k1" }, NOW);
    expect(store.getProduct(2).stock).toBe(7);
  });

  it("refuses more than is in stock", () => {
    const { store, jane } = seedStore();
    expect(() =>
      checkout(store, { customerId: jane.id, items: [{ productId: 2, qty: 11 }], idempotencyKey: "k1" }, NOW),
    ).toThrow(/Not enough stock/);
  });

  it("refuses an empty cart", () => {
    const { store, jane } = seedStore();
    expect(() => checkout(store, { customerId: jane.id, items: [], idempotencyKey: "k1" }, NOW)).toThrow(/empty/);
  });

  it("refuses a fractional quantity", () => {
    const { store, jane } = seedStore();
    expect(() =>
      checkout(store, { customerId: jane.id, items: [{ productId: 1, qty: 1.5 }], idempotencyKey: "k1" }, NOW),
    ).toThrow(/whole number/);
  });

  it("refuses an unknown customer", () => {
    const { store } = seedStore();
    expect(() => checkout(store, { customerId: 999, items: [{ productId: 1, qty: 1 }], idempotencyKey: "k1" }, NOW)).toThrow(
      /Unknown customer/,
    );
  });
});
