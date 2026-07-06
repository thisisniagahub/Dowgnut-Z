"use client";

import { motion } from "framer-motion";
import { Heart, HeartOff, Plus, Star } from "lucide-react";
import { useShop } from "@/store/use-shop";
import { useToast } from "@/hooks/use-toast";
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

  const fav = isFavorite(donut.id);

  const onFav = async (e: React.MouseEvent) => {
    e.stopPropagation();
    await toggleFavorite(donut.id);
    toast({
      title: fav ? "Removed from favorites" : "Saved to favorites",
      description: donut.name,
    });
  };

  const onAdd = async (e: React.MouseEvent) => {
    e.stopPropagation();
    try {
      await addToCart(donut.id, 1);
      toast({
        title: "Added to your dowgs!",
        description: `${donut.name} × 1`,
      });
    } catch {
      toast({
        title: "Couldn't add to cart",
        description: "Please try again.",
        variant: "destructive",
      });
    }
  };

  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.25 }}
      role="button"
      tabIndex={0}
      onClick={() => openDetail(donut)}
      onKeyDown={(e) => {
        if (e.key === "Enter" || e.key === " ") {
          e.preventDefault();
          openDetail(donut);
        }
      }}
      className="group relative flex cursor-pointer flex-col"
    >
      {/* Favorite */}
      <button
        onClick={onFav}
        aria-label={fav ? "Remove from favorites" : "Add to favorites"}
        className={cn(
          "absolute right-1 top-1 z-10 inline-flex size-9 items-center justify-center rounded-full shadow-sm transition-colors",
          fav
            ? "bg-[var(--color-dowgnut-pink)] text-white"
            : "bg-white/80 text-[var(--color-dowgnut-pink)] hover:bg-white"
        )}
      >
        {fav ? <Heart className="size-4 fill-current" /> : <HeartOff className="size-4" />}
      </button>

      {/* Image — frameless, floating donut on the page background */}
      <div className="relative flex aspect-square items-center justify-center">
        <img
          src={donut.imgUrl}
          alt={donut.name}
          className="size-full object-contain transition-transform duration-500 group-hover:scale-110 group-hover:-rotate-3"
          loading="lazy"
        />
        {donut.featured && (
          <span className="absolute bottom-1 left-1 inline-flex items-center rounded-full bg-[var(--color-dowgnut-blue)] px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider text-white shadow-sm">
            ★ Featured
          </span>
        )}
      </div>

      {/* Body */}
      <div className="mt-2 px-1">
        <h3 className="line-clamp-2 min-h-[2.5rem] text-sm font-bold leading-tight text-[var(--color-dowgnut-blue-dark)]">
          {donut.name}
        </h3>

        <div className="mt-1 flex items-center gap-1 text-xs">
          <Star className="size-3.5 fill-[var(--color-dowgnut-pink)] text-[var(--color-dowgnut-pink)]" />
          <span className="font-semibold text-[var(--color-dowgnut-blue-dark)]">
            {donut.rating.toFixed(1)}
          </span>
          <span className="text-[var(--color-dowgnut-blue-dark)]/50">•</span>
          <span className="text-[var(--color-dowgnut-blue-dark)]/60">{donut.calories} cal</span>
        </div>

        <div className="mt-2 flex items-center justify-between">
          <span className="inline-flex items-center rounded-full bg-[var(--color-dowgnut-blue)] px-3 py-1 text-sm font-bold text-white">
            ${donut.price.toFixed(2)}
          </span>
          <button
            onClick={onAdd}
            disabled={donut.stock <= 0}
            aria-label={`Add ${donut.name} to cart`}
            className="inline-flex size-10 items-center justify-center rounded-full bg-[var(--color-dowgnut-pink)] text-white shadow-sm transition-transform hover:scale-105 active:scale-95 disabled:cursor-not-allowed disabled:opacity-50"
          >
            <Plus className="size-5" />
          </button>
        </div>
        {donut.stock <= 5 && donut.stock > 0 && (
          <p className="mt-1 text-[10px] font-semibold uppercase tracking-wide text-[var(--color-dowgnut-pink-dark)]">
            Only {donut.stock} left!
          </p>
        )}
        {donut.stock <= 0 && (
          <p className="mt-1 text-[10px] font-semibold uppercase tracking-wide text-destructive">
            Sold out
          </p>
        )}
      </div>
    </motion.div>
  );
}
