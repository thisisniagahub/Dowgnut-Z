# DOWGNUT CLUB™ — Viral Commerce App

**Tagline:** Eat. Share. Earn. Flex. Repeat.  
**Brand line:** GOOD VIBES & GOOD DOWG  
**Product type:** F&B viral commerce platform / loyalty app / referral engine / creator commerce system  
**Primary market:** Malaysia  
**Current document status:** Product + technical documentation for initial development planning  
**Related docs:** [`PRD.md`](./PRD.md), [`ARCHITECTURE.md`](./ARCHITECTURE.md)

---

## 1. Project Overview

DOWGNUT CLUB™ is a **mobile-first viral commerce app** for the DOWGNUT donut brand. The product is not meant to be a normal food ordering app only. It is designed as a **growth engine** where every order can create repeat purchase, referrals, creator sales, group orders, secret drops, and community status.

The app combines these concepts:

| Inspiration | Concept Used in DOWGNUT CLUB™ |
|---|---|
| Luckin / ZUS style | App-first ordering, vouchers, pickup, loyalty, repeat purchase loop. |
| DRE Coffee / Ahmad’s style | Earn narrative, referral tracking, creator/agent sales, wallet logic. |
| Tealive / Gigi style | Simple refer-a-friend rewards, app deals, member perks. |
| Streetwear drop culture | Limited flavour drops, countdowns, waitlists, secret menu access. |
| DOWGNUT brand identity | Graffiti logo, pink dripping donut icon, lime/pink/sapphire visual language. |

The core idea:

```text
Customer scans QR
→ joins DOWGNUT CLUB™
→ claims first voucher
→ orders donut box
→ receives DOWG Code
→ shares code
→ friend buys
→ original customer earns reward
→ both repeat through drops, ranks, wallet and group orders
```

---

## 2. Product Vision

Build Malaysia’s most viral street-luxe donut platform where customers do not just buy donuts — they **join the pack**, unlock secret drops, share personal DOWG Codes, earn rewards, and flex their favourite donut box.

### Product Positioning

> DOWGNUT CLUB™ is a street-luxe donut club where every bite unlocks rewards, secret drops, creator campaigns, and community status.

### Product Promise

DOWGNUT CLUB™ should make customers feel:

- **Rewarded** after every meaningful action.
- **Excited** by limited drops and sold-out energy.
- **Proud** to share their personal DOWG Code.
- **Included** in a club, not just a customer database.
- **Motivated** to repeat, refer, and flex.

---

## 3. Core Product Modules

| Module | Description | MVP Priority |
|---|---|---|
| Customer App | Mobile-first PWA for menu, ordering, wallet, referral and rewards. | P0 |
| Admin Dashboard | HQ/staff tool for products, orders, campaigns, users, referrals, inventory. | P0 |
| DOWG Wallet | Coins, vouchers, stamps, freebie vault, reward history. | P0 |
| DOWG Code | Personal referral code and QR/share link for each user. | P0 |
| Product Catalogue | Donuts, boxes, add-ons, drops, combos, category structure. | P0 |
| Cart & Checkout | Cart, voucher application, payment, order confirmation. | P0 |
| Order Tracking | Pending, accepted, preparing, ready, completed, cancelled. | P0 |
| Campaign Engine | First-purchase voucher, referral reward, drop campaigns, expiry rules. | P0 |
| Creator Hub | Approved creator dashboard with code analytics and commission. | P1 |
| Group Order / Box Party | Shareable group order for office, campus, hospital, event use cases. | P1 |
| Secret Drop Engine | Limited drops, countdown, stock meter, waitlist, VIP early access. | P1 |
| UGC Challenge | Users submit content links or uploads for review/rewards. | P2 |
| Partner Counter | Partner/kiosk/campus stock and settlement dashboard. | P2 |
| AI Engine | Flavor match, smart box builder, caption generator, WhatsApp seller bot. | P2/P3 |

---

## 4. Target Users

### 4.1 Customer Roles

| Role | Description | Main Actions |
|---|---|---|
| Guest | Visitor not logged in. | Browse menu, view drops, start signup. |
| Customer | Verified normal user. | Order, redeem voucher, collect coins/stamps, refer friends. |
| VIP Customer | Customer with higher rank or campaign unlock. | Early access, secret menu, special rewards. |

### 4.2 Growth Partner Roles

