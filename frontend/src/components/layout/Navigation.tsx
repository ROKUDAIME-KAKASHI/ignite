"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Home, BookOpen, Target, Calendar, User as UserIcon, Gamepad2, Bell, Map } from "lucide-react";
import { cn } from "@/lib/utils";
import { ThemeToggle } from "@/components/ThemeToggle";
import { motion } from "framer-motion";
import { useAuth } from "@/context/AuthContext";

const DAILY_VERSES = [
  { text: "The Lord is my shepherd; I shall not want.", ref: "Psalm 23:1" },
  { text: "I can do all things through Christ who strengthens me.", ref: "Philippians 4:13" },
  { text: "Be strong and courageous. Do not be afraid.", ref: "Joshua 1:9" },
  { text: "For God gave us a spirit not of fear but of power and love and self-control.", ref: "2 Timothy 1:7" },
  { text: "Cast all your anxiety on him because he cares for you.", ref: "1 Peter 5:7" },
  { text: "The steadfast love of the Lord never ceases; his mercies never come to an end.", ref: "Lamentations 3:22" },
  { text: "Let all that you do be done in love.", ref: "1 Corinthians 16:14" },
  { text: "Rejoice always, pray without ceasing, give thanks in all circumstances.", ref: "1 Thessalonians 5:16-18" },
  { text: "Trust in the Lord with all your heart, and do not lean on your own understanding.", ref: "Proverbs 3:5" },
  { text: "And we know that for those who love God all things work together for good.", ref: "Romans 8:28" },
  { text: "Thy word is a lamp unto my feet, and a light unto my path.", ref: "Psalm 119:105" },
  { text: "For we walk by faith, not by sight.", ref: "2 Corinthians 5:7" },
];

function getDailyVerse(userId?: string) {
  if (!userId) return DAILY_VERSES[0];
  const today = new Date();
  const dayOfYear = Math.floor((today.getTime() - new Date(today.getFullYear(), 0, 0).getTime()) / 86400000);
  
  let userNum = 0;
  for (let i = 0; i < userId.length; i++) {
    userNum += userId.charCodeAt(i);
  }
  
  return DAILY_VERSES[(userNum + dayOfYear) % DAILY_VERSES.length];
}

const navItems = [
  { name: "Home",      href: "/dashboard", icon: Home       },
  { name: "Scripture", href: "/bible",     icon: BookOpen   },
  { name: "Journeys",  href: "/journeys",  icon: Map        },
  { name: "Missions",  href: "/missions",  icon: Target     },
  { name: "Games",     href: "/quizzes",   icon: Gamepad2 },
  { name: "Events",    href: "/events",    icon: Calendar   },
  { name: "Notices",   href: "/notifications", icon: Bell   },
  { name: "Profile",   href: "/profile",   icon: UserIcon   },
];

// Public routes — no nav
const PUBLIC_ROUTES = ["/", "/login"];

function CrossIcon({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 40 40" className={className} fill="none" stroke="currentColor" strokeWidth="3.5" strokeLinecap="round">
      <line x1="20" y1="4" x2="20" y2="36" />
      <line x1="6" y1="14" x2="34" y2="14" />
    </svg>
  );
}

