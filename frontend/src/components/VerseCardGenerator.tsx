"use client";

import { useState } from "react";
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
  bgGrad: [string, string, string]; // start, mid, end
  border: string;
  text: string;
  accent: string;
  subText: string;
  previewCss: string;
}

const THEMES: ThemeConfig[] = [
  { id: "gold", name: "Deep Gold", bgGrad: ["#1c1008", "#451a03", "#1a0e07"], border: "rgba(245, 158, 11, 0.5)", text: "#fef3c7", accent: "#fbbf24", subText: "rgba(255, 255, 255, 0.75)", previewCss: "from-amber-950 via-amber-900 to-amber-950 border-amber-500/40 text-amber-100" },
  { id: "midnight", name: "Midnight", bgGrad: ["#020617", "#1e1b4b", "#090d16"], border: "rgba(99, 102, 241, 0.5)", text: "#f8fafc", accent: "#818cf8", subText: "rgba(255, 255, 255, 0.75)", previewCss: "from-slate-950 via-indigo-950 to-slate-900 border-indigo-500/40 text-slate-100" },
  { id: "royal", name: "Royal Purple", bgGrad: ["#2e1065", "#581c87", "#2e1065"], border: "rgba(168, 85, 247, 0.5)", text: "#faf5ff", accent: "#c084fc", subText: "rgba(255, 255, 255, 0.75)", previewCss: "from-purple-950 via-violet-900 to-purple-950 border-purple-500/40 text-purple-100" },
  { id: "parchment", name: "Parchment", bgGrad: ["#fef3c7", "#e7e5e4", "#fffbeb"], border: "rgba(146, 64, 14, 0.4)", text: "#1c1917", accent: "#92400e", subText: "rgba(28, 25, 23, 0.75)", previewCss: "from-amber-100 via-stone-200 to-amber-50 border-amber-800/30 text-stone-900" },
  { id: "emerald", name: "Emerald", bgGrad: ["#022c22", "#134e4a", "#022c22"], border: "rgba(52, 211, 153, 0.5)", text: "#ecfdf5", accent: "#34d399", subText: "rgba(255, 255, 255, 0.75)", previewCss: "from-emerald-950 via-teal-950 to-emerald-900 border-emerald-500/40 text-emerald-100" },
  { id: "crimson", name: "Crimson Rose", bgGrad: ["#450a0a", "#881337", "#450a0a"], border: "rgba(251, 113, 133, 0.5)", text: "#fff1f2", accent: "#fb7185", subText: "rgba(255, 255, 255, 0.75)", previewCss: "from-rose-950 via-red-950 to-rose-950 border-rose-500/40 text-rose-100" },
  { id: "ocean", name: "Celestial Ocean", bgGrad: ["#0c4a6e", "#0369a1", "#082f49"], border: "rgba(56, 189, 248, 0.5)", text: "#f0f9ff", accent: "#38bdf8", subText: "rgba(255, 255, 255, 0.75)", previewCss: "from-sky-950 via-cyan-950 to-sky-900 border-sky-500/40 text-sky-100" },
  { id: "velvet", name: "Holy Velvet", bgGrad: ["#3b0764", "#7e22ce", "#3b0764"], border: "rgba(234, 179, 8, 0.5)", text: "#fdf4ff", accent: "#eab308", subText: "rgba(255, 255, 255, 0.75)", previewCss: "from-fuchsia-950 via-purple-950 to-fuchsia-950 border-amber-500/40 text-fuchsia-100" },
  { id: "terracotta", name: "Sunset Grace", bgGrad: ["#431407", "#7c2d12", "#431407"], border: "rgba(251, 146, 60, 0.5)", text: "#fff7ed", accent: "#fb923c", subText: "rgba(255, 255, 255, 0.75)", previewCss: "from-orange-950 via-amber-950 to-orange-950 border-orange-500/40 text-orange-100" },
  { id: "onyx", name: "Obsidian Onyx", bgGrad: ["#09090b", "#18181b", "#09090b"], border: "rgba(212, 212, 216, 0.5)", text: "#fafafa", accent: "#e4e4e7", subText: "rgba(255, 255, 255, 0.75)", previewCss: "from-zinc-950 via-stone-900 to-zinc-950 border-zinc-500/40 text-zinc-100" },
];