| Role | Description | Main Actions |
|---|---|---|
| Creator | TikTok/IG/food content promoter. | Share code, track sales, request payout. |
| Campus Agent | Student promoter or campus seller. | Collect preorders, share group links, earn direct commission/margin. |
| Office Captain | Person who organizes bulk office orders. | Start Box Party, collect orders, unlock group rewards. |
| Partner Counter | Cafe/kiosk/event/minimart partner. | Track stock, QR sales, settlement. |

### 4.3 Internal Roles

| Role | Description | Main Actions |
|---|---|---|
| Staff | Outlet or booth operator. | Manage order queue, mark status, update stock. |
| Outlet Manager | Manager for one or more outlets. | Manage staff, outlet inventory, daily report. |
| Super Admin | HQ owner/admin. | Full control: products, campaigns, payouts, fraud, reports. |

---

## 5. MVP Scope

The MVP must validate the **viral commerce loop** before building expensive native apps or heavy AI.

### MVP Core Flow

```text
QR Signup
→ Phone OTP Verification
→ First Purchase Voucher
→ Browse Menu
→ Build Box / Add to Cart
→ Checkout / Pay
→ Order Completed
→ Wallet Updated
→ DOWG Code Activated
→ Referral Reward Triggered After Friend's First Completed Order
```

### MVP Must-Have Features

| Area | Requirement |
|---|---|
| Authentication | Phone OTP login, profile setup, optional birthday/email. |
| Menu | Products, categories, product images, prices, availability. |
| Ordering | Cart, checkout, pickup/manual delivery, order status. |
| Payment | Payment integration or manual payment proof for early MVP. |
| Wallet | Coins, stamps, vouchers, reward history. |
| Referral | Unique DOWG Code, QR/share link, referral attribution. |
| Campaign | First-purchase voucher, referral reward, weekly drop promo. |
| Admin | Products, orders, users, vouchers, referrals, basic analytics. |
| Fraud control | Block self-referral, reward only after completed paid order. |

### MVP Out of Scope

- Full native iOS/Android app.
- Multi-level public cash income system.
- Advanced AI personalization.
- Full warehouse-level inventory forecasting.
- Automated payout to bank accounts.
- Franchise ERP system.
- Complex loyalty marketplace.

---

## 6. Recommended Technology Stack

The recommended first version is a **PWA / mobile-first web app**. This is faster to launch, easier to open from QR/WhatsApp/TikTok/Instagram, and cheaper to iterate.

### 6.1 Recommended Stack — Custom Build

| Layer | Recommendation |
|---|---|
| Frontend | Next.js + React + TypeScript + PWA support |
| Backend API | NestJS + TypeScript |
| Database | PostgreSQL |
| Cache / Queue | Redis + BullMQ or equivalent queue worker |
| ORM | Prisma or TypeORM |
| Auth | Phone OTP provider, Firebase Auth, or custom OTP service |
| Payments | Billplz, ToyyibPay, Stripe where applicable |
| Storage | S3-compatible object storage |
| Messaging | WhatsApp Cloud API / ManyChat integration |
| Analytics | PostHog + GA4 + internal reporting tables |
| Push | Firebase Cloud Messaging for PWA/native phase |
| Admin | Custom React dashboard or React Admin |
| Deployment | Docker + managed hosting / VPS / cloud platform |

### 6.2 Alternative Startup Stack

For a very early validation stage:

| Layer | Option |
|---|---|
| Landing + ordering | Simple Next.js app / Bubble / Softr / Glide |
| Database | Supabase / Airtable |
| Automation | Make / Zapier |
| Payment | Billplz / ToyyibPay |
| WhatsApp | ManyChat / WhatsApp Cloud API |
| Dashboard | Airtable Interface / Looker Studio |

---

## 7. Suggested Repository Structure

This is the proposed monorepo structure for the custom build.

