"use client";

import { useEffect, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { useShop } from "@/store/use-shop";

/**
 * SplashScreen — cinematic brand moment.
 * Letter-by-letter "DOWGNUT" reveal + glow pulse + sprinkle particles.
 */

const LETTERS = ["D", "O", "W", "G", "N", "U", "T"];

// Pre-computed sprinkle particles.
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

          {/* Logo icon */}
          <motion.img
            src="/brand/hypebeast-icon.png"
            alt="DowgNut"
            className="size-20 rounded-full object-cover sm:size-24"
            draggable={false}
            initial={{ scale: 0.5, opacity: 0, y: 20 }}
            animate={{ scale: 1, opacity: 1, y: 0 }}
            transition={{ type: "spring", stiffness: 200, damping: 15 }}
          />

          {/* Letter-by-letter DOWGNUT reveal */}
          <div className="mt-4 flex overflow-hidden">
            {LETTERS.map((letter, i) => (
              <motion.span
                key={i}
                initial={{ y: 40, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{
                  delay: 0.4 + i * 0.08,
                  type: "spring",
                  stiffness: 200,
                  damping: 12,
                }}
                className="graffiti-text text-4xl text-white sm:text-5xl"
                style={{ textShadow: "0 0 20px rgba(232,248,102,0.5)" }}
              >
                {letter}
              </motion.span>
            ))}
          </div>

          {/* Tagline */}
          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 1.2, duration: 0.5 }}
            className="mt-2 text-xs font-medium tracking-[0.3em] text-[var(--color-dowgnut-lime)]"
          >
            FRESH · BOLD · DELIVERED
          </motion.p>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
