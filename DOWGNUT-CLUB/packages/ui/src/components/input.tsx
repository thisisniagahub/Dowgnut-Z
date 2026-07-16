"use client";

import * as React from "react";
import { cn } from "../lib/utils";

export interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  hint?: string;
}

const Input = React.forwardRef<HTMLInputElement, InputProps>(
  ({ className, label, error, hint, id, ...props }, ref) => {
    const inputId = id || `input-${Math.random().toString(36).slice(2, 9)}`;
    const errorId = `${inputId}-error`;
    const hintId = `${inputId}-hint`;

    return (
      <div className="w-full">
        {label && (
          <label htmlFor={inputId} className="mb-1.5 block text-sm font-medium text-[var(--color-dowgnut-blue-dark)]">
            {label}
          </label>
        )}
        <input
          ref={ref}
          id={inputId}
          aria-invalid={error ? "true" : "false"}
          aria-describedby={`${error ? errorId : ""} ${hint ? hintId : ""}`.trim() || undefined}
          className={cn(
            "w-full h-11 rounded-xl bg-white/80 border-2 transition-all duration-200",
            "text-[var(--color-dowgnut-blue-dark)] placeholder:text-[var(--color-dowgnut-blue-dark)]/40",
            "focus:outline-none focus:ring-2 focus:ring-[var(--color-dowgnut-pink)] focus:border-transparent",
            "disabled:cursor-not-allowed disabled:opacity-50 disabled:bg-[var(--color-dowgnut-cream)]",
            error
              ? "border-[var(--color-dowgnut-pink)] focus:ring-[var(--color-dowgnut-pink)]"
              : "border-[var(--color-dowgnut-blue-dark)]/20 hover:border-[var(--color-dowgnut-blue-dark)]/40",
            "px-4 py-2.5 text-sm font-medium",
            "backdrop-blur-sm"
          )}
          {...props}
        />
        {error && (
          <p id={errorId} className="mt-1.5 text-xs text-[var(--color-dowgnut-pink)]" role="alert">
            {error}
          </p>
        )}
        {hint && !error && (
          <p id={hintId} className="mt-1.5 text-xs text-[var(--color-dowgnut-blue-dark)]/50">
            {hint}
          </p>
        )}
      </div>
    );
  }
);

Input.displayName = "Input";

export { Input };