```text
dowgnut-club/
├── README.md
├── PRD.md
├── ARCHITECTURE.md
├── package.json
├── pnpm-workspace.yaml
├── docker-compose.yml
├── .env.example
├── apps/
│   ├── web/                    # Customer PWA
│   │   ├── src/
│   │   │   ├── app/             # Next.js routes
│   │   │   ├── components/      # UI components
│   │   │   ├── features/        # Feature modules
│   │   │   ├── lib/             # API client/helpers
│   │   │   └── styles/          # Brand tokens/global CSS
│   │   └── public/
│   ├── admin/                  # Admin/ops dashboard
│   │   └── src/
│   └── api/                    # NestJS backend API
│       ├── src/
│       │   ├── modules/
│       │   │   ├── auth/
│       │   │   ├── users/
│       │   │   ├── products/
│       │   │   ├── orders/
│       │   │   ├── payments/
│       │   │   ├── wallet/
│       │   │   ├── referrals/
│       │   │   ├── campaigns/
│       │   │   ├── creators/
│       │   │   ├── drops/
│       │   │   ├── group-orders/
│       │   │   ├── notifications/
│       │   │   ├── fraud/
│       │   │   └── admin/
│       │   ├── common/
│       │   └── main.ts
│       └── prisma/
├── packages/
│   ├── ui/                     # Shared DOWGNUT UI components
│   ├── config/                 # Shared lint/ts/config
│   ├── types/                  # Shared TypeScript types
│   └── utils/                  # Shared utility functions
├── infra/
│   ├── docker/
│   ├── nginx/
│   └── scripts/
└── docs/
    ├── brand/
    ├── api/
    └── operations/
```

---

## 8. Environment Variables

Create `.env.example` before development begins.

```bash
# App
NODE_ENV=development
APP_NAME="DOWGNUT CLUB"
APP_URL=http://localhost:3000
ADMIN_URL=http://localhost:3001
API_URL=http://localhost:4000

# Database
DATABASE_URL=postgresql://postgres:postgres@localhost:5432/dowgnut_club
REDIS_URL=redis://localhost:6379

# Auth / OTP
OTP_PROVIDER=mock
OTP_API_KEY=
OTP_SENDER_ID=DOWGNUT
OTP_EXPIRY_MINUTES=5

# Payment
PAYMENT_PROVIDER=billplz
BILLPLZ_API_KEY=
BILLPLZ_COLLECTION_ID=
BILLPLZ_CALLBACK_URL=http://localhost:4000/payments/webhooks/billplz
TOYYIBPAY_SECRET_KEY=
TOYYIBPAY_CATEGORY_CODE=
STRIPE_SECRET_KEY=
STRIPE_WEBHOOK_SECRET=

# Storage
S3_ENDPOINT=
S3_ACCESS_KEY_ID=
S3_SECRET_ACCESS_KEY=
S3_BUCKET=dowgnut-assets
S3_REGION=ap-southeast-1

# Messaging
WHATSAPP_PROVIDER=mock
WHATSAPP_CLOUD_API_TOKEN=
WHATSAPP_PHONE_NUMBER_ID=
MANYCHAT_API_KEY=

# Analytics
POSTHOG_KEY=
POSTHOG_HOST=https://app.posthog.com
GA_MEASUREMENT_ID=

# Security
JWT_SECRET=change-me
JWT_EXPIRES_IN=7d
ADMIN_JWT_SECRET=change-me-admin
ENCRYPTION_KEY=change-me-32-char-key

# AI
AI_PROVIDER=disabled
OPENAI_API_KEY=
AI_MODEL=
```

---

## 9. Local Development Setup

> These commands assume a Node.js monorepo using `pnpm`, Next.js and NestJS. Adjust if the final team chooses a different stack.

### 9.1 Prerequisites

- Node.js 20+
- pnpm 9+
- PostgreSQL 15+
- Redis 7+
- Docker Desktop, optional but recommended
- Git

### 9.2 Install Dependencies

```bash
pnpm install
```

### 9.3 Start Local Services

```bash
docker compose up -d postgres redis
```

### 9.4 Configure Environment

```bash
cp .env.example .env
```

Edit `.env` with local credentials.

### 9.5 Run Database Migrations

```bash
pnpm db:migrate
pnpm db:seed
```

### 9.6 Start Development Apps

```bash
pnpm dev
```

Expected local URLs:

| App | URL |
|---|---|
| Customer PWA | `http://localhost:3000` |
| Admin Dashboard | `http://localhost:3001` |
| Backend API | `http://localhost:4000` |
| API Docs | `http://localhost:4000/docs` |

---

## 10. Suggested Package Scripts

```json
{
  "scripts": {
    "dev": "turbo dev",
    "build": "turbo build",
    "lint": "turbo lint",
    "test": "turbo test",
    "typecheck": "turbo typecheck",
    "format": "prettier --write .",
    "db:migrate": "pnpm --filter api prisma migrate dev",
    "db:seed": "pnpm --filter api prisma db seed",
    "db:studio": "pnpm --filter api prisma studio"
  }
}
```

---

## 11. API Overview

The backend should expose versioned REST APIs. GraphQL can be considered later, but REST is simpler for MVP, admin dashboards, mobile apps and third-party integrations.

