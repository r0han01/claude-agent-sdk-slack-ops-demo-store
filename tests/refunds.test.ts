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

  it("refunds only the chosen item's price on a multi-item order", () => {
    const { store, jane } = seedStore();
    const order = checkout(store, {
      customerId: jane.id,
      items: [{ productId: 3, qty: 1 }, { productId: 4, qty: 1 }],
      idempotencyKey: "k1",
    });
    const kettle = order.items.find((i) => i.productId === 3)!;
    const filters = order.items.find((i) => i.productId === 4)!;
    expect(refundItem(store, order.id, kettle.id, "dented").amountCents).toBe(3000);
    expect(refundItem(store, order.id, filters.id, "torn").amountCents).toBe(2500);
  });

  it("refunds the whole line (price × qty) for a multi-quantity line", () => {
    const { store, jane } = seedStore();
    const order = checkout(store, {
      customerId: jane.id,
      items: [{ productId: 4, qty: 2 }, { productId: 1, qty: 1 }],
      idempotencyKey: "k1",
    });
    const filters = order.items.find((i) => i.productId === 4)!;
    expect(refundItem(store, order.id, filters.id, "torn").amountCents).toBe(5000);
  });

  it("refunds the line's share of an order discount, never more than was paid", () => {
    const { store, jane } = seedStore();
    const order = checkout(store, {
      customerId: jane.id,
      items: [{ productId: 3, qty: 1 }, { productId: 4, qty: 1 }],
      discountCode: "FIVEOFF",
      idempotencyKey: "k1",
    });
    const kettle = order.items.find((i) => i.productId === 3)!;
    const filters = order.items.find((i) => i.productId === 4)!;
    const a = refundItem(store, order.id, kettle.id, "dented").amountCents;
    const b = refundItem(store, order.id, filters.id, "torn").amountCents;
    expect(a).toBe(2727); // 3000 - ceil(500 * 3000 / 5500)
    expect(b).toBe(2272); // 2500 - ceil(500 * 2500 / 5500)
    expect(a + b).toBeLessThanOrEqual(order.subtotalCents - order.discountCents);
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
