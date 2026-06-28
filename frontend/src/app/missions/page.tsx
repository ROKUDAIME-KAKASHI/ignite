"use client";

import { useState } from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { CheckCircle2, Clock } from "lucide-react";
import { motion } from "framer-motion";
import { cn } from "@/lib/utils";

const tabs = ["Active", "Completed", "All"];


const typeLabel: Record<string, string> = {
  daily: "Daily",
  weekly: "Weekly",
  seasonal: "Seasonal",
};

import { completeMission, getMissions } from "./actions";
import { useEffect } from "react";

export default function MissionsPage() {
  const [activeTab, setActiveTab] = useState("Active");
  const [missions, setMissions] = useState<{ id: string, title: string, description: string, xpReward: number }[]>([]);
  const [completed, setCompleted] = useState<string[]>([]);
  const [loading, setLoading] = useState<Record<string, boolean>>({});

  useEffect(() => {
    getMissions().then(data => {
      setMissions(data.missions);
      setCompleted(data.completedIds);
    });
  }, []);

  const toggle = async (id: string, xpReward: number, title: string) => {
    if (completed.includes(id)) return;
    setLoading(prev => ({ ...prev, [id]: true }));
    await completeMission(id, xpReward, title);
    setCompleted((p) => [...p, id]);
    setLoading(prev => ({ ...prev, [id]: false }));
  };

  return (
    <div className="flex-1 overflow-y-auto">

      {/* ── Header ── */}
      <div className="relative overflow-hidden px-5 pt-8 pb-10 gradient-crimson">
        <svg viewBox="0 0 200 200" className="absolute right-0 top-0 w-48 h-48 opacity-10 text-white" fill="none" stroke="currentColor" strokeWidth="6">
          <line x1="100" y1="10" x2="100" y2="190" /><line x1="20" y1="70" x2="180" y2="70" />
        </svg>
        <div className="absolute -bottom-6 -left-6 w-36 h-36 rounded-full bg-white/10 blur-2xl" />
        <div className="relative z-10">
          <div className="flex items-center gap-3 mb-2">
            <div className="w-10 h-10 rounded-xl bg-white/20 backdrop-blur-sm flex items-center justify-center text-2xl">⚔️</div>
            <div>
              <h1 className="text-2xl font-extrabold text-white font-serif">Missions</h1>
              <p className="text-red-200 text-xs font-semibold uppercase tracking-wider">Works of Mercy</p>
            </div>
          </div>
          <p className="text-red-100/80 text-sm italic font-serif mt-2">
            "Put on the full armor of God." — Ephesians 6:11
          </p>
          <div className="flex items-center gap-2 mt-4 flex-wrap">
            <div className="flex items-center gap-1.5 bg-white/15 backdrop-blur-sm rounded-full px-3 py-1.5 border border-white/20">
              <span>✝️</span>
              <span className="text-white text-xs font-semibold">0 / 730 GP earned today</span>
            </div>
            <div className="flex items-center gap-1.5 bg-white/15 backdrop-blur-sm rounded-full px-3 py-1.5 border border-white/20">
              <span>👑</span>
              <span className="text-white text-xs font-semibold">23 Completed</span>
            </div>
          </div>
        </div>
      </div>

      <div className="px-4 pt-4 pb-8 space-y-4">
        {/* Tabs */}
        <div className="flex gap-1 bg-muted rounded-xl p-1">
          {tabs.map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={cn(
                "flex-1 py-2 text-sm font-semibold rounded-lg transition-all duration-200",
                activeTab === tab ? "bg-card text-primary shadow-sm" : "text-muted-foreground hover:text-foreground"
              )}
            >
              {tab}
            </button>
          ))}
        </div>

        {/* Mission Cards */}
        <div className="space-y-4">
          {missions.map((m, i) => {
            const done = completed.includes(m.id);
            return (
              <motion.div
                key={m.id}
                initial={{ opacity: 0, y: 16 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.07 }}
                className={cn(
                  "rounded-2xl overflow-hidden border card-holy-hover transition-all card-holy",
                  done ? "opacity-70 border-amber-200/50" : "border-amber-200/50"
                )}
              >
                {/* Card header */}
                <div className={`bg-gradient-to-r from-amber-600/10 to-yellow-500/8 dark:from-amber-600/20 dark:to-yellow-500/15 px-4 pt-4 pb-3 border-b border-amber-200/50 dark:border-amber-800/30`}>
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex items-start gap-3">
                      <span className="text-3xl leading-none mt-0.5">⚔️</span>
                      <div>
                        <div className="flex items-center gap-2 flex-wrap mb-0.5">
                          <p className="font-bold text-foreground font-serif">{m.title}</p>
                          <Badge className="text-[10px] border-0 px-2 py-0.5 bg-amber-100 text-amber-800 dark:bg-amber-900/30 dark:text-amber-300">
                            Daily
                          </Badge>
                        </div>
                        <p className="text-xs text-muted-foreground italic">Mission</p>
                        <div className="flex items-center gap-1.5 mt-1 text-xs text-muted-foreground">
                          <Clock className="w-3 h-3" />
                          <span>14h remaining</span>
                        </div>
                      </div>
                    </div>
                    <div className="shrink-0 text-right">
                      <p className="text-lg font-extrabold text-foreground">+{m.xpReward}</p>
                      <p className="text-[10px] font-bold text-amber-600 dark:text-amber-400">Grace Pts</p>
                    </div>
                  </div>
                </div>

                {/* Card body */}
                <div className="px-5 py-4 bg-card space-y-3">
                  <p className="text-sm text-muted-foreground leading-relaxed">{m.description}</p>
                  <Button
                    onClick={() => toggle(m.id, m.xpReward, m.title)}
                    disabled={loading[m.id] || done}
                    className={cn(
                      "w-full h-10 rounded-xl font-bold transition-all",
                      done
                        ? "bg-green-50 dark:bg-green-900/20 text-green-700 dark:text-green-400 border border-green-200 dark:border-green-800"
                        : "gradient-gold text-white shadow-md"
                    )}
                    variant={done ? "outline" : "default"}
                  >
                    <CheckCircle2 className="w-4 h-4 mr-2" />
                    {loading[m.id] ? "Completing..." : done ? "✓ Mission Complete — Deo Gratias!" : "Mark as Complete"}
                  </Button>
                </div>
              </motion.div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
