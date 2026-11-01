# claude-agent-sdk-slack-ops-demo-store

> ⚠️ **The bugs in this repo are planted on purpose.**
> This is the practice target for [claude-agent-sdk-slack-ops](https://github.com/r0han01/claude-agent-sdk-slack-ops): four [Claude Agent SDK](https://code.claude.com/docs/en/agent-sdk/overview) agents that run an online store from Slack. Its dev agent gets bug reports (from customers via the support agent, or from Linear tickets), reproduces each bug with a failing test, fixes it, and opens a pull request here after a human approves the change in Slack.
>
> **The pull requests in this repo were written by that agent and approved by me ([@r0han01](https://github.com/r0han01)) in Slack.** `main` is protected: changes only land by merging a PR.

## The service

Checkout service for a fictional online coffee and brewing-gear store: customer login, discount codes, shipping, payments and refunds. Money is always integer cents.

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

## About the planted bugs

The visible test suite passes, but five realistic bugs slip past it (double charge on a double-click, a partial refund that refunds the whole order, a reusable single-use discount code, a free-shipping check that ignores discounts, and case-sensitive email login). The hidden tests that score the agent's fixes live in the agent repo, not here, so the agent can't see the answer key.
