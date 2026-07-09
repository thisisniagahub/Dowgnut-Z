"use client";

import { useRef, useEffect, useCallback, useState } from "react";
import { cn } from "@/lib/utils";

/**
 * SpinningDonut — 3D torus on canvas, ported from Andy Sloane's donut.c
 *
 * Performance: Uses ImageData pixel buffer (1 putImageData per frame)
 * instead of hundreds of fillRect calls. ~10x faster rendering.
 *
 * @see https://www.a1k0n.net/2011/07/20/donut-math.html
 */

const TAU = Math.PI * 2;

interface SpinningDonutProps {
  size?: number;
  speed?: number;
  mode?: "canvas" | "ascii";
  asciiRows?: number;
  asciiCols?: number;
  className?: string;
  playing?: boolean;
  interactive?: boolean;
  variant?: "dark-bg" | "light-bg";
}

// ─── Brand Colors (pre-computed RGB stops) ──────────────────────────

// dark-bg: vivid pink→lime on dark backgrounds
const DARK_BG_STOPS = [
  [120, 40, 80],   // L=0.0 — deep warm
  [220, 60, 130],  // L=0.25
  [255, 80, 155],  // L=0.5 — hot pink
  [250, 170, 140], // L=0.75 — peachy
  [232, 248, 102], // L=1.0 — lime
] as const;

// light-bg: dark blue→pink→lime on light backgrounds
const LIGHT_BG_STOPS = [
  [7, 51, 79],     // L=0.0 — dark blue
  [120, 55, 110],  // L=0.25
  [240, 90, 155],  // L=0.5 — pink
  [240, 180, 130], // L=0.75
  [232, 248, 102], // L=1.0 — lime
] as const;

function lerpColor(stops: readonly (readonly [number, number, number])[], t: number): [number, number, number] {
  const idx = t * (stops.length - 1);
  const lo = Math.floor(idx);
  const hi = Math.min(lo + 1, stops.length - 1);
  const f = idx - lo;
  return [
    stops[lo][0] + f * (stops[hi][0] - stops[lo][0]),
    stops[lo][1] + f * (stops[hi][1] - stops[lo][1]),
    stops[lo][2] + f * (stops[hi][2] - stops[lo][2]),
  ];
}

// ─── Canvas Renderer (ImageData buffer) ─────────────────────────────

function useCanvasDonut(
  canvasRef: React.RefObject<HTMLCanvasElement | null>,
  playing: boolean,
  speed: number,
  interactive: boolean,
  variant: "dark-bg" | "light-bg",
) {
  const angleRef = useRef({ A: 1, B: 1 });
  const mouseRef = useRef({ dx: 0, dy: 0, active: false });
  const rafRef = useRef<number>(0);

  // Interactive cursor tracking
  useEffect(() => {
    if (!interactive) return;
    const canvas = canvasRef.current;
    if (!canvas) return;

    const onMove = (cx: number, cy: number) => {
      const r = canvas.getBoundingClientRect();
      mouseRef.current = {
        dx: (cx - r.left) / r.width - 0.5,
        dy: (cy - r.top) / r.height - 0.5,
        active: true,
      };
    };

    const onMouse = (e: MouseEvent) => onMove(e.clientX, e.clientY);
    const onTouch = (e: TouchEvent) => {
      if (e.touches[0]) onMove(e.touches[0].clientX, e.touches[0].clientY);
    };
    const onLeave = () => { mouseRef.current.active = false; };

    canvas.addEventListener("mousemove", onMouse);
    canvas.addEventListener("touchmove", onTouch, { passive: true });
    canvas.addEventListener("mouseleave", onLeave);
    canvas.addEventListener("touchend", onLeave);
    return () => {
      canvas.removeEventListener("mousemove", onMouse);
      canvas.removeEventListener("touchmove", onTouch);
      canvas.removeEventListener("mouseleave", onLeave);
      canvas.removeEventListener("touchend", onLeave);
    };
  }, [interactive, canvasRef]);

  useEffect(() => {
    if (!playing) {
      cancelAnimationFrame(rafRef.current);
      return;
    }

    const canvas = canvasRef.current;
    if (!canvas) return;
    const activeCtx = canvas.getContext("2d");
    if (!activeCtx) return;

    const w = canvas.width;
    const h = canvas.height;
    const imgData = activeCtx.getImageData(0, 0, w, h);
    const px = imgData.data;
    const stops = variant === "dark-bg" ? DARK_BG_STOPS : LIGHT_BG_STOPS;

    activeCtx.fillStyle = "#000";
    activeCtx.fillRect(0, 0, w, h);

    function tick() {
      // Fade existing pixels (trail effect) — operate directly on buffer
      for (let p = 0; p < px.length; p += 4) {
        px[p]     = (px[p] * 0.85) | 0;     // R
        px[p + 1] = (px[p + 1] * 0.85) | 0; // G
        px[p + 2] = (px[p + 2] * 0.85) | 0; // B
      }

      // Rotation update
      const { dx, dy, active } = mouseRef.current;
      if (active && interactive) {
        angleRef.current.A += (0.12 + Math.abs(dy) * 0.6) * speed;
        angleRef.current.B += (0.06 + Math.abs(dx) * 0.6) * speed * Math.sign(dx || 1);
      } else {
        angleRef.current.A += 0.12 * speed;
        angleRef.current.B += 0.06 * speed;
      }

      const { A, B } = angleRef.current;
      const R1 = 1, R2 = 2, K2 = 5;
      const K1 = (w / 2) * K2 * 3 / (8 * (R1 + R2));
      const cx = w / 2, cy = h / 2;

      const cA = Math.cos(A), sA = Math.sin(A);
      const cB = Math.cos(B), sB = Math.sin(B);

      // Z-buffer for proper occlusion
      const zBuf = new Float32Array(w * h);

      const stepJ = 0.15;
      const stepI = 0.04;

      for (let j = 0; j < TAU; j += stepJ) {
        const ct = Math.cos(j), st = Math.sin(j);
        for (let i = 0; i < TAU; i += stepI) {
          const sp = Math.sin(i), cp = Math.cos(i);
          const ox = R2 + R1 * ct;
          const oy = R1 * st;

          const x = ox * (cB * cp + sA * sB * sp) - oy * cA * sB;
          const y = ox * (sB * cp - sA * cB * sp) + oy * cA * cB;
          const ooz = 1 / (K2 + cA * ox * sp + sA * oy);
          const xp = (cx + K1 * ooz * x) | 0;
          const yp = (cy - K1 * ooz * y) | 0;

          if (xp < 0 || xp >= w || yp < 0 || yp >= h) continue;

          const idx = yp * w + xp;
          if (ooz <= zBuf[idx]) continue;
          zBuf[idx] = ooz;

          const L = cp * ct * sB - cA * ct * sp - sA * st + cB * (cA * st - ct * sA * sp);
          if (L <= 0) continue;

          const clamped = Math.min(L, 1);
          const [r, g, b] = lerpColor(stops, clamped);
          const pi = idx * 4;
          px[pi] = r | 0;
          px[pi + 1] = g | 0;
          px[pi + 2] = b | 0;
          px[pi + 3] = 255;
        }
      }

      activeCtx!.putImageData(imgData, 0, 0);
      rafRef.current = requestAnimationFrame(tick);
    }

    rafRef.current = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(rafRef.current);
  }, [playing, speed, interactive, variant, canvasRef]);
}

