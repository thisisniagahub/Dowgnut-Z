"use client";

import { useState } from "react";
import {
  motion,
  AnimatePresence,
  useMotionValue,
  useTransform,
  animate,
  type PanInfo,
} from "framer-motion";
import { Heart, Minus, Plus, Info, ArrowLeft } from "lucide-react";
import { useShop } from "@/store/use-shop";
import { useToast } from "@/hooks/use-toast";
import { cn } from "@/lib/utils";
import type { Donut } from "@/lib/types";

/**
 * DonutSlider — 3D ring display showing ALL donuts of the selected type.
 * Tap "Classic" on home → ring of all Classic donuts (half-moon visible).
 * Center donut = active, with nutrition + qty + add to cart below.
 */

const PX_PER_DONUT = 140;
const TILT = 56;
const RADIUS = 170;

function wrapOffset(o: number, len: number) {
  const half = len / 2;
  return ((((o + half) % len) + len) % len) - half;
}

function slot(o: number, len: number) {
  const angleDeg = (o / len) * 360;
  const rad = (angleDeg * Math.PI) / 180;
  const diskX = Math.sin(rad) * RADIUS;
  const diskY = Math.cos(rad) * RADIUS;
  const tiltRad = (TILT * Math.PI) / 180;
  const x = diskX;
  const y = diskY * Math.cos(tiltRad);
  const depth = (1 - Math.cos(rad)) / 2;
  const inFront = Math.abs(angleDeg) <= 90;
  const opacity = inFront ? Math.max(0.5, 1 - depth * 0.4) : 0;
  const blur = depth * 4.5;
  const zIndex = Math.round(20 - depth * 30);
  return { x, y, scale: 1, opacity, blur, zIndex };
}

/** One donut on the ring — derives all transforms from shared `position`. */
function RingCard({
  donut,
  index,
  position,
  len,
  onCenter,
}: {
  donut: Donut;
  index: number;
  position: ReturnType<typeof useMotionValue>;
  len: number;
  onCenter: () => void;
}) {
  const wrapped = useTransform(position, (p) => wrapOffset(index - p, len));
  const x = useTransform(wrapped, (o) => slot(o, len).x);
  const y = useTransform(wrapped, (o) => slot(o, len).y);
  const scale = useTransform(wrapped, (o) => slot(o, len).scale);
  const opacity = useTransform(wrapped, (o) => slot(o, len).opacity);
  const filter = useTransform(wrapped, (o) => `blur(${slot(o, len).blur}px)`);
  const zIndex = useTransform(wrapped, (o) => slot(o, len).zIndex);

  return (
    <motion.button
      onClick={onCenter}
      style={{
        x,
        y,
        scale,
        opacity,
        filter,
        zIndex,
        transformStyle: "preserve-3d",
        rotateX: -TILT,
      }}
      className="absolute left-1/2 top-1/2 flex h-56 w-56 -translate-x-1/2 -translate-y-1/2 items-center justify-center sm:h-64 sm:w-64"
      aria-label={donut.name}
    >
      <img
        src={donut.imgUrl}
        alt={donut.name}
        className="size-44 object-contain sm:size-48"
        draggable={false}
      />
    </motion.button>
  );
}

