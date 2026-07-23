"use client";
import Image from 'next/image';
import { useState } from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { CheckCircle2, Clock, Send, PenTool } from "lucide-react";
import { motion } from "framer-motion";
import { cn } from "@/lib/utils";
import { Textarea } from "@/components/ui/textarea";

const tabs = ["Active", "Completed", "All"];


const typeLabel: Record<string, string> = {
  daily: "Daily",
  weekly: "Weekly",
  seasonal: "Seasonal",
};

import { completeMission, getMissions } from "./actions";
import { useEffect } from "react";
import { useAuth } from "@/context/AuthContext";

export default function MissionsPage() {
  const [activeTab, setActiveTab] = useState("Active");
  const [missions, setMissions] = useState<{ id: string, title: string, description: string, xpReward: number }[]>([]);
  const [completed, setCompleted] = useState<string[]>([]);
  const [loading, setLoading] = useState<Record<string, boolean>>({});
  const [errorMsg, setErrorMsg] = useState<Record<string, string>>({});
  const [selectedMission, setSelectedMission] = useState<string | null>(null);
  const [reflection, setReflection] = useState("");
  const { user, refreshUser } = useAuth();

  useEffect(() => {
    getMissions().then(data => {
      setMissions(data.missions);
      
      // Load local completions to verify
      const localSaved = localStorage.getItem("ignite_completed_missions");
      let localIds: string[] = [];
      if (localSaved) {
        try {
          const parsed = JSON.parse(localSaved);
          const todayStr = new Date().toDateString();
          if (parsed.date === todayStr) {
            localIds = parsed.ids || [];
          } else {
            localStorage.removeItem("ignite_completed_missions");
          }
        } catch (e) {
          console.error(e);
        }
      }
      
      const merged = Array.from(new Set([...data.completedIds, ...localIds]));
      setCompleted(merged);
    });
  }, []);

  const toggle = async (id: string, xpReward: number, title: string) => {
    if (completed.includes(id) || !reflection.trim()) return;
    setLoading(prev => ({ ...prev, [id]: true }));
    setErrorMsg(prev => ({ ...prev, [id]: "" }));
    
    // We append the reflection to the title so it gets recorded in the XP log
    const shortReflect = reflection.substring(0, 30) + (reflection.length > 30 ? "..." : "");
    const res = await completeMission(id, xpReward, `${title} - "${shortReflect}"`, reflection);
    
    setLoading(prev => ({ ...prev, [id]: false }));
    
    if (res.error) {
      setErrorMsg(prev => ({ ...prev, [id]: res.error || "Failed to submit" }));
    } else {
      const todayStr = new Date().toDateString();
      const updatedCompleted = [...completed, id];
      setCompleted(updatedCompleted);
      
      // Save locally
      localStorage.setItem("ignite_completed_missions", JSON.stringify({
        date: todayStr,
        ids: updatedCompleted
      }));
      
      setSelectedMission(null);
      setReflection("");
      refreshUser(); // Sync points across app
    }
  };

  return (
    <div className="flex-1 overflow-y-auto">

      {/* ── Header ── */}
      <div className="relative overflow-hidden px-5 pt-8 pb-10 gradient-crimson">
        <div className="absolute inset-0 bg-[url('/header-image.png')] bg-cover bg-center opacity-40 mix-blend-overlay" />
        <div className="absolute right-4 sm:right-8 top-1/2 -translate-y-1/2 z-0 pointer-events-none flex flex-col items-center">
          <Image src="/header-image.png" width={400} height={200} priority className="h-16 sm:h-24 w-auto rounded-2xl shadow-2xl border-[3px] border-white/20 opacity-95 object-contain rotate-3 drop-shadow-xl mb-2 sm:mb-3" alt="Church emblem" />
          <div className="flex flex-col items-center text-center opacity-90 rotate-1">
            <span className="text-[6px] sm:text-[8px] font-extrabold text-white uppercase tracking-widest font-serif leading-tight text-shadow-sm">St. Gregorios Jacobite<br/>Syrian Orthodox Church</span>
            <span className="text-[5px] sm:text-[6px] text-white/80 uppercase tracking-widest mt-0.5 font-semibold text-shadow-sm">Hosa Road - Bangalore</span>
          </div>
        </div>
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
              <span className="text-white text-xs font-semibold">{user?.xp || 0} Total GP</span>
            </div>
            <div className="flex items-center gap-1.5 bg-white/15 backdrop-blur-sm rounded-full px-3 py-1.5 border border-white/20">
              <span>👑</span>
              <span className="text-white text-xs font-semibold">{completed.length} Completed</span>
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
                "flex-1 py-2 text-sm font-semibold rounded-lg transition duration-200",
                activeTab === tab ? "bg-card text-primary shadow-sm" : "text-muted-foreground hover:text-foreground"
              )}
            >
              {tab}
            </button>
          ))}
        </div>

        {/* Mission Cards */}
        <div className="space-y-4">
          {missions.filter(m => {
            if (activeTab === "Active") return !completed.includes(m.id);
            if (activeTab === "Completed") return completed.includes(m.id);
            return true;
          }).map((m, i) => {
            const done = completed.includes(m.id);
            return (
              <motion.div
                key={m.id}
                initial={{ opacity: 0, y: 16 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.07 }}
                className={cn(
                  "rounded-2xl overflow-hidden border card-holy-hover transition card-holy",
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

                <div className="px-5 py-4 bg-card space-y-3">
                  <p className="text-sm text-muted-foreground leading-relaxed">{m.description}</p>
                  
                  {done ? (
                    <Button
                      disabled
                      className="w-full h-10 rounded-xl font-bold transition bg-green-50 dark:bg-green-900/20 text-green-700 dark:text-green-400 border border-green-200 dark:border-green-800"
                      variant="outline"
                    >
                      <CheckCircle2 className="w-4 h-4 mr-2" />
                      ✓ Mission Complete — Deo Gratias!
                    </Button>
                  ) : selectedMission === m.id ? (
                    <div className="space-y-3 mt-4 pt-4 border-t border-border/50">
                      <p className="text-xs font-bold text-foreground">Reflection</p>
                      <Textarea 
                        placeholder="How did you complete this mission today? Share a brief note or thought."
                        value={reflection}
                        onChange={(e) => setReflection(e.target.value)}
                        className="bg-slate-50 dark:bg-slate-900 border-border/60 min-h-[80px]"
                      />
                      {errorMsg[m.id] && (
                        <p className="text-xs text-red-500 font-medium">⚠️ {errorMsg[m.id]}</p>
                      )}
                      <div className="flex gap-2">
                        <Button 
                          variant="outline" 
                          onClick={() => setSelectedMission(null)}
                          className="flex-1 rounded-xl"
                        >
                          Cancel
                        </Button>
                        <Button 
                          onClick={() => toggle(m.id, m.xpReward, m.title)}
                          disabled={loading[m.id] || reflection.trim().length < 5}
                          className="flex-1 rounded-xl gradient-gold text-white font-bold"
                        >
                          {loading[m.id] ? "Submitting..." : (
                            <>
                              <Send className="w-4 h-4 mr-2" /> Submit
                            </>
                          )}
                        </Button>
                      </div>
                    </div>
                  ) : (
                    <Button
                      onClick={() => setSelectedMission(m.id)}
                      className="w-full h-10 rounded-xl font-bold transition gradient-gold text-white shadow-md"
                    >
                      <PenTool className="w-4 h-4 mr-2" />
                      Write Reflection to Complete
                    </Button>
                  )}
                </div>
              </motion.div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
