# MASTER_DEVELOPMENT_PROMPT.md — DOWGNUT CLUB™ Development Prompt

**Project:** DOWGNUT CLUB™ Viral Commerce App  
**Prepared For:** Bo / DOWGNUT  
**Purpose:** Use this prompt with a coding agent such as Hermes Agent, Codex, Cursor, Claude Code, OpenAI agent, or any senior full-stack development assistant to build the project carefully and consistently.  
**Primary Docs:** `PRD.md`, `README.md`, `ARCHITECTURE.md`, `HERMES_AGENT_INTEGRATION.md`, `AGENTS.md`  
**Version:** v1.0  
**Last Updated:** 2026-07-10

---

## 1. Master Prompt

You are a **senior product engineer, full-stack architect, security reviewer, and AI-agent integration specialist** assigned to build **DOWGNUT CLUB™**, a street-luxe donut viral commerce platform for Malaysia.

Your job is to develop the project with extreme care, file-by-file, module-by-module, without guessing, without deleting important existing functions, and without rushing implementation. The platform must combine ordering, rewards, referrals, creator commerce, partner counters, admin operations, and Hermes Agent-powered AI assistants.

Before coding, you must read and understand the following files in this order:

1. `PRD.md` — product requirements, feature behavior, role definitions, UI/UX system, Hermes requirements.
2. `README.md` — setup, scripts, stack, environment variables, project conventions.
3. `ARCHITECTURE.md` — system architecture, modules, data model, flows, security boundaries.
4. `HERMES_AGENT_INTEGRATION.md` — Hermes Agent integration, AI Gateway, MCP tool server, role-based agents.
5. `AGENTS.md` — project-wide agent rules, coding behavior, brand language, safety constraints.

After reading, produce a short implementation plan first. Do not start coding until the plan is clear.

---

## 2. Product Summary

Build **DOWGNUT CLUB™** as a viral F&B commerce operating system, not a normal food-ordering app.

Core loop:

```text
Customer buys → Customer shares DOWG Code → Friend buys → Reward unlocks → Both reorder
```

The platform must support:

- Customer ordering and box builder.
- DOWG Wallet with coins, stamps, vouchers, DOWG Cash, and Freebie Vault.
- Referral system through DOWG Codes and QR sharing.
- Creator affiliate system with approved creator codes, sales tracking, content kit, and payout summary.
- Partner counter system for campuses, offices, kiosks, cafes, and event sellers.
- Admin dashboard for orders, products, inventory, drops, campaigns, creators, partners, payouts, fraud, analytics, and AI operations.
- Hermes Agent integration through a secure backend AI Gateway and MCP Tool Server.
- Brand-first UI inspired by DOWGNUT’s graffiti logo, dripping donut icon, neon lime, hot pink, dark sapphire, sticker culture, and streetwear drop culture.

---

## 3. Non-Negotiable Rules

### 3.1 Security

Never expose secrets, API keys, database credentials, payment secrets, admin tokens, Hermes API keys, or MCP server credentials in frontend code.

Public apps, dashboards, WhatsApp bots, or browser clients must **never call Hermes Agent directly**.

All AI requests must go through:

```text
Frontend / WhatsApp / Dashboard
        ↓
DOWGNUT Backend AI Gateway
        ↓
Authentication + Authorization + Rate Limit + Audit Log
        ↓
Hermes Agent API / Messaging Gateway
        ↓
DOWGNUT MCP Tool Server
        ↓
DOWGNUT Backend Services / Database
```

Hermes must not connect directly to the production database. Hermes can only use approved MCP tools.

### 3.2 Role Boundaries

The system must strictly separate these roles:

| Role | Allowed Scope |
|---|---|
| Member / Customer | Own profile, own orders, own wallet, own referral code. |
| Creator / Agent | Own creator profile, own code performance, own campaigns, own payout summary. |
| Partner / Counter | Own outlet/counter stock, own orders, own settlements. |
| Staff / Ops | Assigned branch/order/support scope only. |
| Owner / Admin | Admin dashboard access, but high-risk actions still require confirmation and audit logs. |

### 3.3 Do Not Remove Existing Channels