export function Navigation() {
  const pathname = usePathname();
  const { user } = useAuth();

  // Hide on public / hero pages / admin
  if (PUBLIC_ROUTES.some((r) => pathname === r) || pathname.startsWith("/admin")) return null;

  const dailyVerse = getDailyVerse(user?.id);

  return (
    <>
      {/* ── Mobile Bottom Navigation ── */}
      <nav className="md:hidden fixed bottom-0 left-0 right-0 z-50 pb-safe">
        <motion.div 
          drag
          dragMomentum={false}
          dragElastic={0.1}
          className="fixed top-24 right-4 z-[60] cursor-grab active:cursor-grabbing md:hidden"
        >
          <ThemeToggle />
        </motion.div>
        <div className="bg-white dark:bg-[#0f1229] border-t border-amber-200/50 dark:border-amber-900/20 shadow-2xl">

          <ul className="flex overflow-x-auto items-center h-16 px-4 gap-2 snap-x [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
            {navItems.map((item) => {
              const isActive = pathname === item.href || (item.href === "/dashboard" && pathname === "/dashboard");
              const Icon = item.icon;
              return (
                <li key={item.name} className="shrink-0 snap-center flex justify-center w-20">
                  <Link href={item.href} className="relative flex flex-col items-center justify-center w-full py-2 gap-1">
                    {isActive && (
                      <motion.span
                        layoutId="nav-mobile-pill"
                        className="absolute -top-0.5 left-1/2 -translate-x-1/2 w-8 h-0.5 rounded-full bg-amber-700"
                        transition={{ type: "spring", stiffness: 400, damping: 35 }}
                      />
                    )}
                    <Icon className={cn("w-5 h-5 transition-all duration-200", isActive ? "text-amber-700 scale-110" : "text-muted-foreground")} strokeWidth={isActive ? 2.5 : 1.8} />
                    <span className={cn("text-[10px] font-semibold tracking-wide", isActive ? "text-amber-700" : "text-muted-foreground")}>
                      {item.name}
                    </span>
                  </Link>
                </li>
              );
            })}
          </ul>
        </div>
      </nav>

      {/* ── Desktop Sidebar ── */}
      <nav className="hidden md:flex flex-col w-72 h-screen sticky top-0 p-5 border-r border-gray-200 dark:border-gray-800 bg-white dark:bg-[#0f1229] shrink-0">
        {/* Brand */}
        <div className="mb-8 px-3 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-amber-700 flex items-center justify-center shadow-md">
              <CrossIcon className="w-5 h-5 text-white" />
            </div>
            <div>
              <h1 className="text-lg font-bold text-gray-900 dark:text-white leading-none font-serif">Ignite</h1>
              <p className="text-[10px] text-gray-500 font-semibold uppercase tracking-widest mt-0.5">Youth Ministry</p>
            </div>
          </div>
          <ThemeToggle />
        </div>

        {/* Liturgical season */}
        <div className="mx-3 mb-6 rounded-xl px-3 py-2 bg-purple-50 dark:bg-purple-900/20">
          <p className="text-[10px] text-purple-700 dark:text-purple-400 font-bold uppercase tracking-widest">Liturgical Season</p>
          <p className="text-sm font-bold text-purple-900 dark:text-purple-100 mt-0.5">Ordinary Time</p>
        </div>

        {/* Nav links */}
        <ul className="space-y-1 flex-1">
          {navItems.map((item) => {
            const isActive = pathname === item.href;
            const Icon = item.icon;
            return (
              <li key={item.name}>
                <Link
                  href={item.href}
                  className={cn(
                    "relative flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-semibold transition-all duration-200",
                    isActive ? "text-amber-700 bg-amber-50 dark:bg-amber-900/20" : "text-gray-500 hover:text-gray-900 dark:hover:text-white hover:bg-gray-50 dark:hover:bg-gray-800/50"
                  )}
                >
                  <Icon className={cn("w-4.5 h-4.5 relative z-10", isActive ? "text-amber-700" : "")} strokeWidth={isActive ? 2.5 : 1.8} />
                  <span className="relative z-10">{item.name}</span>
                </Link>
              </li>
            );
          })}
        </ul>

        {/* Footer */}
        <div className="mt-auto px-3">
          <div className="border-t border-gray-100 dark:border-gray-800 my-4" />
          <div className="rounded-xl p-3 bg-amber-50 dark:bg-amber-900/10 border border-amber-100 dark:border-amber-900/20">
            <p className="text-[10px] font-bold text-amber-700 uppercase tracking-widest mb-1">Verse of the Day</p>
            <p className="text-xs text-gray-600 dark:text-gray-400 italic leading-relaxed font-serif">&quot;{dailyVerse.text}&quot;</p>
            <p className="text-[10px] text-amber-700 font-semibold mt-1.5">— {dailyVerse.ref}</p>
          </div>
          <p className="text-center text-[10px] text-gray-400 mt-3 tracking-widest uppercase font-medium">✝ Soli Deo Gloria ✝</p>
        </div>
      </nav>
    </>
  );
}
