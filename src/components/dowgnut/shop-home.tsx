"use client";

import { Search, X, Truck, ShieldCheck, Flame, ChevronRight } from "lucide-react";
import { useShop } from "@/store/use-shop";
import { Input } from "@/components/ui/input";
import { DonutGrid } from "./donut-grid";
import { cn } from "@/lib/utils";
import type { Donut } from "@/lib/types";

// 3 main donut types (Video 2 concept: select type → browse flavors).
const TYPES: { key: string; label: string; emoji: string; desc: string; bg: string; accent: string }[] = [
  {
    key: "classic",
    label: "Classic",
    emoji: "⭕",
    desc: "Timeless glazed & cake donuts",
    bg: "from-[#FFF7ED] to-[#FFE4C4]",
    accent: "#92400E",
  },
  {
    key: "sprinkled",
    label: "Sprinkled",
    emoji: "🌈",
    desc: "Rainbow jimmies & fun toppings",
    bg: "from-[#FDF2F8] to-[#FBCFE8]",
    accent: "#BE185D",
  },
  {
    key: "stuffed",
    label: "Stuffed",
    emoji: "🫃",
    desc: "Filled with cream, jelly & more",
    bg: "from-[#EFF6FF] to-[#BFDBFE]",
    accent: "#1E40AF",
  },
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
  const setView = useShop((s) => s.setView);

  // Pick one representative donut image per type (for the type cards).
  const typePreview: Record<string, Donut | undefined> = {
    classic: donuts.find((d) => d.type === "classic"),
    sprinkled: donuts.find((d) => d.type === "sprinkled"),
    stuffed: donuts.find((d) => d.type === "stuffed"),
  };

  // When a type card is tapped → set that filter + open slider to browse flavors.
  const openTypeSlider = (type: string) => {
    setFilterType(type);
    setView("slider");
  };

  return (
    <div className="flex flex-col gap-5 px-4 pt-4 sm:px-6">
      {/* Search bar */}
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

      {/* Promo strip */}
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

      {/* 3 donut types — tap to browse flavors (Video 2 concept) */}
      <div>
        <h2 className="graffiti-text mb-3 text-lg text-[var(--color-dowgnut-blue-dark)]">
          Pick your style
        </h2>
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
          {TYPES.map((t) => {
            const preview = typePreview[t.key];
            return (
              <button
                key={t.key}
                onClick={() => openTypeSlider(t.key)}
                className={cn(
                  "group relative flex flex-col items-center gap-2 overflow-hidden rounded-2xl bg-gradient-to-br p-4 text-center shadow-sm transition-all hover:-translate-y-0.5 hover:shadow-md",
                  t.bg
                )}
              >
                {/* Donut preview image */}
                {preview && (
                  <img
                    src={preview.imgUrl}
                    alt={t.label}
                    className="size-20 object-contain transition-transform duration-500 group-hover:scale-110"
                    draggable={false}
                  />
                )}
                <div>
                  <p className="text-base font-black" style={{ color: t.accent }}>
                    {t.emoji} {t.label}
                  </p>
                  <p className="mt-0.5 text-[10px] font-medium text-[var(--color-dowgnut-blue-dark)]/60">
                    {t.desc}
                  </p>
                </div>
                <span
                  className="inline-flex items-center gap-0.5 text-[10px] font-bold uppercase tracking-wide"
                  style={{ color: t.accent }}
                >
                  Browse flavors <ChevronRight className="size-3" />
                </span>
              </button>
            );
          })}
        </div>
      </div>

      {/* All donuts grid (still available for direct browsing) */}
      <div>
        <div className="mb-3 flex items-center justify-between">
          <h2 className="graffiti-text text-lg text-[var(--color-dowgnut-blue-dark)]">
            All Donuts
          </h2>
          <button
            onClick={() => setView("slider")}
            className="inline-flex items-center gap-1 text-xs font-bold uppercase tracking-wide text-[var(--color-dowgnut-pink)] hover:underline"
          >
            Slider <ChevronRight className="size-3" />
          </button>
        </div>

        {/* Category pills — for filtering the grid */}
        <div className="-mx-4 mb-3 flex gap-2 overflow-x-auto px-4 pb-1 scrollbar-dowgnut sm:mx-0 sm:px-0">
          {[
            { key: "all", label: "All", emoji: "🍩" },
            ...TYPES.map((t) => ({ key: t.key, label: t.label, emoji: t.emoji })),
            { key: "specialty", label: "Specialty", emoji: "✨" },
          ].map((c) => {
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

        <DonutGrid />
      </div>
    </div>
  );
}