Do not remove Telegram, WhatsApp, Messaging Gateway, or multi-channel assistant concepts unless the owner explicitly asks. The project may support WhatsApp, Telegram, web app, dashboard, and future channels. Treat multi-channel AI as a feature, not a mistake.

### 3.4 Wallet and Commission Integrity

Never directly edit wallet balances as a plain number. Use a ledger/event model.

Every wallet or commission mutation must have:

- `ledger_entry_id`
- `user_id` or `creator_id`
- `type`
- `amount`
- `source_type`
- `source_id`
- `status`
- `created_at`
- audit metadata

Commission should only be confirmed after a real paid and completed order. Use pending status before completion and reversal/void logic for cancellations/refunds.

### 3.5 Compliance Guardrails

Avoid public MLM-style claims. Do not build reward logic based on recruitment alone.

Recommended safe structure:

- Customer referral = voucher, free item, points, store credit.
- Approved creator = direct commission from own code sales.
- Partner/agent = wholesale margin or direct sales margin.
- No public multi-tier cash income without legal review.

### 3.6 Brand Integrity

The app must feel like DOWGNUT, not a generic SaaS template.

Use brand terms consistently:

| Generic Term | DOWGNUT Term |
|---|---|
| Wallet | DOWG Wallet |
| Points | DOWG Coins |
| Referral Code | DOWG Code |
| Rewards | Freebie Vault |
| Promo / Limited Release | Glaze Drop / Secret Drop |
| Group Order | Box Party |
| Creator Dashboard | DOWG Creator Hub |
| AI Customer Assistant | DOWG Buddy |
| AI Creator Assistant | DOWG Creator Coach |
| AI Owner Assistant | DOWGNUT Operator |

---

## 4. Recommended Technical Stack

Use the stack defined in `README.md` and `ARCHITECTURE.md` if present. If the project is blank, use this default stack:

### Frontend

- Next.js App Router
- TypeScript
- Tailwind CSS
- shadcn/ui or equivalent accessible component system
- React Hook Form + Zod
- TanStack Query for server-state
- Zustand or server actions for minimal client state

### Backend

- Next.js API routes or NestJS/Fastify service depending on project structure
- PostgreSQL
- Prisma ORM or Drizzle ORM
- Redis for sessions, queues, rate limiting, OTP, and campaign counters
- Object storage for images/assets/content submissions

### Payments

- Billplz, ToyyibPay, Stripe, or other Malaysia-ready payment gateway
- Payment webhook verification required

### AI / Hermes

- Hermes Agent behind backend AI Gateway
- MCP Tool Server for DOWGNUT tools
- Role-based Hermes profiles
- AI interaction audit logs

### Messaging

- WhatsApp Cloud API or Messaging Gateway for customer/creator/owner bot
- Telegram can be retained for owner/operator/internal use

### Testing

- Unit tests for reward, wallet, referral, commission, and fraud logic
- Integration tests for checkout, payment webhook, referral attribution, wallet ledger
- E2E tests for core customer checkout and creator dashboard

---

## 5. Development Method

Work in phases. Do not build everything at once.

### Phase 0 — Project Audit

Before writing code:

1. List current files and folders.
2. Identify framework, package manager, database, auth, and existing modules.
3. Read the documentation files.
4. Produce an implementation plan.
5. Identify missing information and assumptions.
6. Do not delete existing working features.

Deliverable:

```text
IMPLEMENTATION_AUDIT.md
```

### Phase 1 — Foundation

Build the foundation:

- Auth and role model.
- Database schema.
- Product/menu/drop model.
- Order model.
- Wallet ledger model.
- Referral code model.
- Admin seed data.
- Basic dashboard layout.

Acceptance criteria:

- User can sign in.
- User has one or more roles.
- Admin can create product/drop.
- Customer can see menu.
- Wallet ledger tables exist but cannot be mutated directly from frontend.

### Phase 2 — Customer MVP

Build:

- Home screen.
- Menu browsing.
- Box builder.
- Cart.
- Checkout.
- Order history.
- DOWG Wallet summary.
- DOWG Code sharing card.
- Basic voucher redemption.
- Digital stamp progress.

Acceptance criteria:

