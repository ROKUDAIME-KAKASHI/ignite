"use client";

import { useState, useMemo } from "react";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Search, ChevronRight, BookOpen, Bookmark, Clock } from "lucide-react";
import { motion } from "framer-motion";
import { cn } from "@/lib/utils";
import { BIBLE_BOOKS, groupBooksByCategory, getBookBySlug } from "@/lib/bible-books";
import Link from "next/link";
import { useEffect } from "react";

const tabs = ["Browse", "Plans", "Bookmarks"];

import { getBibleContent } from "./actions";

const otGroups = groupBooksByCategory("OT");
const ntGroups = groupBooksByCategory("NT");

export default function BiblePage() {
  const [activeTab, setActiveTab] = useState("Browse");
  const [search, setSearch] = useState("");
  const [testament, setTestament] = useState<"OT" | "NT">("NT");
  const [bookmarks, setBookmarks] = useState<{ bookSlug: string, ch: string, v: string, name: string }[]>([]);
  const [lastRead, setLastRead] = useState<{ slug: string, ch: string, name: string, total: number } | null>(null);

  const [featured, setFeatured] = useState<any[]>([]);
  const [readingPlans, setReadingPlans] = useState<any[]>([]);

  useEffect(() => {
    getBibleContent().then((res) => {
      setFeatured(res.featured.map((f: any) => ({
        slug: f.reference.split(":")[0],
        chapter: f.reference.split(":")[1] || 1,
        label: f.text,
        emoji: f.theme
      })));
      setReadingPlans(res.plans);
    });

    // Load last read
    const lr = localStorage.getItem("last_read");
    if (lr) {
      const [slug, ch] = lr.split(":");
      const b = getBookBySlug(slug);
      if (b) setLastRead({ slug, ch, name: b.name, total: b.chapters });
    }

    // Load bookmarks
    const bms = [];
    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i);
      if (key && key.startsWith("bm:")) {
        const [, slug, ch, v] = key.split(":");
        const b = getBookBySlug(slug);
        if (b) bms.push({ bookSlug: slug, ch, v, name: b.name });
      }
    }
    setBookmarks(bms);
  }, [activeTab]);

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
                  <h3 className="font-bold text-foreground font-serif mb-3 px-1">Featured</h3>
              <div className="grid grid-cols-2 gap-2 mb-6">
                {featured.map((f) => (
                  <Link href={`/bible/${f.slug}/${f.chapter}`} key={f.label} className="bg-card border border-border/60 hover:border-primary/30 p-3 rounded-2xl flex items-center gap-2.5 transition-colors group">
                    <div className="w-8 h-8 rounded-xl bg-primary/10 flex items-center justify-center text-sm shadow-sm group-hover:scale-110 transition-transform">
                      {f.emoji}
                    </div>
                    <span className="text-[11px] font-bold text-foreground leading-tight">{f.label}</span>
                  </Link>
                ))}
              </div>
                </div>

                {/* Continue Reading */}
                {lastRead && (
                  <Link href={`/bible/${lastRead.slug}/${lastRead.ch}`} className="block rounded-2xl p-4 bg-gradient-to-r from-amber-500/10 to-yellow-500/8 dark:from-amber-500/20 dark:to-yellow-500/15 border border-amber-200/50 dark:border-amber-800/30 card-holy card-holy-hover">
                    <p className="text-[10px] font-bold text-primary uppercase tracking-widest mb-1.5">📌 Continue Reading</p>
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="font-bold text-foreground text-lg font-serif">{lastRead.name} · Chapter {lastRead.ch}</p>
                        <p className="text-sm text-muted-foreground">{lastRead.ch} of {lastRead.total} chapters</p>
                      </div>
                      <div className="w-11 h-11 rounded-xl gradient-gold flex items-center justify-center shadow-md halo-glow">
                        <ChevronRight className="w-5 h-5 text-white" />
                      </div>
                    </div>
                  </Link>
                )}

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
                {readingPlans.map((plan, i) => (
                  <div key={i} className="block rounded-2xl p-4 bg-card border border-border/60 card-holy card-holy-hover group">
                    <div className="flex items-start gap-3">
                      <span className="text-3xl">{plan.icon}</span>
                      <div className="flex-1 min-w-0">
                        <div className="flex justify-between items-start mb-1 flex-wrap gap-1">
                          <p className="font-bold text-sm text-foreground font-serif">{plan.title}</p>
                          <Badge className={cn("text-[10px] border-0 px-2", plan.color)}>{plan.duration}</Badge>
                        </div>
                        <div className="flex items-center gap-2 mt-2">
                          <div className="flex-1 h-1.5 rounded-full bg-muted overflow-hidden">
                            <div className="h-full rounded-full gradient-gold transition-all" style={{ width: `${plan.progress}%` }} />
                          </div>
                          <span className="text-[11px] font-bold text-primary">{plan.progress}%</span>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </motion.div>
            )}

            {/* ── BOOKMARKS ── */}
            {activeTab === "Bookmarks" && (
              <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} className="space-y-2">
                <p className="text-xs text-muted-foreground italic font-serif mb-3">
                  "I have hidden your word in my heart." — Psalm 119:11
                </p>
                {bookmarks.length === 0 ? (
                  <div className="text-center py-12 text-muted-foreground">
                    <Bookmark className="w-10 h-10 mx-auto mb-3 opacity-30" />
                    <p className="font-serif font-semibold">No bookmarks yet</p>
                    <p className="text-sm italic mt-1">Tap any verse while reading to bookmark it.</p>
                  </div>
                ) : (
                  <div className="space-y-2">
                    {bookmarks.map((bm, i) => (
                      <Link
                        key={i}
                        href={`/bible/${bm.bookSlug}/${bm.ch}`}
                        className="flex items-center justify-between px-4 py-3 rounded-xl bg-card border border-border/60 card-holy card-holy-hover"
                      >
                        <div>
                          <p className="font-bold text-sm text-foreground font-serif">{bm.name} {bm.ch}:{bm.v}</p>
                        </div>
                        <ChevronRight className="w-4 h-4 text-muted-foreground" />
                      </Link>
                    ))}
                  </div>
                )}
              </motion.div>
            )}
          </>
        )}
      </div>
    </div>
  );
}
