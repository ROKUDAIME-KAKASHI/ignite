"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Heart, Clock, Users, Play, CheckCircle2, Sparkles, Shield, ArrowLeft, Loader2, BookOpen } from "lucide-react";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { useAuth } from "@/context/AuthContext";
import { awardXP } from "@/app/actions/gamification";
import { queueOfflineXP } from "@/lib/offlineSync";
import { getApprovedPrayers, incrementPrayerCount } from "../prayer/actions";

interface RealPrayerRequest {
  id: string;
  text: string;
  author: string;
  anonymous: boolean;
  prayers: number;
  prayed: boolean;
  category: string;
  time: string;
}

export default function IntercessionChainPage() {
  const { user, setUser } = useAuth();
  const [prayers, setPrayers] = useState<RealPrayerRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedPrayer, setSelectedPrayer] = useState<RealPrayerRequest | null>(null);
  
  const [activeTimer, setActiveTimer] = useState<number | null>(null);
  const [timerLeft, setTimerLeft] = useState(300); // 5 minutes = 300 seconds
  const [completedPrayer, setCompletedPrayer] = useState(false);
  const [totalIntercessions, setTotalIntercessions] = useState(0);

  // Load real prayer requests from the Prayer Dashboard / Wall
  const loadRealPrayers = async () => {
    setLoading(true);
    try {
      if (typeof window !== "undefined" && !navigator.onLine) {
        const cached = localStorage.getItem("ignite_cached_public_prayers");
        if (cached) {
          const parsed = JSON.parse(cached);
          setPrayers(parsed);
          setTotalIntercessions(parsed.reduce((acc: number, p: any) => acc + (p.prayers || 0), 0));
        }
      } else {
        const data = await getApprovedPrayers();
        if (data && data.length > 0) {
          setPrayers(data);
          setTotalIntercessions(data.reduce((acc, p) => acc + p.prayers, 0));
          try {
            localStorage.setItem("ignite_cached_public_prayers", JSON.stringify(data));
          } catch {}
        }
      }
    } catch (e) {
      console.error("Failed to load prayers:", e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadRealPrayers();
  }, []);

  // Timer countdown
  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (activeTimer !== null && timerLeft > 0) {
      interval = setInterval(() => {
        setTimerLeft((prev) => prev - 1);
      }, 1000);
    } else if (activeTimer !== null && timerLeft === 0) {
      handleCompleteSession();
    }
    return () => clearInterval(interval);
  }, [activeTimer, timerLeft]);

  const handleJoinRing = async (prayer: RealPrayerRequest) => {
    setSelectedPrayer(prayer);
    setActiveTimer(300);
    setTimerLeft(300);
    setCompletedPrayer(false);

    // Optimistically update prayer count globally
    setPrayers((prev) =>
      prev.map((p) => (p.id === prayer.id ? { ...p, prayers: p.prayers + 1, prayed: true } : p))
    );
    setTotalIntercessions((prev) => prev + 1);

    if (typeof window !== "undefined" && !navigator.onLine) {
      queueOfflineXP(25, `Joined Intercession Ring for: ${prayer.text.substring(0, 30)}...`);
    } else {
      try {
        await incrementPrayerCount(prayer.id);
      } catch {
        queueOfflineXP(25, `Joined Intercession Ring for: ${prayer.text.substring(0, 30)}...`);
      }
    }
  };

  const handleCompleteSession = () => {
    setActiveTimer(null);
    setCompletedPrayer(true);

    const xpAmount = 25;
    const reason = "Completed 5-Min Intercession Ring Prayer";

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
            Global 24/7 Prayer Ring
          </span>
        </div>

        <div className="relative z-10 space-y-2">
          <div className="flex items-center gap-2">
            <Heart className="w-6 h-6 text-purple-400 fill-purple-400" />
            <h1 className="text-2xl font-bold font-serif">Youth Intercession Ring</h1>
          </div>
          <p className="text-xs text-purple-200/80 max-w-md leading-relaxed">
            Real prayer requests submitted by youth around the world. Join an open ring and pray together in 5-minute slots.
          </p>

          <div className="pt-2 flex items-center gap-4 text-xs font-semibold">
            <div className="flex items-center gap-1.5 bg-white/10 px-3 py-1.5 rounded-xl backdrop-blur-sm border border-white/10">
              <Users className="w-4 h-4 text-purple-300" />
              <span>{totalIntercessions} Global Intercessions Offered</span>
            </div>
          </div>
        </div>
      </div>

      <div className="px-4 py-6 space-y-6 max-w-xl mx-auto w-full">
        {/* Active Timer Card */}
        {activeTimer !== null && selectedPrayer ? (
          <div className="bg-gradient-to-br from-purple-950/40 via-card to-indigo-950/40 border border-purple-500/40 rounded-3xl p-6 shadow-2xl text-center space-y-4 relative overflow-hidden">
            <span className="text-[10px] font-bold uppercase tracking-wider text-purple-400 bg-purple-500/10 px-3 py-1 rounded-full">
              Active Intercession Ring
            </span>

            <div className="py-2 space-y-3">
              <p className="text-sm font-serif italic text-foreground max-w-md mx-auto">
                "{selectedPrayer.text}"
              </p>
              <p className="text-xs font-bold text-muted-foreground">— Requested by {selectedPrayer.author}</p>
            </div>

            <div className="w-32 h-32 rounded-full border-4 border-purple-500/40 border-t-purple-500 flex items-center justify-center mx-auto animate-spin-slow">
              <span className="text-3xl font-bold font-mono text-foreground">{formatTimer(timerLeft)}</span>
            </div>

            <p className="text-xs text-muted-foreground font-serif italic">
              "Where two or three gather in My name, there am I with them." — Matthew 18:20
            </p>

            <Button onClick={handleCompleteSession} variant="outline" className="text-xs font-bold border-purple-500/30">
              Finish Early & Collect +25 XP
            </Button>
          </div>
        ) : completedPrayer ? (
          <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} className="bg-card border border-emerald-500/30 rounded-3xl p-6 shadow-xl text-center space-y-3">
            <CheckCircle2 className="w-12 h-12 text-emerald-500 mx-auto" />
            <h3 className="text-base font-bold font-serif text-foreground">Prayer Session Complete!</h3>
            <p className="text-xs text-emerald-600 dark:text-emerald-400 font-semibold">+25 Grace Points Awarded to your profile!</p>
            <Button onClick={() => setCompletedPrayer(false)} variant="outline" size="sm" className="text-xs font-bold">
              Join Another Open Ring
            </Button>
          </motion.div>
        ) : null}

        {/* Global Open Prayer Rings */}
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <h3 className="text-xs font-bold uppercase tracking-wider text-muted-foreground flex items-center gap-1.5">
              <Heart className="w-4 h-4 text-purple-500 fill-purple-500" /> Open Global Prayer Rings ({prayers.length})
            </h3>
            <Link href="/prayer" className="text-xs font-bold text-purple-500 hover:underline">
              + Submit Prayer
            </Link>
          </div>

          {loading ? (
            <div className="py-12 text-center text-muted-foreground flex flex-col items-center bg-card rounded-2xl border border-dashed">
              <Loader2 className="w-6 h-6 animate-spin text-purple-500 mb-2" />
              <p className="text-xs">Connecting to global prayer rings...</p>
            </div>
          ) : prayers.length === 0 ? (
            <div className="py-12 text-center text-muted-foreground flex flex-col items-center bg-card rounded-2xl border border-dashed space-y-3">
              <Heart className="w-8 h-8 text-purple-400" />
              <p className="text-sm font-serif">No open prayer requests found.</p>
              <Link href="/prayer" className="text-xs font-bold text-purple-500 hover:underline">
                Submit the first prayer request on the Prayer Wall!
              </Link>
            </div>
          ) : (
            <div className="space-y-3">
              {prayers.map((p) => (
                <div
                  key={p.id}
                  className={`p-4 rounded-2xl border flex flex-col space-y-3 transition-all ${
                    p.prayed ? "bg-purple-500/10 border-purple-500/40" : "bg-card border-border/60 hover:border-purple-500/30"
                  }`}
                >
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex items-center gap-2">
                      <div className="w-7 h-7 rounded-lg bg-purple-500/10 flex items-center justify-center text-xs font-bold text-purple-400">
                        {p.anonymous ? "🙏" : p.author.charAt(0)}
                      </div>
                      <div>
                        <p className="text-xs font-bold text-foreground">{p.author}</p>
                        <p className="text-[10px] text-muted-foreground">{new Date(p.time).toLocaleDateString()}</p>
                      </div>
                    </div>
                    <span className="text-[10px] font-extrabold uppercase px-2.5 py-0.5 rounded-full bg-purple-500/10 text-purple-400 border border-purple-500/20">
                      {p.category}
                    </span>
                  </div>

                  <p className="text-sm font-serif italic text-foreground/90 leading-relaxed">
                    "{p.text}"
                  </p>

                  <div className="flex items-center justify-between pt-2 border-t border-border/40">
                    <div className="flex items-center gap-1.5 text-xs text-muted-foreground font-semibold">
                      <Users className="w-3.5 h-3.5 text-purple-400" />
                      <span>{p.prayers} Youth Prayed</span>
                    </div>

                    <Button
                      onClick={() => handleJoinRing(p)}
                      variant={p.prayed ? "outline" : "default"}
                      size="sm"
                      className={p.prayed ? "text-xs font-bold border-purple-500/40 text-purple-400" : "gradient-gold text-white text-xs font-bold shadow-md halo-glow"}
                    >
                      <Play className="w-3.5 h-3.5 mr-1 fill-current" />
                      {p.prayed ? "Pray Again" : "Join Ring & Pray"}
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