export function DonutSlider() {
  const allDonuts = useShop((s) => s.donuts);
  const filterType = useShop((s) => s.filterType);
  const loadingDonuts = useShop((s) => s.loadingDonuts);
  const isFavorite = useShop((s) => s.isFavorite);
  const toggleFavorite = useShop((s) => s.toggleFavorite);
  const addToCart = useShop((s) => s.addToCart);
  const openDetail = useShop((s) => s.openDetail);
  const setView = useShop((s) => s.setView);
  const { toast } = useToast();

  const donuts =
    filterType && filterType !== "all"
      ? allDonuts.filter((d) => d.type === filterType)
      : allDonuts;

  const len = donuts.length;
  const position = useMotionValue(0);
  const [center, setCenter] = useState(0);
  const [qty, setQty] = useState(1);
  const [dragging, setDragging] = useState(false);
  const [prevCenter, setPrevCenter] = useState(0);

  if (len > 0 && center >= len) {
    setCenter(0);
    if (position.get() > len) position.set(0);
  }

  // Reset qty when center changes.
  if (center !== prevCenter) {
    setPrevCenter(center);
    setQty(1);
  }

  const snapTo = (targetInt: number) => {
    animate(position, targetInt, {
      type: "spring",
      stiffness: 380,
      damping: 32,
    });
    const wrapped = ((targetInt % len) + len) % len;
    setCenter(wrapped);
  };

  const go = (dir: number) => {
    snapTo(Math.round(position.get()) + dir);
  };

  const onPan = (_: unknown, info: PanInfo) => {
    position.set(center - info.offset.x / PX_PER_DONUT);
  };
  const onPanEnd = () => {
    snapTo(Math.round(position.get()));
    setDragging(false);
  };

  const centerThis = (index: number) => {
    const current = Math.round(position.get());
    let delta = index - (((current % len) + len) % len);
    if (delta > len / 2) delta -= len;
    if (delta < -len / 2) delta += len;
    snapTo(current + delta);
  };

  if (loadingDonuts && len === 0) {
    return (
      <div className="flex flex-1 items-center justify-center p-10">
        <div className="animate-spin-slow text-5xl">🍩</div>
      </div>
    );
  }

  if (len === 0) {
    return (
      <div className="mx-auto flex max-w-md flex-1 flex-col items-center justify-center gap-3 p-10 text-center">
        <p className="text-sm text-[var(--color-dowgnut-blue-dark)]/60">
          No donuts available.
        </p>
      </div>
    );
  }

  const current = donuts[center];
  if (!current) return null;

  const fav = isFavorite(current.id);

  const onFav = async () => {
    const wasFav = isFavorite(current.id);
    await toggleFavorite(current.id);
    toast({
      title: wasFav ? "Removed from favorites" : "Saved to favorites",
      description: current.name,
    });
  };

  const onAdd = async () => {
    try {
      await addToCart(current.id, qty);
      toast({ title: "Added to cart!", description: `${current.name} × ${qty}` });
    } catch {
      toast({ title: "Couldn't add to cart", variant: "destructive" });
    }
  };

  return (
    <section className="relative mx-auto flex w-full max-w-md flex-1 flex-col px-4 py-3">
      {/* Back button */}
      <button
        onClick={() => setView("shop")}
        className="mb-2 inline-flex size-9 items-center justify-center rounded-full text-[var(--color-dowgnut-blue-dark)]/60 hover:bg-[var(--color-dowgnut-cream)] hover:text-[var(--color-dowgnut-blue-dark)]"
        aria-label="Back to home"
      >
        <ArrowLeft className="size-5" />
      </button>

      {/* 3D ring — all donuts of this type */}
      <div
        className="relative h-[300px] w-full overflow-hidden"
        style={{ perspective: "1400px" }}
      >
        <motion.div
          className="absolute inset-0 z-40 cursor-grab touch-pan-y active:cursor-grabbing"
          onPanStart={() => setDragging(true)}
          onPan={onPan}
          onPanEnd={onPanEnd}
        />

        <div
          className="absolute inset-0"
          style={{
            transformStyle: "preserve-3d",
            transform: `rotateX(${TILT}deg)`,
          }}
        >
          {donuts.map((donut, i) => (
            <RingCard
              key={donut.id}
              donut={donut}
              index={i}
              position={position}
              len={len}
              onCenter={() => centerThis(i)}
            />
          ))}
        </div>
      </div>

      {/* Active donut info */}
      <AnimatePresence mode="wait">
        <motion.div
          key={current.id}
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -8 }}
          transition={{ duration: 0.2 }}
          className="mt-2 flex flex-col gap-2"
        >
          <div className="flex items-center gap-2">
            <span className="text-[10px] font-bold uppercase tracking-wider text-[var(--color-dowgnut-blue-dark)]/50">
              {current.type}
            </span>
            <span className="text-xs font-semibold text-[var(--color-dowgnut-blue-dark)]/70">
              ★ {current.rating.toFixed(1)}
            </span>
          </div>

          <h2 className="graffiti-text text-xl leading-tight text-[var(--color-dowgnut-blue-dark)]">
            {current.name}
          </h2>

          <div className="flex items-center gap-3 text-xs text-[var(--color-dowgnut-blue-dark)]/60">
            <span><strong className="text-[var(--color-dowgnut-blue-dark)]">{current.calories}</strong> kcal</span>
            <span><strong className="text-[var(--color-dowgnut-blue-dark)]">{current.sugar}g</strong> sugar</span>
            <span><strong className="text-[var(--color-dowgnut-blue-dark)]">{current.fat}g</strong> fat</span>
          </div>

          <div className="mt-1 flex items-center gap-3">
            <span className="text-xl font-black text-[var(--color-dowgnut-blue-dark)]">
              RM{(current.price * qty).toFixed(2)}
            </span>
            <button
              onClick={onFav}
              className={cn(
                "ml-auto inline-flex size-9 items-center justify-center rounded-full transition-colors",
                fav ? "text-[var(--color-dowgnut-pink)]" : "text-[var(--color-dowgnut-blue-dark)]/30"
              )}
              aria-label="Toggle favorite"
            >
              <Heart className={cn("size-5", fav && "fill-current")} />
            </button>
            <div className="inline-flex items-center rounded-full border border-[var(--color-dowgnut-blue-dark)]/15">
              <button
                onClick={() => setQty((q) => Math.max(1, q - 1))}
                className="inline-flex size-9 items-center justify-center rounded-l-full text-[var(--color-dowgnut-blue-dark)]"
                aria-label="Decrease quantity"
              >
                <Minus className="size-4" />
              </button>
              <span className="min-w-7 text-center text-sm font-bold text-[var(--color-dowgnut-blue-dark)]">{qty}</span>
              <button
                onClick={() => setQty((q) => q + 1)}
                className="inline-flex size-9 items-center justify-center rounded-r-full text-[var(--color-dowgnut-blue-dark)]"
                aria-label="Increase quantity"
              >
                <Plus className="size-4" />
              </button>
            </div>
          </div>

          <button
            onClick={onAdd}
            disabled={current.stock <= 0}
            className="inline-flex h-11 w-full items-center justify-center rounded-full bg-[var(--color-dowgnut-pink)] text-sm font-bold text-white transition-all hover:bg-[var(--color-dowgnut-pink-dark)] active:scale-95 disabled:opacity-50"
          >
            Add to Cart
          </button>

          <button
            onClick={() => openDetail(current)}
            className="flex items-center justify-center gap-1 py-1 text-xs font-semibold uppercase tracking-wider text-[var(--color-dowgnut-blue-dark)]/50 hover:text-[var(--color-dowgnut-blue-dark)]"
          >
            <Info className="size-3.5" /> Full details
          </button>
        </motion.div>
      </AnimatePresence>

      <p className="mt-2 text-center text-[11px] font-medium uppercase tracking-wider text-[var(--color-dowgnut-blue-dark)]/40">
        {filterType && filterType !== "all" ? `${filterType} flavors · ` : ""}{center + 1} of {len} · swipe to browse
      </p>
    </section>
  );
}
