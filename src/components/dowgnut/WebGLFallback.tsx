"use client";

import { cn } from "@/lib/utils";

/**
 * WebGLFallback — A simple 2D CSS donut component rendered when WebGL
 * is not available. Displays a stylized CSS donut with type-appropriate
 * colors so users get a visual even without 3D support.
 */
interface WebGLFallbackProps {
  donutType?: string;
  className?: string;
  size?: number;
}

// Color palettes per donut type
const TYPE_PALETTES: Record<string, { dough: string; glaze: string; accent: string }> = {
  classic: { dough: "#C49A6C", glaze: "#8B4513", accent: "#A0522D" },
  sprinkled: { dough: "#D4A574", glaze: "#F0A55A", accent: "#FFB347" },
  stuffed: { dough: "#E8B47A", glaze: "#F5D0A0", accent: "#FFC0CB" },
  specialty: { dough: "#DCC48E", glaze: "#E8C89A", accent: "#FFD700" },
};

export function WebGLFallback({ donutType = "classic", className, size = 200 }: WebGLFallbackProps) {
  const palette = TYPE_PALETTES[donutType] || TYPE_PALETTES.classic;

  return (
    <div
      className={cn("flex items-center justify-center", className)}
      style={{ width: size, height: size }}
      role="img"
      aria-label={`${donutType} donut (2D fallback — WebGL not available)`}
    >
      <svg
        width="100%"
        height="100%"
        viewBox="0 0 200 200"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
      >
        {/* Drop shadow */}
        <ellipse cx="100" cy="175" rx="70" ry="8" fill="#07334F" opacity="0.12" />
        {/* Dough body */}
        <circle cx="100" cy="100" r="80" fill={palette.dough} />
        {/* Glaze ring (annulus via even-odd fill rule) */}
        <path
          d="M100 22 A78 78 0 1 1 99.99 22 Z M100 58 A42 42 0 1 0 100.01 58 Z"
          fill={palette.glaze}
          fillRule="evenodd"
        />
        {/* Glaze highlight arc */}
        <path
          d="M55 55 Q70 35 100 30 Q130 35 145 55"
          stroke={palette.accent}
          strokeWidth="4"
          strokeLinecap="round"
          opacity="0.6"
          fill="none"
        />
        {/* Glossy shine */}
        <ellipse
          cx="75"
          cy="60"
          rx="25"
          ry="12"
          fill="#FFFFFF"
          opacity="0.2"
          transform="rotate(-30 75 60)"
        />
        {/* Rainbow sprinkles for sprinkled/specialty types */}
        {(donutType === "sprinkled" || donutType === "specialty") && (
          <>
            <rect x="60" y="45" width="8" height="3" rx="1.5" fill="#FF6B6B" transform="rotate(25 64 46)" />
            <rect x="130" y="50" width="8" height="3" rx="1.5" fill="#4ECDC4" transform="rotate(-15 134 51)" />
            <rect x="45" y="80" width="8" height="3" rx="1.5" fill="#FFE66D" transform="rotate(60 49 81)" />
            <rect x="150" y="85" width="8" height="3" rx="1.5" fill="#A8E6CF" transform="rotate(-45 154 86)" />
            <rect x="55" y="130" width="8" height="3" rx="1.5" fill="#FF8B8B" transform="rotate(10 59 131)" />
            <rect x="135" y="135" width="8" height="3" rx="1.5" fill="#B8B8FF" transform="rotate(-30 139 136)" />
            <rect x="70" y="40" width="8" height="3" rx="1.5" fill="#FFD3B6" transform="rotate(40 74 41)" />
            <rect x="120" y="145" width="8" height="3" rx="1.5" fill="#C7CEEA" transform="rotate(-50 124 146)" />
          </>
        )}
        {/* Stuffed cream visible at center opening */}
        {donutType === "stuffed" && (
          <circle cx="100" cy="100" r="28" fill="#FFF8DC" opacity="0.8" />
        )}
      </svg>
    </div>
  );
}
