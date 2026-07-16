"use client";

import { cn } from "@/lib/utils";

interface DonutCardSkeletonProps {
  className?: string;
}

export function DonutCardSkeleton({ className }: DonutCardSkeletonProps) {
  return (
    <div
      className={cn(
        "group relative flex cursor-pointer flex-col rounded-2xl border border-[var(--color-dowgnut-blue-dark)]/8 bg-[var(--color-dowgnut-cream)]/70 backdrop-blur-sm p-2 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--color-dowgnut-pink)] focus-visible:ring-offset-2",
        className
      )}
    >
      <div className="relative flex aspect-square items-center justify-center p-2">
        {/* Radial glow skeleton */}
        <div className="absolute inset-0 rounded-2xl bg-[radial-gradient(circle_at_center,var(--color-dowgnut-pink)/12_0%,transparent_70%)] animate-pulse" />
        {/* Image placeholder */}
        <div className="relative size-full animate-pulse bg-[var(--color-dowgnut-blue-dark)]/5 rounded-2xl" />
      </div>

      <div className="flex flex-1 flex-col gap-1 px-1 pb-1">
        {/* Title skeleton */}
        <div className="line-clamp-2 min-h-[2.5rem] animate-pulse bg-[var(--color-dowgnut-blue-dark)]/10 rounded" />
        {/* Rating skeleton */}
        <div className="flex items-center gap-1 animate-pulse">
          <div className="size-3 bg-[var(--color-dowgnut-pink)]/10 rounded" />
          <div className="size-10 bg-[var(--color-dowgnut-blue-dark)]/5 rounded" />
          <div className="size-10 bg-[var(--color-dowgnut-blue-dark)]/5 rounded" />
        </div>
        {/* Price skeleton */}
        <div className="mt-1 animate-pulse">
          <div className="h-8 w-full animate-pulse bg-[var(--color-dowgnut-pink)]/10 rounded-full" />
        </div>
      </div>
    </div>
  );
}