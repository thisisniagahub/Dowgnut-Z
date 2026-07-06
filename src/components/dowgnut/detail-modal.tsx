"use client";

import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { Heart, Minus, Plus, Loader2, Star, X } from "lucide-react";
import { useShop } from "@/store/use-shop";
import {
  Dialog,
  DialogContent,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { cn } from "@/lib/utils";

export function DetailModal() {
  const open = useShop((s) => s.detailOpen);
  const donut = useShop((s) => s.selectedDonut);
  const reviews = useShop((s) => s.detailReviews);
  const closeDetail = useShop((s) => s.closeDetail);
  const isFavorite = useShop((s) => s.isFavorite);
  const toggleFavorite = useShop((s) => s.toggleFavorite);
  const addToCart = useShop((s) => s.addToCart);
  const setCartOpen = useShop((s) => s.setCartOpen);
  const allDonuts = useShop((s) => s.donuts);
  const openDetail = useShop((s) => s.openDetail);
  const addReview = useShop((s) => s.addReview);
  const { toast } = useToast();

  const [qty, setQty] = useState(1);
  const [author, setAuthor] = useState("");
  const [rating, setRating] = useState("5");
  const [comment, setComment] = useState("");
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (open) {
      setQty(1);
      setAuthor("");
      setRating("5");
      setComment("");
    }
  }, [open, donut?.id]);

  if (!donut) {
    return (
      <Dialog open={open} onOpenChange={(o) => !o && closeDetail()}>
        <DialogContent className="bg-transparent p-0">
          <DialogTitle className="sr-only">Loading</DialogTitle>
          <div className="flex items-center justify-center py-8 text-[var(--color-dowgnut-blue)]">
            <Loader2 className="size-6 animate-spin" />
          </div>
        </DialogContent>
      </Dialog>
    );
  }

  const fav = isFavorite(donut.id);
  const related = allDonuts
    .filter((d) => d.id !== donut.id && d.type === donut.type)
    .slice(0, 4);

  const onAdd = async (buyNow = false) => {
    try {
      await addToCart(donut.id, qty);
      toast({
        title: buyNow ? "Added — opening cart" : "Added to your dowgs!",
        description: `${donut.name} × ${qty}`,
      });
      if (buyNow) {
        closeDetail();
        setCartOpen(true);
      }
    } catch {
      toast({
        title: "Couldn't add to cart",
        description: "Please try again.",
        variant: "destructive",
      });
    }
  };

  const onFav = async () => {
    await toggleFavorite(donut.id);
    toast({
      title: fav ? "Removed from favorites" : "Saved to favorites",
      description: donut.name,
    });
  };

  const onReview = async () => {
    if (!author.trim() || !comment.trim()) {
      toast({
        title: "Mind the gaps",
        description: "Add your name and a quick word.",
        variant: "destructive",
      });
      return;
    }
    setSubmitting(true);
    try {
      await addReview(donut.id, {
        author: author.trim(),
        rating: Number(rating),
        comment: comment.trim(),
      });
      setAuthor("");
      setComment("");
      setRating("5");
      toast({ title: "Thanks for the review!", description: donut.name });
    } catch {
      toast({
        title: "Couldn't post review",
        description: "Please try again.",
        variant: "destructive",
      });
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={(o) => !o && closeDetail()}>
      <DialogContent
        showCloseButton={false}
        className="!max-w-none !w-screen !h-screen !max-h-none !rounded-none !border-none !p-0 !shadow-none !gap-0 !translate-x-0 !translate-y-0 !left-0 !top-0 overflow-y-auto bg-[var(--color-dowgnut-lime-bright)]"
      >
        <DialogTitle className="sr-only">{donut.name}</DialogTitle>

        {/* Close */}
        <button
          onClick={closeDetail}
          aria-label="Close"
          className="fixed right-4 top-4 z-30 inline-flex size-10 items-center justify-center rounded-full bg-[var(--color-dowgnut-blue-dark)]/10 text-[var(--color-dowgnut-blue-dark)] transition-colors hover:bg-[var(--color-dowgnut-blue-dark)]/20"
        >
          <X className="size-5" />
        </button>

        <div className="grid min-h-screen grid-cols-1 md:grid-cols-2">
          {/* Left: big rotating donut — frameless */}
          <div className="relative flex min-h-[40vh] items-center justify-center p-6 md:min-h-screen">
            <button
              onClick={onFav}
              aria-label={fav ? "Remove favorite" : "Add favorite"}
              className={cn(
                "absolute left-5 top-5 z-20 inline-flex size-12 items-center justify-center rounded-full transition-colors",
                fav
                  ? "bg-[var(--color-dowgnut-pink)] text-white"
                  : "bg-white/70 text-[var(--color-dowgnut-pink)] hover:bg-white"
              )}
            >
              <Heart className={cn("size-5", fav && "fill-current")} />
            </button>

            <motion.div
              animate={{ rotate: 360 }}
              transition={{ duration: 24, repeat: Infinity, ease: "linear" }}
              className="relative"
            >
              <img
                src={donut.imgUrl}
                alt={donut.name}
                className="size-72 object-contain sm:size-80 md:size-96"
                draggable={false}
              />
            </motion.div>

            {donut.featured && (
              <span className="absolute bottom-5 left-5 text-xs font-bold uppercase tracking-[0.2em] text-[var(--color-dowgnut-blue-dark)]/50">
                ★ Featured
              </span>
            )}
          </div>

          {/* Right: minimal details */}
          <div className="flex flex-col gap-5 px-6 py-8 sm:px-10 sm:py-12 md:min-h-screen md:justify-center md:px-12 lg:px-16">
            {/* Type + rating — minimal line */}
            <div className="flex items-center gap-2 text-xs font-medium uppercase tracking-[0.18em] text-[var(--color-dowgnut-blue-dark)]/50">
              <span>{donut.type}</span>
              <span>·</span>
              <span className="inline-flex items-center gap-0.5">
                <Star className="size-3 fill-[var(--color-dowgnut-pink)] text-[var(--color-dowgnut-pink)]" />
                {donut.rating.toFixed(1)}
              </span>
              <span>·</span>
              <span>{donut.calories} cal</span>
            </div>

            {/* Name — clean, big */}
            <h2 className="graffiti-text text-3xl leading-[0.95] text-[var(--color-dowgnut-blue-dark)] sm:text-4xl">
              {donut.name}
            </h2>

            {/* Price — bold, clean */}
            <p className="text-2xl font-black text-[var(--color-dowgnut-pink-dark)]">
              ${donut.price.toFixed(2)}
            </p>

            {/* Description — minimal */}
            <p className="max-w-prose text-sm leading-relaxed text-[var(--color-dowgnut-blue-dark)]/70">
              {donut.description}
            </p>

            {/* Stock — minimal */}
            {donut.stock > 0 ? (
              <p className="text-xs font-medium text-[var(--color-dowgnut-blue-dark)]/50">
                {donut.stock} in stock
              </p>
            ) : (
              <p className="text-xs font-semibold text-destructive">Sold out</p>
            )}

            {/* Qty — minimal */}
            <div className="flex items-center gap-4">
              <span className="text-xs uppercase tracking-[0.15em] text-[var(--color-dowgnut-blue-dark)]/40">
                Qty
              </span>
              <div className="inline-flex items-center gap-1">
                <button
                  onClick={() => setQty((q) => Math.max(1, q - 1))}
                  className="inline-flex size-10 items-center justify-center text-[var(--color-dowgnut-blue-dark)] transition-colors hover:text-[var(--color-dowgnut-pink)]"
                  aria-label="Decrease quantity"
                >
                  <Minus className="size-4" />
                </button>
                <span className="min-w-8 text-center text-lg font-bold text-[var(--color-dowgnut-blue-dark)]">
                  {qty}
                </span>
                <button
                  onClick={() => setQty((q) => Math.min(donut.stock || 99, q + 1))}
                  className="inline-flex size-10 items-center justify-center text-[var(--color-dowgnut-blue-dark)] transition-colors hover:text-[var(--color-dowgnut-pink)]"
                  aria-label="Increase quantity"
                >
                  <Plus className="size-4" />
                </button>
              </div>
            </div>

            {/* Actions — minimal, full width */}
            <div className="mt-2 flex flex-col gap-2">
              <Button
                onClick={() => onAdd(true)}
                disabled={donut.stock <= 0}
                className="h-12 w-full rounded-full bg-[var(--color-dowgnut-blue-dark)] text-sm font-semibold uppercase tracking-[0.15em] text-white hover:bg-[var(--color-dowgnut-blue)]"
              >
                Add to cart · ${(donut.price * qty).toFixed(2)}
              </Button>
              <button
                onClick={() => onAdd(false)}
                disabled={donut.stock <= 0}
                className="h-10 w-full text-xs font-medium uppercase tracking-[0.15em] text-[var(--color-dowgnut-blue-dark)]/50 transition-colors hover:text-[var(--color-dowgnut-pink)] disabled:opacity-40"
              >
                Add without opening cart
              </button>
            </div>

            {/* Reviews — minimal */}
            <div className="mt-4 border-t border-[var(--color-dowgnut-blue-dark)]/10 pt-5">
              <h3 className="text-xs font-semibold uppercase tracking-[0.2em] text-[var(--color-dowgnut-blue-dark)]/50">
                Reviews · {reviews.length}
              </h3>

              <div className="mt-3 flex max-h-40 flex-col gap-3 overflow-y-auto scrollbar-dowgnut pr-1">
                {reviews.length === 0 ? (
                  <p className="text-xs text-[var(--color-dowgnut-blue-dark)]/40">
                    No reviews yet — be the first.
                  </p>
                ) : (
                  reviews.map((r) => (
                    <div key={r.id} className="text-sm">
                      <div className="flex items-center justify-between">
                        <span className="font-semibold text-[var(--color-dowgnut-blue-dark)]">
                          {r.author}
                        </span>
                        <span className="inline-flex items-center gap-0.5 text-[var(--color-dowgnut-pink)]">
                          {Array.from({ length: 5 }).map((_, i) => (
                            <Star
                              key={i}
                              className={cn(
                                "size-3",
                                i < r.rating
                                  ? "fill-[var(--color-dowgnut-pink)]"
                                  : "text-[var(--color-dowgnut-blue-dark)]/15"
                              )}
                            />
                          ))}
                        </span>
                      </div>
                      <p className="mt-0.5 text-xs leading-relaxed text-[var(--color-dowgnut-blue-dark)]/70">
                        {r.comment}
                      </p>
                    </div>
                  ))
                )}
              </div>

              {/* Review form — minimal */}
              <div className="mt-4 flex flex-col gap-2">
                <div className="flex flex-col gap-2 sm:flex-row">
                  <Input
                    value={author}
                    onChange={(e) => setAuthor(e.target.value)}
                    placeholder="Name"
                    className="h-9 flex-1 border-[var(--color-dowgnut-blue-dark)]/15 bg-transparent text-sm"
                  />
                  <Select value={rating} onValueChange={setRating}>
                    <SelectTrigger className="h-9 w-full border-[var(--color-dowgnut-blue-dark)]/15 bg-transparent text-sm sm:w-28">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="5">★★★★★</SelectItem>
                      <SelectItem value="4">★★★★</SelectItem>
                      <SelectItem value="3">★★★</SelectItem>
                      <SelectItem value="2">★★</SelectItem>
                      <SelectItem value="1">★</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <Textarea
                  value={comment}
                  onChange={(e) => setComment(e.target.value)}
                  placeholder="Share your thoughts…"
                  className="min-h-12 border-[var(--color-dowgnut-blue-dark)]/15 bg-transparent text-sm"
                />
                <Button
                  onClick={onReview}
                  disabled={submitting}
                  variant="ghost"
                  className="h-9 self-start px-0 text-xs font-semibold uppercase tracking-[0.15em] text-[var(--color-dowgnut-blue-dark)] hover:bg-transparent hover:text-[var(--color-dowgnut-pink)]"
                >
                  {submitting ? (
                    <Loader2 className="size-3 animate-spin" />
                  ) : (
                    "Post review →"
                  )}
                </Button>
              </div>
            </div>
          </div>
        </div>

        {/* Related — minimal, frameless */}
        {related.length > 0 && (
          <div className="px-6 pb-8 pt-2 sm:px-10 md:px-8">
            <h3 className="mb-3 text-xs font-semibold uppercase tracking-[0.2em] text-[var(--color-dowgnut-blue-dark)]/50">
              More like this
            </h3>
            <div className="flex gap-4 overflow-x-auto scrollbar-dowgnut pb-2">
              {related.map((d) => (
                <button
                  key={d.id}
                  onClick={() => openDetail(d)}
                  className="flex w-24 shrink-0 flex-col items-center gap-2 text-center"
                >
                  <img
                    src={d.imgUrl}
                    alt={d.name}
                    className="size-20 object-contain transition-transform hover:scale-110"
                  />
                  <span className="line-clamp-2 text-xs font-medium text-[var(--color-dowgnut-blue-dark)]">
                    {d.name}
                  </span>
                  <span className="text-xs font-bold text-[var(--color-dowgnut-pink-dark)]">
                    ${d.price.toFixed(2)}
                  </span>
                </button>
              ))}
            </div>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}
