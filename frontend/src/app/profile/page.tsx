"use client";

import { useState } from "react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Progress } from "@/components/ui/progress";
import { LogOut, ChevronRight, Edit3, Check, X, Loader2 } from "lucide-react";
import { useAuth } from "@/context/AuthContext";
import { motion, AnimatePresence } from "framer-motion";
import { cn } from "@/lib/utils";

/* ─── Static data ──────────────────────────────────────────────────────────── */
const spiritualBadges = [
  { emoji: "📖", label: "Gospel Reader",    desc: "Read all 4 Gospels",      color: "bg-amber-50 dark:bg-amber-900/20   border-amber-200/50 dark:border-amber-800/30"  },
  { emoji: "🤝", label: "Servant Heart",    desc: "10 Acts of Charity",      color: "bg-green-50 dark:bg-green-900/20   border-green-200/50 dark:border-green-800/30"  },
  { emoji: "🕯️", label: "Adorer",           desc: "5 Adoration sessions",   color: "bg-amber-50 dark:bg-amber-900/20   border-amber-200/50 dark:border-amber-800/30"  },
  { emoji: "🌿", label: "Lenten Warrior",   desc: "Completed Lent plan",     color: "bg-purple-50 dark:bg-purple-900/20 border-purple-200/50 dark:border-purple-800/30"},
  { emoji: "⛪", label: "Sunday Faithful",  desc: "8 weeks of Mass",         color: "bg-blue-50 dark:bg-blue-900/20     border-blue-200/50 dark:border-blue-800/30"    },
  { emoji: "✝️", label: "Confirmed",         desc: "Received Confirmation",  color: "bg-red-50 dark:bg-red-900/20       border-red-200/50 dark:border-red-800/30"      },
];

const weekDays = ["S", "M", "T", "W", "T", "F", "S"];
const streakDone = [false, true, true, true, true, true, false];

const saintQuote = { quote: "Do small things with great love.", author: "St. Teresa of Calcutta" };

/* ─── Name editor ──────────────────────────────────────────────────────────── */
function NameEditor({ currentName, onSave }: { currentName: string; onSave: (n: string) => Promise<void> }) {
  const [editing, setEditing] = useState(false);
  const [value, setValue] = useState(currentName);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);

  const handleSave = async () => {
    if (!value.trim() || value.trim() === currentName) { setEditing(false); return; }
    setSaving(true);
    setError("");
    try {
      await onSave(value.trim());
      setSuccess(true);
      setEditing(false);
      setTimeout(() => setSuccess(false), 2000);
    } catch {
      setError("Could not update name. Try again.");
    } finally {
      setSaving(false);
    }
  };

  const handleCancel = () => { setValue(currentName); setEditing(false); setError(""); };

  if (!editing) {
    return (
      <div className="flex items-center gap-2 justify-center mt-3">
        <h2 className="text-2xl font-extrabold text-white font-serif leading-tight">
          {currentName}
        </h2>
        {success ? (
          <motion.span initial={{ scale: 0 }} animate={{ scale: 1 }} className="w-6 h-6 rounded-full bg-green-400 flex items-center justify-center">
            <Check className="w-3.5 h-3.5 text-white" />
          </motion.span>
        ) : (
          <button
            onClick={() => setEditing(true)}
            className="w-7 h-7 rounded-lg bg-white/20 hover:bg-white/35 flex items-center justify-center transition-colors border border-white/20"
            title="Edit name"
          >
            <Edit3 className="w-3.5 h-3.5 text-white" />
          </button>
        )}
      </div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: -8 }}
      animate={{ opacity: 1, y: 0 }}
      className="mt-3 flex flex-col items-center gap-2 w-full max-w-xs mx-auto"
    >
      <div className="flex gap-2 w-full">
        <Input
          value={value}
          onChange={(e) => setValue(e.target.value)}
          onKeyDown={(e) => { if (e.key === "Enter") handleSave(); if (e.key === "Escape") handleCancel(); }}
          maxLength={40}
          autoFocus
          className="flex-1 h-9 rounded-xl border-white/30 bg-white/15 text-white placeholder:text-white/40 text-sm font-semibold text-center focus:border-amber-300/60 focus:ring-amber-300/30"
          placeholder="Enter your name…"
        />
        <button
          onClick={handleSave}
          disabled={saving || !value.trim()}
          className="w-9 h-9 rounded-xl bg-amber-400/80 hover:bg-amber-400 flex items-center justify-center disabled:opacity-50 transition-colors"
        >
          {saving ? <Loader2 className="w-4 h-4 text-white animate-spin" /> : <Check className="w-4 h-4 text-white" />}
        </button>
        <button
          onClick={handleCancel}
          className="w-9 h-9 rounded-xl bg-white/15 hover:bg-white/25 flex items-center justify-center transition-colors border border-white/20"
        >
          <X className="w-4 h-4 text-white" />
        </button>
      </div>
      {error && <p className="text-xs text-red-300">{error}</p>}
      <p className="text-white/40 text-[10px]">Press Enter to save · Esc to cancel</p>
    </motion.div>
  );
}

