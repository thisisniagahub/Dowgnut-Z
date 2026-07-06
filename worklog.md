# DowgNut-F Improvement Worklog

Source repo: https://github.com/thisisniagahub/Dowgnut-F.git (cloned to /tmp/Dowgnut-F)
Original: Flutter donut shopping app (Dart) — mobile-first, Provider state, hardcoded data, no persistence, no AI, no real-time.

## Rebuild Goal
Rebuild as an advanced Next.js 16 web app preserving the DowgNut brand identity, adding:
- Full e-commerce with Prisma/SQLite persistence (cart with quantities, favorites, orders, reviews)
- AI Concierge chatbot (LLM) — recommends donuts from natural-language cravings
- AI Donut Designer (Image Generation) — generates custom donut concepts
- AI Flavor Match (LLM) — smart recommendation engine
- Real-time order tracking via WebSocket mini-service (port 3003)
- Admin analytics dashboard (charts)
- Polished splash + responsive mobile-first UX + sticky footer

## Brand System (preserved from original)
- DowgNut Blue `#07579B` (primary)
- Frosting Pink `#F05A9B` (secondary/CTA)
- Neon Lime `#E8F866` (energy/splash bg)
- Dark Navy `#07334F` (text/icons)
- Cream Surface `#FFF9E8` (cards)
- Tagline: "GOOD VIBES & GOOD DOWG"
- Sub-tagline: "BOLD PLAYFUL AUTHENTIC"

## Flavor categories: classic, sprinkled, stuffed (+ new: specialty)

---
Task ID: 1
Agent: main (Z.ai Code)
Task: Foundation — prisma schema, brand theme, layout, types, deps install

Work Log:
- Reviewed original Flutter source (main.dart, utilities.dart, models, services, theme, pages, splash)
- Captured brand palette + tagline + flavor taxonomy
- Planning prisma schema: Donut, CartItem, Favorite, Order, OrderItem, Review
- Installing socket.io + socket.io-client for real-time order tracking
- Writing brand CSS variables into globals.css
- Updating layout metadata to DowgNut brand
- Defining shared TypeScript types in src/lib/types.ts

Stage Summary:
- Foundation files written; ready for backend + frontend subagents.

---
Task ID: 2-b
Agent: full-stack-developer (websocket)
Task: Build real-time order-tracking WebSocket mini-service on port 3004 for DowgNut — simulates order lifecycle (preparing→baking→out_for_delivery→delivered) and pushes status updates to per-order rooms.

Work Log:
- Read worklog.md (Task 1 = foundation: prisma schema, brand theme, types — done)
- Studied examples/websocket/server.ts + frontend.tsx for socket.io setup pattern (path:'/', cors:*, pingTimeout, XTransformPort convention)
- Created mini-services/order-tracking/ as independent bun project
- Wrote package.json (name: dowgnut-order-tracking, type: module, dev: bun --hot index.ts, dep: socket.io ^4.8.3)
- Wrote index.ts implementing the full spec:
  * Map<orderId, OrderState> with step, startedAt, sockets Set, timers array, deliveredAt, deliveredCleanupTimer, emptyCleanupTimer
  * STATUSES = [preparing, baking, out_for_delivery, delivered]
  * STEP_DELAYS_MS = [0, 8000, 18000, 30000]
  * ETA_MINUTES = {preparing:18, baking:10, out_for_delivery:4, delivered:0}
  * MESSAGES per spec (DowgNut-flavored with emojis)
  * track-order: joins room order:<orderId>; if existing, adds socket + cancels empty-cleanup + emits current step computed from elapsed; if new, creates entry, emits step 0, schedules setTimeouts for steps 1/2/3
  * stop-tracking: leaves room, removes socket, schedules empty-cleanup (120s) if no sockets remain
  * disconnect: removes socket from all tracked orders, schedules empty-cleanup if set becomes empty (timers keep running)
  * on step 3 (delivered): emits, clears remaining timers, sets deliveredAt, schedules delivered-cleanup (60s) — entry kept so late joiners see "delivered"
  * graceful SIGTERM/SIGINT shutdown (clears all timers, closes io + httpServer)
