"use client";

import { useState, useMemo } from "react";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Search, ChevronRight, BookOpen, Bookmark, Clock } from "lucide-react";
import { motion } from "framer-motion";
import { cn } from "@/lib/utils";
import { BIBLE_BOOKS, groupBooksByCategory } from "@/lib/bible-books";
import Link from "next/link";

const tabs = ["Browse", "Plans", "Bookmarks"];

// Featured books (quick access)
const FEATURED = [
  { slug: "psalms",      chapter: 23, label: "Psalm 23",     emoji: "🌿" },
  { slug: "john",        chapter: 1,  label: "John 1",       emoji: "✝️" },
  { slug: "romans",      chapter: 8,  label: "Romans 8",     emoji: "⚡" },
  { slug: "genesis",     chapter: 1,  label: "Genesis 1",    emoji: "🌅" },
  { slug: "matthew",     chapter: 5,  label: "Matthew 5",    emoji: "⛰️" },
  { slug: "revelation",  chapter: 21, label: "Revelation 21",emoji: "👑" },
];

const plans = [
  { title: "Walk with Christ — Gospels",  desc: "Matthew · Mark · Luke · John", progress: 34, days: 40, emoji: "✝️", season: "Easter",   slug: "matthew", chapter: 1 },
  { title: "Psalms & Proverbs: 30 Days",  desc: "Wisdom of the Old Testament",  progress: 67, days: 30, emoji: "📜", season: "Ordinary", slug: "psalms",  chapter: 1 },
  { title: "Letters of St. Paul",          desc: "Romans through Philemon",      progress: 12, days: 21, emoji: "⚓", season: "Ordinary", slug: "romans",  chapter: 1 },
  { title: "Lenten Journey: 40 Days",      desc: "Repentance, renewal, resurrection", progress: 0, days: 40, emoji: "🌿", season: "Lent", slug: "isaiah", chapter: 40 },
];

const seasonColor: Record<string, string> = {
  Easter:   "bg-amber-100 text-amber-800 dark:bg-amber-900/30 dark:text-amber-300",
  Lent:     "bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-300",
  Ordinary: "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300",
};

const otGroups = groupBooksByCategory("OT");
const ntGroups = groupBooksByCategory("NT");

