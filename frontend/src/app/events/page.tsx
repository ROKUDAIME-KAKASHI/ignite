"use client";

import { useState } from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Calendar, MapPin, Clock, Users, ChevronRight } from "lucide-react";
import { motion } from "framer-motion";
import { cn } from "@/lib/utils";

const tabs = ["Upcoming", "Registered", "Past"];

import { getEvents, rsvpEvent } from "./actions";
import { useEffect } from "react";

// fallback type
type EventType = {
  id: string | number;
  title: string;
  date: string;
  time: string;
  location: string;
  attendees: number;
  category: string;
  gradient?: string;
  headerGradient?: string;
  border?: string;
  emoji?: string;
  description: string;
};

const STATIC_EVENTS: EventType[] = [
  {
    id: 1,
    title: "Adoration & Worship Night",
    date: "Fri, Oct 24",
    time: "7:00 PM – 9:00 PM",
    location: "Main Sanctuary",
    attendees: 47,
    category: "Adoration",
    gradient: "gradient-gold",
    headerGradient: "from-amber-600/10 to-yellow-500/8 dark:from-amber-600/20 dark:to-yellow-500/15",
    border: "border-amber-200/50 dark:border-amber-800/30",
    emoji: "🕯️",
    description: "Join us for an evening of Eucharistic Adoration, praise and worship, and intercessory prayer.",
  },
  {
    id: 2,
    title: "Works of Mercy: Food Drive",
    date: "Sat, Oct 25",
    time: "9:00 AM – 1:00 PM",
    location: "Parish Hall",
    attendees: 23,
    category: "Charity",
    gradient: "gradient-life",
    headerGradient: "from-green-700/10 to-emerald-500/8 dark:from-green-700/20 dark:to-emerald-500/15",
    border: "border-green-200/50 dark:border-green-800/30",
    emoji: "🍞",
    description: "Volunteer to collect, sort, and distribute food to families in need. Love in action.",
  },
  {
    id: 3,
    title: "Bible Study: Letters of St. Paul",
    date: "Wed, Oct 29",
    time: "6:30 PM – 8:00 PM",
    location: "Youth Room 102",
    attendees: 18,
    category: "Scripture",
    gradient: "gradient-royal",
    headerGradient: "from-blue-700/10 to-indigo-600/8 dark:from-blue-700/20 dark:to-indigo-600/15",
    border: "border-blue-200/50 dark:border-blue-800/30",
    emoji: "✍️",
    description: "Deep dive into Romans and Galatians. Led by Fr. Michael. All youth welcome.",
  },
  {
    id: 4,
    title: "Youth Retreat: Mount Tabor",
    date: "Nov 7–9",
    time: "Full Weekend",
    location: "Camp Emmaus",
    attendees: 62,
    category: "Retreat",
    gradient: "gradient-lent",
    headerGradient: "from-purple-700/10 to-violet-600/8 dark:from-purple-700/20 dark:to-violet-600/15",
    border: "border-purple-200/50 dark:border-purple-800/30",
    emoji: "⛺",
    description: "A transformative weekend of prayer, silence, Confession, Mass, and fellowship. Limited spots.",
  },
  {
    id: 5,
    title: "Stations of the Cross",
    date: "Fri, Oct 31",
    time: "6:00 PM – 7:00 PM",
    location: "Church Grounds",
    attendees: 31,
    category: "Prayer",
    gradient: "gradient-crimson",
    headerGradient: "from-red-700/10 to-rose-600/8 dark:from-red-700/20 dark:to-rose-600/15",
    border: "border-red-200/50 dark:border-red-800/30",
    emoji: "✝️",
    description: "Walk the Way of the Cross together, meditating on Christ's Passion and sacrificial love.",
  },
];

const categoryColors: Record<string, string> = {
  Adoration: "bg-amber-100 text-amber-800 dark:bg-amber-900/30 dark:text-amber-300",
  Charity: "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300",
  Scripture: "bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300",
  Retreat: "bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-300",
  Prayer: "bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300",
};