/* ─── Main Profile Page ────────────────────────────────────────────────────── */
export default function ProfilePage() {
  const { user, updateDisplayName, logout } = useAuth();
  const [loggingOut, setLoggingOut] = useState(false);

  const initials = user?.displayName
    ? user.displayName.split(" ").map((n) => n[0]).join("").slice(0, 2).toUpperCase()
    : user?.email?.charAt(0).toUpperCase() ?? "A";

  const displayName = user?.displayName || user?.email?.split("@")[0] || "Beloved";

  const handleLogout = async () => {
    setLoggingOut(true);
    try { await logout(); } finally { setLoggingOut(false); }
  };

  return (
    <div className="flex-1 overflow-y-auto">

      {/* ── Hero Header ── */}
      <div className="relative overflow-hidden px-5 pt-8 pb-20 gradient-dawn">
        {/* Cross watermark */}
        <svg viewBox="0 0 200 200" className="absolute right-0 top-0 w-48 h-48 opacity-10 text-white" fill="none" stroke="currentColor" strokeWidth="6">
          <line x1="100" y1="10" x2="100" y2="190" /><line x1="20" y1="70" x2="180" y2="70" />
        </svg>
        {/* Bottom fade */}
        <div className="absolute bottom-0 left-0 right-0 h-14 bg-gradient-to-t from-background to-transparent" />

        {/* Avatar + name */}
        <div className="relative z-10 flex flex-col items-center text-center">
          <div className="relative mb-1">
            <Avatar className="w-24 h-24 border-4 border-white/30 shadow-2xl">
              <AvatarImage src="" />
              <AvatarFallback className="text-2xl font-extrabold bg-white/20 text-white font-serif">
                {initials}
              </AvatarFallback>
            </Avatar>
            <div className="absolute -bottom-1 -right-1 w-8 h-8 rounded-full gradient-gold flex items-center justify-center shadow-md halo-glow text-sm">✝️</div>
          </div>

          {/* Editable name */}
          <NameEditor currentName={displayName} onSave={updateDisplayName} />

          <p className="text-white/60 text-xs mt-1">{user?.email}</p>

          {/* Rank badges */}
          <div className="flex items-center gap-2 mt-3 flex-wrap justify-center">
            <Badge className="bg-white/20 text-white border border-white/30 backdrop-blur-sm text-xs font-bold px-3 py-1">
              🛡️ Disciple · Level 8
            </Badge>
            <Badge className="bg-white/20 text-white border border-white/30 backdrop-blur-sm text-xs font-bold px-3 py-1">
              🕊️ Ordinary Time
            </Badge>
          </div>
        </div>
      </div>

      {/* ── Grace Points Card (floats over hero) ── */}
      <div className="px-4 -mt-8 mb-5">
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          className="glass dark:glass-dark rounded-2xl p-4 card-holy shadow-xl"
        >
          <div className="flex justify-between items-center mb-2">
            <div>
              <p className="text-[10px] font-bold text-primary uppercase tracking-widest">Grace Points · Progress</p>
              <p className="text-2xl font-extrabold text-gradient-gold mt-0.5">2,450 XP</p>
            </div>
            <p className="text-sm font-semibold text-muted-foreground">50 until <span className="text-primary font-bold">Apostle</span></p>
          </div>
          <Progress value={98} className="h-2 rounded-full bg-amber-100 dark:bg-amber-900/20 [&>div]:gradient-gold [&>div]:rounded-full" />
        </motion.div>
      </div>

      {/* ── Stats ── */}
      <div className="px-4 mb-5">
        <div className="grid grid-cols-4 gap-2">
          {[
            { emoji: "⚡", value: "2,450", label: "Grace Pts" },
            { emoji: "🕯️", value: "12",    label: "Day Streak" },
            { emoji: "🏅", value: "14",    label: "Badges" },
            { emoji: "📖", value: "47",    label: "Chapters" },
          ].map((s, i) => (
            <motion.div
              key={s.label}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.05 * i }}
              className="bg-card rounded-2xl p-3 text-center border border-border/60 card-holy"
            >
              <p className="text-xl mb-1">{s.emoji}</p>
              <p className="text-base font-extrabold text-foreground">{s.value}</p>
              <p className="text-[9px] text-muted-foreground font-bold uppercase tracking-wide leading-tight mt-0.5">{s.label}</p>
            </motion.div>
          ))}
        </div>
      </div>

      {/* ── Weekly Streak ── */}
      <div className="px-4 mb-5">
        <div className="rounded-2xl p-4 bg-gradient-to-r from-amber-500/10 to-yellow-500/8 dark:from-amber-500/20 dark:to-yellow-500/15 border border-amber-200/50 dark:border-amber-800/30 card-holy">
          <div className="flex items-center justify-between mb-3">
            <div>
              <p className="font-bold text-foreground flex items-center gap-2">
                <span className="candle-flicker text-xl">🕯️</span>
                12 Day Streak
              </p>
              <p className="text-xs text-muted-foreground mt-0.5 italic font-serif">"Persevere in prayer." — Romans 12:12</p>
            </div>
          </div>
          <div className="flex justify-between gap-1">
            {weekDays.map((d, i) => (
              <div key={i} className="flex flex-col items-center gap-1">
                <div className={cn(
                  "w-8 h-8 rounded-lg flex items-center justify-center text-xs font-bold",
                  streakDone[i] ? "gradient-gold text-white shadow-sm" : "bg-muted text-muted-foreground"
                )}>
                  {streakDone[i] ? "✓" : d}
                </div>
                <span className="text-[9px] text-muted-foreground">{d}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* ── Spiritual Badges ── */}
      <div className="px-4 mb-5">
        <div className="flex items-center justify-between mb-3">
          <h3 className="font-bold text-foreground font-serif flex items-center gap-2">🏅 Spiritual Achievements</h3>
          <button className="text-xs text-primary font-semibold flex items-center gap-1">
            View All <ChevronRight className="w-3 h-3" />
          </button>
        </div>
        <div className="grid grid-cols-3 gap-2">
          {spiritualBadges.map((b, i) => (
            <motion.div
              key={b.label}
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: i * 0.06 }}
              className={cn("rounded-xl p-3 flex flex-col items-center text-center border card-holy", b.color)}
            >
              <span className="text-2xl mb-1">{b.emoji}</span>
              <p className="text-[10px] font-bold text-foreground leading-tight font-serif">{b.label}</p>
              <p className="text-[9px] text-muted-foreground mt-0.5 leading-tight">{b.desc}</p>
            </motion.div>
          ))}
        </div>
      </div>

      {/* ── Saint Quote ── */}
      <div className="px-4 mb-5">
        <div className="rounded-2xl p-4 gradient-lent card-holy">
          <p className="text-[10px] text-purple-200 font-bold uppercase tracking-widest">Quote of the Day</p>
          <p className="text-sm font-serif italic text-white mt-2 leading-relaxed">"{saintQuote.quote}"</p>
          <p className="text-purple-300 text-xs font-semibold mt-2">— {saintQuote.author}</p>
        </div>
      </div>

      {/* ── Account Section ── */}
      <div className="px-4 mb-8">
        <h3 className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest mb-3">Account</h3>
        <div className="rounded-2xl border border-border/60 card-holy overflow-hidden bg-card divide-y divide-border/50">
          {/* Email (read-only) */}
          <div className="flex items-center justify-between px-4 py-3">
            <div>
              <p className="text-xs font-bold text-muted-foreground uppercase tracking-wider">Email</p>
              <p className="text-sm font-medium text-foreground mt-0.5">{user?.email || "—"}</p>
            </div>
            <Badge className="text-[10px] bg-green-50 dark:bg-green-900/20 text-green-700 dark:text-green-400 border border-green-200 dark:border-green-800">Verified</Badge>
          </div>
        </div>
      </div>

      {/* ── Sign Out ── */}
      <div className="px-4 pb-10">
        <div className="divider-cross mb-5" />
        <motion.div whileHover={{ scale: 1.01 }} whileTap={{ scale: 0.98 }}>
          <Button
            onClick={handleLogout}
            disabled={loggingOut}
            className="w-full h-12 rounded-2xl bg-red-500 hover:bg-red-600 text-white font-bold text-base shadow-lg shadow-red-500/25 transition-all"
          >
            {loggingOut ? (
              <span className="flex items-center gap-2">
                <Loader2 className="w-4 h-4 animate-spin" />
                Signing out…
              </span>
            ) : (
              <span className="flex items-center gap-2">
                <LogOut className="w-4 h-4" />
                Sign Out
              </span>
            )}
          </Button>
        </motion.div>
        <p className="text-center text-[10px] text-muted-foreground mt-4 tracking-[0.25em] uppercase">✝ Soli Deo Gloria ✝</p>
      </div>
    </div>
  );
}
