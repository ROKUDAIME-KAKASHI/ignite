"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

interface LeaderboardUser {
  id: string;
  name: string;
  points: number;
  rank: number;
}

const DUMMY_LEADERBOARD: LeaderboardUser[] = [
  { id: "1", name: "David M.", points: 14500, rank: 1 },
  { id: "2", name: "Sarah J.", points: 12300, rank: 2 },
  { id: "3", name: "Michael T.", points: 11250, rank: 3 },
  { id: "4", name: "You", points: 8400, rank: 12 }, // The current user
  { id: "5", name: "Anna P.", points: 7900, rank: 13 },
  { id: "6", name: "John C.", points: 7650, rank: 14 },
];

export default function LeaderboardPage() {
  const [leaderboard, setLeaderboard] = useState<LeaderboardUser[]>([]);

  useEffect(() => {
    // In a real app, fetch from /api/gamification/leaderboard
    // For now, use dummy data with delay
    const load = async () => {
      await new Promise((r) => setTimeout(r, 600));
      setLeaderboard(DUMMY_LEADERBOARD);
    };
    void load();
  }, []);

  return (
    <div className="flex-1 overflow-y-auto">
      {/* ── Header ── */}
      <div className="relative overflow-hidden px-5 pt-8 pb-12 gradient-gold">
        <svg viewBox="0 0 200 200" className="absolute right-0 top-0 w-48 h-48 opacity-10 text-white" fill="none" stroke="currentColor" strokeWidth="6">
          <circle cx="100" cy="100" r="80" />
          <line x1="100" y1="20" x2="100" y2="180" /><line x1="20" y1="100" x2="180" y2="100" />
        </svg>
        <div className="relative z-10">
          <div className="flex items-center gap-3 mb-2">
            <div className="w-10 h-10 rounded-xl bg-white/20 backdrop-blur-sm flex items-center justify-center text-xl shadow-inner">🏆</div>
            <div>
              <h1 className="text-2xl font-extrabold text-white font-serif">Leaderboard</h1>
              <p className="text-amber-100 text-xs font-bold uppercase tracking-wider">Community Grace Points</p>
            </div>
          </div>
          <p className="text-amber-50 text-sm mt-2 italic font-serif">
            &quot;Let us run with endurance the race that is set before us.&quot; &mdash; Hebrews 12:1
          </p>
        </div>
      </div>

      <div className="px-4 -mt-6 pb-8 space-y-3">
        {leaderboard.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20 text-muted-foreground">
            <motion.div animate={{ rotate: 360 }} transition={{ duration: 2, repeat: Infinity, ease: "linear" }} className="w-8 h-8 border-4 border-amber-500/30 border-t-amber-500 rounded-full mb-4" />
            <p className="font-serif font-semibold">Loading Standings...</p>
          </div>
        ) : (
          <>
            {/* Top 3 Podium */}
            <div className="flex items-end justify-center gap-3 mb-6 pt-4">
              {/* 2nd Place */}
              <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }} className="flex flex-col items-center">
                <div className="w-14 h-14 rounded-full bg-slate-200 border-4 border-white shadow-xl flex items-center justify-center text-xl font-bold text-slate-500 z-10">🥈</div>
                <div className="w-20 h-24 bg-gradient-to-t from-slate-200 to-slate-100 rounded-t-xl border border-slate-300 flex flex-col items-center justify-end pb-2">
                  <p className="text-[10px] font-bold text-slate-500 truncate w-full text-center px-1">{leaderboard[1].name}</p>
                  <p className="text-xs font-extrabold text-slate-700">{leaderboard[1].points}</p>
                </div>
              </motion.div>

              {/* 1st Place */}
              <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="flex flex-col items-center">
                <div className="w-16 h-16 rounded-full bg-amber-400 border-4 border-white shadow-2xl flex items-center justify-center text-2xl font-bold text-amber-700 z-10 halo-glow">👑</div>
                <div className="w-24 h-32 bg-gradient-to-t from-amber-300 to-amber-200 rounded-t-xl border border-amber-400 flex flex-col items-center justify-end pb-3 shadow-lg">
                  <p className="text-xs font-bold text-amber-700 truncate w-full text-center px-1">{leaderboard[0].name}</p>
                  <p className="text-sm font-extrabold text-amber-900">{leaderboard[0].points}</p>
                </div>
              </motion.div>

              {/* 3rd Place */}
              <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }} className="flex flex-col items-center">
                <div className="w-14 h-14 rounded-full bg-orange-200 border-4 border-white shadow-xl flex items-center justify-center text-xl font-bold text-orange-600 z-10">🥉</div>
                <div className="w-20 h-20 bg-gradient-to-t from-orange-200 to-orange-100 rounded-t-xl border border-orange-300 flex flex-col items-center justify-end pb-2">
                  <p className="text-[10px] font-bold text-orange-600 truncate w-full text-center px-1">{leaderboard[2].name}</p>
                  <p className="text-xs font-extrabold text-orange-800">{leaderboard[2].points}</p>
                </div>
              </motion.div>
            </div>

            {/* List */}
            <div className="bg-card rounded-2xl border border-border/60 card-holy overflow-hidden">
              <div className="px-4 py-3 border-b border-border/40 bg-muted/30 flex items-center justify-between">
                <p className="text-xs font-bold text-muted-foreground uppercase tracking-widest">Global Rank</p>
                <p className="text-xs font-bold text-muted-foreground uppercase tracking-widest">Grace Points</p>
              </div>
              <div className="divide-y divide-border/40">
                {leaderboard.slice(3).map((user, i) => (
                  <motion.div
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: i * 0.05 + 0.3 }}
                    key={user.id}
                    className={cn(
                      "flex items-center justify-between p-4",
                      user.name === "You" ? "bg-amber-50/50 dark:bg-amber-900/10" : ""
                    )}
                  >
                    <div className="flex items-center gap-4">
                      <div className={cn(
                        "w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold font-serif shadow-sm",
                        user.name === "You" ? "gradient-gold text-white" : "bg-muted text-muted-foreground"
                      )}>
                        #{user.rank}
                      </div>
                      <p className={cn("text-sm font-bold", user.name === "You" ? "text-amber-700 dark:text-amber-400" : "text-foreground")}>
                        {user.name}
                      </p>
                    </div>
                    <Badge className={cn("border-0", user.name === "You" ? "bg-amber-100 text-amber-800 dark:bg-amber-900/40 dark:text-amber-300" : "bg-muted text-muted-foreground")}>
                      {user.points} XP
                    </Badge>
                  </motion.div>
                ))}
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
