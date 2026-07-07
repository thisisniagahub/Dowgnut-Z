"use client";

import { useState } from "react";
import { motion, AnimatePresence, type PanInfo } from "framer-motion";
import { Heart, Minus, Plus, ChevronLeft, ChevronRight, Info } from "lucide-react";
import { useShop } from "@/store/use-shop";
import { useToast } from "@/hooks/use-toast";
import { cn } from "@/lib/utils";

/**
 * DonutSlider — shows 3 donuts at once (center big + 2 sides small/blur),
 * with smooth spring transition between donuts. Merges the multi-donut
 * display from the 3D carousel with the nutrition + qty + add-to-cart
 * from the slider concept.
 *
 * Drag or arrows to navigate. Center donut shows full details.
 */

// Soft background tints per type.
const TYPE_TINT: Record<string, string> = {
  classic: "#FFF7ED",
  sprinkled: "#FDF2F8",
  stuffed: "#EFF6FF",
  specialty: "#FEFCE8",
};

const TYPE_ACCENT: Record<string, string> = {
  classic: "#92400E",
  sprinkled: "#BE185D",
  stuffed: "#1E40AF",
  specialty: "#07334F",
};

export function DonutSlider() {
  const allDonuts = useShop((s) => s.donuts);
  const filterType = useShop((s) => s.filterType);
  const loadingDonuts = useShop((s) => s.loadingDonuts);
  const isFavorite = useShop((s) => s.isFavorite);
  const toggleFavorite = useShop((s) => s.toggleFavorite);
  const addToCart = useShop((s) => s.addToCart);
  const openDetail = useShop((s) => s.openDetail);
  const { toast } = useToast();

  // Respect the active type filter.
  const donuts =
    filterType && filterType !== "all"
      ? allDonuts.filter((d) => d.type === filterType)
      : allDonuts;

  const [index, setIndex] = useState(0);
  const [direction, setDirection] = useState(0);
  const [qty, setQty] = useState(1);
  const [dragging, setDragging] = useState(false);
  const [prevIndex, setPrevIndex] = useState(0);
  const [prevFilter, setPrevFilter] = useState(filterType);

  // Reset index when filter changes.
  if (filterType !== prevFilter) {
    setPrevFilter(filterType);
    setIndex(0);
    setQty(1);
  }

  // Reset qty when donut changes.
  if (index !== prevIndex) {
    setPrevIndex(index);
    setQty(1);
  }

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

  const current = donuts[index];
  if (!current) return null;

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
    const fav = isFavorite(current.id);
    await toggleFavorite(current.id);
    toast({
      title: fav ? "Removed from favorites" : "Saved to favorites",
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

  const fav = isFavorite(current.id);
  const tint = TYPE_TINT[current.type] ?? TYPE_TINT.classic;
  const accent = TYPE_ACCENT[current.type] ?? TYPE_ACCENT.classic;

  // Build the 3 visible slots: prev, center, next.
  const slots = [-1, 0, 1].map((off) => {
    const idx = (index + off + donuts.length) % donuts.length;
    return { offset: off, donut: donuts[idx] };
  });

  return (
    <section
      className="relative mx-auto flex w-full max-w-md flex-1 flex-col px-4 py-4"
      aria-label="Donut slider"
    >
      {/* 3-donut display area — center big, sides small/blur */}
      <div
        className="relative flex h-[340px] items-center justify-center overflow-hidden rounded-3xl"
        style={{ backgroundColor: tint }}
      >
        {/* Drag layer */}
        <motion.div
          className="absolute inset-0 z-20 cursor-grab active:cursor-grabbing"
          drag="x"
          dragConstraints={{ left: 0, right: 0 }}
          dragElastic={0.15}
          onDragStart={() => setDragging(true)}
          onDragEnd={onDragEnd}
        />

        {/* 3 donut images */}
        {slots.map(({ offset, donut }) => {
          if (!donut) return null;
          const isCenter = offset === 0;
          return (
            <motion.div
              key={`${donut.id}-${offset}`}
              initial={false}
              animate={{
                x: offset * 130,
                scale: isCenter ? 1 : 0.6,
                opacity: isCenter ? 1 : 0.5,
                filter: isCenter ? "blur(0px)" : "blur(2px)",
                zIndex: isCenter ? 10 : 5 - Math.abs(offset),
              }}
              transition={{ type: "spring", stiffness: 320, damping: 32 }}
              className="absolute flex items-center justify-center"
              style={{ pointerEvents: dragging ? "none" : "auto" }}
            >
              <motion.img
                src={donut.imgUrl}
                alt={donut.name}
                className={cn(
                  "object-contain drop-shadow-xl",
                  isCenter ? "size-56" : "size-32"
                )}
                draggable={false}
                animate={isCenter ? { y: [0, -8, 0] } : {}}
                transition={isCenter ? { duration: 3, repeat: Infinity, ease: "easeInOut" } : {}}
              />
            </motion.div>
          );
        })}

        {/* Favorite — on center donut */}
        <button
          onClick={onFav}
          aria-label={fav ? "Remove favorite" : "Add favorite"}
          className={cn(
            "absolute right-4 top-4 z-30 inline-flex size-10 items-center justify-center rounded-full transition-all active:scale-90",
            fav
              ? "bg-[var(--color-dowgnut-pink)] text-white"
              : "bg-white/80 text-[var(--color-dowgnut-pink)]"
          )}
        >
          <Heart className={cn("size-5", fav && "fill-current")} />
        </button>
      </div>

      {/* Info section — for center donut */}
      <AnimatePresence mode="wait">
        <motion.div
          key={current.id}
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -8 }}
          transition={{ duration: 0.2 }}
          className="mt-4 flex flex-col gap-3"
        >
          {/* Type + rating */}
          <div className="flex items-center gap-2">
            <span
              className="rounded-full px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider text-white"
              style={{ backgroundColor: accent }}
            >
              {current.type}
            </span>
            <span className="text-xs font-semibold text-[var(--color-dowgnut-blue-dark)]/70">
              ★ {current.rating.toFixed(1)}
            </span>
            {current.featured && (
              <span className="rounded-full bg-[var(--color-dowgnut-pink)] px-2 py-0.5 text-[10px] font-bold uppercase text-white">
                Hot
              </span>
            )}
          </div>

          {/* Name */}
          <h2 className="graffiti-text text-2xl leading-tight" style={{ color: accent }}>
            {current.name}
          </h2>

          {/* Nutrition — inline */}
          <div className="flex items-center gap-4 text-xs text-[var(--color-dowgnut-blue-dark)]/60">
            <span><strong className="text-[var(--color-dowgnut-blue-dark)]">{current.calories}</strong> kcal</span>
            <span><strong className="text-[var(--color-dowgnut-blue-dark)]">{current.sugar}g</strong> sugar</span>
            <span><strong className="text-[var(--color-dowgnut-blue-dark)]">{current.fat}g</strong> fat</span>
          </div>

          {/* Price + qty */}
          <div className="mt-1 flex items-center gap-3">
            <span className="text-2xl font-black text-[var(--color-dowgnut-blue-dark)]">
              RM{(current.price * qty).toFixed(2)}
            </span>
            <div className="ml-auto inline-flex items-center rounded-full border border-[var(--color-dowgnut-blue-dark)]/15">
              <button
                onClick={() => setQty((q) => Math.max(1, q - 1))}
                className="inline-flex size-10 items-center justify-center rounded-l-full text-[var(--color-dowgnut-blue-dark)] hover:bg-[var(--color-dowgnut-cream)]"
                aria-label="Decrease quantity"
              >
                <Minus className="size-4" />
              </button>
              <span className="min-w-8 text-center text-sm font-bold text-[var(--color-dowgnut-blue-dark)]">{qty}</span>
              <button
                onClick={() => setQty((q) => q + 1)}
                className="inline-flex size-10 items-center justify-center rounded-r-full text-[var(--color-dowgnut-blue-dark)] hover:bg-[var(--color-dowgnut-cream)]"
                aria-label="Increase quantity"
              >
                <Plus className="size-4" />
              </button>
            </div>
          </div>

          <button
            onClick={onAdd}
            disabled={current.stock <= 0}
            className="inline-flex h-12 w-full items-center justify-center gap-2 rounded-full bg-[var(--color-dowgnut-pink)] text-sm font-bold text-white shadow-md transition-all hover:bg-[var(--color-dowgnut-pink-dark)] active:scale-95 disabled:opacity-50"
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

      {/* Navigation: arrows + dots */}
      <div className="mt-4 flex items-center justify-between">
        <button
          onClick={() => go(-1)}
          className="inline-flex size-11 items-center justify-center rounded-full bg-white text-[var(--color-dowgnut-blue-dark)] transition-transform hover:scale-105 active:scale-95"
          aria-label="Previous donut"
        >
          <ChevronLeft className="size-5" />
        </button>

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
                i === index ? "w-7 bg-[var(--color-dowgnut-pink)]" : "w-2 bg-[var(--color-dowgnut-blue-dark)]/20"
              )}
            />
          ))}
        </div>

        <button
          onClick={() => go(1)}
          className="inline-flex size-11 items-center justify-center rounded-full bg-white text-[var(--color-dowgnut-blue-dark)] transition-transform hover:scale-105 active:scale-95"
          aria-label="Next donut"
        >
          <ChevronRight className="size-5" />
        </button>
      </div>

      <p className="mt-2 text-center text-[11px] font-medium uppercase tracking-wider text-[var(--color-dowgnut-blue-dark)]/40">
        {filterType && filterType !== "all" ? `${filterType} flavors · ` : ""}{index + 1} of {donuts.length} · swipe to browse
      </p>
    </section>
  );
}
