"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import { Heart, Lock, Send} from "lucide-react";

/* ─── Types ── */
interface PrayerRequest {
  id: number;
  text: string;
  author: string;
  anonymous: boolean;
  prayers: number;
  prayed: boolean;
  category: string;
  time: string;
}

/* ─── Seed data ── */
const INITIAL_REQUESTS: PrayerRequest[] = [
  { id: 1, text: "Please pray for my grandmother who is in the hospital. She has been fighting illness for weeks.", author: "Maria S.", anonymous: false, prayers: 34, prayed: false, category: "Healing",    time: "2h ago" },
  { id: 2, text: "Pray for my upcoming university entrance exams. I'm anxious and need God's peace.", author: "Anonymous", anonymous: true, prayers: 21, prayed: false, category: "Strength",   time: "4h ago" },
  { id: 3, text: "Thanksgiving — I got the job I've been praying for! God is faithful!", author: "James O.", anonymous: false, prayers: 58, prayed: false, category: "Thanksgiving", time: "Yesterday" },
  { id: 4, text: "I'm struggling with loneliness. Please lift me up in prayer this week.", author: "Anonymous", anonymous: true, prayers: 47, prayed: false, category: "Comfort",    time: "Yesterday" },
  { id: 5, text: "Pray for our youth group retreat next weekend. May it transform lives.", author: "Clara R.", anonymous: false, prayers: 29, prayed: false, category: "Community",  time: "2d ago" },
  { id: 6, text: "For my parents going through a difficult time in their marriage. God restore them.", author: "Anonymous", anonymous: true, prayers: 63, prayed: false, category: "Family",     time: "3d ago" },
];

const CATEGORIES = ["All", "Healing", "Strength", "Thanksgiving", "Comfort", "Family", "Community"];

const categoryColor: Record<string, string> = {
  Healing:      "bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300",
  Strength:     "bg-amber-100 text-amber-800 dark:bg-amber-900/30 dark:text-amber-300",
  Thanksgiving: "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300",
  Comfort:      "bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300",
  Family:       "bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-300",
  Community:    "bg-teal-100 text-teal-800 dark:bg-teal-900/30 dark:text-teal-300",
};

/* ─── Prayer Card ── */
function PrayerCard({ req, onPray }: { req: PrayerRequest; onPray: (id: number) => void }) {
  const [animating, setAnimating] = useState(false);

  const handlePray = () => {
    if (req.prayed) return;
    setAnimating(true);
    onPray(req.id);
    setTimeout(() => setAnimating(false), 600);
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
              <p className="text-[10px] text-muted-foreground">{req.time}</p>
            </div>
          </div>
          <Badge className={cn("text-[10px] border-0 px-2 shrink-0", categoryColor[req.category] || "bg-muted text-muted-foreground")}>
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
          whileTap={{ scale: 0.9 }}
          onClick={handlePray}
          className={cn(
            "flex items-center gap-1.5 text-xs font-bold px-4 py-2 rounded-xl transition-all",
            req.prayed
              ? "bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400 border border-red-200 dark:border-red-800"
              : "gradient-royal text-white shadow-md hover:opacity-90"
          )}
        >
          <motion.span animate={animating ? { scale: [1, 1.5, 1] } : {}}>
            🙏
          </motion.span>
          {req.prayed ? "Prayed ✓" : "Pray for this"}
        </motion.button>
      </div>
    </motion.div>
  );
}

/* ─── Main Page ── */
export default function PrayerWallPage() {
  const [requests, setRequests] = useState<PrayerRequest[]>(INITIAL_REQUESTS);
  const [activeCategory, setActiveCategory] = useState("All");
  const [text, setText] = useState("");
  const [anonymous, setAnonymous] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState("Healing");
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  const onPray = (id: number) => {
    setRequests((prev) =>
      prev.map((r) => r.id === id ? { ...r, prayers: r.prayed ? r.prayers - 1 : r.prayers + 1, prayed: !r.prayed } : r)
    );
  };

  const handleSubmit = async () => {
    if (!text.trim()) return;
    setSubmitting(true);
    await new Promise((r) => setTimeout(r, 800)); // simulate network
    const newReq: PrayerRequest = {
      id: Date.now(),
      text: text.trim(),
      author: anonymous ? "Anonymous" : "You",
      anonymous,
      prayers: 0,
      prayed: false,
      category: selectedCategory,
      time: "Just now",
    };
    setRequests((prev) => [newReq, ...prev]);
    setText("");
    setSubmitting(false);
    setSubmitted(true);
    setTimeout(() => setSubmitted(false), 3000);
  };

  const filtered = activeCategory === "All" ? requests : requests.filter((r) => r.category === activeCategory);
  const totalPrayers = requests.reduce((acc, r) => acc + r.prayers, 0);

  return (
    <div className="flex-1 overflow-y-auto">

      {/* ── Header ── */}
      <div className="relative overflow-hidden px-5 pt-8 pb-10 gradient-lent">
        <svg viewBox="0 0 200 200" className="absolute right-0 top-0 w-48 h-48 opacity-10 text-white" fill="none" stroke="currentColor" strokeWidth="6">
          <line x1="100" y1="10" x2="100" y2="190" /><line x1="20" y1="70" x2="180" y2="70" />
        </svg>
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
              <span className="text-white text-xs font-semibold">{requests.length} requests</span>
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
                  value={selectedCategory}
                  onChange={(e) => setSelectedCategory(e.target.value)}
                  className="text-xs font-semibold px-3 py-1.5 rounded-lg border border-border/60 bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-primary/20"
                >
                  {CATEGORIES.filter(c => c !== "All").map(c => (
                    <option key={c} value={c}>{c}</option>
                  ))}
                </select>
                {/* Anonymous toggle */}
                <button
                  onClick={() => setAnonymous(!anonymous)}
                  className={cn(
                    "flex items-center gap-1.5 text-xs font-semibold px-3 py-1.5 rounded-lg border transition-all",
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
                  className="text-xs text-green-600 dark:text-green-400 font-semibold text-center"
                >
                  ✓ Your request has been shared. The community is praying for you. 🙏
                </motion.p>
              )}
            </AnimatePresence>
          </div>
        </div>

        {/* ── Category filter ── */}
        <div className="flex gap-2 overflow-x-auto pb-1 scrollbar-hide">
          {CATEGORIES.map((cat) => (
            <button
              key={cat}
              onClick={() => setActiveCategory(cat)}
              className={cn(
                "shrink-0 text-xs font-bold px-4 py-2 rounded-full transition-all whitespace-nowrap border",
                activeCategory === cat
                  ? "gradient-lent text-white border-transparent shadow-md"
                  : "border-border/60 text-muted-foreground hover:text-foreground bg-card"
              )}
            >
              {cat}
            </button>
          ))}
        </div>

        {/* ── Prayer requests ── */}
        <div className="space-y-3">
          <AnimatePresence>
            {filtered.map((req) => (
              <PrayerCard key={req.id} req={req} onPray={onPray} />
            ))}
          </AnimatePresence>
          {filtered.length === 0 && (
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
