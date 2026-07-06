"use client";

import { useEffect, useMemo, useState } from "react";
import {
  motion,
  AnimatePresence,
  useMotionValue,
  useTransform,
  animate,
  type PanInfo,
} from "framer-motion";
import { Star, Plus } from "lucide-react";
import { useShop } from "@/store/use-shop";
import type { Donut } from "@/lib/types";
import { cn } from "@/lib/utils";

/**
 * DonutCarousel3D — a rigid 3D coverflow carousel.
 *
 * All donuts are "stuck to one board" (a rotating cylinder in 3D space).
 * A single shared motion value `position` drives every donut's transform,
 * so when you swipe, the whole ring rotates together in perfect sync —
 * no independent springing per card. Swipe/drag live-tracks the finger;
 * on release it snaps to the nearest donut.
 */

// Pixels of horizontal drag = 1 donut slot.
const PX_PER_DONUT = 230;

/** Continuous 3D slot transforms for a (possibly fractional) offset. */
function slot(o: number) {
  const a = Math.abs(o);
  const s = Math.sign(o);

  // x — sideways position
  let x: number;
  if (a <= 1) x = 220 * a;
  else if (a <= 2) x = 220 + (a - 1) * 160;
  else x = 380 + (a - 2) * 110;
  x = s * x;

  // z — depth (recede into screen)
  let z: number;
  if (a <= 1) z = -180 * a;
  else if (a <= 2) z = -180 + (a - 1) * -240;
  else z = -420 + (a - 2) * -120;

  // rotateY — 3D twist
  let ry: number;
  if (a <= 1) ry = 40 * a;
  else if (a <= 2) ry = 40 + (a - 1) * 18;
  else ry = 58 + (a - 2) * 6;
  ry = Math.min(ry, 72);
  ry = s * ry;

  // scale
  let scale: number;
  if (a <= 1) scale = 1 - 0.3 * a;
  else if (a <= 2) scale = 0.7 - 0.22 * (a - 1);
  else scale = Math.max(0.2, 0.48 - 0.12 * (a - 2));

  // opacity
  let opacity: number;
  if (a <= 1) opacity = 1 - 0.2 * a;
  else if (a <= 2) opacity = 0.8 - 0.35 * (a - 1);
  else opacity = Math.max(0, 0.45 - 0.3 * (a - 2));

  // blur (px)
  let blur: number;
  if (a <= 1) blur = 2 * a;
  else if (a <= 2) blur = 2 + 2 * (a - 1);
  else blur = 4 + 2 * (a - 2);

  return { x, z, rotateY: ry, scale, opacity, blur, abs: a };
}

/** Wrap a raw offset into the shortest signed range [-len/2, len/2). */
function wrapOffset(o: number, len: number) {
  const half = len / 2;
  return ((((o + half) % len) + len) % len) - half;
}

/** One donut card — derives ALL its transforms from the shared `position` MV. */
function DonutCard3D({
  donut,
  index,
  position,
  len,
  onOpen,
  onCenter,
}: {
  donut: Donut;
  index: number;
  position: ReturnType<typeof useMotionValue>;
  len: number;
  onOpen: () => void;
  onCenter: () => void;
}) {
  // Wrapped offset (shortest path around the ring) as a motion value.
  const wrapped = useTransform(position, (p) => wrapOffset(index - p, len));

  const x = useTransform(wrapped, (o) => slot(o).x);
  const z = useTransform(wrapped, (o) => slot(o).z);
  const rotateY = useTransform(wrapped, (o) => slot(o).rotateY);
  const scale = useTransform(wrapped, (o) => slot(o).scale);
  const opacity = useTransform(wrapped, (o) => slot(o).opacity);
  const filter = useTransform(wrapped, (o) => `blur(${slot(o).blur}px)`);
  const zIndex = useTransform(wrapped, (o) => Math.round(20 - Math.abs(o) * 3));

  // Center price pill fades in only when this card is near center.
  const pillOpacity = useTransform(wrapped, (o) =>
    Math.max(0, 1 - Math.abs(o) * 2.2)
  );

  return (
    <motion.button
      type="button"
      onClick={onCenter}
      style={{
        x,
        z,
        rotateY,
        scale,
        opacity,
        filter,
        zIndex,
        transformStyle: "preserve-3d",
      }}
      className="absolute left-1/2 top-1/2 flex h-[280px] w-[280px] -translate-x-1/2 -translate-y-1/2 flex-col items-center justify-center sm:h-[340px] sm:w-[340px]"
      aria-label={donut.name}
    >
      {/* spinning donut image (the donut itself spins, the card position is rigid) */}
      <motion.div
        animate={{ rotate: 360 }}
        transition={{ duration: 22, repeat: Infinity, ease: "linear" }}
        className="relative"
      >
        <img
          src={donut.imgUrl}
          alt={donut.name}
          className="size-56 object-contain drop-shadow-[0_18px_18px_rgba(7,51,79,0.28)] sm:size-72"
          draggable={false}
        />
      </motion.div>

      {/* center price pill */}
      <motion.div
        style={{ opacity: pillOpacity }}
        className="pointer-events-none absolute bottom-2 inline-flex items-center gap-2 rounded-full bg-[var(--color-dowgnut-blue-dark)] px-4 py-1.5 text-sm font-bold text-white shadow-lg"
      >
        <Star className="size-3.5 fill-[var(--color-dowgnut-lime)] text-[var(--color-dowgnut-lime)]" />
        {donut.rating.toFixed(1)}
        <span className="text-white/40">·</span>
        ${donut.price.toFixed(2)}
      </motion.div>
    </motion.button>
  );
}

