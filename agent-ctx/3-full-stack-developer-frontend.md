# Task 3 — full-stack-developer (frontend) — work record

## Task
Build the entire DowgNut frontend as a single-page SPA on the `/` route (Next.js 16 App Router). Splash, header, hero carousel, filter bar, donut grid/cards, detail modal with reviews, cart drawer, favorites, checkout, orders, real-time WebSocket order tracking, AI concierge, AI designer, AI flavor match, admin dashboard with recharts, sticky footer. Zustand store + apiFetch helper. Mobile-first, brand-faithful.

## Files created (20)
- `src/lib/api.ts` — apiFetch(path, init) injecting x-session-id header from localStorage `dowgnut-session`; throws ApiError on non-2xx with server error message.
- `src/store/use-shop.ts` — Zustand store with persist (only sessionId + splashDone persisted). All state + actions: view switching, splash, catalog filter/sort/search, cart CRUD, favorites toggle, detail modal, checkout, orders, tracking, AI helpers.
- `src/components/dowgnut/splash-screen.tsx`
- `src/components/dowgnut/dowgnut-header.tsx` — sticky header + mobile Sheet nav
- `src/components/dowgnut/hero-carousel.tsx` — 3-slide auto-rotating, AnimatePresence
- `src/components/dowgnut/filter-bar.tsx` — pills + sort Select + search Input
- `src/components/dowgnut/donut-card.tsx`
- `src/components/dowgnut/donut-grid.tsx` — skeleton + empty states
- `src/components/dowgnut/detail-modal.tsx` — image rotate, reviews list + form, related donuts
- `src/components/dowgnut/cart-drawer.tsx` — qty steppers + free-delivery progress + checkout
- `src/components/dowgnut/favorites-view.tsx`
- `src/components/dowgnut/checkout-view.tsx` — form + summary, validates required fields
- `src/components/dowgnut/orders-view.tsx`
- `src/components/dowgnut/order-tracking-view.tsx` — socket.io real-time + 5s fallback polling
- `src/components/dowgnut/ai-concierge.tsx` — FAB + Sheet chat
- `src/components/dowgnut/ai-designer.tsx` — Dialog with image gallery
- `src/components/dowgnut/ai-flavor-match.tsx` — shop-page banner
- `src/components/dowgnut/admin-dashboard.tsx` — recharts Line/Bar/Pie + Table
- `src/components/dowgnut/dowgnut-footer.tsx` — mt-auto sticky footer
- `src/app/page.tsx` — single route wiring everything; useEffect → store.init()

## WebSocket connection string (exact)
```ts
io('/?XTransformPort=3004', {
  transports: ['websocket', 'polling'],
  reconnection: true,
  forceNew: true,
})
```
Path is `/`. No port in URL. XTransformPort=3004 in query. Emits `track-order { orderId, customerName }` on connect, listens `order-status`. Defensive 5s fallback to REST polling `/api/orders/[id]` every 3s.

## Verification
- Dev server: Next.js 16.1.3 Turbopack on :3000. Compiles clean. `GET /` 200, `GET /api/donuts?...` 200, `GET /api/admin/stats` 200.
- Order-tracking mini-service: `curl http://localhost:3004/health` → `{"ok":true,"service":"dowgnut-order-tracking"}` ✓
- Lint: `bun run lint` → **0 errors, 0 warnings** (after removing unused `eslint-disable-next-line @next/next/no-img-element` comments since that rule isn't enabled in this project).

## Brand adherence
- Pink (#F05A9B) for primary CTAs, blue (#07579B) for secondary/price pills, lime (#E8F866) for accents, cream (#FFF9E8) for cards, navy (#07334F) for text. No indigo/blue-violet outside the brand palette.
- `.graffiti-text` used for all big headings (splash wordmark, section titles, hero, stat cards, command center).
- `.animate-float`, `.animate-spin-slow`, `.animate-wiggle`, `.lime-bg-grid`, `.drip-shadow`, `.brand-stroke`, `.scrollbar-dowgnut` all used.
- Mobile-first: every view tested at 390px. Grids → 2 cols, header → hamburger Sheet, hero scales, stepper stacks vertically, checkout stacks to 1 col. No horizontal overflow. All interactive elements ≥44px touch targets.
- Sticky footer via layout `min-h-screen flex flex-col` + footer `mt-auto`.

## Known issues / notes
- None blocking.
- Prisma client logs every query to stdout (Task 1 set `log: ['query']` in db.ts) — noisy but harmless, out of scope.
- AI designer image generation can take 10-20s; spinner shown but no progress bar.
- Admin dashboard has no auth gate — anyone can hit `/api/admin/stats`. Out of scope but flagged.
- Splash replays only once per browser (persisted splashDone). To replay, clear localStorage `dowgnut-shop`.
- All `<img>` are plain `<img>` (not next/image) — appropriate for the brand mascot + external donut URLs; project's eslint doesn't enforce no-img-element anyway.
- "Buy now" = add to cart + close modal + open cart drawer.
- "Order again" (delivered state) = sequential `addToCart(donutId, qty)` for each OrderItem, then opens cart + returns to shop.