- Health endpoint: discovered that the task's suggested `httpServer.on('request', ...)` approach does NOT work — engine.io's attach() replaces all 'request' listeners with its own that intercepts EVERY request matching path '/' (i.e. all URLs) and routes them through handleRequest, which writes a 400 "Transport unknown" for non-socket.io requests before any later listener can run. Fix: used `io.engine.use(...)` middleware (runs inside handleRequest BEFORE the verify step) — for /health we write 200 + end + skip next(); for everything else we call next() and socket.io flows normally. Documented this in a comment block.
- Ran `bun install` in the mini-service (22 packages, lockfile saved)
- Started service in background via nohup bun run dev > service.log
- Verified: GET /health → 200 {"ok":true,"service":"dowgnut-order-tracking"}
- End-to-end test via temporary socket.io-client script: emitted track-order, received 4 order-status events with correct timing (preparing@0s, baking@8s, out_for_delivery@18s, delivered@30s) and exact payloads matching spec. Test file removed.

Stage Summary:
- Files created:
  * /home/z/my-project/mini-services/order-tracking/package.json
  * /home/z/my-project/mini-services/order-tracking/index.ts
  * /home/z/my-project/mini-services/order-tracking/service.log (runtime log)
  * /home/z/my-project/mini-services/order-tracking/bun.lock (auto)
  * /home/z/my-project/mini-services/order-tracking/node_modules/ (socket.io + deps)
- Port: 3004 (listening, verified)
- Health: GET /health → 200 {"ok":true,"service":"dowgnut-order-tracking"} ✓
- Protocol for the frontend (Next.js app on port 3000):
  * Connect: `io('/?XTransformPort=3004', { transports:['websocket','polling'], reconnection:true })` — path MUST be '/', never put port in URL
  * Emit `track-order` { orderId: string, customerName: string } after checkout → server joins socket to room `order:<orderId>` and immediately emits current `order-status`
  * Listen for `order-status` { orderId, status: "preparing"|"baking"|"out_for_delivery"|"delivered", step: 0|1|2|3, etaMinutes, message, updatedAt(ISO string) }
  * Emit `stop-tracking` { orderId: string } when user leaves the tracking page
  * Timeline: preparing@0s → baking@8s → out_for_delivery@18s → delivered@30s
  * etaMinutes: preparing=18, baking=10, out_for_delivery=4, delivered=0
  * Late joiners (within 60s after delivered) receive the delivered status immediately; refreshes mid-flow receive the correct current step computed from elapsed time
- Service is running in background (PID verified via pgrep). Will auto-reload on file changes via `bun --hot`.

---
Task ID: 2-a
Agent: full-stack-developer (backend)
Task: Build all API routes (donuts, cart, favorites, orders, admin stats, AI concierge/match/designer) + idempotent seed script + session/serialize/ai helpers.

Work Log:
- Read worklog + types + schema to confirm contracts (Task 1 done).
- Added `src/lib/session.ts` — getSessionId reads x-session-id header, falls back to crypto.randomUUID().
- Added `src/lib/serialize.ts` — Prisma row → typed API mappers (serializeDonut/CartItem/Favorite/Order/Review) with parseTags/joinTags for comma-string ↔ string[] conversion.
- Added `src/lib/ai.ts` — shared AI helpers: getCatalogForPrompt (compact JSON), callChat (glm-4.6 → default fallback), parseDonutBlock (`|||DONUTS||[...]|||END|||`), parseJsonArray.
- Wrote `prisma/seed.ts` — 21 donuts (5 classic, 5 sprinkled, 5 stuffed, 6 specialty reusing image URLs), 5 featured, upsert by name, try/finally db.$disconnect.
- Hit "Argument where needs id" from upsert — name was not unique. Added `@unique` to Donut.name in schema.prisma and re-pushed with --accept-data-loss. Regenerated Prisma client.
- Wrote 14 API route files (donuts list/get/reviews, cart GET/POST + [id] PATCH/DELETE, favorites GET/POST + [id] DELETE, orders POST/GET + [id] GET + [id]/status PATCH, admin/stats GET, ai/concierge POST, ai/match POST, ai/designer POST).
- All Next.js 16 dynamic routes use `params: Promise<{id:string}>` and `await params`.
- Order POST runs in a single $transaction: create order+items (snapshot name/price/imgUrl), decrement donut stock, clear session cart. Validates stock first → 409 on insufficient.
- Admin stats computes totalRevenue, totalOrders, totalItems, avgOrderValue, topDonuts (top 5 by qty), salesByType (via OrderItem.donut join), recentOrders (last 8), hourlyRevenue (24 buckets).
- AI concierge injects catalog JSON in system prompt, parses the `|||DONUTS||...|||END|||` block, strips it from reply, looks up real Donut rows by id (preserving model order).
- AI match asks LLM for ONLY a JSON array of 3 picks; defensive fallback to top-3 by rating if parse fails or no valid picks.
- AI designer uses zai.images.generations.create (1024x1024) with graffiti style prefix, returns data:image/png;base64,... URI; try/catch → 500 with message.
- Ran `bun prisma/seed.ts` → "Inserted 21, updated 0. Total donuts in DB: 21" ✓
- Ran `bun run lint` → clean (no errors, no warnings).

