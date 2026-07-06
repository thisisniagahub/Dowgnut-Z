"use client";

import { Heart, Instagram, Package, ShoppingBag, Store, Twitter } from "lucide-react";
import { useShop } from "@/store/use-shop";

export function DowgnutFooter() {
  const setView = useShop((s) => s.setView);
  const setCartOpen = useShop((s) => s.setCartOpen);

  return (
    <footer className="mt-auto bg-[var(--color-dowgnut-blue-dark)] text-white">
      <div className="mx-auto grid max-w-7xl grid-cols-1 gap-8 px-4 py-10 sm:px-6 md:grid-cols-3">
        {/* Brand */}
        <div>
          <div className="flex items-center gap-3">
            <img
              src="/brand/dowgnut-mascot.png"
              alt=""
              className="size-12 animate-float object-contain"
            />
            <div>
              <p className="graffiti-text text-2xl text-white">DowgNut</p>
              <p className="text-xs text-white/60">Good Vibes & Good Dowg</p>
            </div>
          </div>
          <p className="mt-4 max-w-xs text-sm text-white/70">
            Bold, playful, authentic donuts — freshly glazed daily and
            delivered to your door.
          </p>
        </div>

        {/* Quick links */}
        <div>
          <p className="graffiti-text text-sm uppercase tracking-widest text-[var(--color-dowgnut-lime)]">
            Quick links
          </p>
          <ul className="mt-3 space-y-2 text-sm">
            <li>
              <button
                onClick={() => setView("shop")}
                className="inline-flex items-center gap-2 text-white/80 hover:text-[var(--color-dowgnut-pink-soft)]"
              >
                <Store className="size-4" /> Shop
              </button>
            </li>
            <li>
              <button
                onClick={() => setView("favorites")}
                className="inline-flex items-center gap-2 text-white/80 hover:text-[var(--color-dowgnut-pink-soft)]"
              >
                <Heart className="size-4" /> Favorites
              </button>
            </li>
            <li>
              <button
                onClick={() => setView("orders")}
                className="inline-flex items-center gap-2 text-white/80 hover:text-[var(--color-dowgnut-pink-soft)]"
              >
                <Package className="size-4" /> Orders
              </button>
            </li>
            <li>
              <button
                onClick={() => setView("admin")}
                className="inline-flex items-center gap-2 text-white/80 hover:text-[var(--color-dowgnut-pink-soft)]"
              >
                <ShoppingBag className="size-4" /> Admin
              </button>
            </li>
            <li>
              <button
                onClick={() => setCartOpen(true)}
                className="inline-flex items-center gap-2 text-white/80 hover:text-[var(--color-dowgnut-pink-soft)]"
              >
                <ShoppingBag className="size-4" /> Cart
              </button>
            </li>
          </ul>
        </div>

        {/* Connect */}
        <div>
          <p className="graffiti-text text-sm uppercase tracking-widest text-[var(--color-dowgnut-lime)]">
            Connect
          </p>
          <ul className="mt-3 space-y-2 text-sm text-white/80">
            <li className="inline-flex items-center gap-2">
              <Instagram className="size-4 text-[var(--color-dowgnut-pink-soft)]" />
              @dowgnut
            </li>
            <li className="inline-flex items-center gap-2">
              <Twitter className="size-4 text-[var(--color-dowgnut-pink-soft)]" />
              @dowgnut_hq
            </li>
          </ul>
          <p className="mt-4 text-xs text-white/50">
            123 Sugar Street, Sprinklesville, CA 90210
          </p>
        </div>
      </div>

      <div className="border-t border-white/10">
        <div className="mx-auto flex max-w-7xl flex-col items-center justify-between gap-2 px-4 py-4 text-xs text-white/60 sm:flex-row sm:px-6">
          <p>© 2025 DowgNut — Good Vibes &amp; Good Dowg</p>
          <p className="italic">Built with AI 🍩</p>
        </div>
      </div>
    </footer>
  );
}