export function VerseCardGenerator({ verseText, reference, isOpen, onClose }: VerseCardGeneratorProps) {
  const [selectedTheme, setSelectedTheme] = useState(THEMES[0]);
  const [loading, setLoading] = useState(false);
  const [savedSuccess, setSavedSuccess] = useState(false);

  // Ultra-HD 4K Native Canvas Renderer (2160 x 2700 Crisp HD 4:5 Graphic)
  const drawGraphicCanvas = (): HTMLCanvasElement => {
    const canvas = document.createElement("canvas");
    canvas.width = 2160;
    canvas.height = 2700;
    const ctx = canvas.getContext("2d")!;

    // High quality subpixel text anti-aliasing
    ctx.imageSmoothingEnabled = true;
    ctx.imageSmoothingQuality = "high";

    const theme = selectedTheme;

    // 1. Ultra-HD Background Gradient
    const gradient = ctx.createLinearGradient(0, 0, 2160, 2700);
    gradient.addColorStop(0, theme.bgGrad[0]);
    gradient.addColorStop(0.5, theme.bgGrad[1]);
    gradient.addColorStop(1, theme.bgGrad[2]);
    ctx.fillStyle = gradient;
    ctx.fillRect(0, 0, 2160, 2700);

    // 2. Double Decorative Border Frame
    ctx.strokeStyle = theme.border;
    ctx.lineWidth = 12;
    ctx.strokeRect(100, 100, 1960, 2500);

    ctx.lineWidth = 4;
    ctx.strokeRect(130, 130, 1900, 2440);

    // 3. Top Header
    ctx.fillStyle = theme.accent;
    ctx.font = "bold 76px Georgia, serif";
    ctx.fillText("IGNITE 🕊️", 200, 260);

    ctx.fillStyle = theme.subText;
    ctx.font = "bold uppercase 56px sans-serif";
    ctx.textAlign = "right";
    ctx.fillText("DAILY BREAD", 1960, 260);

    // Header Divider Line
    ctx.strokeStyle = theme.border;
    ctx.lineWidth = 4;
    ctx.beginPath();
    ctx.moveTo(200, 330);
    ctx.lineTo(1960, 330);
    ctx.stroke();

    // 4. Word Wrapped Scripture Verse
    ctx.textAlign = "center";
    ctx.fillStyle = theme.text;
    ctx.font = "italic 92px Georgia, serif";

    const cleanVerse = `"${verseText.replace(/[*_~\[\]]/g, '').trim()}"`;
    const words = cleanVerse.split(" ");
    const maxWidth = 1720;
    const lineHeight = 130;
    const lines: string[] = [];
    let currentLine = "";

    for (let i = 0; i < words.length; i++) {
      const testLine = currentLine ? `${currentLine} ${words[i]}` : words[i];
      const metrics = ctx.measureText(testLine);
      if (metrics.width > maxWidth && i > 0) {
        lines.push(currentLine);
        currentLine = words[i];
      } else {
        currentLine = testLine;
      }
    }
    lines.push(currentLine);

    // Calculate vertical centering
    const totalTextHeight = lines.length * lineHeight;
    let startY = 1300 - totalTextHeight / 2;

    for (let i = 0; i < lines.length; i++) {
      ctx.fillText(lines[i], 1080, startY + i * lineHeight);
    }

    // Gold Divider Dot
    const dividerY = startY + totalTextHeight + 80;
    ctx.fillStyle = theme.accent;
    ctx.beginPath();
    ctx.arc(1080, dividerY, 12, 0, Math.PI * 2);
    ctx.fill();

    // 5. Reference Text
    ctx.fillStyle = theme.accent;
    ctx.font = "bold uppercase 72px sans-serif";
    ctx.fillText(reference.toUpperCase(), 1080, dividerY + 140);

    // 6. Footer Branding
    ctx.strokeStyle = theme.border;
    ctx.lineWidth = 4;
    ctx.beginPath();
    ctx.moveTo(200, 2480);
    ctx.lineTo(1960, 2480);
    ctx.stroke();

    ctx.fillStyle = theme.subText;
    ctx.font = "bold uppercase 48px sans-serif";
    ctx.fillText("IGNITE • SCRIPTURE & FELLOWSHIP", 1080, 2560);

    return canvas;
  };

  const handleDownload = () => {
    setLoading(true);
    try {
      const canvas = drawGraphicCanvas();
      const imageUrl = canvas.toDataURL("image/png", 1.0);

      const link = document.createElement("a");
      link.download = `IGNITE_${reference.replace(/[^a-zA-Z0-9]/g, "_")}.png`;
      link.href = imageUrl;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);

      setSavedSuccess(true);
      setTimeout(() => setSavedSuccess(false), 2500);
    } catch (e) {
      console.error("Canvas export error:", e);
    } finally {
      setLoading(false);
    }
  };

  const handleShare = async () => {
    setLoading(true);
    try {
      const canvas = drawGraphicCanvas();

      canvas.toBlob(async (blob) => {
        if (blob && typeof navigator !== "undefined" && navigator.share) {
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
        // Fallback to download if Web Share fails or is cancelled
        handleDownload();
      }, "image/png", 1.0);
    } catch {
      handleDownload();
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-4 bg-black/85 backdrop-blur-md overflow-hidden">
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 10 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 10 }}
          className="bg-card border border-border/60 rounded-3xl p-3.5 sm:p-5 max-w-xs sm:max-w-sm w-full shadow-2xl relative flex flex-col space-y-3 max-h-[95vh]"
        >
          {/* Top Control Bar (Pushed to the very top: Download, Share, Close X) */}
          <div className="flex items-center justify-between gap-2 shrink-0 border-b border-border/50 pb-2.5">
            <div className="flex items-center gap-1.5 flex-1">
              <Button
                onClick={handleDownload}
                disabled={loading}
                size="sm"
                className="gradient-gold text-white rounded-xl h-10 px-3 text-xs font-bold shadow-md hover:opacity-90 flex-1"
              >
                {loading ? (
                  <Loader2 className="w-4 h-4 mr-1 animate-spin text-white" />
                ) : savedSuccess ? (
                  <Check className="w-4 h-4 mr-1 text-white" />
                ) : (
                  <Download className="w-4 h-4 mr-1 text-white" />
                )}
                {savedSuccess ? "Saved!" : "Save 4K Card"}
              </Button>

              <Button
                onClick={handleShare}
                disabled={loading}
                variant="outline"
                size="sm"
                className="rounded-xl h-10 px-3 text-xs font-bold border-amber-500/30 hover:bg-amber-500/10"
              >
                {loading ? <Loader2 className="w-4 h-4 animate-spin text-amber-500" /> : <Share2 className="w-4 h-4 text-amber-500" />}
              </Button>
            </div>

            <button
              onClick={onClose}
              className="w-9 h-9 rounded-xl bg-muted hover:bg-muted/80 flex items-center justify-center text-muted-foreground transition border border-border/40 shrink-0"
              title="Close modal"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Theme Selector - 10 Visual Templates */}
          <div className="flex gap-1.5 overflow-x-auto pb-1 scrollbar-hide shrink-0">
            {THEMES.map((t) => (
              <button
                key={t.id}
                onClick={() => setSelectedTheme(t)}
                className={`px-2.5 py-1 rounded-xl text-[11px] font-bold whitespace-nowrap transition border ${
                  selectedTheme.id === t.id ? "bg-amber-500 text-white border-amber-400 shadow-sm" : "bg-muted text-muted-foreground border-transparent"
                }`}
              >
                {t.name}
              </button>
            ))}
          </div>

          {/* Rendered Verse Card Preview */}
          <div
            className={`w-full aspect-[4/5] rounded-2xl p-4 bg-gradient-to-br ${selectedTheme.previewCss} border-2 shadow-xl flex flex-col justify-between relative overflow-hidden text-left shrink`}
          >
            {/* Top Branding */}
            <div className="flex items-center justify-between relative z-10 w-full border-b border-white/10 pb-2">
              <span className="text-[11px] font-extrabold uppercase tracking-widest font-serif" style={{ color: selectedTheme.accent }}>
                IGNITE 🕊️
              </span>
              <span className="text-[10px] font-bold tracking-wider opacity-80 uppercase">
                Daily Bread
              </span>
            </div>

            {/* Verse Content */}
            <div className="relative z-10 my-auto text-center space-y-2 px-1">
              <p className="text-xs sm:text-sm font-serif italic leading-relaxed line-clamp-6 drop-shadow-sm">
                "{verseText}"
              </p>
              <div className="w-8 h-0.5 mx-auto bg-amber-500/50 rounded-full" />
              <p className="text-[11px] font-bold uppercase tracking-widest" style={{ color: selectedTheme.accent }}>
                {reference}
              </p>
            </div>

            {/* Footer */}
            <div className="relative z-10 text-center border-t border-white/10 pt-2">
              <p className="text-[8px] opacity-60 font-semibold tracking-wider uppercase">
                IGNITE • Scripture & Fellowship
              </p>
            </div>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}