export default function EventsPage() {
  const [activeTab, setActiveTab] = useState("Upcoming");
  const [registered, setRegistered] = useState<(string | number)[]>([]);
  const [events, setEvents] = useState<EventType[]>(STATIC_EVENTS);

  useEffect(() => {
    getEvents().then((dbEvents) => {
      // Merge DB events with static for display purposes, mapping visual styles
      const mappedDbEvents = dbEvents.map((db, i) => ({
        ...db,
        gradient: "gradient-gold",
        headerGradient: "from-amber-600/10 to-yellow-500/8 dark:from-amber-600/20 dark:to-yellow-500/15",
        border: "border-amber-200/50 dark:border-amber-800/30",
        emoji: "📅",
      }));
      setEvents([...mappedDbEvents, ...STATIC_EVENTS]);
    });
  }, []);

  const toggleReg = async (id: string | number) => {
    setRegistered((p) => (p.includes(id) ? p.filter((x) => x !== id) : [...p, id]));
    if (typeof id === 'string') {
      await rsvpEvent(id);
    }
  };

  const shown =
    activeTab === "Registered" ? events.filter((e) => registered.includes(e.id))
    : activeTab === "Past" ? []
    : events;

  return (
    <div className="flex-1 overflow-y-auto">

      {/* ── Header ── */}
      <div className="relative overflow-hidden px-5 pt-8 pb-10 gradient-life">
        <svg viewBox="0 0 200 200" className="absolute right-0 top-0 w-48 h-48 opacity-10 text-white" fill="none" stroke="currentColor" strokeWidth="6">
          <line x1="100" y1="10" x2="100" y2="190" /><line x1="20" y1="70" x2="180" y2="70" />
        </svg>
        <div className="relative z-10">
          <div className="flex items-center gap-3 mb-2">
            <div className="w-10 h-10 rounded-xl bg-white/20 backdrop-blur-sm flex items-center justify-center text-xl">🕊️</div>
            <div>
              <h1 className="text-2xl font-extrabold text-white font-serif">Parish Events</h1>
              <p className="text-green-100 text-xs font-semibold uppercase tracking-wider">Gather · Pray · Serve</p>
            </div>
          </div>
          <p className="text-green-100/80 text-sm italic font-serif mt-2">
            "Where two or three gather in my name, I am with them." — Matthew 18:20
          </p>
          <div className="flex items-center gap-2 mt-4 flex-wrap">
            <div className="flex items-center gap-1.5 bg-white/15 backdrop-blur-sm rounded-full px-3 py-1.5 border border-white/20">
              <Calendar className="w-3.5 h-3.5 text-white" />
              <span className="text-white text-xs font-semibold">{events.length} upcoming</span>
            </div>
            <div className="flex items-center gap-1.5 bg-white/15 backdrop-blur-sm rounded-full px-3 py-1.5 border border-white/20">
              <Users className="w-3.5 h-3.5 text-white" />
              <span className="text-white text-xs font-semibold">{registered.length} registered</span>
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
                "flex-1 py-2 text-sm font-semibold rounded-lg transition-all duration-200",
                activeTab === tab ? "bg-card text-primary shadow-sm" : "text-muted-foreground hover:text-foreground"
              )}
            >
              {tab}
            </button>
          ))}
        </div>

        {shown.length === 0 ? (
          <div className="text-center py-14 text-muted-foreground">
            <p className="text-4xl mb-3">🕊️</p>
            <p className="font-serif font-semibold text-lg">No events here</p>
            <p className="text-sm italic mt-1">"Be still and know that I am God." — Ps 46:10</p>
          </div>
        ) : (
          <div className="space-y-4">
            {shown.map((event, i) => {
              const isReg = registered.includes(event.id);
              return (
                <motion.div
                  key={event.id}
                  initial={{ opacity: 0, y: 16 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.07 }}
                  className={cn("rounded-2xl overflow-hidden border card-holy card-holy-hover", event.border)}
                >
                  {/* Gradient banner */}
                  <div className={`bg-gradient-to-r ${event.headerGradient} px-4 pt-4 pb-3 border-b ${event.border}`}>
                    <div className="flex items-start gap-3">
                      <span className="text-3xl leading-none mt-0.5">{event.emoji}</span>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-start justify-between gap-2 flex-wrap">
                          <p className="font-bold text-foreground font-serif text-base">{event.title}</p>
                          <div className="flex items-center gap-1.5">
                            <Badge className={cn("text-[10px] border-0 px-2", categoryColors[event.category])}>
                              {event.category}
                            </Badge>
                            {isReg && <span className="text-green-600 dark:text-green-400 text-sm font-bold">✓</span>}
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Body */}
                  <div className="px-4 py-3 bg-card space-y-2">
                    <p className="text-sm text-muted-foreground italic leading-relaxed">{event.description}</p>
                    <div className="grid grid-cols-2 gap-1 text-xs text-muted-foreground">
                      <div className="flex items-center gap-1.5"><Calendar className="w-3.5 h-3.5 text-primary/50" />{event.date}</div>
                      <div className="flex items-center gap-1.5"><Clock className="w-3.5 h-3.5 text-primary/50" />{event.time}</div>
                      <div className="flex items-center gap-1.5"><MapPin className="w-3.5 h-3.5 text-primary/50" />{event.location}</div>
                      <div className="flex items-center gap-1.5"><Users className="w-3.5 h-3.5 text-primary/50" />{event.attendees} going</div>
                    </div>
                    <div className="flex gap-2 pt-1">
                      <Button
                        onClick={() => toggleReg(event.id)}
                        className={cn(
                          "flex-1 h-9 rounded-xl font-bold text-sm transition-all",
                          isReg
                            ? "bg-muted text-muted-foreground border border-border"
                            : `${event.gradient || "gradient-gold"} text-white shadow-md`
                        )}
                        variant={isReg ? "outline" : "default"}
                      >
                        {isReg ? "✓ Registered" : "Register · RSVP"}
                      </Button>
                      <Button variant="ghost" size="icon" className="h-9 w-9 rounded-xl">
                        <ChevronRight className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>
                </motion.div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
