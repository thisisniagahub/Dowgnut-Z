"use client";

import { useState } from "react";
import { motion, AnimatePresence, type PanInfo } from "framer-motion";
import { Heart, Minus, Plus, Star, ChevronLeft, ChevronRight } from "lucide-react";
import { useShop } from "@/store/use-shop";
import { useToast } from "@/hooks/use-toast";
import { cn } from "@/lib/utils";
import type { Donut } from "@/lib/types";

/**
 * DonutSlider — merges concepts from both reference videos:
 *
 * Video 1 (Figma tutorial):
 *  - Smooth drag-to-navigate between donuts (Smart animate feel)
 *  - Bold flavor name prominent on screen
 *  - Color-coded background per flavor type
 *
 * Video 2 (Dunats app):
 *  - Nutrition info (Sugar, Fat, Energy/Calories)
 *  - Minimalist details overlay
 *  - Quantity controls (+/−)
 *  - Add to Cart prominent
 *
 * Result: swipe through donuts one-by-one. Each donut has a color-coded
 * background, bold name, nutrition breakdown, qty stepper, and add-to-cart.
 */

// Color-coded backgrounds per donut type (from Video 1 concept).
const TYPE_BG: Record<string, string> = {
  classic: "from-[#FFF0E0] to-[#FFE0C0]",
  sprinkled: "from-[#FFE0F0] to-[#FFC0E0]",
  stuffed: "from-[#E0F0FF] to-[#C0E0FF]",
  specialty: "from-[#E8F866] to-[#F7FFD6]",
};

const TYPE_ACCENT: Record<string, string> = {
  classic: "#D4B36A",
  sprinkled: "#F05A9B",
  stuffed: "#07579B",
  specialty: "#07334F",
};

