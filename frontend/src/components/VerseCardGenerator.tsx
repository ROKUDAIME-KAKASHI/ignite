"use client";

import { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Download, Share2, X, Sparkles, Loader2, Check } from "lucide-react";
import { Button } from "@/components/ui/button";

interface VerseCardGeneratorProps {
  verseText: string;
  reference: string;
  isOpen: boolean;
  onClose: () => void;
}

interface ThemeConfig {
  id: string;
  name: string;
  bgCss: string;
  borderCss: string;
  textCss: string;
  accentCss: string;
  subTextCss: string;
  accentColorHex: string;
}

const THEMES: ThemeConfig[] = [
  { id: "gold", name: "Deep Gold", bgCss: "from-amber-950 via-amber-900 to-amber-950", borderCss: "border-amber-500/40", textCss: "text-amber-100", accentCss: "text-amber-400", subTextCss: "text-amber-200/70", accentColorHex: "#fbbf24" },
  { id: "midnight", name: "Midnight", bgCss: "from-slate-950 via-indigo-950 to-slate-900", borderCss: "border-indigo-500/40", textCss: "text-slate-100", accentCss: "text-indigo-400", subTextCss: "text-indigo-200/70", accentColorHex: "#818cf8" },
  { id: "royal", name: "Royal Purple", bgCss: "from-purple-950 via-violet-900 to-purple-950", borderCss: "border-purple-500/40", textCss: "text-purple-100", accentCss: "text-purple-300", subTextCss: "text-purple-200/70", accentColorHex: "#c084fc" },
  { id: "parchment", name: "Parchment", bgCss: "from-amber-100 via-stone-200 to-amber-50", borderCss: "border-amber-800/30", textCss: "text-stone-900", accentCss: "text-amber-800", subTextCss: "text-amber-900/70", accentColorHex: "#92400e" },
  { id: "emerald", name: "Emerald", bgCss: "from-emerald-950 via-teal-950 to-emerald-900", borderCss: "border-emerald-500/40", textCss: "text-emerald-100", accentCss: "text-emerald-400", subTextCss: "text-emerald-200/70", accentColorHex: "#34d399" },
  { id: "crimson", name: "Crimson Rose", bgCss: "from-rose-950 via-red-950 to-rose-950", borderCss: "border-rose-500/40", textCss: "text-rose-100", accentCss: "text-rose-400", subTextCss: "text-rose-200/70", accentColorHex: "#fb7185" },
  { id: "ocean", name: "Celestial Ocean", bgCss: "from-sky-950 via-cyan-950 to-sky-900", borderCss: "border-sky-500/40", textCss: "text-sky-100", accentCss: "text-sky-400", subTextCss: "text-sky-200/70", accentColorHex: "#38bdf8" },
  { id: "velvet", name: "Holy Velvet", bgCss: "from-fuchsia-950 via-purple-950 to-fuchsia-950", borderCss: "border-amber-500/40", textCss: "text-fuchsia-100", accentCss: "text-amber-400", subTextCss: "text-purple-200/70", accentColorHex: "#fbbf24" },
  { id: "terracotta", name: "Sunset Grace", bgCss: "from-orange-950 via-amber-950 to-orange-950", borderCss: "border-orange-500/40", textCss: "text-orange-100", accentCss: "text-orange-400", subTextCss: "text-orange-200/70", accentColorHex: "#fb923c" },
  { id: "onyx", name: "Obsidian Onyx", bgCss: "from-zinc-950 via-stone-900 to-zinc-950", borderCss: "border-zinc-500/40", textCss: "text-zinc-100", accentCss: "text-zinc-300", subTextCss: "text-zinc-400", accentColorHex: "#d4d4d8" },
];

