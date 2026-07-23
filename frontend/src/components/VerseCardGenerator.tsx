"use client";

import { useState, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Download, Share2, X, Sparkles, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";

interface VerseCardGeneratorProps {
  verseText: string;
  reference: string;
  isOpen: boolean;
  onClose: () => void;
}

const THEMES = [
  { id: "gold", name: "Deep Gold", bg: "from-amber-950 via-amber-900 to-amber-950", border: "border-amber-500/40", text: "text-amber-100", accent: "text-amber-400" },
  { id: "midnight", name: "Midnight", bg: "from-slate-950 via-indigo-950 to-slate-900", border: "border-indigo-500/40", text: "text-slate-100", accent: "text-indigo-400" },
  { id: "royal", name: "Royal Purple", bg: "from-purple-950 via-violet-900 to-purple-950", border: "border-purple-500/40", text: "text-purple-100", accent: "text-purple-300" },
  { id: "parchment", name: "Parchment", bg: "from-amber-100 via-stone-200 to-amber-50", border: "border-amber-800/30", text: "text-stone-900", accent: "text-amber-800" },
  { id: "emerald", name: "Emerald", bg: "from-emerald-950 via-teal-950 to-emerald-900", border: "border-emerald-500/40", text: "text-emerald-100", accent: "text-emerald-400" },
];

export function VerseCardGenerator({ verseText, reference, isOpen, onClose }: VerseCardGeneratorProps) {
  const [selectedTheme, setSelectedTheme] = useState(THEMES[0]);
  const cardRef = useRef<HTMLDivElement>(null);
  const [loading, setLoading] = useState(false);

  const generateCanvasImage = async (): Promise<Blob | null> => {
    if (!cardRef.current) return null;
    try {
      const html2canvas = (await import("html2canvas")).default;
      const canvas = await html2canvas(cardRef.current, {
        scale: 2, // Optimized scale for mobile performance & clarity
        useCORS: true,
        backgroundColor: null,
      });

      return new Promise((resolve) => {
        canvas.toBlob((blob) => resolve(blob), "image/png", 1.0);
      });
    } catch (e) {
      console.error("Failed to render verse card canvas:", e);
      return null;
    }
  };

  const handleDownload = async () => {
    setLoading(true);
    try {
      const blob = await generateCanvasImage();
      if (blob) {
        const url = URL.createObjectURL(blob);
        const a = document.createElement("a");
        a.style.display = "none";
        a.href = url;
        a.download = `IGNITE-${reference.replace(/[^a-zA-Z0-9]/g, "_")}.png`;
        document.body.appendChild(a);
        a.click();
        setTimeout(() => {
          document.body.removeChild(a);
          URL.revokeObjectURL(url);
        }, 1000);
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
      const blob = await generateCanvasImage();
      if (blob && typeof navigator !== "undefined" && navigator.share && navigator.canShare) {
        const file = new File([blob], `IGNITE-${reference.replace(/[^a-zA-Z0-9]/g, "_")}.png`, { type: "image/png" });
        if (navigator.canShare({ files: [file] })) {
          await navigator.share({
            title: `IGNITE Daily Bread: ${reference}`,
            text: `"${verseText}" — ${reference}`,
            files: [file],
          });
          setLoading(false);
          return;
        }
      }
      // Fallback to download if Web Share API with files is not supported
      await handleDownload();
    } catch (e) {
      console.log("Share cancelled or failed:", e);
      await handleDownload();
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/85 backdrop-blur-md overflow-y-auto">
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 10 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 10 }}
          className="bg-card border border-border/60 rounded-3xl p-4 sm:p-5 max-w-sm w-full shadow-2xl relative flex flex-col space-y-4 my-auto"
        >
          {/* Header */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Sparkles className="w-5 h-5 text-amber-500" />
              <h2 className="text-sm sm:text-base font-bold font-serif text-foreground">Scripture Card</h2>
            </div>
            <button onClick={onClose} className="w-8 h-8 rounded-full bg-muted flex items-center justify-center hover:bg-muted/80 transition">
              <X className="w-4 h-4 text-muted-foreground" />
            </button>
          </div>

          {/* Theme Selector */}
          <div className="flex gap-2 overflow-x-auto pb-1 scrollbar-hide">
            {THEMES.map((t) => (
              <button
                key={t.id}
                onClick={() => setSelectedTheme(t)}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold whitespace-nowrap transition border ${
                  selectedTheme.id === t.id ? "bg-amber-500 text-white border-amber-400" : "bg-muted text-muted-foreground border-transparent"
                }`}
              >
                {t.name}
              </button>
            ))}
          </div>

          {/* Rendered Verse Card Preview */}
          <div
            ref={cardRef}
            className={`w-full aspect-[4/5] rounded-3xl p-5 sm:p-6 bg-gradient-to-br ${selectedTheme.bg} border-2 ${selectedTheme.border} shadow-2xl flex flex-col justify-between relative overflow-hidden text-left`}
          >
            {/* Top Branding - Clean & Minimal */}
            <div className="flex items-center justify-between relative z-10 w-full border-b border-white/10 pb-3">
              <span className={`text-xs font-extrabold uppercase tracking-widest ${selectedTheme.accent} font-serif`}>
                IGNITE 🕊️
              </span>
              <span className="text-[11px] font-bold tracking-wider text-white/90 uppercase">
                Daily Bread
              </span>
            </div>

            {/* Verse Content */}
            <div className="relative z-10 my-auto text-center space-y-3 px-1">
              <p className={`text-sm sm:text-base font-serif italic leading-relaxed ${selectedTheme.text} drop-shadow-sm`}>
                "{verseText}"
              </p>
              <div className="w-10 h-0.5 mx-auto bg-amber-500/50 rounded-full" />
              <p className={`text-xs font-bold uppercase tracking-widest ${selectedTheme.accent}`}>
                {reference}
              </p>
            </div>

            {/* Footer */}
            <div className="relative z-10 text-center border-t border-white/10 pt-2.5">
              <p className="text-[9px] text-white/60 font-semibold tracking-wider uppercase">
                IGNITE • Scripture & Fellowship
              </p>
            </div>
          </div>

          {/* Actions - Mobile Touch Friendly */}
          <div className="grid grid-cols-2 gap-2.5 pt-1">
            <Button
              onClick={handleDownload}
              disabled={loading}
              variant="outline"
              className="rounded-2xl h-12 text-xs font-bold border-amber-500/30 hover:bg-amber-500/10 active:scale-95 transition-transform"
            >
              {loading ? <Loader2 className="w-4 h-4 mr-1.5 animate-spin text-amber-500" /> : <Download className="w-4 h-4 mr-1.5 text-amber-500" />}
              Save Image
            </Button>

            <Button
              onClick={handleShare}
              disabled={loading}
              className="gradient-gold text-white rounded-2xl h-12 text-xs font-bold shadow-md hover:opacity-90 active:scale-95 transition-transform"
            >
              {loading ? <Loader2 className="w-4 h-4 mr-1.5 animate-spin text-white" /> : <Share2 className="w-4 h-4 mr-1.5" />}
              Share Card
            </Button>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}
