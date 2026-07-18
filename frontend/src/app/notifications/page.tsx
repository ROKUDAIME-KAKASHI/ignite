"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Bell, BellRing, BellOff, CheckCircle2, Info, Megaphone, Calendar } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn, urlB64ToUint8Array } from "@/lib/utils";
import { getAnnouncements } from "@/app/admin/actions";
import { getNotifications, markAsRead, markAllAsRead } from "./actions";
import { useAuth } from "@/context/AuthContext";

type NotificationItem = {
  id: string;
  title: string;
  message: string;
  isRead: boolean;
  link: string | null;
  createdAt: Date;
};

type Announcement = {
  id: string;
  title: string;
  content: string;
  createdAt: string;
  targetRole: string | null;
};

export default function NotificationsPage() {
  const [permission, setPermission] = useState<NotificationPermission>("default");
  const [isRequesting, setIsRequesting] = useState(false);
  const [supported, setSupported] = useState(true);
  const [announcements, setAnnouncements] = useState<Announcement[]>([]);
  const [loadingAnn, setLoadingAnn] = useState(true);
  const [inbox, setInbox] = useState<NotificationItem[]>([]);
  const { user } = useAuth();

  const [preferences, setPreferences] = useState({
    dailyVerse: true,
    prayerWall: true,
    parishNotices: true,
    gamification: false,
    events: true,
    none: false,
  });

  useEffect(() => {
    if (typeof window !== "undefined") {
      if ("Notification" in window) {
        setPermission(Notification.permission);
      } else {
        setSupported(false);
      }
    }
    getAnnouncements().then((data) => {
      setAnnouncements(data);
      setLoadingAnn(false);
    });
    if (user) {
      getNotifications().then((data) => {
        setInbox(data as unknown as NotificationItem[]);
      });
    }
    
    const savedPrefs = localStorage.getItem("ignite_notification_prefs");
    if (savedPrefs) {
      try {
        setPreferences(JSON.parse(savedPrefs));
      } catch (e) {}
    }
  }, [user]);

  const togglePreference = (key: keyof typeof preferences) => {
    setPreferences(prev => {
      let next = { ...prev, [key]: !prev[key] };
      
      if (key === "none" && next.none) {
        next = { dailyVerse: false, prayerWall: false, parishNotices: false, gamification: false, events: false, none: true };
      } else if (key !== "none" && next[key]) {
        next.none = false;
      } else if (key !== "none" && !next.none) {
        const anyActive = next.dailyVerse || next.prayerWall || next.parishNotices || next.gamification || next.events;
        if (!anyActive) next.none = true;
      }

      localStorage.setItem("ignite_notification_prefs", JSON.stringify(next));
      return next;
    });
  };

  const handleMarkAsRead = async (id: string) => {
    setInbox(prev => prev.map(n => n.id === id ? { ...n, isRead: true } : n));
    await markAsRead(id);
  };

  const handleMarkAllAsRead = async () => {
    setInbox(prev => prev.map(n => ({ ...n, isRead: true })));
    await markAllAsRead();
  };

  const unreadCount = inbox.filter(n => !n.isRead).length;

  const requestPermission = async () => {
    setIsRequesting(true);
    try {
      const perm = await Notification.requestPermission();
      setPermission(perm);
      
      if (perm === "granted" && "serviceWorker" in navigator) {
        await navigator.serviceWorker.register('/sw.js');
        const registration = await navigator.serviceWorker.ready;
        const vapidPublicKey = process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY || "BIr1RWyN87fiJWv_-co9Peyyo6tl3Xx51znoApIegoOQVxEGfC01BK-2qFLB5F4KBKWRPwDE_8zTAUA_2h-2MYc";
        const subscription = await registration.pushManager.subscribe({
          userVisibleOnly: true,
          applicationServerKey: urlB64ToUint8Array(vapidPublicKey)
        });
        
        await fetch("/api/notifications/subscribe", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ subscription: subscription.toJSON() })
        });
      }
    } catch (error) {
      console.error("Failed to request permission", error);
    } finally {
      setIsRequesting(false);
    }
  };

  return (
    <div className="flex-1 overflow-y-auto bg-slate-50 dark:bg-slate-950">
      
      {/* ── Header ── */}
      <div className="relative overflow-hidden px-5 pt-8 pb-10 gradient-royal">
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
            <div className="w-10 h-10 rounded-xl bg-white/20 backdrop-blur-sm flex items-center justify-center text-white">
              <BellRing className="w-5 h-5" />
            </div>
            <div>
              <h1 className="text-2xl font-extrabold text-white font-serif">Notifications</h1>
              <p className="text-blue-200 text-xs font-bold uppercase tracking-wider">Stay Connected in Prayer</p>
            </div>
          </div>
            <div className="flex items-center gap-2 mt-3 flex-wrap">
            <div className="flex items-center gap-1.5 bg-white/15 backdrop-blur-sm rounded-full px-3 py-1.5 border border-white/20">
              <Megaphone className="w-3.5 h-3.5 text-white" />
              <span className="text-white text-xs font-semibold">{announcements.length} notices</span>
            </div>
            {unreadCount > 0 && (
              <div className="flex items-center gap-1.5 bg-white/15 backdrop-blur-sm rounded-full px-3 py-1.5 border border-white/20 cursor-pointer" onClick={handleMarkAllAsRead}>
                <CheckCircle2 className="w-3.5 h-3.5 text-white" />
                <span className="text-white text-xs font-semibold">Mark {unreadCount} as read</span>
              </div>
            )}
          </div>
        </div>
      </div>

      <div className="px-4 -mt-4 pb-8 space-y-4 relative z-20">
        {/* ── Parish Notices (from Admin) ── */}
        <div>
          <div className="flex items-center justify-between mb-4 bg-muted/40 backdrop-blur-xl p-3 rounded-2xl border border-border/60 shadow-sm relative overflow-hidden mt-4">
            <div className="absolute inset-0 bg-gradient-to-r from-amber-500/10 via-transparent to-transparent pointer-events-none" />
            <div className="flex items-center gap-3 relative z-10">
              <div className="w-9 h-9 rounded-xl gradient-gold flex items-center justify-center text-white shadow-md">
                <Megaphone className="w-4 h-4" />
              </div>
              <h2 className="text-sm font-extrabold text-foreground uppercase tracking-widest">Parish Notices</h2>
            </div>
          </div>

          {loadingAnn ? (
            <div className="bg-card rounded-2xl border border-border/60 p-8 text-center text-muted-foreground">
              <p className="text-2xl mb-2 animate-pulse">📢</p>
              <p className="text-sm font-medium">Loading notices…</p>
            </div>
          ) : announcements.length === 0 ? (
            <div className="bg-card rounded-2xl border border-border/60 p-8 text-center text-muted-foreground">
              <p className="text-3xl mb-2">🕊️</p>
              <p className="font-serif font-semibold">No notices yet</p>
              <p className="text-xs italic mt-1">"Be still before the Lord." — Psalm 37:7</p>
            </div>
          ) : (
            <div className="space-y-3">
              <AnimatePresence>
                {announcements.map((ann, i) => (
                  <motion.div
                    key={ann.id}
                    initial={{ opacity: 0, y: 12 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: i * 0.06 }}
                    className="bg-card rounded-2xl border border-border/60 overflow-hidden card-holy"
                  >
                    <div className="bg-gradient-to-r from-amber-50 to-yellow-50/50 dark:from-amber-950/30 dark:to-yellow-950/10 px-4 pt-3 pb-2 border-b border-amber-200/40 dark:border-amber-800/20">
                      <div className="flex items-center gap-2">
                        <span className="text-base">📢</span>
                        <p className="text-sm font-bold text-foreground font-serif">{ann.title}</p>
                      </div>
                    </div>
                    <div className="px-4 py-3">
                      <p className="text-sm text-foreground/85 leading-relaxed">{ann.content}</p>
                      <p className="text-[10px] text-muted-foreground mt-2 font-semibold">
                        Posted {new Date(ann.createdAt).toLocaleDateString("en-US", { weekday: "short", month: "short", day: "numeric", year: "numeric" })}
                      </p>
                    </div>
                  </motion.div>
                ))}
              </AnimatePresence>
            </div>
          )}
        </div>

        {/* ── Personal Inbox ── */}
        {user && (
          <div>
            <div className="flex items-center gap-2 mb-3 px-1 pt-4">
              <Bell className="w-4 h-4 text-primary" />
              <p className="text-xs font-bold text-muted-foreground uppercase tracking-widest">Personal Inbox</p>
            </div>
            {inbox.length === 0 ? (
              <div className="bg-card rounded-2xl border border-border/60 p-8 text-center text-muted-foreground shadow-sm">
                <p className="text-3xl mb-2">📭</p>
                <p className="font-serif font-semibold">Inbox is empty</p>
                <p className="text-xs mt-1">You're all caught up on your personal notifications.</p>
              </div>
            ) : (
              <div className="space-y-3">
                <AnimatePresence>
                  {inbox.map(notif => (
                    <motion.div 
                      key={notif.id}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      className={cn(
                        "relative flex gap-4 p-4 rounded-2xl border transition cursor-pointer",
                        notif.isRead 
                          ? "bg-white border-border/40 opacity-75" 
                          : "bg-amber-50/50 border-amber-200 dark:bg-amber-950/20 shadow-sm"
                      )}
                      onClick={() => {
                        if (!notif.isRead) handleMarkAsRead(notif.id);
                        if (notif.link) window.location.href = notif.link;
                      }}
                    >
                      {!notif.isRead && (
                        <div className="absolute top-4 right-4 w-2.5 h-2.5 rounded-full bg-red-500 animate-pulse" />
                      )}
                      
                      <div className="flex-1 pr-4">
                        <div className="flex justify-between items-start mb-1">
                          <h3 className={cn("font-bold text-sm", notif.isRead ? "text-foreground/80" : "text-foreground")}>
                            {notif.title}
                          </h3>
                          <span className="text-[10px] font-semibold text-muted-foreground whitespace-nowrap ml-2 mt-0.5">
                            {new Date(notif.createdAt).toLocaleDateString(undefined, { month: 'short', day: 'numeric' })}
                          </span>
                        </div>
                        <p className={cn("text-sm", notif.isRead ? "text-muted-foreground" : "text-foreground/90 font-medium")}>
                          {notif.message}
                        </p>
                      </div>
                    </motion.div>
                  ))}
                </AnimatePresence>
              </div>
            )}
          </div>
        )}

        {/* ── Push Notification Status ── */}
        <div>
          <div className="flex items-center gap-2 mb-3 px-1">
            <Bell className="w-4 h-4 text-primary" />
            <p className="text-xs font-bold text-muted-foreground uppercase tracking-widest">Push Notifications</p>
          </div>

          <div className="bg-card rounded-2xl border border-border/60 p-5 shadow-sm">
            <div className="flex flex-col items-center text-center space-y-4">
              <div className={cn(
                "w-20 h-20 rounded-full flex items-center justify-center shadow-lg border-4 border-white dark:border-slate-900",
                permission === "granted" ? "gradient-green text-white" : 
                permission === "denied" ? "gradient-crimson text-white" : "bg-slate-200 dark:bg-slate-800 text-slate-500"
              )}>
                {permission === "granted" ? <BellRing className="w-8 h-8" /> : 
                 permission === "denied" ? <BellOff className="w-8 h-8" /> : <Bell className="w-8 h-8" />}
              </div>
              
              <div>
                <h2 className="text-lg font-bold text-foreground">
                  {permission === "granted" ? "Notifications Active" : 
                   permission === "denied" ? "Notifications Blocked" : "Enable Notifications"}
                </h2>
                <p className="text-sm text-muted-foreground mt-1 px-4 leading-relaxed">
                  {permission === "granted" 
                    ? "You will receive daily scripture reminders, prayer alerts, and community updates." 
                    : "Turn on push notifications to receive daily verses, reminders to pray, and updates when someone prays for you."}
                </p>
              </div>

              {permission !== "granted" && (
                <Button 
                  onClick={requestPermission} 
                  disabled={isRequesting || permission === "denied"}
                  className="w-full h-11 rounded-xl gradient-royal text-white font-bold shadow-md"
                >
                  {isRequesting ? "Requesting..." : 
                   permission === "denied" ? "Update Browser Settings" : "Allow Notifications"}
                </Button>
              )}

              {permission === "granted" && (
                <div className="w-full bg-green-50 dark:bg-green-900/20 text-green-700 dark:text-green-400 text-xs font-bold px-4 py-3 rounded-xl flex items-center justify-center gap-2">
                  <CheckCircle2 className="w-4 h-4" /> Device successfully registered
                </div>
              )}
            </div>
          </div>
        </div>

        {/* ── Preferences ── */}
        <div className="bg-card rounded-2xl border border-border/60 overflow-hidden shadow-sm">
          <div className="px-4 py-3 border-b border-border/40 bg-muted/30">
            <p className="text-xs font-bold text-muted-foreground uppercase tracking-widest">Notification Preferences</p>
          </div>
          <div className="divide-y divide-border/40">
            {[
              { id: "dailyVerse" as const, title: "Daily Verse", desc: "Receive a scripture reading every morning" },
              { id: "prayerWall" as const, title: "Prayer Wall Alerts", desc: "When someone prays for your request" },
              { id: "parishNotices" as const, title: "Parish Notices", desc: "Important announcements from your admin" },
              { id: "gamification" as const, title: "Gamification", desc: "Weekly rank updates and new badges" },
              { id: "events" as const, title: "Community Events", desc: "Reminders for masses and retreats" },
              { id: "none" as const, title: "None", desc: "Turn off all notifications" },
            ].map((pref) => {
              const isActive = preferences[pref.id];
              return (
                <div 
                  key={pref.id} 
                  className="p-4 flex items-center justify-between cursor-pointer hover:bg-muted/30 transition-colors"
                  onClick={() => togglePreference(pref.id)}
                >
                  <div>
                    <p className="text-sm font-bold text-foreground">{pref.title}</p>
                    <p className="text-[11px] text-muted-foreground mt-0.5">{pref.desc}</p>
                  </div>
                  <div className={cn(
                    "w-11 h-6 rounded-full flex items-center p-1 transition-colors shrink-0",
                    isActive && permission === "granted" ? "bg-primary" : "bg-slate-200 dark:bg-slate-700"
                  )}>
                    <div className={cn(
                      "w-4 h-4 rounded-full bg-white shadow-sm transition-transform",
                      isActive && permission === "granted" ? "translate-x-5" : "translate-x-0"
                    )} />
                  </div>
                </div>
              );
            })}
          </div>
        </div>
        
        {!supported && (
          <div className="flex items-start gap-2 p-3 bg-amber-50 text-amber-800 rounded-xl text-xs">
            <Info className="w-4 h-4 mt-0.5 shrink-0" />
            <p>Your browser does not support Web Push API notifications.</p>
          </div>
        )}

      </div>
    </div>
  );
}
