"use client";

import { useEffect, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { useShop } from "@/store/use-shop";
import { SpinningDonut } from "./spinning-donut";

/**
 * SplashScreen — cinematic brand moment.
 *
 * Layer order (bottom → top):
 * 1. Dark background (#07334f)
 * 2. Radial lime glow (ambient light)
 * 3. Spinning 3D donut (interactive — follows cursor/touch)
 * 4. Sprinkle particles
 * 5. Wordmark logo (bright white filter for contrast)
 * 6. Tagline
 * 7. "TAP TO SKIP" hint
 */

interface Sprinkle {
  x: number;
  y: number;
  size: number;
  color: string;
  delay: number;
  duration: number;
}

export function SplashScreen() {
  const splashDone = useShop((s) => s.splashDone);
  const dismissSplash = useShop((s) => s.dismissSplash);
  const [visible, setVisible] = useState(true);
  const [mounted, setMounted] = useState(false);
  const [sprinkles, setSprinkles] = useState<Sprinkle[]>([]);

  useEffect(() => {
    const rafId = requestAnimationFrame(() => {
      setSprinkles(
        Array.from({ length: 20 }).map((_, i) => ({
          x: (Math.random() - 0.5) * 300,
          y: (Math.random() - 0.5) * 400,
          size: 4 + Math.random() * 6,
          color: ["#f05a9b", "#07579b", "#e8f866", "#ff9ac7"][i % 4],
          delay: Math.random() * 0.5,
          duration: 2 + Math.random() * 2,
        }))
      );
      setMounted(true);
    });
    return () => cancelAnimationFrame(rafId);
  }, []);

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
          {/* ── Layer 1: Radial glow pulse ── */}
          <motion.div
            initial={{ scale: 0, opacity: 0 }}
            animate={{ scale: [0, 1.5, 1.2], opacity: [0, 0.3, 0.15] }}
            transition={{ duration: 2, ease: "easeOut" }}
            className="pointer-events-none absolute size-[500px] rounded-full"
            style={{
              background: "radial-gradient(circle, #e8f866 0%, transparent 60%)",
              filter: "blur(50px)",
            }}
          />

          {/* ── Layer 2: Interactive 3D Spinning Donut ── */}
          <motion.div
            initial={{ opacity: 0, scale: 0.3 }}
            animate={{ opacity: 0.85, scale: 1 }}
            transition={{ duration: 0.8, ease: "easeOut" }}
            className="absolute"
          >
            <SpinningDonut
              size={300}
              speed={2}
              interactive
              variant="dark-bg"
              playing={!splashDone}
              className="rounded-full"
            />
          </motion.div>

          {/* ── Layer 3: Sprinkle particles ── */}
          {mounted && sprinkles.map((s, i) => (
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

          {/* ── Layer 4: Wordmark logo (brightened for dark bg contrast) ── */}
          <motion.img
            src="/brand/dowgnut-logo-wordmark.png"
            alt="DowgNut"
            width={280}
            height={80}
            className="relative h-20 w-auto brightness-[2.5] contrast-125 drop-shadow-[0_0_20px_rgba(240,90,155,0.6)] sm:h-28"
            draggable={false}
            initial={{ scale: 0.5, opacity: 0, y: 20 }}
            animate={{ scale: 1, opacity: 1, y: 0 }}
            transition={{ type: "spring", stiffness: 200, damping: 15 }}
          />

          {/* ── Layer 5: Tagline ── */}
          <motion.p
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.8, duration: 0.5 }}
            className="relative mt-4 text-xs font-medium tracking-[0.3em] text-[var(--color-dowgnut-lime)]"
          >
            FRESH · BOLD · DELIVERED
          </motion.p>

          {/* ── Layer 6: Skip hint ── */}
          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 0.5 }}
            transition={{ delay: 1.5, duration: 0.5 }}
            className="absolute bottom-8 text-[10px] tracking-wider text-white/50"
          >
            TAP ANYWHERE TO SKIP
          </motion.p>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