### 11.1 Core Endpoint Groups

| Group | Example Endpoints |
|---|---|
| Auth | `POST /v1/auth/request-otp`, `POST /v1/auth/verify-otp`, `GET /v1/auth/me` |
| Products | `GET /v1/products`, `GET /v1/products/:id`, `GET /v1/outlets/:id/products` |
| Orders | `POST /v1/checkout`, `GET /v1/orders`, `PATCH /v1/admin/orders/:id/status` |
| Wallet | `GET /v1/wallet`, `GET /v1/wallet/transactions`, `GET /v1/stamps` |
| Vouchers | `GET /v1/vouchers`, `POST /v1/vouchers/redeem` |
| Referral | `GET /v1/referral/me`, `POST /v1/referral/apply-code`, `GET /v1/referral/share-poster` |
| Creator | `POST /v1/creator/apply`, `GET /v1/creator/dashboard`, `POST /v1/creator/payouts` |
| Drops | `GET /v1/drops`, `POST /v1/drops/:id/waitlist` |
| Group Orders | `POST /v1/group-orders`, `POST /v1/group-orders/:id/join` |
| AI | `POST /v1/ai/flavor-match`, `POST /v1/ai/build-box` |
| Admin | `GET /v1/admin/reports/sales`, `GET /v1/admin/referrals` |

---

## 12. Reward & Referral Rules

### 12.1 Customer Rewards

Normal customers should receive **vouchers, coins, stamps, free items or store credit**, not public multi-level cash income.

| Action | Reward Example |
|---|---|
| Signup | First purchase voucher. |
| First completed order | DOWG Coins + stamp. |
| Refer 1 friend who completes first order | Free topping or voucher. |
| Refer 3 friends | Free mini box. |
| Complete 5 eligible orders | Free donut/box voucher. |
| Join secret drop waitlist | Early access or badge. |

### 12.2 Creator / Agent Rewards

Approved creators or agents can receive direct commission from their own attributed orders.

| Product Type | Commission Example |
|---|---|
| Single donut | RM0.30–RM0.50 |
| Mini box | RM1.00 |
| Regular box | RM2.00 |
| Party box | RM4.00–RM5.00 |
| Event/bulk order | 5–10% after approval |

### 12.3 Reward Trigger Conditions

A referral reward or creator commission should trigger only when:

1. Referred user is phone-verified.
2. Order is paid.
3. Order status becomes `completed`.
4. Refund/cancellation window has passed, if applicable.
5. Fraud checks pass.
6. Code is valid and active at the time of attribution.

---

## 13. Core Business Flows

### 13.1 New Customer Flow

```text
Open QR / link
→ View DOWGNUT CLUB™ landing
→ Enter phone number
→ Verify OTP
→ Claim first voucher
→ Browse menu
→ Checkout
→ Pay
→ Order completed
→ Wallet updated
→ DOWG Code available to share
```

### 13.2 Referral Flow

```text
Existing user shares DOWG Code
→ Friend opens link
→ Code pre-applied
→ Friend signs up
→ Friend places first completed paid order
→ System checks fraud rules
→ Referrer receives reward
→ Friend receives first purchase reward if campaign allows
```

### 13.3 Creator Flow

```text
User applies as creator
→ Admin reviews profile
→ Admin approves creator status
→ Creator receives code + campaign kit
→ Creator shares content
→ Orders use creator code
→ Commission created as pending
→ Hold period passes
→ Admin approves payout
→ Creator receives payout
```

### 13.4 Drop Flow

```text
Admin creates limited drop
→ Drop appears with countdown
→ Users join waitlist or order
→ Stock meter updates
→ VIP users may receive early access
→ Drop sells out or expires
→ Reports show sales, conversion, waitlist and repeat rate
```

### 13.5 Group Order Flow

```text
Customer starts Box Party
→ Receives shareable link
→ Friends join and add items
→ Group target unlocks reward/free delivery
→ Host or each participant pays
→ Order is prepared as one bulk order
→ Host receives group reward
```

---

## 14. Brand & UI Direction

DOWGNUT visual identity should feel **street, bold, playful, authentic and high-energy**.

### 14.1 Brand Assets

| Asset | Usage |
|---|---|
| Full graffiti wordmark | Splash screen, homepage header, packaging, hero visuals. |
| Dripping donut icon | App icon, favicon, loading state, badge, wallet icon. |
| Donut monogram pattern | Background texture, reward cards, packaging, merch. |
| Lime/pink/sapphire palette | Main UI energy and call-to-action hierarchy. |