Stage Summary:
- Files created (18 total):
  - prisma/seed.ts
  - src/lib/session.ts
  - src/lib/serialize.ts
  - src/lib/ai.ts
  - src/app/api/donuts/route.ts
  - src/app/api/donuts/[id]/route.ts
  - src/app/api/donuts/[id]/reviews/route.ts
  - src/app/api/cart/route.ts
  - src/app/api/cart/[id]/route.ts
  - src/app/api/favorites/route.ts
  - src/app/api/favorites/[id]/route.ts
  - src/app/api/orders/route.ts
  - src/app/api/orders/[id]/route.ts
  - src/app/api/orders/[id]/status/route.ts
  - src/app/api/admin/stats/route.ts
  - src/app/api/ai/concierge/route.ts
  - src/app/api/ai/match/route.ts
  - src/app/api/ai/designer/route.ts
- Schema modified: added `@unique` to Donut.name (required for upsert-by-name idempotency; re-pushed + regenerated).
- Seed: 21 donuts inserted ✓ (5 classic, 5 sprinkled, 5 stuffed, 6 specialty; 5 featured).
- Lint: clean ✓.
- Decisions / quirks for the frontend agent to know:
  - Cart/favorites read sessionId from `x-session-id` request header (NOT body). Frontend must persist a sessionId (localStorage) and send it on every cart/favorites/orders request. The API will generate one on the fly if missing, but the client should send one to keep state stable.
  - Donut.tags is exposed as string[] in JSON; client sends plain arrays where applicable (e.g. if writing a donut).
  - Order POST accepts sessionId in the body (per task spec) — frontend should pass the same x-session-id value as body.sessionId.
  - Favorites DELETE uses [id] = donutId (not favorite row id) and scopes by session.
  - AI concierge returns { reply, donuts: Donut[] } — donuts is empty when the model chose not to recommend any.
  - AI designer returns { imageUrl } as a data URI (base64 PNG, ~1-2MB) — display directly in <img src=...>.
  - All 500 responses return { error: string } — frontend can read .error from JSON for messages.
  - Prisma client logs queries to stdout (log:['query'] in db.ts from Task 1) — noisy in dev.log but harmless; not modified by this task.

---
Task ID: 3
Agent: full-stack-developer (frontend)
Task: Build the entire DowgNut frontend as a single-page SPA on the `/` route — splash, header, hero carousel, filter bar, donut grid/cards, detail modal with reviews, cart drawer, favorites view, checkout, orders, real-time WebSocket order tracking, AI concierge, AI designer, AI flavor match, admin dashboard with recharts, and sticky footer. Zustand store + apiFetch helper. Mobile-first, brand-faithful.

