"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { motion, useScroll } from "framer-motion";

function Cross({ className = "" }: { className?: string }) {
  return (
    <svg viewBox="0 0 40 40" className={className} fill="none" stroke="currentColor" strokeWidth="3.5" strokeLinecap="round">
      <line x1="20" y1="4" x2="20" y2="36" /><line x1="6" y1="14" x2="34" y2="14" />
    </svg>
  );
}

export function HeroNav() {
  const { scrollY } = useScroll();
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const unsub = scrollY.on("change", (v) => setScrolled(v > 60));
    return unsub;
  }, [scrollY]);

  return (
    <motion.header
      initial={{ opacity: 0, y: -16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-500 ${
        scrolled
          ? "bg-background/90 backdrop-blur-xl border-b border-amber-200/40 dark:border-amber-900/20 shadow-sm"
          : ""
      }`}
    >
      <div className="max-w-5xl mx-auto flex items-center justify-between px-6 h-16">
        {/* Logo */}
        <Link href="/" className="flex items-center gap-2.5">
          <div className={`w-8 h-8 rounded-xl flex items-center justify-center transition-all ${scrolled ? "gradient-gold halo-glow" : "bg-white/20 border border-white/30"}`}>
            <Cross className="w-4.5 h-4.5 text-white" />
          </div>
          <span className={`font-extrabold text-lg font-serif transition-colors ${scrolled ? "text-gradient-gold" : "text-white"}`}>
            Ignite
          </span>
        </Link>

        {/* CTA only — no scroll links */}
        <div className="flex items-center gap-2">
          <Link
            href="/login"
            className={`text-sm font-semibold px-4 py-2 rounded-xl transition-all ${
              scrolled
                ? "text-primary hover:bg-primary/10"
                : "text-white/80 hover:text-white hover:bg-white/10"
            }`}
          >
            Sign In
          </Link>
          <Link
            href="/login"
            className="text-sm font-bold px-5 py-2.5 rounded-xl gradient-gold text-white shadow-lg halo-glow hover:opacity-90 transition-all hover:scale-[1.02] active:scale-[0.98]"
          >
            Get Started ✝
          </Link>
        </div>
      </div>
    </motion.header>
  );
}
