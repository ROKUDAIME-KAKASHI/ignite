"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Bell, BellRing, BellOff, CheckCircle2, ChevronRight, Info } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

export default function NotificationsPage() {
  const [permission, setPermission] = useState<NotificationPermission>("default");
  const [isRequesting, setIsRequesting] = useState(false);
  const [supported, setSupported] = useState(true);

  useEffect(() => {
    if (typeof window !== "undefined") {
      setPermission(Notification.permission);
      if (!("Notification" in window)) {
        setSupported(false);
      }
    }
  }, []);

  const requestPermission = async () => {
    setIsRequesting(true);
    try {
      const perm = await Notification.requestPermission();
      setPermission(perm);
      
      if (perm === "granted" && supported) {
        // Register standard PWA service worker subscription here later
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
        <svg viewBox="0 0 200 200" className="absolute right-0 top-0 w-48 h-48 opacity-10 text-white" fill="none" stroke="currentColor" strokeWidth="6">
          <circle cx="100" cy="100" r="80" />
        </svg>
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
        </div>
      </div>

      <div className="px-4 -mt-6 pb-8 space-y-4">
        
        {/* Status Card */}
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

        {/* Preferences */}
        <div className="bg-card rounded-2xl border border-border/60 overflow-hidden shadow-sm">
          <div className="px-4 py-3 border-b border-border/40 bg-muted/30">
            <p className="text-xs font-bold text-muted-foreground uppercase tracking-widest">Notification Preferences</p>
          </div>
          <div className="divide-y divide-border/40">
            {[
              { title: "Daily Verse", desc: "Receive a scripture reading every morning", active: true },
              { title: "Prayer Wall Alerts", desc: "When someone prays for your request", active: true },
              { title: "Gamification", desc: "Weekly rank updates and new badges", active: false },
              { title: "Community Events", desc: "Reminders for masses and retreats", active: true },
            ].map((pref, i) => (
              <div key={i} className="p-4 flex items-center justify-between">
                <div>
                  <p className="text-sm font-bold text-foreground">{pref.title}</p>
                  <p className="text-[11px] text-muted-foreground mt-0.5">{pref.desc}</p>
                </div>
                <div className={cn(
                  "w-11 h-6 rounded-full flex items-center p-1 transition-colors",
                  pref.active && permission === "granted" ? "bg-primary" : "bg-slate-200 dark:bg-slate-700"
                )}>
                  <div className={cn(
                    "w-4 h-4 rounded-full bg-white shadow-sm transition-transform",
                    pref.active && permission === "granted" ? "translate-x-5" : "translate-x-0"
                  )} />
                </div>
              </div>
            ))}
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
