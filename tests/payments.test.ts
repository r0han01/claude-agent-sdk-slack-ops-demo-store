import { describe, expect, it } from "vitest";
import { chargeOrder } from "../src/payments.js";
import { Store } from "../src/store.js";

describe("payments", () => {
  it("records a successful payment", () => {
    const store = new Store();
    const payment = chargeOrder(store, 1, 4200, "key-1");
    expect(payment).toMatchObject({ orderId: 1, amountCents: 4200, status: "succeeded" });
    expect(store.payments).toHaveLength(1);
  });

  it("keeps the idempotency key on the payment", () => {
    const store = new Store();
    expect(chargeOrder(store, 1, 4200, "key-abc").idempotencyKey).toBe("key-abc");
  });

  it("refuses a zero or negative charge", () => {
    const store = new Store();
    expect(() => chargeOrder(store, 1, 0, "key-1")).toThrow(/positive/);
  });

  it("returns the existing payment for a repeated idempotency key", () => {
    const store = new Store();
    const first = chargeOrder(store, 1, 4200, "key-1");
    const second = chargeOrder(store, 1, 4200, "key-1");
    expect(second).toBe(first);
    expect(store.payments).toHaveLength(1);
  });

  it("refuses to reuse an idempotency key for a different order", () => {
    const store = new Store();
    chargeOrder(store, 1, 4200, "key-1");
    expect(() => chargeOrder(store, 2, 1000, "key-1")).toThrow(/idempotency key/i);
    expect(store.payments).toHaveLength(1);
  });

  it("refuses to reuse an idempotency key for a different amount", () => {
    const store = new Store();
    chargeOrder(store, 1, 4200, "key-1");
    expect(() => chargeOrder(store, 1, 9999, "key-1")).toThrow(/idempotency key/i);
    expect(store.payments).toHaveLength(1);
  });

  it("charges different orders separately", () => {
    const store = new Store();
    chargeOrder(store, 1, 1000, "key-1");
    chargeOrder(store, 2, 2000, "key-2");
    expect(store.payments.map((p) => p.amountCents)).toEqual([1000, 2000]);
  });
});