Work Log:
- Read worklog.md (Tasks 1, 2-a, 2-b done: prisma + 21 donuts seeded, all API routes, WebSocket order-tracking mini-service on :3004 with the documented protocol).
- Read existing globals.css (brand tokens + graffiti utilities), layout.tsx (Archivo Black + Geist + Toaster + min-h-screen flex flex-col), use-toast.ts, types.ts, ui/sheet.tsx, ui/dialog.tsx, ui/button.tsx, ui/card.tsx, ui/select.tsx, ui/skeleton.tsx, ui/progress.tsx, ui/badge.tsx, ui/input.tsx, ui/textarea.tsx, ui/table.tsx, ui/scroll-area.tsx, ui/chart.tsx, and the actual route implementations to confirm contracts.
- Confirmed API contracts: cart/favorites read x-session-id header; orders POST also wants body.sessionId; favorites DELETE [id] is donutId; cart PATCH/DELETE [id] is CartItem.id; AI designer returns data URI; AI concierge returns { reply, donuts[] }; AI match returns { donuts[], reasoning }.
- Wrote `src/lib/api.ts` — `apiFetch(path, init)` that injects `x-session-id` (read from localStorage `dowgnut-session`, generating a UUID v4 on first call), sets `Content-Type: application/json` when there's a body, parses JSON, throws `ApiError` with server `error` message on non-2xx. Exports `getSessionId` + `SESSION_KEY`.
- Wrote `src/store/use-shop.ts` — Zustand store with `persist` middleware (localStorage key `dowgnut-shop`, partializes only `sessionId` + `splashDone`). `onRehydrateStorage` writes sessionId back to `dowgnut-session` so `apiFetch` can read it. Implements every required state field + action: view switching, splash dismissal, filter/sort/search with auto-reload, init() that loads donuts+cart+favorites, openDetail/closeDetail, addReview, full cart CRUD, favorites toggle + isFavorite, checkout, loadOrders, startTracking/stopTracking, setConciergeOpen/setDesignerOpen, and the three AI helpers (aiMatch, aiConcierge, aiDesigner). View union = `'shop' | 'favorites' | 'checkout' | 'orders' | 'tracking' | 'admin'` per the corrected spec.
- Wrote `splash-screen.tsx` — full-screen lime-bright overlay with mascot (animate-float), graffiti "DOWGNUT" wordmark with brand-stroke + drop-shadow, tagline "GOOD VIBES & GOOD DOWG", sub "BOLD • PLAYFUL • AUTHENTIC", top/bottom paint-drip skewed bars. Auto-dismiss via 2600ms setTimeout; click-to-skip; framer-motion exit (fade+scale). AnimatePresence wraps so unmount animates.
- Wrote `dowgnut-header.tsx` — sticky top-0 z-40 header, blue bg, pink bottom border. Brand (mascot mini + graffiti wordmark) → setView('shop'). Desktop center nav: Shop / Favorites (with count badge) / Orders / Admin. Desktop search input. AI Designer button (Sparkles, lime). Cart button (pink, lime count badge). Mobile hamburger opens a Sheet with nav + search + concierge/designer CTAs. All touch targets ≥44px.
- Wrote `hero-carousel.tsx` — 3 slides auto-rotating every 5s with AnimatePresence (fade+scale). Slides use /brand/hero-banner.png, /brand/promo-1.png, /brand/promo-2.png. Slide 3 CTA opens concierge. Dot indicators, pause on hover, gradient overlay, graffiti headline.
- Wrote `filter-bar.tsx` — sticky top-16 z-30 pill bar. Flavor chips (All/Classic/Sprinkled/Stuffed/Specialty), selected = pink bg white text. Sort Select (Featured/Price↑/Price↓/Top rated/A-Z). Search Input with Search icon + clear (X) button. Cream bg with backdrop-blur.
- Wrote `donut-card.tsx` — shadcn Card, rounded-3xl, hover lift shadow. Image on lime-bright square, hover scale 110%. Favorite heart toggle (top-right). "Featured" star badge if applicable. Name (2-line clamp), star rating + calories. Price pill (blue). Add button (pink, Plus icon). Stock warnings (≤5 left / sold out). Click anywhere opens detail.
- Wrote `donut-grid.tsx` — responsive `grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4`. Skeleton loaders while fetching. Empty state with mascot + reset button.
- Wrote `detail-modal.tsx` — shadcn Dialog, max-w-4xl, 2-col layout (image | details). Left: rotating donut image (framer-motion rotate 360°/22s) on lime gradient + lime-bg-grid. Right: type badge, graffiti name, price pill, stars, calories, stock badge, description, tag badges, qty stepper, Add to cart + Buy now (buy now adds + opens cart), favorite toggle. Reviews section: list with author/stars/comment/date + form (name, rating Select 1-5, comment Textarea). Related donuts row (same type, exclude current, up to 4) as horizontal scroll mini-cards.
- Wrote `cart-drawer.tsx` — shadcn Sheet side=right. Blue header "Your Dowgs". Items list: thumbnail, name, unit price, qty stepper (−/value/+), X to remove, line total. Empty state with mascot. Footer: free-delivery progress bar (Progress component) showing "$X for free delivery" or "unlocked free delivery 🎉", subtotal, delivery (FREE or $3.99), total, Checkout button → setView('checkout') + close drawer. Clear cart button.
- Wrote `favorites-view.tsx` — section with "My Favorites" graffiti title + back button. Grid reusing DonutCard. Empty state with mascot + HeartCrack icon.
- Wrote `checkout-view.tsx` — 2-col layout (form | summary). Form: name/email/address/city/zip/notes with Labels. Validates required (name/email/address/city/zip) — toasts missing fields. Place order → checkout() → toast "Order placed! 🍩" → startTracking() → view='tracking'. Order summary card lists items + subtotal/delivery/total. Empty-cart guard.
- Wrote `orders-view.tsx` — list of past orders as cards: #short-id (graffiti), date, item count, customer, status badge (color-coded), top-3 item preview, total, "Track order" button → startTracking. Empty state with mascot + Package icon.
- Wrote `order-tracking-view.tsx` — THE REAL-TIME VIEW. Connects via `io('/?XTransformPort=3004', {transports:['websocket','polling'], reconnection:true, forceNew:true})`. On connect emits `track-order {orderId, customerName}`. Listens `order-status` and updates local payload (status, step, etaMinutes, message, updatedAt). Displays: connection badge (Live/Reconnecting), big animated status message (AnimatePresence on payload.message), 4-step horizontal-on-desktop/vertical-on-mobile stepper (Preparing/Baking/Out for delivery/Delivered) with CheckCircle2 (done), Loader2 spin (current), Circle (pending) and per-step subtext, ETA countdown ("~X min"), order items recap (fetched via /api/orders/[id]). Delivered state → celebratory panel + "Order again" button (re-adds items to cart + opens cart). DEFENSIVE: if socket fails to connect within 5s, starts polling /api/orders/[id] every 3s. On unmount: emits stop-tracking + disconnects socket + clears polling interval. Also seeds an initial payload from the REST order fetch so the UI shows something immediately even before the first socket event. No-order state with CTA buttons.
- Wrote `ai-concierge.tsx` — floating pink Sparkles FAB bottom-right (animate-wiggle on the icon) when closed. Opens shadcn Sheet side=right. Header: mascot + "DowgNut Concierge" + "Your AI donut whisperer". Message list with user (pink, right) / assistant (white, left) bubbles. Assistant bubbles with `donuts[]` render a horizontal scroll of mini-cards under the bubble (click → openDetail + close concierge). Suggested prompt chips shown until first user msg. Input + Send button. Loading spinner. Auto-scroll to bottom on new messages. Auto-intro message on first open.
- Wrote `ai-designer.tsx` — shadcn Dialog max-w-2xl. Title "AI Donut Designer" + description. Prompt Input + Generate button. Preset chips ("Galaxy glaze", "Rainbow explosion", "Matcha & gold leaf", "Spicy chili chocolate") that auto-fire generation. Loading spinner in aspect-square frame. On success: framed image card (lime gradient border) + "Generate another" button. Session gallery grid (last 6 images, click to re-display). Empty placeholder with ImageIcon.
- Wrote `ai-flavor-match.tsx` — section card on shop view. Pink→blue-dark gradient bg with lime-bg-grid overlay. Headline "Craving something? Tell the AI." + Input + "Match me" button. Quick prompt chips. On submit → POST /api/ai/match → shows 3 matched donuts as numbered cards (click → openDetail) + reasoning text. Loading + dismiss (X) states.
- Wrote `admin-dashboard.tsx` — fetches /api/admin/stats. 4 gradient stat cards (Total Revenue blue, Total Orders pink, Items Sold lime, Avg Order Value navy) with lucide icons. recharts LineChart (hourly revenue, pink line), BarChart (top donuts horizontal, blue bars), PieChart (sales by type, brand palette), and a shadcn Table for recent orders (id, customer, total, status badge, time). "DowgNut HQ — Command Center" graffiti title.
- Wrote `dowgnut-footer.tsx` — `mt-auto` footer, navy bg. 3 columns: brand (mascot + wordmark + tagline + blurb), quick links (Shop/Favorites/Orders/Admin/Cart wired to store), connect (Instagram/Twitter placeholders + address). Bottom bar: "© 2025 DowgNut — Good Vibes & Good Dowg" + "Built with AI 🍩".
- Rewrote `src/app/page.tsx` — single client route. Wires: SplashScreen, DowgnutHeader, main (switch on view: shop→HeroCarousel+FilterBar+AIFlavorMatch+DonutGrid; favorites/checkout/orders/tracking/admin), DowgnutFooter, then overlay components (DetailModal, CartDrawer, AIConcierge, AIDesigner). useEffect calls store.init() which loads donuts+cart+favorites.
- Init: ran the fullstack init script (dev.sh already running from prior tasks).
- Verified order-tracking service alive: `curl http://localhost:3004/health` → `{"ok":true,"service":"dowgnut-order-tracking"}` ✓.
- Dev server compiled clean: `/` returns 200, `/api/donuts` 200, `/api/admin/stats` 200. No compile errors in dev.log.
- Ran `bun run lint` → first pass had 20 "Unused eslint-disable directive" warnings (the `@next/next/no-img-element` rule isn't enabled in this project's eslint config, so the disable comments were unused). Cleaned them via `sed -i '/eslint-disable-next-line @next\/next\/no-img-element/d'` across all dowgnut components. Re-ran lint → **0 errors, 0 warnings**.

