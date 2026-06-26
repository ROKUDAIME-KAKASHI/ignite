"use client";

import { useState, useEffect, useCallback } from "react";
import { useRouter, useParams } from "next/navigation";
import { fetchChapter, TRANSLATIONS, type Translation, type BibleVerse } from "@/lib/bible-api";
import { getBookBySlug, getAdjacentBook } from "@/lib/bible-books";
import { ChevronLeft, ChevronRight, BookOpen, Bookmark, BookmarkCheck, Settings2, Share2, ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import { motion, AnimatePresence } from "framer-motion";
import { cn } from "@/lib/utils";
import Link from "next/link";

// ── Bookmark helpers (localStorage) ──────────────────────────────────────────
function bmKey(bookSlug: string, ch: number, v: number) {
  return `bm:${bookSlug}:${ch}:${v}`;
}
function isBookmarked(bookSlug: string, ch: number, v: number): boolean {
  if (typeof window === "undefined") return false;
  return localStorage.getItem(bmKey(bookSlug, ch, v)) === "1";
}
function toggleBookmark(bookSlug: string, ch: number, v: number): boolean {
  const key = bmKey(bookSlug, ch, v);
  if (localStorage.getItem(key) === "1") {
    localStorage.removeItem(key);
    return false;
  }
  localStorage.setItem(key, "1");
  return true;
}

// ── Skeleton ──────────────────────────────────────────────────────────────────
function VersesSkeleton() {
  return (
    <div className="space-y-4 px-5 py-6 animate-pulse">
      {Array.from({ length: 12 }).map((_, i) => (
        <div key={i} className="space-y-2">
          <div className="h-3 bg-muted rounded-full w-8" />
          <div className="h-4 bg-muted rounded-full" style={{ width: `${60 + Math.random() * 35}%` }} />
          <div className="h-4 bg-muted rounded-full" style={{ width: `${40 + Math.random() * 50}%` }} />
        </div>
      ))}
    </div>
  );
}

// ── Main Reader ───────────────────────────────────────────────────────────────
export default function BibleReaderPage() {
  const params = useParams<{ bookSlug: string; chapter: string }>();
  const router = useRouter();

  const bookSlug = params.bookSlug;
  const chapter = Number(params.chapter);
  const book = getBookBySlug(bookSlug);

  const [translation, setTranslation] = useState<Translation>("kjv");
  const [verses, setVerses] = useState<BibleVerse[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [highlighted, setHighlighted] = useState<number | null>(null);
  const [bookmarks, setBookmarks] = useState<Set<number>>(new Set());
  const [showTranslationPicker, setShowTranslationPicker] = useState(false);
  const [fontSize, setFontSize] = useState<"sm" | "base" | "lg" | "xl">("base");

  // Load bookmarks from localStorage
  useEffect(() => {
    if (!book) return;
    const bms = new Set<number>();
    for (let v = 1; v <= 200; v++) {
      if (isBookmarked(bookSlug, chapter, v)) bms.add(v);
    }
    setBookmarks(bms);
  }, [bookSlug, chapter, book]);

  // Fetch chapter
  const load = useCallback(async () => {
    if (!book) return;
    setLoading(true);
    setError("");
    setVerses([]);
    try {
      const data = await fetchChapter(book.apiName, chapter, translation);
      setVerses(data.verses);
    } catch {
      setError("Could not load scripture. Please check your connection and try again.");
    } finally {
      setLoading(false);
    }
  }, [book, chapter, translation]);

  useEffect(() => { void load(); }, [load]);

  if (!book) {
    return (
      <div className="flex-1 flex items-center justify-center px-6 text-center">
        <div>
          <p className="text-4xl mb-3">✝️</p>
          <p className="font-serif font-bold text-xl text-foreground">Book not found</p>
          <Link href="/bible" className="text-sm text-primary mt-2 block underline">Return to Scripture</Link>
        </div>
      </div>
    );
  }

  const prevChapter = chapter > 1 ? chapter - 1 : null;
  const nextChapter = chapter < book.chapters ? chapter + 1 : null;
  const prevBook = !prevChapter ? getAdjacentBook(bookSlug, "prev") : null;
  const nextBook = !nextChapter ? getAdjacentBook(bookSlug, "next") : null;

  const handleVersePress = (verse: number) => {
    setHighlighted(highlighted === verse ? null : verse);
  };

  const handleBookmark = (verse: number) => {
    const now = toggleBookmark(bookSlug, chapter, verse);
    setBookmarks((prev) => {
      const next = new Set(prev);
      now ? next.add(verse) : next.delete(verse);
      return next;
    });
  };

  const fontSizeClass = {
    sm: "text-sm leading-7",
    base: "text-[15px] leading-8",
    lg: "text-base leading-9",
    xl: "text-lg leading-10",
  }[fontSize];

  return (
    <div className="flex-1 flex flex-col overflow-hidden">

      {/* ── Top Bar ── */}
      <div className="sticky top-0 z-30 glass dark:glass-dark border-b border-amber-200/40 dark:border-amber-900/20">
        <div className="flex items-center justify-between px-3 h-14 gap-2">
          {/* Back */}
          <Link href="/bible" className="w-9 h-9 flex items-center justify-center rounded-xl hover:bg-muted transition-colors">
            <ArrowLeft className="w-5 h-5 text-muted-foreground" />
          </Link>

          {/* Book + Chapter picker */}
          <div className="flex-1 flex flex-col items-center">
            <p className="font-bold text-foreground font-serif text-base leading-tight">{book.name}</p>
            <p className="text-[10px] text-primary font-bold uppercase tracking-widest">Chapter {chapter} of {book.chapters}</p>
          </div>

          {/* Translation */}
          <div className="relative">
            <button
              onClick={() => setShowTranslationPicker(!showTranslationPicker)}
              className="flex items-center gap-1 px-3 py-1.5 rounded-lg bg-primary/10 hover:bg-primary/20 transition-colors"
            >
              <span className="text-xs font-bold text-primary uppercase">{translation}</span>
              <Settings2 className="w-3.5 h-3.5 text-primary" />
            </button>
            <AnimatePresence>
              {showTranslationPicker && (
                <motion.div
                  initial={{ opacity: 0, y: -8, scale: 0.95 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={{ opacity: 0, y: -8, scale: 0.95 }}
                  className="absolute right-0 top-10 glass dark:glass-dark rounded-xl border border-amber-200/50 dark:border-amber-800/30 p-1 w-52 shadow-xl z-50"
                >
                  {TRANSLATIONS.map((t) => (
                    <button
                      key={t.id}
                      onClick={() => { setTranslation(t.id); setShowTranslationPicker(false); }}
                      className={cn(
                        "w-full flex items-center justify-between px-3 py-2.5 rounded-lg text-sm font-medium transition-colors",
                        translation === t.id ? "bg-primary/15 text-primary" : "hover:bg-muted text-foreground"
                      )}
                    >
                      <span className="font-bold">{t.name}</span>
                      <span className="text-xs text-muted-foreground truncate ml-2">{t.full}</span>
                    </button>
                  ))}
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>

        {/* Font size controls */}
        <div className="flex items-center justify-center gap-1 pb-2 px-4">
          {(["sm", "base", "lg", "xl"] as const).map((s, i) => (
            <button
              key={s}
              onClick={() => setFontSize(s)}
              className={cn(
                "flex items-center justify-center w-8 h-7 rounded-lg text-xs font-bold transition-all",
                fontSize === s ? "gradient-gold text-white shadow-sm" : "text-muted-foreground hover:bg-muted"
              )}
              style={{ fontSize: `${10 + i * 2}px` }}
            >
              A
            </button>
          ))}
          <div className="w-px h-4 bg-border mx-1" />
          <button
            onClick={() => { if (navigator.share) navigator.share({ title: `${book.name} ${chapter}`, url: window.location.href }); }}
            className="w-8 h-7 rounded-lg flex items-center justify-center hover:bg-muted text-muted-foreground transition-colors"
          >
            <Share2 className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* ── Verses ── */}
      <div className="flex-1 overflow-y-auto">
        {loading && <VersesSkeleton />}

        {error && (
          <div className="flex flex-col items-center justify-center py-20 px-6 text-center">
            <p className="text-4xl mb-3">🕊️</p>
            <p className="font-serif text-lg font-bold text-foreground mb-2">Could not load scripture</p>
            <p className="text-sm text-muted-foreground mb-4">{error}</p>
            <Button onClick={load} className="gradient-gold text-white rounded-xl">Try Again</Button>
          </div>
        )}

        {!loading && !error && verses.length > 0 && (
          <motion.div
            key={`${bookSlug}-${chapter}-${translation}`}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.3 }}
            className="px-5 pt-6 pb-8"
          >
            {/* Chapter heading */}
            <div className="text-center mb-8">
              <p className="text-[10px] font-bold text-primary uppercase tracking-[0.2em] mb-1">{book.testament === "OT" ? "Old Testament" : "New Testament"} · {book.category}</p>
              <h1 className="font-serif text-3xl font-bold text-foreground">{book.name}</h1>
              <p className="text-muted-foreground text-sm mt-1">Chapter {chapter}</p>
              <div className="divider-cross mt-4" />
            </div>

            {/* Verses */}
            <div className="space-y-1">
              {verses.map((v) => {
                const isHighlighted = highlighted === v.verse;
                const isBookmarkedVerse = bookmarks.has(v.verse);
                return (
                  <motion.div
                    key={v.verse}
                    layout
                    onClick={() => handleVersePress(v.verse)}
                    className={cn(
                      "group relative px-3 py-2 rounded-xl cursor-pointer transition-all duration-200",
                      isHighlighted
                        ? "bg-amber-50 dark:bg-amber-900/20 border border-amber-200/60 dark:border-amber-800/40"
                        : "hover:bg-muted/60"
                    )}
                  >
                    {/* Verse number */}
                    <span className={cn(
                      "inline-flex items-center justify-center text-[10px] font-extrabold rounded-md w-5 h-5 mr-2 align-text-top mt-0.5 shrink-0",
                      isHighlighted
                        ? "gradient-gold text-white"
                        : "text-primary/60 bg-primary/8"
                    )}>
                      {v.verse}
                    </span>

                    {/* Verse text */}
                    <span className={cn("font-serif text-foreground/90", fontSizeClass)}>
                      {v.text.trim()}
                    </span>

                    {/* Bookmark action (shows on highlight) */}
                    <AnimatePresence>
                      {isHighlighted && (
                        <motion.div
                          initial={{ opacity: 0, y: 4 }}
                          animate={{ opacity: 1, y: 0 }}
                          exit={{ opacity: 0, y: 4 }}
                          className="flex items-center gap-2 mt-2 pl-7"
                        >
                          <button
                            onClick={(e) => { e.stopPropagation(); handleBookmark(v.verse); }}
                            className={cn(
                              "flex items-center gap-1.5 text-xs font-semibold px-3 py-1.5 rounded-lg transition-all",
                              isBookmarkedVerse
                                ? "bg-primary/15 text-primary"
                                : "bg-muted text-muted-foreground hover:text-primary"
                            )}
                          >
                            {isBookmarkedVerse
                              ? <><BookmarkCheck className="w-3.5 h-3.5" /> Bookmarked</>
                              : <><Bookmark className="w-3.5 h-3.5" /> Bookmark</>
                            }
                          </button>
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              const ref = `${book.name} ${chapter}:${v.verse} (${translation.toUpperCase()})`;
                              const text = `"${v.text.trim()}" — ${ref}`;
                              if (navigator.share) navigator.share({ text });
                              else navigator.clipboard?.writeText(text);
                            }}
                            className="flex items-center gap-1.5 text-xs font-semibold px-3 py-1.5 rounded-lg bg-muted text-muted-foreground hover:text-primary transition-all"
                          >
                            <Share2 className="w-3.5 h-3.5" /> Share
                          </button>
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </motion.div>
                );
              })}
            </div>

            {/* ── Chapter Navigation ── */}
            <div className="mt-10">
              <div className="divider-cross mb-6" />
              <div className="flex gap-3">
                {/* Previous */}
                {prevChapter ? (
                  <Button
                    asChild
                    variant="outline"
                    className="flex-1 h-12 rounded-xl font-semibold border-border/60 hover:border-primary/40"
                  >
                    <Link href={`/bible/${bookSlug}/${prevChapter}`}>
                      <ChevronLeft className="w-4 h-4 mr-1" />
                      Chapter {prevChapter}
                    </Link>
                  </Button>
                ) : prevBook ? (
                  <Button
                    asChild
                    variant="outline"
                    className="flex-1 h-12 rounded-xl font-semibold border-border/60 hover:border-primary/40"
                  >
                    <Link href={`/bible/${prevBook.slug}/${prevBook.chapters}`}>
                      <ChevronLeft className="w-4 h-4 mr-1" />
                      {prevBook.name}
                    </Link>
                  </Button>
                ) : (
                  <div className="flex-1" />
                )}

                {/* Next */}
                {nextChapter ? (
                  <Button
                    asChild
                    className="flex-1 h-12 rounded-xl font-bold gradient-gold text-white shadow-md"
                  >
                    <Link href={`/bible/${bookSlug}/${nextChapter}`}>
                      Chapter {nextChapter}
                      <ChevronRight className="w-4 h-4 ml-1" />
                    </Link>
                  </Button>
                ) : nextBook ? (
                  <Button
                    asChild
                    className="flex-1 h-12 rounded-xl font-bold gradient-gold text-white shadow-md"
                  >
                    <Link href={`/bible/${nextBook.slug}/1`}>
                      {nextBook.name}
                      <ChevronRight className="w-4 h-4 ml-1" />
                    </Link>
                  </Button>
                ) : (
                  <div className="flex-1 rounded-xl bg-muted flex items-center justify-center h-12 text-xs text-muted-foreground font-semibold">
                    End of Bible
                  </div>
                )}
              </div>

              {/* Chapter grid */}
              <div className="mt-6">
                <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest mb-3">
                  All Chapters of {book.name}
                </p>
                <div className="grid grid-cols-6 gap-1.5">
                  {Array.from({ length: book.chapters }, (_, i) => i + 1).map((ch) => (
                    <Link
                      key={ch}
                      href={`/bible/${bookSlug}/${ch}`}
                      className={cn(
                        "flex items-center justify-center h-9 rounded-lg text-xs font-bold transition-all",
                        ch === chapter
                          ? "gradient-gold text-white shadow-sm"
                          : "bg-muted text-muted-foreground hover:bg-primary/10 hover:text-primary"
                      )}
                    >
                      {ch}
                    </Link>
                  ))}
                </div>
              </div>
            </div>
          </motion.div>
        )}
      </div>
    </div>
  );
}
