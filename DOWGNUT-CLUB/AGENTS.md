# AGENTS.md — DOWGNUT CLUB™ Project Context for Hermes Agent

## Project

DOWGNUT CLUB™ is a mobile-first viral commerce app for a street-luxe donut brand. The app combines ordering, drops, rewards, referrals, creator commerce, partner counters and admin operations.

## Core Product Language

- Members / customers use **DOWG Wallet**, **DOWG Coins**, **DOWG Code**, **DOWG Rank**, **Freebie Vault**, **Secret Stash** and **Box Party**.
- Creators use **DOWG Creator Hub** for campaign briefs, code tracking, commissions and content kits.
- Owners use **DOWGNUT Operator** for reports, campaigns, inventory, fraud review, creator leaderboards and approvals.

## Architecture Baseline

- Frontend: mobile-first PWA, recommended Next.js/React.
- Backend: modular monolith API, recommended NestJS/Node.js.
- Database: PostgreSQL.
- Queue/cache: Redis.
- Object storage: S3-compatible storage.
- Payments: Billplz, ToyyibPay or Stripe.
- Messaging: WhatsApp Cloud API / ManyChat first; Hermes Gateway later.
- AI layer: Hermes Agent behind DOWGNUT Backend AI Gateway, never called directly from the browser.

## Hermes Integration Rules

1. Do not expose Hermes `API_SERVER_KEY` to frontend code.
2. Public users must not get terminal/shell tools.
3. Hermes must access DOWGNUT data only through role-based MCP tools or internal API endpoints.
4. Member assistant can only access the authenticated member’s own wallet, orders and vouchers.
5. Creator assistant can only access the authenticated creator’s own campaigns, stats and payout status.
6. Owner assistant can read admin reports and draft actions, but write actions require approval.
7. Never invent current prices, stock, payouts, campaign terms or order status. Use tools.
8. Store AI conversation and tool-call audit logs.
9. Redact PII, secrets, payment details and raw internal IDs from outputs.
10. Do not build public multi-level income claims without legal review.

## API Response Convention

All backend endpoints should return JSON in this shape:

```json
{
  "data": {},
  "error": null,
  "meta": {}
}
```

For errors:

```json
{
  "data": null,
  "error": {
    "code": "ERROR_CODE",
    "message": "Human-readable message"
  },
  "meta": {}
}
```

## AI Roles

### DOWG Buddy — Member Assistant

Helps customers with menu, drops, recommendations, vouchers, rewards, referral rules, order status and support tickets. No admin or creator financial data.

### DOWG Creator Coach — Creator Assistant

Helps creators with campaign briefs, captions, TikTok hooks, code performance, conversion suggestions and payout status. No access to other creator data.

### DOWGNUT Operator — Owner Copilot

Helps owner/admin with sales summaries, product performance, campaign ideas, inventory alerts, referral fraud flags and creator leaderboards. Write actions must be approval-based.

## Wallet and Commission Rules

- Wallet ledger must be append-only.
- Never directly mutate wallet balance without ledger entry.
- Commission should be created only from completed valid orders.
- Payout should have holding period and fraud review.
- Refund/cancelled order must reverse or void pending commission.

## Security Notes

- Keep `.env`, API keys, payment secrets and credentials out of prompts and commits.
- Use server-side identity binding for AI tools; do not trust model-supplied `userId` or `creatorId`.
- Audit all AI tool calls.
- Use idempotency keys for write actions.
- Use explicit approvals for campaign creation, payout approval, broadcast send and bulk stock update.

## Development Style

- Prefer simple modular monolith over premature microservices.
- Keep business logic server-side.
- Use strict TypeScript where possible.
- Add tests for wallet, referral, commission, voucher eligibility and fraud checks.
- Treat edge cases as core product behavior, not cleanup.
