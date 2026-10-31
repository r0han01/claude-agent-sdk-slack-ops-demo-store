import { describe, expect, it } from "vitest";
import { applyDiscount, recordRedemption } from "../src/discounts.js";
import { seedStore } from "./helpers.js";

const NOW = new Date("2026-10-01");

describe("discounts", () => {
  it("applies a percent code", () => {
    const { store, jane } = seedStore();
    expect(applyDiscount(store, "SAVE10", 6000, jane.id, NOW)).toBe(600);
  });

  it("applies a fixed code", () => {
    const { store, jane } = seedStore();
    expect(applyDiscount(store, "FIVEOFF", 3000, jane.id, NOW)).toBe(500);
  });

  it("is case-insensitive", () => {
    const { store, jane } = seedStore();
    expect(applyDiscount(store, " save10 ", 6000, jane.id, NOW)).toBe(600);
  });

  it("never discounts more than the subtotal", () => {
    const { store, jane } = seedStore();
    expect(applyDiscount(store, "FIVEOFF", 300, jane.id, NOW)).toBe(300);
  });

  it("enforces a minimum subtotal", () => {
    const { store, jane } = seedStore();
    expect(() => applyDiscount(store, "BIGSPEND", 5000, jane.id, NOW)).toThrow(/too low/);
  });

  it("rejects an expired code", () => {
    const { store, jane } = seedStore();
    expect(() => applyDiscount(store, "SUMMER", 5000, jane.id, NOW)).toThrow(/expired/);
  });

  it("rejects an unknown code", () => {
    const { store, jane } = seedStore();
    expect(() => applyDiscount(store, "NOPE", 5000, jane.id, NOW)).toThrow(/Unknown/);
  });

  it("rejects a single-use code once a redemption is recorded", () => {
    const { store, jane } = seedStore();
    recordRedemption(store, "save10", jane.id, 99);
    expect(() => applyDiscount(store, "SAVE10", 6000, jane.id, NOW)).toThrow(/already used/);
  });
});
