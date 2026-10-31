import { registerCustomer } from "../src/auth.js";
import { Store } from "../src/store.js";

export function seedStore() {
  const store = new Store();
  const jane = registerCustomer(store, "Jane Doe", "jane@email.com", "correct-horse");
  store.products.push(
    { id: 1, sku: "BEAN-ETH-12", name: "Ethiopia Light Roast 12oz", priceCents: 1800, stock: 100 },
    { id: 2, sku: "GRND-BURR-01", name: "Burr Grinder", priceCents: 6000, stock: 10 },
    { id: 3, sku: "KTL-GOOSE-1L", name: "Gooseneck Kettle 1L", priceCents: 3000, stock: 20 },
    { id: 4, sku: "FLT-PAPER-100", name: "Paper Filters (100)", priceCents: 2500, stock: 50 },
  );
  store.discountCodes.push(
    { code: "SAVE10", type: "percent", value: 10, singleUsePerCustomer: true },
    { code: "FIVEOFF", type: "fixed", value: 500, singleUsePerCustomer: false },
    { code: "BIGSPEND", type: "fixed", value: 1000, singleUsePerCustomer: false, minSubtotalCents: 8000 },
    { code: "SUMMER", type: "percent", value: 20, singleUsePerCustomer: false, expiresAt: new Date("2026-09-01") },
  );
  return { store, jane };
}
