"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Home, BookOpen, Target, Calendar, User as UserIcon, Gamepad2, Bell, Map, Trophy, MessageCircle, ShieldCheck, Heart, BookMarked, Clock } from "lucide-react";
import { cn } from "@/lib/utils";
import { ThemeToggle } from "@/components/ThemeToggle";
import { getLiturgicalSeason } from "@/lib/liturgy";
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
  { name: "Comfort",   href: "/comfort",   icon: ShieldCheck },
  { name: "Prayer Ring", href: "/intercession", icon: Clock },
  { name: "Journeys",  href: "/journeys",  icon: Map        },
  { name: "Missions",  href: "/missions",  icon: Target     },
  { name: "Prayer",    href: "/prayer",    icon: Heart      },
  { name: "Journal",   href: "/journal",   icon: BookMarked },
  { name: "Fellowship",href: "/fellowship",icon: MessageCircle },
  { name: "Games",     href: "/quizzes",   icon: Gamepad2 },
  { name: "Events",    href: "/events",    icon: Calendar   },
  { name: "Notices",   href: "/notifications", icon: Bell   },
  { name: "Ranks",     href: "/leaderboard", icon: Trophy   },
  { name: "Profile",   href: "/profile",   icon: UserIcon   },
];

// Public routes — no nav
const PUBLIC_ROUTES = ["/", "/login"];

function CrossIcon({ className }: { className?: string }) {
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

export function Navigation() {
  const pathname = usePathname();
  const { user, loading } = useAuth();

  const dailyVerse = getDailyVerse(user?.id);

  const [hasUnreadFellowship, setHasUnreadFellowship] = useState(false);

  useEffect(() => {
    if (pathname === "/fellowship") {
      localStorage.setItem("lastViewedFellowship", new Date().toISOString());
      setHasUnreadFellowship(false);
    } else if (user) {
      import("@/app/actions/globalChat").then(({ getMessages }) => {
        getMessages(1).then((msgs) => {
          if (msgs && msgs.length > 0) {
            const latestDate = new Date(msgs[0].createdAt).getTime();
            const lastViewed = localStorage.getItem("lastViewedFellowship");
            if (!lastViewed || latestDate > new Date(lastViewed).getTime()) {
              setHasUnreadFellowship(true);
            }
          }
        });
      });
    }
  }, [pathname, user]);

  useEffect(() => {
    if (pathname === "/fellowship" || !user) return;
    let channel: any;
    import("@/lib/supabase").then(({ supabase }) => {
      channel = supabase
        .channel("global_fellowship_nav")
        .on("broadcast", { event: "new_message" }, () => {
          setHasUnreadFellowship(true);
        })
        .subscribe();
    });
    return () => {
      if (channel) {
        import("@/lib/supabase").then(({ supabase }) => supabase.removeChannel(channel));
      }
    };
  }, [pathname, user]);

  // Hide on public / hero pages / admin or if unauthenticated
  if (
    PUBLIC_ROUTES.some((r) => pathname === r) ||
    pathname.startsWith("/admin") ||
    !user
  )
    return null;

  return (
    <>
      {/* ── Mobile Bottom Navigation ── */}
      <nav className="md:hidden fixed bottom-0 left-0 right-0 z-50 pb-safe">
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
                    <div className="relative">
                      <Icon className={cn("w-5 h-5 transition duration-200", isActive ? "text-amber-700 scale-110" : "text-muted-foreground")} strokeWidth={isActive ? 2.5 : 1.8} />
                      {item.name === "Fellowship" && hasUnreadFellowship && (
                        <span className="absolute -top-1 -right-1.5 flex h-3 w-3">
                          <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>
                          <span className="relative inline-flex rounded-full h-3 w-3 bg-red-500 border-2 border-white dark:border-[#0f1229]"></span>
                        </span>
                      )}
                    </div>
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
          <div className="flex flex-col gap-3 w-full">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-2xl bg-amber-700 flex items-center justify-center shadow-md">
                <CrossIcon className="w-5 h-5 text-white" />
              </div>
              <div>
                <h1 className="text-lg font-bold text-gray-900 dark:text-white leading-none font-serif">Ignite</h1>
                <p className="text-[10px] text-gray-500 font-semibold uppercase tracking-widest mt-0.5">Youth Ministry</p>
              </div>
            </div>
          </div>
          <ThemeToggle />
        </div>

        {/* Liturgical season */}
        <div className="mx-3 mb-6 rounded-xl px-3 py-2 bg-purple-50 dark:bg-purple-900/20">
          <p className="text-[10px] text-purple-700 dark:text-purple-400 font-bold uppercase tracking-widest">Liturgical Season</p>
          <p className="text-sm font-bold text-purple-900 dark:text-purple-100 mt-0.5">{getLiturgicalSeason()}</p>
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
                    "relative flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-semibold transition duration-200 justify-between",
                    isActive ? "text-amber-700 bg-amber-50 dark:bg-amber-900/20" : "text-gray-500 hover:text-gray-900 dark:hover:text-white hover:bg-gray-50 dark:hover:bg-gray-800/50"
                  )}
                >
                  <div className="flex items-center gap-3">
                    <Icon className={cn("w-4.5 h-4.5 relative z-10", isActive ? "text-amber-700" : "")} strokeWidth={isActive ? 2.5 : 1.8} />
                    <span className="relative z-10">{item.name}</span>
                  </div>
                  {item.name === "Fellowship" && hasUnreadFellowship && (
                    <span className="relative flex h-2 w-2 mr-1">
                      <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>
                      <span className="relative inline-flex rounded-full h-2 w-2 bg-red-500"></span>
                    </span>
                  )}
                </Link>
              </li>
            );
          })}
        </ul>

        {/* Footer */}
        <div className="mt-auto px-3">
          {(user?.role === "ADMIN" || user?.role === "PRIEST") && (
            <div className="mb-4">
              <Link
                href={user?.role === "PRIEST" ? "/priest/dashboard" : "/admin/dashboard"}
                className="flex items-center gap-2 justify-center w-full py-2.5 rounded-xl bg-slate-900 dark:bg-slate-100 text-white dark:text-slate-900 text-xs font-bold shadow-md hover:scale-[1.02] transition-transform"
              >
                <ShieldCheck className="w-4 h-4" />
                {user?.role === "PRIEST" ? "Priest Dashboard" : "Admin Dashboard"}
              </Link>
            </div>
          )}
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
