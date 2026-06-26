"use client";

import { motion, AnimatePresence } from "framer-motion";
import { usePathname } from "next/navigation";

// Per-route animation styles
const routeVariants: Record<string, any> = {
  "/":         { initial: { opacity: 0 },           animate: { opacity: 1 } },
  "/login":    { initial: { opacity: 0, scale: 0.98 }, animate: { opacity: 1, scale: 1 } },
  "/dashboard":{ initial: { opacity: 0, y: 12 },    animate: { opacity: 1, y: 0 } },
  "/bible":    { initial: { opacity: 0, x: -16 },   animate: { opacity: 1, x: 0 } },
  "/missions": { initial: { opacity: 0, x: 16 },    animate: { opacity: 1, x: 0 } },
  "/events":   { initial: { opacity: 0, y: 16 },    animate: { opacity: 1, y: 0 } },
  "/quizzes":  { initial: { opacity: 0, scale: 0.95 }, animate: { opacity: 1, scale: 1 } },
  "/prayer":   { initial: { opacity: 0, y: 20 },    animate: { opacity: 1, y: 0 } },
  "/leaderboard":{ initial: { opacity: 0, scale: 0.95 }, animate: { opacity: 1, scale: 1 } },
  "/admin":    { initial: { opacity: 0, x: -20 },   animate: { opacity: 1, x: 0 } },
  "/notifications": { initial: { opacity: 0, y: 15 }, animate: { opacity: 1, y: 0 } },
  "/profile":  { initial: { opacity: 0, scale: 0.97 }, animate: { opacity: 1, scale: 1 } },
};

const DEFAULT_TRANSITION = { duration: 0.35, ease: [0.22, 1, 0.36, 1] as const };

export default function Template({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();

  // Derive base route (for nested routes like /bible/john/3)
  const baseRoute = "/" + pathname.split("/")[1];
  const variant = routeVariants[baseRoute] ?? {
    initial: { opacity: 0, y: 10 },
    animate: { opacity: 1, y: 0 },
  };

  return (
    <AnimatePresence mode="wait">
      <motion.div
        key={pathname}
        initial={variant.initial}
        animate={variant.animate}
        transition={DEFAULT_TRANSITION}
        className="flex-1 flex flex-col w-full min-h-0"
      >
        {children}
      </motion.div>
    </AnimatePresence>
  );
}
