"use client";

import { ChevronRight } from "lucide-react";
import { useShop } from "@/store/use-shop";
import { cn } from "@/lib/utils";
import type { Donut } from "@/lib/types";

// 3 main donut types — the ONLY thing on the first screen.
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

export function ShopHome() {
  const donuts = useShop((s) => s.donuts);
  const setFilterType = useShop((s) => s.setFilterType);
  const setView = useShop((s) => s.setView);

  // Pick one representative donut image per type.
  const typePreview: Record<string, Donut | undefined> = {
    classic: donuts.find((d) => d.type === "classic"),
    sprinkled: donuts.find((d) => d.type === "sprinkled"),
    stuffed: donuts.find((d) => d.type === "stuffed"),
  };

  // Tap a type → set filter + open slider to browse flavors.
  const openTypeSlider = (type: string) => {
    setFilterType(type);
    setView("slider");
  };

  return (
    <div className="flex flex-1 flex-col justify-center px-4 py-6 sm:px-6">
      {/* Heading */}
      <div className="mb-6 text-center">
        <h1 className="graffiti-text text-3xl leading-none text-[var(--color-dowgnut-blue-dark)] sm:text-4xl">
          Pick your style
        </h1>
        <p className="mt-2 text-sm text-[var(--color-dowgnut-blue-dark)]/50">
          Tap a donut type to browse its flavors
        </p>
      </div>

      {/* 3 donut types — the only content on first screen */}
      <div className="flex flex-col gap-4">
        {TYPES.map((t) => {
          const preview = typePreview[t.key];
          return (
            <button
              key={t.key}
              onClick={() => openTypeSlider(t.key)}
              className={cn(
                "group relative flex items-center gap-4 overflow-hidden bg-gradient-to-br p-5 text-left transition-all hover:scale-[1.02] active:scale-[0.99]",
                t.bg
              )}
            >
              {preview && (
                <img
                  src={preview.imgUrl}
                  alt={t.label}
                  className="size-20 shrink-0 object-contain transition-transform duration-500 group-hover:scale-110"
                  draggable={false}
                />
              )}
              <div className="flex-1">
                <p className="text-xl font-black" style={{ color: t.accent }}>
                  {t.emoji} {t.label}
                </p>
                <p className="mt-0.5 text-xs font-medium text-[var(--color-dowgnut-blue-dark)]/60">
                  {t.desc}
                </p>
              </div>
              <ChevronRight className="size-6 shrink-0" style={{ color: t.accent }} />
            </button>
          );
        })}
      </div>
    </div>
  );
}
