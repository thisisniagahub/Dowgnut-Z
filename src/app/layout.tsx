import type { Metadata, Viewport } from "next";
import { Geist, Geist_Mono, Archivo_Black } from "next/font/google";
import "./globals.css";
import { Toaster } from "@/components/ui/toaster";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

const archivoBlack = Archivo_Black({
  variable: "--font-display",
  subsets: ["latin"],
  weight: ["400"],
});

export const metadata: Metadata = {
  title: "DowgNut — Good Vibes & Good Dowg",
  description:
    "DowgNut — bold, playful, authentic donut shopping. Browse classic, sprinkled, stuffed & specialty donuts. AI Concierge, AI Donut Designer, and live order tracking.",
  keywords: [
    "DowgNut",
    "donut",
    "doughnut",
    "donut shop",
    "AI donut",
    "online ordering",
  ],
  authors: [{ name: "DowgNut" }],
  applicationName: "DowgNut",
  manifest: "/manifest.json",
  openGraph: {
    title: "DowgNut — Good Vibes & Good Dowg",
    description: "Bold, playful, authentic donut shopping with AI-powered tools.",
    siteName: "DowgNut",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "DowgNut — Good Vibes & Good Dowg",
    description: "Bold, playful, authentic donut shopping with AI-powered tools.",
  },
};

export const viewport: Viewport = {
  themeColor: "#07579B",
  width: "device-width",
  initialScale: 1,
  maximumScale: 5,
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body
        className={`${geistSans.variable} ${geistMono.variable} ${archivoBlack.variable} antialiased bg-background text-foreground min-h-screen flex flex-col`}
      >
        {children}
        <Toaster />
      </body>
    </html>
  );
}