Stage Summary:
- Files created (20 total):
  - src/lib/api.ts
  - src/store/use-shop.ts
  - src/components/dowgnut/splash-screen.tsx
  - src/components/dowgnut/dowgnut-header.tsx
  - src/components/dowgnut/hero-carousel.tsx
  - src/components/dowgnut/filter-bar.tsx
  - src/components/dowgnut/donut-card.tsx
  - src/components/dowgnut/donut-grid.tsx
  - src/components/dowgnut/detail-modal.tsx
  - src/components/dowgnut/cart-drawer.tsx
  - src/components/dowgnut/favorites-view.tsx
  - src/components/dowgnut/checkout-view.tsx
  - src/components/dowgnut/orders-view.tsx
  - src/components/dowgnut/order-tracking-view.tsx
  - src/components/dowgnut/ai-concierge.tsx
  - src/components/dowgnut/ai-designer.tsx
  - src/components/dowgnut/ai-flavor-match.tsx
  - src/components/dowgnut/admin-dashboard.tsx
  - src/components/dowgnut/dowgnut-footer.tsx
  - src/app/page.tsx (rewritten — was the default placeholder)
- Total: ~3,839 lines of new frontend code.
- Dev server: Next.js 16.1.3 (Turbopack) on :3000, compiles clean, / returns 200.
- Lint: **clean** (0 errors, 0 warnings).
- WebSocket connection string used (EXACTLY): `io('/?XTransformPort=3004', { transports:['websocket','polling'], reconnection:true, forceNew:true })` — path is `/`, no port in URL, XTransformPort in query.
- Order-tracking mini-service: confirmed running (PID 2001, `bun --hot index.ts`), health endpoint returns 200.
- Brand adherence: blue (#07579B) primary, pink (#F05A9B) CTA, lime (#E8F866) accent, cream (#FFF9E8) cards, navy (#07334F) text. No indigo/blue-violet outside the brand palette. `.graffiti-text` used for all big headings. `.animate-float`, `.animate-spin-slow`, `.animate-wiggle`, `.lime-bg-grid`, `.drip-shadow`, `.brand-stroke`, `.scrollbar-dowgnut` all used.
- Mobile-first: every view tested mentally at 390px — grids collapse to 2 cols, header collapses to hamburger Sheet, hero text scales down, stepper stacks vertically, checkout stacks to 1 col. No horizontal overflow. All interactive elements ≥44px touch targets.
- Sticky footer: layout body has `min-h-screen flex flex-col`, footer uses `mt-auto` so it sits at viewport bottom when content is short and is pushed down when content overflows.
- Decisions / quirks for future reference:
  - The store's persist middleware only stores `sessionId` + `splashDone` (not the whole state) so catalog/cart/favorites always re-fetch fresh on reload. The `onRehydrateStorage` callback writes the persisted sessionId back into the `dowgnut-session` localStorage key that `apiFetch` reads, so the very first fetch on a fresh page load already includes the correct header.
  - `init()` is guarded by an `initialised` flag so it only runs once.
  - Order tracking defensively seeds a baseline payload from the REST `GET /api/orders/[id]` so the UI is never blank before the first socket event arrives. It also starts a 3s REST polling fallback if the socket hasn't connected within 5s. The seed maps `Order.status` → `step` via a local `STATUS_TO_STEP` map (defensive in case the server's `step` field is ever missing).
  - AI designer gallery is component-state only (not persisted) — images live in memory for the session. Generating a new image prepends to the gallery (max 6).
  - AI concierge message list keeps a leading "intro" assistant message; when sending to the API it strips that intro so the model only sees real conversation.
  - All `<img>` tags use plain `<img>` (not next/image) for the brand mascot / donut images because they're served from `/brand/` and external URLs — and the project's eslint config doesn't enforce `@next/next/no-img-element`, so no special handling was needed.
  - "Buy now" in detail modal = add to cart + close modal + open cart drawer (so user can checkout immediately).
  - "Order again" in tracking view re-adds each OrderItem to the cart via sequential `addToCart(donutId, quantity)` calls (the API upserts), then opens the cart drawer and returns to shop view.
  - Toast hook is the shadcn `use-toast` (radix-toast-based Toaster already mounted in layout.tsx) — used for add-to-cart, favorite toggle, errors, order placement, review submission, AI failures.
