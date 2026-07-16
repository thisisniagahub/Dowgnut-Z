"use client";

import { motion } from "framer-motion";
import { cn } from "@/lib/utils";
import { DonutCardSkeleton } from "./donut-card-skeleton";

interface ShopHomeSkeletonProps {
  className?: string;
}

export function ShopHomeSkeleton({ className }: ShopHomeSkeletonProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
      className={cn("relative flex flex-1 flex-col items-center px-4 pt-4 sm:px-6 overflow-hidden", className)}
    >
      {/* Parallax background placeholders */}
      <motion.div
        className="absolute left-[-60px] top-[15%] size-36 opacity-10 blur-[1px] pointer-events-none md:left-[-20px] select-none"
        animate={{ y: [-100, 100], rotate: [0, 90] }}
        transition={{ duration: 8, repeat: Infinity, ease: "linear" }}
      >
        <div className="size-full rounded-full bg-[var(--color-dowgnut-pink)]/20 animate-pulse" />
      </motion.div>

      <motion.div
        className="absolute right-[-65px] top-[45%] size-40 opacity-10 blur-[2px] pointer-events-none md:right-[-30px] select-none"
        animate={{ y: [0, -180], rotate: [0, 90] }}
        transition={{ duration: 10, repeat: Infinity, ease: "linear" }}
      >
        <div className="size-full rounded-full bg-[var(--color-dowgnut-blue)]/20 animate-pulse" />
      </motion.div>

      {/* Floating sprinkle particles skeleton */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        {Array.from({ length: 12 }).map((_, i) => (
          <motion.div
            key={i}
            initial={{ opacity: 0, scale: 0 }}
            animate={{ opacity: [0, 0.3, 0], scale: [0, 1, 0], x: [-50, 50], y: [-100, 100] }}
            transition={{
              duration: 4,
              repeat: Infinity,
              repeatDelay: 1,
              delay: i * 0.3,
            }}
            className="absolute rounded-full bg-[var(--color-dowgnut-pink)]/30"
            style={{
              width: 6 + (i % 3) * 4,
              height: 6 + (i % 3) * 4,
              top: `${15 + (i % 5) * 15}%`,
              left: `${10 + (i % 4) * 20}%`,
            }}
          />
        ))}
      </div>

      {/* Hero heading skeleton */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
        className="relative mb-6 text-center"
      >
        <div className="h-8 w-3/4 mx-auto animate-pulse bg-gradient-to-r from-[var(--color-dowgnut-pink)] via-[var(--color-dowgnut-blue)] to-[var(--color-dowgnut-lime)] bg-[200%_auto] bg-clip-text text-transparent rounded" />
        <div className="mt-1 h-3 w-1/2 mx-auto animate-pulse bg-[var(--color-dowgnut-blue-dark)]/10 rounded" />
      </motion.div>

      {/* 4 donut type cards skeleton */}
      <div className="relative flex w-full max-w-sm flex-1 flex-col justify-center gap-2">
        {Array.from({ length: 4 }).map((_, i) => (
          <motion.div
            key={i}
            initial={{ opacity: 0, x: -40, rotateY: -15 }}
            animate={{ opacity: 1, x: 0, rotateY: 0 }}
            viewport={{ once: true, amount: 0.3 }}
            transition={{ delay: 0.1 + i * 0.12, type: "spring", stiffness: 200, damping: 20 }}
            style={{ perspective: "1000px" }}
            className="group relative flex flex-1 items-center justify-center focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--color-dowgnut-pink)] rounded-2xl"
          >
            <DonutCardSkeleton size={200} />
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.3 }}
              className="absolute bottom-0 left-0 right-0 p-4 pointer-events-none"
            >
              <div className="h-4 w-2/3 animate-pulse bg-[var(--color-dowgnut-blue-dark)]/10 rounded" />
              <div className="mt-0.5 h-2 w-1/3 animate-pulse bg-[var(--color-dowgnut-blue-dark)]/5 rounded" />
            </motion.div>
            {/* Glaze shimmer overlay on hover */}
            <motion.div
              className="absolute inset-0 rounded-2xl bg-gradient-to-t from-[var(--color-dowgnut-pink)]/10 via-transparent to-transparent opacity-0 group-hover:opacity-100"
              initial={{ opacity: 0 }}
              animate={{ opacity: 0 }}
              transition={{ duration: 0.3 }}
              style={{ pointerEvents: "none" }}
            />
          </motion.div>
        ))}
      </div>

      {/* Badges row skeleton */}
      <motion.div
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true, amount: 0.5 }}
        variants={{
          hidden: {},
          visible: { transition: { staggerChildren: 0.08 } },
        }}
        className="relative mt-4 flex flex-wrap justify-center gap-2"
      >
        {Array.from({ length: 3 }).map((_, i) => (
          <motion.span
            key={i}
            variants={{
              hidden: { opacity: 0, y: 16, scale: 0.8 },
              visible: { opacity: 1, y: 0, scale: 1, transition: { type: "spring", stiffness: 260, damping: 20 } },
            }}
            className="inline-flex items-center gap-1 rounded-full bg-white/60 px-2 py-1 text-xs font-bold text-[var(--color-dowgnut-blue-dark)] backdrop-blur-sm"
          >
            <div className="h-4 w-4 animate-pulse bg-[var(--color-dowgnut-pink)]/20 rounded-full" />
            <div className="h-3 w-12 animate-pulse bg-[var(--color-dowgnut-blue-dark)]/10 rounded-full" />
          </motion.span>
        ))}
      </motion.div>

      {/* Scroll 3D Story skeleton */}
      <motion.div
        initial={{ opacity: 0 }}
        whileInView={{ opacity: 1 }}
        viewport={{ once: true, amount: 0.3 }}
        transition={{ delay: 0.6 }}
        className="relative mt-8 w-full max-w-2xl"
      >
        <div className="relative h-[500px] w-full rounded-2xl overflow-hidden bg-[var(--color-dowgnut-lime-bright)]/30">
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="text-center p-8">
              <div className="h-20 w-20 mx-auto animate-pulse bg-[var(--color-dowgnut-pink)]/20 rounded-full" />
              <div className="mt-4 h-3 w-3/4 mx-auto animate-pulse bg-[var(--color-dowgnut-blue-dark)]/10 rounded" />
              <div className="mt-2 h-2 w-1/2 mx-auto animate-pulse bg-[var(--color-dowgnut-blue-dark)]/10 rounded" />
            </div>
          </div>
        </div>
      </motion.div>
    </motion.div>
  );
}