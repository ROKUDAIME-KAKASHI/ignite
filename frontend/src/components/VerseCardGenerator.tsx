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
  bgGrad: [string, string, string];
  bgCss: string;
  borderCss: string;
  textCss: string;
  accentCss: string;
  subTextCss: string;
  accentHex: string;
  textHex: string;
  subTextHex: string;
}

const THEMES: ThemeConfig[] = [
  { id: "gold", name: "Deep Gold", bgGrad: ["#1c1008", "#451a03", "#1a0e07"], bgCss: "from-amber-950 via-amber-900 to-amber-950", borderCss: "border-amber-500/40", textCss: "text-amber-100", accentCss: "text-amber-400", subTextCss: "text-amber-200/70", accentHex: "#fbbf24", textHex: "#fef3c7", subTextHex: "rgba(255,255,255,0.7)" },
  { id: "midnight", name: "Midnight", bgGrad: ["#020617", "#1e1b4b", "#090d16"], bgCss: "from-slate-950 via-indigo-950 to-slate-900", borderCss: "border-indigo-500/40", textCss: "text-slate-100", accentCss: "text-indigo-400", subTextCss: "text-indigo-200/70", accentHex: "#818cf8", textHex: "#f8fafc", subTextHex: "rgba(255,255,255,0.7)" },
  { id: "royal", name: "Royal Purple", bgGrad: ["#2e1065", "#581c87", "#2e1065"], bgCss: "from-purple-950 via-violet-900 to-purple-950", borderCss: "border-purple-500/40", textCss: "text-purple-100", accentCss: "text-purple-300", subTextCss: "text-purple-200/70", accentHex: "#c084fc", textHex: "#faf5ff", subTextHex: "rgba(255,255,255,0.7)" },
  { id: "parchment", name: "Parchment", bgGrad: ["#fef3c7", "#e7e5e4", "#fffbeb"], bgCss: "from-amber-100 via-stone-200 to-amber-50", borderCss: "border-amber-800/30", textCss: "text-stone-900", accentCss: "text-amber-800", subTextCss: "text-amber-900/70", accentHex: "#92400e", textHex: "#1c1917", subTextHex: "rgba(28,25,23,0.7)" },
  { id: "emerald", name: "Emerald", bgGrad: ["#022c22", "#134e4a", "#022c22"], bgCss: "from-emerald-950 via-teal-950 to-emerald-900", borderCss: "border-emerald-500/40", textCss: "text-emerald-100", accentCss: "text-emerald-400", subTextCss: "text-emerald-200/70", accentHex: "#34d399", textHex: "#ecfdf5", subTextHex: "rgba(255,255,255,0.7)" },
  { id: "crimson", name: "Crimson Rose", bgGrad: ["#450a0a", "#881337", "#450a0a"], bgCss: "from-rose-950 via-red-950 to-rose-950", borderCss: "border-rose-500/40", textCss: "text-rose-100", accentCss: "text-rose-400", subTextCss: "text-rose-200/70", accentHex: "#fb7185", textHex: "#fff1f2", subTextHex: "rgba(255,255,255,0.7)" },
  { id: "ocean", name: "Celestial Ocean", bgGrad: ["#0c4a6e", "#0369a1", "#082f49"], bgCss: "from-sky-950 via-cyan-950 to-sky-900", borderCss: "border-sky-500/40", textCss: "text-sky-100", accentCss: "text-sky-400", subTextCss: "text-sky-200/70", accentHex: "#38bdf8", textHex: "#f0f9ff", subTextHex: "rgba(255,255,255,0.7)" },
  { id: "velvet", name: "Holy Velvet", bgGrad: ["#3b0764", "#7e22ce", "#3b0764"], bgCss: "from-fuchsia-950 via-purple-950 to-fuchsia-950", borderCss: "border-amber-500/40", textCss: "text-fuchsia-100", accentCss: "text-amber-400", subTextCss: "text-purple-200/70", accentHex: "#fbbf24", textHex: "#fdf4ff", subTextHex: "rgba(255,255,255,0.7)" },
  { id: "terracotta", name: "Sunset Grace", bgGrad: ["#431407", "#7c2d12", "#431407"], bgCss: "from-orange-950 via-amber-950 to-orange-950", borderCss: "border-orange-500/40", textCss: "text-orange-100", accentCss: "text-orange-400", subTextCss: "text-orange-200/70", accentHex: "#fb923c", textHex: "#fff7ed", subTextHex: "rgba(255,255,255,0.7)" },
  { id: "onyx", name: "Obsidian Onyx", bgGrad: ["#09090b", "#18181b", "#09090b"], bgCss: "from-zinc-950 via-stone-900 to-zinc-950", borderCss: "border-zinc-500/40", textCss: "text-zinc-100", accentCss: "text-zinc-300", subTextCss: "text-zinc-400", accentHex: "#d4d4d8", textHex: "#fafafa", subTextHex: "rgba(255,255,255,0.7)" },
];

