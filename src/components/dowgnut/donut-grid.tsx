"use client";

import { PackageOpen } from "lucide-react";
import { useShop } from "@/store/use-shop";
import { DonutCard } from "./donut-card";
import { Skeleton } from "@/components/ui/skeleton";
import { Button } from "@/components/ui/button";

export function DonutGrid() {
  const donuts = useShop((s) => s.donuts);
  const loading = useShop((s) => s.loadingDonuts);
  const setView = useShop((s) => s.setView);
  const setFilterType = useShop((s) => s.setFilterType);
  const setSearch = useShop((s) => s.setSearch);

  if (loading) {
    return (
      <div className="mx-auto mt-6 grid w-full max-w-7xl grid-cols-2 gap-4 px-4 sm:grid-cols-3 sm:px-6 lg:grid-cols-4">
        {Array.from({ length: 8 }).map((_, i) => (
          <div
            key={i}
            className="rounded-3xl border-2 border-[var(--color-dowgnut-blue-dark)]/10 bg-[var(--color-dowgnut-cream)] p-3"
          >
            <Skeleton className="aspect-square w-full rounded-2xl bg-[var(--color-dowgnut-lime)]/60" />
            <Skeleton className="mt-3 h-4 w-3/4 rounded-full" />
            <Skeleton className="mt-2 h-3 w-1/2 rounded-full" />
            <div className="mt-3 flex items-center justify-between">
              <Skeleton className="h-6 w-14 rounded-full" />
              <Skeleton className="size-10 rounded-full" />
            </div>
          </div>
        ))}
      </div>
    );
  }

  if (donuts.length === 0) {
    return (
      <div className="mx-auto mt-10 flex w-full max-w-md flex-col items-center gap-4 px-6 text-center">
        <img
          src="/brand/dowgnut-mascot.png"
          alt=""
          className="h-24 w-24 animate-float object-contain"
        />
        <div>
          <PackageOpen className="mx-auto size-8 text-[var(--color-dowgnut-blue)]" />
          <h3 className="graffiti-text mt-2 text-2xl text-[var(--color-dowgnut-blue-dark)]">
            No dowgs found
          </h3>
          <p className="mt-1 text-sm text-[var(--color-dowgnut-blue-dark)]/70">
            Try a different flavor or search term.
          </p>
        </div>
        <Button
          onClick={() => {
            setFilterType("all");
            setSearch("");
            setView("shop");
          }}
          className="rounded-full bg-[var(--color-dowgnut-pink)] px-6 text-white hover:bg-[var(--color-dowgnut-pink-dark)] hover:text-white"
        >
          Reset filters
        </Button>
      </div>
    );
  }

  return (
    <div className="mx-auto mt-6 grid w-full max-w-7xl grid-cols-2 gap-4 px-4 pb-12 sm:grid-cols-3 sm:px-6 lg:grid-cols-4">
      {donuts.map((d) => (
        <DonutCard key={d.id} donut={d} />
      ))}
    </div>
  );
}
