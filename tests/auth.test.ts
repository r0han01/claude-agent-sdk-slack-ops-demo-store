import { describe, expect, it } from "vitest";
import { login, registerCustomer } from "../src/auth.js";
import { seedStore } from "./helpers.js";

describe("auth", () => {
  it("logs in with the right email and password", () => {
    const { store, jane } = seedStore();
    expect(login(store, "jane@email.com", "correct-horse")?.id).toBe(jane.id);
  });

  it("logs in regardless of email case and surrounding whitespace", () => {
    const { store, jane } = seedStore();
    expect(login(store, "Jane@Email.com", "correct-horse")?.id).toBe(jane.id);
    expect(login(store, "  JANE@EMAIL.COM ", "correct-horse")?.id).toBe(jane.id);
  });

  it("rejects a wrong password", () => {
    const { store } = seedStore();
    expect(login(store, "jane@email.com", "wrong-password")).toBeNull();
  });

  it("rejects an unknown email", () => {
    const { store } = seedStore();
    expect(login(store, "nobody@email.com", "correct-horse")).toBeNull();
  });

  it("stores emails lowercase and trimmed", () => {
    const { store } = seedStore();
    const sam = registerCustomer(store, "Sam", "  Sam@Example.COM ", "long-password");
    expect(sam.email).toBe("sam@example.com");
  });

  it("refuses a duplicate email", () => {
    const { store } = seedStore();
    expect(() => registerCustomer(store, "Jane 2", "jane@email.com", "another-pass")).toThrow(/already registered/);
  });

  it("refuses a duplicate email that differs only in case", () => {
    const { store } = seedStore();
    expect(() => registerCustomer(store, "Jane 2", "JANE@email.com", "another-pass")).toThrow(/already registered/);
  });

  it("refuses a short password", () => {
    const { store } = seedStore();
    expect(() => registerCustomer(store, "Al", "al@email.com", "short")).toThrow(/at least 8/);
  });
});
