import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { ChevronRight, ScanLine, Megaphone, Calendar, MapPin, Clock } from "lucide-react";

import prisma from "@/lib/prisma";
import { getSession } from "@/lib/auth";

async function getJourney() {
  try {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    let journey = await prisma.dailyJourney.findUnique({ 
      where: { date: today },
      include: { mission: true, quiz: true } 
    });

    if (!journey) {
      const verses = [
        { verse: "I can do all things through Christ who strengthens me.", ref: "Philippians 4:13" },
        { verse: "For God gave us a spirit not of fear but of power and love and self-control.", ref: "2 Timothy 1:7" },
        { verse: "The Lord is my shepherd; I shall not want.", ref: "Psalm 23:1" },
        { verse: "Cast all your anxieties on him, because he cares for you.", ref: "1 Peter 5:7" },
        { verse: "Rejoice always, pray without ceasing, give thanks in all circumstances.", ref: "1 Thessalonians 5:16-18" },
      ];
      
      const v = verses[Math.floor(Math.random() * verses.length)];

      journey = await prisma.dailyJourney.create({
        data: {
          date: today,
          verse: v.verse,
          verseRef: v.ref,
          reflection: "Reflect on this scripture today. Allow God's word to guide your actions, thoughts, and words as you go about your daily life.",
          prayer: "Lord, grant me the strength to overcome today's obstacles, knowing You are always with me.",
        },
        include: { mission: true, quiz: true }
      });
    }

    return journey;
  } catch (e) {
    console.error(e);
    return null; 
  }
}

async function getLatestAnnouncements() {
  try {
    return await prisma.announcement.findMany({
      orderBy: { createdAt: "desc" },
      take: 3,
    });
  } catch {
    return [];
  }
}

async function getSaintOfTheDay() {
  try {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    let saint = await prisma.saintOfTheDay.findUnique({
      where: { date: today }
    });

    if (!saint) {
      // For demo MVP, randomly select one if missing
      const saints = [
        { name: "St. Thomas the Apostle", title: "My Lord and my God! — John 20:28", bio: "The apostle who doubted." },
        { name: "St. Peter", title: "Upon this rock... — Matt 16:18", bio: "The first Pope." },
        { name: "St. Mary Magdalene", title: "Apostle to the Apostles", bio: "First witness of the Resurrection." },
        { name: "St. John Chrysostom", title: "Golden-mouthed", bio: "Archbishop of Constantinople and important Early Church Father." },
      ];
      const s = saints[Math.floor(Math.random() * saints.length)];
      saint = await prisma.saintOfTheDay.create({
        data: {
          date: today,
          name: s.name,
          title: s.title,
          bio: s.bio
        }
      });
    }
    return saint;
  } catch (e) {
    return { name: "St. Thomas the Apostle", title: "My Lord and my God! — John 20:28" };
  }
}

