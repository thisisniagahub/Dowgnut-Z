"use client";

import { Home, Heart, Package, ShoppingCart, SlidersHorizontal } from "lucide-react";
import { useShop } from "@/store/use-shop";
import { cn } from "@/lib/utils";

/**
 * BottomNav — app-style fixed bottom navigation (like Instagram/Shopee).
 * Replaces the web-style footer for a native app feel.
 */
export function BottomNav() {
  const view = useShop((s) => s.view);
  const setView = useShop((s) => s.setView);
  const setCartOpen = useShop((s) => s.setCartOpen);
  const cart = useShop((s) => s.cart);
  const favorites = useShop((s) => s.favorites);

  const cartCount = cart.reduce((n, c) => n + c.quantity, 0);

  const items = [
    { key: "shop", label: "Shop", icon: Home },
    { key: "slider", label: "Browse", icon: SlidersHorizontal },
    { key: "favorites", label: "Saved", icon: Heart, badge: favorites.length },
    { key: "cart", label: "Cart", icon: ShoppingCart, badge: cartCount, action: () => setCartOpen(true) },
    { key: "orders", label: "Orders", icon: Package },
  ] as const;

  return (
    <nav
      className="fixed bottom-0 left-0 right-0 z-40 border-t border-[var(--color-dowgnut-blue-dark)]/10 bg-[var(--color-dowgnut-cream)] pb-[env(safe-area-inset-bottom)] shadow-[0_-4px_12px_rgba(7,51,79,0.08)]"
      aria-label="Bottom navigation"
    >
      <div className="mx-auto flex h-16 max-w-md items-center justify-around px-2">
        {items.map((item) => {
          const isActive = view === item.key;
          const Icon = item.icon;
          const handle = "action" in item && item.action ? item.action : () => setView(item.key as any);
          return (
            <button
              key={item.key}
              onClick={handle}
              className={cn(
                "relative flex flex-1 flex-col items-center gap-0.5 py-1.5 transition-colors",
                isActive
                  ? "text-[var(--color-dowgnut-pink-dark)]"
                  : "text-[var(--color-dowgnut-blue-dark)]/50"
              )}
              aria-label={item.label}
              aria-current={isActive ? "page" : undefined}
            >
              <Icon className={cn("size-5", isActive && "stroke-[2.5]")} />
              <span className={cn("text-[10px] font-semibold", isActive && "font-bold")}>
                {item.label}
              </span>
              {item.badge && item.badge > 0 ? (
                <span className="absolute right-[calc(50%-22px)] top-0.5 inline-flex h-4 min-w-4 items-center justify-center rounded-full bg-[var(--color-dowgnut-pink)] px-1 text-[9px] font-bold text-white">
                  {item.badge}
                </span>
              ) : null}
            </button>
          );
        })}
      </div>
    </nav>
  );
}
