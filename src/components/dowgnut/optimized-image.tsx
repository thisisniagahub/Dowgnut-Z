"use client";

import Image from "next/image";
import type { ComponentProps } from "react";

/**
 * OptimizedImage — thin wrapper around next/image with sensible defaults.
 *
 * Features:
 * - Propagates width/height/priority to next/image
 * - Supports `blurDataURL` → `placeholder="blur"` automatically
 * - `fill` mode for fluid containers (sets `className` on the wrapper)
 * - Falls back to a width/height when `fill` is not used
 *
 * Usage:
 *   <OptimizedImage src="/img.png" alt="x" width={144} height={144} />
 *   <OptimizedImage src={url} alt="x" fill priority sizes="100px" />
 *   <OptimizedImage src={url} alt="x" width={200} height={200} blurDataURL={tiny} />
 */

export interface OptimizedImageProps
  extends Omit<ComponentProps<typeof Image>, "placeholder"> {
  /** When provided, enables blur placeholder automatically */
  blurDataURL?: string;
}

export function OptimizedImage({
  blurDataURL,
  ...props
}: OptimizedImageProps) {
  // When fill mode and no explicit sizes are given, give a sensible fallback
  // so we don't hit the "no `sizes` on `fill`" warning.
  const fill = props.fill;
  const sizes = props.sizes ?? (fill ? "(max-width: 768px) 100vw, 400px" : undefined);

  return (
    <Image
      {...props}
      sizes={sizes as string | undefined}
      // Only apply the blur placeholder when a blurDataURL is supplied
      placeholder={blurDataURL ? "blur" : "empty"}
      blurDataURL={blurDataURL}
      // Default to lazy unless explicitly marked priority
      priority={props.priority ?? false}
      // Let callers customise the loading strategy; default is lazy
      loading={props.loading ?? "lazy"}
    />
  );
}

export default OptimizedImage;