export function VerseCardGenerator({ verseText, reference, isOpen, onClose }: VerseCardGeneratorProps) {
  const [selectedTheme, setSelectedTheme] = useState(THEMES[0]);
  const [loading, setLoading] = useState(false);
  const [savedSuccess, setSavedSuccess] = useState(false);
  const hdCardRef = useRef<HTMLDivElement>(null);

  // Prevent background scrolling when modal is open
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    return () => {
      document.body.style.overflow = "";
    };
  }, [isOpen]);

  // Exact 1:1 WYSIWYG Renderer using html2canvas on HD replica
  const generateHDImage = async (): Promise<string | null> => {
    if (!hdCardRef.current) return null;
    try {
      const html2canvas = (await import("html2canvas")).default;
      const canvas = await html2canvas(hdCardRef.current, {
        scale: 2, // 2160 x 2700 4K Ultra-HD crisp quality
        useCORS: true,
        backgroundColor: null,
        logging: false,
      });
      return canvas.toDataURL("image/png", 1.0);
    } catch (e) {
      console.error("HD Card rendering failed:", e);
      return null;
    }
  };

  const handleDownload = async () => {
    setLoading(true);
    try {
      const dataUrl = await generateHDImage();
      if (dataUrl) {
        const link = document.createElement("a");
        link.download = `IGNITE_${reference.replace(/[^a-zA-Z0-9]/g, "_")}.png`;
        link.href = dataUrl;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);

        setSavedSuccess(true);
        setTimeout(() => setSavedSuccess(false), 2500);
      }
    } catch (e) {
      console.error("Download failed:", e);
    } finally {
      setLoading(false);
    }
  };

  const handleShare = async () => {
    setLoading(true);
    try {
      const dataUrl = await generateHDImage();
      if (dataUrl && typeof navigator !== "undefined" && navigator.share) {
        const res = await fetch(dataUrl);
        const blob = await res.blob();
        const file = new File([blob], `IGNITE_${reference.replace(/[^a-zA-Z0-9]/g, "_")}.png`, { type: "image/png" });

        try {
          await navigator.share({
            title: `IGNITE Daily Bread: ${reference}`,
            text: `"${verseText}" — ${reference}`,
            files: [file],
          });
          setLoading(false);
          return;
        } catch (e) {
          console.log("Web Share cancelled/unsupported:", e);
        }
      }
      await handleDownload();
    } catch {
      await handleDownload();
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-4 bg-black/90 backdrop-blur-md overflow-hidden">
        {/* Hidden 1080x1350 HD Replica Container for 100% WYSIWYG 4K Rendering */}
        <div className="fixed top-[-9999px] left-[-9999px] pointer-events-none opacity-0">
          <div
            ref={hdCardRef}
            style={{ width: "1080px", height: "1350px" }}
            className={`rounded-[40px] p-16 bg-gradient-to-br ${selectedTheme.bgCss} border-[8px] ${selectedTheme.borderCss} shadow-2xl flex flex-col justify-between relative overflow-hidden font-sans`}
          >
            {/* Top Branding */}
            <div className="flex items-center justify-between relative z-10 w-full border-b border-white/20 pb-8">
              <span className={`text-4xl font-black uppercase tracking-widest font-serif ${selectedTheme.accentCss}`}>
                IGNITE 🕊️
              </span>
              <span className={`text-2xl font-bold tracking-wider uppercase ${selectedTheme.subTextCss}`}>
                Daily Bread
              </span>
            </div>

            {/* Verse Content */}
            <div className="relative z-10 my-auto text-center space-y-8 px-6">
              <p className={`text-5xl font-serif italic leading-relaxed ${selectedTheme.textCss} drop-shadow-md`}>
                "{verseText.replace(/[*_~\[\]]/g, '').trim()}"
              </p>
              <div className="w-24 h-1.5 mx-auto bg-amber-500/60 rounded-full" />
              <p className={`text-3xl font-extrabold uppercase tracking-widest ${selectedTheme.accentCss}`}>
                {reference}
              </p>
            </div>

            {/* Footer */}
            <div className="relative z-10 text-center border-t border-white/20 pt-6">
              <p className={`text-xl font-bold tracking-wider uppercase ${selectedTheme.subTextCss}`}>
                IGNITE • Scripture & Fellowship
              </p>
            </div>
          </div>
        </div>

        {/* Visible Modal Dialog (Compact & Guaranteed 0-Scroll Viewport) */}
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 10 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 10 }}
          className="bg-card border border-border/60 rounded-3xl p-3 sm:p-4 max-w-[340px] sm:max-w-sm w-full shadow-2xl relative flex flex-col space-y-2.5 max-h-[88vh] my-auto overflow-hidden"
        >
          {/* TOP FIXED ACTION BAR (Save Image, Share, Close Button X) */}
          <div className="flex items-center justify-between gap-2 shrink-0 border-b border-border/50 pb-2">
            <div className="flex items-center gap-1.5 flex-1">
              <Button
                onClick={handleDownload}
                disabled={loading}
                size="sm"
                className="gradient-gold text-white rounded-xl h-9 px-3 text-xs font-bold shadow-md hover:opacity-90 flex-1"
              >
                {loading ? (
                  <Loader2 className="w-3.5 h-3.5 mr-1 animate-spin text-white" />
                ) : savedSuccess ? (
                  <Check className="w-3.5 h-3.5 mr-1 text-white" />
                ) : (
                  <Download className="w-3.5 h-3.5 mr-1 text-white" />
                )}
                {savedSuccess ? "Saved!" : "Save Card"}
              </Button>

              <Button
                onClick={handleShare}
                disabled={loading}
                variant="outline"
                size="sm"
                className="rounded-xl h-9 px-2.5 text-xs font-bold border-amber-500/30 hover:bg-amber-500/10"
              >
                {loading ? <Loader2 className="w-3.5 h-3.5 animate-spin text-amber-500" /> : <Share2 className="w-3.5 h-3.5 text-amber-500" />}
              </Button>
            </div>

            <button
              onClick={onClose}
              className="w-8 h-8 rounded-xl bg-muted hover:bg-muted/80 flex items-center justify-center text-muted-foreground transition border border-border/40 shrink-0"
              title="Close"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          {/* Theme Selector - 10 Templates */}
          <div className="flex gap-1.5 overflow-x-auto pb-1 scrollbar-hide shrink-0">
            {THEMES.map((t) => (
              <button
                key={t.id}
                onClick={() => setSelectedTheme(t)}
                className={`px-2.5 py-0.5 rounded-lg text-[10px] font-bold whitespace-nowrap transition border ${
                  selectedTheme.id === t.id ? "bg-amber-500 text-white border-amber-400 shadow-sm" : "bg-muted text-muted-foreground border-transparent"
                }`}
              >
                {t.name}
              </button>
            ))}
          </div>

          {/* Rendered Verse Card Preview (Scales smoothly to fit viewport without scrolling) */}
          <div
            className={`w-full aspect-[4/5] max-h-[46vh] rounded-2xl p-4 bg-gradient-to-br ${selectedTheme.bgCss} border-2 ${selectedTheme.borderCss} shadow-xl flex flex-col justify-between relative overflow-hidden text-left shrink mx-auto`}
          >
            {/* Top Branding */}
            <div className="flex items-center justify-between relative z-10 w-full border-b border-white/15 pb-2">
              <span className={`text-[11px] font-extrabold uppercase tracking-widest font-serif ${selectedTheme.accentCss}`}>
                IGNITE 🕊️
              </span>
              <span className={`text-[9px] font-bold tracking-wider uppercase ${selectedTheme.subTextCss}`}>
                Daily Bread
              </span>
            </div>

            {/* Verse Content */}
            <div className="relative z-10 my-auto text-center space-y-2 px-1">
              <p className={`text-xs sm:text-sm font-serif italic leading-relaxed line-clamp-5 drop-shadow-sm ${selectedTheme.textCss}`}>
                "{verseText.replace(/[*_~\[\]]/g, '').trim()}"
              </p>
              <div className="w-8 h-0.5 mx-auto bg-amber-500/50 rounded-full" />
              <p className={`text-[10px] font-extrabold uppercase tracking-widest ${selectedTheme.accentCss}`}>
                {reference}
              </p>
            </div>

            {/* Footer */}
            <div className="relative z-10 text-center border-t border-white/15 pt-2">
              <p className={`text-[8px] font-semibold tracking-wider uppercase ${selectedTheme.subTextCss}`}>
                IGNITE • Scripture & Fellowship
              </p>
            </div>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}
