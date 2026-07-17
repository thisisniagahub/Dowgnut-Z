"use client";

import { motion } from "framer-motion";
import { Home, Heart, Package, ShoppingCart, SlidersHorizontal } from "lucide-react";
import { useShop } from "@/store/use-shop";
import { cn } from "@/lib/utils";
import { DonutIcon } from "./donut-icon";

export function BottomNav() {
  const view = useShop((s) => s.view);
  const setView = useShop((s) => s.setView);
  const setCartOpen = useShop((s) => s.setCartOpen);
  const cart = useShop((s) => s.cart);
  const favorites = useShop((s) => s.favorites);

  const cartCount = cart.reduce((n, c) => n + c.quantity, 0);

  interface NavItem {
    key: string;
    label: string;
    icon: any;
    badge?: number;
    action?: () => void;
    isCenter?: boolean;
  }

  // 5 items: shop | browse | [CENTER DONUT] | favorites | cart+orders
  // Center item is the branded donut button — goes to shop/home
  const items: NavItem[] = [
    { key: "shop", label: "Shop", icon: Home },
    { key: "slider", label: "Browse", icon: SlidersHorizontal },
    { key: "donut-center", label: "", icon: null, isCenter: true },
    { key: "favorites", label: "Saved", icon: Heart, badge: favorites.length },
    { key: "cart", label: "Cart", icon: ShoppingCart, badge: cartCount, action: () => setCartOpen(true) },
    { key: "orders", label: "Orders", icon: Package },
  ];

  return (
    <nav
      className="fixed bottom-0 left-0 right-0 z-40 border-t-2 bg-[var(--color-grit-surface)] pb-[env(safe-area-inset-bottom)]"
      style={{ borderColor: "#1c1b1b" }}
      aria-label="Bottom navigation"
    >
      <div className="mx-auto flex h-16 max-w-md items-center justify-around px-2">
        {items.map((item) => {
          // ── CENTER DONUT BUTTON ──
          if (item.isCenter) {
            return (
              <motion.button
                key="donut-center"
                onClick={() => setView("shop")}
                whileTap={{ scale: 0.9 }}
                transition={{ type: "spring", stiffness: 400, damping: 17 }}
                className="relative -mt-6 flex flex-col items-center justify-center"
                aria-label="DowgNut home"
                style={{
                  border: "2px solid #1c1b1b",
                  boxShadow: "3px 3px 0px 0px #1c1b1b",
                  background: "#d9fb5f",
                  width: 56,
                  height: 56,
                }}
              >
                <DonutIcon size={36} spinning={view === "shop"} />
              </motion.button>
            );
          }

          // ── NORMAL NAV ITEMS ──
          const isActive = view === item.key;
          const Icon = item.icon;
          const handle = "action" in item && item.action ? item.action : () => setView(item.key as any);
          return (
            <motion.button
              key={item.key}
              onClick={handle}
              whileTap={{ scale: 0.9, y: -2 }}
              transition={{ type: "spring", stiffness: 400, damping: 17 }}
              className={cn(
                "relative flex flex-1 flex-col items-center gap-0.5 py-1.5 transition-colors",
                "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--color-grit-rose)]",
                isActive ? "text-[var(--color-grit-rose)]" : "text-[var(--color-grit-charcoal)]/50"
              )}
              aria-label={item.label}
              aria-current={isActive ? "page" : undefined}
            >
              {/* Active indicator — sharp bar, not rounded pill */}
              {isActive && (
                <motion.div
                  layoutId="navIndicator"
                  className="absolute -top-0.5 h-1 w-8"
                  style={{ background: "#1c1b1b" }}
                  transition={{ type: "spring", stiffness: 400, damping: 30 }}
                />
              )}
              <motion.div animate={{ y: isActive ? -2 : 0 }} transition={{ type: "spring", stiffness: 400, damping: 20 }}>
                <Icon className={cn("size-5", isActive && "stroke-[2.5]")} />
              </motion.div>
              <span
                className={cn("text-[10px]", isActive ? "font-bold" : "font-semibold")}
                style={{ fontFamily: "var(--font-mono), monospace" }}
              >
                {item.label}
              </span>
              {/* Badge — sharp square, not round */}
              {item.badge && item.badge > 0 ? (
                <motion.span
                  key={item.badge}
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ type: "spring", stiffness: 500, damping: 15 }}
                  className="absolute right-[calc(50%-22px)] top-0.5 inline-flex h-4 min-w-4 items-center justify-center px-1 text-[9px] font-bold text-white"
                  style={{
                    background: "#b21d67",
                    border: "1.5px solid #1c1b1b",
                  }}
                >
                  {item.badge}
                </motion.span>
              ) : null}
            </motion.button>
          );
        })}
      </div>
    </nav>
  );
}
