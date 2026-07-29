"use client";

import { useState, useEffect } from "react";
import Link from "next/link";

function Cross({ className = "" }: { className?: string }) {
  return (
    <svg viewBox="0 0 40 40" className={className} fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
      <line x1="20" y1="8" x2="20" y2="34" />
      <line x1="8" y1="18" x2="32" y2="18" />
      <circle cx="20" cy="5" r="2" />
      <circle cx="16" cy="8" r="2" />
      <circle cx="24" cy="8" r="2" />
      <circle cx="5" cy="18" r="2" />
      <circle cx="8" cy="14" r="2" />
      <circle cx="8" cy="22" r="2" />
      <circle cx="35" cy="18" r="2" />
      <circle cx="32" cy="14" r="2" />
      <circle cx="32" cy="22" r="2" />
      <path d="M15 34h10M12 38h16" />
    </svg>
  );
}

export function HeroNav() {
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 40);
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  return (
    <header
      className={`fixed top-0 left-0 right-0 z-50 transition duration-300 ${
        scrolled
          ? "bg-[#0a0a0a]/80 backdrop-blur-xl border-b border-white/10 shadow-lg"
          : "bg-transparent"
      }`}
    >
      <div className="max-w-5xl mx-auto flex items-center justify-between px-6 h-16">
        {/* Logo */}
        <Link href="/" className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-amber-500 to-amber-700 flex items-center justify-center shadow-lg shadow-amber-500/20">
            <Cross className="w-4.5 h-4.5 text-white" />
          </div>
          <span className="font-extrabold text-lg font-serif text-white tracking-wide">
            Ignite
          </span>
        </Link>

        {/* CTA */}
        <div className="flex items-center gap-3">
          <Link
            href="/login"
            className="text-sm font-semibold px-4 py-2 text-slate-300 hover:text-white transition-colors"
          >
            Sign In
          </Link>
          <Link
            href="/login"
            className="text-sm font-bold px-5 py-2.5 rounded-xl bg-amber-600 text-white hover:bg-amber-700 transition-colors shadow-lg shadow-amber-600/20"
          >
            Get Started
          </Link>
        </div>
      </div>
    </header>
  );
}
