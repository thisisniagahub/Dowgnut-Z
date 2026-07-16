"use client";

import * as React from "react";
import { cn } from "../lib/utils";

export interface CardProps extends React.HTMLAttributes<HTMLDivElement> {
  variant?: "default" | "outlined" | "elevated" | "ghost";
  interactive?: boolean;
}

const cardVariants = {
  default: "bg-[var(--color-dowgnut-cream)] border-2 border-[var(--color-dowgnut-blue-dark)]/10",
  outlined: "bg-white border-2 border-[var(--color-dowgnut-blue-dark)]/20",
  elevated: "bg-white shadow-[0_8px_32px_rgba(7,51,79,0.08)] border border-[var(--color-dowgnut-blue-dark)]/10",
  ghost: "bg-transparent border-none",
};

const Card = React.forwardRef<HTMLDivElement, CardProps>(
  ({ className, variant = "default", interactive, children, ...props }, ref) => {
    return (
      <div
        ref={ref}
        className={cn(
          "rounded-3xl transition-all duration-300",
          "backdrop-blur-sm",
          cardVariants[variant],
          interactive && "cursor-pointer hover:shadow-[0_12px_40px_rgba(7,51,79,0.12)] hover:-translate-y-1 transition-all duration-300",
          "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--color-dowgnut-pink)] focus-visible:ring-offset-2 focus-visible:ring-offset-[var(--color-dowgnut-cream)]"
        )}
        {...props}
      >
        {children}
      </div>
    );
  }
);

Card.displayName = "Card";

export { Card };