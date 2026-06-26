"use client";

import { useState } from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { CheckCircle2, Clock } from "lucide-react";
import { motion } from "framer-motion";
import { cn } from "@/lib/utils";

const tabs = ["Active", "Completed", "All"];

const missions = [
  {
    id: 1,
    type: "daily",
    title: "Corporal Work of Mercy",
    subtitle: "Feed the Hungry",
    description: "Share a meal, donate food, or volunteer at a soup kitchen today. As Jesus said: 'Whatever you did for one of the least of these brothers and sisters of mine, you did for me.' — Matthew 25:40",
    xp: 50,
    verse: "Matthew 25:40",
    timeLeft: "14h remaining",
    emoji: "🍞",
    gradient: "gradient-gold",
    badgeColor: "bg-amber-100 text-amber-800 dark:bg-amber-900/30 dark:text-amber-300",
    headerBg: "from-amber-600/10 to-yellow-500/8 dark:from-amber-600/20 dark:to-yellow-500/15",
    border: "border-amber-200/50 dark:border-amber-800/30",
    xpColor: "text-amber-600 dark:text-amber-400",
  },
  {
    id: 2,
    type: "weekly",
    title: "Holy Mass",
    subtitle: "Attend Sunday Liturgy",
    description: "Attend Holy Mass at your parish and participate fully in the Eucharist. The Mass is the source and summit of Christian life — CCC 1324.",
    xp: 150,
    verse: "CCC 1324",
    timeLeft: "Resets Sunday",
    emoji: "⛪",
    gradient: "gradient-royal",
    badgeColor: "bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300",
    headerBg: "from-blue-700/10 to-indigo-600/8 dark:from-blue-700/20 dark:to-indigo-600/15",
    border: "border-blue-200/50 dark:border-blue-800/30",
    xpColor: "text-blue-600 dark:text-blue-400",
  },
  {
    id: 3,
    type: "daily",
    title: "Lectio Divina",
    subtitle: "Sacred Reading",
    description: "Spend 10 minutes in Lectio Divina — Read, Meditate, Pray, and Contemplate a passage from today's Daily Mass readings. Let the Word dwell in you richly (Col 3:16).",
    xp: 30,
    verse: "Colossians 3:16",
    timeLeft: "14h remaining",
    emoji: "✍️",
    gradient: "gradient-lent",
    badgeColor: "bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-300",
    headerBg: "from-purple-700/10 to-violet-600/8 dark:from-purple-700/20 dark:to-violet-600/15",
    border: "border-purple-200/50 dark:border-purple-800/30",
    xpColor: "text-purple-600 dark:text-purple-400",
  },
  {
    id: 4,
    type: "seasonal",
    title: "Pilgrimage of the Gospels",
    subtitle: "Lenten Reading Plan",
    description: "Read all four Gospels — Matthew, Mark, Luke, and John — before Easter Sunday. Walk with Jesus from Bethlehem to Calvary and the empty tomb.",
    xp: 500,
    verse: "John 20:31",
    timeLeft: "24 days left",
    emoji: "🌿",
    progress: 25,
    gradient: "gradient-life",
    badgeColor: "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300",
    headerBg: "from-green-700/10 to-emerald-600/8 dark:from-green-700/20 dark:to-emerald-600/15",
    border: "border-green-200/50 dark:border-green-800/30",
    xpColor: "text-green-600 dark:text-green-400",
  },
];

const typeLabel: Record<string, string> = {
  daily: &quot;Daily&quot;,
  weekly: &quot;Weekly&quot;,
  seasonal: "Seasonal",
};

