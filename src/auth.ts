import { randomBytes, scryptSync, timingSafeEqual } from "node:crypto";
import type { Store } from "./store.js";
import type { Customer } from "./types.js";

function hashPassword(password: string): string {
  const salt = randomBytes(16).toString("hex");
  const hash = scryptSync(password, salt, 32).toString("hex");
  return `${salt}:${hash}`;
}

function verifyPassword(password: string, stored: string): boolean {
  const [salt, hash] = stored.split(":");
  if (!salt || !hash) return false;
  const candidate = scryptSync(password, salt, 32);
  return timingSafeEqual(candidate, Buffer.from(hash, "hex"));
}

function normalizeEmail(email: string): string {
  return email.trim().toLowerCase();
}

export function registerCustomer(store: Store, name: string, email: string, password: string): Customer {
  const normalized = normalizeEmail(email);
  if (store.customers.some((c) => c.email === normalized)) {
    throw new Error("Email already registered");
  }
  if (password.length < 8) throw new Error("Password must be at least 8 characters");
  const customer: Customer = {
    id: store.nextId("customer"),
    name,
    email: normalized,
    passwordHash: hashPassword(password),
  };
  store.customers.push(customer);
  return customer;
}

/** Returns the customer on success, null on unknown email or wrong password. */
export function login(store: Store, email: string, password: string): Customer | null {
  const customer = store.customers.find((c) => c.email === normalizeEmail(email));
  if (!customer) return null;
  return verifyPassword(password, customer.passwordHash) ? customer : null;
}