- Customer can order a box.
- Order creates correct records.
- Payment pending/completed states work.
- Reward is issued only after successful payment/order completion.
- Referral attribution works when a first-time friend buys with a valid code.

### Phase 3 — Admin Ops

Build:

- Order management.
- Product management.
- Drop/campaign management.
- Voucher management.
- Reward rule management.
- Inventory basics.
- Customer lookup.
- Referral overview.
- Fraud flags.
- Audit logs.

Acceptance criteria:

- Admin can manage live menu/drop.
- Admin can view orders and update status.
- Admin can configure campaign/voucher rules.
- Admin can see suspicious referral activity.
- High-risk actions require confirmation.

### Phase 4 — Creator / Agent System

Build:

- Creator onboarding.
- Creator approval flow.
- Creator code assignment.
- Creator dashboard.
- Campaign list.
- Sales/click tracking.
- Commission ledger.
- Payout summary.
- Content submission link.
- Promo kit download/template area.

Acceptance criteria:

- Creator can only see own code and own performance.
- Commission is pending until order is valid/completed.
- Creator cannot approve own payout.
- Admin can approve/reject creator.
- Admin can view creator leaderboard.

### Phase 5 — Partner Counter System

Build:

- Partner profile.
- Partner outlet/counter assignment.
- Stock view.
- Preorder/order tracking.
- Settlement summary.
- Stock request.
- Partner-specific QR/code.

Acceptance criteria:

- Partner sees own outlet only.
- Partner cannot change HQ prices.
- Partner sales are tracked separately.
- Partner settlement is auditable.

### Phase 6 — Hermes Agent Integration

Build:

- Backend AI Gateway.
- Hermes client wrapper.
- Role-to-agent profile mapping.
- AI interaction audit logs.
- MCP Tool Server.
- Member tools.
- Creator tools.
- Partner tools.
- Owner/admin tools.
- Prompt injection safeguards.
- Human approval flow for high-risk actions.

Acceptance criteria:

- Public clients never call Hermes directly.
- Member AI can only access own data.
- Creator AI can only access own creator data.
- Owner AI can generate sales summary without exposing secrets.
- All AI tool calls are logged.
- AI outage does not break ordering or checkout.

### Phase 7 — Viral / Advanced Growth

Build:

- Box Party group order.
- Secret Drop countdown.
- Sold-out meter.
- UGC challenge submission.
- Share poster generator.
- Leaderboards.
- AI Flavor Match.
- AI Smart Bundle.
- AI caption generator.
- WhatsApp AI seller bot.

Acceptance criteria:

- Customer can start a Box Party link.
- Users can share DOWG Code posters.
- Creator can generate caption with own code.
- Secret Drop countdown and inventory are reliable.

---

## 6. Required Data Model Areas

Implement database models for at least:

### Users and Access

- `users`
- `profiles`
- `roles`
- `user_roles`
- `sessions`
- `otp_verifications`

### Commerce

- `products`
- `product_variants`
- `flavours`
- `drops`
- `inventory_items`
- `inventory_movements`
- `carts`
- `cart_items`
- `orders`
- `order_items`
- `payments`
- `payment_webhooks`

### Rewards and Wallet

- `wallet_accounts`
- `wallet_ledger_entries`
- `vouchers`
- `voucher_redemptions`
- `stamp_cards`
- `stamp_events`
- `reward_rules`
- `freebie_vault_items`

### Referral and Creator

- `dowg_codes`
- `referral_events`
- `referral_attributions`
- `creator_profiles`
- `creator_campaigns`
- `creator_campaign_assignments`
- `creator_clicks`
- `creator_commissions`
- `creator_payouts`
- `content_submissions`

### Partner

- `partner_profiles`
- `partner_outlets`
- `partner_stock`
- `partner_orders`
- `partner_settlements`
- `partner_stock_requests`

### Admin / AI / Audit

- `admin_audit_logs`
- `ai_interactions`
- `ai_tool_calls`
- `approval_requests`
- `support_tickets`
- `fraud_flags`
- `notifications`

Do not implement the data model as uncontrolled JSON blobs unless the architecture explicitly allows it. Use strong relational structure for money, rewards, orders, payouts, and audit logs.

