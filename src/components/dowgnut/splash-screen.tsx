"use client";

import { useEffect } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { useShop } from "@/store/use-shop";

export function SplashScreen() {
  const splashDone = useShop((s) => s.splashDone);
  const dismissSplash = useShop((s) => s.dismissSplash);

  useEffect(() => {
    if (splashDone) return;
    const t = setTimeout(() => dismissSplash(), 2600);
    return () => clearTimeout(t);
  }, [splashDone, dismissSplash]);

  return (
    <AnimatePresence>
      {!splashDone && (
        <motion.div
          key="splash"
          initial={{ opacity: 1 }}
          exit={{ opacity: 0, scale: 1.04 }}
          transition={{ duration: 0.5, ease: "easeInOut" }}
          onClick={dismissSplash}
          className="fixed inset-0 z-[100] flex cursor-pointer flex-col items-center justify-center bg-[var(--color-dowgnut-lime-bright)] px-6 text-center"
          role="dialog"
          aria-label="DowgNut splash screen"
        >
          {/* paint-drip top bars */}
          <div className="absolute inset-x-0 top-0 flex h-3">
            <div className="flex-1 bg-[var(--color-dowgnut-pink)]" style={{ height: 14, transform: "skewY(-0.4deg)" }} />
            <div className="flex-1 bg-[var(--color-dowgnut-blue)]" style={{ height: 10, transform: "skewY(0.3deg)" }} />
            <div className="flex-1 bg-[var(--color-dowgnut-blue-dark)]" style={{ height: 16 }} />
          </div>
          <div className="absolute inset-x-0 bottom-0 flex h-3">
            <div className="flex-1 bg-[var(--color-dowgnut-blue-dark)]" style={{ height: 12, transform: "skewY(0.4deg)" }} />
            <div className="flex-1 bg-[var(--color-dowgnut-pink-dark)]" style={{ height: 16 }} />
            <div className="flex-1 bg-[var(--color-dowgnut-blue)]" style={{ height: 10, transform: "skewY(-0.3deg)" }} />
          </div>

          <motion.div
            initial={{ scale: 0.6, opacity: 0, y: 20 }}
            animate={{ scale: 1, opacity: 1, y: 0 }}
            transition={{ type: "spring", stiffness: 220, damping: 16 }}
            className="animate-float"
          >
            <img
              src="/brand/dowgnut-mascot.png"
              alt="DowgNut mascot"
              className="h-36 w-36 object-contain sm:h-48 sm:w-48 drip-shadow"
            />
          </motion.div>

          <motion.h1
            initial={{ y: 30, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.15, type: "spring", stiffness: 180, damping: 14 }}
            className="graffiti-text brand-stroke mt-4 text-6xl text-[var(--color-dowgnut-pink)] sm:text-8xl"
            style={{ textShadow: "0 6px 0 rgba(7,51,79,0.18)" }}
          >
            DowgNut
          </motion.h1>

          <motion.p
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.35 }}
            className="graffiti-text mt-3 text-lg text-[var(--color-dowgnut-blue-dark)] sm:text-2xl"
          >
            Good Vibes &amp; Good Dowg
          </motion.p>
          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.55 }}
            className="mt-2 text-xs font-semibold tracking-[0.35em] text-[var(--color-dowgnut-blue)] sm:text-sm"
          >
            BOLD &nbsp;•&nbsp; PLAYFUL &nbsp;•&nbsp; AUTHENTIC
          </motion.p>

          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 1 }}
            className="absolute bottom-10 text-[10px] uppercase tracking-widest text-[var(--color-dowgnut-blue-dark)]/60"
          >
            tap to enter
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
