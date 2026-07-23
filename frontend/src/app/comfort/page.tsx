"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Shield, Heart, Anchor, Sun, Sparkles, Volume2, VolumeX, Share2, ArrowLeft, BookOpen } from "lucide-react";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { VerseCardGenerator } from "@/components/VerseCardGenerator";

interface ComfortCategory {
  id: string;
  title: string;
  subtitle: string;
  icon: string;
  gradient: string;
  textColor: string;
  scriptures: {
    reference: string;
    text: string;
  }[];
  prayer: {
    title: string;
    text: string;
  };
}

const COMFORT_CATEGORIES: ComfortCategory[] = [
  {
    id: "anxious",
    title: "When Anxious or Worried",
    subtitle: "Find still waters and quiet your heart",
    icon: "🕊️",
    gradient: "from-blue-900 via-slate-900 to-indigo-950",
    textColor: "text-blue-200",
    scriptures: [
      {
        reference: "Philippians 4:6-7",
        text: "Do not be anxious about anything, but in every situation, by prayer and petition, with thanksgiving, present your requests to God. And the peace of God, which transcends all understanding, will guard your hearts and your minds in Christ Jesus."
      },
      {
        reference: "Psalm 46:10",
        text: "Be still, and know that I am God; I will be exalted among the nations, I will be exalted in the earth."
      },
      {
        reference: "Psalm 23:1-3",
        text: "The Lord is my shepherd; I shall not want. He makes me lie down in green pastures. He leads me beside still waters. He restores my soul."
      }
    ],
    prayer: {
      title: "Orthodox Prayer for Peace of Mind",
      text: "O Lord Jesus Christ, Prince of Peace, calm the stormy waters of my soul. Remove all fear and anxiety from my heart. Help me to trust completely in Your divine providence, knowing that You hold my life safely in Your holy hands. Amen."
    }
  },
  {
    id: "temptation",
    title: "When Facing Temptation",
    subtitle: "Stand firm in the armor of God",
    icon: "🛡️",
    gradient: "from-amber-950 via-slate-900 to-red-950",
    textColor: "text-amber-200",
    scriptures: [
      {
        reference: "1 Corinthians 10:13",
        text: "No temptation has overtaken you except what is common to mankind. And God is faithful; He will not let you be tempted beyond what you can bear. But when you are tempted, He will also provide a way out so that you can endure it."
      },
      {
        reference: "Psalm 51:10",
        text: "Create in me a pure heart, O God, and renew a steadfast spirit within me."
      },
      {
        reference: "James 4:7-8",
        text: "Submit yourselves, then, to God. Resist the devil, and he will flee from you. Come near to God and He will come near to you."
      }
    ],
    prayer: {
      title: "Prayer of St. Ephrem the Syrian",
      text: "O Lord and Master of my life, take from me the spirit of sloth, despair, lust of power, and idle talk. But give rather the spirit of chastity, humility, patience, and love to Your servant. Amen."
    }
  },
  {
    id: "grieving",
    title: "When Grieving or Hurting",
    subtitle: "He heals the brokenhearted",
    icon: "🕯️",
    gradient: "from-purple-950 via-slate-900 to-indigo-950",
    textColor: "text-purple-200",
    scriptures: [
      {
        reference: "Psalm 34:18",
        text: "The Lord is close to the brokenhearted and saves those who are crushed in spirit."
      },
      {
        reference: "Revelation 21:4",
        text: "He will wipe every tear from their eyes. There will be no more death or mourning or crying or pain, for the old order of things has passed away."
      },
      {
        reference: "Matthew 5:4",
        text: "Blessed are those who mourn, for they will be comforted."
      }
    ],
    prayer: {
      title: "Prayer for Solace & Hope",
      text: "O Compassionate Savior, Comforter of the afflicted, embrace my hurting heart today. When sorrow overwhelms me, remind me of Your resurrection power and the eternal joy promised to those who abide in You. Amen."
    }
  },
  {
    id: "discouraged",
    title: "When Weary or Discouraged",
    subtitle: "Renew your strength like the eagle",
    icon: "🦅",
    gradient: "from-emerald-950 via-slate-900 to-teal-950",
    textColor: "text-emerald-200",
    scriptures: [
      {
        reference: "Isaiah 40:31",
        text: "Those who hope in the Lord will renew their strength. They will soar on wings like eagles; they will run and not grow weary, they will walk and not be faint."
      },
      {
        reference: "Matthew 11:28-29",
        text: "Come to Me, all you who are weary and burdened, and I will give you rest. Take My yoke upon you and learn from Me, for I am gentle and humble in heart, and you will find rest for your souls."
      },
      {
        reference: "Psalm 121:1-2",
        text: "I lift up my eyes to the mountains—where does my help come from? My help comes from the Lord, the Maker of heaven and earth."
      }
    ],
    prayer: {
      title: "Prayer for Spiritual Endurance",
      text: "Lord Jesus, my Strength and my Refuge, lift the heaviness from my spirit. When I feel weary in doing good, grant me the courage to persevere, knowing that Your grace is sufficient for me. Amen."
    }
  }
];

