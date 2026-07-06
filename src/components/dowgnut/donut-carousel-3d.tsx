"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { motion, AnimatePresence, type PanInfo } from "framer-motion";
import { ChevronLeft, ChevronRight, Star, Plus } from "lucide-react";
import { useShop } from "@/store/use-shop";
import type { Donut } from "@/lib/types";
import { cn } from "@/lib/utils";

/**
 * DonutCarousel3D — a "gempak" 3D coverflow carousel of featured donuts.
 *
 * Shows 5 donuts at once in 3D perspective: a big center donut plus two
 * angled donuts receding on each side. Auto-rotates, supports drag/arrows,
 * and the center donut spins continuously. Click the center donut to open
 * its detail modal.
 */

interface Slot {
  offset: number; // -2, -1, 0, 1, 2  (0 = center)
  donut: Donut;
}

// 3D transform recipe per offset. Tuned for a punchy coverflow look.
const SLOT_TRANSFORM: Record<
  number,
  { x: number; z: number; rotateY: number; scale: number; opacity: number; blur: number }
> = {
  0: { x: 0, z: 0, rotateY: 0, scale: 1, opacity: 1, blur: 0 },
  [-1]: { x: -210, z: -160, rotateY: 38, scale: 0.72, opacity: 0.85, blur: 1.5 },
  [1]: { x: 210, z: -160, rotateY: -38, scale: 0.72, opacity: 0.85, blur: 1.5 },
  [-2]: { x: -360, z: -380, rotateY: 55, scale: 0.5, opacity: 0.5, blur: 3 },
  [2]: { x: 360, z: -380, rotateY: -55, scale: 0.5, opacity: 0.5, blur: 3 },
};

