"use client";

import { Component, ReactNode } from "react";

/**
 * Error boundary — catches render crashes, shows fallback UI.
 */
export class ErrorBoundary extends Component<
  { children: ReactNode },
  { hasError: boolean; error?: Error }
> {
  constructor(props: { children: ReactNode }) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(error: Error) {
    return { hasError: true, error };
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="flex flex-1 flex-col items-center justify-center gap-4 p-10 text-center">
          <div className="text-5xl">🍩</div>
          <h2 className="graffiti-text text-xl text-[var(--color-dowgnut-blue-dark)]">
            Something went wrong
          </h2>
          <p className="text-sm text-[var(--color-dowgnut-blue-dark)]/60">
            {this.state.error?.message || "An unexpected error occurred."}
          </p>
          <button
            onClick={() => {
              this.setState({ hasError: false });
              window.location.reload();
            }}
            className="rounded-full bg-[var(--color-dowgnut-pink)] px-6 py-2 text-sm font-bold text-white"
          >
            Reload app
          </button>
        </div>
      );
    }
    return this.props.children;
  }
}
