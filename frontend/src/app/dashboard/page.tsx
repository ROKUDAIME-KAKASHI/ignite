import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { ChevronRight } from "lucide-react";

import prisma from "@/lib/prisma";

async function getJourney() {
  try {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const journey = await prisma.dailyJourney.findUnique({ where: { date: today } });
    return journey;
  } catch { 
    return null; 
  }
}

function getLiturgicalGreeting() {
  const day = new Date().toLocaleDateString("en-US", { weekday: "long" });
  const hour = new Date().getHours();
  if (hour < 12) return { greeting: "Lauds", sub: `Good Morning · ${day}` };
  if (hour < 17) return { greeting: "Sext", sub: `Good Afternoon · ${day}` };
  return { greeting: "Vespers", sub: `Good Evening · ${day}` };
}

export default async function DashboardPage() {
  const journey = await getJourney();
  const { greeting, sub } = getLiturgicalGreeting();

  return (
    <div className="flex-1 overflow-y-auto">

      {/* ── Hero ── */}
      <div className="relative overflow-hidden px-5 pt-8 pb-12 gradient-dawn">
        <svg viewBox="0 0 200 200" className="absolute right-0 top-0 w-56 h-56 opacity-10 text-white" fill="none" stroke="currentColor" strokeWidth="6">
          <line x1="100" y1="10" x2="100" y2="190" /><line x1="20" y1="70" x2="180" y2="70" />
        </svg>
        <div className="absolute -bottom-8 -left-8 w-40 h-40 rounded-full bg-yellow-300/20 blur-3xl" />
        <div className="relative z-10">
          <p className="text-amber-200/80 text-xs font-bold uppercase tracking-[0.2em] mb-1">{greeting} · Hour of Prayer</p>
          <h1 className="text-3xl font-extrabold text-white font-serif leading-tight">Welcome, Beloved.</h1>
          <p className="text-white/70 text-sm mt-1">{sub}</p>
          <div className="flex items-center gap-2 mt-4 flex-wrap">
            <div className="flex items-center gap-1.5 bg-white/15 backdrop-blur-sm rounded-full px-3 py-1.5 border border-white/20">
              <span>✝️</span>
              <span className="text-white text-xs font-semibold">Ordinary Time</span>
            </div>
            <div className="flex items-center gap-1.5 bg-white/15 backdrop-blur-sm rounded-full px-3 py-1.5 border border-white/20">
              <span className="candle-flicker">🕯️</span>
              <span className="text-white text-xs font-semibold">12 Day Streak</span>
            </div>
          </div>
        </div>
      </div>

      {/* ── Grace Points Card ── */}
      <div className="px-4 -mt-6 mb-5">
        <a href="/leaderboard" className="block glass dark:glass-dark rounded-2xl p-4 card-holy shadow-xl group hover:shadow-2xl transition-all">
          <div className="flex justify-between items-center mb-3">
            <div>
              <p className="text-[10px] font-bold text-primary uppercase tracking-widest group-hover:text-amber-500 transition-colors">Your Grace Points & Rank</p>
              <p className="text-2xl font-extrabold text-gradient-gold mt-0.5">2,450 <span className="text-base font-normal text-muted-foreground">/ 2,500</span></p>
            </div>
            <div className="w-14 h-14 rounded-full gradient-gold flex items-center justify-center halo-glow text-2xl shadow-lg group-hover:scale-105 transition-transform">🏆</div>
          </div>
          <Progress value={98} className="h-2.5 rounded-full bg-amber-100 dark:bg-amber-900/20 [&>div]:gradient-gold [&>div]:rounded-full" />
          <div className="flex items-center justify-between mt-1.5">
            <p className="text-[11px] text-muted-foreground">50 GP until <span className="text-primary font-bold">Apostle</span> rank</p>
            <p className="text-[10px] font-bold text-amber-600 flex items-center">View Leaderboard <ChevronRight className="w-3 h-3 ml-0.5" /></p>
          </div>
        </a>
      </div>

      <div className="px-4 space-y-5 pb-8">

        {/* Daily Verse */}
        <div className="rounded-2xl overflow-hidden card-holy card-holy-hover">
          <div className="bg-gradient-to-r from-amber-700/15 to-yellow-600/10 dark:from-amber-700/25 dark:to-yellow-600/15 px-4 pt-4 pb-3 border-b border-amber-200/30 dark:border-amber-800/20">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-xl gradient-gold flex items-center justify-center shadow-md text-lg">📖</div>
                <div>
                  <p className="font-bold text-sm text-foreground">Sacred Scripture</p>
                  <p className="text-xs text-primary font-semibold">{journey?.verseRef || &quot;Philippians 4:13&quot;}</p>
                </div>
              </div>
              <ChevronRight className="w-4 h-4 text-muted-foreground" />
            </div>
          </div>
          <div className="px-5 py-4 bg-card">
            <p className="text-sm font-serif italic text-foreground/80 leading-relaxed">&quot;{journey?.verse || &quot;I can do all things through Christ who strengthens me.&quot;}&quot;</p>
          </div>
        </div>

        {/* Reflection */}
        <div className="rounded-2xl overflow-hidden card-holy card-holy-hover">
          <div className="bg-gradient-to-r from-blue-700/10 to-indigo-600/8 dark:from-blue-700/20 dark:to-indigo-600/15 px-4 pt-4 pb-3 border-b border-blue-200/30 dark:border-blue-800/20">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-xl gradient-royal flex items-center justify-center shadow-md text-lg">🕊️</div>
                <div>
                  <p className="font-bold text-sm text-foreground">Contemplation</p>
                  <p className="text-xs text-blue-600 dark:text-blue-400 font-semibold">+20 Grace Points</p>
                </div>
              </div>
              <Badge className="text-[10px] bg-blue-50 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 border border-blue-200 dark:border-blue-800">New</Badge>
            </div>
          </div>
          <div className="px-5 py-4 bg-card">
            <p className="text-sm text-muted-foreground leading-relaxed line-clamp-3">
              {journey?.reflection || &quot;Reflect on the strength that comes not from within, but from your faith in Christ. When facing challenges, remember that you are never walking alone.&quot;}
            </p>
          </div>
        </div>

        {/* Mission */}
        <div className="rounded-2xl overflow-hidden card-holy card-holy-hover">
          <div className="bg-gradient-to-r from-red-700/10 to-rose-600/8 dark:from-red-700/20 dark:to-rose-600/15 px-4 pt-4 pb-3 border-b border-red-200/30 dark:border-red-800/20">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-xl gradient-crimson flex items-center justify-center shadow-md text-lg">⚔️</div>
                <div>
                  <p className="font-bold text-sm text-foreground">{journey?.mission?.title || &quot;Act of Charity&quot;}</p>
                  <p className="text-xs text-red-600 dark:text-red-400 font-semibold">+{journey?.mission?.xpReward || 50} Grace Points</p>
                </div>
              </div>
              <Badge className="text-[10px] bg-red-50 dark:bg-red-900/30 text-red-700 dark:text-red-300 border border-red-200 dark:border-red-800">Pending</Badge>
            </div>
          </div>
          <div className="px-5 py-4 bg-card">
            <p className="text-sm text-muted-foreground leading-relaxed">
              {journey?.mission?.description || &quot;Reach out to a friend you haven't spoken to in a while and offer a prayer for them.&quot;}
            </p>
          </div>
        </div>

        {/* Quizzes */}
        <a href="/quizzes" className="block rounded-2xl overflow-hidden card-holy card-holy-hover group">
          <div className="bg-gradient-to-r from-orange-700/10 to-amber-600/8 dark:from-orange-700/20 dark:to-amber-600/15 px-4 pt-4 pb-3 border-b border-orange-200/30 dark:border-orange-800/20">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-xl gradient-spirit flex items-center justify-center shadow-md text-lg">🎓</div>
                <div>
                  <p className="font-bold text-sm text-foreground">Daily Quiz</p>
                  <p className="text-xs text-orange-600 dark:text-orange-400 font-semibold">Earn up to 100 XP</p>
                </div>
              </div>
              <ChevronRight className="w-4 h-4 text-muted-foreground group-hover:text-primary transition-colors" />
            </div>
          </div>
          <div className="px-5 py-4 bg-card">
            <p className="text-sm text-muted-foreground leading-relaxed">
              Test your knowledge of Scripture and Orthodox teaching. New quiz available every day.
            </p>
          </div>
        </a>

        {/* Prayer Wall */}
        <a href="/prayer" className="block rounded-2xl overflow-hidden card-holy card-holy-hover group">
          <div className="bg-gradient-to-r from-purple-700/10 to-violet-600/8 dark:from-purple-700/20 dark:to-violet-600/15 px-4 pt-4 pb-3 border-b border-purple-200/30 dark:border-purple-800/20">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-xl gradient-lent flex items-center justify-center shadow-md text-lg">🙏</div>
                <div>
                  <p className="font-bold text-sm text-foreground">Prayer Wall</p>
                  <p className="text-xs text-purple-600 dark:text-purple-400 font-semibold">Lift each other up</p>
                </div>
              </div>
              <ChevronRight className="w-4 h-4 text-muted-foreground group-hover:text-primary transition-colors" />
            </div>
          </div>
          <div className="px-5 py-4 bg-card flex items-center justify-between">
            <p className="text-sm text-muted-foreground leading-relaxed">
              Share your intentions or pray for others in the community.
            </p>
            <Badge className="text-[10px] bg-purple-50 dark:bg-purple-900/30 text-purple-700 dark:text-purple-300 border border-purple-200 dark:border-purple-800 shrink-0 ml-2">6 Active</Badge>
          </div>
        </a>

        {/* Spiritual Stats */}
        <div>
          <h2 className="text-sm font-bold text-muted-foreground uppercase tracking-widest mb-3">Spiritual Progress</h2>
          <div className="grid grid-cols-3 gap-3">
            {[
              { emoji: &quot;📖&quot;, label: &quot;Chapters Read&quot;, value: "47", color: "bg-amber-50 dark:bg-amber-900/20 border-amber-200/50 dark:border-amber-800/30" },
              { emoji: "🙏", label: "Prayers Said", value: "38", color: "bg-blue-50 dark:bg-blue-900/20 border-blue-200/50 dark:border-blue-800/30" },
              { emoji: "✝️", label: "Masses", value: "12", color: "bg-purple-50 dark:bg-purple-900/20 border-purple-200/50 dark:border-purple-800/30" },
            ].map((s) => (
              <div key={s.label} className={`rounded-2xl p-3 text-center border card-holy ${s.color}`}>
                <p className="text-2xl mb-1">{s.emoji}</p>
                <p className="text-xl font-extrabold text-foreground">{s.value}</p>
                <p className="text-[9px] text-muted-foreground font-bold uppercase tracking-wider leading-tight mt-0.5">{s.label}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Saint of the Day */}
        <div className="rounded-2xl p-4 gradient-lent card-holy">
          <p className="text-[10px] text-purple-200 font-bold uppercase tracking-widest">Saint of the Day</p>
          <p className="text-base font-bold text-white font-serif mt-1">St. Thomas the Apostle</p>
          <p className="text-purple-200 text-xs mt-1 italic leading-relaxed">&quot;My Lord and my God!&quot; — John 20:28</p>
        </div>
      </div>
    </div>
  );
}
