"use client";
import Image from 'next/image';
import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import { getLeaderboardUsers, getParishLeaderboard } from "./actions";
import { useAuth } from "@/context/AuthContext";
import { Users, Church } from "lucide-react";

interface LeaderboardUser {
  id: string;
  name: string;
  xp: number;
  rank: number;
  level: number;
  initials: string;
}

export default function LeaderboardPage() {
  const [leaderboard, setLeaderboard] = useState<LeaderboardUser[]>([]);
  const [parishLeaderboard, setParishLeaderboard] = useState<any[]>([]);
  const [activeTab, setActiveTab] = useState<"individuals" | "parishes">("individuals");
  const [timeframe, setTimeframe] = useState<"all-time" | "weekly" | "seasonal">("all-time");
  const [isLoading, setIsLoading] = useState(true);
  const { user } = useAuth();

  useEffect(() => {
    const load = async () => {
      setIsLoading(true);
      const data = await getLeaderboardUsers(timeframe);
      setLeaderboard(data);
      const parishData = await getParishLeaderboard(timeframe);
      setParishLeaderboard(parishData);
      setIsLoading(false);
    };
    load();
  }, [timeframe]);

  return (
    <div className="flex-1 overflow-y-auto">
      {/* ── Header ── */}
      <div className="relative overflow-hidden px-5 pt-8 pb-12 gradient-gold">
        <div className="absolute inset-0 bg-[url('/header-image.png')] bg-cover bg-center opacity-40 mix-blend-overlay" />
        <div className="absolute right-4 sm:right-8 top-1/2 -translate-y-1/2 z-0 pointer-events-none flex flex-col items-center">
          <Image src="/header-image.png" width={400} height={200} priority className="h-16 sm:h-24 w-auto rounded-2xl shadow-2xl border-[3px] border-white/20 opacity-95 object-contain rotate-3 drop-shadow-xl mb-2 sm:mb-3" alt="Church emblem" />
          <div className="flex flex-col items-center text-center opacity-90 rotate-1">
            <span className="text-[6px] sm:text-[8px] font-extrabold text-white uppercase tracking-widest font-serif leading-tight text-shadow-sm">St. Gregorios Jacobite<br/>Syrian Orthodox Church</span>
            <span className="text-[5px] sm:text-[6px] text-white/80 uppercase tracking-widest mt-0.5 font-semibold text-shadow-sm">Hosa Road - Bangalore</span>
          </div>
        </div>
        <div className="relative z-10">
          <div className="flex items-center gap-3 mb-2">
            <div className="w-10 h-10 rounded-xl bg-white/20 backdrop-blur-sm flex items-center justify-center text-xl shadow-inner">🏆</div>
            <div>
              <h1 className="text-2xl font-extrabold text-white font-serif">Leaderboard</h1>
              <p className="text-amber-100 text-xs font-bold uppercase tracking-wider">Community Grace Points</p>
            </div>
          </div>
          <p className="text-amber-50 text-sm mt-2 italic font-serif">
            "Let us run with endurance the race that is set before us." &mdash; Hebrews 12:1
          </p>

          <div className="flex flex-col gap-2 mt-4">
            {/* Timeframe Selector */}
            <div className="flex gap-1 bg-white/10 p-1 rounded-xl w-fit backdrop-blur-sm">
              {(["all-time", "weekly", "seasonal"] as const).map((tf) => (
                <button
                  key={tf}
                  onClick={() => setTimeframe(tf)}
                  className={cn(
                    "px-3 py-1.5 rounded-lg text-xs font-bold transition-colors capitalize",
                    timeframe === tf ? "bg-white text-amber-700 shadow-sm" : "text-amber-100 hover:text-white"
                  )}
                >
                  {tf === "seasonal" ? "Great Lent" : tf.replace("-", " ")}
                </button>
              ))}
            </div>

            {/* Type Selector */}
            <div className="flex gap-1 bg-white/10 p-1 rounded-xl w-fit backdrop-blur-sm">
              <button 
                onClick={() => setActiveTab("individuals")}
                className={cn("px-4 py-2 rounded-lg text-sm font-bold transition-colors flex items-center gap-2", activeTab === "individuals" ? "bg-white text-amber-700 shadow-sm" : "text-amber-100 hover:text-white")}
              >
                <Users className="w-4 h-4" /> Individuals
              </button>
              <button 
                onClick={() => setActiveTab("parishes")}
                className={cn("px-4 py-2 rounded-lg text-sm font-bold transition-colors flex items-center gap-2", activeTab === "parishes" ? "bg-white text-amber-700 shadow-sm" : "text-amber-100 hover:text-white")}
              >
                <Church className="w-4 h-4" /> Parishes
              </button>
            </div>
          </div>
        </div>
      </div>

      <div className="px-4 -mt-6 pb-8 space-y-3 relative z-20">
        {isLoading ? (
          <div className="flex flex-col items-center justify-center py-20 text-muted-foreground">
            <motion.div animate={{ rotate: 360 }} transition={{ duration: 2, repeat: Infinity, ease: "linear" }} className="w-8 h-8 border-4 border-amber-500/30 border-t-amber-500 rounded-full mb-4" />
            <p className="font-serif font-semibold">Loading Standings...</p>
          </div>
        ) : (activeTab === "individuals" ? leaderboard : parishLeaderboard).length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20 text-muted-foreground">
            <p className="font-serif font-semibold">No standings yet.</p>
          </div>
        ) : activeTab === "individuals" ? (
          <>
            {/* Top 3 Podium */}
            <div className="flex items-end justify-center gap-3 mb-6 pt-4">
              {/* 2nd Place */}
              {leaderboard[1] && (
                <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }} className="flex flex-col items-center w-24">
                  <div className="w-14 h-14 rounded-full bg-slate-200 border-4 border-white dark:border-[#0f1229] shadow-xl flex items-center justify-center text-xl font-bold text-slate-500 z-10">🥈</div>
                  <div className="w-full h-24 bg-gradient-to-t from-slate-200 to-slate-100 rounded-t-xl border border-slate-300 flex flex-col items-center justify-end pb-2">
                    <p className="text-[10px] font-bold text-slate-600 truncate w-full text-center px-2">{leaderboard[1].name}</p>
                    <p className="text-xs font-extrabold text-slate-800">{leaderboard[1].xp}</p>
                  </div>
                </motion.div>
              )}

              {/* 1st Place */}
              {leaderboard[0] && (
                <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="flex flex-col items-center w-28">
                  <div className="w-16 h-16 rounded-full bg-amber-400 border-4 border-white dark:border-[#0f1229] shadow-2xl flex items-center justify-center text-2xl font-bold text-amber-700 z-10 halo-glow">👑</div>
                  <div className="w-full h-32 bg-gradient-to-t from-amber-300 to-amber-200 rounded-t-xl border border-amber-400 flex flex-col items-center justify-end pb-3 shadow-lg">
                    <p className="text-xs font-bold text-amber-800 truncate w-full text-center px-2">{leaderboard[0].name}</p>
                    <p className="text-sm font-extrabold text-amber-950">{leaderboard[0].xp}</p>
                  </div>
                </motion.div>
              )}

              {/* 3rd Place */}
              {leaderboard[2] && (
                <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }} className="flex flex-col items-center w-24">
                  <div className="w-14 h-14 rounded-full bg-orange-200 border-4 border-white dark:border-[#0f1229] shadow-xl flex items-center justify-center text-xl font-bold text-orange-600 z-10">🥉</div>
                  <div className="w-full h-20 bg-gradient-to-t from-orange-200 to-orange-100 rounded-t-xl border border-orange-300 flex flex-col items-center justify-end pb-2">
                    <p className="text-[10px] font-bold text-orange-700 truncate w-full text-center px-2">{leaderboard[2].name}</p>
                    <p className="text-xs font-extrabold text-orange-900">{leaderboard[2].xp}</p>
                  </div>
                </motion.div>
              )}
            </div>

            {/* List */}
            <div className="bg-card rounded-2xl border border-border/60 card-holy overflow-hidden">
              <div className="px-4 py-3 border-b border-border/40 bg-muted/30 flex items-center justify-between">
                <p className="text-xs font-bold text-muted-foreground uppercase tracking-widest">Global Rank</p>
                <p className="text-xs font-bold text-muted-foreground uppercase tracking-widest">Grace Points</p>
              </div>
              <div className="divide-y divide-border/40">
                {leaderboard.slice(3).map((lUser, i) => {
                  const isMe = lUser.id === user?.id;
                  return (
                  <motion.div
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: i * 0.05 + 0.3 }}
                    key={lUser.id}
                    className={cn(
                      "flex items-center justify-between p-4",
                      isMe ? "bg-amber-50/50 dark:bg-amber-900/10" : ""
                    )}
                  >
                    <div className="flex items-center gap-4">
                      <div className={cn(
                        "w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold font-serif shadow-sm",
                        isMe ? "gradient-gold text-white" : "bg-muted text-muted-foreground"
                      )}>
                        #{lUser.rank}
                      </div>
                      <p className={cn("text-sm font-bold", isMe ? "text-amber-700 dark:text-amber-400" : "text-foreground")}>
                        {isMe ? "You" : lUser.name}
                      </p>
                    </div>
                    <Badge className={cn("border-0", isMe ? "bg-amber-100 text-amber-800 dark:bg-amber-900/40 dark:text-amber-300" : "bg-muted text-muted-foreground")}>
                      {lUser.xp} XP
                    </Badge>
                  </motion.div>
                )})}
              </div>
            </div>
          </>
        ) : (
          <>
            {/* Parishes Podium */}
            <div className="flex items-end justify-center gap-3 mb-6 pt-4">
              {/* 2nd Place */}
              {parishLeaderboard[1] && (
                <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }} className="flex flex-col items-center w-24">
                  <div className="w-14 h-14 rounded-full bg-slate-200 border-4 border-white dark:border-[#0f1229] shadow-xl flex items-center justify-center text-xl font-bold text-slate-500 z-10">🥈</div>
                  <div className="w-full h-24 bg-gradient-to-t from-slate-200 to-slate-100 rounded-t-xl border border-slate-300 flex flex-col items-center justify-end pb-2">
                    <p className="text-[10px] font-bold text-slate-600 truncate w-full text-center px-2">{parishLeaderboard[1].name}</p>
                    <p className="text-xs font-extrabold text-slate-800">{parishLeaderboard[1].xp}</p>
                  </div>
                </motion.div>
              )}

              {/* 1st Place */}
              {parishLeaderboard[0] && (
                <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="flex flex-col items-center w-28">
                  <div className="w-16 h-16 rounded-full bg-amber-400 border-4 border-white dark:border-[#0f1229] shadow-2xl flex items-center justify-center text-2xl font-bold text-amber-700 z-10 halo-glow">👑</div>
                  <div className="w-full h-32 bg-gradient-to-t from-amber-300 to-amber-200 rounded-t-xl border border-amber-400 flex flex-col items-center justify-end pb-3 shadow-lg">
                    <p className="text-xs font-bold text-amber-800 truncate w-full text-center px-2">{parishLeaderboard[0].name}</p>
                    <p className="text-sm font-extrabold text-amber-950">{parishLeaderboard[0].xp}</p>
                  </div>
                </motion.div>
              )}

              {/* 3rd Place */}
              {parishLeaderboard[2] && (
                <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }} className="flex flex-col items-center w-24">
                  <div className="w-14 h-14 rounded-full bg-orange-200 border-4 border-white dark:border-[#0f1229] shadow-xl flex items-center justify-center text-xl font-bold text-orange-600 z-10">🥉</div>
                  <div className="w-full h-20 bg-gradient-to-t from-orange-200 to-orange-100 rounded-t-xl border border-orange-300 flex flex-col items-center justify-end pb-2">
                    <p className="text-[10px] font-bold text-orange-700 truncate w-full text-center px-2">{parishLeaderboard[2].name}</p>
                    <p className="text-xs font-extrabold text-orange-900">{parishLeaderboard[2].xp}</p>
                  </div>
                </motion.div>
              )}
            </div>

            {/* List */}
            <div className="bg-card rounded-2xl border border-border/60 card-holy overflow-hidden">
              <div className="px-4 py-3 border-b border-border/40 bg-muted/30 flex items-center justify-between">
                <p className="text-xs font-bold text-muted-foreground uppercase tracking-widest">Global Rank</p>
                <p className="text-xs font-bold text-muted-foreground uppercase tracking-widest">Parish XP</p>
              </div>
              <div className="divide-y divide-border/40">
                {parishLeaderboard.slice(3).map((lChurch, i) => {
                  const isMyChurch = user?.churchId === lChurch.id;
                  return (
                  <motion.div
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: i * 0.05 + 0.3 }}
                    key={lChurch.id}
                    className={cn(
                      "flex items-center justify-between p-4",
                      isMyChurch ? "bg-amber-50/50 dark:bg-amber-900/10" : ""
                    )}
                  >
                    <div className="flex items-center gap-4">
                      <div className={cn(
                        "w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold font-serif shadow-sm",
                        isMyChurch ? "gradient-gold text-white" : "bg-muted text-muted-foreground"
                      )}>
                        #{lChurch.rank}
                      </div>
                      <p className={cn("text-sm font-bold", isMyChurch ? "text-amber-700 dark:text-amber-400" : "text-foreground")}>
                        {lChurch.name} {isMyChurch && "(Yours)"}
                      </p>
                    </div>
                    <Badge className={cn("border-0", isMyChurch ? "bg-amber-100 text-amber-800 dark:bg-amber-900/40 dark:text-amber-300" : "bg-muted text-muted-foreground")}>
                      {lChurch.xp} XP
                    </Badge>
                  </motion.div>
                )})}
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
