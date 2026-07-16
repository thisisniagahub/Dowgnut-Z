"use client";

import { createContext, useContext, useState, useEffect, ReactNode } from "react";

type FestivalKey = "harir Raya" | "merdeka" | "cny" | "deepavali" | null;

interface FestivalContextType {
  currentFestival: FestivalKey;
  setFestival: (festival: FestivalKey) => void;
  isFestivalMode: boolean;
  autoDetect: () => FestivalKey;
}

const FestivalContext = createContext<FestivalContextType | undefined>(undefined);

export function FestivalProvider({ children }: { children: ReactNode }) {
  const [currentFestival, setCurrentFestival] = useState<FestivalKey>(null);
  const [autoDetected, setAutoDetected] = useState<FestivalKey>(null);

  // Auto-detect festival based on date
  const autoDetect = () => {
    const now = new Date();
    const month = now.getMonth(); // 0-11
    const day = now.getDate();
    
    // Hari Raya Aidilfitri (approximate - moves each year)
    // 2025: March 30-31, 2026: March 19-20
    // Check if within ~10 days of expected dates
    if ((month === 2 && day >= 20) || (month === 3 && day <= 10)) {
      return "harir Raya";
    }
    
    // Merdeka: August 31
    if (month === 7 && day >= 25) {
      return "merdeka";
    }
    
    // CNY (approximate - lunar calendar)
    // 2025: Jan 29, 2026: Feb 17
    if ((month === 0 && day >= 20) || (month === 1 && day <= 15)) {
      return "cny";
    }
    
    // Deepavali (approximate - lunar calendar)
    // 2025: Oct 20, 2026: Nov 8
    if ((month === 9 && day >= 15) || (month === 10 && day <= 10)) {
      return "deepavali";
    }
    
    return null;
  };

  // Check on mount and daily
  useEffect(() => {
    const detected = autoDetect();
    // Use setTimeout to defer state updates and avoid synchronous setState in effect
    const timer = setTimeout(() => {
      setAutoDetected(detected);
      if (detected && !currentFestival) {
        setCurrentFestival(detected);
      }
    }, 0);
    
    // Check daily at midnight
    const now = new Date();
    const tomorrow = new Date(now);
    tomorrow.setDate(tomorrow.getDate() + 1);
    tomorrow.setHours(0, 0, 0, 0);
    const msUntilMidnight = tomorrow.getTime() - now.getTime();
    
    const interval = setInterval(() => {
      const detected = autoDetect();
      setAutoDetected(detected);
    }, msUntilMidnight);
    
    return () => {
      clearTimeout(timer);
      clearInterval(interval);
    };
  }, [currentFestival]);

  const setFestival = (festival: FestivalKey) => {
    setCurrentFestival(festival);
  };

  return (
    <FestivalContext.Provider
      value={{
        currentFestival,
        setFestival,
        isFestivalMode: !!currentFestival,
        autoDetect,
      }}
    >
      {children}
    </FestivalContext.Provider>
  );
}

export function useFestival() {
  const context = useContext(FestivalContext);
  if (!context) {
    throw new Error("useFestival must be used within a FestivalProvider");
  }
  return context;
}

// ─── Festival Toggle UI Component ────────────────────────────────────────
import { motion, AnimatePresence } from "framer-motion";
import { cn } from "@/lib/utils";

