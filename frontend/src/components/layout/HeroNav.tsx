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
          ? "bg-[#fdfbf7]/90 backdrop-blur-md border-b border-gray-200 shadow-sm"
          : "bg-[#fdfbf7]"
      }`}
    >
      <div className="max-w-5xl mx-auto flex items-center justify-between px-6 h-16">
        {/* Logo */}
        <Link href="/" className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-xl bg-amber-700 flex items-center justify-center shadow-sm">
            <Cross className="w-4.5 h-4.5 text-white" />
          </div>
          <span className="font-extrabold text-lg font-serif text-gray-900">
            Ignite
          </span>
        </Link>

        {/* CTA */}
        <div className="flex items-center gap-3">
          <Link
            href="/login"
            className="text-sm font-semibold px-4 py-2 text-gray-600 hover:text-gray-900 transition-colors"
          >
            Sign In
          </Link>
          <Link
            href="/login"
            className="text-sm font-bold px-5 py-2.5 rounded-xl bg-amber-700 text-white hover:bg-amber-800 transition-colors shadow-sm"
          >
            Get Started
          </Link>
        </div>
      </div>
    </header>
  );
}
