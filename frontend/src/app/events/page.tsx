"use client";

import { useState, useEffect } from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Calendar, MapPin, Clock, Users, ChevronRight, Camera, X, Plus } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { cn } from "@/lib/utils";
import { getEvents, rsvpEvent, getEventGallery, uploadEventPhoto } from "./actions";

const tabs = ["Upcoming", "Registered", "Past"];

type EventType = {
  id: string;
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
  isoDate?: string;
  rawDate?: Date;
  photosCount?: number;
};

// Style palette cycling for DB events
const EVENT_STYLES = [
  {
    gradient: "gradient-gold",
    headerGradient: "from-amber-600/10 to-yellow-500/8 dark:from-amber-600/20 dark:to-yellow-500/15",
    border: "border-amber-200/50 dark:border-amber-800/30",
    emoji: "🕯️",
    category: "Parish",
  },
  {
    gradient: "gradient-life",
    headerGradient: "from-green-700/10 to-emerald-500/8 dark:from-green-700/20 dark:to-emerald-500/15",
    border: "border-green-200/50 dark:border-green-800/30",
    emoji: "🌿",
    category: "Service",
  },
  {
    gradient: "gradient-royal",
    headerGradient: "from-blue-700/10 to-indigo-600/8 dark:from-blue-700/20 dark:to-indigo-600/15",
    border: "border-blue-200/50 dark:border-blue-800/30",
    emoji: "✍️",
    category: "Scripture",
  },
  {
    gradient: "gradient-lent",
    headerGradient: "from-purple-700/10 to-violet-600/8 dark:from-purple-700/20 dark:to-violet-600/15",
    border: "border-purple-200/50 dark:border-purple-800/30",
    emoji: "⛺",
    category: "Retreat",
  },
  {
    gradient: "gradient-crimson",
    headerGradient: "from-red-700/10 to-rose-600/8 dark:from-red-700/20 dark:to-rose-600/15",
    border: "border-red-200/50 dark:border-red-800/30",
    emoji: "✝️",
    category: "Prayer",
  },
];

const categoryColors: Record<string, string> = {
  Parish:    "bg-amber-100 text-amber-800 dark:bg-amber-900/30 dark:text-amber-300",
  Service:   "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300",
  Scripture: "bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300",
  Retreat:   "bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-300",
  Prayer:    "bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300",
  General:   "bg-slate-100 text-slate-800 dark:bg-slate-800 dark:text-slate-300",
};

