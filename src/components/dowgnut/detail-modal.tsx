"use client";

import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { Heart, HeartOff, Minus, Plus, Star, Loader2 } from "lucide-react";
import { useShop } from "@/store/use-shop";
import {
  Dialog,
  DialogContent,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
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

function Stars({ value }: { value: number }) {
  return (
    <div className="inline-flex items-center gap-0.5" aria-label={`${value.toFixed(1)} out of 5`}>
      {Array.from({ length: 5 }).map((_, i) => (
        <Star
          key={i}
          className={cn(
            "size-4",
            i < Math.round(value)
              ? "fill-[var(--color-dowgnut-pink)] text-[var(--color-dowgnut-pink)]"
              : "text-[var(--color-dowgnut-blue-dark)]/20"
          )}
        />
      ))}
    </div>
  );
}

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
        <DialogContent className="bg-[var(--color-dowgnut-cream)]">
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
      <DialogContent className="max-h-[92vh] w-full max-w-4xl overflow-hidden rounded-3xl border-4 border-[var(--color-dowgnut-blue-dark)] bg-[var(--color-dowgnut-cream)] p-0">
        <DialogTitle className="sr-only">{donut.name}</DialogTitle>
        <div className="grid max-h-[92vh] grid-cols-1 overflow-y-auto scrollbar-dowgnut md:grid-cols-2">
          {/* Left: image */}
          <div className="relative flex items-center justify-center bg-gradient-to-br from-[var(--color-dowgnut-lime)] via-[var(--color-dowgnut-lime-bright)] to-[var(--color-dowgnut-cream)] p-8">
            <div className="absolute inset-0 lime-bg-grid opacity-50" />
            <motion.div
              animate={{ rotate: 360 }}
              transition={{ duration: 22, repeat: Infinity, ease: "linear" }}
              className="relative"
            >
              <img
                src={donut.imgUrl}
                alt={donut.name}
                className="size-64 object-contain drip-shadow sm:size-72"
              />
            </motion.div>
            {donut.featured && (
              <Badge className="absolute left-4 top-4 bg-[var(--color-dowgnut-blue)] text-white">
                ★ Featured
              </Badge>
            )}
          </div>

          {/* Right: details */}
          <div className="flex flex-col gap-4 p-6 sm:p-8">
            <div className="flex items-start justify-between gap-3">
              <div>
                <Badge
                  variant="outline"
                  className="mb-2 border-[var(--color-dowgnut-blue)]/30 capitalize text-[var(--color-dowgnut-blue)]"
                >
                  {donut.type}
                </Badge>
                <h2 className="graffiti-text text-3xl leading-none text-[var(--color-dowgnut-blue-dark)] sm:text-4xl">
                  {donut.name}
                </h2>
              </div>
              <button
                onClick={onFav}
                aria-label={fav ? "Remove favorite" : "Add favorite"}
                className={cn(
                  "inline-flex size-11 shrink-0 items-center justify-center rounded-full shadow-sm transition-colors",
                  fav
                    ? "bg-[var(--color-dowgnut-pink)] text-white"
                    : "bg-white text-[var(--color-dowgnut-pink)] hover:bg-white/80"
                )}
              >
                {fav ? <Heart className="size-5 fill-current" /> : <HeartOff className="size-5" />}
              </button>
            </div>

            <div className="flex flex-wrap items-center gap-3">
              <span className="inline-flex items-center rounded-full bg-[var(--color-dowgnut-blue)] px-3 py-1 text-base font-bold text-white">
                ${donut.price.toFixed(2)}
              </span>
              <Stars value={donut.rating} />
              <span className="text-xs text-[var(--color-dowgnut-blue-dark)]/60">
                {donut.calories} cal
              </span>
              <Badge
                className={
                  donut.stock > 5
                    ? "bg-[var(--color-dowgnut-lime)] text-[var(--color-dowgnut-blue-dark)]"
                    : donut.stock > 0
                      ? "bg-[var(--color-dowgnut-pink)] text-white"
                      : "bg-destructive text-white"
                }
              >
                {donut.stock > 0 ? `${donut.stock} in stock` : "Sold out"}
              </Badge>
            </div>

            <p className="text-sm leading-relaxed text-[var(--color-dowgnut-blue-dark)]/80">
              {donut.description}
            </p>

            {donut.tags.length > 0 && (
              <div className="flex flex-wrap gap-1.5">
                {donut.tags.map((t) => (
                  <Badge
                    key={t}
                    variant="outline"
                    className="border-[var(--color-dowgnut-blue)]/20 bg-white/60 text-[var(--color-dowgnut-blue-dark)]"
                  >
                    #{t}
                  </Badge>
                ))}
              </div>
            )}

            {/* Qty + actions */}
            <div className="mt-2 flex items-center gap-3">
              <div className="inline-flex items-center rounded-full border-2 border-[var(--color-dowgnut-blue-dark)]/15 bg-white">
                <button
                  onClick={() => setQty((q) => Math.max(1, q - 1))}
                  className="inline-flex size-11 items-center justify-center text-[var(--color-dowgnut-blue)] hover:text-[var(--color-dowgnut-pink)]"
                  aria-label="Decrease quantity"
                >
                  <Minus className="size-4" />
                </button>
                <span className="min-w-8 text-center text-base font-bold text-[var(--color-dowgnut-blue-dark)]">
                  {qty}
                </span>
                <button
                  onClick={() => setQty((q) => Math.min(donut.stock || 99, q + 1))}
                  className="inline-flex size-11 items-center justify-center text-[var(--color-dowgnut-blue)] hover:text-[var(--color-dowgnut-pink)]"
                  aria-label="Increase quantity"
                >
                  <Plus className="size-4" />
                </button>
              </div>
              <Button
                onClick={() => onAdd(false)}
                disabled={donut.stock <= 0}
                className="h-11 flex-1 rounded-full bg-[var(--color-dowgnut-blue)] text-white hover:bg-[var(--color-dowgnut-blue-dark)] hover:text-white"
              >
                <Plus className="size-4" /> Add to cart
              </Button>
            </div>
            <Button
              onClick={() => onAdd(true)}
              disabled={donut.stock <= 0}
              className="h-11 rounded-full bg-[var(--color-dowgnut-pink)] text-white hover:bg-[var(--color-dowgnut-pink-dark)] hover:text-white"
            >
              Buy now
            </Button>

            {/* Reviews */}
            <div className="mt-2 border-t border-[var(--color-dowgnut-blue-dark)]/10 pt-4">
              <h3 className="graffiti-text text-lg text-[var(--color-dowgnut-blue-dark)]">
                Reviews ({reviews.length})
              </h3>
              <div className="mt-2 flex max-h-44 flex-col gap-2 overflow-y-auto scrollbar-dowgnut pr-1">
                {reviews.length === 0 ? (
                  <p className="text-xs text-[var(--color-dowgnut-blue-dark)]/60">
                    No reviews yet — be the first!
                  </p>
                ) : (
                  reviews.map((r) => (
                    <div
                      key={r.id}
                      className="rounded-2xl bg-white/70 p-3 text-sm"
                    >
                      <div className="flex items-center justify-between">
                        <span className="font-bold text-[var(--color-dowgnut-blue-dark)]">
                          {r.author}
                        </span>
                        <Stars value={r.rating} />
                      </div>
                      <p className="mt-1 text-xs text-[var(--color-dowgnut-blue-dark)]/80">
                        {r.comment}
                      </p>
                      <p className="mt-1 text-[10px] uppercase tracking-wide text-[var(--color-dowgnut-blue-dark)]/40">
                        {new Date(r.createdAt).toLocaleDateString()}
                      </p>
                    </div>
                  ))
                )}
              </div>

              {/* Review form */}
              <div className="mt-3 flex flex-col gap-2 rounded-2xl bg-white/60 p-3">
                <div className="flex flex-col gap-2 sm:flex-row">
                  <Input
                    value={author}
                    onChange={(e) => setAuthor(e.target.value)}
                    placeholder="Your name"
                    className="h-10 bg-white sm:flex-1"
                  />
                  <Select value={rating} onValueChange={setRating}>
                    <SelectTrigger className="h-10 w-full bg-white sm:w-32">
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
                  placeholder="Tell us about the vibe…"
                  className="min-h-16 bg-white text-sm"
                />
                <Button
                  onClick={onReview}
                  disabled={submitting}
                  className="h-10 self-end rounded-full bg-[var(--color-dowgnut-blue-dark)] px-5 text-white hover:bg-[var(--color-dowgnut-blue)] hover:text-white"
                >
                  {submitting ? <Loader2 className="size-4 animate-spin" /> : "Post review"}
                </Button>
              </div>
            </div>
          </div>
        </div>

        {/* Related donuts */}
        {related.length > 0 && (
          <div className="border-t-4 border-[var(--color-dowgnut-blue-dark)]/10 bg-[var(--color-dowgnut-cream)] p-4 sm:p-6">
            <h3 className="graffiti-text mb-3 text-lg text-[var(--color-dowgnut-blue-dark)]">
              More like this
            </h3>
            <div className="flex gap-3 overflow-x-auto scrollbar-dowgnut pb-2">
              {related.map((d) => (
                <button
                  key={d.id}
                  onClick={() => openDetail(d)}
                  className="flex w-28 shrink-0 flex-col items-center gap-2 rounded-2xl bg-white/70 p-3 text-center transition-colors hover:bg-white"
                >
                  <img
                    src={d.imgUrl}
                    alt={d.name}
                    className="size-16 object-contain"
                  />
                  <span className="line-clamp-2 text-xs font-bold text-[var(--color-dowgnut-blue-dark)]">
                    {d.name}
                  </span>
                  <span className="text-xs font-bold text-[var(--color-dowgnut-blue)]">
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
