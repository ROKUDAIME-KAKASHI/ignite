"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Users, Activity, Heart, BookOpen, ShieldCheck, TrendingUp, AlertTriangle, Send, CalendarPlus, Loader2, CheckCircle2 } from "lucide-react";
import { cn } from "@/lib/utils";
import { createAnnouncement, createEvent, getChurches, createChurch } from "../actions";
import QRCode from "react-qr-code";

import { getAdminDashboardData, getAllPrayers, deletePrayer, getUpcomingEvents, getAnnouncements, deleteAnnouncement, deleteEvent, getQuotes, createQuote, toggleQuoteActive, deleteQuote, getAllChatSuggestions, createChatSuggestion, deleteChatSuggestion, getBadges, createBadge, deleteBadge, getAppointments, updateAppointmentStatus } from "../actions";
import { getMissions } from "@/app/missions/actions";
import { useRouter } from "next/navigation";

export default function AdminDashboardPage() {
  const router = useRouter();

  const [activeTab, setActiveTab] = useState<"overview" | "prayers" | "notices" | "events" | "parishes" | "appointments" | "content" | "qrcodes">("overview");

  // Real data state
  const [stats, setStats] = useState({
    totalUsers: 0,
    prayersOffered: 0,
    quizzesTaken: 0,
    chaptersRead: 0,
    journeyNodesDone: 0,
    totalStarsEarned: 0
  });
  const [recentUsers, setRecentUsers] = useState<any[]>([]);
  const [allPrayers, setAllPrayers] = useState<any[]>([]);
  const [existingEvents, setExistingEvents] = useState<any[]>([]);
  const [existingAnnouncements, setExistingAnnouncements] = useState<any[]>([]);
  const [churches, setChurches] = useState<any[]>([]);
  const [missions, setMissions] = useState<any[]>([]);

  const [quotes, setQuotes] = useState<any[]>([]);
  const [chatSuggestions, setChatSuggestions] = useState<any[]>([]);
  const [badges, setBadges] = useState<any[]>([]);
  const [appointments, setAppointments] = useState<any[]>([]);

  const [newQuoteText, setNewQuoteText] = useState("");
  const [newQuoteAuthor, setNewQuoteAuthor] = useState("");
  const [newSuggestionText, setNewSuggestionText] = useState("");
  const [creatingQuote, setCreatingQuote] = useState(false);
  const [creatingSuggestion, setCreatingSuggestion] = useState(false);

  const handleCreateQuote = async () => {
    if (!newQuoteText.trim() || !newQuoteAuthor.trim()) return;
    setCreatingQuote(true);
    await createQuote(newQuoteText.trim(), newQuoteAuthor.trim());
    setNewQuoteText("");
    setNewQuoteAuthor("");
    await fetchContent();
    setCreatingQuote(false);
  };

  const handleToggleQuote = async (id: string) => {
    await toggleQuoteActive(id);
    await fetchContent();
  };

  const handleCreateSuggestion = async () => {
    if (!newSuggestionText.trim()) return;
    setCreatingSuggestion(true);
    await createChatSuggestion(newSuggestionText.trim());
    setNewSuggestionText("");
    await fetchContent();
    setCreatingSuggestion(false);
  };

  const handleDeleteSuggestion = async (id: string) => {
    if (!confirm("Delete this suggestion?")) return;
    await deleteChatSuggestion(id);
    await fetchContent();
  };

  const fetchPrayers = async () => {
    const res = await getAllPrayers();
    if (res.success && res.prayers) setAllPrayers(res.prayers);
  };

  const fetchContent = async () => {
    const [qRes, cRes, bRes, appRes] = await Promise.all([getQuotes(), getAllChatSuggestions(), getBadges(), getAppointments()]);
    if (qRes.success && qRes.quotes) setQuotes(qRes.quotes);
    if (cRes.success && cRes.suggestions) setChatSuggestions(cRes.suggestions);
    if (bRes.success && bRes.badges) setBadges(bRes.badges);
    if (appRes.success && appRes.appointments) setAppointments(appRes.appointments);
  };

  const fetchEventsAndNotices = async () => {
    const [evs, anns] = await Promise.all([getUpcomingEvents(), getAnnouncements()]);
    setExistingEvents(evs);
    setExistingAnnouncements(anns);
  };

  const fetchChurches = async () => {
    const res = await getChurches();
    if (res.success && res.churches) setChurches(res.churches);
  };

  useEffect(() => {
    async function fetchData() {
      const res = await getAdminDashboardData();
      if (res.success && res.stats && res.recentUsers) {
        setStats(res.stats);
        setRecentUsers(res.recentUsers);
      }
      fetchPrayers();
      fetchEventsAndNotices();
      fetchChurches();
      fetchContent();
      getMissions().then(m => setMissions(m.missions));
    }
    fetchData();
  }, []);

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

  const [churchName, setChurchName] = useState("");
  const [churchLoc, setChurchLoc] = useState("");
  const [churchStatus, setChurchStatus] = useState<"idle" | "loading" | "success" | "error">("idle");

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
      await fetchEventsAndNotices();
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
      await fetchEventsAndNotices();
    } else setEvStatus("error");
  };

  const handleCreateChurch = async () => {
    if (!churchName) return;
    setChurchStatus("loading");
    const res = await createChurch(churchName, churchLoc);
    if (res.success) {
      setChurchStatus("success");
      setChurchName(""); setChurchLoc("");
      await fetchChurches();
      setTimeout(() => setChurchStatus("idle"), 2000);
    } else setChurchStatus("error");
  };

  const handleDeletePrayer = async (id: string) => {
    if (!confirm("Delete this prayer from the wall?")) return;
    await deletePrayer(id);
    await fetchPrayers();
  };

  const handleDeleteAnnouncement = async (id: string) => {
    if (!confirm("Delete this announcement?")) return;
    await deleteAnnouncement(id);
    await fetchEventsAndNotices();
  };

  const handleDeleteEvent = async (id: string) => {
    if (!confirm("Delete this event? This will also remove all RSVPs.")) return;
    await deleteEvent(id);
    await fetchEventsAndNotices();
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
        <div className="flex gap-2 p-1 bg-white dark:bg-slate-900 rounded-xl border shadow-sm overflow-x-auto scrollbar-hide snap-x">
          {(["overview", "prayers", "appointments", "notices", "events", "parishes", "content", "qrcodes"] as const).map(t => (
            <button key={t} onClick={() => setActiveTab(t)} className={cn(
              "flex-1 py-2.5 px-4 text-xs font-bold uppercase tracking-wider rounded-lg transition-all whitespace-nowrap snap-center",
              activeTab === t ? "bg-slate-900 text-white dark:bg-slate-100 dark:text-slate-900 shadow-md scale-[1.02]" : "bg-transparent text-slate-500 hover:bg-slate-100 hover:text-slate-800 dark:hover:bg-slate-800 dark:hover:text-slate-200"
            )}>
              {t} 
              {t === "prayers" && allPrayers.length > 0 && (
                <span className="ml-2 bg-red-500 text-white px-2 py-0.5 rounded-full text-[10px] shadow-sm">{allPrayers.length}</span>
              )}
              {t === "appointments" && appointments.filter(a => a.status === "PENDING").length > 0 && (
                <span className="ml-2 bg-amber-500 text-white px-2 py-0.5 rounded-full text-[10px] shadow-sm">{appointments.filter(a => a.status === "PENDING").length}</span>
              )}
            </button>
          ))}
        </div>

        {activeTab === "overview" && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-6">

            {/* ── Key Metrics ── */}
            <div>
              <h2 className="text-sm font-bold text-slate-500 uppercase tracking-wider mb-3 px-1">Key Metrics (All Time)</h2>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-3 md:gap-4">
                {[
                  { label: "Total Users", value: stats.totalUsers.toLocaleString(), icon: Users, color: "text-blue-500", bg: "bg-blue-50 dark:bg-blue-900/20" },
                  { label: "Prayers Offered", value: stats.prayersOffered.toLocaleString(), icon: Heart, color: "text-red-500", bg: "bg-red-50 dark:bg-red-900/20" },
                  { label: "Quizzes Taken", value: stats.quizzesTaken.toLocaleString(), icon: Activity, color: "text-orange-500", bg: "bg-orange-50 dark:bg-orange-900/20" },
                  { label: "Chapters Read", value: stats.chaptersRead.toLocaleString(), icon: BookOpen, color: "text-purple-500", bg: "bg-purple-50 dark:bg-purple-900/20" },
                  { label: "Missions Complete", value: stats.journeyNodesDone.toLocaleString(), icon: ShieldCheck, color: "text-green-500", bg: "bg-green-50 dark:bg-green-900/20" },
                  { label: "Stars Earned", value: stats.totalStarsEarned.toLocaleString(), icon: TrendingUp, color: "text-amber-500", bg: "bg-amber-50 dark:bg-amber-900/20" },
                ].map((stat, i) => {
                  const Icon = stat.icon;
                  return (
                    <div key={stat.label} className="bg-white dark:bg-slate-900 p-4 rounded-2xl border border-border/50 shadow-sm flex flex-col justify-between h-28">
                      <div className="flex items-center justify-between">
                        <div className={cn("w-8 h-8 rounded-full flex items-center justify-center", stat.bg)}>
                          <Icon className={cn("w-4 h-4", stat.color)} />
                        </div>
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
                  {recentUsers.map((user) => (
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

        {activeTab === "prayers" && (
          <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} className="space-y-4">
            <div className="bg-white dark:bg-slate-900 p-5 rounded-2xl border border-border/50 shadow-sm">
              <div className="flex items-center gap-3 mb-6">
                <div className="w-10 h-10 rounded-xl gradient-lent text-white flex items-center justify-center shadow-md">
                  <Heart className="w-5 h-5" />
                </div>
                <div className="flex-1">
                  <h2 className="font-bold font-serif text-lg">Prayer Wall</h2>
                  <p className="text-xs text-muted-foreground">All community prayers — delete any inappropriate submissions.</p>
                </div>
                <Badge className="bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-400 border-0">
                  {allPrayers.length} total
                </Badge>
              </div>

              {allPrayers.length === 0 ? (
                <div className="text-center py-10 bg-slate-50 dark:bg-slate-800/30 rounded-xl border border-dashed border-slate-300 dark:border-slate-700">
                  <p className="text-3xl mb-2">🙏</p>
                  <p className="text-sm font-bold text-slate-500">No prayers yet</p>
                  <p className="text-xs text-slate-400 mt-1">Community prayers will appear here.</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {allPrayers.map((prayer) => (
                    <div key={prayer.id} className="p-4 bg-slate-50 dark:bg-slate-800/50 rounded-xl border border-border/50">
                      <div className="flex items-start justify-between gap-4">
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-2 flex-wrap">
                            <Badge className="bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-400 border-0 text-[10px]">
                              {prayer.isAnonymous ? "Anonymous" : `${prayer.user?.firstName ?? ""} ${prayer.user?.lastName ?? ""}`.trim() || "Unknown"}
                            </Badge>
                            <Badge className="bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400 border-0 text-[10px]">
                              ✓ Live
                            </Badge>
                            <span className="text-[10px] text-muted-foreground">{new Date(prayer.createdAt).toLocaleDateString()}</span>
                          </div>
                          <p className="text-sm text-foreground font-medium leading-relaxed italic">
                            &ldquo;{prayer.content}&rdquo;
                          </p>
                          <p className="text-[10px] text-muted-foreground mt-1.5">{prayer.prayCount} 🙏 prayers</p>
                        </div>
                        <motion.button
                          whileHover={{ scale: 1.1 }}
                          whileTap={{ scale: 0.95 }}
                          onClick={() => handleDeletePrayer(prayer.id)}
                          className="w-10 h-10 bg-red-100 hover:bg-red-200 dark:bg-red-900/30 dark:hover:bg-red-900/50 text-red-600 rounded-xl flex items-center justify-center transition-colors shrink-0"
                          title="Delete prayer"
                        >
                          <AlertTriangle className="w-4 h-4" />
                        </motion.button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
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

            {/* ── Posted Notices List ── */}
            {existingAnnouncements.length > 0 && (
              <div className="bg-white dark:bg-slate-900 rounded-2xl border border-border/50 shadow-sm overflow-hidden">
                <div className="px-5 py-3 border-b border-border/50">
                  <p className="text-xs font-bold text-slate-500 uppercase tracking-wider">Posted Notices ({existingAnnouncements.length})</p>
                </div>
                <div className="divide-y divide-border/50">
                  {existingAnnouncements.map((ann) => (
                    <div key={ann.id} className="px-4 py-3 flex items-start justify-between gap-3">
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-bold text-foreground">{ann.title}</p>
                        <p className="text-xs text-muted-foreground mt-0.5 line-clamp-2">{ann.content}</p>
                        <p className="text-[10px] text-primary font-semibold mt-1">
                          {new Date(ann.createdAt).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })}
                        </p>
                      </div>
                      <motion.button
                        whileHover={{ scale: 1.1 }}
                        whileTap={{ scale: 0.95 }}
                        onClick={() => handleDeleteAnnouncement(ann.id)}
                        className="w-9 h-9 bg-red-100 hover:bg-red-200 dark:bg-red-900/30 dark:hover:bg-red-900/50 text-red-600 rounded-xl flex items-center justify-center transition-colors shrink-0 mt-0.5"
                        title="Delete notice"
                      >
                        <AlertTriangle className="w-4 h-4" />
                      </motion.button>
                    </div>
                  ))}
                </div>
              </div>
            )}
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

            {/* ── Existing Events List ── */}
            {existingEvents.length > 0 && (
              <div className="bg-white dark:bg-slate-900 rounded-2xl border border-border/50 shadow-sm overflow-hidden">
                <div className="px-5 py-3 border-b border-border/50">
                  <p className="text-xs font-bold text-slate-500 uppercase tracking-wider">Upcoming Events ({existingEvents.length})</p>
                </div>
                <div className="divide-y divide-border/50">
                  {existingEvents.map((ev) => (
                    <div key={ev.id} className="px-4 py-3 flex items-start justify-between gap-3">
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-bold text-foreground">{ev.title}</p>
                        <div className="flex items-center gap-3 mt-1 text-[11px] text-muted-foreground flex-wrap">
                          <span>📅 {new Date(ev.date).toLocaleDateString("en-US", { weekday: "short", month: "short", day: "numeric" })}</span>
                          {ev.location && <span>📍 {ev.location}</span>}
                          <span>👥 {ev.attendees} going</span>
                        </div>
                      </div>
                      <motion.button
                        whileHover={{ scale: 1.1 }}
                        whileTap={{ scale: 0.95 }}
                        onClick={() => handleDeleteEvent(ev.id)}
                        className="w-9 h-9 bg-red-100 hover:bg-red-200 dark:bg-red-900/30 dark:hover:bg-red-900/50 text-red-600 rounded-xl flex items-center justify-center transition-colors shrink-0 mt-0.5"
                        title="Delete event"
                      >
                        <AlertTriangle className="w-4 h-4" />
                      </motion.button>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </motion.div>
        )}

        {activeTab === "parishes" && (
          <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} className="space-y-4">
            <div className="bg-white dark:bg-slate-900 p-5 rounded-2xl border border-border/50 shadow-sm">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-10 h-10 rounded-xl gradient-life text-white flex items-center justify-center shadow-md">
                  <Users className="w-5 h-5" />
                </div>
                <div>
                  <h2 className="font-bold font-serif text-lg">Parish Accounts</h2>
                  <p className="text-xs text-muted-foreground">Register new churches and view community engagement.</p>
                </div>
              </div>
              
              <div className="space-y-4">
                <div>
                  <label className="text-xs font-bold text-muted-foreground uppercase tracking-widest mb-1.5 block">Parish Name</label>
                  <Input value={churchName} onChange={e => setChurchName(e.target.value)} placeholder="e.g. St. Thomas Orthodox Church" className="bg-slate-50 dark:bg-slate-950" />
                </div>
                <div>
                  <label className="text-xs font-bold text-muted-foreground uppercase tracking-widest mb-1.5 block">Location / Diocese</label>
                  <Input value={churchLoc} onChange={e => setChurchLoc(e.target.value)} placeholder="e.g. New York Diocese" className="bg-slate-50 dark:bg-slate-950" />
                </div>
                <motion.button 
                  whileTap={{ scale: 0.98 }}
                  onClick={handleCreateChurch}
                  disabled={churchStatus === "loading" || !churchName}
                  className="w-full h-12 rounded-xl gradient-life text-white font-bold flex items-center justify-center gap-2 shadow-md hover:opacity-90 transition-opacity disabled:opacity-50"
                >
                  {churchStatus === "loading" ? <Loader2 className="w-5 h-5 animate-spin" /> : 
                   churchStatus === "success" ? <CheckCircle2 className="w-5 h-5" /> :
                   <Users className="w-4 h-4" />}
                  {churchStatus === "success" ? "Parish Registered!" : "Create Parish Account"}
                </motion.button>
              </div>
            </div>

            {/* ── Registered Parishes List ── */}
            {churches.length > 0 && (
              <div className="bg-white dark:bg-slate-900 rounded-2xl border border-border/50 shadow-sm overflow-hidden mt-4">
                <div className="px-5 py-3 border-b border-border/50">
                  <p className="text-xs font-bold text-slate-500 uppercase tracking-wider">Registered Parishes ({churches.length})</p>
                </div>
                <div className="divide-y divide-border/50">
                  {churches.map((church) => (
                    <div key={church.id} className="px-5 py-4 flex items-center justify-between gap-3">
                      <div className="flex-1">
                        <p className="text-sm font-bold text-foreground flex items-center gap-2">
                          ⛪ {church.name}
                        </p>
                        {church.location && <p className="text-xs text-muted-foreground mt-1">📍 {church.location}</p>}
                        {church.inviteCode && (
                          <div className="mt-2 inline-flex items-center gap-1.5 px-2 py-1 bg-slate-100 dark:bg-slate-800 rounded text-xs font-mono font-bold text-slate-700 dark:text-slate-300">
                            Invite Code: <span className="text-primary">{church.inviteCode}</span>
                          </div>
                        )}
                      </div>
                      <div className="flex gap-4 text-center">
                        <div className="bg-slate-50 dark:bg-slate-800 p-2 rounded-lg">
                          <p className="text-[10px] font-bold text-slate-500 uppercase">Members</p>
                          <p className="text-sm font-bold text-foreground">{church._count.users}</p>
                        </div>
                        <div className="bg-slate-50 dark:bg-slate-800 p-2 rounded-lg">
                          <p className="text-[10px] font-bold text-slate-500 uppercase">Events</p>
                          <p className="text-sm font-bold text-foreground">{church._count.events}</p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </motion.div>
        )}

        {activeTab === "appointments" && (
          <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} className="space-y-4">
            <div className="bg-white dark:bg-slate-900 p-5 rounded-2xl border border-border/50 shadow-sm">
              <div className="flex items-center gap-3 mb-6">
                <div className="w-10 h-10 rounded-xl bg-amber-500 text-white flex items-center justify-center shadow-md">
                  <Activity className="w-5 h-5" />
                </div>
                <div className="flex-1">
                  <h2 className="font-bold font-serif text-lg">Meeting Requests</h2>
                  <p className="text-xs text-muted-foreground">Manage spiritual direction and confession requests.</p>
                </div>
              </div>

              {appointments.length === 0 ? (
                <div className="text-center py-10 bg-slate-50 dark:bg-slate-800/30 rounded-xl border border-dashed border-slate-300 dark:border-slate-700">
                  <p className="text-3xl mb-2">🗓️</p>
                  <p className="text-sm font-bold text-slate-500">No appointments yet</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {appointments.map((apt) => (
                    <div key={apt.id} className="p-4 bg-slate-50 dark:bg-slate-800/50 rounded-xl border border-border/50">
                      <div className="flex items-start justify-between gap-4">
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-2 flex-wrap">
                            <Badge className="bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400 border-0 text-[10px]">
                              {apt.user?.firstName} {apt.user?.lastName}
                            </Badge>
                            <Badge className={cn(
                              "border-0 text-[10px]",
                              apt.status === "PENDING" ? "bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400" :
                              apt.status === "CONFIRMED" ? "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400" :
                              "bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400"
                            )}>
                              {apt.status}
                            </Badge>
                            <span className="text-[10px] text-muted-foreground">Submitted: {new Date(apt.createdAt).toLocaleDateString()}</span>
                          </div>
                          <p className="text-sm text-foreground font-medium mb-1">Requested: {apt.date} at {apt.time}</p>
                          {apt.purpose && (
                            <p className="text-xs text-muted-foreground italic">Purpose: "{apt.purpose}"</p>
                          )}
                          {apt.user?.email && (
                            <p className="text-[10px] text-slate-400 mt-1">Contact: {apt.user.email}</p>
                          )}
                        </div>
                        {apt.status === "PENDING" && (
                          <div className="flex gap-2">
                            <motion.button
                              whileHover={{ scale: 1.05 }}
                              whileTap={{ scale: 0.95 }}
                              onClick={async () => {
                                await updateAppointmentStatus(apt.id, "CONFIRMED");
                                await fetchContent();
                              }}
                              className="px-3 py-1.5 bg-green-100 hover:bg-green-200 dark:bg-green-900/30 text-green-700 rounded-lg text-xs font-bold transition-colors"
                            >
                              Confirm
                            </motion.button>
                            <motion.button
                              whileHover={{ scale: 1.05 }}
                              whileTap={{ scale: 0.95 }}
                              onClick={async () => {
                                await updateAppointmentStatus(apt.id, "DECLINED");
                                await fetchContent();
                              }}
                              className="px-3 py-1.5 bg-red-100 hover:bg-red-200 dark:bg-red-900/30 text-red-700 rounded-lg text-xs font-bold transition-colors"
                            >
                              Decline
                            </motion.button>
                          </div>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </motion.div>
        )}

        {activeTab === "content" && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-6">
            
            {/* ── Quotes Management ── */}
            <div className="bg-white dark:bg-slate-900 p-5 rounded-2xl border border-border/50 shadow-sm">
              <h2 className="text-lg font-bold text-foreground mb-4">Quotes of the Day</h2>
              
              <div className="space-y-4 mb-6">
                <Input value={newQuoteText} onChange={e => setNewQuoteText(e.target.value)} placeholder="Quote text (e.g. Do small things with great love.)" />
                <Input value={newQuoteAuthor} onChange={e => setNewQuoteAuthor(e.target.value)} placeholder="Author (e.g. St. Teresa of Calcutta)" />
                <button onClick={handleCreateQuote} disabled={creatingQuote} className="px-4 py-2 bg-slate-900 text-white rounded-lg text-sm font-bold w-full">
                  {creatingQuote ? "Adding..." : "Add Quote"}
                </button>
              </div>

              <div className="space-y-3">
                {quotes.map(q => (
                  <div key={q.id} className="p-4 border rounded-xl flex items-center justify-between">
                    <div>
                      <p className="text-sm font-bold">"{q.quote}"</p>
                      <p className="text-xs text-muted-foreground">— {q.author}</p>
                    </div>
                    <button 
                      onClick={() => handleToggleQuote(q.id)}
                      className={cn("px-3 py-1 rounded-full text-[10px] font-bold uppercase", q.isActive ? "bg-green-100 text-green-700" : "bg-slate-100 text-slate-500 hover:bg-slate-200")}
                    >
                      {q.isActive ? "Active" : "Set Active"}
                    </button>
                  </div>
                ))}
              </div>
            </div>

            {/* ── Chat Suggestions ── */}
            <div className="bg-white dark:bg-slate-900 p-5 rounded-2xl border border-border/50 shadow-sm">
              <h2 className="text-lg font-bold text-foreground mb-4">AI Chat Suggestions</h2>
              
              <div className="flex gap-2 mb-6">
                <Input value={newSuggestionText} onChange={e => setNewSuggestionText(e.target.value)} placeholder="e.g. Explain the Holy Trinity" className="flex-1" />
                <button onClick={handleCreateSuggestion} disabled={creatingSuggestion} className="px-4 py-2 bg-slate-900 text-white rounded-lg text-sm font-bold">
                  {creatingSuggestion ? "Adding..." : "Add"}
                </button>
              </div>

              <div className="space-y-2">
                {chatSuggestions.map(s => (
                  <div key={s.id} className="p-3 border rounded-xl flex items-center justify-between bg-slate-50 dark:bg-slate-950">
                    <p className="text-sm font-medium">{s.text}</p>
                    <button onClick={() => handleDeleteSuggestion(s.id)} className="text-red-500 text-xs font-bold hover:underline">
                      Delete
                    </button>
                  </div>
                ))}
              </div>
            </div>

          </motion.div>
        )}

        {activeTab === "qrcodes" && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-6">
            <div className="bg-white dark:bg-slate-900 p-5 rounded-2xl border border-border/50 shadow-sm">
              <h2 className="text-lg font-bold text-foreground mb-4 font-serif">Event QR Codes</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {existingEvents.map(ev => (
                  <div key={ev.id} className="p-4 border rounded-xl flex flex-col items-center text-center bg-slate-50 dark:bg-slate-950">
                    <p className="font-bold text-sm mb-2">{ev.title}</p>
                    <div className="bg-white p-3 rounded-lg shadow-sm">
                      <QRCode value={`${baseUrl}/scan?eventId=${ev.id}`} size={120} level="H" />
                    </div>
                    <p className="text-[10px] text-muted-foreground mt-3 uppercase tracking-widest">{ev.date ? new Date(ev.date).toLocaleDateString() : ""}</p>
                  </div>
                ))}
                {existingEvents.length === 0 && (
                  <p className="text-sm text-muted-foreground col-span-2">No upcoming events found.</p>
                )}
              </div>
            </div>

          </motion.div>
        )}
        
      </div>
    </div>
  );
}