- Known issues / things that may need attention:
  - None blocking. The Prisma client logs every query to stdout (Task 1 set `log: ['query']` in db.ts) — noisy in dev.log but harmless and out of scope.
  - The AI designer image generation can take 10-20s; the loading spinner is shown but no progress bar. Acceptable for MVP.
  - Admin dashboard has no auth gate — anyone can view /api/admin/stats. Out of scope for this task but worth flagging.
  - Splash replays only once per browser (persisted `splashDone`). To see it again, clear localStorage `dowgnut-shop`.

---
Task ID: 5
Agent: main (Z.ai Code) — self-verification
Task: Start dev server + websocket service, lint, self-verify with agent browser, fix issues

Work Log:
- Confirmed Next.js dev server running on port 3000 (200 OK, no compile errors).
- Confirmed order-tracking websocket mini-service running on port 3004 (health OK).
- Verified gateway (port 81) routes /, /api/*, and /?XTransformPort=3004 correctly.
- Used agent-browser to verify end-to-end through the gateway:
  1. Splash screen renders (mascot + wordmark + tagline), auto-dismisses.
  2. Header: logo, nav (Shop/Favorites/Orders/Admin), search, AI Designer button, cart badge — all functional.
  3. Hero carousel: 3 auto-rotating slides with brand headlines + CTAs.
  4. Filter bar: All/Classic/Sprinkled/Stuffed/Specialty chips + sort select + search.
  5. AI Flavor Match banner on shop view (presets + custom craving input).
  6. Donut grid: 21 seeded donuts render with image, name, rating, calories, price pill, favorite heart, add-to-cart.
  7. Detail modal: rotating donut image, price, rating/calories/stock, description, tags, qty stepper, add-to-cart + buy-now, reviews list + add-review form, "More like this" related donuts.
  8. Cart drawer: items with qty steppers + remove, free-delivery progress bar, subtotal/delivery/total, checkout + clear cart.
  9. Checkout: delivery form with validation, order summary, place order → creates order + toast.
  10. Real-time order tracking: connected via io('/?XTransformPort=3004') through gateway, "● Live" indicator, watched status progress preparing → baking → out_for_delivery → delivered with exact DowgNut-flavored messages and dynamic ETA. Order-tracking service log confirmed socket events.
  11. AI Concierge: floating FAB → chat panel, LLM recommended "Triple Chocolate Lava" from real catalog with friendly response + clickable donut card.
  12. AI Flavor Match: typed craving → returned 3 matched donuts (Strawberry Funfetti, Piña Colada Twist, Lemon Curd Pocket) with per-donut reasoning.
  13. AI Donut Designer: prompt + presets → generated custom donut image (base64 data URI) displayed in dialog + session gallery.
  14. Admin Dashboard: 4 stat cards (revenue/orders/items/AOV), recharts hourly-revenue line + top-donuts bar + sales-by-type pie, recent-orders table.
  15. Mobile (390x844): zero horizontal overflow, all elements ≥44px touch targets, footer present.
  16. Sticky footer: body uses min-h-screen flex flex-col + footer mt-auto (verified via bodyClass) — sticks when short, pushes down when long.
- Console: 0 errors, 0 blocking warnings (only a harmless DialogContent a11y notice).
- Lint: 0 errors, 0 warnings.

Stage Summary:
- Project COMPLETE and browser-verified. All features functional end-to-end through the gateway.
- 15 verification screenshots saved to /home/z/my-project/verify-*.png.
- Known non-blocking notes: AI image generation takes ~15-30s (spinner shown); admin route has no auth gate (out of scope); Prisma query logging is noisy in dev.log (harmless).

---
Task ID: 6
Agent: main (Z.ai Code) — restore original logo
Task: User asked "mana logo ori?" (where's the original logo?) — restore the original DowgNut brand wordmark from the source repo.

Work Log:
- Located original brand assets in /tmp/Dowgnut-F/assets/brand/: dowgnut_logo_wordmark_transparent.png (573×233, blue graffiti wordmark + pink dripping donut "O", transparent bg) and dowgnut_brand_reference.jpg (768×1376).
- Copied both to /home/z/my-project/public/brand/ as dowgnut-logo-wordmark.png and dowgnut-brand-reference.jpg.
- Reviewed original Flutter DowgNutLogo widget (lib/theme/dowgnut_logo.dart) — confirmed wordmark is colored (blue+pink) for LIGHT backgrounds.
- Created reusable src/components/dowgnut/dowgnut-logo.tsx with plain + pill variants.
- Updated splash-screen.tsx: replaced graffiti-text "DowgNut" h1 with the original wordmark image (mascot kept as small floating accent above).
- Updated dowgnut-header.tsx: replaced mascot+white-text combo with the original wordmark on a cream rounded pill (so it's visible on the blue header bg).
- Updated dowgnut-footer.tsx: replaced white graffiti-text "DowgNut" with the original wordmark on a cream pill.
- Verified via agent-browser through the gateway: splash, header, and footer all render the 573×233 original wordmark (visible:true, naturalWidth:573). Lint clean. No console errors.

Stage Summary:
- Original DowgNut brand logo restored across splash, header, footer. AI-generated mascot retained as a decorative accent only. Brand authenticity preserved.

---
Task ID: 7
Agent: main (Z.ai Code) — add swipe-to-preview donut mode
Task: User asked to be able to swipe through donuts to preview them one-by-one (Tinder-style).

Work Log:
- Added "swipe" to ShopView union in src/store/use-shop.ts.
- Added a "Swipe" nav item (Shuffle icon) to the header NAV array in dowgnut-header.tsx.
- Created src/components/dowgnut/swipe-view.tsx — a Tinder-style donut swipe deck:
  - Card stack: top card draggable (framer-motion drag), 2 back cards scaled + offset.
  - Two-layer motion structure: outer motion.div for stack position (scale+y), inner motion.div for drag/fly-out (x/y/rotate/opacity motion values) — avoids framer-motion style/animate conflict.
  - Drag gestures: swipe right = Love (favorite) 💗, swipe left = Skip, swipe up = Add to cart 🛒. Threshold-based on offset/velocity.
  - Live overlay stamps during drag: "LOVE 💗" / "NOPE" / "CART! 🛒" fading in based on drag direction (useTransform on motion values).
  - Action buttons (Skip/Love/Cart) for accessibility — trigger flyOut via useImperativeHandle ref on the top card.
  - Progress bar + "N / 21" counter.
  - "Details" button opens the existing detail modal.
  - End-of-deck summary screen: trophy, counts (Loved/Carted/Skipped), "Swipe again" / "View cart" / "Favorites" actions.
  - Reset on catalog/filter change via React-recommended "adjust state during render" pattern (avoids setState-in-effect lint error).
  - Empty-state and loading-state handling.
- Wired SwipeView into src/app/page.tsx (view === "swipe").
- Debugged two issues found via agent-browser:
  1. framer-motion style/animate conflict on single element → fixed with two-layer motion.div split.
  2. ReferenceError: `dir` (function param) mistakenly placed in useCallback deps array → removed.
- Verified via agent-browser through the gateway:
  - Deck renders (21 donuts, stacked cards, LOVE/NOPE/CART stamps).
  - Love button → 2/21 + favorite toast.
  - Skip button → 3/21.
  - Cart button → 4/21 + "Added to your dowgs! 🛒" toast.
  - Physical drag-right → advances (Love).
  - Physical drag-up → advances (Cart) + toast.
  - Fast-forward to end → "You tasted them all!" summary with correct counts (19 loved / 1 carted / 1 skipped) + action buttons.
  - "Swipe again" restarts from 1/21.
  - Mobile 390px: zero horizontal overflow.
- Lint clean. No console/runtime errors.

Stage Summary:
- Swipe-to-preview donut mode complete and browser-verified. Swipe ← skip · → love 💗 · ↑ cart 🛒, plus buttons. Accessible via the "Swipe" nav tab. Brand-consistent graffiti styling preserved.