export default function MissionsPage() {
  const [activeTab, setActiveTab] = useState("Active");
  const [completed, setCompleted] = useState<number[]>([]);

  const toggle = (id: number) =>
    setCompleted((p) => (p.includes(id) ? p.filter((x) => x !== id) : [...p, id]));

  return (
    <div className="flex-1 overflow-y-auto">

      {/* ── Header ── */}
      <div className="relative overflow-hidden px-5 pt-8 pb-10 gradient-crimson">
        <svg viewBox="0 0 200 200" className="absolute right-0 top-0 w-48 h-48 opacity-10 text-white" fill="none" stroke="currentColor" strokeWidth="6">
          <line x1="100" y1="10" x2="100" y2="190" /><line x1="20" y1="70" x2="180" y2="70" />
        </svg>
        <div className="absolute -bottom-6 -left-6 w-36 h-36 rounded-full bg-white/10 blur-2xl" />
        <div className="relative z-10">
          <div className="flex items-center gap-3 mb-2">
            <div className="w-10 h-10 rounded-xl bg-white/20 backdrop-blur-sm flex items-center justify-center text-2xl">⚔️</div>
            <div>
              <h1 className="text-2xl font-extrabold text-white font-serif">Missions</h1>
              <p className="text-red-200 text-xs font-semibold uppercase tracking-wider">Works of Mercy</p>
            </div>
          </div>
          <p className="text-red-100/80 text-sm italic font-serif mt-2">
            &quot;Put on the full armor of God.&quot; — Ephesians 6:11
          </p>
          <div className="flex items-center gap-2 mt-4 flex-wrap">
            <div className="flex items-center gap-1.5 bg-white/15 backdrop-blur-sm rounded-full px-3 py-1.5 border border-white/20">
              <span>✝️</span>
              <span className="text-white text-xs font-semibold">0 / 730 GP earned today</span>
            </div>
            <div className="flex items-center gap-1.5 bg-white/15 backdrop-blur-sm rounded-full px-3 py-1.5 border border-white/20">
              <span>👑</span>
              <span className="text-white text-xs font-semibold">23 Completed</span>
            </div>
          </div>
        </div>
      </div>

      <div className="px-4 pt-4 pb-8 space-y-4">
        {/* Tabs */}
        <div className="flex gap-1 bg-muted rounded-xl p-1">
          {tabs.map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={cn(
                &quot;flex-1 py-2 text-sm font-semibold rounded-lg transition-all duration-200&quot;,
                activeTab === tab ? &quot;bg-card text-primary shadow-sm&quot; : "text-muted-foreground hover:text-foreground"
              )}
            >
              {tab}
            </button>
          ))}
        </div>

        {/* Mission Cards */}
        <div className="space-y-4">
          {missions.map((m, i) => {
            const done = completed.includes(m.id);
            return (
              <motion.div
                key={m.id}
                initial={{ opacity: 0, y: 16 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.07 }}
                className={cn(
                  "rounded-2xl overflow-hidden border card-holy-hover transition-all",
                  done ? "opacity-70 " + m.border : m.border,
                  "card-holy"
                )}
              >
                {/* Card header */}
                <div className={`bg-gradient-to-r ${m.headerBg} px-4 pt-4 pb-3 border-b ${m.border}`}>
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex items-start gap-3">
                      <span className="text-3xl leading-none mt-0.5">{m.emoji}</span>
                      <div>
                        <div className="flex items-center gap-2 flex-wrap mb-0.5">
                          <p className="font-bold text-foreground font-serif">{m.title}</p>
                          <Badge className={cn("text-[10px] border-0 px-2 py-0.5", m.badgeColor)}>
                            {typeLabel[m.type]}
                          </Badge>
                        </div>
                        <p className="text-xs text-muted-foreground italic">{m.subtitle}</p>
                        <div className="flex items-center gap-1.5 mt-1 text-xs text-muted-foreground">
                          <Clock className="w-3 h-3" />
                          <span>{m.timeLeft}</span>
                        </div>
                      </div>
                    </div>
                    <div className="shrink-0 text-right">
                      <p className="text-lg font-extrabold text-foreground">+{m.xp}</p>
                      <p className={cn("text-[10px] font-bold", m.xpColor)}>Grace Pts</p>
                    </div>
                  </div>
                </div>

                {/* Card body */}
                <div className="px-5 py-4 bg-card space-y-3">
                  <p className="text-sm text-muted-foreground leading-relaxed">{m.description}</p>
                  <p className="text-xs text-primary font-semibold italic">— {m.verse}</p>
                  {m.progress !== undefined && (
                    <div className="space-y-1.5">
                      <div className="flex justify-between text-xs font-semibold">
                        <span className="text-muted-foreground">Journey Progress</span>
                        <span className="text-primary">{m.progress}%</span>
                      </div>
                      <Progress value={m.progress} className="h-2 rounded-full bg-muted [&>div]:rounded-full [&>div]:bg-green-500&quot; />
                    </div>
                  )}
                  <Button
                    onClick={() => toggle(m.id)}
                    className={cn(
                      &quot;w-full h-10 rounded-xl font-bold transition-all&quot;,
                      done
                        ? &quot;bg-green-50 dark:bg-green-900/20 text-green-700 dark:text-green-400 border border-green-200 dark:border-green-800&quot;
                        : `${m.gradient} text-white shadow-md`
                    )}
                    variant={done ? "outline" : "default"}
                  >
                    <CheckCircle2 className="w-4 h-4 mr-2" />
                    {done ? &quot;✓ Mission Complete — Deo Gratias!&quot; : &quot;Mark as Complete&quot;}
                  </Button>
                </div>
              </motion.div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