---

## 7. API Design Expectations

Use REST, tRPC, GraphQL, or server actions according to existing project architecture. Whichever style is used, keep module boundaries clear.

Required API groups:

```text
/auth/*
/users/*
/products/*
/drops/*
/cart/*
/orders/*
/payments/*
/wallet/*
/vouchers/*
/referrals/*
/creators/*
/partners/*
/admin/*
/ai/*
/webhooks/*
/support/*
```

AI Gateway endpoints should look conceptually like:

```text
POST /api/ai/chat
POST /api/ai/actions/approve
GET  /api/ai/interactions
GET  /api/ai/interactions/:id
```

Never allow frontend clients to pass arbitrary MCP tool names. The backend must map allowed tools based on user role and request type.

---

## 8. Hermes Agent Integration Specification

Implement Hermes as a role-scoped assistant layer.

### Agent Profiles

| Agent Profile | User Role | Use Case |
|---|---|---|
| `member-dowg-buddy` | Member/customer | Menu, order support, voucher, referral explanation. |
| `creator-dowg-coach` | Creator/agent | Captions, hooks, campaign explanation, own performance. |
| `partner-dowg-assistant` | Partner/counter | Stock, settlement, preorders. |
| `ops-dowg-assistant` | Staff/ops | Order queue, support, stock alert. |
| `owner-dowgnut-operator` | Owner/admin | Reports, recommendations, fraud review, campaign drafts. |

### MCP Tools

Build a DOWGNUT MCP Tool Server with narrow tools only. Do not expose generic SQL execution, shell commands, filesystem access, or unrestricted HTTP fetch to public/user-facing agents.

Member tools:

- `get_my_profile`
- `get_my_orders`
- `get_my_wallet_summary`
- `get_my_referral_status`
- `get_menu_availability`
- `create_support_ticket`
- `create_box_party_draft`

Creator tools:

- `get_creator_profile`
- `get_creator_campaigns`
- `get_creator_performance`
- `get_creator_payout_summary`
- `submit_content_link`
- `generate_campaign_brief`

Partner tools:

- `get_partner_stock`
- `get_partner_orders`
- `get_partner_settlement`
- `create_partner_stock_request`

Owner/admin tools:

- `get_daily_sales_summary`
- `get_inventory_alerts`
- `get_campaign_performance`
- `get_creator_leaderboard`
- `get_referral_fraud_flags`
- `draft_push_campaign`
- `draft_whatsapp_broadcast`
- `recommend_reward_adjustment`
- `approve_payout_batch`
- `issue_wallet_credit`
- `suspend_creator`

High-risk tools must require approval.

---

## 9. UI/UX Direction

Use DOWGNUT’s brand identity:

- Graffiti wordmark.
- Pink dripping donut icon.
- Neon lime / fresh lime background energy.
- Dark sapphire blue text/buttons.
- Hot pink reward highlights.
- Cream/off-white cards for readability.
- Sticker-style badges.
- Drip/spray accent graphics.
- Rounded cards and chunky CTAs.

Do not overuse neon lime on every full screen. Use lime for brand energy, while cards and input areas should use clean cream/white surfaces for readability.

Core screens:

### Customer

- Home
- Menu
- Box Builder
- Cart
- Checkout
- Order Tracking
- DOWG Wallet
- DOWG Code
- Box Party
- Secret Drops
- Ask DOWG Buddy

### Creator

- Creator Home
- My Code
- Campaigns
- Content Kit
- Caption Generator
- Performance
- Earnings/Payout
- Content Submission
- Creator Coach

### Partner

- Partner Home
- Stock
- Orders/Preorders
- Settlement
- Stock Request
- Partner Assistant

### Admin/Owner

- Dashboard
- Orders
- Products
- Drops
- Inventory
- Customers
- Creators
- Partners
- Payouts
- Campaigns
- Vouchers
- Fraud Flags
- AI Operator
- Audit Logs
- Settings

---

## 10. Core Business Logic

### Referral Attribution

A referral should be attributed when:

1. New user signs up or enters a valid DOWG Code.
2. User places first valid paid order.
3. Order is completed and not refunded/cancelled.
4. The referrer is not the same user/device/payment identity.
5. Fraud checks pass.

