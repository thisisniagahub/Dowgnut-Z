"use client";

import confetti from "canvas-confetti";

/**
 * Celebration system — viral micro-interactions.
 * Uses canvas-confetti for particle bursts + DOM animation for donut-fly.
 */

// 🎉 Add to Cart — confetti burst from button + donut flies to cart icon
export function celebrateAddToCart(buttonEl?: HTMLElement | null, donutImgUrl?: string) {
  if (buttonEl) {
    const rect = buttonEl.getBoundingClientRect();
    const x = (rect.left + rect.width / 2) / window.innerWidth;
    const y = (rect.top + rect.height / 2) / window.innerHeight;

    confetti({
      particleCount: 30,
      spread: 50,
      origin: { x, y },
      colors: ["#f05a9b", "#07579b", "#e8f866", "#fff9e8"],
      scalar: 0.7,
      ticks: 80,
      gravity: 0.8,
      disableForReducedMotion: true,
    });
  }

  // Donut fly to cart icon
  if (donutImgUrl) {
    flyDonutToCart(donutImgUrl, buttonEl);
  }

  // Cart badge bounce
  bounceCartBadge();
}

// 💗 Favorite — heart pop with pink particles
export function celebrateFavorite(element?: HTMLElement | null) {
  if (!element) return;
  const rect = element.getBoundingClientRect();
  const x = (rect.left + rect.width / 2) / window.innerWidth;
  const y = (rect.top + rect.height / 2) / window.innerHeight;

  confetti({
    particleCount: 12,
    spread: 35,
    origin: { x, y },
    colors: ["#f05a9b", "#ff9ac7", "#fff9e8"],
    scalar: 0.5,
    ticks: 60,
    gravity: 0.5,
    shapes: ["circle"],
    disableForReducedMotion: true,
  });
}

// 🎊 Order complete — full screen celebration
export function celebrateOrderComplete() {
  const colors = ["#f05a9b", "#07579b", "#e8f866", "#fff9e8"];

  // Left burst
  confetti({
    particleCount: 80,
    angle: 60,
    spread: 70,
    origin: { x: 0, y: 0.8 },
    colors,
    disableForReducedMotion: true,
  });
  // Right burst
  confetti({
    particleCount: 80,
    angle: 120,
    spread: 70,
    origin: { x: 1, y: 0.8 },
    colors,
    disableForReducedMotion: true,
  });
  // Center rain
  setTimeout(() => {
    confetti({
      particleCount: 50,
      spread: 100,
      origin: { x: 0.5, y: 0.3 },
      colors,
      startVelocity: 25,
      gravity: 0.6,
      ticks: 150,
      disableForReducedMotion: true,
    });
  }, 200);
}

// 🏆 Swipe deck complete
export function celebrateSwipeComplete() {
  const colors = ["#f05a9b", "#07579b", "#e8f866"];
  confetti({
    particleCount: 100,
    spread: 160,
    origin: { x: 0.5, y: 0.4 },
    colors,
    startVelocity: 35,
    gravity: 0.5,
    ticks: 200,
    disableForReducedMotion: true,
  });
}

// Donut image flies to cart icon (DOM animation)
function flyDonutToCart(imgUrl: string, fromEl?: HTMLElement | null) {
  if (typeof document === "undefined") return;
  const cartIcon = document.querySelector('[aria-label="Open cart"]') as HTMLElement | null;
  if (!cartIcon || !fromEl) return;

  const fromRect = fromEl.getBoundingClientRect();
  const toRect = cartIcon.getBoundingClientRect();

  const startX = fromRect.left + fromRect.width / 2 - 30;
  const startY = fromRect.top + fromRect.height / 2 - 30;
  const endX = toRect.left + toRect.width / 2 - 15;
  const endY = toRect.top + toRect.height / 2 - 15;

  // Outer container controls horizontal ease-out (X-axis)
  const outer = document.createElement("div");
  outer.style.cssText = `
    position: fixed;
    left: 0;
    top: 0;
    z-index: 9999;
    pointer-events: none;
    transition: transform 0.8s cubic-bezier(0.25, 1, 0.5, 1);
    transform: translate3d(${startX}px, ${startY}px, 0);
  `;

  // Inner image controls vertical parabolic launch/fall (Y-axis) and 3D effects (scale/spin)
  const inner = document.createElement("img");
  inner.src = imgUrl;
  inner.style.cssText = `
    width: 60px;
    height: 60px;
    object-fit: contain;
    transition: transform 0.8s cubic-bezier(0.06, -0.6, 0.8, 0.4), opacity 0.8s ease;
    transform: translate3d(0, 0, 0) scale(1) rotate(0deg);
    opacity: 1;
  `;

  outer.appendChild(inner);
  document.body.appendChild(outer);

  // Trigger physics-based parabolic launch
  requestAnimationFrame(() => {
    outer.style.transform = `translate3d(${endX}px, ${startY}px, 0)`;
    const deltaY = endY - startY;
    inner.style.transform = `translate3d(0, ${deltaY}px, 0) scale(0.4) rotate(360deg)`;
    inner.style.opacity = "0.2";
  });

  setTimeout(() => outer.remove(), 850);
}

// Cart badge bounce
function bounceCartBadge() {
  const badge = document.querySelector('[aria-label="Open cart"] .absolute') as HTMLElement | null;
  if (!badge) return;
  badge.style.transition = "transform 0.3s cubic-bezier(0.34, 1.56, 0.64, 1)";
  badge.style.transform = "scale(1.6)";
  setTimeout(() => {
    badge.style.transform = "scale(1)";
  }, 300);
}
