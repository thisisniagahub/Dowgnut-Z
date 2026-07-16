"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ShoppingCart, Menu, Sparkles, Calendar } from "lucide-react";
import { useShop } from "@/store/use-shop";
import { useFestival, FestivalToggle } from "./FestivalShaders";
import { AuthModal } from "./auth-modal";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

export function DowgnutHeader() {
  const view = useShop((s) => s.view);
  const setView = useShop((s) => s.setView);
  const cart = useShop((s) => s.cart);
  const setCartOpen = useShop((s) => s.setCartOpen);
  const setConciergeOpen = useShop((s) => s.setConciergeOpen);
  const [scrolled, setScrolled] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);

  const cartCount = cart.reduce((n, c) => n + c.quantity, 0);

  // Festival banner is shown at top of page via FestivalBanner component
  // Header just shows the toggle

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 10);
    window.addEventListener("scroll", onScroll);
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  const go = (v: "shop" | "favorites" | "orders" | "admin") => {
    setView(v);
    setMobileOpen(false);
  };

  return (
    <header
      className={`sticky top-0 z-40 bg-[var(--color-dowgnut-blue)] text-white transition-all duration-300 ${
        scrolled ? "bg-[var(--color-dowgnut-blue)]/90 backdrop-blur-xl shadow-md" : ""
      }`}
    >
      <div className={`mx-auto flex items-center justify-between px-4 transition-all duration-300 ${scrolled ? "h-12" : "h-14"} sm:px-6`}>
        {/* Left: logo + brand name */}
        <div className="flex items-center gap-4">
          <button
            onClick={() => go("shop")}
            className="flex shrink-0 items-center gap-2"
            aria-label="DowgNut home"
          >
            <img
              src="/brand/hypebeast-icon.png"
              alt="DowgNut"
              width={32}
              height={32}
              className="h-8 w-8 rounded-full object-cover"
              draggable={false}
            />
            <img
              src="/brand/dowgnut-logo-wordmark.png"
              alt="DowgNut"
              width={120}
              height={24}
              className="h-5 w-auto object-contain brightness-0 invert sm:h-6"
              draggable={false}
            />
          </button>

          {/* Desktop nav links */}
          <nav className="hidden items-center gap-1 sm:flex" aria-label="Main navigation">
            {[
              { k: "shop", l: "Shop" },
              { k: "swipe", l: "Swipe" },
              { k: "favorites", l: "Favorites" },
              { k: "orders", l: "Orders" },
            ].map((item) => {
              const isActive = view === item.k;
              return (
                <button
                  key={item.k}
                  onClick={() => go(item.k as any)}
                  className={cn(
                    "rounded-full px-3 py-1.5 text-sm font-semibold transition-all",
                    isActive
                      ? "bg-white/20 text-white"
                      : "text-white/70 hover:bg-white/10 hover:text-white"
                  )}
                >
                  {item.l}
                </button>
              );
            })}
          </nav>
        </div>

        {/* Right: actions */}
        <div className="flex items-center gap-2">
          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                onClick={() => setConciergeOpen(true)}
                variant="ghost"
                className="hidden size-9 rounded-full bg-white/10 p-0 text-white hover:bg-white/20 hover:text-white sm:inline-flex"
                aria-label="AI Concierge"
              >
                <Sparkles className="size-4" />
              </Button>
            </TooltipTrigger>
            <TooltipContent className="border border-[var(--color-dowgnut-blue-dark)] bg-[var(--color-dowgnut-blue-dark)] text-white">
              AI Concierge Chat
            </TooltipContent>
          </Tooltip>

          {/* Cart with animated badge */}
          <Tooltip>
            <TooltipTrigger asChild>
              <button
                onClick={() => setCartOpen(true)}
                className="relative inline-flex size-9 items-center justify-center rounded-full bg-[var(--color-dowgnut-pink)] text-white shadow-sm transition-transform hover:scale-105 active:scale-95"
                aria-label="Open cart"
              >
                <ShoppingCart className="size-4" />
                <AnimatePresence>
                  {cartCount > 0 && (
                    <motion.span
                      key={cartCount}
                      initial={{ scale: 0 }}
                      animate={{ scale: 1 }}
                      exit={{ scale: 0 }}
                      transition={{ type: "spring", stiffness: 500, damping: 15 }}
                      className="absolute -right-1 -top-1 inline-flex h-4 min-w-4 items-center justify-center rounded-full bg-[var(--color-dowgnut-lime)] px-1 text-[9px] font-bold text-[var(--color-dowgnut-blue-dark)] ring-2 ring-[var(--color-dowgnut-blue)]"
                    >
                      {cartCount}
                    </motion.span>
                  )}
                </AnimatePresence>
              </button>
            </TooltipTrigger>
            <TooltipContent className="border border-[var(--color-dowgnut-blue-dark)] bg-[var(--color-dowgnut-blue-dark)] text-white">
              Your Cart
            </TooltipContent>
          </Tooltip>

          {/* Festival Toggle */}
          <FestivalToggle />

          {/* Auth Modal - User button or Sign In button */}
          <AuthModal />

          {/* Mobile menu */}
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
              </div>
            </SheetContent>
          </Sheet>
        </div>
      </div>
    </header>
  );
}