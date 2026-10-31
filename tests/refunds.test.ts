import { describe, expect, it } from "vitest";
import { checkout } from "../src/checkout.js";
import { refundItem } from "../src/refunds.js";
import { seedStore } from "./helpers.js";

describe("refunds", () => {
  it("refunds a single-item order in full", () => {
    const { store, jane } = seedStore();
    const order = checkout(store, { customerId: jane.id, items: [{ productId: 2, qty: 1 }], idempotencyKey: "k1" });
    const refund = refundItem(store, order.id, order.items[0]!.id, "arrived broken");
    expect(refund.amountCents).toBe(6000);
  });

  it("won't refund the same item twice", () => {
    const { store, jane } = seedStore();
    const order = checkout(store, { customerId: jane.id, items: [{ productId: 2, qty: 1 }], idempotencyKey: "k1" });
    refundItem(store, order.id, order.items[0]!.id, "arrived broken");
    expect(() => refundItem(store, order.id, order.items[0]!.id, "again")).toThrow(/already fully refunded/);
  });

  it("rejects an item that isn't on the order", () => {
    const { store, jane } = seedStore();
    const order = checkout(store, { customerId: jane.id, items: [{ productId: 2, qty: 1 }], idempotencyKey: "k1" });
    expect(() => refundItem(store, order.id, 999, "?")).toThrow(/not on order/);
  });

  it("rejects an unknown order", () => {
    const { store } = seedStore();
    expect(() => refundItem(store, 12345, 1, "?")).toThrow(/not found/);
  });
});
