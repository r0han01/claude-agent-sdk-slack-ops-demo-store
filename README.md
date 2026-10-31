# store-backend

Checkout service for an online coffee and brewing-gear store: customer login, discount codes, shipping, payments and refunds. Money is always integer cents.

```bash
npm install
npm test          # vitest
npm run typecheck # tsc
```

| File | Does |
|---|---|
| `src/auth.ts` | Register and log in customers (scrypt password hashes) |
| `src/discounts.ts` | Validate and apply discount codes, record redemptions |
| `src/shipping.ts` | Flat $5.99 shipping, free at $50+ after discounts |
| `src/payments.ts` | Charge the card, idempotent per checkout attempt |
| `src/refunds.ts` | Refund one line item of an order |
| `src/checkout.ts` | Cart → order → charge |

Data lives in an in-memory `Store` so tests run in milliseconds.