export function DonutCarousel3D() {
  const donuts = useShop((s) => s.donuts);
  const openDetail = useShop((s) => s.openDetail);
  const addToCart = useShop((s) => s.addToCart);

  const featured = useMemo(() => {
    const f = donuts.filter((d) => d.featured);
    const pool = f.length >= 5 ? f : donuts;
    return pool.slice(0, Math.min(7, pool.length));
  }, [donuts]);

  const len = featured.length;

  // Single source of truth for the whole ring's rotation (float, donut units).
  const position = useMotionValue(0);
  const [center, setCenter] = useState(0); // integer label index (wrapped)
  const [paused, setPaused] = useState(false);
  const [dragging, setDragging] = useState(false);

  // Reset if catalog shrinks (adjust-state-during-render pattern).
  if (len > 0 && center >= len) {
    setCenter(0);
    if (position.get() > len) position.set(0);
  }

  // Snap helper — animate the shared position to an integer, update label.
  const snapTo = (targetInt: number) => {
    animate(position, targetInt, {
      type: "spring",
      stiffness: 180,
      damping: 26,
    });
    const wrapped = ((targetInt % len) + len) % len;
    setCenter(wrapped);
  };

  const go = (dir: number) => {
    const target = Math.round(position.get()) + dir;
    snapTo(target);
  };

  // Auto-rotate every 3.4s.
  useEffect(() => {
    if (paused || dragging || len === 0) return;
    const t = setInterval(() => {
      go(1);
    }, 3400);
    return () => clearInterval(t);
  }, [paused, dragging, len]);

  if (len === 0) return null;

  const onPan = (_: unknown, info: PanInfo) => {
    // Live-track finger: position = startCenter - delta/px.
    // (Drag right → position decreases → previous donut comes to center.)
    position.set(center - info.offset.x / PX_PER_DONUT);
  };
  const onPanEnd = () => {
    const target = Math.round(position.get());
    snapTo(target);
    setDragging(false);
  };

  // Clicking a side donut: rotate the ring so it lands at center.
  const centerThis = (index: number) => {
    // Shortest signed delta from current rounded position to this index.
    const current = Math.round(position.get());
    let delta = index - (((current % len) + len) % len);
    if (delta > len / 2) delta -= len;
    if (delta < -len / 2) delta += len;
    snapTo(current + delta);
  };

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
          drag the ring · tap a donut
        </p>
      </div>

      {/* 3D stage */}
      <div
        className="relative h-[340px] w-full overflow-hidden sm:h-[440px]"
        style={{ perspective: "1400px" }}
      >
        {/* Pan gesture layer (transparent) — drives the shared `position`. */}
        <motion.div
          className="absolute inset-0 z-30 cursor-grab touch-pan-y active:cursor-grabbing"
          onPanStart={() => setDragging(true)}
          onPan={onPan}
          onPanEnd={onPanEnd}
        />

        {/* The rigid ring — all cards derive from ONE position value. */}
        <div
          className="absolute inset-0"
          style={{ transformStyle: "preserve-3d" }}
        >
          {featured.map((donut, i) => (
            <DonutCard3D
              key={donut.id}
              donut={donut}
              index={i}
              position={position}
              len={len}
              onOpen={() => {
                // Only open detail if this card is (roughly) centered.
                const off = Math.abs(wrapOffset(i - position.get(), len));
                if (off < 0.5) openDetail(donut);
                else centerThis(i);
              }}
              onCenter={() => centerThis(i)}
            />
          ))}
        </div>
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
            onClick={() => centerThis(i)}
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
