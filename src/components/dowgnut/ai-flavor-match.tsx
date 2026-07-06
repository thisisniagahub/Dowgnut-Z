"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Loader2, Sparkles, Wand2, X } from "lucide-react";
import { useShop } from "@/store/use-shop";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import type { Donut } from "@/lib/types";

const QUICK_PROMPTS = [
  "Chocolatey",
  "Fruity",
  "Not too sweet",
  "Big and stuffed",
];

export function AIFlavorMatch() {
  const aiMatch = useShop((s) => s.aiMatch);
  const openDetail = useShop((s) => s.openDetail);
  const { toast } = useToast();

  const [craving, setCraving] = useState("");
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<{
    donuts: Donut[];
    reasoning: string;
  } | null>(null);

  const onMatch = async (text: string) => {
    const c = text.trim();
    if (!c || loading) return;
    setLoading(true);
    setResult(null);
    try {
      const r = await aiMatch(c);
      setResult(r);
      if (!r.donuts || r.donuts.length === 0) {
        toast({
          title: "No matches found",
          description: "Try a different craving.",
        });
      }
    } catch (err: any) {
      toast({
        title: "Match failed",
        description: err?.message ?? "Please try again.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <section className="mx-auto mt-6 w-full max-w-7xl px-4 sm:px-6">
      <Card className="relative overflow-hidden rounded-3xl border-4 border-[var(--color-dowgnut-blue-dark)] bg-gradient-to-br from-[var(--color-dowgnut-pink)] via-[var(--color-dowgnut-pink-dark)] to-[var(--color-dowgnut-blue-dark)] p-5 text-white shadow-[0_8px_0_rgba(7,51,79,0.18)] sm:p-6">
        <div className="absolute inset-0 lime-bg-grid opacity-10" />
        <div className="relative flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
          <div className="max-w-xl">
            <p className="inline-flex items-center gap-1.5 text-xs font-bold uppercase tracking-widest text-[var(--color-dowgnut-lime)]">
              <Wand2 className="size-3.5" /> AI Flavor Match
            </p>
            <h2 className="graffiti-text mt-1 text-2xl text-white sm:text-3xl">
              Craving something? Tell the AI.
            </h2>
            <p className="mt-1 text-sm text-white/80">
              Describe your mood — we&apos;ll match you with three perfect
              donuts.
            </p>
          </div>

          <form
            onSubmit={(e) => {
              e.preventDefault();
              onMatch(craving);
            }}
            className="flex w-full max-w-md flex-col gap-2 sm:flex-row"
          >
            <Input
              value={craving}
              onChange={(e) => setCraving(e.target.value)}
              placeholder="e.g. something chocolatey & decadent"
              className="h-11 flex-1 rounded-full border-white/20 bg-white/95 text-[var(--color-dowgnut-blue-dark)] placeholder:text-[var(--color-dowgnut-blue)]/50"
            />
            <Button
              type="submit"
              disabled={loading || !craving.trim()}
              className="h-11 rounded-full bg-[var(--color-dowgnut-lime)] px-5 text-[var(--color-dowgnut-blue-dark)] hover:bg-white hover:text-[var(--color-dowgnut-blue-dark)]"
            >
              {loading ? <Loader2 className="size-4 animate-spin" /> : <Sparkles className="size-4" />}
              Match me
            </Button>
          </form>
        </div>

        {/* Quick prompts */}
        {!result && !loading && (
          <div className="relative mt-4 flex flex-wrap gap-2">
            {QUICK_PROMPTS.map((p) => (
              <button
                key={p}
                onClick={() => {
                  setCraving(p);
                  onMatch(p);
                }}
                className="rounded-full bg-white/15 px-3 py-1.5 text-xs font-semibold text-white backdrop-blur transition-colors hover:bg-white/25"
              >
                {p}
              </button>
            ))}
          </div>
        )}

        {/* Loading */}
        {loading && (
          <div className="relative mt-4 flex items-center gap-2 text-sm text-white/90">
            <Loader2 className="size-4 animate-spin" />
            Picking your perfect dowgs…
          </div>
        )}

        {/* Results */}
        <AnimatePresence>
          {result && !loading && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="relative mt-5"
            >
              <div className="mb-3 flex items-start justify-between gap-3">
                <p className="text-sm text-white/90">
                  <span className="font-bold text-[var(--color-dowgnut-lime)]">
                    Why these:
                  </span>{" "}
                  {result.reasoning}
                </p>
                <button
                  onClick={() => setResult(null)}
                  aria-label="Dismiss match"
                  className="inline-flex size-7 items-center justify-center rounded-full bg-white/15 text-white hover:bg-white/25"
                >
                  <X className="size-4" />
                </button>
              </div>
              {result.donuts.length > 0 ? (
                <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
                  {result.donuts.map((d, i) => (
                    <button
                      key={d.id}
                      onClick={() => openDetail(d)}
                      className="group flex items-center gap-3 rounded-2xl bg-[var(--color-dowgnut-cream)] p-3 text-left shadow-sm transition-transform hover:-translate-y-1 hover:shadow-md"
                    >
                      <div className="relative">
                        <img
                          src={d.imgUrl}
                          alt={d.name}
                          className="size-14 object-contain"
                        />
                        <span className="absolute -left-2 -top-2 inline-flex size-6 items-center justify-center rounded-full bg-[var(--color-dowgnut-pink)] text-xs font-bold text-white">
                          {i + 1}
                        </span>
                      </div>
                      <div className="min-w-0 flex-1">
                        <p className="line-clamp-1 text-sm font-bold text-[var(--color-dowgnut-blue-dark)]">
                          {d.name}
                        </p>
                        <p className="text-xs capitalize text-[var(--color-dowgnut-blue-dark)]/60">
                          {d.type} • ${d.price.toFixed(2)}
                        </p>
                      </div>
                    </button>
                  ))}
                </div>
              ) : (
                <p className="text-sm text-white/80">
                  No matches — try a different craving.
                </p>
              )}
            </motion.div>
          )}
        </AnimatePresence>
      </Card>
    </section>
  );
}
