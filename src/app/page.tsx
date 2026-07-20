"use client";

import { useEffect } from "react";
import dynamic from "next/dynamic";
import { AnimatePresence, motion } from "framer-motion";
import { useShop } from "@/store/use-shop";
import { SplashScreen } from "@/components/dowgnut/splash-screen";
import { DowgnutHeader } from "@/components/dowgnut/dowgnut-header";
import { BottomNav } from "@/components/dowgnut/bottom-nav";
import { DowgnutFooter } from "@/components/dowgnut/dowgnut-footer";
import { ShopHome } from "@/components/dowgnut/shop-home";
import { ClientOnly } from "@/components/dowgnut/ClientOnly";

// Code-split heavier views via next/dynamic. Most of these only render
// once (e.g. checkout, admin) so they need not be in the initial bundle.
const DonutSlider = dynamic(
  () => import("@/components/dowgnut/donut-slider").then((m) => m.DonutSlider),
  { ssr: false }
);
const SwipeView = dynamic(
  () => import("@/components/dowgnut/swipe-view").then((m) => m.SwipeView),
  { ssr: false }
);
const FavoritesView = dynamic(
  () => import("@/components/dowgnut/favorites-view").then((m) => m.FavoritesView),
  { ssr: false }
);
const CheckoutView = dynamic(
  () => import("@/components/dowgnut/checkout-view").then((m) => m.CheckoutView),
  { ssr: false }
);
const OrdersView = dynamic(
  () => import("@/components/dowgnut/orders-view").then((m) => m.OrdersView),
  { ssr: false }
);
const OrderTrackingView = dynamic(
  () => import("@/components/dowgnut/order-tracking-view").then((m) => m.OrderTrackingView),
  { ssr: false }
);
const AdminDashboard = dynamic(
  () => import("@/components/dowgnut/admin-dashboard").then((m) => m.AdminDashboard),
  { ssr: false }
);
const DetailModal = dynamic(
  () => import("@/components/dowgnut/detail-modal").then((m) => m.DetailModal),
  { ssr: false }
);
const CartDrawer = dynamic(
  () => import("@/components/dowgnut/cart-drawer").then((m) => m.CartDrawer),
  { ssr: false }
);
const AIConcierge = dynamic(
  () => import("@/components/dowgnut/ai-concierge").then((m) => m.AIConcierge),
  { ssr: false }
);
// 3D-heavy: defer to client-only chunk.
const DuitNowQRBurst = dynamic(
  () => import("@/components/dowgnut/DuitNowQRBurst").then((m) => m.DuitNowQRBurst),
  { ssr: false }
);
const GlazeWipeTransition = dynamic(
  () => import("@/components/dowgnut/GlazeWipeTransition").then((m) => m.GlazeWipeTransition),
  { ssr: false }
);

export default function Home() {
  const view = useShop((s) => s.view);
  const init = useShop((s) => s.init);

  useEffect(() => {
    init();
  }, [init]);

  // Direction: shop→slider feels like "zoom in", slider→shop "zoom out".
  const isShopSlider = view === "shop" || view === "slider";

  return (
    <>
      <SplashScreen />
      {/* <FestivalBanner /> */}
      <DowgnutHeader />
      <main className="relative flex flex-1 flex-col overflow-hidden pb-16">
        <AnimatePresence mode="wait">
          {/* Shop + Slider share a synchronized crossfade+scale transition */}
          {isShopSlider && (
            <motion.div
              key={view}
              initial={{ opacity: 0, scale: 0.96 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 1.02, scale: 1.02 }}
              transition={{ duration: 0.35, ease: [0.16, 1, 0.3, 1] }}
              className="absolute inset-0 flex flex-col"
            >
              {view === "shop" && <ShopHome />}
              {view === "slider" && <DonutSlider />}
            </motion.div>
          )}
        </AnimatePresence>

        {/* Other views — slide in from right */}
        <AnimatePresence mode="wait">
          {!isShopSlider && (
            <motion.div
              key={view}
              initial={{ opacity: 0, x: 40 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 1, x: -40 }}
              transition={{ duration: 0.25, ease: "easeOut" }}
              className="absolute inset-0 flex flex-col"
            >
              {view === "swipe" && <SwipeView />}
              {view === "favorites" && <FavoritesView />}
              {view === "checkout" && <CheckoutView />}
              {view === "orders" && <OrdersView />}
              {view === "tracking" && <OrderTrackingView />}
              {view === "admin" && <AdminDashboard />}
            </motion.div>
          )}
        </AnimatePresence>
      </main>

      <DowgnutFooter />
      <BottomNav />

      <DetailModal />
      <CartDrawer />
      <AIConcierge />
      {view === "duitnow-qr" && (
        <DuitNowQRBurst
          orderId=""
          amount={0}
          onClose={() => useShop.getState().setView("checkout")}
        />
      )}
      <ClientOnly>
        <GlazeWipeTransition />
      </ClientOnly>
    </>
  );
}