async function getNextEvents() {
  try {
    return await prisma.event.findMany({
      where: { date: { gte: new Date() } },
      orderBy: { date: "asc" },
      take: 2,
      include: { attendances: true },
    });
  } catch {
    return [];
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
  const saint = await getSaintOfTheDay();
  const { greeting, sub } = getLiturgicalGreeting();
  
  const session = await getSession();
  const userId = session?.id;

  const [dbUser, chaptersRead, prayersSaid, eventsAttended] = userId ? await Promise.all([
    prisma.user.findUnique({ where: { id: userId }, select: { xp: true, streak: true, level: true } }),
    prisma.xPLog.count({ where: { userId, reason: { contains: "Chapter" } } }),
    prisma.xPLog.count({ where: { userId, reason: { contains: "prayer" } } }), // Covers both submitting and praying for others
    prisma.attendance.count({ where: { userId } }),
  ]) : [null, 0, 0, 0];

  const xp = dbUser?.xp || 0;
  const streak = dbUser?.streak || 0;
  const level = dbUser?.level || 1;
  const nextLevelXp = level * 500;
  const progress = Math.min(100, Math.round((xp / nextLevelXp) * 100));

  const announcements = await getLatestAnnouncements();
  const upcomingEvents = await getNextEvents();

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
          <h1 className="text-3xl font-extrabold text-white font-serif leading-tight">Welcome, {session?.firstName || "Beloved"}.</h1>
          <p className="text-white/70 text-sm mt-1">{sub}</p>
          <div className="flex items-center gap-2 mt-4 flex-wrap">
            <div className="flex items-center gap-1.5 bg-white/15 backdrop-blur-sm rounded-full px-3 py-1.5 border border-white/20">
              <span>✝️</span>
              <span className="text-white text-xs font-semibold">Ordinary Time</span>
            </div>
            <div className="flex items-center gap-1.5 bg-white/15 backdrop-blur-sm rounded-full px-3 py-1.5 border border-white/20">
              <span className="candle-flicker">🕯️</span>
              <span className="text-white text-xs font-semibold">{streak} Day Streak</span>
            </div>
          </div>
        </div>
      </div>

      {/* ── Grace Points Card ── */}
      <div className="relative z-20 px-4 -mt-6 mb-5">
        <a href="/leaderboard" className="block glass dark:glass-dark rounded-2xl p-4 card-holy shadow-xl group hover:shadow-2xl transition-all">
          <div className="flex justify-between items-center mb-3">
            <div>
              <p className="text-[10px] font-bold text-primary uppercase tracking-widest group-hover:text-amber-500 transition-colors">Your Grace Points & Rank</p>
              <p className="text-2xl font-extrabold text-gradient-gold mt-0.5">{xp.toLocaleString()} <span className="text-base font-normal text-muted-foreground">/ {nextLevelXp.toLocaleString()}</span></p>
            </div>
            <div className="w-14 h-14 rounded-full gradient-gold flex items-center justify-center halo-glow text-2xl shadow-lg group-hover:scale-105 transition-transform">🏆</div>
          </div>
          <div className="flex items-center gap-3">
            <Progress value={progress} className="h-2 rounded-full bg-amber-100 dark:bg-amber-900/20 [&>div]:gradient-gold [&>div]:rounded-full flex-1" />
            <span className="text-xs font-bold text-muted-foreground whitespace-nowrap">{nextLevelXp - xp} to rank up</span>
          </div>
        </a>
      </div>

      {/* ── Admin Announcements ── */}
      {announcements.length > 0 && (
        <div className="px-4 mb-5">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2">
              <Megaphone className="w-4 h-4 text-primary" />
              <h2 className="text-sm font-bold text-foreground uppercase tracking-wider">Parish Notices</h2>
            </div>
            <Badge className="text-[10px] bg-primary/10 text-primary border-0">{announcements.length} new</Badge>
          </div>
          <div className="space-y-2">
            {announcements.map((ann) => (
              <div
                key={ann.id}
                className="rounded-2xl bg-gradient-to-r from-amber-50 to-yellow-50 dark:from-amber-950/30 dark:to-yellow-950/20 border border-amber-200/60 dark:border-amber-800/30 px-4 py-3 card-holy"
              >
                <div className="flex items-start gap-2.5">
                  <span className="text-lg mt-0.5">📢</span>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-bold text-foreground font-serif leading-snug">{ann.title}</p>
                    <p className="text-xs text-muted-foreground mt-1 leading-relaxed line-clamp-2">{ann.content}</p>
                    <p className="text-[10px] text-amber-600 dark:text-amber-400 font-semibold mt-1">
                      {new Date(ann.createdAt).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })}
                    </p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ── Upcoming Events ── */}
      {upcomingEvents.length > 0 && (
        <div className="px-4 mb-5">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2">
              <Calendar className="w-4 h-4 text-primary" />
              <h2 className="text-sm font-bold text-foreground uppercase tracking-wider">Upcoming Events</h2>
            </div>
            <a href="/events" className="text-xs font-bold text-primary flex items-center gap-0.5 hover:opacity-80 transition-opacity">
              See all <ChevronRight className="w-3.5 h-3.5" />
            </a>
          </div>
          <div className="space-y-2">
            {upcomingEvents.map((ev) => (
              <a
                key={ev.id}
                href="/events"
                className="block rounded-2xl bg-gradient-to-r from-green-50 to-emerald-50 dark:from-green-950/30 dark:to-emerald-950/20 border border-green-200/60 dark:border-green-800/30 px-4 py-3 card-holy card-holy-hover"
              >
                <div className="flex items-start gap-2.5">
                  <span className="text-lg mt-0.5">📅</span>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-bold text-foreground font-serif leading-snug">{ev.title}</p>
                    {ev.description && (
                      <p className="text-xs text-muted-foreground mt-0.5 line-clamp-1">{ev.description}</p>
                    )}
                    <div className="flex items-center gap-3 mt-1.5 flex-wrap">
                      <span className="flex items-center gap-1 text-[10px] text-green-700 dark:text-green-400 font-semibold">
                        <Clock className="w-3 h-3" />
                        {new Date(ev.date).toLocaleDateString("en-US", { weekday: "short", month: "short", day: "numeric" })}
                      </span>
                      {ev.location && (
                        <span className="flex items-center gap-1 text-[10px] text-muted-foreground">
                          <MapPin className="w-3 h-3" />
                          {ev.location}
                        </span>
                      )}
                      <span className="text-[10px] text-muted-foreground">{ev.attendances.length} going</span>
                    </div>
                  </div>
                  <ChevronRight className="w-4 h-4 text-muted-foreground shrink-0 mt-1" />
                </div>
              </a>
            ))}
          </div>
        </div>
      )}

      {/* ── QR Check-in Card ── */}
      <div className="px-4 mb-5 relative z-20">
        <a href="/scan" className="block rounded-2xl overflow-hidden card-holy card-holy-hover bg-gradient-to-r from-emerald-600 to-green-500 shadow-lg shadow-emerald-500/20 p-4">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 bg-white/20 rounded-xl flex items-center justify-center backdrop-blur-md">
              <ScanLine className="w-6 h-6 text-white" />
            </div>
            <div>
              <p className="font-bold text-white text-lg leading-tight">Event Check-In</p>
              <p className="text-emerald-100 text-sm">Scan QR code to earn XP</p>
            </div>
            <ChevronRight className="w-5 h-5 text-white/70 ml-auto" />
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
                  <p className="text-xs text-primary font-semibold">{journey?.verseRef || "Philippians 4:13"}</p>
                </div>
              </div>
              <ChevronRight className="w-4 h-4 text-muted-foreground" />
            </div>
          </div>
          <div className="px-5 py-4 bg-card">
            <p className="text-sm font-serif italic text-foreground/80 leading-relaxed">"{journey?.verse || "I can do all things through Christ who strengthens me."}"</p>
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
              {journey?.reflection || "Reflect on the strength that comes not from within, but from your faith in Christ. When facing challenges, remember that you are never walking alone."}
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
                  <p className="font-bold text-sm text-foreground">{journey?.mission?.title || "Act of Charity"}</p>
                  <p className="text-xs text-red-600 dark:text-red-400 font-semibold">+{journey?.mission?.xpReward || 50} Grace Points</p>
                </div>
              </div>
              <Badge className="text-[10px] bg-red-50 dark:bg-red-900/30 text-red-700 dark:text-red-300 border border-red-200 dark:border-red-800">Pending</Badge>
            </div>
          </div>
          <div className="px-5 py-4 bg-card">
            <p className="text-sm text-muted-foreground leading-relaxed">
              {journey?.mission?.description || "Reach out to a friend you haven't spoken to in a while and offer a prayer for them."}
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
            <Badge className="text-[10px] bg-purple-50 dark:bg-purple-900/30 text-purple-700 dark:text-purple-300 border border-purple-200 dark:border-purple-800 shrink-0 ml-2">Active</Badge>
          </div>
        </a>

        {/* Spiritual Guides */}
        <a href="/guides" className="block rounded-2xl overflow-hidden card-holy card-holy-hover group">
          <div className="bg-gradient-to-r from-teal-700/10 to-emerald-600/8 dark:from-teal-700/20 dark:to-emerald-600/15 px-4 pt-4 pb-3 border-b border-teal-200/30 dark:border-teal-800/20">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-teal-400 to-emerald-600 text-white flex items-center justify-center shadow-md text-lg">📿</div>
                <div>
                  <p className="font-bold text-sm text-foreground">Spiritual Guides</p>
                  <p className="text-xs text-teal-600 dark:text-teal-400 font-semibold">Confession & Prayers</p>
                </div>
              </div>
              <ChevronRight className="w-4 h-4 text-muted-foreground group-hover:text-primary transition-colors" />
            </div>
          </div>
          <div className="px-5 py-4 bg-card">
            <p className="text-sm text-muted-foreground leading-relaxed">
              Examination of conscience, Orthodox prayers, and spiritual preparation for the Holy Mysteries.
            </p>
          </div>
        </a>

        {/* Spiritual Stats */}
        <div>
          <h2 className="text-sm font-bold text-muted-foreground uppercase tracking-widest mb-3">Spiritual Progress</h2>
          <div className="grid grid-cols-3 gap-3">
            {[
              { emoji: "📖", label: "Chapters Read", value: chaptersRead, color: "bg-amber-50 dark:bg-amber-900/20 border-amber-200/50 dark:border-amber-800/30" },
              { emoji: "🙏", label: "Prayers Said", value: prayersSaid, color: "bg-blue-50 dark:bg-blue-900/20 border-blue-200/50 dark:border-blue-800/30" },
              { emoji: "✝️", label: "Masses/Events", value: eventsAttended, color: "bg-purple-50 dark:bg-purple-900/20 border-purple-200/50 dark:border-purple-800/30" },
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
          <p className="text-base font-bold text-white font-serif mt-1">{saint?.name}</p>
          <p className="text-purple-200 text-xs mt-1 italic leading-relaxed">{saint?.title}</p>
        </div>
      </div>
    </div>
  );
}
