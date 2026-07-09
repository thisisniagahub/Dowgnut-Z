"use client";

import { motion, AnimatePresence } from "framer-motion";
import { PackageOpen } from "lucide-react";
import { useShop } from "@/store/use-shop";
import { DonutCard } from "./donut-card";
import { SpinningDonut } from "./spinning-donut";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";

export function DonutGrid() {
  const donuts = useShop((s) => s.donuts);
  const loading = useShop((s) => s.loadingDonuts);
  const setView = useShop((s) => s.setView);
  const setFilterType = useShop((s) => s.setFilterType);
  const setSearch = useShop((s) => s.setSearch);

  if (loading) {
    return (
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <Skeleton className="h-4 w-28 bg-[var(--color-dowgnut-blue-dark)]/10" />
        </div>
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 sm:gap-4 lg:grid-cols-4">
          {Array.from({ length: 8 }).map((_, idx) => (
            <div
              key={idx}
              className="flex flex-col gap-3 rounded-2xl border border-[var(--color-dowgnut-blue-dark)]/8 bg-[var(--color-dowgnut-cream)]/70 p-2"
            >
              <div className="relative aspect-square w-full">
                <Skeleton className="absolute inset-0 rounded-xl bg-[var(--color-dowgnut-blue-dark)]/5" />
              </div>
              <div className="flex flex-col gap-2 px-1 pb-1">
                <Skeleton className="h-4 w-4/5 bg-[var(--color-dowgnut-blue-dark)]/10" />
                <Skeleton className="h-4 w-3/5 bg-[var(--color-dowgnut-blue-dark)]/10" />
                <div className="flex items-center gap-2">
                  <Skeleton className="h-3 w-8 bg-[var(--color-dowgnut-blue-dark)]/10" />
                  <Skeleton className="h-3 w-12 bg-[var(--color-dowgnut-blue-dark)]/10" />
                </div>
                <Skeleton className="mt-1 h-5 w-16 bg-[var(--color-dowgnut-blue-dark)]/10" />
                <Skeleton className="mt-1.5 h-8 w-full rounded-full bg-[var(--color-dowgnut-blue-dark)]/10" />
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  if (donuts.length === 0) {
    return (
      <div className="flex flex-col items-center gap-3 py-10 text-center">
        <PackageOpen className="size-8 text-[var(--color-dowgnut-blue)]/50" />
        <div>
          <h3 className="text-sm font-bold text-[var(--color-dowgnut-blue-dark)]">No donuts found</h3>
          <p className="mt-0.5 text-xs text-[var(--color-dowgnut-blue-dark)]/60">
            Try a different flavor or search.
          </p>
        </div>
        <Button
          onClick={() => {
            setFilterType("all");
            setSearch("");
          }}
          className="h-9 rounded-full bg-[var(--color-dowgnut-pink)] px-4 text-xs text-white hover:bg-[var(--color-dowgnut-pink-dark)]"
        >
          Reset
        </Button>
      </div>
    );
  }

  return (
    <>
      <p className="text-xs text-[var(--color-dowgnut-blue-dark)]/50">
        {donuts.length} {donuts.length === 1 ? "donut" : "donuts"} available
      </p>
      <motion.div
        className="grid grid-cols-2 gap-3 sm:grid-cols-3 sm:gap-4 lg:grid-cols-4"
        variants={{
          hidden: {},
          visible: { transition: { staggerChildren: 0.06 } },
        }}
        initial="hidden"
        animate="visible"
        key={donuts.map((d) => d.id).join(",")}
      >
        <AnimatePresence mode="popLayout">
          {donuts.map((d) => (
            <motion.div
              key={d.id}
              variants={{
                hidden: { opacity: 0, y: 24, scale: 0.92 },
                visible: {
                  opacity: 1,
                  y: 0,
                  scale: 1,
                  transition: { type: "spring", stiffness: 260, damping: 22 },
                },
              }}
              exit={{ opacity: 0, scale: 0.9, transition: { duration: 0.2 } }}
              layout
            >
              <DonutCard donut={d} />
            </motion.div>
          ))}
        </AnimatePresence>
      </motion.div>
    </>
  );
}
