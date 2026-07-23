"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Heart, Clock, Users, Play, CheckCircle2, Sparkles, Shield, ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { useAuth } from "@/context/AuthContext";
import { awardXP } from "@/app/actions/gamification";
import { queueOfflineXP } from "@/lib/offlineSync";

interface PrayerSlot {
  id: string;
  timeRange: string;
  committedBy: string;
  isMine: boolean;
}

const DEFAULT_SLOTS: PrayerSlot[] = [
  { id: "1", timeRange: "06:00 AM - 06:15 AM", committedBy: "Maria S.", isMine: false },
  { id: "2", timeRange: "07:30 AM - 07:45 AM", committedBy: "John K.", isMine: false },
  { id: "3", timeRange: "12:00 PM - 12:15 PM", committedBy: "St. Gregorios Youth Group", isMine: false },
  { id: "4", timeRange: "03:00 PM - 03:15 PM", committedBy: "Fr. Thomas", isMine: false },
  { id: "5", timeRange: "06:00 PM - 06:15 PM", committedBy: "Clara R.", isMine: false },
  { id: "6", timeRange: "09:00 PM - 09:15 PM", committedBy: "Available", isMine: false },
  { id: "7", timeRange: "10:30 PM - 10:45 PM", committedBy: "Available", isMine: false },
];

