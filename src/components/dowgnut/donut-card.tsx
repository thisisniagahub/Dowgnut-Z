"use client";

import { motion, useMotionValue, useTransform, useSpring } from "framer-motion";
import { Heart, Plus, Star } from "lucide-react";
import { useShop } from "@/store/use-shop";
import { useToast } from "@/hooks/use-toast";
import { celebrateAddToCart, celebrateFavorite } from "@/lib/celebrations";
import { playAddToCart, playFavorite } from "@/lib/sounds";
import { cn } from "@/lib/utils";
import type { Donut } from "@/lib/types";

interface DonutCardProps {
  donut: Donut;
}

export function DonutCard({ donut }: DonutCardProps) {
  const openDetail = useShop((s) => s.openDetail);
  const isFavorite = useShop((s) => s.isFavorite);
  const toggleFavorite = useShop((s) => s.toggleFavorite);
  const addToCart = useShop((s) => s.addToCart);
  const { toast } = useToast();

  // Mouse-track 3D tilt
  const mouseX = useMotionValue(0);
  const mouseY = useMotionValue(0);
  const rotateX = useTransform(mouseY, [-0.5, 0.5], ["8deg", "-8deg"]);
  const rotateY = useTransform(mouseX, [-0.5, 0.5], ["-8deg", "8deg"]);

  // Dynamic 3D shadow — moves opposite to tilt
  const shadowX = useTransform(mouseX, [-0.5, 0.5], [8, -8]);
  const shadowY = useTransform(mouseY, [-0.5, 0.5], [8, -8]);
  const smoothShadowX = useSpring(shadowX, { stiffness: 200, damping: 20 });
  const smoothShadowY = useSpring(shadowY, { stiffness: 200, damping: 20 });
  const dynamicShadow = useTransform(
    [smoothShadowX, smoothShadowY],
    ([x, y]: number[]) => `${x}px ${y}px 20px rgba(7, 51, 79, 0.12), 0 2px 8px rgba(0,0,0,0.06)`
  );

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    const rect = e.currentTarget.getBoundingClientRect();
    mouseX.set((e.clientX - rect.left) / rect.width - 0.5);
    mouseY.set((e.clientY - rect.top) / rect.height - 0.5);
  };

  const handleMouseLeave = () => {
    mouseX.set(0);
    mouseY.set(0);
  };

  const fav = isFavorite(donut.id);

  const onFav = async (e: React.MouseEvent) => {
    e.stopPropagation();
    const wasFav = isFavorite(donut.id);
    await toggleFavorite(donut.id);
    toast({
      title: wasFav ? "Removed from favorites" : "Saved to favorites",
      description: donut.name,
    });
    if (!wasFav) {
      celebrateFavorite(e.currentTarget as HTMLElement);
      playFavorite();
    }
  };

  const onAdd = async (e: React.MouseEvent) => {
    e.stopPropagation();
    try {
      await addToCart(donut.id, 1);
      toast({ title: "Added to cart!", description: `${donut.name} × 1` });
      celebrateAddToCart(e.currentTarget as HTMLElement, donut.imgUrl);
      playAddToCart();
    } catch {
      toast({ title: "Couldn't add to cart", variant: "destructive" });
    }
  };

  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3, type: "spring", stiffness: 200, damping: 20 }}
      role="button"
      tabIndex={0}
      onClick={() => openDetail(donut)}
      onKeyDown={(e) => {
        if (e.key === "Enter" || e.key === " ") {
          e.preventDefault();
          openDetail(donut);
        }
      }}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      style={{ rotateX, rotateY, transformPerspective: 600, boxShadow: dynamicShadow }}
      className="group relative flex cursor-pointer flex-col rounded-2xl border border-[var(--color-dowgnut-blue-dark)]/8 bg-[var(--color-dowgnut-cream)]/70 backdrop-blur-sm p-2 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--color-dowgnut-pink)] focus-visible:ring-offset-2"
    >
      <button
        onClick={onFav}
        aria-label={fav ? "Remove from favorites" : "Add to favorites"}
        className={cn(
          "absolute right-1 top-1 z-10 inline-flex size-8 items-center justify-center transition-colors",
          fav ? "text-[var(--color-dowgnut-pink)]" : "text-[var(--color-dowgnut-blue-dark)]/30 hover:text-[var(--color-dowgnut-pink)]"
        )}
      >
        <Heart className={cn("size-5", fav && "fill-current")} />
      </button>

      <div className="relative flex aspect-square items-center justify-center p-2">
        {/* Radial glow behind donut on hover */}
        <div className="absolute inset-0 rounded-2xl bg-[radial-gradient(circle_at_center,var(--color-dowgnut-pink)/12_0%,transparent_70%)] opacity-0 transition-opacity duration-500 group-hover:opacity-100" />
        <motion.img
          src={donut.imgUrl}
          alt={donut.name}
          width={160}
          height={160}
          className="relative size-full object-contain"
          loading="lazy"
          whileHover={{ scale: 1.12, translateZ: 20 }}
          transition={{ type: "spring", stiffness: 260, damping: 18 }}
        />
        {donut.featured && (
          <span className="absolute bottom-1 left-1 rounded-full bg-[var(--color-dowgnut-pink)] px-1.5 py-0.5 text-[10px] font-bold uppercase tracking-wide text-white">
            ★ Hot
          </span>
        )}
      </div>

      <div className="flex flex-1 flex-col gap-1 px-1 pb-1">
        <h3 className="line-clamp-2 min-h-[2.5rem] text-sm font-semibold leading-tight text-[var(--color-dowgnut-blue-dark)]">
          {donut.name}
        </h3>
        <div className="flex items-center gap-1 text-xs">
          <Star className="size-3 fill-[var(--color-dowgnut-pink)] text-[var(--color-dowgnut-pink)]" />
          <span className="font-semibold text-[var(--color-dowgnut-blue-dark)]">{donut.rating.toFixed(1)}</span>
          <span className="text-[var(--color-dowgnut-blue-dark)]/40">·</span>
          <span className="text-[var(--color-dowgnut-blue-dark)]/50">{donut.calories}cal</span>
        </div>
        <div className="mt-1 flex items-baseline gap-1">
          <span className="text-base font-black tabular-nums text-[var(--color-dowgnut-pink-dark)]">RM{donut.price.toFixed(2)}</span>
        </div>
        {donut.stock <= 5 && donut.stock > 0 && (
          <p className="text-[11px] font-bold uppercase tracking-wide text-[var(--color-dowgnut-pink-dark)]">
            Only {donut.stock} left!
          </p>
        )}
        <button
          onClick={onAdd}
          disabled={donut.stock <= 0}
          aria-label={`Add ${donut.name} to cart`}
          className="group/btn relative mt-1.5 inline-flex h-8 w-full items-center justify-center gap-1.5 overflow-hidden rounded-full bg-[var(--color-dowgnut-pink)] text-xs font-bold text-white transition-all hover:bg-[var(--color-dowgnut-pink-dark)] hover:shadow-[0_0_16px_var(--color-dowgnut-pink)] active:scale-95 disabled:cursor-not-allowed disabled:opacity-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--color-dowgnut-pink)] focus-visible:ring-offset-2"
        >
          {/* Shimmer sweep */}
          <span className="pointer-events-none absolute inset-0 -translate-x-full bg-gradient-to-r from-transparent via-white/25 to-transparent transition-transform duration-700 group-hover/btn:translate-x-full" />
          <Plus className="relative size-3.5" /> <span className="relative">Add</span>
        </button>
      </div>
    </motion.div>
  );
}
