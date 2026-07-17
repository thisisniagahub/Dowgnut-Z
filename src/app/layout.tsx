import type { Metadata, Viewport } from "next";
import { Anybody, JetBrains_Mono, Hanken_Grotesk } from "next/font/google";
import "./globals.css";
import { Toaster } from "@/components/ui/toaster";
import { FestivalProvider } from "@/components/dowgnut/FestivalShaders";
import { Providers } from "./providers";
import { ClientOnly } from "@/components/dowgnut/ClientOnly";

const anybody = Anybody({
  variable: "--font-display",
  subsets: ["latin"],
  weight: ["700", "800", "900"],
});

const jetBrainsMono = JetBrains_Mono({
  variable: "--font-mono",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
});

const hankenGrotesk = Hanken_Grotesk({
  variable: "--font-body",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
});

export const metadata: Metadata = {
  title: "DowgNut — Donut Delivery",
  description:
    "Order fresh donuts delivered to your door. Touch 'n Go, DuitNow, card payment. Bold, playful, authentic.",
  applicationName: "DowgNut",
  manifest: "/manifest.json",
  icons: {
    icon: "/favicon.ico",
    apple: "/apple-touch-icon.png",
  },
  appleWebApp: {
    capable: true,
    statusBarStyle: "default",
    title: "DowgNut",
  },
  formatDetection: {
    telephone: false,
  },
};

export const viewport: Viewport = {
  themeColor: "#536600",
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
  viewportFit: "cover",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body
        className={`${anybody.variable} ${jetBrainsMono.variable} ${hankenGrotesk.variable} antialiased bg-background text-foreground min-h-screen flex flex-col overscroll-none`}
      >
        <Providers>
          <FestivalProvider>
            {children}
          </FestivalProvider>
        </Providers>
        <ClientOnly>
          <Toaster />
        </ClientOnly>
      </body>
    </html>
  );
}