export default function EventsPage() {
  const [activeTab, setActiveTab] = useState("Upcoming");
  const [registered, setRegistered] = useState<string[]>([]);
  const [events, setEvents] = useState<EventType[]>([]);
  const [loading, setLoading] = useState(true);
  
  // Gallery State
  const [selectedEventId, setSelectedEventId] = useState<string | null>(null);
  const [galleryPhotos, setGalleryPhotos] = useState<any[]>([]);
  const [galleryLoading, setGalleryLoading] = useState(false);

  useEffect(() => {
    getEvents().then((dbEvents) => {
      const mapped = dbEvents.map((db, i) => {
        const style = EVENT_STYLES[i % EVENT_STYLES.length];
        const rawDate = db.isoDate ? new Date(db.isoDate) : undefined;
        return {
          ...db,
          ...style,
          rawDate,
        };
      });
      setEvents(mapped as EventType[]);
      setLoading(false);
    });
  }, []);

  const toggleReg = async (id: string) => {
    setRegistered((p) => (p.includes(id) ? p.filter((x) => x !== id) : [...p, id]));
    if (typeof id === "string") {
      await rsvpEvent(id);
    }
  };

  const openGallery = async (eventId: string) => {
    setSelectedEventId(eventId);
    setGalleryLoading(true);
    const photos = await getEventGallery(eventId);
    setGalleryPhotos(photos);
    setGalleryLoading(false);
  };
  
  const handleUploadPhoto = async () => {
    if (!selectedEventId) return;
    const url = prompt("Enter the URL of your photo to share:");
    if (!url) return;
    
    // Optimistic update could go here
    const res = await uploadEventPhoto(selectedEventId, url, "Shared memory from the event!");
    if (res.success) {
      alert("Photo uploaded! You earned 15 Grace Points.");
      const updatedPhotos = await getEventGallery(selectedEventId);
      setGalleryPhotos(updatedPhotos);
      // update event photos count in state
      setEvents(events.map(e => e.id === selectedEventId ? {...e, photosCount: (e.photosCount || 0) + 1} : e));
    } else {
      alert("Error: " + res.error);
    }
  };

  const now = new Date();
  const shown =
    activeTab === "Registered"
      ? events.filter((e) => registered.includes(e.id))
      : activeTab === "Past"
      ? events.filter((e) => e.rawDate && e.rawDate < now)
      : events.filter((e) => !e.rawDate || e.rawDate >= now);

  return (
    <div className="flex-1 overflow-y-auto relative">

      {/* ── Header ── */}
      <div className="relative overflow-hidden px-5 pt-8 pb-10 gradient-life">
        <div className="absolute inset-0 bg-[url('/header-image.png')] bg-cover bg-center opacity-40 mix-blend-overlay" />
        <div className="absolute right-4 sm:right-8 top-1/2 -translate-y-1/2 z-0 pointer-events-none flex flex-col items-center">
          <img src="/header-image.png" className="h-16 sm:h-24 w-auto rounded-2xl shadow-2xl border-[3px] border-white/20 opacity-95 object-contain rotate-3 drop-shadow-xl mb-2 sm:mb-3" alt="Church emblem" />
          <div className="flex flex-col items-center text-center opacity-90 rotate-1">
            <span className="text-[6px] sm:text-[8px] font-extrabold text-white uppercase tracking-widest font-serif leading-tight text-shadow-sm">St. Gregorios Jacobite<br/>Syrian Orthodox Church</span>
            <span className="text-[5px] sm:text-[6px] text-white/80 uppercase tracking-widest mt-0.5 font-semibold text-shadow-sm">Hosa Road - Bangalore</span>
          </div>
        </div>
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
              <span className="text-white text-xs font-semibold">
                {events.filter(e => !e.rawDate || e.rawDate >= now).length} upcoming
              </span>
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
                "flex-1 py-2 text-sm font-semibold rounded-lg transition duration-200",
                activeTab === tab ? "bg-card text-primary shadow-sm" : "text-muted-foreground hover:text-foreground"
              )}
            >
              {tab}
              {tab === "Registered" && registered.length > 0 && (
                <span className="ml-1.5 bg-primary text-white text-[9px] px-1.5 py-0.5 rounded-full">{registered.length}</span>
              )}
            </button>
          ))}
        </div>

        {loading ? (
          <div className="text-center py-14 text-muted-foreground">
            <p className="text-4xl mb-3 animate-pulse">🕊️</p>
            <p className="font-serif font-semibold text-lg">Loading events…</p>
          </div>
        ) : shown.length === 0 ? (
          <div className="text-center py-14 text-muted-foreground">
            <p className="text-4xl mb-3">🕊️</p>
            <p className="font-serif font-semibold text-lg">
              {activeTab === "Registered" ? "No registered events yet" : "No events scheduled"}
            </p>
            <p className="text-sm italic mt-1">"Be still and know that I am God." — Ps 46:10</p>
          </div>
        ) : (
          <div className="space-y-4">
            <AnimatePresence>
              {shown.map((event, i) => {
                const isReg = registered.includes(event.id);
                const isPast = event.rawDate && event.rawDate < now;
                return (
                  <motion.div
                    key={event.id}
                    initial={{ opacity: 0, y: 16 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -8 }}
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
                              <Badge className={cn("text-[10px] border-0 px-2", categoryColors[event.category] || categoryColors["General"])}>
                                {event.category}
                              </Badge>
                              {!isPast && isReg && <span className="text-green-600 dark:text-green-400 text-sm font-bold">✓</span>}
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
                        <div className="flex items-center gap-1.5"><Users className="w-3.5 h-3.5 text-primary/50" />{event.attendees} {isPast ? "attended" : "going"}</div>
                      </div>
                      <div className="flex gap-2 pt-1">
                        {!isPast ? (
                          <>
                            <Button
                              onClick={() => toggleReg(event.id)}
                              className={cn(
                                "flex-1 h-9 rounded-xl font-bold text-sm transition",
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
                          </>
                        ) : (
                          <Button
                            onClick={() => openGallery(event.id)}
                            className="flex-1 h-9 rounded-xl font-bold text-sm transition bg-secondary text-secondary-foreground hover:bg-secondary/80 flex items-center justify-center gap-2 border border-border/50"
                          >
                            <Camera className="w-4 h-4" />
                            View Gallery ({event.photosCount || 0})
                          </Button>
                        )}
                      </div>
                    </div>
                  </motion.div>
                );
              })}
            </AnimatePresence>
          </div>
        )}
      </div>

      {/* Gallery Modal */}
      <AnimatePresence>
        {selectedEventId && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 bg-background/80 backdrop-blur-sm flex flex-col"
          >
            <div className="flex items-center justify-between p-4 border-b bg-card">
              <div>
                <h2 className="font-bold font-serif text-lg">Event Gallery</h2>
                <p className="text-xs text-muted-foreground">Community memories</p>
              </div>
              <Button variant="ghost" size="icon" onClick={() => setSelectedEventId(null)}>
                <X className="w-5 h-5" />
              </Button>
            </div>
            <div className="flex-1 overflow-y-auto p-4 space-y-4">
              <Button onClick={handleUploadPhoto} className="w-full h-12 rounded-xl border-2 border-dashed border-primary/50 bg-primary/5 hover:bg-primary/10 text-primary font-bold shadow-none flex gap-2">
                <Plus className="w-5 h-5" /> Share a Photo (Earn 15 XP)
              </Button>

              {galleryLoading ? (
                <div className="text-center py-10">
                  <motion.div animate={{ rotate: 360 }} transition={{ duration: 2, repeat: Infinity, ease: "linear" }} className="w-8 h-8 border-4 border-primary/30 border-t-primary mx-auto rounded-full mb-4" />
                </div>
              ) : galleryPhotos.length === 0 ? (
                <div className="text-center py-10 text-muted-foreground">
                  <Camera className="w-12 h-12 mx-auto mb-3 opacity-20" />
                  <p className="font-serif">No photos yet.</p>
                  <p className="text-sm">Be the first to share a memory!</p>
                </div>
              ) : (
                <div className="grid grid-cols-2 gap-2">
                  {galleryPhotos.map((photo) => (
                    <div key={photo.id} className="relative aspect-square rounded-xl overflow-hidden border border-border group bg-muted">
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img src={photo.imageUrl} alt={photo.caption || "Event Photo"} className="w-full h-full object-cover transition-transform group-hover:scale-105" />
                      <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/80 to-transparent p-2 pt-6">
                        <div className="flex items-center gap-1.5">
                          {photo.uploadedBy?.avatarUrl ? (
                            // eslint-disable-next-line @next/next/no-img-element
                            <img src={photo.uploadedBy.avatarUrl} alt="Uploader" className="w-4 h-4 rounded-full border border-white/20" />
                          ) : (
                            <div className="w-4 h-4 rounded-full bg-primary flex items-center justify-center text-[8px] text-white font-bold">
                              {photo.uploadedBy?.firstName?.[0] || "?"}
                            </div>
                          )}
                          <p className="text-[10px] text-white/90 truncate font-medium">
                            {photo.uploadedBy?.firstName}
                          </p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