export function DonutSlider() {
  const donuts = useShop((s) => s.donuts);
  const loadingDonuts = useShop((s) => s.loadingDonuts);
  const isFavorite = useShop((s) => s.isFavorite);
  const toggleFavorite = useShop((s) => s.toggleFavorite);
  const addToCart = useShop((s) => s.addToCart);
  const openDetail = useShop((s) => s.openDetail);
  const { toast } = useToast();

  const [index, setIndex] = useState(0);
  const [direction, setDirection] = useState(0);
  const [qty, setQty] = useState(1);
  const [dragging, setDragging] = useState(false);
  const [prevIndex, setPrevIndex] = useState(0);

  // Reset qty when donut changes (adjust-state-during-render pattern).
  if (index !== prevIndex) {
    setPrevIndex(index);
    setQty(1);
  }

  const current = donuts[index];

  if (loadingDonuts && donuts.length === 0) {
    return (
      <div className="flex flex-1 items-center justify-center p-10">
        <div className="animate-spin-slow text-5xl">🍩</div>
      </div>
    );
  }

  if (donuts.length === 0) {
    return (
      <div className="mx-auto flex max-w-md flex-1 flex-col items-center justify-center gap-3 p-10 text-center">
        <p className="text-sm text-[var(--color-dowgnut-blue-dark)]/60">
          No donuts available.
        </p>
      </div>
    );
  }

  const go = (dir: number) => {
    setDirection(dir);
    setIndex((i) => (i + dir + donuts.length) % donuts.length);
  };

  const onDragEnd = (_: unknown, info: PanInfo) => {
    setDragging(false);
    if (info.offset.x < -60) go(1);
    else if (info.offset.x > 60) go(-1);
  };

  const onFav = async () => {
    if (!current) return;
    const fav = isFavorite(current.id);
    await toggleFavorite(current.id);
    toast({
      title: fav ? "Removed from favorites" : "Saved to favorites",
      description: current.name,
    });
  };

  const onAdd = async () => {
    if (!current) return;
    try {
      await addToCart(current.id, qty);
      toast({
        title: "Added to cart!",
        description: `${current.name} × ${qty}`,
      });
    } catch {
      toast({ title: "Couldn't add to cart", variant: "destructive" });
    }
  };

  if (!current) return null;

  const fav = isFavorite(current.id);
  const bg = TYPE_BG[current.type] ?? TYPE_BG.classic;
  const accent = TYPE_ACCENT[current.type] ?? TYPE_ACCENT.classic;

  return (
    <section
      className="relative mx-auto w-full max-w-md flex-1 px-4 py-4"
      aria-label="Donut slider"
    >
      {/* Slider card with color-coded background */}
      <div className="relative overflow-hidden rounded-3xl shadow-lg">
        <AnimatePresence mode="wait" custom={direction}>
          <motion.div
            key={current.id}
            custom={direction}
            initial={{ opacity: 0, x: direction > 0 ? 120 : direction < 0 ? -120 : 0, scale: 0.9 }}
            animate={{ opacity: 1, x: 0, scale: 1 }}
            exit={{ opacity: 0, x: direction > 0 ? -120 : 120, scale: 0.9 }}
            transition={{ type: "spring", stiffness: 300, damping: 30 }}
            drag="x"
            dragConstraints={{ left: 0, right: 0 }}
            dragElastic={0.2}
            onDragStart={() => setDragging(true)}
            onDragEnd={onDragEnd}
            className={cn(
              "relative flex min-h-[480px] flex-col bg-gradient-to-br p-6",
              bg,
              dragging ? "cursor-grabbing" : "cursor-grab"
            )}
          >
            {/* Favorite */}
            <button
              onClick={onFav}
              aria-label={fav ? "Remove favorite" : "Add favorite"}
              className={cn(
                "absolute right-4 top-4 z-10 inline-flex size-10 items-center justify-center rounded-full shadow-md transition-colors",
                fav ? "bg-[var(--color-dowgnut-pink)] text-white" : "bg-white/80 text-[var(--color-dowgnut-pink)]"
              )}
            >
              <Heart className={cn("size-5", fav && "fill-current")} />
            </button>

            {/* Donut image — large, centered */}
            <div className="flex flex-1 items-center justify-center py-6">
              <motion.img
                src={current.imgUrl}
                alt={current.name}
                className="size-56 object-contain drop-shadow-2xl sm:size-64"
                draggable={false}
                animate={{ y: [0, -8, 0] }}
                transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
              />
            </div>

            {/* Rating + type badge */}
            <div className="mb-2 flex items-center gap-2">
              <span
                className="inline-flex items-center rounded-full px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-wider text-white"
                style={{ backgroundColor: accent }}
              >
                {current.type}
              </span>
              {current.featured && (
                <span className="inline-flex items-center gap-0.5 rounded-full bg-[var(--color-dowgnut-pink)] px-2 py-0.5 text-[10px] font-bold uppercase text-white">
                  <Star className="size-2.5 fill-current" /> Hot
                </span>
              )}
              <span className="ml-auto inline-flex items-center gap-0.5 text-sm font-bold" style={{ color: accent }}>
                <Star className="size-3.5 fill-current" />
                {current.rating.toFixed(1)}
              </span>
            </div>

            {/* Bold flavor name (Video 1 concept) */}
            <h2
              className="graffiti-text text-3xl leading-none sm:text-4xl"
              style={{ color: accent }}
            >
              {current.name}
            </h2>

            {/* Nutrition info (Video 2 concept) */}
            <div className="mt-3 grid grid-cols-3 gap-2">
              <div className="rounded-xl bg-white/60 p-2 text-center">
                <p className="text-[10px] font-bold uppercase tracking-wide text-[var(--color-dowgnut-blue-dark)]/50">Energy</p>
                <p className="text-sm font-black" style={{ color: accent }}>{current.calories}</p>
                <p className="text-[9px] text-[var(--color-dowgnut-blue-dark)]/40">kcal</p>
              </div>
              <div className="rounded-xl bg-white/60 p-2 text-center">
                <p className="text-[10px] font-bold uppercase tracking-wide text-[var(--color-dowgnut-blue-dark)]/50">Sugar</p>
                <p className="text-sm font-black" style={{ color: accent }}>{current.sugar}g</p>
                <p className="text-[9px] text-[var(--color-dowgnut-blue-dark)]/40">per serving</p>
              </div>
              <div className="rounded-xl bg-white/60 p-2 text-center">
                <p className="text-[10px] font-bold uppercase tracking-wide text-[var(--color-dowgnut-blue-dark)]/50">Fat</p>
                <p className="text-sm font-black" style={{ color: accent }}>{current.fat}g</p>
                <p className="text-[9px] text-[var(--color-dowgnut-blue-dark)]/40">per serving</p>
              </div>
            </div>

            {/* Price + qty + add to cart */}
            <div className="mt-4 flex items-center gap-3">
              <span className="text-2xl font-black" style={{ color: accent }}>
                RM{(current.price * qty).toFixed(2)}
              </span>
              <div className="ml-auto inline-flex items-center gap-1 rounded-full bg-white/80 p-1">
                <button
                  onClick={() => setQty((q) => Math.max(1, q - 1))}
                  className="inline-flex size-8 items-center justify-center rounded-full text-[var(--color-dowgnut-blue-dark)]"
                  aria-label="Decrease quantity"
                >
                  <Minus className="size-4" />
                </button>
                <span className="min-w-6 text-center text-sm font-bold">{qty}</span>
                <button
                  onClick={() => setQty((q) => q + 1)}
                  className="inline-flex size-8 items-center justify-center rounded-full text-[var(--color-dowgnut-blue-dark)]"
                  aria-label="Increase quantity"
                >
                  <Plus className="size-4" />
                </button>
              </div>
            </div>

            <button
              onClick={onAdd}
              disabled={current.stock <= 0}
              className="mt-3 inline-flex h-12 w-full items-center justify-center gap-2 rounded-full text-sm font-bold text-white shadow-md transition-transform hover:scale-[1.02] active:scale-95 disabled:opacity-50"
              style={{ backgroundColor: accent }}
            >
              <Plus className="size-4" /> Add to Cart
            </button>

            <button
              onClick={() => openDetail(current)}
              className="mt-2 text-center text-xs font-semibold uppercase tracking-wide text-[var(--color-dowgnut-blue-dark)]/50 hover:text-[var(--color-dowgnut-blue-dark)]"
            >
              View full details →
            </button>
          </motion.div>
        </AnimatePresence>
      </div>

      {/* Navigation arrows */}
      <div className="mt-3 flex items-center justify-between">
        <button
          onClick={() => go(-1)}
          className="inline-flex size-10 items-center justify-center rounded-full bg-white shadow-sm text-[var(--color-dowgnut-blue-dark)] transition-transform hover:scale-105 active:scale-95"
          aria-label="Previous donut"
        >
          <ChevronLeft className="size-5" />
        </button>

        {/* Dots */}
        <div className="flex items-center gap-1.5">
          {donuts.map((_, i) => (
            <button
              key={i}
              onClick={() => {
                setDirection(i > index ? 1 : -1);
                setIndex(i);
              }}
              aria-label={`Go to donut ${i + 1}`}
              className={cn(
                "h-2 rounded-full transition-all",
                i === index ? "w-6 bg-[var(--color-dowgnut-pink)]" : "w-2 bg-[var(--color-dowgnut-blue-dark)]/20"
              )}
            />
          ))}
        </div>

        <button
          onClick={() => go(1)}
          className="inline-flex size-10 items-center justify-center rounded-full bg-white shadow-sm text-[var(--color-dowgnut-blue-dark)] transition-transform hover:scale-105 active:scale-95"
          aria-label="Next donut"
        >
          <ChevronRight className="size-5" />
        </button>
      </div>

      <p className="mt-2 text-center text-[11px] font-medium uppercase tracking-wider text-[var(--color-dowgnut-blue-dark)]/40">
        ← swipe to browse • {index + 1} of {donuts.length} →
      </p>
    </section>
  );
}
