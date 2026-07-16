import type { NextConfig } from "next";

const nextConfig = {
  reactStrictMode: true,
  transpilePackages: ["@dowgnut/ui", "@dowgnut/config", "@dowgnut/types", "@dowgnut/utils"],
  experimental: {
    optimizePackageImports: ["@dowgnut/ui", "lucide-react", "recharts"],
  },
};

export default nextConfig;