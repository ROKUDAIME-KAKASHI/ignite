"use client";

import { useState, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Download, Share2, X, Sparkles, Image as ImageIcon } from "lucide-react";
import { Button } from "@/components/ui/button";

interface VerseCardGeneratorProps {
  verseText: string;
  reference: string;
  isOpen: boolean;
  onClose: () => void;
}

const THEMES = [
  { id: "gold", name: "Deep Gold", bg: "from-amber-950 via-amber-900 to-amber-950", border: "border-amber-500/40", text: "text-amber-100", accent: "text-amber-400" },
  { id: "midnight", name: "Orthodox Midnight", bg: "from-slate-950 via-indigo-950 to-slate-900", border: "border-indigo-500/40", text: "text-slate-100", accent: "text-indigo-400" },
  { id: "royal", name: "Royal Purple", bg: "from-purple-950 via-violet-900 to-purple-950", border: "border-purple-500/40", text: "text-purple-100", accent: "text-purple-300" },
  { id: "parchment", name: "Ancient Parchment", bg: "from-amber-100 via-stone-200 to-amber-50", border: "border-amber-800/30", text: "text-stone-900", accent: "text-amber-800" },
  { id: "emerald", name: "Eden Emerald", bg: "from-emerald-950 via-teal-950 to-emerald-900", border: "border-emerald-500/40", text: "text-emerald-100", accent: "text-emerald-400" },
];

export function VerseCardGenerator({ verseText, reference, isOpen, onClose }: VerseCardGeneratorProps) {
  const [selectedTheme, setSelectedTheme] = useState(THEMES[0]);
  const cardRef = useRef<HTMLDivElement>(null);
  const [downloading, setDownloading] = useState(false);

  const generateCanvasImage = async (): Promise<string | null> => {
    if (!cardRef.current) return null;
    try {
      const html2canvas = (await import("html2canvas")).default;
      const canvas = await html2canvas(cardRef.current, {
        scale: 3, // HD quality for mobile retina displays & Instagram Stories
        useCORS: true,
        backgroundColor: null,
      });
      return canvas.toDataURL("image/png");
    } catch (e) {
      console.error("Failed to render verse card canvas:", e);
      return null;
    }
  };

  const handleDownload = async () => {
    setDownloading(true);
    const dataUrl = await generateCanvasImage();
    if (dataUrl) {
      const link = document.createElement("a");
      link.download = `Ignite-Verse-${reference.replace(/\s+/g, "_")}.png`;
      link.href = dataUrl;
      link.click();
    }
    setDownloading(false);
  };

  const handleShare = async () => {
    setDownloading(true);
    const dataUrl = await generateCanvasImage();
    if (dataUrl && typeof navigator !== "undefined" && navigator.share) {
      try {
        const response = await fetch(dataUrl);
        const blob = await response.blob();
        const file = new File([blob], `Ignite-Verse.png`, { type: "image/png" });

        await navigator.share({
          title: `Scripture: ${reference}`,
          text: `"${verseText}" — ${reference}\nShared via Ignite App 🕊️`,
          files: [file],
        });
      } catch (e) {
        console.log("Web Share cancelled or not supported:", e);
      }
    } else {
      handleDownload();
    }
    setDownloading(false);
  };

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md">
        <motion.div
          initial={{ opacity: 0, scale: 0.9, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.9, y: 20 }}
          className="bg-card border border-border/60 rounded-3xl p-5 max-w-md w-full shadow-2xl relative flex flex-col space-y-4 max-h-[90vh] overflow-y-auto"
        >
          {/* Header */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Sparkles className="w-5 h-5 text-amber-500" />
              <h2 className="text-base font-bold font-serif text-foreground">Scripture Card Generator</h2>
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
            className={`w-full aspect-[4/5] rounded-3xl p-6 bg-gradient-to-br ${selectedTheme.bg} border-2 ${selectedTheme.border} shadow-2xl flex flex-col justify-between relative overflow-hidden`}
          >
            {/* Jacobite Orthodox Cross / Emblem watermark background */}
            <div className="absolute inset-0 flex items-center justify-center opacity-10 pointer-events-none">
              <div className="w-48 h-48 rounded-full border-[12px] border-white flex items-center justify-center font-serif text-6xl">☦</div>
            </div>

            {/* Top Branding */}
            <div className="flex items-center justify-between relative z-10">
              <span className={`text-[11px] font-bold uppercase tracking-widest ${selectedTheme.accent} font-serif`}>
                Ignite 🕊️ Jacobite Orthodox
              </span>
              <span className="text-[10px] opacity-60 text-white">Daily Bread</span>
            </div>

            {/* Verse Content */}
            <div className="relative z-10 my-auto text-center space-y-3 px-2">
              <p className={`text-base sm:text-lg font-serif italic leading-relaxed ${selectedTheme.text} drop-shadow-md`}>
                "{verseText}"
              </p>
              <div className="w-12 h-0.5 mx-auto bg-amber-500/50 rounded-full" />
              <p className={`text-xs font-bold uppercase tracking-widest ${selectedTheme.accent}`}>
                {reference}
              </p>
            </div>

            {/* Footer */}
            <div className="relative z-10 text-center border-t border-white/10 pt-3">
              <p className="text-[10px] text-white/70 font-semibold tracking-wider">
                ignite-youth.app • Faith • Scripture • Fellowship
              </p>
            </div>
          </div>

          {/* Actions */}
          <div className="grid grid-cols-2 gap-3 pt-2">
            <Button
              onClick={handleDownload}
              disabled={downloading}
              variant="outline"
              className="rounded-xl h-11 text-xs font-bold border-amber-500/30 hover:bg-amber-500/10"
            >
              <Download className="w-4 h-4 mr-2 text-amber-500" />
              Download Card
            </Button>

            <Button
              onClick={handleShare}
              disabled={downloading}
              className="gradient-gold text-white rounded-xl h-11 text-xs font-bold shadow-md hover:opacity-90"
            >
              <Share2 className="w-4 h-4 mr-2" />
              Share to Stories
            </Button>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}
