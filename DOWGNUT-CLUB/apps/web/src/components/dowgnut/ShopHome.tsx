"use client";

import { Suspense } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { Loader2, Sparkles, ShoppingCart, Package, Sparkle } from "lucide-react";
import { Button } from "@dowgnut/ui";
import { cn } from "@dowgnut/utils";
import { Donut3DViewer } from "@/components/Donut3DViewer";
import { MamakAmbient } from "@/components/MamakAmbient";
import { Scroll3DStory } from "@/components/Scroll3DStory";

const TYPES = [
  { key: "classic", label: "Classic", desc: "Timeless glazed & cake", accentClass: "text-[#92400E]" },
  { key: "sprinkled", label: "Sprinkled", desc: "Rainbow jimmies & fun", accentClass: "text-[#BE185D]" },
  { key: "stuffed", label: "Stuffed", desc: "Filled with cream & jelly", accentClass: "text-[#1E40AF]" },
  { key: "specialty", label: "Specialty", desc: "Premium & exotic flavors", accentClass: "text-[#7C3AED]" },
];

function Loader() {
  return (
    <div className="flex items-center justify-center w-full h-full min-h-[200px]">
      <motion.div
        className="w-8 h-8 border-3 border-[var(--color-dowgnut-pink)] border-t-transparent rounded-full"
        animate={{ rotate: 360 }}
        transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
      />
    </div>
  );
}

function FlavorCard3D({
  type,
  donut,
  index,
  onClick,
}: {
  type: typeof TYPES[0];
  donut: any | undefined;
  index: number;
  onClick: () => void;
}) {
  return (
    <motion.button
      onClick={onClick}
      initial={{ opacity: 0, x: -40, rotateY: -15 }}
      whileInView={{ opacity: 1, x: 0, rotateY: 0 }}
      viewport={{ once: true, amount: 0.3 }}
      transition={{ delay: 0.1 + index * 0.12, type: "spring", stiffness: 200, damping: 20 }}
      whileHover={{ scale: 1.04 }}
      whileTap={{ scale: 0.97 }}
      className="group relative flex flex-1 items-center justify-center focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--color-dowgnut-pink)] rounded-2xl"
      style={{ perspective: "1000px" }}
    >
      {donut ? (
        <Suspense fallback={<Loader />}>
          <Donut3DViewer
            donut={donut}
            size={200}
            autoRotate={true}
            interactive={false}
            showSprinkles={true}
            className="w-full h-full"
          />
        </Suspense>
      ) : (
        <Loader />
      )}
      <div className="absolute bottom-0 left-0 right-0 p-4 pointer-events-none">
        <p className={`text-sm font-black ${type.accentClass}`}>{type.label}</p>
        <p className="text-[10px] text-[var(--color-dowgnut-blue-dark)]/50 mt-0.5">{type.desc}</p>
      </div>
      <motion.div
        className="absolute inset-0 rounded-2xl bg-gradient-to-t from-[var(--color-dowgnut-pink)]/10 via-transparent to-transparent opacity-0 group-hover:opacity-100"
        initial={{ opacity: 0 }}
        whileHover={{ opacity: 1 }}
        transition={{ duration: 0.3 }}
        style={{ pointerEvents: "none" }}
      />
    </motion.button>
  );
}

export function ShopHome() {
  const donuts = useShop((s) => s.donuts);
  const setFilterType = useShop((s) => s.setFilterType);
  const setView = useShop((s) => s.setView);
  const streak = useGamification((s) => s.streak);
  const orderedTypes = useGamification((s) => s.orderedTypes);
  const orderedDonutNames = useGamification((s) => s.orderedDonutNames);
  const earnedBadges = [
    { id: "first-order", label: "First Bite", emoji: "🍩", earned: orderedDonutNames.length > 0 },
    { id: "streak-3", label: "On a Roll", emoji: "🔥", earned: streak >= 3 },
    { id: "try-all-types", label: "Explorer", emoji: "🗺️", earned: orderedTypes.length >= 4 },
    { id: "try-10", label: "Taste Tester", emoji: "👅", earned: orderedDonutNames.length >= 10 },
    { id: "try-all", label: "Donut Master", emoji: "👑", earned: orderedDonutNames.length >= 21 },
  ].filter((b) => b.earned);

  const typePreview: Record<string, any | undefined> = {
    classic: donuts.find((d) => d.type === "classic"),
    sprinkled: donuts.find((d) => d.type === "sprinkled"),
    stuffed: donuts.find((d) => d.type === "stuffed"),
    specialty: donuts.find((d) => d.type === "specialty"),
  };

  return (
    <div className="relative flex flex-1 flex-col items-center px-4 pt-4 sm:px-6 overflow-hidden">
      <MamakAmbient />
      <ParticleBackground count={25} />

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
        className="relative mb-6 text-center"
      >
        <h1 className="graffiti-text text-2xl sm:text-3xl bg-gradient-to-r from-[var(--color-dowgnut-pink)] via-[var(--color-dowgnut-blue)] to-[var(--color-dowgnut-lime)] bg-[200%_auto] bg-clip-text text-transparent animate-[gradient-shift_4s_ease_infinite]">
          Choose Ur Flava
        </h1>
        <p className="mt-1 text-xs text-[var(--color-dowgnut-blue-dark)]/50">
          Tap a donut to browse flavors
        </p>
        {streak > 0 && (
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: [1, 1.05, 1] }}
            transition={{ repeat: Infinity, duration: 2, ease: "easeInOut" }}
            className="mt-2 inline-flex items-center gap-1 rounded-full bg-[var(--color-dowgnut-pink)]/10 px-3 py-1"
          >
            <span className="text-xs font-bold text-[var(--color-dowgnut-pink-dark)]">
              🔥 {streak} day streak
            </span>
          </motion.div>
        )}
      </motion.div>

      <div className="relative flex w-full max-w-sm flex-1 flex-col justify-center gap-2">
        {TYPES.map((t, i) => {
          const preview = typePreview[t.key];
          return (
            <FlavorCard3D
              key={t.key}
              type={t}
              donut={preview}
              index={i}
              onClick={() => {
                setFilterType(t.key);
                setView("slider");
              }}
            />
          ))}
      </div>

      {earnedBadges.length > 0 && (
        <motion.div
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, amount: 0.5 }}
          variants={{
            hidden: {},
            visible: { transition: { staggerChildren: 0.08 } },
          }}
          className="relative mt-4 flex flex-wrap justify-center gap-2"
        >
          {earnedBadges.map((b) => (
            <motion.span
              key={b.id}
              variants={{
                hidden: { opacity: 0, y: 16, scale: 0.8 },
                visible: { opacity: 1, y: 0, scale: 1, transition: { type: "spring", stiffness: 260, damping: 20 } },
              }}
              className="inline-flex items-center gap-1 rounded-full bg-white/60 px-2 py-1 text-xs font-bold text-[var(--color-dowgnut-blue-dark)] backdrop-blur-sm"
            >
              {b.emoji} {b.label}
            </motion.span>
          ))}
        </motion.div>
      )}
    </div>
  );
}