"use client";

import { useEffect, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { useShop } from "@/store/use-shop";

/**
 * SplashScreen — cinematic brand moment with original wordmark logo.
 * Logo fade-in + glow pulse + sprinkle particles.
 */

const SPRINKLES = Array.from({ length: 20 }).map((_, i) => ({
  x: (Math.random() - 0.5) * 300,
  y: (Math.random() - 0.5) * 400,
  size: 4 + Math.random() * 6,
  color: ["#f05a9b", "#07579b", "#e8f866", "#ff9ac7"][i % 4],
  delay: Math.random() * 0.5,
  duration: 2 + Math.random() * 2,
}));

export function SplashScreen() {
  const splashDone = useShop((s) => s.splashDone);
  const dismissSplash = useShop((s) => s.dismissSplash);
  const [visible, setVisible] = useState(true);

  useEffect(() => {
    if (splashDone) return;
    const t1 = setTimeout(() => setVisible(false), 2600);
    const t2 = setTimeout(() => dismissSplash(), 3200);
    return () => {
      clearTimeout(t1);
      clearTimeout(t2);
    };
  }, [splashDone, dismissSplash]);

  return (
    <AnimatePresence>
      {!splashDone && (
        <motion.div
          key="splash"
          initial={{ opacity: 1 }}
          animate={{ opacity: visible ? 1 : 0 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.6, ease: "easeInOut" }}
          onClick={dismissSplash}
          className="fixed inset-0 z-[100] flex cursor-pointer flex-col items-center justify-center overflow-hidden bg-[var(--color-dowgnut-blue-dark)]"
          role="dialog"
          aria-label="DowgNut splash screen"
        >
          {/* Radial glow pulse */}
          <motion.div
            initial={{ scale: 0, opacity: 0 }}
            animate={{ scale: [0, 1.5, 1.2], opacity: [0, 0.4, 0.25] }}
            transition={{ duration: 2, ease: "easeOut" }}
            className="pointer-events-none absolute size-[500px] rounded-full"
            style={{
              background: "radial-gradient(circle, #e8f866 0%, transparent 60%)",
              filter: "blur(40px)",
            }}
          />

          {/* Sprinkle particles */}
          {SPRINKLES.map((s, i) => (
            <motion.div
              key={i}
              initial={{ x: 0, y: 0, scale: 0, opacity: 0 }}
              animate={{
                x: s.x,
                y: s.y,
                scale: 1,
                opacity: [0, 1, 0.6, 0],
              }}
              transition={{
                delay: s.delay,
                duration: s.duration,
                repeat: Infinity,
                repeatDelay: 1,
              }}
              className="pointer-events-none absolute rounded-full"
              style={{ width: s.size, height: s.size, background: s.color }}
            />
          ))}

          {/* Original DowgNut wordmark logo */}
          <motion.img
            src="/brand/dowgnut-logo-wordmark.png"
            alt="DowgNut"
            className="h-20 w-auto drop-shadow-[0_4px_12px_rgba(0,0,0,0.5)] sm:h-28"
            draggable={false}
            initial={{ scale: 0.5, opacity: 0, y: 20 }}
            animate={{ scale: 1, opacity: 1, y: 0 }}
            transition={{ type: "spring", stiffness: 200, damping: 15 }}
          />

          {/* Tagline */}
          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.8, duration: 0.5 }}
            className="mt-4 text-xs font-medium tracking-[0.3em] text-[var(--color-dowgnut-lime)]"
          >
            FRESH · BOLD · DELIVERED
          </motion.p>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
