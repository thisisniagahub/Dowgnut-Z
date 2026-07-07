"use client";

import { motion } from "framer-motion";
import { ChevronRight } from "lucide-react";
import { useShop } from "@/store/use-shop";
import { cn } from "@/lib/utils";
import type { Donut } from "@/lib/types";

const TYPES: { key: string; label: string; desc: string; bg: string; accent: string }[] = [
  { key: "classic", label: "Classic", desc: "Timeless glazed & cake", bg: "from-[#FFF7ED] to-[#FFE4C4]", accent: "#92400E" },
  { key: "sprinkled", label: "Sprinkled", desc: "Rainbow jimmies & fun", bg: "from-[#FDF2F8] to-[#FBCFE8]", accent: "#BE185D" },
  { key: "stuffed", label: "Stuffed", desc: "Filled with cream & jelly", bg: "from-[#EFF6FF] to-[#BFDBFE]", accent: "#1E40AF" },
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
    <div className="flex flex-1 flex-col px-4 pt-4 sm:px-6">
      {/* Hero heading — staggered reveal */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
        className="mb-4 text-center"
      >
        <h1 className="graffiti-text text-2xl text-[var(--color-dowgnut-blue-dark)] sm:text-3xl">
          Pick your style
        </h1>
        <p className="mt-1 text-xs text-[var(--color-dowgnut-blue-dark)]/50">
          Tap a donut type to browse flavors
        </p>
      </motion.div>

      {/* 3 type cards — staggered entrance with glassmorphism */}
      <div className="flex flex-col gap-3">
        {TYPES.map((t, i) => {
          const preview = typePreview[t.key];
          return (
            <motion.button
              key={t.key}
              onClick={() => {
                setFilterType(t.key);
                setView("slider");
              }}
              initial={{ opacity: 0, x: -30 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{
                delay: 0.15 + i * 0.1,
                type: "spring",
                stiffness: 200,
                damping: 20,
              }}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              className={cn(
                "group relative flex items-center gap-4 overflow-hidden bg-gradient-to-br p-4 backdrop-blur-sm",
                "border border-white/30 rounded-2xl shadow-sm",
                t.bg
              )}
            >
              {preview && (
                <motion.img
                  src={preview.imgUrl}
                  alt={t.label}
                  className="size-20 shrink-0 object-contain"
                  draggable={false}
                  animate={{ y: [0, -6, 0] }}
                  transition={{ duration: 3, repeat: Infinity, ease: "easeInOut", delay: i * 0.3 }}
                />
              )}
              <div className="flex-1 text-left">
                <p className="text-lg font-black" style={{ color: t.accent }}>
                  {t.label}
                </p>
                <p className="text-xs font-medium text-[var(--color-dowgnut-blue-dark)]/60">
                  {t.desc}
                </p>
              </div>
              <motion.div
                animate={{ x: [0, 4, 0] }}
                transition={{ duration: 1.5, repeat: Infinity }}
              >
                <ChevronRight className="size-5" style={{ color: t.accent }} />
              </motion.div>
            </motion.button>
          );
        })}
      </div>
    </div>
  );
}
