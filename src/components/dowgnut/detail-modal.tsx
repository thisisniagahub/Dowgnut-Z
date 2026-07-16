"use client";

import { useEffect, useState, Suspense } from "react";
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
import { Donut3DViewer } from "./Donut3DViewer";

function Loader() {
  return (
    <div className="flex items-center justify-center w-full h-64 md:h-80">
      <motion.div
        className="w-10 h-10 border-4 border-[var(--color-dowgnut-pink)] border-t-transparent rounded-full"
        animate={{ rotate: 360 }}
        transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
      />
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
  const [isFlipped, setIsFlipped] = useState(false);

  useEffect(() => {
    if (open) {
      setQty(1);
      setAuthor("");
      setRating("5");
      setComment("");
      setIsFlipped(false);
    }
  }, [open, donut?.id]);

  if (!donut) {
    return (
      <Dialog open={open} onOpenChange={(o) => !o && closeDetail()}>
        <DialogContent className="bg-transparent p-0">
          <DialogTitle className="sr-only">Loading</DialogTitle>
          <Suspense fallback={<Loader />}>
            <Loader />
          </Suspense>
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
        className="max-w-4xl bg-transparent p-0 overflow-hidden"
      >
        <div className="relative grid grid-cols-1 lg:grid-cols-2 gap-0">
          {/* Left: 3D Donut Viewer */}
          <div className="relative bg-[var(--color-dowgnut-lime-bright)] p-4 md:p-8 lg:p-12">
            <Suspense fallback={<Loader />}>
              <Donut3DViewer
                donut={donut}
                size={400}
                autoRotate={true}
                interactive={true}
                showSprinkles={true}
                onAddToCart={onAdd}
                onToggleFavorite={onFav}
                isFavorite={fav}
              />
            </Suspense>
            
            {/* Close button */}
            <button
              onClick={() => closeDetail()}
              className="absolute top-4 right-4 z-10 size-10 rounded-full bg-white/80 backdrop-blur-sm text-[var(--color-dowgnut-blue-dark)]/60 hover:text-[var(--color-dowgnut-blue-dark)] hover:bg-white transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--color-dowgnut-pink)]"
              aria-label="Close"
            >
              <X className="size-5" />
            </button>
            
            {/* Favorite button overlay */}
            <button
              onClick={onFav}
              className="absolute top-4 left-4 z-10 size-10 rounded-full bg-white/80 backdrop-blur-sm transition-all hover:scale-110"
              aria-label={fav ? "Remove from favorites" : "Add to favorites"}
            >
              <Heart
                className="size-5 transition-colors"
                fill={fav ? "currentColor" : "none"}
                stroke="currentColor"
                strokeWidth={2}
                style={{ 
                  color: fav ? "#f05a9b" : "var(--color-dowgnut-blue-dark)" 
                }}
              />
            </button>
          </div>

          {/* Right: Details & Actions */}
          <div className="bg-white flex flex-col">
            {/* Header */}
            <div className="p-4 md:p-6 border-b border-[var(--color-dowgnut-blue-dark)]/10">
              <p className="graffiti-text text-xs md:text-sm text-[var(--color-dowgnut-pink-dark)] uppercase tracking-wide">
                {donut.type} · Fresh Daily
              </p>
              <h2 className="graffiti-text text-2xl md:text-3xl lg:text-4xl text-[var(--color-dowgnut-blue-dark)] leading-none mt-1">
                {donut.name}
              </h2>
              <div className="flex items-center gap-3 mt-3">
                <span className="flex items-center gap-1 text-yellow-500 text-sm font-medium">
                  <Star className="size-4 fill-current" /> {donut.rating.toFixed(1)}
                </span>
                <span className="text-xs text-[var(--color-dowgnut-blue-dark)]/50">
                  {donut.calories} kcal · {donut.sugar}g sugar · {donut.fat}g fat
                </span>
              </div>
              <p className="mt-3 text-sm text-[var(--color-dowgnut-blue-dark)]/70 leading-relaxed">
                {donut.description}
              </p>
              <div className="flex flex-wrap gap-2 mt-4">
                {donut.tags?.map((tag) => (
                  <span
                    key={tag}
                    className="px-2 py-1 text-[10px] font-semibold uppercase tracking-wider rounded-full bg-[var(--color-dowgnut-cream)] text-[var(--color-dowgnut-blue-dark)]"
                  >
                    {tag}
                  </span>
                ))}
              </div>
            </div>

            {/* Details & Actions */}
            <div className="flex-1 flex flex-col p-4 md:p-6 overflow-y-auto">
              {/* Stock & Price */}
              <div className="flex items-center justify-between mb-6">
                <div className="flex items-center gap-2">
                  <span className={cn(
                    "inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-bold",
                    donut.stock > 5
                      ? "bg-green-100 text-green-700"
                      : donut.stock > 0
                      ? "bg-yellow-100 text-yellow-700"
                      : "bg-red-100 text-red-700"
                  )}>
                    {donut.stock > 0 ? `${donut.stock} left` : "Sold out"}
                  </span>
                </div>
                <div className="text-right">
                  <p className="graffiti-text text-2xl md:text-3xl font-black text-[var(--color-dowgnut-blue-dark)]">
                    RM{donut.price.toFixed(2)}
                  </p>
                  <p className="text-xs text-[var(--color-dowgnut-blue-dark)]/50">per piece</p>
                </div>
              </div>

              {/* Quantity Stepper */}
              <div className="mb-6">
                <label className="block text-xs font-semibold text-[var(--color-dowgnut-blue-dark)]/60 uppercase tracking-wide mb-2">
                  Quantity
                </label>
                <div className="inline-flex items-center rounded-full border border-[var(--color-dowgnut-blue-dark)]/15 overflow-hidden">
                  <button
                    onClick={() => setQty((q) => Math.max(1, q - 1))}
                    disabled={qty <= 1}
                    className={cn(
                      "inline-flex size-10 items-center justify-center text-[var(--color-dowgnut-blue-dark)] hover:bg-[var(--color-dowgnut-cream)] transition-colors",
                      qty <= 1 && "opacity-50 cursor-not-allowed"
                    )}
                    aria-label="Decrease quantity"
                  >
                    <Minus className="size-4" />
                  </button>
                  <span className="min-w-[50px] text-center font-bold text-[var(--color-dowgnut-blue-dark)] text-base">
                    {qty}
                  </span>
                  <button
                    onClick={() => setQty((q) => q + 1)}
                    disabled={donut.stock <= qty}
                    className={cn(
                      "inline-flex size-10 items-center justify-center text-[var(--color-dowgnut-blue-dark)] hover:bg-[var(--color-dowgnut-cream)] transition-colors",
                      donut.stock <= qty && "opacity-50 cursor-not-allowed"
                    )}
                    aria-label="Increase quantity"
                  >
                    <Plus className="size-4" />
                  </button>
                </div>
                <p className="mt-2 text-xs text-[var(--color-dowgnut-blue-dark)]/50">
                  Total: <span className="font-bold">RM{(donut.price * qty).toFixed(2)}</span>
                </p>
              </div>

              {/* Action Buttons */}
              <div className="flex flex-col sm:flex-row gap-3 mb-6">
                <Button
                  onClick={() => onAdd(false)}
                  disabled={donut.stock <= 0 || submitting}
                  className="flex-1 h-12 md:h-14 text-lg font-bold rounded-full bg-[var(--color-dowgnut-pink)] text-white hover:bg-[var(--color-dowgnut-pink-dark)] active:scale-[0.98] transition-all"
                >
                  Add to Cart
                </Button>
                <Button
                  onClick={() => onAdd(true)}
                  disabled={donut.stock <= 0 || submitting}
                  variant="outline"
                  className="flex-1 h-12 md:h-14 text-lg font-bold rounded-full border-2 border-[var(--color-dowgnut-blue)] text-[var(--color-dowgnut-blue)] hover:bg-[var(--color-dowgnut-blue)]/5 active:scale-[0.98] transition-all"
                >
                  Buy Now
                </Button>
              </div>

              {/* Reviews Section */}
              <div className="border-t border-[var(--color-dowgnut-blue-dark)]/10 pt-6">
                <h3 className="graffiti-text text-lg font-bold text-[var(--color-dowgnut-blue-dark)] mb-4">
                  Reviews ({reviews.length})
                </h3>
                
                {reviews.length > 0 ? (
                  <div className="space-y-4 mb-6 max-h-64 overflow-y-auto scrollbar-dowgnut">
                    {reviews.map((review, i) => (
                      <motion.div
                        key={review.id || i}
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: i * 0.05 }}
                        className="flex flex-col gap-2 p-4 rounded-2xl bg-[var(--color-dowgnut-cream)]"
                      >
                        <div className="flex items-center justify-between">
                          <p className="font-semibold text-[var(--color-dowgnut-blue-dark)]">
                            {review.author}
                          </p>
                          <div className="flex items-center gap-1 text-yellow-500 text-sm">
                            {[...Array(5)].map((_, i) => (
                              <Star
                                key={i}
                                className="size-4"
                                fill={i < review.rating ? "currentColor" : "none"}
                                stroke="currentColor"
                              />
                            ))}
                          </div>
                        </div>
                        <p className="text-sm text-[var(--color-dowgnut-blue-dark)]/70 leading-relaxed">
                          {review.comment}
                        </p>
                        <p className="text-[10px] text-[var(--color-dowgnut-blue-dark)]/40 text-right">
                          {new Date(review.createdAt).toLocaleDateString("en-MY", {
                            day: "numeric",
                            month: "short",
                            year: "numeric",
                          })}
                        </p>
                      </motion.div>
                    ))}
                  </div>
                ) : (
                  <p className="text-sm text-[var(--color-dowgnut-blue-dark)]/50 text-center py-4">
                    No reviews yet. Be the first to share your thoughts!
                  </p>
                )}

                {/* Add Review Form */}
                <div className="rounded-2xl bg-[var(--color-dowgnut-cream)] p-4">
                  <h4 className="graffiti-text text-sm font-bold text-[var(--color-dowgnut-blue-dark)] mb-3">
                    Leave a Review
                  </h4>
                  <div className="space-y-3">
                    <div className="grid grid-cols-2 gap-3">
                      <Input
                        placeholder="Your name"
                        value={author}
                        onChange={(e) => setAuthor(e.target.value)}
                        className="bg-white/50 border-[var(--color-dowgnut-blue-dark)]/15 focus:border-[var(--color-dowgnut-pink)]"
                      />
                      <Select value={rating} onValueChange={setRating}>
                        <SelectTrigger className="bg-white/50 border-[var(--color-dowgnut-blue-dark)]/15 focus:border-[var(--color-dowgnut-pink)]">
                          <SelectValue placeholder="Rating" />
                        </SelectTrigger>
                        <SelectContent>
                          {[5, 4, 3, 2, 1].map((r) => (
                            <SelectItem key={r} value={String(r)}>
                              {r} Star{r > 1 ? "s" : ""}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                    <Textarea
                      placeholder="Your thoughts on this donut..."
                      value={comment}
                      onChange={(e) => setComment(e.target.value)}
                      rows={3}
                      className="bg-white/50 border-[var(--color-dowgnut-blue-dark)]/15 focus:border-[var(--color-dowgnut-pink)] resize-none"
                    />
                    <Button
                      onClick={onReview}
                      disabled={submitting || !author.trim() || !comment.trim()}
                      className="w-full bg-[var(--color-dowgnut-pink)] hover:bg-[var(--color-dowgnut-pink-dark)] disabled:opacity-50"
                    >
                      {submitting ? "Posting..." : "Post Review"}
                    </Button>
                  </div>
                </div>
              </div>

              {/* Related Donuts */}
              {related.length > 0 && (
                <div className="mt-6 pt-6 border-t border-[var(--color-dowgnut-blue-dark)]/10">
                  <h3 className="graffiti-text text-lg font-bold text-[var(--color-dowgnut-blue-dark)] mb-3">
                    More like this
                  </h3>
                  <div className="flex gap-3 overflow-x-auto scrollbar-dowgnut pb-2">
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
                          RM{d.price.toFixed(2)}
                        </span>
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}