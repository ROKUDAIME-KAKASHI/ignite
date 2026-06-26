"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Users, Activity, Heart, BookOpen, ShieldCheck, TrendingUp, AlertTriangle, Send, CalendarPlus, Loader2, CheckCircle2 } from "lucide-react";
import { cn } from "@/lib/utils";
import { createAnnouncement, createEvent } from "./actions";
import QRCode from "react-qr-code";

const STATS = [
  { label: "Total Users", value: "1,248", change: "+12%", icon: Users, color: "text-blue-500", bg: "bg-blue-50 dark:bg-blue-900/20" },
  { label: "Prayers Offered", value: "8,432", change: "+34%", icon: Heart, color: "text-red-500", bg: "bg-red-50 dark:bg-red-900/20" },
  { label: "Quizzes Taken", value: "4,190", change: "+8%", icon: Activity, color: "text-orange-500", bg: "bg-orange-50 dark:bg-orange-900/20" },
  { label: "Chapters Read", value: "12,845", change: "+21%", icon: BookOpen, color: "text-amber-500", bg: "bg-amber-50 dark:bg-amber-900/20" },
];

const RECENT_USERS = [
  { id: "1", name: "Maria S.", email: "maria@example.com", joined: "2 mins ago", status: "active" },
  { id: "2", name: "David M.", email: "david@example.com", joined: "1 hour ago", status: "active" },
  { id: "3", name: "Sarah J.", email: "sarah@example.com", joined: "3 hours ago", status: "pending" },
  { id: "4", name: "John C.", email: "john@example.com", joined: "5 hours ago", status: "active" },
];

const SYSTEM_ALERTS = [
  { id: 1, type: "warning", message: "Database connection pool near capacity (85%)" },
  { id: 2, type: "info", message: "Database backup completed successfully at 03:00 AM" },
];

import { useRouter } from "next/navigation";