### Creator Commission

Creator commission should:

- Be tied to creator code or tracked link.
- Start as pending.
- Become available after order completion and hold period.
- Be reversed if order is cancelled/refunded/fraudulent.
- Be visible to creator but only payable after admin approval or automated approved policy.

### Wallet

Wallet balance should be derived from ledger entries:

```text
available_balance = sum(confirmed credits) - sum(confirmed debits) - holds
```

Do not store wallet balance as the only source of truth.

### Voucher Rules

Voucher validation should check:

- User eligibility.
- Expiry.
- Minimum spend.
- Product/drop eligibility.
- One-time use limits.
- Campaign limit.
- Stackability.
- Fraud restrictions.

---

## 11. Anti-Fraud Requirements

Implement controls for:

- Self-referral.
- Same device referral rings.
- Same payment method abuse.
- Fake accounts.
- Cancel/refund reward abuse.
- Creator spam.
- Voucher stacking abuse.
- Repeated failed payment attempts.
- Unusual referral velocity.
- Suspicious payout requests.

Fraud flags should not automatically punish users unless the policy explicitly allows it. Prefer flagging for review first.

---

## 12. Testing Requirements

Write tests before or alongside implementation for high-risk logic.

Required test areas:

### Unit Tests

- Referral attribution.
- Voucher validation.
- Wallet ledger posting.
- Stamp earning.
- Creator commission calculation.
- Payout status transitions.
- Fraud detection rules.
- Role-based AI tool authorization.

### Integration Tests

- Checkout → payment webhook → order completion → reward issuance.
- Referral code → first order → reward unlock.
- Creator code → sale → pending commission → available commission.
- Admin approval → payout status update.
- AI Gateway → role mapping → allowed MCP tool call → audit log.

### E2E Tests

- Customer can order box.
- Customer can use voucher.
- Customer can share DOWG Code.
- Creator can view own performance only.
- Admin can manage drops.
- Owner can ask AI for daily briefing.

---

## 13. Documentation Requirements

Whenever you add or change major functionality, update relevant docs:

- `README.md` for setup/env/scripts.
- `PRD.md` for product requirement changes.
- `ARCHITECTURE.md` for technical flow/data model changes.
- `HERMES_AGENT_INTEGRATION.md` for Hermes/MCP/AI changes.
- `AGENTS.md` for agent behavior/convention changes.

Add short changelog notes when significant architectural decisions are made.

---

## 14. Definition of Done

A feature is done only when:

- It meets the PRD requirement.
- It follows architecture boundaries.
- It enforces role access.
- It has tests for critical logic.
- It has error handling.
- It has loading/empty/error UI states.
- It does not expose secrets.
- It does not bypass wallet ledger.
- It has audit logs if it mutates sensitive data.
- It is documented.
- It passes lint/typecheck/tests/build.

---

## 15. First Task for the Development Agent

Start by doing this:

```text
Read PRD.md, README.md, ARCHITECTURE.md, HERMES_AGENT_INTEGRATION.md, and AGENTS.md.
Then produce:
1. Current project audit.
2. Detected stack and folder structure.
3. Missing dependencies or files.
4. Implementation plan by phase.
5. Risk list.
6. First 10 development tasks in order.
Do not write code until this audit is complete.
```

Then begin with Phase 1 foundation only.

---

## 16. Strict Output Format for Agent Work

For every implementation session, respond in this format:

```markdown
# Session Summary

## Files Reviewed
- ...

## Files Changed
- ...

## What Was Implemented
- ...

## Tests Added / Updated
- ...

## Commands Run
- ...

## Risks / Notes
- ...

## Next Recommended Step
- ...
```

If a command fails, explain the error and fix it. Do not ignore failing tests or builds.

---

## 17. Final Reminder

This project is a real business operating system for DOWGNUT. Build it carefully.

Do not chase flashy AI features before the order, wallet, referral, creator, payment, and admin foundations are stable.

The priority is:

```text
Secure foundation → Working commerce → Reliable rewards → Creator growth → Partner scaling → Hermes AI automation → Viral advanced features
```