export default function EmergencyFaithGuidePage() {
  const [activeCategory, setActiveCategory] = useState<ComfortCategory>(COMFORT_CATEGORIES[0]);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [cardVerse, setCardVerse] = useState<{ text: string; reference: string } | null>(null);

  const speakText = (text: string) => {
    if (typeof window === "undefined" || !("speechSynthesis" in window)) return;

    if (isSpeaking) {
      window.speechSynthesis.cancel();
      setIsSpeaking(false);
      return;
    }

    window.speechSynthesis.cancel();
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.rate = 0.9;
    utterance.onend = () => setIsSpeaking(false);
    setIsSpeaking(true);
    window.speechSynthesis.speak(utterance);
  };

  return (
    <div className="flex-1 flex flex-col bg-background min-h-screen pb-24">
      {/* Header */}
      <div className="relative overflow-hidden px-5 pt-8 pb-8 bg-gradient-to-br from-slate-950 via-indigo-950 to-slate-900 border-b border-border/40">
        <div className="flex items-center justify-between mb-4 relative z-10">
          <Link href="/" className="w-9 h-9 rounded-xl bg-white/10 flex items-center justify-center text-white hover:bg-white/20 transition">
            <ArrowLeft className="w-5 h-5" />
          </Link>
          <span className="text-[10px] font-bold uppercase tracking-widest text-amber-400 bg-amber-400/10 px-3 py-1 rounded-full border border-amber-400/20">
            100% Offline Ready
          </span>
        </div>

        <div className="relative z-10 space-y-2">
          <div className="flex items-center gap-2">
            <Shield className="w-6 h-6 text-amber-400" />
            <h1 className="text-2xl font-bold font-serif text-white">Emergency Faith Guide</h1>
          </div>
          <p className="text-xs text-slate-300 max-w-md leading-relaxed">
            Instant spiritual comfort, targeted Psalms, and ancient Orthodox prayers for times of need.
          </p>
        </div>
      </div>

      {/* Category Pills */}
      <div className="px-4 py-4 overflow-x-auto scrollbar-hide flex gap-2 border-b border-border/40 bg-card/40 backdrop-blur-sm sticky top-0 z-20">
        {COMFORT_CATEGORIES.map((cat) => (
          <button
            key={cat.id}
            onClick={() => {
              if (isSpeaking && typeof window !== "undefined") window.speechSynthesis.cancel();
              setIsSpeaking(false);
              setActiveCategory(cat);
            }}
            className={`px-4 py-2 rounded-2xl text-xs font-bold whitespace-nowrap transition-all flex items-center gap-2 border ${
              activeCategory.id === cat.id
                ? "gradient-gold text-white border-amber-400 shadow-md scale-105"
                : "bg-muted text-muted-foreground border-transparent hover:bg-muted/80"
            }`}
          >
            <span>{cat.icon}</span>
            <span>{cat.title}</span>
          </button>
        ))}
      </div>

      {/* Content Body */}
      <div className="px-4 py-6 space-y-6 max-w-xl mx-auto w-full">
        {/* Category Banner Card */}
        <div className={`rounded-3xl p-6 bg-gradient-to-br ${activeCategory.gradient} border border-white/10 shadow-2xl text-white relative overflow-hidden`}>
          <div className="flex items-start justify-between">
            <div>
              <span className="text-3xl mb-2 inline-block">{activeCategory.icon}</span>
              <h2 className="text-xl font-bold font-serif">{activeCategory.title}</h2>
              <p className={`text-xs ${activeCategory.textColor} font-serif italic mt-1`}>{activeCategory.subtitle}</p>
            </div>
          </div>
        </div>

        {/* Scriptures Section */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-xs font-bold uppercase tracking-wider text-muted-foreground flex items-center gap-1.5">
              <BookOpen className="w-4 h-4 text-amber-500" /> Key Scriptures
            </h3>
          </div>

          <div className="space-y-3">
            {activeCategory.scriptures.map((scr, idx) => (
              <motion.div
                key={idx}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: idx * 0.1 }}
                className="bg-card border border-border/60 rounded-2xl p-4 shadow-sm space-y-3"
              >
                <p className="text-sm font-serif italic text-foreground leading-relaxed">
                  "{scr.text}"
                </p>

                <div className="flex items-center justify-between pt-2 border-t border-border/40">
                  <span className="text-xs font-bold text-amber-600 dark:text-amber-400 uppercase tracking-wider">
                    {scr.reference}
                  </span>

                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => speakText(scr.text)}
                      className="p-1.5 rounded-lg hover:bg-muted text-muted-foreground transition"
                      title="Listen Audio"
                    >
                      {isSpeaking ? <VolumeX className="w-4 h-4 text-amber-500 animate-pulse" /> : <Volume2 className="w-4 h-4" />}
                    </button>

                    <button
                      onClick={() => setCardVerse({ text: scr.text, reference: scr.reference })}
                      className="flex items-center gap-1 text-xs font-bold px-2.5 py-1 rounded-lg bg-amber-500/10 text-amber-600 dark:text-amber-400 hover:bg-amber-500/20 transition"
                    >
                      <Sparkles className="w-3.5 h-3.5" /> Card
                    </button>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </div>

        {/* Orthodox Prayer Section */}
        <div className="space-y-3">
          <h3 className="text-xs font-bold uppercase tracking-wider text-muted-foreground flex items-center gap-1.5">
            <Heart className="w-4 h-4 text-purple-500" /> Prescribed Prayer
          </h3>

          <div className="bg-gradient-to-br from-purple-950/20 via-card to-indigo-950/20 border border-purple-500/30 rounded-2xl p-5 shadow-sm space-y-3">
            <h4 className="text-sm font-bold font-serif text-purple-400">{activeCategory.prayer.title}</h4>
            <p className="text-sm font-serif italic text-foreground leading-relaxed">
              "{activeCategory.prayer.text}"
            </p>
            <div className="flex justify-end pt-1">
              <Button
                onClick={() => speakText(activeCategory.prayer.text)}
                variant="outline"
                size="sm"
                className="text-xs font-bold border-purple-500/30"
              >
                {isSpeaking ? <VolumeX className="w-3.5 h-3.5 mr-1.5 text-purple-400 animate-pulse" /> : <Volume2 className="w-3.5 h-3.5 mr-1.5 text-purple-400" />}
                {isSpeaking ? "Stop Audio" : "Listen to Prayer"}
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* Verse Card Modal */}
      {cardVerse && (
        <VerseCardGenerator
          verseText={cardVerse.text}
          reference={cardVerse.reference}
          isOpen={!!cardVerse}
          onClose={() => setCardVerse(null)}
        />
      )}
    </div>
  );
}
