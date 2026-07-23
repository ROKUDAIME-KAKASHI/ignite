"use client";

import { useState, useRef } from "react";
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
}

const THEMES: ThemeConfig[] = [
  { id: "gold", name: "Deep Gold", bgGrad: ["#1c1008", "#451a03", "#1a0e07"], border: "rgba(245, 158, 11, 0.4)", text: "#fef3c7", accent: "#fbbf24", subText: "rgba(255, 255, 255, 0.7)" },
  { id: "midnight", name: "Midnight", bgGrad: ["#020617", "#1e1b4b", "#090d16"], border: "rgba(99, 102, 241, 0.4)", text: "#f8fafc", accent: "#818cf8", subText: "rgba(255, 255, 255, 0.7)" },
  { id: "royal", name: "Royal Purple", bgGrad: ["#2e1065", "#581c87", "#2e1065"], border: "rgba(168, 85, 247, 0.4)", text: "#faf5ff", accent: "#c084fc", subText: "rgba(255, 255, 255, 0.7)" },
  { id: "parchment", name: "Parchment", bgGrad: ["#fef3c7", "#e7e5e4", "#fffbeb"], border: "rgba(146, 64, 14, 0.3)", text: "#1c1917", accent: "#92400e", subText: "rgba(28, 25, 23, 0.7)" },
  { id: "emerald", name: "Emerald", bgGrad: ["#022c22", "#134e4a", "#022c22"], border: "rgba(52, 211, 153, 0.4)", text: "#ecfdf5", accent: "#34d399", subText: "rgba(255, 255, 255, 0.7)" },
];

export function VerseCardGenerator({ verseText, reference, isOpen, onClose }: VerseCardGeneratorProps) {
  const [selectedTheme, setSelectedTheme] = useState(THEMES[0]);
  const [loading, setLoading] = useState(false);
  const [savedSuccess, setSavedSuccess] = useState(false);

  // Native HTML5 Canvas Renderer (1080x1350 HD 4:5 Graphic)
  const drawGraphicCanvas = (): HTMLCanvasElement => {
    const canvas = document.createElement("canvas");
    canvas.width = 1080;
    canvas.height = 1350;
    const ctx = canvas.getContext("2d")!;

    const theme = selectedTheme;

    // 1. Background Gradient
    const gradient = ctx.createLinearGradient(0, 0, 1080, 1350);
    gradient.addColorStop(0, theme.bgGrad[0]);
    gradient.addColorStop(0.5, theme.bgGrad[1]);
    gradient.addColorStop(1, theme.bgGrad[2]);
    ctx.fillStyle = gradient;
    ctx.fillRect(0, 0, 1080, 1350);

    // 2. Outer & Inner Decorative Frame
    ctx.strokeStyle = theme.border;
    ctx.lineWidth = 6;
    ctx.strokeRect(50, 50, 980, 1250);

    ctx.lineWidth = 2;
    ctx.strokeRect(65, 65, 950, 1220);

    // 3. Top Header
    ctx.fillStyle = theme.accent;
    ctx.font = "bold 38px Georgia, serif";
    ctx.fillText("IGNITE 🕊️", 100, 130);

    ctx.fillStyle = theme.subText;
    ctx.font = "bold uppercase 28px sans-serif";
    ctx.textAlign = "right";
    ctx.fillText("DAILY BREAD", 980, 130);

    // Header Divider Line
    ctx.strokeStyle = theme.border;
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(100, 165);
    ctx.lineTo(980, 165);
    ctx.stroke();

    // 4. Word Wrapped Verse Text
    ctx.textAlign = "center";
    ctx.fillStyle = theme.text;
    ctx.font = "italic 46px Georgia, serif";

    const cleanVerse = `"${verseText.replace(/[*_~\[\]]/g, '').trim()}"`;
    const words = cleanVerse.split(" ");
    const maxWidth = 860;
    const lineHeight = 64;
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
    let startY = 650 - totalTextHeight / 2;

    for (let i = 0; i < lines.length; i++) {
      ctx.fillText(lines[i], 540, startY + i * lineHeight);
    }

    // Gold Divider Dot
    const dividerY = startY + totalTextHeight + 40;
    ctx.fillStyle = theme.accent;
    ctx.beginPath();
    ctx.arc(540, dividerY, 6, 0, Math.PI * 2);
    ctx.fill();

    // 5. Reference Text
    ctx.fillStyle = theme.accent;
    ctx.font = "bold uppercase 36px sans-serif";
    ctx.fillText(reference.toUpperCase(), 540, dividerY + 70);

    // 6. Footer Branding
    ctx.strokeStyle = theme.border;
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(100, 1240);
    ctx.lineTo(980, 1240);
    ctx.stroke();

    ctx.fillStyle = theme.subText;
    ctx.font = "bold uppercase 24px sans-serif";
    ctx.fillText("IGNITE • SCRIPTURE & FELLOWSHIP", 540, 1280);

    return canvas;
  };

  const handleDownload = () => {
    setLoading(true);
    try {
      const canvas = drawGraphicCanvas();
      const imageUrl = canvas.toDataURL("image/png");

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
      }, "image/png");
    } catch {
      handleDownload();
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
            className={`w-full aspect-[4/5] rounded-3xl p-5 sm:p-6 bg-gradient-to-br ${
              selectedTheme.id === "gold" ? "from-amber-950 via-amber-900 to-amber-950 border-amber-500/40 text-amber-100" :
              selectedTheme.id === "midnight" ? "from-slate-950 via-indigo-950 to-slate-900 border-indigo-500/40 text-slate-100" :
              selectedTheme.id === "royal" ? "from-purple-950 via-violet-900 to-purple-950 border-purple-500/40 text-purple-100" :
              selectedTheme.id === "parchment" ? "from-amber-100 via-stone-200 to-amber-50 border-amber-800/30 text-stone-900" :
              "from-emerald-950 via-teal-950 to-emerald-900 border-emerald-500/40 text-emerald-100"
            } border-2 shadow-2xl flex flex-col justify-between relative overflow-hidden text-left`}
          >
            {/* Top Branding - Clean & Minimal */}
            <div className="flex items-center justify-between relative z-10 w-full border-b border-white/10 pb-3">
              <span className="text-xs font-extrabold uppercase tracking-widest font-serif" style={{ color: selectedTheme.accent }}>
                IGNITE 🕊️
              </span>
              <span className="text-[11px] font-bold tracking-wider opacity-80 uppercase">
                Daily Bread
              </span>
            </div>

            {/* Verse Content */}
            <div className="relative z-10 my-auto text-center space-y-3 px-1">
              <p className="text-sm sm:text-base font-serif italic leading-relaxed drop-shadow-sm">
                "{verseText}"
              </p>
              <div className="w-10 h-0.5 mx-auto bg-amber-500/50 rounded-full" />
              <p className="text-xs font-bold uppercase tracking-widest" style={{ color: selectedTheme.accent }}>
                {reference}
              </p>
            </div>

            {/* Footer */}
            <div className="relative z-10 text-center border-t border-white/10 pt-2.5">
              <p className="text-[9px] opacity-60 font-semibold tracking-wider uppercase">
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
              {loading ? (
                <Loader2 className="w-4 h-4 mr-1.5 animate-spin text-amber-500" />
              ) : savedSuccess ? (
                <Check className="w-4 h-4 mr-1.5 text-emerald-500" />
              ) : (
                <Download className="w-4 h-4 mr-1.5 text-amber-500" />
              )}
              {savedSuccess ? "Saved!" : "Save Image"}
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
