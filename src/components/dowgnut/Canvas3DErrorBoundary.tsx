"use client";

import { Component, type ErrorInfo, type ReactNode } from "react";
import { WebGLFallback } from "./WebGLFallback";

interface Canvas3DErrorBoundaryProps {
  donutType?: string;
  className?: string;
  size?: number;
  children: ReactNode;
}

interface Canvas3DErrorBoundaryState {
  hasError: boolean;
  errorMessage?: string;
}

/**
 * Canvas3DErrorBoundary — Catches errors thrown by WebGL/R3F Canvas
 * components (e.g. context creation failure, shader compilation errors,
 * driver crashes) and gracefully degrades to a 2D CSS donut fallback.
 *
 * Use this to wrap any `<Canvas>` or R3F scene component:
 *
 *   <Canvas3DErrorBoundary donutType={donut.type} size={200}>
 *     <Donut3DViewer ... />
 *   </Canvas3DErrorBoundary>
 */
export class Canvas3DErrorBoundary extends Component<
  Canvas3DErrorBoundaryProps,
  Canvas3DErrorBoundaryState
> {
  constructor(props: Canvas3DErrorBoundaryProps) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(error: Error): Canvas3DErrorBoundaryState {
    return {
      hasError: true,
      errorMessage: error.message,
    };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    // Log for debugging — could be sent to an error reporting service
    console.error("[Canvas3DErrorBoundary] WebGL scene error:", error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div
          className="flex flex-col items-center justify-center gap-2"
          style={this.props.size ? { width: this.props.size, height: this.props.size } : undefined}
        >
          <WebGLFallback
            donutType={this.props.donutType}
            className={this.props.className}
            size={this.props.size}
          />
          <p className="text-[10px] text-[var(--color-dowgnut-blue-dark)]/40">
            3D preview unavailable
          </p>
        </div>
      );
    }

    return this.props.children;
  }
}