export default function BiblePage() {
  const [activeTab, setActiveTab] = useState("Browse");
  const [search, setSearch] = useState("");
  const [testament, setTestament] = useState<"OT" | "NT">("NT");

  const searchResults = useMemo(() => {
    if (!search.trim()) return [];
    const q = search.toLowerCase();
    return BIBLE_BOOKS.filter((b) => b.name.toLowerCase().includes(q));
  }, [search]);

  const groups = testament === "OT" ? otGroups : ntGroups;

  return (
    <div className="flex-1 overflow-y-auto">

      {/* ── Header ── */}
      <div className="relative overflow-hidden px-5 pt-8 pb-10 gradient-royal">
        <svg viewBox="0 0 200 200" className="absolute right-0 top-0 w-48 h-48 opacity-10 text-white" fill="none" stroke="currentColor" strokeWidth="6">
          <line x1="100" y1="10" x2="100" y2="190" /><line x1="20" y1="70" x2="180" y2="70" />
        </svg>
        <div className="relative z-10">
          <div className="flex items-center gap-3 mb-2">
            <div className="w-10 h-10 rounded-xl bg-white/20 backdrop-blur-sm flex items-center justify-center text-xl">📖</div>
            <div>
              <h1 className="text-2xl font-extrabold text-white font-serif">Sacred Scripture</h1>
              <p className="text-blue-200 text-xs font-bold uppercase tracking-wider">The Holy Bible · 66 Books</p>
            </div>
          </div>
          <p className="text-blue-100/80 text-sm mt-2 italic font-serif">
            "Thy word is a lamp unto my feet, and a light unto my path." — Psalm 119:105
          </p>
        </div>
      </div>

      <div className="px-4 pt-4 pb-8 space-y-4">

        {/* ── Search ── */}
        <div className="relative">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 text-muted-foreground h-4 w-4" />
          <Input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search books of the Bible…"
            className="pl-10 rounded-xl border-border/60 bg-card h-11"
          />
        </div>

        {/* ── Search Results ── */}
        {search.trim() && (
          <motion.div initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} className="space-y-2">
            {searchResults.length === 0 ? (
              <p className="text-sm text-muted-foreground text-center py-4 italic font-serif">No books found for "{search}"</p>
            ) : (
              searchResults.map((book) => (
                <Link
                  key={book.slug}
                  href={`/bible/${book.slug}/1`}
                  className="flex items-center justify-between px-4 py-3 rounded-xl bg-card border border-border/60 card-holy card-holy-hover"
                >
                  <div>
                    <p className="font-bold text-sm text-foreground font-serif">{book.name}</p>
                    <p className="text-xs text-muted-foreground">{book.testament === "OT" ? "Old Testament" : "New Testament"} · {book.category} · {book.chapters} chapters</p>
                  </div>
                  <ChevronRight className="w-4 h-4 text-muted-foreground" />
                </Link>
              ))
            )}
          </motion.div>
        )}

        {!search.trim() && (
          <>
            {/* ── Tabs ── */}
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

            {/* ── BROWSE ── */}
            {activeTab === "Browse" && (
              <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} className="space-y-5">

                {/* Quick access */}
                <div>
                  <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest mb-3">⭐ Beloved Passages</p>
                  <div className="grid grid-cols-3 gap-2">
                    {FEATURED.map((f) => (
                      <Link
                        key={f.label}
                        href={`/bible/${f.slug}/${f.chapter}`}
                        className="flex flex-col items-center justify-center gap-1.5 py-3 px-2 rounded-xl bg-card border border-border/60 card-holy card-holy-hover text-center"
                      >
                        <span className="text-2xl">{f.emoji}</span>
                        <span className="text-[11px] font-bold text-foreground font-serif leading-tight">{f.label}</span>
                      </Link>
                    ))}
                  </div>
                </div>

                {/* Continue Reading */}
                <Link href="/bible/philippians/4" className="block rounded-2xl p-4 bg-gradient-to-r from-amber-500/10 to-yellow-500/8 dark:from-amber-500/20 dark:to-yellow-500/15 border border-amber-200/50 dark:border-amber-800/30 card-holy card-holy-hover">
                  <p className="text-[10px] font-bold text-primary uppercase tracking-widest mb-1.5">📌 Continue Reading</p>
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="font-bold text-foreground text-lg font-serif">Philippians · Chapter 4</p>
                      <p className="text-sm text-muted-foreground">4 of 4 chapters</p>
                    </div>
                    <div className="w-11 h-11 rounded-xl gradient-gold flex items-center justify-center shadow-md halo-glow">
                      <ChevronRight className="w-5 h-5 text-white" />
                    </div>
                  </div>
                </Link>

                {/* OT / NT toggle */}
                <div className="flex gap-2">
                  {(["NT", "OT"] as const).map((t) => (
                    <button
                      key={t}
                      onClick={() => setTestament(t)}
                      className={cn(
                        "flex-1 py-2.5 rounded-xl text-sm font-bold transition-all",
                        testament === t
                          ? t === "NT" ? "gradient-royal text-white shadow-md" : "gradient-gold text-white shadow-md"
                          : "bg-muted text-muted-foreground hover:text-foreground"
                      )}
                    >
                      {t === "NT" ? "New Testament" : "Old Testament"}
                    </button>
                  ))}
                </div>

                {/* Book groups */}
                {Object.entries(groups).map(([category, books]) => (
                  <div key={category}>
                    <p className="text-xs font-bold text-muted-foreground uppercase tracking-widest mb-2 flex items-center gap-2">
                      <span className="w-4 h-0.5 bg-primary/40 rounded-full inline-block" />
                      {category}
                    </p>
                    <div className="grid grid-cols-2 gap-1.5">
                      {books.map((book) => (
                        <Link
                          key={book.slug}
                          href={`/bible/${book.slug}/1`}
                          className="flex items-center justify-between px-3 py-2.5 rounded-xl bg-card border border-border/60 card-holy-hover hover:border-primary/40 hover:bg-amber-50/40 dark:hover:bg-amber-900/10 transition-all group"
                        >
                          <div>
                            <p className="font-serif font-semibold text-sm text-foreground group-hover:text-primary transition-colors">{book.name}</p>
                            <p className="text-[10px] text-muted-foreground">{book.chapters} ch</p>
                          </div>
                          <ChevronRight className="w-3.5 h-3.5 text-muted-foreground group-hover:text-primary transition-colors" />
                        </Link>
                      ))}
                    </div>
                  </div>
                ))}
              </motion.div>
            )}

            {/* ── PLANS ── */}
            {activeTab === "Plans" && (
              <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} className="space-y-3">
                <p className="text-xs text-muted-foreground italic font-serif">
                  "Blessed is the one who meditates on the law of the Lord day and night." — Psalm 1:2
                </p>
                {plans.map((plan) => (
                  <Link
                    key={plan.title}
                    href={`/bible/${plan.slug}/${plan.chapter}`}
                    className="block rounded-2xl p-4 bg-card border border-border/60 card-holy card-holy-hover"
                  >
                    <div className="flex items-start gap-3">
                      <span className="text-3xl">{plan.emoji}</span>
                      <div className="flex-1 min-w-0">
                        <div className="flex justify-between items-start mb-1 flex-wrap gap-1">
                          <p className="font-bold text-sm text-foreground font-serif">{plan.title}</p>
                          <Badge className={cn("text-[10px] border-0 px-2", seasonColor[plan.season])}>{plan.season}</Badge>
                        </div>
                        <p className="text-xs text-muted-foreground mb-2">{plan.desc}</p>
                        <div className="flex items-center gap-2">
                          <div className="flex-1 h-1.5 rounded-full bg-muted overflow-hidden">
                            <div className="h-full rounded-full gradient-gold transition-all" style={{ width: `${plan.progress}%` }} />
                          </div>
                          <span className="text-[11px] font-bold text-primary">{plan.progress}%</span>
                          <span className="text-[10px] text-muted-foreground">{plan.days}d</span>
                        </div>
                      </div>
                    </div>
                  </Link>
                ))}
              </motion.div>
            )}

            {/* ── BOOKMARKS ── */}
            {activeTab === "Bookmarks" && (
              <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} className="space-y-2">
                <p className="text-xs text-muted-foreground italic font-serif mb-3">
                  "I have hidden your word in my heart." — Psalm 119:11
                </p>
                <div className="text-center py-12 text-muted-foreground">
                  <Bookmark className="w-10 h-10 mx-auto mb-3 opacity-30" />
                  <p className="font-serif font-semibold">No bookmarks yet</p>
                  <p className="text-sm italic mt-1">Tap any verse while reading to bookmark it.</p>
                </div>
              </motion.div>
            )}
          </>
        )}
      </div>
    </div>
  );
}
