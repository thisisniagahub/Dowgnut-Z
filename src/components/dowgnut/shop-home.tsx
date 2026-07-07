"use client";

import { Search, X, Truck, ShieldCheck, Clock, Flame } from "lucide-react";
import { useShop } from "@/store/use-shop";
import { Input } from "@/components/ui/input";
import { DonutGrid } from "./donut-grid";
import { cn } from "@/lib/utils";

const CATEGORIES = [
  { key: "all", label: "All", emoji: "🍩" },
  { key: "classic", label: "Classic", emoji: "⭕" },
  { key: "sprinkled", label: "Sprinkled", emoji: "🌈" },
  { key: "stuffed", label: "Stuffed", emoji: "🫃" },
  { key: "specialty", label: "Specialty", emoji: "✨" },
];

const PROMOS = [
  { icon: Truck, title: "Free Delivery", desc: "Over RM25" },
  { icon: Flame, title: "Fresh Baked", desc: "Daily" },
  { icon: ShieldCheck, title: "Secure Pay", desc: "TNG · DuitNow" },
];

export function ShopHome() {
  const filterType = useShop((s) => s.filterType);
  const setFilterType = useShop((s) => s.setFilterType);
  const search = useShop((s) => s.search);
  const setSearch = useShop((s) => s.setSearch);
  const donuts = useShop((s) => s.donuts);

  return (
    <div className="flex flex-col gap-4 px-4 pt-4 sm:px-6">
      {/* Search bar — app style, prominent */}
      <div className="relative">
        <Search className="pointer-events-none absolute left-4 top-1/2 size-5 -translate-y-1/2 text-[var(--color-dowgnut-blue-dark)]/40" />
        <Input
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search donuts…"
          className="h-11 rounded-2xl border-[var(--color-dowgnut-blue-dark)]/10 bg-white pl-11 pr-10 text-base shadow-sm"
        />
        {search && (
          <button
            onClick={() => setSearch("")}
            className="absolute right-4 top-1/2 -translate-y-1/2 text-[var(--color-dowgnut-blue-dark)]/40 hover:text-[var(--color-dowgnut-pink)]"
            aria-label="Clear search"
          >
            <X className="size-5" />
          </button>
        )}
      </div>

      {/* Promo strip — compact, app-style */}
      <div className="grid grid-cols-3 gap-2">
        {PROMOS.map((p) => (
          <div
            key={p.title}
            className="flex flex-col items-center gap-0.5 rounded-xl bg-white p-2 text-center shadow-sm"
          >
            <p.icon className="size-4 text-[var(--color-dowgnut-pink)]" />
            <p className="text-[10px] font-bold leading-tight text-[var(--color-dowgnut-blue-dark)]">{p.title}</p>
            <p className="text-[9px] text-[var(--color-dowgnut-blue-dark)]/50">{p.desc}</p>
          </div>
        ))}
      </div>

      {/* Category pills — horizontal scroll */}
      <div className="-mx-4 flex gap-2 overflow-x-auto px-4 pb-1 scrollbar-dowgnut sm:mx-0 sm:px-0">
        {CATEGORIES.map((c) => {
          const active = filterType === c.key;
          return (
            <button
              key={c.key}
              onClick={() => setFilterType(c.key)}
              className={cn(
                "inline-flex h-9 shrink-0 items-center gap-1.5 rounded-full px-3.5 text-sm font-semibold transition-all",
                active
                  ? "bg-[var(--color-dowgnut-blue-dark)] text-white shadow-sm"
                  : "bg-white text-[var(--color-dowgnut-blue-dark)] shadow-sm"
              )}
            >
              <span className="text-sm">{c.emoji}</span>
              {c.label}
            </button>
          );
        })}
      </div>

      {/* Product grid */}
      <DonutGrid />
    </div>
  );
}
