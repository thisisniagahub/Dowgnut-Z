"use client";

import { useShop } from "@/store/use-shop";
import type { Donut } from "@/lib/types";

// 3 donut types — minimal, no boxes, no gradients, no backgrounds.
const TYPES: { key: string; label: string }[] = [
  { key: "classic", label: "Classic" },
  { key: "sprinkled", label: "Sprinkled" },
  { key: "stuffed", label: "Stuffed" },
];

export function ShopHome() {
  const donuts = useShop((s) => s.donuts);
  const setFilterType = useShop((s) => s.setFilterType);
  const setView = useShop((s) => s.setView);

  const typePreview: Record<string, Donut | undefined> = {
    classic: donuts.find((d) => d.type === "classic"),
    sprinkled: donuts.find((d) => d.type === "sprinkled"),
    stuffed: donuts.find((d) => d.type === "stuffed"),
  };

  return (
    <div className="flex flex-1 flex-col items-center justify-center px-6">
      <div className="flex w-full max-w-xs flex-col gap-4">
        {TYPES.map((t) => {
          const preview = typePreview[t.key];
          return (
            <button
              key={t.key}
              onClick={() => {
                setFilterType(t.key);
                setView("slider");
              }}
              className="flex flex-col items-center gap-1"
            >
              {preview && (
                <img
                  src={preview.imgUrl}
                  alt={t.label}
                  className="size-24 object-contain"
                  draggable={false}
                />
              )}
              <span className="text-xs font-medium text-[var(--color-dowgnut-blue-dark)]">
                {t.label}
              </span>
            </button>
          );
        })}
      </div>
    </div>
  );
}
