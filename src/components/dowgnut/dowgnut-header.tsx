"use client";

import { useState } from "react";
import { ShoppingCart, Sparkles, Menu } from "lucide-react";
import { useShop } from "@/store/use-shop";
import { Button } from "@/components/ui/button";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import { cn } from "@/lib/utils";

export function DowgnutHeader() {
  const cart = useShop((s) => s.cart);
  const setCartOpen = useShop((s) => s.setCartOpen);
  const setView = useShop((s) => s.setView);
  const setDesignerOpen = useShop((s) => s.setDesignerOpen);
  const setConciergeOpen = useShop((s) => s.setConciergeOpen);
  const [mobileOpen, setMobileOpen] = useState(false);

  const cartCount = cart.reduce((n, c) => n + c.quantity, 0);

  const go = (v: "shop" | "favorites" | "orders" | "admin") => {
    setView(v);
    setMobileOpen(false);
  };

  return (
    <header className="sticky top-0 z-40 border-b border-[var(--color-dowgnut-blue-dark)]/10 bg-[var(--color-dowgnut-blue)] text-white">
      <div className="mx-auto flex h-14 max-w-7xl items-center justify-between px-4 sm:px-6">
        {/* Left: logo */}
        <button
          onClick={() => go("shop")}
          className="flex shrink-0 items-center"
          aria-label="DowgNut home"
        >
          <span className="inline-flex items-center rounded-full bg-[var(--color-dowgnut-cream)] px-2.5 py-0.5 shadow-sm">
            <img
              src="/brand/dowgnut-logo-wordmark.png"
              alt="DowgNut"
              className="h-6 w-auto"
              draggable={false}
            />
          </span>
        </button>

        {/* Right: actions */}
        <div className="flex items-center gap-2">
          <Button
            onClick={() => setConciergeOpen(true)}
            variant="ghost"
            className="hidden size-9 rounded-full bg-white/10 p-0 text-white hover:bg-white/20 hover:text-white sm:inline-flex"
            aria-label="AI Concierge"
          >
            <Sparkles className="size-4" />
          </Button>
          <Button
            onClick={() => setDesignerOpen(true)}
            variant="ghost"
            className="hidden size-9 rounded-full bg-[var(--color-dowgnut-lime)] p-0 text-[var(--color-dowgnut-blue-dark)] hover:bg-[var(--color-dowgnut-lime)]/80 sm:inline-flex"
            aria-label="AI Donut Designer"
          >
            <Sparkles className="size-4" />
          </Button>

          {/* Cart */}
          <button
            onClick={() => setCartOpen(true)}
            className="relative inline-flex size-9 items-center justify-center rounded-full bg-[var(--color-dowgnut-pink)] text-white shadow-sm transition-transform hover:scale-105 active:scale-95"
            aria-label="Open cart"
          >
            <ShoppingCart className="size-4" />
            {cartCount > 0 && (
              <span className="absolute -right-1 -top-1 inline-flex h-4 min-w-4 items-center justify-center rounded-full bg-[var(--color-dowgnut-lime)] px-1 text-[9px] font-bold text-[var(--color-dowgnut-blue-dark)] ring-2 ring-[var(--color-dowgnut-blue)]">
                {cartCount}
              </span>
            )}
          </button>

          {/* Menu (mobile) */}
          <Sheet open={mobileOpen} onOpenChange={setMobileOpen}>
            <SheetTrigger asChild>
              <button
                className="inline-flex size-9 items-center justify-center rounded-full bg-white/10 text-white sm:hidden"
                aria-label="Open menu"
              >
                <Menu className="size-4" />
              </button>
            </SheetTrigger>
            <SheetContent side="right" className="w-[80vw] bg-[var(--color-dowgnut-cream)] sm:max-w-xs">
              <SheetHeader className="px-4">
                <SheetTitle className="graffiti-text text-2xl text-[var(--color-dowgnut-blue-dark)]">
                  Menu
                </SheetTitle>
              </SheetHeader>
              <div className="flex flex-col gap-2 px-4">
                {[
                  { k: "shop", l: "Shop" },
                  { k: "favorites", l: "Favorites" },
                  { k: "orders", l: "Orders" },
                  { k: "admin", l: "Admin" },
                ].map((item) => (
                  <button
                    key={item.k}
                    onClick={() => go(item.k as any)}
                    className="flex h-12 items-center rounded-2xl px-4 text-left text-base font-semibold text-[var(--color-dowgnut-blue-dark)] transition-colors hover:bg-white"
                  >
                    {item.l}
                  </button>
                ))}
                <Button
                  onClick={() => {
                    setConciergeOpen(true);
                    setMobileOpen(false);
                  }}
                  className="h-12 rounded-2xl bg-[var(--color-dowgnut-blue)] text-white hover:bg-[var(--color-dowgnut-blue-dark)]"
                >
                  <Sparkles className="size-4" />
                  Ask Concierge
                </Button>
              </div>
            </SheetContent>
          </Sheet>
        </div>
      </div>
    </header>
  );
}
