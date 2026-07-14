"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import { Heart, Lock, Send} from "lucide-react";

/* ─── Types ── */
interface PrayerRequest {
  id: string;
  text: string;
  author: string;
  anonymous: boolean;
  prayers: number;
  prayed: boolean;
  category: string;
  time: string;
}

import { submitPrayer, getApprovedPrayers, incrementPrayerCount, getCategories } from "./actions";

/* ─── Categories ── */
// We now fetch these from the database, but we still define an "All" fallback for filtering
const DEFAULT_CATEGORY_COLOR = "bg-gray-100 text-gray-800 dark:bg-gray-900/30 dark:text-gray-300";

/* ─── Prayer Card ── */
function PrayerCard({ req, onPray, catColor }: { req: PrayerRequest; onPray: (id: string) => void; catColor: string }) {
  const [animating, setAnimating] = useState(false);
  const [praying, setPraying] = useState(false);
  const [timeLeft, setTimeLeft] = useState(60);

  useEffect(() => {
    let timer: NodeJS.Timeout;
    if (praying && timeLeft > 0) {
      timer = setTimeout(() => setTimeLeft((t) => t - 1), 1000);
    } else if (praying && timeLeft === 0) {
      setPraying(false);
      if (!req.prayed) {
        setAnimating(true);
        onPray(req.id);
        setTimeout(() => setAnimating(false), 600);
      }
    }
    return () => clearTimeout(timer);
  }, [praying, timeLeft, req.prayed, onPray, req.id]);

  const handlePray = () => {
    if (req.prayed) return;
    if (!praying) {
      setPraying(true);
      setTimeLeft(60);
    }
  };

  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-card rounded-2xl border border-border/60 card-holy overflow-hidden"
    >
      <div className="px-4 pt-4 pb-3">
        {/* Header */}
        <div className="flex items-start justify-between gap-2 mb-2">
          <div className="flex items-center gap-2">
            <div className={cn(
              "w-8 h-8 rounded-xl flex items-center justify-center text-sm font-bold shrink-0",
              req.anonymous ? "bg-muted text-muted-foreground" : "gradient-gold text-white"
            )}>
              {req.anonymous ? <Lock className="w-3.5 h-3.5" /> : req.author.charAt(0)}
            </div>
            <div>
              <p className="text-xs font-bold text-foreground">{req.author}</p>
              <p className="text-[10px] text-muted-foreground">{new Date(req.time).toLocaleDateString()}</p>
            </div>
          </div>
          <Badge className={cn("text-[10px] uppercase font-bold", catColor)}>
            {req.category}
          </Badge>
        </div>

        {/* Request text */}
        <p className="text-sm text-foreground/85 leading-relaxed font-serif italic">"{req.text}"</p>
      </div>

      {/* Pray button */}
      <div className="px-4 pb-3 flex items-center justify-between">
        <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
          <Heart className={cn("w-3.5 h-3.5", req.prayed ? "fill-red-500 text-red-500" : "")} />
          <span className="font-semibold">{req.prayers} praying</span>
        </div>
        <motion.button
          whileTap={!praying && !req.prayed ? { scale: 0.9 } : undefined}
          onClick={handlePray}
          disabled={praying}
          className={cn(
            "flex items-center gap-1.5 text-xs font-bold px-4 py-2 rounded-xl transition",
            req.prayed
              ? "bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400 border border-red-200 dark:border-red-800"
              : praying
              ? "bg-amber-100 dark:bg-amber-900/40 text-amber-700 dark:text-amber-400 border border-amber-300 dark:border-amber-700"
              : "gradient-royal text-white shadow-md hover:opacity-90"
          )}
        >
          <motion.span animate={animating || praying ? { scale: [1, 1.2, 1], transition: { repeat: praying ? Infinity : 0, duration: 1 } } : {}}>
            🙏
          </motion.span>
          {req.prayed ? "Prayed ✓" : praying ? `Meditating... ${timeLeft}s` : "Pray for this (1m)"}
        </motion.button>
      </div>
    </motion.div>
  );
}

