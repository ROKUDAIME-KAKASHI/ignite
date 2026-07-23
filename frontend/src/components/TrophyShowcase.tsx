"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Trophy, Award, Lock, Sparkles, CheckCircle2, ChevronRight, X } from "lucide-react";
import confetti from "canvas-confetti";

export interface AwardItem {
  id: string;
  title: string;
  icon: string;
  maxLevel: number;
  tiers: number[];
  currentValue: number;
  currentLevel: number;
  nextTierValue: number;
  isMaxed: boolean;
}

const TIER_NAMES = [
  "Novice", "Disciple", "Defender", "Guardian", "Champion", "Patriarch", "Apostolic", "Orthodox Master"
];

const TIER_COLORS = [
  "border-amber-700/40 text-amber-700 bg-amber-950/20",
  "border-slate-400 text-slate-300 bg-slate-900/40",
  "border-amber-400 text-amber-300 bg-amber-900/40",
  "border-purple-400 text-purple-300 bg-purple-900/40",
  "border-cyan-400 text-cyan-300 bg-cyan-900/40",
  "border-emerald-400 text-emerald-300 bg-emerald-900/40",
  "border-rose-400 text-rose-300 bg-rose-900/40",
  "border-amber-300 text-amber-200 bg-amber-950/80 shadow-[0_0_20px_rgba(251,191,36,0.5)]"
];

export function TrophyShowcase({ awards }: { awards: AwardItem[] }) {
  const [selectedAward, setSelectedAward] = useState<AwardItem | null>(null);

  const triggerCelebration = () => {
    confetti({
      particleCount: 100,
      spread: 70,
      origin: { y: 0.6 }
    });
  };

  return (
    <div className="w-full space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Trophy className="w-5 h-5 text-amber-500 animate-bounce" />
          <h2 className="text-base font-bold font-serif text-foreground">Trophy Room & Badges</h2>
        </div>
        <span className="text-xs text-muted-foreground font-semibold">
          {awards.filter(a => a.currentLevel > 0).length} / {awards.length} Unlocked
        </span>
      </div>

      {/* Grid of Trophies */}
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-3">
        {awards.map((award) => {
          const isUnlocked = award.currentLevel > 0;
          const tierIndex = Math.max(0, award.currentLevel - 1);
          const tierStyle = TIER_COLORS[tierIndex] || TIER_COLORS[0];
          const tierName = isUnlocked ? TIER_NAMES[tierIndex] : "Locked";
          const progressPercent = Math.min(100, Math.round((award.currentValue / award.nextTierValue) * 100));

          return (
            <motion.div
              key={award.id}
              whileHover={{ scale: 1.03 }}
              whileTap={{ scale: 0.97 }}
              onClick={() => {
                setSelectedAward(award);
                if (isUnlocked) triggerCelebration();
              }}
              className={`rounded-2xl border p-4 flex flex-col items-center justify-between text-center cursor-pointer transition-all relative overflow-hidden bg-card/60 backdrop-blur-md shadow-md ${
                isUnlocked ? "border-amber-500/30 hover:border-amber-500/60" : "border-border/40 opacity-60"
              }`}
            >
              {/* Level Badge Pill */}
              <div className="w-full flex items-center justify-between mb-2">
                <span className="text-[10px] font-extrabold uppercase tracking-widest text-muted-foreground">
                  Lvl {award.currentLevel}/8
                </span>
                {isUnlocked ? (
                  <Sparkles className="w-3.5 h-3.5 text-amber-400" />
                ) : (
                  <Lock className="w-3.5 h-3.5 text-muted-foreground" />
                )}
              </div>

              {/* Trophy Icon */}
              <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-amber-500/10 to-purple-500/10 border border-white/10 flex items-center justify-center text-3xl my-1 shadow-inner relative group">
                <span className={isUnlocked ? "filter drop-shadow-md" : "grayscale opacity-50"}>
                  {award.icon}
                </span>
              </div>

              {/* Title & Tier */}
              <div className="w-full mt-2 space-y-1">
                <p className="text-xs font-bold text-foreground truncate font-serif">{award.title}</p>
                <span className={`inline-block text-[9px] font-extrabold px-2 py-0.5 rounded-full border ${tierStyle}`}>
                  {tierName}
                </span>
              </div>

              {/* Progress Bar */}
              <div className="w-full bg-muted rounded-full h-1.5 mt-3 overflow-hidden">
                <div 
                  className="gradient-gold h-full rounded-full transition-all duration-500" 
                  style={{ width: `${progressPercent}%` }} 
                />
              </div>
            </motion.div>
          );
        })}
      </div>

      {/* Award Detail Modal */}
      <AnimatePresence>
        {selectedAward && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md">
            <motion.div
              initial={{ opacity: 0, scale: 0.9, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 20 }}
              className="bg-card border border-border/60 rounded-3xl p-6 max-w-sm w-full shadow-2xl relative text-center space-y-4"
            >
              <button
                onClick={() => setSelectedAward(null)}
                className="absolute top-4 right-4 w-8 h-8 rounded-full bg-muted flex items-center justify-center hover:bg-muted/80 transition"
              >
                <X className="w-4 h-4 text-muted-foreground" />
              </button>

              <div className="w-20 h-20 rounded-3xl gradient-gold flex items-center justify-center text-4xl mx-auto shadow-xl halo-glow border-2 border-white/20">
                {selectedAward.icon}
              </div>

              <div>
                <h3 className="text-lg font-bold font-serif text-foreground">{selectedAward.title}</h3>
                <p className="text-xs text-amber-500 font-bold uppercase tracking-wider mt-0.5">
                  Tier {selectedAward.currentLevel} — {TIER_NAMES[Math.max(0, selectedAward.currentLevel - 1)]}
                </p>
              </div>

              <div className="bg-muted/50 rounded-2xl p-3 border border-border/50 space-y-2 text-xs">
                <div className="flex items-center justify-between text-muted-foreground font-semibold">
                  <span>Current Progress</span>
                  <span className="text-foreground font-bold">{selectedAward.currentValue} / {selectedAward.nextTierValue}</span>
                </div>
                <div className="w-full bg-muted rounded-full h-2 overflow-hidden">
                  <div 
                    className="gradient-gold h-full rounded-full transition-all duration-500" 
                    style={{ width: `${Math.min(100, Math.round((selectedAward.currentValue / selectedAward.nextTierValue) * 100))}%` }} 
                  />
                </div>
              </div>

              <button
                onClick={() => {
                  triggerCelebration();
                  setSelectedAward(null);
                }}
                className="w-full inline-flex items-center justify-center gradient-gold text-white font-bold h-11 rounded-xl shadow-md halo-glow"
              >
                Inspect Trophy ✨
              </button>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