// ─── ASCII Renderer ─────────────────────────────────────────────────

function useAsciiDonut(playing: boolean, speed: number, cols: number, rows: number) {
  const angleRef = useRef({ A: 1, B: 1 });
  const rafRef = useRef<number>(0);
  const [frame, setFrame] = useState("");
  const CHARS = ".,-~:;=!*#$@";

  useEffect(() => {
    if (!playing) {
      cancelAnimationFrame(rafRef.current);
      return;
    }

    function tick() {
      const total = cols * rows;
      const b: string[] = new Array(total);
      const z = new Float32Array(total);

      for (let k = 0; k < total; k++) {
        b[k] = k % cols === cols - 1 ? "\n" : " ";
      }

      angleRef.current.A += 0.12 * speed;
      angleRef.current.B += 0.06 * speed;
      const { A, B } = angleRef.current;

      const cA = Math.cos(A), sA = Math.sin(A);
      const cB = Math.cos(B), sB = Math.sin(B);
      const hc = cols / 2, hr = rows / 2;
      const sx = hc * 0.75, sy = hr * 0.7;

      for (let j = 0; j < TAU; j += 0.07) {
        const ct = Math.cos(j), st = Math.sin(j);
        for (let i = 0; i < TAU; i += 0.02) {
          const sp = Math.sin(i), cp = Math.cos(i);
          const h = ct + 2;
          const D = 1 / (sp * h * sA + st * cA + 5);
          const t = sp * h * cA - st * sA;
          const x = (hc + sx * D * (cp * h * cB - t * sB)) | 0;
          const y = (hr + sy * D * (cp * h * sB + t * cB)) | 0;
          const o = x + cols * y;
          const N = (8 * ((st * sA - sp * ct * cA) * cB - sp * ct * sA - st * cA - cp * ct * sB)) | 0;

          if (y < rows && y >= 0 && x >= 0 && x < cols - 1 && D > z[o]) {
            z[o] = D;
            b[o] = CHARS[N > 0 ? N : 0];
          }
        }
      }

      setFrame(b.join(""));
      rafRef.current = requestAnimationFrame(tick);
    }

    rafRef.current = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(rafRef.current);
  }, [playing, speed, cols, rows]);

  return frame;
}

// ─── Component ──────────────────────────────────────────────────────

export function SpinningDonut({
  size = 300,
  speed = 1,
  mode = "canvas",
  asciiCols = 80,
  asciiRows = 22,
  className,
  playing = true,
  interactive = false,
  variant = "light-bg",
}: SpinningDonutProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useCanvasDonut(canvasRef, mode === "canvas" && playing, speed, interactive, variant);
  const asciiFrame = useAsciiDonut(mode === "ascii" && playing, speed, asciiCols, asciiRows);

  if (mode === "ascii") {
    return (
      <pre
        className={cn(
          "overflow-hidden rounded-2xl bg-black p-4 font-mono text-[8px] leading-[10px] text-[var(--color-dowgnut-pink)] sm:text-[10px] sm:leading-[12px]",
          className,
        )}
        aria-label="Spinning ASCII donut animation"
      >
        {asciiFrame}
      </pre>
    );
  }

  return (
    <canvas
      ref={canvasRef}
      width={size}
      height={size}
      className={cn("rounded-2xl bg-black", className)}
      aria-label="Spinning 3D donut animation"
    />
  );
}
