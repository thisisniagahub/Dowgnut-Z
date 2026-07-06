"use client";

import { useEffect, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { useShop } from "@/store/use-shop";

/**
 * SplashScreen — a cinematic, "WOW" brand entrance designed to rival
 * million-dollar app intros. Multi-stage reveal:
 *
 *  1. Dark veil with neon glow pulses in
 *  2. Paint splatter particles burst from center
 *  3. Mascot drops in with a bounce + drip shadow
 *  4. Wordmark slides up dramatically (letter-spacing reveal)
 *  5. Tagline fades in with a shimmer
 *  6. "ENTER" pill glows + pulses
 *  7. Curtain wipe exit (lime reveals the app)
 *
 * Tap to skip. Auto-dismisses after ~3.8s.
 */

// Pre-computed paint splatter particles for the burst.
const SPLATTER = Array.from({ length: 14 }).map((_, i) => {
  const angle = (i / 14) * Math.PI * 2;
  const dist = 120 + (i % 3) * 60;
  return {
    x: Math.cos(angle) * dist,
    y: Math.sin(angle) * dist,
    size: 8 + (i % 4) * 6,
    color: [
      "var(--color-dowgnut-pink)",
      "var(--color-dowgnut-blue)",
      "var(--color-dowgnut-lime)",
      "var(--color-dowgnut-pink-dark)",
    ][i % 4],
    delay: 0.1 + (i % 5) * 0.03,
  };
});

export function SplashScreen() {
  const splashDone = useShop((s) => s.splashDone);
  const dismissSplash = useShop((s) => s.dismissSplash);
  const [stage, setStage] = useState(0);

  useEffect(() => {
    if (splashDone) return;
    // Stage progression for the cinematic reveal.
    const timers = [
      setTimeout(() => setStage(1), 100), // veil + glow
      setTimeout(() => setStage(2), 350), // splatter burst
      setTimeout(() => setStage(3), 600), // mascot drop
      setTimeout(() => setStage(4), 1100), // wordmark
      setTimeout(() => setStage(5), 1700), // tagline
      setTimeout(() => setStage(6), 2200), // enter button
      setTimeout(() => dismissSplash(), 4000), // auto-dismiss
    ];
    return () => timers.forEach(clearTimeout);
  }, [splashDone, dismissSplash]);

  return (
    <AnimatePresence>
      {!splashDone && (
        <motion.div
          key="splash"
          initial={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.6, ease: "easeInOut" }}
          onClick={dismissSplash}
          className="fixed inset-0 z-[100] flex cursor-pointer flex-col items-center justify-center overflow-hidden bg-[var(--color-dowgnut-blue-dark)] px-6 text-center"
          role="dialog"
          aria-label="DowgNut splash screen"
        >
          {/* ── Neon glow backdrop ── */}
          <motion.div
            initial={{ opacity: 0, scale: 0.5 }}
            animate={
              stage >= 1
                ? { opacity: [0, 0.8, 0.5], scale: [0.5, 1.4, 1.2] }
                : {}
            }
            transition={{ duration: 1.2, ease: "easeOut" }}
            className="pointer-events-none absolute left-1/2 top-1/2 size-[600px] -translate-x-1/2 -translate-y-1/2 rounded-full"
            style={{
              background:
                "radial-gradient(circle, var(--color-dowgnut-lime) 0%, transparent 60%)",
              filter: "blur(40px)",
            }}
          />

          {/* ── Paint splatter burst ── */}
          {stage >= 2 && (
            <div className="pointer-events-none absolute left-1/2 top-1/2">
              {SPLATTER.map((p, i) => (
                <motion.div
                  key={i}
                  initial={{ x: 0, y: 0, scale: 0, opacity: 0 }}
                  animate={{ x: p.x, y: p.y, scale: 1, opacity: [0, 1, 0.7] }}
                  transition={{
                    delay: p.delay,
                    duration: 0.6,
                    ease: "easeOut",
                  }}
                  className="absolute rounded-full"
                  style={{
                    width: p.size,
                    height: p.size,
                    background: p.color,
                    filter: "blur(1px)",
                  }}
                />
              ))}
            </div>
          )}

          {/* ── Mascot drop ── */}
          <motion.div
            initial={{ y: -120, opacity: 0, scale: 0.4, rotate: -20 }}
            animate={
              stage >= 3
                ? { y: 0, opacity: 1, scale: 1, rotate: 0 }
                : {}
            }
            transition={{ type: "spring", stiffness: 200, damping: 12 }}
            className="relative z-10"
          >
            <motion.div
              animate={stage >= 3 ? { y: [0, -10, 0] } : {}}
              transition={{ duration: 2.5, repeat: Infinity, ease: "easeInOut" }}
            >
              <img
                src="/brand/dowgnut-mascot.png"
                alt="DowgNut mascot"
                className="size-28 object-contain drop-shadow-[0_10px_20px_rgba(232,248,102,0.4)] sm:size-36"
                draggable={false}
              />
            </motion.div>
          </motion.div>

          {/* ── Wordmark dramatic reveal ── */}
          <motion.div
            initial={{ y: 40, opacity: 0, letterSpacing: "0.5em" }}
            animate={
              stage >= 4
                ? { y: 0, opacity: 1, letterSpacing: "0em" }
                : {}
            }
            transition={{ duration: 0.7, ease: [0.16, 1, 0.3, 1] }}
            className="relative z-10 mt-2"
          >
            <img
              src="/brand/dowgnut-logo-wordmark.png"
              alt="DowgNut"
              className="h-20 w-auto drop-shadow-[0_4px_12px_rgba(0,0,0,0.5)] sm:h-28"
              draggable={false}
            />
          </motion.div>

          {/* ── Tagline shimmer ── */}
          <motion.p
            initial={{ y: 20, opacity: 0 }}
            animate={stage >= 5 ? { y: 0, opacity: 1 } : {}}
            transition={{ duration: 0.5 }}
            className="graffiti-text relative z-10 mt-4 text-lg text-[var(--color-dowgnut-lime)] sm:text-2xl"
            style={{ textShadow: "0 0 20px rgba(232,248,102,0.5)" }}
          >
            Good Vibes &amp; Good Dowg
          </motion.p>
          <motion.p
            initial={{ opacity: 0 }}
            animate={stage >= 5 ? { opacity: 1 } : {}}
            transition={{ delay: 0.3, duration: 0.5 }}
            className="relative z-10 mt-1.5 text-[10px] font-bold tracking-[0.4em] text-white/60 sm:text-xs"
          >
            BOLD &nbsp;•&nbsp; PLAYFUL &nbsp;•&nbsp; AUTHENTIC
          </motion.p>

          {/* ── ENTER pill ── */}
          <motion.button
            initial={{ opacity: 0, y: 20 }}
            animate={stage >= 6 ? { opacity: 1, y: 0 } : {}}
            transition={{ duration: 0.4 }}
            onClick={(e) => {
              e.stopPropagation();
              dismissSplash();
            }}
            className="relative z-10 mt-8 inline-flex h-12 items-center gap-2 rounded-full bg-[var(--color-dowgnut-pink)] px-8 text-sm font-bold uppercase tracking-[0.2em] text-white shadow-[0_0_24px_rgba(240,90,155,0.6)]"
          >
            <motion.span
              animate={{ opacity: [1, 0.5, 1] }}
              transition={{ duration: 1.5, repeat: Infinity }}
            >
              Enter
            </motion.span>
            <span>→</span>
          </motion.button>

          {/* ── Bottom neon line ── */}
          <motion.div
            initial={{ scaleX: 0 }}
            animate={stage >= 1 ? { scaleX: 1 } : {}}
            transition={{ duration: 0.8, delay: 0.2 }}
            className="absolute bottom-0 left-0 h-1 w-full origin-left bg-gradient-to-r from-[var(--color-dowgnut-pink)] via-[var(--color-dowgnut-lime)] to-[var(--color-dowgnut-blue)]"
          />
        </motion.div>
      )}
    </AnimatePresence>
  );
}