export function DonutCarousel3D() {
  const donuts = useShop((s) => s.donuts);
  const openDetail = useShop((s) => s.openDetail);
  const addToCart = useShop((s) => s.addToCart);

  // Pick the featured donuts (fallback to first 5 by rating).
  const featured = useMemo(() => {
    const f = donuts.filter((d) => d.featured);
    const pool = f.length >= 5 ? f : donuts;
    return pool.slice(0, Math.min(7, pool.length));
  }, [donuts]);

  const [center, setCenter] = useState(0);
  const [paused, setPaused] = useState(false);
  const [dragging, setDragging] = useState(false);
  const dragStartX = useRef(0);

  // Reset center if catalog shrinks (React "adjust state during render" pattern
  // — avoids setState-in-effect lint error).
  if (featured.length > 0 && center >= featured.length) {
    setCenter(0);
  }

  // Auto-rotate every 3.2s.
  useEffect(() => {
    if (paused || dragging || featured.length === 0) return;
    const t = setInterval(() => {
      setCenter((c) => (c + 1) % featured.length);
    }, 3200);
    return () => clearInterval(t);
  }, [paused, dragging, featured.length]);

  if (featured.length === 0) return null;

  const go = (dir: number) => {
    setCenter((c) => (c + dir + featured.length) % featured.length);
  };

  const onDragStart = (_: unknown, info: PanInfo) => {
    setDragging(true);
    dragStartX.current = info.offset.x;
  };
  const onDragEnd = (_: unknown, info: PanInfo) => {
    const dx = info.offset.x;
    if (dx < -60) go(1);
    else if (dx > 60) go(-1);
    setDragging(false);
  };

  // Build the 5 visible slots around `center`.
  const slots: Slot[] = [];
  for (let off = -2; off <= 2; off++) {
    const idx = (center + off + featured.length) % featured.length;
    slots.push({ offset: off, donut: featured[idx] });
  }

  const active = featured[center];

  return (
    <section
      className="relative mx-auto mt-8 w-full max-w-7xl px-4 sm:px-6"
      aria-label="Featured donuts — 3D carousel"
      onMouseEnter={() => setPaused(true)}
      onMouseLeave={() => setPaused(false)}
    >
      {/* Section heading */}
      <div className="mb-2 flex items-end justify-between gap-3 px-1">
        <div>
          <p className="graffiti-text text-xs uppercase tracking-[0.25em] text-[var(--color-dowgnut-pink-dark)]">
            Gempak picks
          </p>
          <h2 className="graffiti-text text-2xl leading-none text-[var(--color-dowgnut-blue-dark)] sm:text-3xl">
            Spin the dowgs
          </h2>
        </div>
        <p className="hidden text-xs text-[var(--color-dowgnut-blue-dark)]/50 sm:block">
          drag · tap arrows · or let it ride
        </p>
      </div>

      {/* 3D stage */}
      <div
        className="relative h-[340px] w-full overflow-hidden sm:h-[420px]"
        style={{ perspective: "1300px" }}
      >
        {/* draggable layer (transparent, full stage) */}
        <motion.div
          className="absolute inset-0 z-10 cursor-grab active:cursor-grabbing"
          drag="x"
          dragConstraints={{ left: 0, right: 0 }}
          dragElastic={0.12}
          onDragStart={onDragStart}
          onDragEnd={onDragEnd}
        />

        {/* cards */}
        {slots.map(({ offset, donut }) => {
          const t = SLOT_TRANSFORM[offset];
          const isCenter = offset === 0;
          return (
            <motion.button
              key={`${donut.id}-${offset}`}
              type="button"
              onClick={() => {
                if (isCenter) openDetail(donut);
                else setCenter((c) => (c + offset + featured.length) % featured.length);
              }}
              initial={false}
              animate={{
                x: t.x,
                z: t.z,
                rotateY: t.rotateY,
                scale: t.scale,
                opacity: t.opacity,
                filter: `blur(${t.blur}px)`,
              }}
              transition={{ type: "spring", stiffness: 260, damping: 30 }}
              style={{
                transformStyle: "preserve-3d",
                zIndex: 10 - Math.abs(offset),
                pointerEvents: dragging ? "none" : "auto",
              }}
              className="absolute left-1/2 top-1/2 flex h-[260px] w-[260px] -translate-x-1/2 -translate-y-1/2 flex-col items-center justify-center sm:h-[320px] sm:w-[320px]"
              aria-label={`${donut.name}${isCenter ? " — tap to view" : ""}`}
            >
              {/* spinning donut image */}
              <motion.div
                animate={{ rotate: 360 }}
                transition={{
                  duration: isCenter ? 18 : 26,
                  repeat: Infinity,
                  ease: "linear",
                }}
                className="relative"
              >
                <img
                  src={donut.imgUrl}
                  alt={donut.name}
                  className={cn(
                    "object-contain drop-shadow-[0_18px_18px_rgba(7,51,79,0.25)]",
                    isCenter ? "size-56 sm:size-72" : "size-40 sm:size-52"
                  )}
                  draggable={false}
                />
              </motion.div>

              {/* center price pill */}
              {isCenter && (
                <motion.div
                  initial={{ y: 8, opacity: 0 }}
                  animate={{ y: 0, opacity: 1 }}
                  transition={{ delay: 0.15 }}
                  className="absolute bottom-2 inline-flex items-center gap-2 rounded-full bg-[var(--color-dowgnut-blue-dark)] px-4 py-1.5 text-sm font-bold text-white shadow-lg"
                >
                  <Star className="size-3.5 fill-[var(--color-dowgnut-lime)] text-[var(--color-dowgnut-lime)]" />
                  {donut.rating.toFixed(1)}
                  <span className="text-white/40">·</span>
                  ${donut.price.toFixed(2)}
                </motion.div>
              )}
            </motion.button>
          );
        })}

        {/* Arrows */}
        <button
          onClick={() => go(-1)}
          aria-label="Previous donut"
          className="absolute left-1 top-1/2 z-20 inline-flex size-11 -translate-y-1/2 items-center justify-center rounded-full bg-[var(--color-dowgnut-blue-dark)]/80 text-white backdrop-blur transition-transform hover:scale-110 active:scale-95 sm:left-3"
        >
          <ChevronLeft className="size-6" />
        </button>
        <button
          onClick={() => go(1)}
          aria-label="Next donut"
          className="absolute right-1 top-1/2 z-20 inline-flex size-11 -translate-y-1/2 items-center justify-center rounded-full bg-[var(--color-dowgnut-blue-dark)]/80 text-white backdrop-blur transition-transform hover:scale-110 active:scale-95 sm:right-3"
        >
          <ChevronRight className="size-6" />
        </button>
      </div>

      {/* Active donut label + actions */}
      <div className="mt-3 flex flex-col items-center gap-2 text-center">
        <AnimatePresence mode="wait">
          <motion.h3
            key={active.id}
            initial={{ y: 10, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: -10, opacity: 0 }}
            transition={{ duration: 0.25 }}
            className="graffiti-text text-2xl leading-none text-[var(--color-dowgnut-blue-dark)] sm:text-3xl"
          >
            {active.name}
          </motion.h3>
        </AnimatePresence>
        <div className="flex items-center gap-3">
          <button
            onClick={() => openDetail(active)}
            className="inline-flex h-10 items-center gap-2 rounded-full bg-[var(--color-dowgnut-pink)] px-5 text-sm font-bold text-white transition-transform hover:scale-105 active:scale-95"
          >
            View donut
          </button>
          <button
            onClick={async () => {
              try {
                await addToCart(active.id, 1);
              } catch {
                /* toast handled elsewhere */
              }
            }}
            className="inline-flex h-10 items-center gap-2 rounded-full bg-[var(--color-dowgnut-blue)] px-5 text-sm font-bold text-white transition-transform hover:scale-105 active:scale-95"
          >
            <Plus className="size-4" /> Add to cart
          </button>
        </div>
      </div>

      {/* Dot indicators */}
      <div className="mt-3 flex items-center justify-center gap-2">
        {featured.map((_, i) => (
          <button
            key={i}
            onClick={() => setCenter(i)}
            aria-label={`Go to donut ${i + 1}`}
            className={cn(
              "rounded-full transition-all",
              i === center
                ? "h-2.5 w-7 bg-[var(--color-dowgnut-pink)]"
                : "h-2.5 w-2.5 bg-[var(--color-dowgnut-blue-dark)]/25 hover:bg-[var(--color-dowgnut-blue-dark)]/50"
            )}
          />
        ))}
      </div>
    </section>
  );
}
