"use client";

/**
 * DonutIcon — Polished Grit donut SVG icon.
 * Matches DowgNut brand: lime/rose/sapphire sprinkles, 2px charcoal borders, 0px corners.
 * Designed for bottom-nav center placement.
 */

interface DonutIconProps {
  size?: number;
  className?: string;
  spinning?: boolean;
}

export function DonutIcon({ size = 28, className = "", spinning = false }: DonutIconProps) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 48 48"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
      style={spinning ? { animation: "donut-spin-nav 6s linear infinite" } : undefined}
    >
      {/* Outer ring — 2px charcoal border */}
      <circle cx="24" cy="24" r="22" stroke="#1c1b1b" strokeWidth="2" fill="#d9fb5f" />
      {/* Donut body */}
      <circle cx="24" cy="24" r="19" stroke="#1c1b1b" strokeWidth="2" fill="#fcf9f8" />
      {/* Top glaze — rose */}
      <path
        d="M 24 5 Q 33 6 36 15 Q 38 22 34 26 Q 28 28 24 27 Q 20 28 14 26 Q 10 22 12 15 Q 15 6 24 5 Z"
        fill="#fe5da2"
        stroke="#1c1b1b"
        strokeWidth="1.5"
      />
      {/* Sprinkles on glaze */}
      <rect x="19" y="10" width="5" height="2" rx="0" fill="#1e5bb8" stroke="#1c1b1b" strokeWidth="0.5" transform="rotate(20 21.5 11)" />
      <rect x="27" y="9" width="5" height="2" rx="0" fill="#536600" stroke="#1c1b1b" strokeWidth="0.5" transform="rotate(-15 29.5 10)" />
      <rect x="22" y="16" width="5" height="2" rx="0" fill="#d9fb5f" stroke="#1c1b1b" strokeWidth="0.5" transform="rotate(40 24.5 17)" />
      <rect x="14" y="14" width="5" height="2" rx="0" fill="#1e5bb8" stroke="#1c1b1b" strokeWidth="0.5" transform="rotate(60 16.5 15)" />
      <rect x="30" y="16" width="5" height="2" rx="0" fill="#fe5da2" stroke="#1c1b1b" strokeWidth="0.5" transform="rotate(-35 32.5 17)" />
      {/* Center hole */}
      <circle cx="24" cy="24" r="7.5" stroke="#1c1b1b" strokeWidth="2.5" fill="#1c1b1b" />
      {/* Inner ring accent — lime */}
      <circle cx="24" cy="24" r="6" stroke="#d9fb5f" strokeWidth="1" fill="none" />
      {/* Bottom half — sapphire glaze */}
      <path
        d="M 5 24 Q 8 36 24 43 Q 40 36 43 24 L 40 24 Q 38 34 24 40 Q 10 34 8 24 Z"
        fill="#1e5bb8"
        stroke="#1c1b1b"
        strokeWidth="1.5"
      />
      {/* Bottom sprinkles */}
      <rect x="16" y="34" width="5" height="2" rx="0" fill="#d9fb5f" stroke="#1c1b1b" strokeWidth="0.5" transform="rotate(25 18.5 35)" />
      <rect x="24" y="36" width="5" height="2" rx="0" fill="#fe5da2" stroke="#1c1b1b" strokeWidth="0.5" transform="rotate(-20 26.5 37)" />
      <rect x="31" y="33" width="5" height="2" rx="0" fill="#536600" stroke="#1c1b1b" strokeWidth="0.5" transform="rotate(45 33.5 34)" />
    </svg>
  );
}
