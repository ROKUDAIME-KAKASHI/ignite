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
import { useEffect } from "react";
import { getProfileStats, joinParish } from "@/app/actions/profile";
import { requestNotificationPermission } from "@/lib/firebase";
import { ThemeToggle } from "@/components/ThemeToggle";

/* ─── Static data ──────────────────────────────────────────────────────────── */

const defaultStreak = [false, false, false, false, false, false, false];
const defaultWeekDays = ["S", "M", "T", "W", "T", "F", "S"];
const defaultQuote = { quote: "Do small things with great love.", author: "St. Teresa of Calcutta" };

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
  const [stats, setStats] = useState<{ chapters: number, badges: number, streakDone: boolean[], badgeList: { emoji: string, label: string, desc: string, color: string }[], user?: any, weekDays?: string[], quoteOfTheDay?: {quote: string, author: string} }>({ chapters: 0, badges: 0, streakDone: defaultStreak, badgeList: [], weekDays: defaultWeekDays, quoteOfTheDay: defaultQuote });
  const [installPrompt, setInstallPrompt] = useState<any>(null);
  const [showIOSPrompt, setShowIOSPrompt] = useState(false);
  
  const [inviteCode, setInviteCode] = useState("");
  const [joiningParish, setJoiningParish] = useState(false);
  const [joinError, setJoinError] = useState("");

  const handleJoinParish = async () => {
    if (!inviteCode.trim()) return;
    setJoiningParish(true);
    setJoinError("");
    const res = await joinParish(inviteCode.trim().toUpperCase());
    if (res.success) {
      setInviteCode("");
      const updated = await getProfileStats();
      if (updated) setStats(updated);
    } else {
      setJoinError(res.error || "Failed to join");
    }
    setJoiningParish(false);
  };

  useEffect(() => {
    getProfileStats().then(s => {
      if (s) setStats(s);
    });

    const handler = (e: any) => {
      e.preventDefault();
      setInstallPrompt(e);
    };
    window.addEventListener("beforeinstallprompt", handler);
    return () => window.removeEventListener("beforeinstallprompt", handler);
  }, []);

  const handleInstallClick = () => {
    if (!installPrompt) {
      const isIOS = /iPad|iPhone|iPod/.test(navigator.userAgent) || (navigator.userAgent.includes("Mac") && "ontouchend" in document);
      if (isIOS) {
        setShowIOSPrompt(true);
      } else {
        alert("App is either already installed, or your browser requires manual installation.\n\nTry opening your browser menu (usually three dots in the top right) and look for 'Install app' or 'Add to Home Screen'.");
      }
      return;
    }
    installPrompt.prompt();
    installPrompt.userChoice.then((choiceResult: any) => {
      if (choiceResult.outcome === "accepted") {
        console.log("User accepted the install prompt");
      }
      setInstallPrompt(null);
    });
  };

  const handleEnableNotifications = async () => {
    try {
      const token = await requestNotificationPermission();
      if (token) {
        alert("Push notifications enabled successfully!");
      } else {
        alert("Permission denied. You may need to enable notifications in your browser settings.");
      }
    } catch (e) {
      alert("Failed to enable notifications. Please check your browser permissions.");
    }
  };

  const initials = user?.displayName
    ? user.displayName.split(" ").map((n) => n[0]).join("").slice(0, 2).toUpperCase()
    : user?.email?.charAt(0).toUpperCase() ?? "A";

  const displayName = user?.displayName || user?.email?.split("@")[0] || "Beloved";
  
  const xp = stats?.user?.xp ?? user?.xp ?? 0;
  const level = stats?.user?.level ?? user?.level ?? 1;
  const streak = stats?.user?.streak ?? user?.streak ?? 0;
  const nextLevelXp = level * 500;
  const progress = Math.min(100, Math.round((xp / nextLevelXp) * 100));

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
              🛡️ Disciple · Level {level}
            </Badge>
            <Badge className="bg-white/20 text-white border border-white/30 backdrop-blur-sm text-xs font-bold px-3 py-1">
              🕊️ {getLiturgicalSeason()}
            </Badge>
          </div>
        </div>
      </div>

      {/* ── Grace Points Card (floats over hero) ── */}
      <div className="relative z-20 px-4 -mt-8 mb-5">
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          className="glass dark:glass-dark rounded-2xl p-4 card-holy shadow-xl"
        >
          <div className="flex justify-between items-center mb-2">
            <div>
              <p className="text-[10px] font-bold text-primary uppercase tracking-widest">Grace Points · Progress</p>
              <p className="text-2xl font-extrabold text-gradient-gold mt-0.5">{xp.toLocaleString()} Grace Points</p>
            </div>
            <p className="text-sm font-semibold text-muted-foreground">{nextLevelXp - xp} until <span className="text-primary font-bold">Next Rank</span></p>
          </div>
          <Progress value={progress} className="h-2 rounded-full bg-amber-100 dark:bg-amber-900/20 [&>div]:gradient-gold [&>div]:rounded-full" />
        </motion.div>
      </div>

      {/* ── Stats ── */}
      <div className="px-4 mb-5">
        <div className="grid grid-cols-4 gap-2">
          {[
            { emoji: "⚡", value: xp.toLocaleString(), label: "Grace Pts" },
            { emoji: "🕯️", value: streak.toString(),    label: "Day Streak" },
            { emoji: "🏅", value: stats.badges.toString(),    label: "Badges" },
            { emoji: "📖", value: stats.chapters.toString(),    label: "Chapters" },
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
                {streak} Day Streak
              </p>
              <p className="text-xs text-muted-foreground mt-0.5 italic font-serif">"Persevere in prayer." — Romans 12:12</p>
            </div>
          </div>
          <div className="flex justify-between gap-1">
            {(stats.weekDays || defaultWeekDays).map((d, i) => (
              <div key={i} className="flex flex-col items-center gap-1">
                <div className={cn(
                  "w-8 h-8 rounded-lg flex items-center justify-center text-xs font-bold",
                  stats.streakDone[i] ? "gradient-gold text-white shadow-sm" : "bg-muted text-muted-foreground"
                )}>
                  {stats.streakDone[i] ? "✓" : d}
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
        <div className="grid grid-cols-2 gap-2 mt-4">
            {stats.badgeList.length > 0 ? stats.badgeList.map((b) => (
              <div key={b.label} className={cn("p-3 rounded-xl border flex items-center gap-3", b.color)}>
                <span className="text-2xl drop-shadow-sm">{b.emoji}</span>
                <div>
                  <p className="text-[11px] font-bold text-foreground font-serif leading-tight">{b.label}</p>
                  <p className="text-[9px] text-muted-foreground mt-0.5">{b.desc}</p>
                </div>
              </div>
            )) : (
              <div className="col-span-2 text-center text-muted-foreground text-sm py-4">
                No badges earned yet. Start a journey!
              </div>
            )}
          </div>
      </div>

      {/* ── Saint Quote ── */}
      <div className="px-4 mb-5">
        <div className="rounded-2xl p-4 gradient-lent card-holy">
          <p className="text-[10px] text-purple-200 font-bold uppercase tracking-widest">Quote of the Day</p>
          <p className="text-sm font-serif italic text-white mt-2 leading-relaxed">"{stats.quoteOfTheDay?.quote || defaultQuote.quote}"</p>
          <p className="text-purple-300 text-xs font-semibold mt-2">— {stats.quoteOfTheDay?.author || defaultQuote.author}</p>
        </div>
      </div>

      {/* ── Account Section ── */}
      <div className="px-4 mb-8">
        <h3 className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest mb-3">Community</h3>
        <div className="rounded-2xl border border-border/60 card-holy overflow-hidden bg-card divide-y divide-border/50 mb-5">
          {stats.user?.church ? (
            <div className="px-4 py-4">
              <p className="text-xs font-bold text-muted-foreground uppercase tracking-wider mb-1">Your Parish</p>
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center text-blue-600 dark:text-blue-400 text-lg">
                  ⛪
                </div>
                <div>
                  <p className="text-sm font-bold text-foreground">{stats.user.church.name}</p>
                  <p className="text-xs text-muted-foreground">{stats.user.church.location || "Local Parish"}</p>
                </div>
              </div>
            </div>
          ) : (
            <div className="px-4 py-4 space-y-3">
              <div>
                <p className="text-xs font-bold text-muted-foreground uppercase tracking-wider">Join a Parish</p>
                <p className="text-[11px] text-muted-foreground mt-1">Connect with your local church community using an invite code from your youth leader.</p>
              </div>
              <div className="flex gap-2">
                <Input 
                  placeholder="Enter 6-digit code" 
                  value={inviteCode} 
                  onChange={e => setInviteCode(e.target.value.toUpperCase())}
                  maxLength={6}
                  className="font-mono uppercase h-10"
                />
                <Button 
                  onClick={handleJoinParish} 
                  disabled={joiningParish || inviteCode.length < 5}
                  className="h-10 px-4"
                >
                  {joiningParish ? <Loader2 className="w-4 h-4 animate-spin" /> : "Join"}
                </Button>
              </div>
              {joinError && <p className="text-[10px] text-red-500 font-bold">{joinError}</p>}
            </div>
          )}
        </div>

        <h3 className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest mb-3">Account</h3>
        <div className="rounded-2xl border border-border/60 card-holy overflow-hidden bg-card divide-y divide-border/50">
          {/* Theme Toggle */}
          <div className="flex items-center justify-between px-4 py-3">
            <div>
              <p className="text-xs font-bold text-muted-foreground uppercase tracking-wider">Appearance</p>
              <p className="text-sm font-medium text-foreground mt-0.5">Toggle Dark Mode</p>
            </div>
            <ThemeToggle />
          </div>
          {/* Email (read-only) */}
          <div className="flex items-center justify-between px-4 py-3">
            <div>
              <p className="text-xs font-bold text-muted-foreground uppercase tracking-wider">Email</p>
              <p className="text-sm font-medium text-foreground mt-0.5">{user?.email || "—"}</p>
            </div>
            <Badge className="text-[10px] bg-green-50 dark:bg-green-900/20 text-green-700 dark:text-green-400 border border-green-200 dark:border-green-800">Verified</Badge>
          </div>
          {/* Notifications Setting */}
          <div onClick={handleEnableNotifications} className="flex items-center justify-between px-4 py-3 hover:bg-muted/30 transition-colors cursor-pointer">
            <div>
              <p className="text-xs font-bold text-muted-foreground uppercase tracking-wider">Notifications</p>
              <p className="text-sm font-medium text-foreground mt-0.5">Turn on push notifications</p>
            </div>
            <ChevronRight className="w-4 h-4 text-muted-foreground" />
          </div>
          {/* Install App */}
          <div onClick={handleInstallClick} className="flex items-center justify-between px-4 py-3 hover:bg-muted/30 transition-colors cursor-pointer">
            <div>
              <p className="text-xs font-bold text-muted-foreground uppercase tracking-wider">Install App</p>
              <p className="text-sm font-medium text-foreground mt-0.5">Add to your home screen</p>
            </div>
            <ChevronRight className="w-4 h-4 text-muted-foreground" />
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

      {/* ── iOS Install Prompt Modal ── */}
      <AnimatePresence>
        {showIOSPrompt && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setShowIOSPrompt(false)}
              className="fixed inset-0 bg-black/60 z-[100] backdrop-blur-sm"
            />
            <motion.div
              initial={{ opacity: 0, y: 100 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 100 }}
              className="fixed bottom-0 left-0 right-0 z-[101] bg-background rounded-t-3xl p-6 shadow-2xl border-t border-border/50 max-w-md mx-auto"
            >
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-lg font-bold text-foreground font-serif">Install on iPhone</h3>
                <button onClick={() => setShowIOSPrompt(false)} className="w-8 h-8 flex items-center justify-center rounded-full bg-muted text-muted-foreground hover:bg-muted/80">
                  <X className="w-4 h-4" />
                </button>
              </div>
              <div className="space-y-3">
                <div className="flex items-center gap-4 bg-muted/30 p-4 rounded-2xl border border-border/50">
                  <div className="w-10 h-10 shrink-0 bg-white dark:bg-zinc-800 rounded-xl shadow-sm flex items-center justify-center">
                    <svg viewBox="0 0 24 24" className="w-6 h-6 text-blue-500" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M4 12v8a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2v-8"/><polyline points="16 6 12 2 8 6"/><line x1="12" y1="2" x2="12" y2="15"/></svg>
                  </div>
                  <div>
                    <p className="text-sm font-bold text-foreground">1. Tap the Share button</p>
                    <p className="text-xs text-muted-foreground mt-0.5">It's located at the bottom of your Safari browser.</p>
                  </div>
                </div>
                <div className="flex items-center gap-4 bg-muted/30 p-4 rounded-2xl border border-border/50">
                  <div className="w-10 h-10 shrink-0 bg-white dark:bg-zinc-800 rounded-xl shadow-sm flex items-center justify-center">
                    <svg viewBox="0 0 24 24" className="w-6 h-6 text-foreground" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="3" width="18" height="18" rx="4" ry="4"/><line x1="12" y1="8" x2="12" y2="16"/><line x1="8" y1="12" x2="16" y2="12"/></svg>
                  </div>
                  <div>
                    <p className="text-sm font-bold text-foreground">2. Add to Home Screen</p>
                    <p className="text-xs text-muted-foreground mt-0.5">Scroll down the share menu and tap this option.</p>
                  </div>
                </div>
              </div>
              <Button onClick={() => setShowIOSPrompt(false)} className="w-full mt-5 h-12 rounded-xl font-bold bg-amber-600 hover:bg-amber-700 text-white shadow-lg shadow-amber-600/20">
                Got it
              </Button>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
}