export default function AdminDashboardPage() {
  const router = useRouter();

  const [activeTab, setActiveTab] = useState<"overview" | "notices" | "events">("overview");

  // Forms state
  const [noticeTitle, setNoticeTitle] = useState("");
  const [noticeContent, setNoticeContent] = useState("");
  const [noticeStatus, setNoticeStatus] = useState<"idle" | "loading" | "success" | "error">("idle");

  const [evTitle, setEvTitle] = useState("");
  const [evDesc, setEvDesc] = useState("");
  const [evDate, setEvDate] = useState("");
  const [evLoc, setEvLoc] = useState("");
  const [evStatus, setEvStatus] = useState<"idle" | "loading" | "success" | "error">("idle");
  const [createdEventId, setCreatedEventId] = useState("");
  const [baseUrl, setBaseUrl] = useState("");

  useEffect(() => {
    setBaseUrl(window.location.origin);
  }, []);

  const handlePostNotice = async () => {
    if (!noticeTitle || !noticeContent) return;
    setNoticeStatus("loading");
    const res = await createAnnouncement(noticeTitle, noticeContent);
    if (res.success) {
      setNoticeStatus("success");
      setNoticeTitle(""); setNoticeContent("");
      setTimeout(() => setNoticeStatus("idle"), 2000);
    } else setNoticeStatus("error");
  };

  const handleCreateEvent = async () => {
    if (!evTitle || !evDate) return;
    setEvStatus("loading");
    const res = await createEvent(evTitle, evDesc, evDate, evLoc);
    if (res.success && res.event) {
      setCreatedEventId(res.event.id);
      setEvStatus("success");
      setEvTitle(""); setEvDesc(""); setEvDate(""); setEvLoc("");
    } else setEvStatus("error");
  };



  return (
    <div className="flex-1 overflow-y-auto bg-slate-50 dark:bg-slate-950">
      
      {/* ── Header ── */}
      <div className="px-5 pt-8 pb-6 bg-white dark:bg-slate-900 border-b border-border/50 sticky top-0 z-20">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-slate-900 dark:bg-slate-100 flex items-center justify-center shadow-md">
              <ShieldCheck className="w-5 h-5 text-white dark:text-slate-900" />
            </div>
            <div>
              <h1 className="text-xl font-bold text-foreground">Admin Console</h1>
              <p className="text-xs text-muted-foreground font-medium">Ignite System Overview</p>
            </div>
          </div>
          <Badge className="bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400 border-0">
            System Online
          </Badge>
        </div>
      </div>

      <div className="px-4 py-6 space-y-6">
        
        {/* ── Navigation Tabs ── */}
        <div className="flex gap-2 p-1 bg-white dark:bg-slate-900 rounded-xl border shadow-sm">
          {(["overview", "notices", "events"] as const).map(t => (
            <button key={t} onClick={() => setActiveTab(t)} className={cn(
              "flex-1 py-2 text-xs font-bold uppercase tracking-wider rounded-lg transition-colors",
              activeTab === t ? "bg-slate-100 dark:bg-slate-800 text-slate-900 dark:text-white" : "text-slate-500 hover:text-slate-700 dark:hover:text-slate-300"
            )}>
              {t}
            </button>
          ))}
        </div>

        {activeTab === "overview" && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-6">
            {/* ── System Alerts ── */}
            {SYSTEM_ALERTS.length > 0 && (
              <div className="space-y-2">
                {SYSTEM_ALERTS.map(alert => (
                  <div key={alert.id} className={cn(
                    "px-4 py-3 rounded-xl border flex items-start gap-3 text-sm",
                    alert.type === "warning" ? "bg-amber-50 border-amber-200 text-amber-800 dark:bg-amber-950/30 dark:border-amber-900/50 dark:text-amber-300" :
                    "bg-blue-50 border-blue-200 text-blue-800 dark:bg-blue-950/30 dark:border-blue-900/50 dark:text-blue-300"
                  )}>
                    {alert.type === "warning" ? <AlertTriangle className="w-4 h-4 mt-0.5 shrink-0" /> : <ShieldCheck className="w-4 h-4 mt-0.5 shrink-0" />}
                    <p>{alert.message}</p>
                  </div>
                ))}
              </div>
            )}

            {/* ── Key Metrics ── */}
            <div>
              <h2 className="text-sm font-bold text-slate-500 uppercase tracking-wider mb-3 px-1">Key Metrics (24h)</h2>
              <div className="grid grid-cols-2 gap-3">
                {STATS.map((stat, i) => {
                  const Icon = stat.icon;
                  return (
                    <div key={stat.label} className="bg-white dark:bg-slate-900 p-4 rounded-2xl border border-border/50 shadow-sm flex flex-col justify-between h-28">
                      <div className="flex items-center justify-between">
                        <div className={cn("w-8 h-8 rounded-full flex items-center justify-center", stat.bg)}>
                          <Icon className={cn("w-4 h-4", stat.color)} />
                        </div>
                        <Badge variant="secondary" className="text-[10px] bg-green-50 text-green-700 dark:bg-green-900/20 dark:text-green-400 border-0 flex items-center gap-0.5">
                          <TrendingUp className="w-3 h-3" /> {stat.change}
                        </Badge>
                      </div>
                      <div>
                        <p className="text-2xl font-bold text-foreground leading-none">{stat.value}</p>
                        <p className="text-[11px] text-muted-foreground font-medium mt-1">{stat.label}</p>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
            
            {/* ── Recent Users ── */}
            <div>
              <div className="flex items-center justify-between mb-3 px-1">
                <h2 className="text-sm font-bold text-slate-500 uppercase tracking-wider">Recent Signups</h2>
                <button className="text-xs font-bold text-primary">View All</button>
              </div>
              <div className="bg-white dark:bg-slate-900 rounded-2xl border border-border/50 shadow-sm overflow-hidden">
                <div className="divide-y divide-border/50">
                  {RECENT_USERS.map((user) => (
                    <div key={user.id} className="p-4 flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className="w-9 h-9 rounded-full bg-slate-100 dark:bg-slate-800 flex items-center justify-center text-slate-500 font-bold text-xs">
                          {user.name.charAt(0)}
                        </div>
                        <div>
                          <p className="text-sm font-bold text-foreground leading-none">{user.name}</p>
                          <p className="text-[11px] text-muted-foreground mt-1">{user.email}</p>
                        </div>
                      </div>
                      <div className="text-right">
                        <Badge className={cn("text-[10px] border-0 mb-1", user.status === "active" ? "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400" : "bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400")}>
                          {user.status}
                        </Badge>
                        <p className="text-[10px] text-muted-foreground block">{user.joined}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </motion.div>
        )}

        {activeTab === "notices" && (
          <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} className="space-y-4">
            <div className="bg-white dark:bg-slate-900 p-5 rounded-2xl border border-border/50 shadow-sm">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-10 h-10 rounded-xl gradient-royal text-white flex items-center justify-center shadow-md">
                  <Send className="w-5 h-5" />
                </div>
                <div>
                  <h2 className="font-bold font-serif text-lg">Post Notice</h2>
                  <p className="text-xs text-muted-foreground">Broadcast an announcement to all youth.</p>
                </div>
              </div>
              
              <div className="space-y-4">
                <div>
                  <label className="text-xs font-bold text-muted-foreground uppercase tracking-widest mb-1.5 block">Title</label>
                  <Input value={noticeTitle} onChange={e => setNoticeTitle(e.target.value)} placeholder="e.g. Sunday Youth Meeting Update" className="bg-slate-50 dark:bg-slate-950" />
                </div>
                <div>
                  <label className="text-xs font-bold text-muted-foreground uppercase tracking-widest mb-1.5 block">Message Content</label>
                  <Textarea value={noticeContent} onChange={e => setNoticeContent(e.target.value)} placeholder="Type your announcement here..." className="bg-slate-50 dark:bg-slate-950 min-h-[120px]" />
                </div>
                <button 
                  onClick={handlePostNotice}
                  disabled={noticeStatus === "loading" || !noticeTitle || !noticeContent}
                  className="w-full h-12 rounded-xl gradient-royal text-white font-bold flex items-center justify-center gap-2 shadow-md hover:opacity-90 transition-opacity disabled:opacity-50"
                >
                  {noticeStatus === "loading" ? <Loader2 className="w-5 h-5 animate-spin" /> : 
                   noticeStatus === "success" ? <CheckCircle2 className="w-5 h-5" /> :
                   <Send className="w-4 h-4" />}
                  {noticeStatus === "success" ? "Posted Successfully!" : "Broadcast Notice"}
                </button>
              </div>
            </div>
          </motion.div>
        )}

        {activeTab === "events" && (
          <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} className="space-y-4">
            <div className="bg-white dark:bg-slate-900 p-5 rounded-2xl border border-border/50 shadow-sm">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-10 h-10 rounded-xl gradient-crimson text-white flex items-center justify-center shadow-md">
                  <CalendarPlus className="w-5 h-5" />
                </div>
                <div>
                  <h2 className="font-bold font-serif text-lg">Create Event</h2>
                  <p className="text-xs text-muted-foreground">Schedule a youth gathering or service project.</p>
                </div>
              </div>
              
              <div className="space-y-4">
                <div>
                  <label className="text-xs font-bold text-muted-foreground uppercase tracking-widest mb-1.5 block">Event Title</label>
                  <Input value={evTitle} onChange={e => setEvTitle(e.target.value)} placeholder="e.g. Lenten Retreat 2026" className="bg-slate-50 dark:bg-slate-950" />
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="text-xs font-bold text-muted-foreground uppercase tracking-widest mb-1.5 block">Date & Time</label>
                    <Input type="datetime-local" value={evDate} onChange={e => setEvDate(e.target.value)} className="bg-slate-50 dark:bg-slate-950" />
                  </div>
                  <div>
                    <label className="text-xs font-bold text-muted-foreground uppercase tracking-widest mb-1.5 block">Location</label>
                    <Input value={evLoc} onChange={e => setEvLoc(e.target.value)} placeholder="e.g. Main Parish Hall" className="bg-slate-50 dark:bg-slate-950" />
                  </div>
                </div>
                <div>
                  <label className="text-xs font-bold text-muted-foreground uppercase tracking-widest mb-1.5 block">Description</label>
                  <Textarea value={evDesc} onChange={e => setEvDesc(e.target.value)} placeholder="Event details..." className="bg-slate-50 dark:bg-slate-950 min-h-[80px]" />
                </div>
                
                {evStatus === "success" && (
                  <div className="p-5 bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-xl flex flex-col items-center">
                    <div className="flex items-center gap-2 text-green-700 dark:text-green-400 font-bold text-lg mb-4">
                      <CheckCircle2 className="w-5 h-5" />
                      Event Created Successfully!
                    </div>
                    
                    <div className="bg-white p-4 rounded-xl shadow-sm mb-3">
                      <QRCode 
                        value={`${baseUrl}/scan?eventId=${createdEventId}`} 
                        size={180}
                        level="H"
                      />
                    </div>
                    
                    <p className="text-xs text-center text-green-800 dark:text-green-300 max-w-xs font-medium">
                      Display this QR code at the event. Youth can scan it with the app to check in and earn 100 Grace Points.
                    </p>
                    
                    <button 
                      onClick={() => setEvStatus("idle")}
                      className="mt-4 px-4 py-2 bg-green-100 dark:bg-green-900/40 text-green-700 dark:text-green-400 rounded-lg text-sm font-bold hover:bg-green-200 transition-colors"
                    >
                      Create Another Event
                    </button>
                  </div>
                )}

                {evStatus !== "success" && (
                  <button 
                    onClick={handleCreateEvent}
                    disabled={evStatus === "loading" || !evTitle || !evDate}
                    className="w-full h-12 rounded-xl gradient-crimson text-white font-bold flex items-center justify-center gap-2 shadow-md hover:opacity-90 transition-opacity disabled:opacity-50"
                  >
                    {evStatus === "loading" ? <Loader2 className="w-5 h-5 animate-spin" /> : 
                     evStatus === "error" ? <AlertTriangle className="w-4 h-4" /> :
                     <CalendarPlus className="w-4 h-4" />}
                    {evStatus === "error" ? "Failed to Create" : "Create Event & Generate QR"}
                  </button>
                )}
              </div>
            </div>
          </motion.div>
        )}
        
      </div>
    </div>
  );
}
