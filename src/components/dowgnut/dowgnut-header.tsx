"use client";

import { useShop } from "@/store/use-shop";

export function DowgnutHeader() {
  const setView = useShop((s) => s.setView);

  const go = (v: "shop" | "favorites" | "orders" | "admin") => {
    setView(v);
  };

  return (
    <header className="sticky top-0 z-40 bg-[var(--color-dowgnut-blue)] text-white">
      <div className="flex h-14 items-center justify-center px-4">
        {/* Logo centered — only element */}
        <button
          onClick={() => go("shop")}
          className="flex shrink-0 items-center"
          aria-label="DowgNut home"
        >
          <img
            src="/brand/hypebeast-icon.png"
            alt="DowgNut"
            className="h-9 w-9 rounded-full object-cover"
            draggable={false}
          />
        </button>
      </div>
    </header>
  );
}
