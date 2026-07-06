"use client";

import { useState } from "react";
import { Menu, Search, ShoppingCart, Sparkles, Heart, Package, LayoutDashboard, Store, Shuffle, X } from "lucide-react";
import { useShop } from "@/store/use-shop";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import { cn } from "@/lib/utils";

interface NavItem {
  key: "shop" | "swipe" | "favorites" | "orders" | "admin";
  label: string;
  icon: React.ReactNode;
}

const NAV: NavItem[] = [
  { key: "shop", label: "Shop", icon: <Store className="size-4" /> },
  { key: "swipe", label: "Swipe", icon: <Shuffle className="size-4" /> },
  { key: "favorites", label: "Favorites", icon: <Heart className="size-4" /> },
  { key: "orders", label: "Orders", icon: <Package className="size-4" /> },
  { key: "admin", label: "Admin", icon: <LayoutDashboard className="size-4" /> },
];

export function DowgnutHeader() {
  const view = useShop((s) => s.view);
  const setView = useShop((s) => s.setView);
  const search = useShop((s) => s.search);
  const setSearch = useShop((s) => s.setSearch);
  const cart = useShop((s) => s.cart);
  const setCartOpen = useShop((s) => s.setCartOpen);
  const favorites = useShop((s) => s.favorites);
  const setDesignerOpen = useShop((s) => s.setDesignerOpen);
  const setConciergeOpen = useShop((s) => s.setConciergeOpen);

  const [mobileOpen, setMobileOpen] = useState(false);
  const [mobileSearch, setMobileSearch] = useState(search);

  const cartCount = cart.reduce((n, c) => n + c.quantity, 0);

  const go = (key: NavItem["key"]) => {
    setView(key);
    setMobileOpen(false);
  };

  return (
    <header className="sticky top-0 z-40 border-b-4 border-[var(--color-dowgnut-pink)] bg-[var(--color-dowgnut-blue)] text-white">
      <div className="mx-auto flex h-16 max-w-7xl items-center gap-3 px-4 sm:px-6">
        {/* Brand — original DowgNut wordmark on a cream pill (visible on blue bg) */}
        <button
          onClick={() => go("shop")}
          className="flex shrink-0 items-center"
          aria-label="DowgNut home"
        >
          <span className="inline-flex items-center rounded-full bg-[var(--color-dowgnut-cream)] px-3 py-1 shadow-sm">
            <img
              src="/brand/dowgnut-logo-wordmark.png"
              alt="DowgNut"
              className="h-7 w-auto"
              draggable={false}
            />
          </span>
        </button>

        {/* Center nav (desktop) */}
        <nav className="mx-auto hidden items-center gap-1 md:flex">
          {NAV.map((item) => {
            const isActive = view === item.key;
            const showCount = item.key === "favorites" && favorites.length > 0;
            return (
              <button
                key={item.key}
                onClick={() => go(item.key)}
                className={cn(
                  "relative inline-flex h-10 items-center gap-2 rounded-full px-4 text-sm font-semibold transition-colors",
                  isActive
                    ? "bg-[var(--color-dowgnut-pink)] text-white"
                    : "text-white/80 hover:bg-white/10 hover:text-white"
                )}
              >
                {item.icon}
                {item.label}
                {showCount && (
                  <span className="ml-1 inline-flex h-5 min-w-5 items-center justify-center rounded-full bg-[var(--color-dowgnut-lime)] px-1 text-[10px] font-bold text-[var(--color-dowgnut-blue-dark)]">
                    {favorites.length}
                  </span>
                )}
              </button>
            );
          })}
        </nav>

        {/* Search (desktop) */}
        <div className="relative ml-auto hidden lg:block">
          <Search className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-white/60" />
          <Input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search flavors…"
            className="h-10 w-56 rounded-full border-white/20 bg-white/10 pl-9 text-white placeholder:text-white/60 focus-visible:bg-white/20 xl:w-72"
          />
        </div>

        {/* AI Designer */}
        <Button
          onClick={() => setDesignerOpen(true)}
          variant="ghost"
          className="hidden h-10 rounded-full bg-[var(--color-dowgnut-lime)] text-[var(--color-dowgnut-blue-dark)] hover:bg-[var(--color-dowgnut-lime)]/80 hover:text-[var(--color-dowgnut-blue-dark)] sm:inline-flex"
          aria-label="AI Donut Designer"
        >
          <Sparkles className="size-4" />
          <span className="hidden lg:inline">Designer</span>
        </Button>

        {/* Cart */}
        <button
          onClick={() => setCartOpen(true)}
          className="relative inline-flex h-11 w-11 items-center justify-center rounded-full bg-[var(--color-dowgnut-pink)] text-white shadow-sm transition-transform hover:scale-105 active:scale-95"
          aria-label="Open cart"
        >
          <ShoppingCart className="size-5" />
          {cartCount > 0 && (
            <span className="absolute -right-1 -top-1 inline-flex h-5 min-w-5 items-center justify-center rounded-full bg-[var(--color-dowgnut-lime)] px-1 text-[10px] font-bold text-[var(--color-dowgnut-blue-dark)] ring-2 ring-[var(--color-dowgnut-blue)]">
              {cartCount}
            </span>
          )}
        </button>

        {/* Mobile menu */}
        <Sheet open={mobileOpen} onOpenChange={setMobileOpen}>
          <SheetTrigger asChild>
            <button
              className="inline-flex h-11 w-11 items-center justify-center rounded-full bg-white/10 text-white md:hidden"
              aria-label="Open menu"
            >
              <Menu className="size-5" />
            </button>
          </SheetTrigger>
          <SheetContent side="right" className="w-[88vw] bg-[var(--color-dowgnut-cream)] sm:max-w-sm">
            <SheetHeader className="px-4">
              <SheetTitle className="graffiti-text text-2xl text-[var(--color-dowgnut-blue-dark)]">
                Menu
              </SheetTitle>
            </SheetHeader>
            <div className="flex flex-col gap-2 px-4">
              <div className="relative">
                <Search className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-[var(--color-dowgnut-blue)]/60" />
                <Input
                  value={mobileSearch}
                  onChange={(e) => setMobileSearch(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter") {
                      setSearch(mobileSearch);
                      go("shop");
                    }
                  }}
                  placeholder="Search flavors…"
                  className="h-11 rounded-full pl-9"
                />
                {mobileSearch && (
                  <button
                    onClick={() => {
                      setMobileSearch("");
                      setSearch("");
                    }}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-[var(--color-dowgnut-blue)]/60"
                    aria-label="Clear search"
                  >
                    <X className="size-4" />
                  </button>
                )}
              </div>

              {NAV.map((item) => {
                const isActive = view === item.key;
                const showCount = item.key === "favorites" && favorites.length > 0;
                return (
                  <button
                    key={item.key}
                    onClick={() => go(item.key)}
                    className={cn(
                      "flex h-12 items-center justify-between rounded-2xl px-4 text-left text-base font-semibold transition-colors",
                      isActive
                        ? "bg-[var(--color-dowgnut-pink)] text-white"
                        : "bg-white/60 text-[var(--color-dowgnut-blue-dark)] hover:bg-white"
                    )}
                  >
                    <span className="inline-flex items-center gap-3">
                      {item.icon}
                      {item.label}
                    </span>
                    {showCount && (
                      <Badge className="bg-[var(--color-dowgnut-lime)] text-[var(--color-dowgnut-blue-dark)]">
                        {favorites.length}
                      </Badge>
                    )}
                  </button>
                );
              })}

              <Button
                onClick={() => {
                  setConciergeOpen(true);
                  setMobileOpen(false);
                }}
                className="h-12 rounded-2xl bg-[var(--color-dowgnut-blue)] text-white hover:bg-[var(--color-dowgnut-blue-dark)]"
              >
                <Sparkles className="size-4" />
                Ask the Concierge
              </Button>
              <Button
                onClick={() => {
                  setDesignerOpen(true);
                  setMobileOpen(false);
                }}
                className="h-12 rounded-2xl bg-[var(--color-dowgnut-lime)] text-[var(--color-dowgnut-blue-dark)] hover:bg-[var(--color-dowgnut-lime)]/80"
              >
                <Sparkles className="size-4" />
                AI Donut Designer
              </Button>
            </div>
          </SheetContent>
        </Sheet>
      </div>
    </header>
  );
}
