"use client";

import { useEffect, useState } from "react";
import { WifiOff, Dices } from "lucide-react";
import Link from "next/link";

export function OfflineHandler() {
  const [isOffline, setIsOffline] = useState(false);

  useEffect(() => {
    const handleOffline = () => setIsOffline(true);
    const handleOnline = () => setIsOffline(false);

    if (typeof window !== "undefined") {
      setIsOffline(!navigator.onLine);
      window.addEventListener("offline", handleOffline);
      window.addEventListener("online", handleOnline);
    }

    return () => {
      window.removeEventListener("offline", handleOffline);
      window.removeEventListener("online", handleOnline);
    };
  }, []);

  if (!isOffline) return null;

  return (
    <div className="fixed top-0 left-0 right-0 z-[100] bg-amber-600 text-white text-xs font-semibold px-4 py-2 flex items-center justify-between shadow-lg animate-in slide-in-from-top duration-300">
      <div className="flex items-center gap-2">
        <WifiOff className="w-4 h-4 animate-pulse" />
        <span>You are offline. Games (Bible Ludo & Quizzes) are available offline!</span>
      </div>
      <Link 
        href="/ludo"
        className="inline-flex items-center gap-1 bg-white/20 hover:bg-white/30 text-white px-2.5 py-1 rounded-lg text-[11px] font-bold backdrop-blur-sm transition-all"
      >
        <Dices className="w-3.5 h-3.5" />
        Play Ludo
      </Link>
    </div>
  );
}
