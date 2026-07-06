"use client";

import { useEffect } from "react";
import { useShop } from "@/store/use-shop";
import { SplashScreen } from "@/components/dowgnut/splash-screen";
import { DowgnutHeader } from "@/components/dowgnut/dowgnut-header";
import { HeroCarousel } from "@/components/dowgnut/hero-carousel";
import { FilterBar } from "@/components/dowgnut/filter-bar";
import { DonutGrid } from "@/components/dowgnut/donut-grid";
import { SwipeView } from "@/components/dowgnut/swipe-view";
import { FavoritesView } from "@/components/dowgnut/favorites-view";
import { CheckoutView } from "@/components/dowgnut/checkout-view";
import { OrdersView } from "@/components/dowgnut/orders-view";
import { OrderTrackingView } from "@/components/dowgnut/order-tracking-view";
import { AdminDashboard } from "@/components/dowgnut/admin-dashboard";
import { DowgnutFooter } from "@/components/dowgnut/dowgnut-footer";
import { DetailModal } from "@/components/dowgnut/detail-modal";
import { CartDrawer } from "@/components/dowgnut/cart-drawer";
import { AIConcierge } from "@/components/dowgnut/ai-concierge";
import { AIDesigner } from "@/components/dowgnut/ai-designer";

export default function Home() {
  const view = useShop((s) => s.view);
  const init = useShop((s) => s.init);

  useEffect(() => {
    init();
  }, [init]);

  return (
    <>
      <SplashScreen />
      <DowgnutHeader />
      <main className="flex flex-1 flex-col">
        {view === "shop" && (
          <>
            <HeroCarousel />
            <FilterBar />
            <DonutGrid />
          </>
        )}
        {view === "swipe" && <SwipeView />}
        {view === "favorites" && <FavoritesView />}
        {view === "checkout" && <CheckoutView />}
        {view === "orders" && <OrdersView />}
        {view === "tracking" && <OrderTrackingView />}
        {view === "admin" && <AdminDashboard />}
      </main>
      <DowgnutFooter />

      {/* Overlays */}
      <DetailModal />
      <CartDrawer />
      <AIConcierge />
      <AIDesigner />
    </>
  );
}