export function FestivalToggle() {
  const { currentFestival, setFestival, isFestivalMode, autoDetected } = useFestival();
  
  const festivals = [
    { key: "harir Raya" as const, label: "Hari Raya", emoji: "🌙", color: "bg-green-600" },
    { key: "merdeka" as const, label: "Merdeka", emoji: "🇲🇾", color: "bg-red-600" },
    { key: "cny" as const, label: "CNY", emoji: "🧧", color: "bg-red-500" },
    { key: "deepavali" as const, label: "Deepavali", emoji: "🪔", color: "bg-purple-600" },
  ];

  const current = currentFestival ? festivals.find(f => f.key === currentFestival) : null;

  return (
    <div className="relative">
      {/* Main toggle button */}
      <motion.button
        onClick={() => setFestival(isFestivalMode ? null : autoDetected || "merdeka")}
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        className={cn(
          "relative px-3 py-2 rounded-full text-sm font-semibold transition-all",
          "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--color-dowgnut-pink)]",
          isFestivalMode
            ? "bg-gradient-to-r from-[var(--color-dowgnut-pink)] to-[var(--color-dowgnut-blue)] text-white shadow-[0_0_20px_var(--color-dowgnut-pink)]"
            : "bg-white/80 text-[var(--color-dowgnut-blue-dark)] hover:bg-white"
        )}
        aria-label={isFestivalMode ? "Exit festival mode" : "Enter festival mode"}
      >
        {isFestivalMode && current ? (
          <>
            <span className="mr-1">{current.emoji}</span>
            {current.label}
            <motion.span
              className="ml-2 inline-flex items-center justify-center w-5 h-5 rounded-full bg-white/20 text-xs"
              animate={{ rotate: [0, 360] }}
              transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
            >
              ✨
            </motion.span>
          </>
        ) : (
          <>
            <span className="mr-1">🎉</span>
            Festival Mode
          </>
        )}
      </motion.button>

      {/* Festival picker dropdown */}
      <AnimatePresence>
              {isFestivalMode && (
                <motion.div
                  initial={{ opacity: 0, y: -10, scale: 0.95 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={{ opacity: 0, y: -10, scale: 0.95 }}
                  transition={{ duration: 0.2 }}
                  className="absolute right-0 top-full mt-2 w-48 bg-white rounded-2xl shadow-2xl border border-[var(--color-dowgnut-blue-dark)]/10 p-2 z-50"
                  role="menu"
                >
                  {festivals.map((f) => (
                    <motion.button
                      key={f.key}
                      onClick={() => setFestival(f.key)}
                      whileHover={{ x: 4 }}
                      className={cn(
                        "w-full px-3 py-2 rounded-xl text-left text-sm font-medium transition-colors",
                        "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--color-dowgnut-pink)]",
                        currentFestival === f.key
                          ? "bg-gradient-to-r from-[var(--color-dowgnut-pink)] to-[var(--color-dowgnut-blue)] text-white"
                          : "text-[var(--color-dowgnut-blue-dark)] hover:bg-[var(--color-dowgnut-cream)]"
                      )}
                      role="menuitem"
                      aria-checked={currentFestival === f.key}
                    >
                      <span className="mr-2">{f.emoji}</span>
                      <span className="flex-1">{f.label}</span>
                      {currentFestival === f.key && (
                        <motion.span
                          className="ml-2"
                          animate={{ scale: [1, 1.2, 1] }}
                          transition={{ duration: 0.5, repeat: Infinity }}
                        >
                          ✓
                        </motion.span>
                      )}
                    </motion.button>
                  ))}
                  <div className="border-t border-[var(--color-dowgnut-blue-dark)]/10 my-2" />
                  <motion.button
                    onClick={() => setFestival(null)}
                    whileHover={{ x: -4 }}
                    className="w-full px-3 py-2 rounded-xl text-left text-sm font-medium text-[var(--color-dowgnut-blue-dark)]/60 hover:bg-[var(--color-dowgnut-cream)] transition-colors"
                    role="menuitem"
                  >
                    <span className="mr-2">✕</span>
                    Exit Festival Mode
                  </motion.button>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        );
      }
// ─── Festival Banner (Top of page) ───────────────────────────────────────
export function FestivalBanner() {
  const { currentFestival, setFestival } = useFestival();
  
  if (!currentFestival) return null;

  const greetings: Record<string, string> = {
    "harir Raya": "Selamat Hari Raya Aidilfitri! Maaf Zahir & Batin 🌙",
    "merdeka": "Merdeka! Merdeka! Merdeka! 🇲🇾",
    "cny": "Gong Xi Fa Cai! 新年快乐 🧧",
    "deepavali": "Happy Deepavali! Selamat Hari Deepavali! 🪔",
  };

  const colors: Record<string, string> = {
    "harir Raya": "from-green-600 via-emerald-500 to-yellow-400",
    "merdeka": "from-red-600 via-white to-blue-800",
    "cny": "from-red-600 via-yellow-400 to-orange-500",
    "deepavali": "from-purple-700 via-orange-500 to-pink-500",
  };

  return (
    <motion.div
      initial={{ height: 0, opacity: 0 }}
      animate={{ height: "auto", opacity: 1 }}
      exit={{ height: 0, opacity: 0 }}
      className={cn(
        "relative w-full py-3 px-4 text-center overflow-hidden",
        "bg-gradient-to-r",
        colors[currentFestival] || "from-[var(--color-dowgnut-pink)] to-[var(--color-dowgnut-blue)]"
      )}
    >
      <div className="relative z-10 flex items-center justify-center gap-2">
        <motion.span
          animate={{ rotate: [0, 10, -10, 0] }}
          transition={{ duration: 2, repeat: Infinity }}
          className="text-2xl"
        >
          {currentFestival === "harir Raya" && "🌙"}
          {currentFestival === "merdeka" && "🇲🇾"}
          {currentFestival === "cny" && "🧧"}
          {currentFestival === "deepavali" && "🪔"}
        </motion.span>
        <p className="text-white font-bold text-sm md:text-base drop-shadow-lg">
          {greetings[currentFestival]}
        </p>
        <motion.span
          animate={{ rotate: [0, -10, 10, 0] }}
          transition={{ duration: 2, repeat: Infinity }}
          className="text-2xl"
        >
          {currentFestival === "harir Raya" && "🌙"}
          {currentFestival === "merdeka" && "🇲🇾"}
          {currentFestival === "cny" && "🧧"}
          {currentFestival === "deepavali" && "🪔"}
        </motion.span>
      </div>
      
      <button
        onClick={() => setFestival(null)}
        className="absolute right-4 top-1/2 -translate-y-1/2 p-1 rounded-full bg-white/20 hover:bg-white/30 transition-colors text-white"
        aria-label="Dismiss festival banner"
      >
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
        </svg>
      </button>

      {/* Animated background elements */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        {[1, 2, 3, 4, 5].map((i) => (
          <motion.div
            key={i}
            className="absolute w-4 h-4 rounded-full opacity-30"
            style={{
              background: currentFestival === "merdeka" 
                ? (i % 2 === 0 ? "#B71C1C" : "#FFFFFF") 
                : currentFestival === "cny"
                ? (i % 2 === 0 ? "#FFD700" : "#B71C1C")
                : currentFestival === "deepavali"
                ? (i % 2 === 0 ? "#FF9800" : "#E91E63")
                : (i % 2 === 0 ? "#FFD700" : "#1B5E20"),
            }}
            animate={{
              x: [0, (Math.random() - 0.5) * 200],
              y: [0, (Math.random() - 0.5) * 100],
              scale: [0, 1, 0],
              opacity: [0, 0.3, 0],
            }}
            transition={{
              duration: 8 + Math.random() * 4,
              repeat: Infinity,
              delay: Math.random() * 2,
              ease: "easeInOut",
            }}
          />
        ))}
      </div>
    </motion.div>
  );
}