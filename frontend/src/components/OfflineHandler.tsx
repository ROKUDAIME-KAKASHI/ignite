"use client";

import { useEffect, useState } from "react";
import { WifiOff, Dices, CheckCircle2 } from "lucide-react";
import Link from "next/link";
import { processOfflineQueue } from "@/lib/offlineSync";

export function OfflineHandler() {
  const [isOffline, setIsOffline] = useState(false);
  const [syncToast, setSyncToast] = useState<{ message: string } | null>(null);

  useEffect(() => {
    const handleOffline = () => setIsOffline(true);
    
    const handleOnline = async () => {
      setIsOffline(false);
      const res = await processOfflineQueue();
      if (res.syncedCount > 0) {
        setSyncToast({ message: `Connection restored! Synced ${res.syncedCount} offline achievements (+${res.totalXP} XP)` });
        setTimeout(() => setSyncToast(null), 4500);
      }
    };

    if (typeof window !== "undefined") {
      setIsOffline(!navigator.onLine);
      window.addEventListener("offline", handleOffline);
      window.addEventListener("online", handleOnline);

      if (navigator.onLine) {
        processOfflineQueue().then(res => {
          if (res.syncedCount > 0) {
            setSyncToast({ message: `Synced ${res.syncedCount} offline achievements (+${res.totalXP} XP)` });
            setTimeout(() => setSyncToast(null), 4500);
          }
        });
      }
    }

    return () => {
      window.removeEventListener("offline", handleOffline);
      window.removeEventListener("online", handleOnline);
    };
  }, []);

  return (
    <>
      {isOffline && (
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
      )}

      {syncToast && (
        <div className="fixed bottom-6 right-6 z-[100] bg-emerald-600 text-white text-xs font-bold px-4 py-3 rounded-2xl shadow-2xl flex items-center gap-2.5 animate-in slide-in-from-bottom duration-300 border border-white/20">
          <CheckCircle2 className="w-5 h-5 text-emerald-200" />
          <span>{syncToast.message}</span>
        </div>
      )}
    </>
  );
}
