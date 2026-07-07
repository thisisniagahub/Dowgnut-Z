"use client";

import { motion } from "framer-motion";
import { Heart, Plus, Star } from "lucide-react";
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
        title: "Added to cart!",
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
      className="group relative flex cursor-pointer flex-col overflow-hidden rounded-2xl border border-[var(--color-dowgnut-blue-dark)]/8 bg-[var(--color-dowgnut-cream)] shadow-sm transition-all hover:-translate-y-0.5 hover:shadow-md"
    >
      {/* Favorite */}
      <button
        onClick={onFav}
        aria-label={fav ? "Remove from favorites" : "Add to favorites"}
        className={cn(
          "absolute right-2 top-2 z-10 inline-flex size-8 items-center justify-center rounded-full shadow-sm transition-colors",
          fav
            ? "bg-[var(--color-dowgnut-pink)] text-white"
            : "bg-white/90 text-[var(--color-dowgnut-pink)] hover:bg-white"
        )}
      >
        <Heart className={cn("size-4", fav && "fill-current")} />
      </button>

      {/* Image */}
      <div className="relative flex aspect-square items-center justify-center bg-white p-3">
        <img
          src={donut.imgUrl}
          alt={donut.name}
          className="size-full object-contain transition-transform duration-500 group-hover:scale-110"
          loading="lazy"
        />
        {donut.featured && (
          <span className="absolute bottom-2 left-2 inline-flex items-center rounded-full bg-[var(--color-dowgnut-pink)] px-1.5 py-0.5 text-[9px] font-bold uppercase tracking-wide text-white shadow-sm">
            ★ Hot
          </span>
        )}
      </div>

      {/* Body */}
      <div className="flex flex-1 flex-col gap-1 p-2.5">
        <h3 className="line-clamp-2 min-h-[2.5rem] text-sm font-semibold leading-tight text-[var(--color-dowgnut-blue-dark)]">
          {donut.name}
        </h3>

        <div className="flex items-center gap-1 text-xs">
          <Star className="size-3 fill-[var(--color-dowgnut-pink)] text-[var(--color-dowgnut-pink)]" />
          <span className="font-semibold text-[var(--color-dowgnut-blue-dark)]">
            {donut.rating.toFixed(1)}
          </span>
          <span className="text-[var(--color-dowgnut-blue-dark)]/40">·</span>
          <span className="text-[var(--color-dowgnut-blue-dark)]/50">{donut.calories}cal</span>
        </div>

        <div className="mt-1 flex items-baseline gap-1">
          <span className="text-base font-black text-[var(--color-dowgnut-pink-dark)]">
            RM{donut.price.toFixed(2)}
          </span>
        </div>

        {donut.stock <= 5 && donut.stock > 0 && (
          <p className="text-[10px] font-bold uppercase tracking-wide text-[var(--color-dowgnut-pink-dark)]">
            Only {donut.stock} left!
          </p>
        )}

        <button
          onClick={onAdd}
          disabled={donut.stock <= 0}
          aria-label={`Add ${donut.name} to cart`}
          className="mt-1.5 inline-flex h-8 w-full items-center justify-center gap-1.5 rounded-full bg-[var(--color-dowgnut-pink)] text-xs font-bold text-white shadow-sm transition-all hover:bg-[var(--color-dowgnut-pink-dark)] active:scale-95 disabled:cursor-not-allowed disabled:opacity-50"
        >
          <Plus className="size-3.5" /> Add
        </button>
      </div>
    </motion.div>
  );
}
