"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import { useRouter, useParams } from "next/navigation";
import { fetchChapter, TRANSLATIONS, type Translation, type BibleVerse } from "@/lib/bible-api";
import { getBookBySlug, getAdjacentBook } from "@/lib/bible-books";
import { Book, ChevronLeft, ChevronRight, Share2, Sparkles, AlertCircle, Bookmark, BookmarkCheck, Settings2, ArrowLeft, Clock as ClockIcon, Volume2, VolumeX } from "lucide-react";
import { Button, buttonVariants } from "@/components/ui/button";
import { motion, AnimatePresence } from "framer-motion";
import { cn } from "@/lib/utils";
import Link from "next/link";
import { awardXP } from "@/app/actions/gamification";
import { useAuth } from "@/context/AuthContext";
import { Loader2 } from "lucide-react";
import { getDatabaseBookmarks, toggleDatabaseBookmark } from "../../actions";

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
  const [markingRead, setMarkingRead] = useState(false);
  const [markedRead, setMarkedRead] = useState(false);
  const [isReading, setIsReading] = useState(false);
  const readingRef = useRef(false);

  // Load voices on mount for browser voice list caching
  useEffect(() => {
    if (typeof window !== "undefined" && "speechSynthesis" in window) {
      window.speechSynthesis.getVoices();
      const handleVoices = () => {
        window.speechSynthesis.getVoices();
      };
      window.addEventListener("voiceschanged", handleVoices);
      return () => window.removeEventListener("voiceschanged", handleVoices);
    }
  }, []);
  
  // Timer state
  const [timeLeft, setTimeLeft] = useState(60);
  const [isActive, setIsActive] = useState(true);

  const { user, setUser } = useAuth();

  // Handle Inactivity
  useEffect(() => {
    let idleTimeout: NodeJS.Timeout;
    const resetIdle = () => {
      setIsActive(true);
      clearTimeout(idleTimeout);
      idleTimeout = setTimeout(() => setIsActive(false), 15000); // 15 seconds of no interaction = idle
    };

    window.addEventListener("mousemove", resetIdle);
    window.addEventListener("keydown", resetIdle);
    window.addEventListener("scroll", resetIdle, true);
    window.addEventListener("touchstart", resetIdle);

    resetIdle();
    return () => {
      clearTimeout(idleTimeout);
      window.removeEventListener("mousemove", resetIdle);
      window.removeEventListener("keydown", resetIdle);
      window.removeEventListener("scroll", resetIdle, true);
      window.removeEventListener("touchstart", resetIdle);
    };
  }, []);

  // Countdown logic
  useEffect(() => {
    if (timeLeft <= 0) return;
    const interval = setInterval(() => {
      if (isActive && !document.hidden) {
        setTimeLeft(t => Math.max(0, t - 1));
      }
    }, 1000);
    return () => clearInterval(interval);
  }, [timeLeft, isActive]);

  // Load bookmarks from Database
  useEffect(() => {
    if (!book) return;
    getDatabaseBookmarks().then(bms => {
      const chapterBms = new Set<number>();
      bms.forEach(bm => {
        if (bm.bookSlug === bookSlug && bm.chapter === chapter) {
          chapterBms.add(bm.verse);
        }
      });
      setBookmarks(chapterBms);
    });
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
      // Calculate dynamic reading time: 3 seconds per verse, between 15s and 3 mins.
      const dynamicTime = Math.min(180, Math.max(15, data.verses.length * 3));
      setTimeLeft(dynamicTime);
    } catch {
      setError("Could not load scripture. Please check your connection and try again.");
    } finally {
      setLoading(false);
    }
  }, [book, chapter, translation]);

  useEffect(() => { 
    setMarkedRead(false);
    void load(); 
    if (book) {
      localStorage.setItem("last_read", `${book.slug}:${chapter}`);
    }
  }, [load, book, chapter]);

  // Stop speaking when leaving page
  useEffect(() => {
    return () => {
      if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
        window.speechSynthesis.cancel();
      }
    };
  }, []);

  const prevChapter = chapter > 1 ? chapter - 1 : null;
  const nextChapter = chapter < book?.chapters ? chapter + 1 : null;
  const prevBook = !prevChapter && bookSlug ? getAdjacentBook(bookSlug, "prev") : null;
  const nextBook = !nextChapter && bookSlug ? getAdjacentBook(bookSlug, "next") : null;

  const handleVersePress = (verse: number) => {
    setHighlighted(highlighted === verse ? null : verse);
  };

  const handleBookmark = async (verse: number) => {
    const verseText = verses.find(v => v.verse === verse)?.text;
    const isCurrentlyBookmarked = bookmarks.has(verse);
    
    // Optimistic UI update
    setBookmarks(prev => {
      const next = new Set(prev);
      isCurrentlyBookmarked ? next.delete(verse) : next.add(verse);
      return next;
    });

    const res = await toggleDatabaseBookmark(bookSlug, chapter, verse, verseText);
    if (!res.success) {
      // Revert if failed
      setBookmarks(prev => {
        const next = new Set(prev);
        isCurrentlyBookmarked ? next.add(verse) : next.delete(verse);
        return next;
      });
    }
  };

  const handleMarkAsRead = async () => {
    if (!user || markedRead || !book) return;
    setMarkingRead(true);
    const res = await awardXP(10, `Read Scripture: ${book.name} ${chapter}`);
    if (res.success && res.xp) {
      setUser({ ...user, xp: res.xp, level: res.level });
      setMarkedRead(true);
    }
    setMarkingRead(false);
  };

  const speakVerse = useCallback((index: number) => {
    if (!readingRef.current) return;
    if (typeof window === 'undefined' || !('speechSynthesis' in window)) return;

    if (index >= verses.length) {
      setIsReading(false);
      readingRef.current = false;
      setHighlighted(null);
      return;
    }

    const verseObj = verses[index];
    setHighlighted(verseObj.verse);

    // Scroll highlighted verse into view gently
    const el = document.getElementById(`v-${verseObj.verse}`);
    if (el) {
      el.scrollIntoView({ behavior: 'smooth', block: 'center' });
    }

    window.speechSynthesis.cancel();

    const cleanText = verseObj.text.replace(/[*_~\[\]]/g, '').trim();
    const utterance = new SpeechSynthesisUtterance(cleanText);

    const voices = window.speechSynthesis.getVoices();
    
    // Structured cross-platform voice priority (aiming for a clear, deep male English voice)
    const preferredVoice = 
      voices.find(v => v.lang === 'en-GB' && v.name.toLowerCase().includes('google') && v.name.toLowerCase().includes('male')) ||
      voices.find(v => v.lang === 'en-GB' && v.name.toLowerCase().includes('male')) ||
      voices.find(v => v.lang === 'en-US' && (v.name.includes('David') || v.name.toLowerCase().includes('google') || v.name.toLowerCase().includes('male'))) ||
      voices.find(v => v.lang.startsWith('en') && v.name.toLowerCase().includes('male')) ||
      voices.find(v => v.lang.startsWith('en')) ||
      voices[0];
      
    utterance.rate = 0.92; // Slightly slowed for a calm, reverent reading pace
    utterance.pitch = 0.85; // Low pitch for a deep, narrative voice tone
    
    if (preferredVoice) utterance.voice = preferredVoice;

    utterance.onend = () => {
      if (readingRef.current) {
        speakVerse(index + 1);
      }
    };
    utterance.onerror = (e) => {
      console.error("TTS error:", e);
      if (readingRef.current) {
        speakVerse(index + 1);
      }
    };

    window.speechSynthesis.speak(utterance);
  }, [verses]);

  const toggleReading = () => {
    if (typeof window === 'undefined' || !('speechSynthesis' in window)) return;
    
    if (isReading) {
      readingRef.current = false;
      setIsReading(false);
      window.speechSynthesis.cancel();
      setHighlighted(null);
      return;
    }

    readingRef.current = true;
    setIsReading(true);
    speakVerse(0);
  };

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

          {/* Audio Reading */}
          <button
            onClick={toggleReading}
            className={cn(
              "w-9 h-9 flex items-center justify-center rounded-xl transition-colors",
              isReading ? "bg-primary/20 text-primary" : "hover:bg-muted text-muted-foreground"
            )}
            title={isReading ? "Stop Reading" : "Read Aloud"}
          >
            {isReading ? <VolumeX className="w-5 h-5 animate-pulse" /> : <Volume2 className="w-5 h-5" />}
          </button>

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
                "flex items-center justify-center w-8 h-7 rounded-lg text-xs font-bold transition",
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
                    id={`v-${v.verse}`}
                    layout
                    onClick={() => handleVersePress(v.verse)}
                    className={cn(
                      "group relative px-3 py-2 rounded-xl cursor-pointer transition duration-200",
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
                              "flex items-center gap-1.5 text-xs font-semibold px-3 py-1.5 rounded-lg transition",
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
                            className="flex items-center gap-1.5 text-xs font-semibold px-3 py-1.5 rounded-lg bg-muted text-muted-foreground hover:text-primary transition"
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
              <div className="flex flex-col items-center mb-8 space-y-3">
                {timeLeft > 0 ? (
                  <div className="flex flex-col items-center text-center p-3 rounded-xl bg-muted/50 border border-border/50">
                    <div className="flex items-center gap-2 text-primary font-bold mb-1">
                      <ClockIcon className="w-5 h-5 animate-pulse" />
                      <span>{Math.floor(timeLeft / 60)}:{(timeLeft % 60).toString().padStart(2, "0")}</span>
                    </div>
                    <p className="text-xs text-muted-foreground font-medium">
                      {!isActive 
                        ? "Paused (Are you still there? Scroll to resume)" 
                        : "Active reading required to earn XP"}
                    </p>
                  </div>
                ) : (
                  <Button 
                    onClick={handleMarkAsRead} 
                    disabled={markedRead || markingRead}
                    className={cn(
                      "rounded-xl h-12 px-8 font-bold shadow-md transition",
                      markedRead ? "bg-green-500/20 text-green-600 dark:text-green-400 border border-green-500/30" : "gradient-gold text-white halo-glow"
                    )}
                  >
                    {markingRead ? <Loader2 className="w-4 h-4 animate-spin" /> : 
                     markedRead ? "Chapter Read (+10 XP) ✅" : "Mark Chapter as Read (+10 XP)"}
                  </Button>
                )}
              </div>
              <div className="divider-cross mb-6" />
              <div className="flex gap-3">
                {/* Previous */}
                {prevChapter ? (
                  <Link
                    href={`/bible/${bookSlug}/${prevChapter}`}
                    className={cn(buttonVariants({ variant: "outline" }), "flex-1 h-12 rounded-xl font-semibold border-border/60 hover:bg-muted")}
                  >
                    <ChevronLeft className="w-5 h-5 mr-1" />
                    Previous
                  </Link>
                ) : prevBook ? (
                  <Link
                    href={`/bible/${prevBook.slug}/${prevBook.chapters}`}
                    className={cn(buttonVariants({ variant: "outline" }), "flex-1 h-12 rounded-xl font-semibold border-border/60 hover:bg-muted")}
                  >
                    <ChevronLeft className="w-5 h-5 mr-1" />
                    {prevBook.name}
                  </Link>
                ) : (
                  <div className="flex-1" />
                )}

                {/* Next */}
                {nextChapter ? (
                  <Link
                    href={`/bible/${bookSlug}/${nextChapter}`}
                    className={cn(buttonVariants({ variant: "outline" }), "flex-1 h-12 rounded-xl font-semibold border-border/60 hover:bg-muted")}
                  >
                    Next
                    <ChevronRight className="w-5 h-5 ml-1" />
                  </Link>
                ) : nextBook ? (
                  <Link
                    href={`/bible/${nextBook.slug}/1`}
                    className={cn(buttonVariants({ variant: "default" }), "flex-1 h-12 rounded-xl font-bold gradient-gold text-white shadow-md")}
                  >
                    {nextBook.name}
                    <ChevronRight className="w-4 h-4 ml-1" />
                  </Link>
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
                        "flex items-center justify-center h-9 rounded-lg text-xs font-bold transition",
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