/* ─── Main Page ── */
export default function PrayerWall() {
  const [filter, setFilter] = useState("All");
  const [prayers, setPrayers] = useState<PrayerRequest[]>([]);
  const [dbCategories, setDbCategories] = useState<{name: string, color: string}[]>([]);
  
  const [text, setText] = useState("");
  const [anonymous, setAnonymous] = useState(false);
  const [newCat, setNewCat] = useState("General");
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    setRefreshing(true);
    try {
      const [fetchedPrayers, fetchedCats] = await Promise.all([
        getApprovedPrayers(),
        getCategories()
      ]);
      setPrayers(fetchedPrayers);
      setDbCategories(fetchedCats);
      if (fetchedCats.length > 0 && !fetchedCats.find(c => c.name === "General")) {
        setNewCat(fetchedCats[0].name);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setRefreshing(false);
    }
  };

  const categories = ["All", ...dbCategories.map(c => c.name)];

  const onPray = async (id: string) => {
    setPrayers((prev) =>
      prev.map((r) => r.id === id ? { ...r, prayers: r.prayed ? r.prayers - 1 : r.prayers + 1, prayed: !r.prayed } : r)
    );
    await incrementPrayerCount(id);
  };

  const handleSubmit = async () => {
    if (!text.trim()) return;
    setSubmitting(true);
    await submitPrayer(text.trim(), anonymous, newCat);
    setText("");
    setSubmitting(false);
    setSubmitted(true);
    loadData();
    setTimeout(() => setSubmitted(false), 5000);
  };

  const totalPrayers = prayers.reduce((acc, r) => acc + r.prayers, 0);

  return (
    <div className="flex-1 overflow-y-auto">

      {/* ── Header ── */}
      <div className="relative overflow-hidden px-5 pt-8 pb-10 gradient-lent">
        <div className="absolute inset-0 bg-[url('/header-image.png')] bg-cover bg-center opacity-40 mix-blend-overlay" />
        <div className="absolute right-4 sm:right-8 top-1/2 -translate-y-1/2 z-0 pointer-events-none flex flex-col items-center">
          <img src="/header-image.png" className="h-16 sm:h-24 w-auto rounded-2xl shadow-2xl border-[3px] border-white/20 opacity-95 object-contain rotate-3 drop-shadow-xl mb-2 sm:mb-3" alt="Church emblem" />
          <div className="flex flex-col items-center text-center opacity-90 rotate-1">
            <span className="text-[6px] sm:text-[8px] font-extrabold text-white uppercase tracking-widest font-serif leading-tight text-shadow-sm">St. Gregorios Jacobite<br/>Syrian Orthodox Church</span>
            <span className="text-[5px] sm:text-[6px] text-white/80 uppercase tracking-widest mt-0.5 font-semibold text-shadow-sm">Hosa Road - Bangalore</span>
          </div>
        </div>
        <div className="relative z-10">
          <div className="flex items-center gap-3 mb-2">
            <div className="w-10 h-10 rounded-xl bg-white/20 backdrop-blur-sm flex items-center justify-center text-xl">🙏</div>
            <div>
              <h1 className="text-2xl font-extrabold text-white font-serif">Prayer Wall</h1>
              <p className="text-purple-200 text-xs font-bold uppercase tracking-wider">Lift Each Other Up</p>
            </div>
          </div>
          <p className="text-purple-100/80 text-sm mt-2 italic font-serif">
            "Pray for one another, that you may be healed." — James 5:16
          </p>
          <div className="flex items-center gap-2 mt-4 flex-wrap">
            <div className="flex items-center gap-1.5 bg-white/15 backdrop-blur-sm rounded-full px-3 py-1.5 border border-white/20">
              <Heart className="w-3.5 h-3.5 text-white" />
              <span className="text-white text-xs font-semibold">{totalPrayers} prayers offered</span>
            </div>
            <div className="flex items-center gap-1.5 bg-white/15 backdrop-blur-sm rounded-full px-3 py-1.5 border border-white/20">
              <span>✝️</span>
              <span className="text-white text-xs font-semibold">{prayers.length} requests</span>
            </div>
          </div>
        </div>
      </div>

      <div className="px-4 pt-4 pb-8 space-y-4">

        {/* ── Submit a request ── */}
        <div className="rounded-2xl bg-card border border-border/60 card-holy overflow-hidden">
          <div className="px-4 pt-4 pb-3 border-b border-border/40 bg-gradient-to-r from-purple-600/8 to-violet-500/6 dark:from-purple-600/15 dark:to-violet-500/12">
            <p className="font-bold text-foreground font-serif text-sm">Submit a Prayer Request</p>
            <p className="text-xs text-muted-foreground mt-0.5">"Cast your burden on the Lord and He will sustain you." — Psalm 55:22</p>
          </div>
          <div className="px-4 py-3 space-y-3">
            <Textarea
              value={text}
              onChange={(e) => setText(e.target.value)}
              placeholder="Share your prayer request…"
              maxLength={300}
              rows={3}
              className="rounded-xl resize-none text-sm border-border/60 bg-background/50 font-serif"
            />
            <div className="flex items-center justify-between flex-wrap gap-2">
              <div className="flex items-center gap-2 flex-wrap">
                {/* Category picker */}
                <select
                  value={newCat}
                  onChange={(e) => setNewCat(e.target.value)}
                  className="text-xs font-semibold px-3 py-1.5 rounded-lg border border-border/60 bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-primary/20"
                >
                  {dbCategories.map(c => (
                    <option key={c.name} value={c.name}>{c.name}</option>
                  ))}
                </select>
                {/* Anonymous toggle */}
                <button
                  onClick={() => setAnonymous(!anonymous)}
                  className={cn(
                    "flex items-center gap-1.5 text-xs font-semibold px-3 py-1.5 rounded-lg border transition",
                    anonymous
                      ? "bg-purple-50 dark:bg-purple-900/20 text-purple-700 dark:text-purple-300 border-purple-200 dark:border-purple-800"
                      : "border-border/60 text-muted-foreground hover:text-foreground"
                  )}
                >
                  <Lock className="w-3 h-3" />
                  {anonymous ? "Anonymous ✓" : "Anonymous"}
                </button>
              </div>
              <Button
                onClick={handleSubmit}
                disabled={!text.trim() || submitting}
                className="gradient-lent text-white font-bold rounded-xl h-9 px-5 text-sm shadow-md hover:opacity-90 disabled:opacity-50"
              >
                {submitting ? "Submitting…" : <><Send className="w-3.5 h-3.5 mr-1.5" />Submit</>}
              </Button>
            </div>
            <AnimatePresence>
              {submitted && (
                <motion.p
                  initial={{ opacity: 0, y: -4 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0 }}
                  className="text-xs text-green-600 dark:text-green-400 font-semibold text-center mt-3"
                >
                  ✓ Your prayer has been shared with the community. 🙏
                </motion.p>
              )}
            </AnimatePresence>
          </div>
        </div>

        {/* ── Category filter ── */}
        <div className="flex gap-2 overflow-x-auto pb-1 scrollbar-hide">
          {categories.map(c => (
            <button
              key={c}
              onClick={() => setFilter(c)}
              className={cn(
                "shrink-0 text-xs font-bold px-4 py-2 rounded-full transition whitespace-nowrap border",
                filter === c
                  ? "gradient-lent text-white border-transparent shadow-md"
                  : "border-border/60 text-muted-foreground hover:text-foreground bg-card"
              )}
            >
              {c}
            </button>
          ))}
        </div>

        {/* ── Prayer requests ── */}
        <div className="space-y-3">
          <AnimatePresence>
            {(() => {
              let filtered = filter === "All" ? prayers : prayers.filter(p => p.category === filter);
              return filtered.map(req => {
                const catDef = dbCategories.find(c => c.name === req.category);
                return <PrayerCard key={req.id} req={req} onPray={onPray} catColor={catDef?.color || DEFAULT_CATEGORY_COLOR} />
              });
            })()}
          </AnimatePresence>
          {prayers.length === 0 && !refreshing && (
            <div className="text-center py-12 text-muted-foreground">
              <p className="text-3xl mb-2">🕊️</p>
              <p className="font-serif font-semibold">No requests in this category</p>
              <p className="text-sm italic mt-1">"Be still before the Lord." — Psalm 37:7</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