export function VerseCardGenerator({ verseText, reference, isOpen, onClose }: VerseCardGeneratorProps) {
  const [selectedTheme, setSelectedTheme] = useState(THEMES[0]);
  const [loading, setLoading] = useState(false);
  const [savedSuccess, setSavedSuccess] = useState(false);
  const cardRef = useRef<HTMLDivElement>(null);

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

  // High Quality Direct Canvas Renderer
  const drawDirectCanvas = (): HTMLCanvasElement => {
    const canvas = document.createElement("canvas");
    canvas.width = 1080;
    canvas.height = 1350;
    const ctx = canvas.getContext("2d")!;

    const theme = selectedTheme;
    const cleanVerse = `"${verseText.replace(/[*_~\[\]]/g, '').trim()}"`;
    const charCount = cleanVerse.length;

    let fontSize = 48;
    let lineHeight = 72;
    if (charCount < 70) {
      fontSize = 58;
      lineHeight = 84;
    } else if (charCount < 140) {
      fontSize = 48;
      lineHeight = 72;
    } else if (charCount < 220) {
      fontSize = 40;
      lineHeight = 60;
    } else {
      fontSize = 34;
      lineHeight = 50;
    }

    // 1. Gradient Background
    const gradient = ctx.createLinearGradient(0, 0, 1080, 1350);
    gradient.addColorStop(0, theme.bgGrad[0]);
    gradient.addColorStop(0.5, theme.bgGrad[1]);
    gradient.addColorStop(1, theme.bgGrad[2]);
    ctx.fillStyle = gradient;
    ctx.fillRect(0, 0, 1080, 1350);

    // 2. Borders
    ctx.strokeStyle = theme.accentHex;
    ctx.lineWidth = 6;
    ctx.strokeRect(40, 40, 1000, 1270);
    ctx.lineWidth = 2;
    ctx.strokeRect(52, 52, 976, 1246);

    // 3. Header
    ctx.fillStyle = theme.accentHex;
    ctx.font = "bold 36px serif";
    ctx.fillText("IGNITE 🕊️", 80, 120);

    ctx.fillStyle = theme.subTextHex;
    ctx.font = "bold uppercase 24px sans-serif";
    ctx.textAlign = "right";
    ctx.fillText("DAILY BREAD", 1000, 120);

    ctx.strokeStyle = theme.accentHex;
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(80, 150);
    ctx.lineTo(1000, 150);
    ctx.stroke();

    // 4. Scripture Verse Text
    ctx.textAlign = "center";
    ctx.fillStyle = theme.textHex;
    ctx.font = `italic ${fontSize}px Georgia, serif`;

    const words = cleanVerse.split(" ");
    const maxWidth = 880;
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

    const totalTextHeight = lines.length * lineHeight;
    let startY = 675 - totalTextHeight / 2;

    for (let i = 0; i < lines.length; i++) {
      ctx.fillText(lines[i], 540, startY + i * lineHeight);
    }

    // Divider Dot
    const dividerY = Math.min(1150, startY + totalTextHeight + 30);
    ctx.fillStyle = theme.accentHex;
    ctx.beginPath();
    ctx.arc(540, dividerY, 6, 0, Math.PI * 2);
    ctx.fill();

    // Reference Text
    ctx.fillStyle = theme.accentHex;
    ctx.font = "bold uppercase 32px sans-serif";
    ctx.fillText(reference.toUpperCase(), 540, Math.min(1210, dividerY + 60));

    // Footer
    ctx.strokeStyle = theme.accentHex;
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(80, 1250);
    ctx.lineTo(1000, 1250);
    ctx.stroke();

    ctx.fillStyle = theme.subTextHex;
    ctx.font = "bold uppercase 22px sans-serif";
    ctx.fillText("IGNITE • SCRIPTURE & FELLOWSHIP", 540, 1290);

    return canvas;
  };

  const getCardImage = async (): Promise<string> => {
    if (cardRef.current) {
      try {
        const html2canvas = (await import("html2canvas")).default;
        const canvas = await html2canvas(cardRef.current, {
          scale: 3,
          useCORS: true,
          backgroundColor: null,
          logging: false,
        });
        return canvas.toDataURL("image/png", 1.0);
      } catch (e) {
        console.warn("html2canvas fallback to direct canvas:", e);
      }
    }
    const canvas = drawDirectCanvas();
    return canvas.toDataURL("image/png", 1.0);
  };

  const handleDownload = async () => {
    setLoading(true);
    try {
      const dataUrl = await getCardImage();
      const link = document.createElement("a");
      link.download = `IGNITE_${reference.replace(/[^a-zA-Z0-9]/g, "_")}.png`;
      link.href = dataUrl;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);

      setSavedSuccess(true);
      setTimeout(() => setSavedSuccess(false), 2500);
    } catch (e) {
      console.error("Download failed:", e);
    } finally {
      setLoading(false);
    }
  };

  const handleShare = async () => {
    setLoading(true);
    try {
      const dataUrl = await getCardImage();
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

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/80 backdrop-blur-sm overflow-hidden">
          <motion.div
            initial={{ opacity: 0, scale: 0.9, y: 15 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9, y: 15 }}
            className="bg-card border border-border/60 rounded-3xl p-4 sm:p-5 max-w-[340px] sm:max-w-sm w-full shadow-2xl relative flex flex-col space-y-3 my-auto max-h-[92vh] overflow-hidden z-50"
          >
            {/* Top Control Bar: Save Card, Share, Close Button */}
            <div className="flex items-center justify-between gap-2 shrink-0 border-b border-border/50 pb-2.5">
              <div className="flex items-center gap-2 flex-1">
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
                  {savedSuccess ? "Saved!" : "Save Card"}
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
              ref={cardRef}
              className={`w-full aspect-[4/5] rounded-2xl p-5 bg-gradient-to-br ${selectedTheme.bgCss} border-2 ${selectedTheme.borderCss} shadow-xl flex flex-col justify-between relative overflow-hidden text-left shrink mx-auto`}
            >
              {/* Top Branding */}
              <div className="flex items-center justify-between relative z-10 w-full border-b border-white/15 pb-2.5">
                <span className={`text-[12px] font-extrabold uppercase tracking-widest font-serif ${selectedTheme.accentCss}`}>
                  IGNITE 🕊️
                </span>
                <span className={`text-[10px] font-bold tracking-wider uppercase ${selectedTheme.subTextCss}`}>
                  Daily Bread
                </span>
              </div>

              {/* Verse Content */}
              <div className="relative z-10 my-auto text-center space-y-2.5 px-1">
                <p className={`text-xs sm:text-sm font-serif italic leading-relaxed line-clamp-6 drop-shadow-sm ${selectedTheme.textCss}`}>
                  "{verseText.replace(/[*_~\[\]]/g, '').trim()}"
                </p>
                <div className="w-10 h-0.5 mx-auto bg-amber-500/50 rounded-full" />
                <p className={`text-[11px] font-extrabold uppercase tracking-widest ${selectedTheme.accentCss}`}>
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
      )}
    </AnimatePresence>
  );
}