### 14.2 UI Rules

- Use lime as brand energy, not as full-screen fatigue everywhere.
- Use cream/off-white cards for readability.
- Use sapphire blue for primary text and strong CTA buttons.
- Use pink for reward highlights, badges and drop alerts.
- Use rounded cards and sticker-style components.
- Keep checkout clean, fast and low-friction.
- Make share, QR and DOWG Code actions obvious.

### 14.3 Key UI Components

| Component | Purpose |
|---|---|
| Product Drop Card | Show limited flavour, stock, countdown and CTA. |
| DOWG Wallet Card | Show coins, vouchers, stamps and freebie vault. |
| DOWG Code Card | Show personal code, QR and share poster action. |
| Rank Badge | Show customer status and next unlock. |
| Group Order Card | Start/join Box Party. |
| Creator Stat Card | Orders, sales, commission and conversion. |

---

## 15. Security, Fraud & Compliance

### 15.1 Security Baseline

- Enforce HTTPS in production.
- Store passwords only if password login exists; otherwise prefer OTP/session tokens.
- Use secure JWT/session cookies with expiry and refresh flow.
- Protect admin routes with role-based access control.
- Validate all inputs server-side.
- Keep webhook endpoints signed and idempotent.
- Encrypt sensitive tokens/secrets.
- Maintain audit logs for admin changes.

### 15.2 Anti-Fraud Controls

| Risk | Control |
|---|---|
| Self-referral | Block same phone/user/device/payment method where possible. |
| Voucher farming | One new-user voucher per verified phone/device/payment identity. |
| Fake orders | Reward only after paid and completed order. |
| Refund abuse | Reverse reward on refund/cancellation. |
| Creator spam | Admin can suspend creator/code. |
| Partner manipulation | Stock and order settlement reconciliation. |

### 15.3 Malaysia Compliance Guardrail

DOWGNUT CLUB™ should avoid public language that sounds like a recruitment-based income scheme. Use:

- “Rewards” for normal customers.
- “Creator commission” for approved creators.
- “Partner margin” for approved partners.
- “Store credit” or “voucher” for normal customer referrals.

Avoid:

- Public “5-tier income” claims without legal review.
- Rewards for recruitment without actual product sale.
- Cash promises that look like pyramid or direct-selling claims.

---

## 16. Analytics & Reporting

### 16.1 Growth Metrics

- New signups.
- First purchase conversion.
- Referral signups.
- Referral first order conversion.
- DOWG Code shares.
- Creator-driven sales.
- Campaign conversion.

### 16.2 Revenue Metrics

- Daily/weekly/monthly GMV.
- Average order value.
- Net revenue after discounts.
- Voucher redemption cost.
- Repeat purchase rate.
- Group order GMV.

### 16.3 Operational Metrics

- Order preparation time.
- Stock-out rate.
- Cancel/refund rate.
- Top-selling products.
- Outlet performance.
- Campaign margin impact.

### 16.4 Fraud Metrics

- Blocked referrals.
- Suspicious device/payment clusters.
- Reversed commissions.
- Payout disputes.
- Creator/code suspension events.

---

## 17. Testing Strategy

### 17.1 Unit Tests

Focus on:

- Reward rule calculations.
- Voucher eligibility.
- Referral attribution.
- Commission calculation.
- Order status transitions.
- Payment webhook idempotency.

### 17.2 Integration Tests

Focus on:

- Signup → voucher → order → wallet update.
- Referral link → friend order → reward event.
- Checkout → payment webhook → completed order.
- Creator code → commission creation → payout request.
- Admin product/campaign changes.

### 17.3 End-to-End Tests

Critical user journeys:

- New customer first order.
- Repeat customer reorder.
- Customer referral reward.
- Admin creates voucher/drop.
- Staff updates order status.
- Creator checks dashboard.

### 17.4 Manual QA Checklist

- Mobile responsiveness.
- QR signup from real phone camera.
- WhatsApp share link preview.
- Voucher expiry and restrictions.
- Payment callback behavior.
- Admin permission restrictions.
- Basic accessibility and contrast.

---

## 18. Deployment Checklist

Before production launch:

- [ ] Production database provisioned.
- [ ] Redis/queue worker running.
- [ ] `.env` secrets configured securely.
- [ ] HTTPS and domain configured.
- [ ] Payment webhook tested in live/sandbox mode.
- [ ] OTP provider tested.
- [ ] Admin roles created.
- [ ] Products and outlet data seeded.
- [ ] First voucher campaign configured.
- [ ] Referral reward rules configured.
- [ ] Fraud rules enabled.
- [ ] Analytics events verified.
- [ ] Backup policy configured.
- [ ] Error monitoring enabled.
- [ ] Privacy and terms pages prepared.

---

## 19. Roadmap

### Phase 0 — Foundation

- Finalize PRD, README, architecture.
- Confirm stack and hosting.
- Design Figma system based on logo/brand.
- Create database schema.
- Build authentication, user profile, product catalogue.

### Phase 1 — MVP Viral Commerce

- Customer PWA.
- Menu, cart, checkout.
- Wallet: coins, stamps, vouchers.
- DOWG Code referral system.
- Admin dashboard.
- First campaign and basic reports.

### Phase 2 — Growth System

- Creator dashboard.
- Group order / Box Party.
- Secret drops, countdown and waitlist.
- Push/WhatsApp notifications.
- Leaderboards and challenges.

### Phase 3 — Scale System

- Partner counter dashboard.
- Multi-outlet inventory.
- Advanced analytics.
- AI flavor match and smart box builder.
- Native mobile apps, if traction justifies it.

---

## 20. Development Standards

### 20.1 Naming

- Use clear domain names: `orders`, `wallet`, `referrals`, `campaigns`, `creators`.
- Avoid generic names like `data`, `stuff`, `helper2`.
- Use consistent status enums.

### 20.2 Code Quality

- TypeScript strict mode.
- Input validation on all APIs.
- Centralized error handling.
- Automated formatting and linting.
- Meaningful test coverage for money/reward logic.
- No business-critical calculations only on frontend.

### 20.3 Git Workflow

Recommended branches:

```text
main        # production-ready
staging     # pre-production testing
feature/*   # new features
fix/*       # bug fixes
hotfix/*    # urgent production fixes
```

Recommended commit style:

```text
feat(wallet): add stamp reward calculation
fix(referral): block self referral by verified phone
chore(api): add payment webhook logging
```

---

## 21. Glossary

| Term | Meaning |
|---|---|
| DOWG Code | Personal referral/creator/partner code. |
| DOWG Wallet | Coins, vouchers, stamps, freebies and reward history. |
| DOWG Coins | Loyalty points for completed eligible orders. |
| Freebie Vault | User’s available free items and special rewards. |
| Glaze Drop | Limited-time flavour/product campaign. |
| Secret Stash | Secret menu or locked rewards area. |
| Box Party | Group order link for office/campus/community buying. |
| Pack Leaderboard | Ranking of referrers, creators or campaign participants. |
| Creator Hub | Dashboard for approved creators/agents. |
| Partner Counter | Approved external counter/kiosk/cafe selling DOWGNUT. |

---

## 22. Final Note

The first version of DOWGNUT CLUB™ should stay focused on the simplest powerful loop:

> **QR → Signup → First Voucher → Order → DOWG Code → Friend Order → Reward → Repeat.**

Once that loop works, every advanced feature — creator commission, Box Party, secret drops, AI flavour match and partner counters — becomes easier to scale. 🍩🚀


---

## Hermes Agent Integration

DOWGNUT CLUB™ includes a planned Hermes Agent integration for three AI assistants:

| Assistant | Audience | Purpose |
|---|---|---|
| **DOWG Buddy** | Members/customers | Menu help, flavour match, voucher explanation, order support, referral help. |
| **DOWG Creator Coach** | Creators/agents | Campaign briefs, captions, code performance, payout explanation, content ideas. |
| **DOWGNUT Operator** | Owner/admin | Sales summaries, product insights, campaign strategy, inventory alerts, fraud review. |

Recommended pattern:

```text
Frontend / WhatsApp
→ DOWGNUT Backend AI Gateway
→ Hermes Agent API Server / Gateway
→ DOWGNUT MCP Tool Server
→ DOWGNUT Backend Modules / Database
```

Important rules:

- Do not expose Hermes API keys to the browser.
- Public users must not have terminal/tool access.
- Use role-based MCP tools for member, creator and owner workflows.
- Owner write actions such as campaigns, payouts and broadcasts must require explicit approval.

See [`HERMES_AGENT_INTEGRATION.md`](./HERMES_AGENT_INTEGRATION.md) and [`AGENTS.md`](./AGENTS.md).