export default function IntercessionChainPage() {
  const { user, setUser } = useAuth();
  const [slots, setSlots] = useState<PrayerSlot[]>(DEFAULT_SLOTS);
  const [activeTimer, setActiveTimer] = useState<number | null>(null);
  const [timerLeft, setTimerLeft] = useState(300); // 5 minutes = 300 seconds
  const [completedPrayer, setCompletedPrayer] = useState(false);
  const [totalHours, setTotalHours] = useState(142);

  // Timer countdown
  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (activeTimer !== null && timerLeft > 0) {
      interval = setInterval(() => {
        setTimerLeft((prev) => prev - 1);
      }, 1000);
    } else if (activeTimer !== null && timerLeft === 0) {
      // Completed 5-min prayer session!
      handleCompleteSession();
    }
    return () => clearInterval(interval);
  }, [activeTimer, timerLeft]);

  const handleCommitSlot = (slotId: string) => {
    setSlots((prev) =>
      prev.map((s) => (s.id === slotId ? { ...s, committedBy: user?.firstName || "You", isMine: true } : s))
    );
    setTotalHours((prev) => prev + 1);
  };

  const startSession = () => {
    setActiveTimer(300);
    setTimerLeft(300);
    setCompletedPrayer(false);
  };

  const handleCompleteSession = () => {
    setActiveTimer(null);
    setCompletedPrayer(true);

    const xpAmount = 25;
    const reason = "Completed 5-Min Intercession Chain Prayer";

    if (typeof window !== "undefined" && !navigator.onLine) {
      queueOfflineXP(xpAmount, reason);
    } else {
      awardXP(xpAmount, reason).then((res) => {
        if (res?.success && res.xp && user) {
          setUser({ ...user, xp: res.xp, level: res.level });
        }
      }).catch(() => {
        queueOfflineXP(xpAmount, reason);
      });
    }
  };

  const formatTimer = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, "0")}:${secs.toString().padStart(2, "0")}`;
  };

  return (
    <div className="flex-1 flex flex-col bg-background min-h-screen pb-24">
      {/* Header */}
      <div className="relative overflow-hidden px-5 pt-8 pb-8 bg-gradient-to-br from-purple-950 via-indigo-950 to-slate-900 border-b border-border/40 text-white">
        <div className="flex items-center justify-between mb-4 relative z-10">
          <Link href="/" className="w-9 h-9 rounded-xl bg-white/10 flex items-center justify-center text-white hover:bg-white/20 transition">
            <ArrowLeft className="w-5 h-5" />
          </Link>
          <span className="text-[10px] font-bold uppercase tracking-widest text-purple-300 bg-purple-400/10 px-3 py-1 rounded-full border border-purple-400/20">
            24/7 Prayer Ring
          </span>
        </div>

        <div className="relative z-10 space-y-2">
          <div className="flex items-center gap-2">
            <Heart className="w-6 h-6 text-purple-400 fill-purple-400" />
            <h1 className="text-2xl font-bold font-serif">Youth Intercession Chain</h1>
          </div>
          <p className="text-xs text-purple-200/80 max-w-md leading-relaxed">
            Uniting Jacobite youth in continuous daily intercession. Commit to a 5-minute prayer slot.
          </p>

          <div className="pt-2 flex items-center gap-4 text-xs font-semibold">
            <div className="flex items-center gap-1.5 bg-white/10 px-3 py-1.5 rounded-xl backdrop-blur-sm border border-white/10">
              <Users className="w-4 h-4 text-purple-300" />
              <span>{totalHours} Total Hours Prayed</span>
            </div>
          </div>
        </div>
      </div>

      <div className="px-4 py-6 space-y-6 max-w-xl mx-auto w-full">
        {/* Active Timer Card */}
        <div className="bg-card border border-border/60 rounded-3xl p-6 shadow-xl text-center space-y-4 relative overflow-hidden">
          <h2 className="text-sm font-bold uppercase tracking-wider text-muted-foreground">5-Minute Guided Prayer Ring</h2>

          {activeTimer !== null ? (
            <div className="space-y-4 py-2">
              <div className="w-32 h-32 rounded-full border-4 border-purple-500/40 border-t-purple-500 flex items-center justify-center mx-auto animate-spin-slow">
                <span className="text-3xl font-bold font-mono text-foreground">{formatTimer(timerLeft)}</span>
              </div>
              <p className="text-xs text-muted-foreground font-serif italic">
                "Keep vigil with Me one hour." — Matthew 26:40
              </p>
              <Button onClick={handleCompleteSession} variant="outline" className="text-xs font-bold border-purple-500/30">
                Finish Early & Collect +25 XP
              </Button>
            </div>
          ) : completedPrayer ? (
            <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} className="py-4 space-y-3">
              <CheckCircle2 className="w-12 h-12 text-emerald-500 mx-auto" />
              <h3 className="text-base font-bold font-serif text-foreground">Prayer Session Complete!</h3>
              <p className="text-xs text-emerald-600 dark:text-emerald-400 font-semibold">+25 Grace Points Awarded!</p>
              <Button onClick={startSession} variant="outline" size="sm" className="text-xs font-bold">
                Start Another 5-Min Slot
              </Button>
            </motion.div>
          ) : (
            <div className="space-y-3 py-2">
              <p className="text-xs text-muted-foreground max-w-sm mx-auto">
                Tap below to begin a live 5-minute intercession session for your parish intentions.
              </p>
              <Button onClick={startSession} className="gradient-gold text-white font-bold h-12 px-8 rounded-2xl shadow-lg halo-glow">
                <Play className="w-4 h-4 mr-2 fill-white" /> Start 5-Min Intercession
              </Button>
            </div>
          )}
        </div>

        {/* Prayer Slots List */}
        <div className="space-y-3">
          <h3 className="text-xs font-bold uppercase tracking-wider text-muted-foreground flex items-center gap-1.5">
            <Clock className="w-4 h-4 text-purple-500" /> Daily Intercession Ring Slots
          </h3>

          <div className="space-y-2">
            {slots.map((s) => (
              <div
                key={s.id}
                className={`p-3.5 rounded-2xl border flex items-center justify-between transition-all ${
                  s.isMine
                    ? "bg-purple-500/10 border-purple-500/40 text-purple-300"
                    : "bg-card border-border/60 hover:border-border"
                }`}
              >
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-xl bg-purple-500/10 flex items-center justify-center text-purple-500 text-xs font-bold">
                    <Clock className="w-4 h-4" />
                  </div>
                  <div>
                    <p className="text-xs font-bold text-foreground">{s.timeRange}</p>
                    <p className="text-[10px] text-muted-foreground">Committed by: {s.committedBy}</p>
                  </div>
                </div>

                {s.isMine ? (
                  <span className="text-xs font-bold text-purple-500 flex items-center gap-1">
                    <CheckCircle2 className="w-4 h-4" /> Committed
                  </span>
                ) : (
                  <Button
                    onClick={() => handleCommitSlot(s.id)}
                    variant="outline"
                    size="sm"
                    className="text-xs font-bold rounded-xl border-purple-500/30 hover:bg-purple-500/10"
                  >
                    Commit
                  </Button>
                )}
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
