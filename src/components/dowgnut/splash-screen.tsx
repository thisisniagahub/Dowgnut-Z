"use client";

import { useEffect, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { useShop } from "@/store/use-shop";

/**
 * SplashScreen — Polished Grit edition.
 *
 * Neo-Brutalism splash: 2px charcoal borders, hard shadows,
 * sharp corners, lime/rose/sapphire accent flashes.
 * CSS-animated donut (no Three.js — instant load, no WebGL needed).
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
        Array.from({ length: 24 }).map((_, i) => ({
          x: (Math.random() - 0.5) * 360,
          y: (Math.random() - 0.5) * 500,
          size: 5 + Math.random() * 8,
          color: ["#d9fb5f", "#fe5da2", "#1e5bb8", "#536600"][i % 4],
          delay: Math.random() * 0.4,
          duration: 2 + Math.random() * 2.5,
        }))
      );
      setMounted(true);
    });
    return () => cancelAnimationFrame(rafId);
  }, []);

  useEffect(() => {
    if (splashDone) return;
    const t1 = setTimeout(() => setVisible(false), 2800);
    const t2 = setTimeout(() => dismissSplash(), 3400);
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
          className="fixed inset-0 z-[100] flex cursor-pointer flex-col items-center justify-center overflow-hidden"
          style={{
            background: "#1c1b1b",
            backgroundImage:
              "radial-gradient(circle at 1px 1px, rgba(252,249,248,0.04) 1px, transparent 0)",
            backgroundSize: "4px 4px",
          }}
          role="dialog"
          aria-label="DowgNut splash screen"
        >
          {/* ── Layer 1: Hard-edged lime glow box (not soft blur) ── */}
          <motion.div
            initial={{ scale: 0, opacity: 0 }}
            animate={{ scale: [0, 1.3, 1], opacity: [0, 0.8, 0.4] }}
            transition={{ duration: 1.5, ease: "easeOut" }}
            className="pointer-events-none absolute"
            style={{
              width: 400,
              height: 400,
              background: "#536600",
              border: "2px solid #d9fb5f",
              boxShadow: "8px 8px 0px 0px #d9fb5f",
            }}
          />

          {/* ── Layer 2: CSS Donut — spun with framer-motion ── */}
          <motion.div
            initial={{ opacity: 0, scale: 0.3, rotate: -180 }}
            animate={{ opacity: 1, scale: 1, rotate: 0 }}
            transition={{ duration: 1.2, ease: "easeOut" }}
            className="absolute z-10"
          >
            {/* Donut SVG — Polished Grit style */}
            <motion.div
              animate={{ rotate: 360 }}
              transition={{ duration: 8, repeat: Infinity, ease: "linear" }}
            >
              <svg
                width="240"
                height="240"
                viewBox="0 0 240 240"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
              >
                {/* Donut outer ring — charcoal border */}
                <circle
                  cx="120"
                  cy="120"
                  r="105"
                  stroke="#1c1b1b"
                  strokeWidth="2"
                  fill="#d9fb5f"
                />
                {/* Donut body — lime fill with rose accent */}
                <circle
                  cx="120"
                  cy="120"
                  r="95"
                  stroke="#1c1b1b"
                  strokeWidth="2"
                  fill="#fcf9f8"
                />
                {/* Glaze drip — rose */}
                <path
                  d="M 120 25 Q 145 30 150 55 Q 155 70 145 80 Q 130 85 120 80 Q 110 85 95 80 Q 85 70 90 55 Q 95 30 120 25 Z"
                  fill="#fe5da2"
                  stroke="#1c1b1b"
                  strokeWidth="2"
                />
                {/* Sprinkles — sapphire + rose + lime */}
                <rect x="100" y="40" width="8" height="3" rx="0" fill="#1e5bb8" stroke="#1c1b1b" strokeWidth="1" transform="rotate(25 104 42)" />
                <rect x="130" y="38" width="8" height="3" rx="0" fill="#536600" stroke="#1c1b1b" strokeWidth="1" transform="rotate(-15 134 40)" />
                <rect x="115" y="55" width="8" height="3" rx="0" fill="#fe5da2" stroke="#1c1b1b" strokeWidth="1" transform="rotate(45 119 57)" />
                <rect x="85" y="50" width="8" height="3" rx="0" fill="#1e5bb8" stroke="#1c1b1b" strokeWidth="1" transform="rotate(70 89 52)" />
                <rect x="145" y="55" width="8" height="3" rx="0" fill="#d9fb5f" stroke="#1c1b1b" strokeWidth="1" transform="rotate(-30 149 57)" />
                {/* Center hole — charcoal border, dark fill */}
                <circle
                  cx="120"
                  cy="120"
                  r="32"
                  stroke="#1c1b1b"
                  strokeWidth="3"
                  fill="#1c1b1b"
                />
                {/* Center hole inner ring — lime accent */}
                <circle
                  cx="120"
                  cy="120"
                  r="28"
                  stroke="#d9fb5f"
                  strokeWidth="1"
                  fill="none"
                />
                {/* Bottom half — sapphire accent glaze */}
                <path
                  d="M 35 120 Q 50 170 120 195 Q 190 170 205 120 L 195 120 Q 185 160 120 185 Q 55 160 45 120 Z"
                  fill="#1e5bb8"
                  stroke="#1c1b1b"
                  strokeWidth="2"
                />
                {/* More sprinkles on bottom */}
                <rect x="80" y="150" width="8" height="3" rx="0" fill="#d9fb5f" stroke="#1c1b1b" strokeWidth="1" transform="rotate(30 84 152)" />
                <rect x="110" y="165" width="8" height="3" rx="0" fill="#fe5da2" stroke="#1c1b1b" strokeWidth="1" transform="rotate(-20 114 167)" />
                <rect x="140" y="155" width="8" height="3" rx="0" fill="#536600" stroke="#1c1b1b" strokeWidth="1" transform="rotate(50 144 157)" />
                <rect x="160" y="140" width="8" height="3" rx="0" fill="#1e5bb8" stroke="#1c1b1b" strokeWidth="1" transform="rotate(-45 164 142)" />
              </svg>
            </motion.div>
          </motion.div>

          {/* ── Layer 3: Sprinkle particles (sharp squares, not circles) ── */}
          {mounted && sprinkles.map((s, i) => (
            <motion.div
              key={i}
              initial={{ x: 0, y: 0, scale: 0, opacity: 0 }}
              animate={{
                x: s.x,
                y: s.y,
                scale: 1,
                opacity: [0, 1, 0.7, 0],
              }}
              transition={{
                delay: s.delay,
                duration: s.duration,
                repeat: Infinity,
                repeatDelay: 0.8,
              }}
              className="pointer-events-none absolute"
              style={{
                width: s.size,
                height: s.size,
                background: s.color,
                border: "1.5px solid #1c1b1b",
              }}
            />
          ))}

          {/* ── Layer 4: Wordmark in hard-bordered box ── */}
          <motion.div
            initial={{ scale: 0.5, opacity: 0, y: 30 }}
            animate={{ scale: 1, opacity: 1, y: 0 }}
            transition={{ type: "spring", stiffness: 200, damping: 15, delay: 0.4 }}
            className="relative z-20 mt-48"
          >
            <div
              style={{
                border: "2px solid #fcf9f8",
                boxShadow: "6px 6px 0px 0px #d9fb5f",
                padding: "12px 32px",
                background: "#1c1b1b",
              }}
            >
              <h1
                style={{
                  fontFamily: "var(--font-display), system-ui, sans-serif",
                  fontWeight: 900,
                  fontSize: "2.5rem",
                  letterSpacing: "-0.04em",
                  textTransform: "uppercase",
                  color: "#fcf9f8",
                  lineHeight: 1,
                }}
              >
                DOWG<span style={{ color: "#d9fb5f" }}>NUT</span>
              </h1>
            </div>
          </motion.div>

          {/* ── Layer 5: Tagline in JetBrains Mono ── */}
          <motion.p
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.9, duration: 0.4 }}
            className="relative z-20 mt-6"
            style={{
              fontFamily: "var(--font-mono), monospace",
              fontSize: "0.7rem",
              fontWeight: 600,
              letterSpacing: "0.3em",
              textTransform: "uppercase",
              color: "#d9fb5f",
            }}
          >
            FRESH · BOLD · DELIVERED
          </motion.p>

          {/* ── Layer 6: Skip hint ── */}
          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 0.6 }}
            transition={{ delay: 1.8, duration: 0.4 }}
            className="absolute bottom-8 z-20"
            style={{
              fontFamily: "var(--font-mono), monospace",
              fontSize: "0.65rem",
              letterSpacing: "0.15em",
              textTransform: "uppercase",
              color: "#75796450",
            }}
          >
            TAP ANYWHERE TO SKIP
          </motion.p>

          {/* ── Layer 7: Corner accents (Polished Grit brackets) ── */}
          {/* Top-left */}
          <motion.div
            initial={{ opacity: 0, scale: 0 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.2, duration: 0.3 }}
            className="absolute left-6 top-6"
            style={{ width: 24, height: 24, borderTop: "2px solid #d9fb5f", borderLeft: "2px solid #d9fb5f" }}
          />
          {/* Top-right */}
          <motion.div
            initial={{ opacity: 0, scale: 0 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.3, duration: 0.3 }}
            className="absolute right-6 top-6 z-20"
            style={{ width: 24, height: 24, borderTop: "2px solid #fe5da2", borderRight: "2px solid #fe5da2" }}
          />
          {/* Bottom-left */}
          <motion.div
            initial={{ opacity: 0, scale: 0 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.4, duration: 0.3 }}
            className="absolute left-6 bottom-6 z-20"
            style={{ width: 24, height: 24, borderBottom: "2px solid #1e5bb8", borderLeft: "2px solid #1e5bb8" }}
          />
          {/* Bottom-right */}
          <motion.div
            initial={{ opacity: 0, scale: 0 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.5, duration: 0.3 }}
            className="absolute right-6 bottom-6 z-20"
            style={{ width: 24, height: 24, borderBottom: "2px solid #d9fb5f", borderRight: "2px solid #d9fb5f" }}
          />
        </motion.div>
      )}
    </AnimatePresence>
  );
}
