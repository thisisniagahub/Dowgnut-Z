"use client";

import { useEffect, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { useShop } from "@/store/use-shop";

/**
 * SplashScreen — minimal, clean, premium.
 * Just the logo fading in, then fading out. Nothing else.
 */

export function SplashScreen() {
  const splashDone = useShop((s) => s.splashDone);
  const dismissSplash = useShop((s) => s.dismissSplash);
  const [visible, setVisible] = useState(true);

  useEffect(() => {
    if (splashDone) return;
    const t1 = setTimeout(() => setVisible(false), 2000);
    const t2 = setTimeout(() => dismissSplash(), 2600);
    return () => {
      clearTimeout(t1);
      clearTimeout(t2);
    };
  }, [splashDone, dismissSplash]);

  return (
    <AnimatePresence>
      {!splashDone && (
        <motion.div
          key="splash"
          initial={{ opacity: 1 }}
          animate={{ opacity: visible ? 1 : 0 }}
          transition={{ duration: 0.6, ease: "easeInOut" }}
          onClick={dismissSplash}
          className="fixed inset-0 z-[100] flex cursor-pointer items-center justify-center bg-[var(--color-dowgnut-blue-dark)]"
          role="dialog"
          aria-label="DowgNut splash screen"
        >
          <motion.img
            src="/brand/hypebeast-icon.png"
            alt="DowgNut"
            className="size-24 rounded-full object-cover"
            draggable={false}
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
          />
        </motion.div>
      )}
    </AnimatePresence>
  );
}
