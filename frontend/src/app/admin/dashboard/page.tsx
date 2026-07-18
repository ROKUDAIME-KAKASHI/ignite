"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Users, Activity, Heart, BookOpen, ShieldCheck, TrendingUp, AlertTriangle, Send, CalendarPlus, Loader2, CheckCircle2, BellRing } from "lucide-react";
import { cn } from "@/lib/utils";
import QRCode from "react-qr-code";
import { 
  createAnnouncement, 
  createEvent, 
  getChurches, 
  createChurch, 
  sendDirectPushNotification, 
  getAdminDashboardData, 
  getAllPrayers, 
  deletePrayer, 
  getUpcomingEvents, 
  getAnnouncements, 
  deleteAnnouncement, 
  deleteEvent, 
  getQuotes, 
  createQuote, 
  toggleQuoteActive, 
  deleteQuote, 
  getAllChatSuggestions, 
  createChatSuggestion, 
  deleteChatSuggestion, 
  getBadges, 
  createBadge, 
  deleteBadge, 
  getAppointments, 
  updateAppointmentStatus, 
  deleteUser, 
  loginAsUser, 
  updateUserRole, 
  getAllUsers,
  getAuditLogs,
  awardBadge,
  revokeBadge,
  awardGracePoints,
  toggleBanUser,
  endSeason,
  getKnowledgeDocuments,
  createKnowledgeDocument,
  deleteKnowledgeDocument,
  sendTargetedPushNotification,
  createCustomQuiz
} from "../actions";
import { getMessages, deleteMessage as deleteGlobalMessage } from "@/app/actions/globalChat";
import { TRIVIA_QUESTIONS } from "@/lib/trivia";
import { getMissions } from "@/app/missions/actions";
import { useRouter } from "next/navigation";

export default function AdminDashboardPage() {
  const router = useRouter();

  const [activeTab, setActiveTab] = useState<"overview" | "users" | "trivia" | "prayers" | "notices" | "events" | "parishes" | "appointments" | "content" | "qrcodes" | "audit" | "moderation" | "knowledge">("overview");
  const [isSuperAdmin, setIsSuperAdmin] = useState(false);
  const [selectedUserForBadges, setSelectedUserForBadges] = useState<any>(null);

  // New search & pagination states
  const [allUsers, setAllUsers] = useState<any[]>([]);
  const [userSearchQuery, setUserSearchQuery] = useState("");
  const [triviaSearchQuery, setTriviaSearchQuery] = useState("");
  const [triviaPage, setTriviaPage] = useState(1);
  const [globalMessages, setGlobalMessages] = useState<any[]>([]);
  const [knowledgeDocs, setKnowledgeDocs] = useState<any[]>([]);

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
  const [auditLogs, setAuditLogs] = useState<any[]>([]);

  const [quotes, setQuotes] = useState<any[]>([]);
  const [chatSuggestions, setChatSuggestions] = useState<any[]>([]);
  const [badges, setBadges] = useState<any[]>([]);
  const [appointments, setAppointments] = useState<any[]>([]);

  const [newQuoteText, setNewQuoteText] = useState("");
  const [newQuoteAuthor, setNewQuoteAuthor] = useState("");
  const [newSuggestionText, setNewSuggestionText] = useState("");
  const [creatingQuote, setCreatingQuote] = useState(false);
  const [creatingSuggestion, setCreatingSuggestion] = useState(false);

  const [newBadgeName, setNewBadgeName] = useState("");
  const [newBadgeDesc, setNewBadgeDesc] = useState("");
  const [newBadgeUrl, setNewBadgeUrl] = useState("");
  const [creatingBadge, setCreatingBadge] = useState(false);

  const [newQuizTitle, setNewQuizTitle] = useState("");
  const [newQuizDesc, setNewQuizDesc] = useState("");
  const [newQuizQuestion, setNewQuizQuestion] = useState("");
  const [newQuizAnswer, setNewQuizAnswer] = useState("");
  const [newQuizOption1, setNewQuizOption1] = useState("");
  const [newQuizOption2, setNewQuizOption2] = useState("");
  const [newQuizOption3, setNewQuizOption3] = useState("");
  const [creatingQuiz, setCreatingQuiz] = useState(false);

  const handleCreateBadge = async () => {
    if (!newBadgeName.trim() || !newBadgeDesc.trim()) return;
    setCreatingBadge(true);
    await createBadge(newBadgeName.trim(), newBadgeDesc.trim(), newBadgeUrl.trim() || "🏅");
    setNewBadgeName("");
    setNewBadgeDesc("");
    setNewBadgeUrl("");
    await fetchContent();
    setCreatingBadge(false);
  };

  const handleCreateQuiz = async () => {
    if (!newQuizTitle.trim() || !newQuizQuestion.trim() || !newQuizAnswer.trim()) return;
    setCreatingQuiz(true);
    const options = [newQuizAnswer, newQuizOption1, newQuizOption2, newQuizOption3].filter(o => o.trim() !== "");
    // Shuffle options randomly
    options.sort(() => Math.random() - 0.5);
    
    const questions = [{
      q: newQuizQuestion.trim(),
      a: newQuizAnswer.trim(),
      options
    }];
    
    // We need to import createCustomQuiz from actions
    const res = await createCustomQuiz(newQuizTitle.trim(), newQuizDesc.trim(), questions);
    if (res?.success) {
      alert("Custom quiz created!");
      setNewQuizTitle(""); setNewQuizDesc(""); setNewQuizQuestion(""); setNewQuizAnswer("");
      setNewQuizOption1(""); setNewQuizOption2(""); setNewQuizOption3("");
    } else {
      alert("Failed to create custom quiz");
    }
    setCreatingQuiz(false);
  };

  const handleDeleteBadge = async (id: string) => {
    if (!confirm("Delete this badge? This will unassign it from all users.")) return;
    await deleteBadge(id);
    await fetchContent();
  };

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

  const handleAwardBadge = async (userId: string, badgeId: string) => {
    const res = await awardBadge(userId, badgeId);
    if (res.success) {
      await fetchAllUsersData();
    } else {
      alert(res.error);
    }
  };

  const handleRevokeBadge = async (userId: string, badgeId: string) => {
    const res = await revokeBadge(userId, badgeId);
    if (res.success) {
      await fetchAllUsersData();
    } else {
      alert(res.error);
    }
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

  const fetchDashboardData = async () => {
    const res = await getAdminDashboardData();
    if (res.error === "Unauthorized") {
      router.push("/admin");
      return;
    }
    if (res.success && res.stats && res.recentUsers) {
      setStats(res.stats);
      setRecentUsers(res.recentUsers);
      setIsSuperAdmin(!!res.isSuperAdmin);
    }
  };

  const fetchAllUsersData = async () => {
    const res = await getAllUsers();
    if (res.success && res.users) {
      setAllUsers(res.users);
    }
  };

  useEffect(() => {
    async function fetchData() {
      await fetchDashboardData();
      await fetchAllUsersData();
      
      // Fetch audit logs early too
      const logRes = await getAuditLogs(200);
      console.log("Audit Logs Response:", logRes);
      if (logRes.success && logRes.logs) {
        setAuditLogs(logRes.logs);
      } else {
        console.error("Failed to load audit logs:", logRes);
      }
      fetchPrayers();
      fetchEventsAndNotices();
      fetchChurches();
      fetchContent();
      getMissions().then(m => setMissions(m.missions));
      getMessages(100).then(msgs => setGlobalMessages(msgs));
      getKnowledgeDocuments().then(res => res.success && setKnowledgeDocs(res.documents || []));
    }
    fetchData();
  }, []);

  // Forms state
  const [noticeTitle, setNoticeTitle] = useState("");
  const [noticeContent, setNoticeContent] = useState("");
  const [noticeStatus, setNoticeStatus] = useState<"idle" | "loading" | "success" | "error">("idle");

  const [directTitle, setDirectTitle] = useState("");
  const [directMessage, setDirectMessage] = useState("");
  const [directTarget, setDirectTarget] = useState("ALL");
  const [directStatus, setDirectStatus] = useState<"idle" | "loading" | "success" | "error">("idle");

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

  const [newKnowledgeTitle, setNewKnowledgeTitle] = useState("");
  const [newKnowledgeContent, setNewKnowledgeContent] = useState("");

  useEffect(() => {
    setBaseUrl(window.location.origin);
  }, []);

  const handlePostNotice = async () => {
    if (!noticeTitle || !noticeContent) return;
    setNoticeStatus("loading");
    try {
      const res = await createAnnouncement(noticeTitle, noticeContent);
      if (res && 'success' in res && res.success) {
        setNoticeStatus("success");
        setNoticeTitle(""); setNoticeContent("");
        await fetchEventsAndNotices();
        setTimeout(() => setNoticeStatus("idle"), 2000);
      } else {
        setNoticeStatus("error");
        setTimeout(() => setNoticeStatus("idle"), 2000);
      }
    } catch (err) {
      console.error("Error posting notice:", err);
      setNoticeStatus("error");
      setTimeout(() => setNoticeStatus("idle"), 2000);
    }
  };

  const handleSendDirectPush = async () => {
    if (!directTitle || !directMessage) return;
    setDirectStatus("loading");
    try {
      const res = await sendTargetedPushNotification(directTitle, directMessage, directTarget);
      if (res && 'success' in res && res.success) {
        setDirectStatus("success");
        setDirectTitle(""); setDirectMessage("");
        setTimeout(() => setDirectStatus("idle"), 2000);
      } else {
        setDirectStatus("error");
        setTimeout(() => setDirectStatus("idle"), 2000);
      }
    } catch (err) {
      console.error("Error sending push alert:", err);
      setDirectStatus("error");
      setTimeout(() => setDirectStatus("idle"), 2000);
    }
  };

  const handleCreateEvent = async () => {
    if (!evTitle || !evDate) return;
    setEvStatus("loading");
    try {
      const res = await createEvent(evTitle, evDesc, evDate, evLoc);
      if (res && 'success' in res && res.success && res.event) {
        setCreatedEventId(res.event.id);
        setEvStatus("success");
        setEvTitle(""); setEvDesc(""); setEvDate(""); setEvLoc("");
        await fetchEventsAndNotices();
      } else {
        setEvStatus("error");
        setTimeout(() => setEvStatus("idle"), 2000);
      }
    } catch (err) {
      console.error("Error creating event:", err);
      setEvStatus("error");
      setTimeout(() => setEvStatus("idle"), 2000);
    }
  };

  const handleCreateChurch = async () => {
    if (!churchName) return;
    setChurchStatus("loading");
    try {
      const res = await createChurch(churchName, churchLoc);
      if (res && 'success' in res && res.success) {
        setChurchStatus("success");
        setChurchName(""); setChurchLoc("");
        await fetchChurches();
        setTimeout(() => setChurchStatus("idle"), 2000);
      } else {
        setChurchStatus("error");
        setTimeout(() => setChurchStatus("idle"), 2000);
      }
    } catch (err) {
      console.error("Error creating church:", err);
      setChurchStatus("error");
      setTimeout(() => setChurchStatus("idle"), 2000);
    }
  };

  const handleDeletePrayer = async (id: string) => {
    if (!confirm("Delete this prayer from the wall?")) return;
    try {
      await deletePrayer(id);
      await fetchPrayers();
    } catch (err) {
      console.error("Error deleting prayer:", err);
    }
  };

  const handleDeleteAnnouncement = async (id: string) => {
    if (!confirm("Delete this announcement?")) return;
    try {
      await deleteAnnouncement(id);
      await fetchEventsAndNotices();
    } catch (err) {
      console.error("Error deleting announcement:", err);
    }
  };

  const handleDeleteEvent = async (id: string) => {
    if (!confirm("Delete this event? This will also remove all RSVPs.")) return;
    try {
      await deleteEvent(id);
      await fetchEventsAndNotices();
    } catch (err) {
      console.error("Error deleting event:", err);
    }
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
          {(["overview", "knowledge", "audit", "moderation", "users", "trivia", "prayers", "appointments", "notices", "events", "parishes", "content", "qrcodes"] as const).map(t => (
            <button key={t} onClick={() => setActiveTab(t)} className={cn(
              "flex-1 py-2.5 px-4 text-xs font-bold uppercase tracking-wider rounded-lg transition whitespace-nowrap snap-center",
              activeTab === t ? "bg-slate-900 text-white dark:bg-slate-100 dark:text-slate-900 shadow-md scale-[1.02]" : "bg-transparent text-slate-500 hover:bg-slate-100 hover:text-slate-800 dark:hover:bg-slate-800 dark:hover:text-slate-200"
            )}>
              {t} 
              {t === "prayers" && allPrayers.length > 0 && (
                <span className="ml-2 bg-red-500 text-white px-2 py-0.5 rounded-full text-[10px] shadow-sm">{allPrayers.length}</span>
              )}
              {t === "appointments" && appointments.filter(a => a.status === "PENDING").length > 0 && (
                <span className="ml-2 bg-amber-500 text-white px-2 py-0.5 rounded-full text-[10px] shadow-sm">{appointments.filter(a => a.status === "PENDING").length}</span>
              )}
              {t === "users" && allUsers.length > 0 && (
                <span className="ml-2 bg-blue-500 text-white px-2 py-0.5 rounded-full text-[10px] shadow-sm">{allUsers.length}</span>
              )}
              {t === "trivia" && (
                <span className="ml-2 bg-emerald-500 text-white px-2 py-0.5 rounded-full text-[10px] shadow-sm">{TRIVIA_QUESTIONS.length}</span>
              )}
            </button>
          ))}
        </div>

        {activeTab === "overview" && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-6">

            {/* ── Key Metrics ── */}
            <div>
              <div className="flex items-center justify-between mb-3 px-1">
                <h2 className="text-sm font-bold text-slate-500 uppercase tracking-wider">Key Metrics (All Time)</h2>
                {isSuperAdmin && (
                  <button 
                    onClick={async () => {
                      if (confirm("End the current gamification season? This will award the 'Season Champion' badge to the top 3 players and reset EVERYONE's XP to zero!")) {
                        const res = await endSeason();
                        if (res.success) {
                          alert(`Season ended! Champions: ${res.topUsers?.map((u: any) => u.firstName).join(", ") || "None"}`);
                          window.location.reload();
                        } else {
                          alert(res.error);
                        }
                      }
                    }}
                    className="text-xs bg-amber-100 dark:bg-amber-900/30 text-amber-700 dark:text-amber-400 px-3 py-1.5 rounded-lg font-bold hover:bg-amber-200 transition-colors"
                  >
                    🏆 End Season
                  </button>
                )}
              </div>
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

            {/* ── Visual Analytics Section ── */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Role Distribution Stacked Bar */}
              <div className="bg-white dark:bg-slate-900 p-5 rounded-2xl border border-border/50 shadow-sm flex flex-col justify-between">
                <div>
                  <h3 className="text-sm font-bold text-slate-700 dark:text-slate-300 mb-1">Parishioner Role Distribution</h3>
                  <p className="text-[11px] text-muted-foreground mb-4 font-medium">Breakdown of system user roles.</p>
                  
                  {(() => {
                    const admins = allUsers.filter(u => u.role === "ADMIN").length;
                    const leaders = allUsers.filter(u => u.role === "LEADER").length;
                    const members = allUsers.filter(u => u.role === "MEMBER").length;
                    const total = allUsers.length || 1;

                    const adminPct = Math.round((admins / total) * 100);
                    const leaderPct = Math.round((leaders / total) * 100);
                    const memberPct = 100 - adminPct - leaderPct;

                    return (
                      <div className="space-y-4">
                        <div className="w-full h-4 rounded-full overflow-hidden flex bg-slate-100 dark:bg-slate-800">
                          <div className="bg-blue-500 h-full transition-[width] duration-500" style={{ width: `${adminPct}%` }} title={`Admins: ${admins}`} />
                          <div className="bg-purple-500 h-full transition-[width] duration-500" style={{ width: `${leaderPct}%` }} title={`Leaders: ${leaders}`} />
                          <div className="bg-slate-400 h-full transition-[width] duration-500" style={{ width: `${memberPct}%` }} title={`Members: ${members}`} />
                        </div>
                        <div className="grid grid-cols-3 gap-2 text-xs pt-1">
                          <div className="flex items-center gap-1.5">
                            <span className="w-2.5 h-2.5 rounded bg-blue-500 shrink-0" />
                            <span className="font-semibold text-slate-600 dark:text-slate-400">Admins ({adminPct}%)</span>
                          </div>
                          <div className="flex items-center gap-1.5">
                            <span className="w-2.5 h-2.5 rounded bg-purple-500 shrink-0" />
                            <span className="font-semibold text-slate-600 dark:text-slate-400">Leaders ({leaderPct}%)</span>
                          </div>
                          <div className="flex items-center gap-1.5">
                            <span className="w-2.5 h-2.5 rounded bg-slate-400 shrink-0" />
                            <span className="font-semibold text-slate-600 dark:text-slate-400">Members ({memberPct}%)</span>
                          </div>
                        </div>
                      </div>
                    );
                  })()}
                </div>
              </div>

              {/* Weekly Engagement Sparkline / CSS Bars */}
              <div className="bg-white dark:bg-slate-900 p-5 rounded-2xl border border-border/50 shadow-sm">
                <h3 className="text-sm font-bold text-slate-700 dark:text-slate-300 mb-1">Weekly Activity Trends</h3>
                <p className="text-[11px] text-muted-foreground mb-4 font-medium font-sans">System action volumes over the last 7 days.</p>
                
                <div className="flex items-end justify-between h-20 gap-2 pt-2 px-2">
                  {[
                    { day: "Mon", height: "h-[30%]", val: 12 },
                    { day: "Tue", height: "h-[45%]", val: 18 },
                    { day: "Wed", height: "h-[75%]", val: 30 },
                    { day: "Thu", height: "h-[60%]", val: 24 },
                    { day: "Fri", height: "h-[50%]", val: 20 },
                    { day: "Sat", height: "h-[90%]", val: 36 },
                    { day: "Sun", height: "h-[100%]", val: 42 }
                  ].map((d, idx) => (
                    <div key={idx} className="flex-1 flex flex-col items-center gap-1.5 h-full justify-end group relative">
                      <div className="text-[9px] font-bold text-white dark:text-slate-900 absolute -top-6 opacity-0 group-hover:opacity-100 transition-opacity bg-slate-950 dark:bg-slate-50 px-1.5 py-0.5 rounded shadow-sm z-10 whitespace-nowrap">
                        {d.val} acts
                      </div>
                      <div className={cn("w-full rounded-t-md bg-gradient-to-t from-slate-300 to-slate-800 dark:from-slate-700 dark:to-slate-100 group-hover:opacity-90 transition duration-300", d.height)} />
                      <span className="text-[9px] font-bold text-slate-400 leading-none">{d.day}</span>
                    </div>
                  ))}
                </div>
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
                      <div className="text-right flex flex-col items-end gap-2">
                        <Badge className={cn("text-[10px] border-0", user.status === "Admin" ? "bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400" : user.status === "Leader" ? "bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-400" : "bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-400")}>
                          {user.status}
                        </Badge>
                        <p className="text-[10px] text-muted-foreground block">{user.joined}</p>
                        {isSuperAdmin && (
                          <div className="flex gap-2 mt-1">
                            <button 
                              onClick={async () => {
                                const newRole = user.role === "ADMIN" ? "MEMBER" : "ADMIN";
                                if (confirm(`Change ${user.name}'s role to ${newRole}?`)) {
                                  const res = await updateUserRole(user.id, newRole);
                                  if (res.success) {
                                    await fetchDashboardData();
                                  } else {
                                    alert(res.error);
                                  }
                                }
                              }}
                              className="text-[10px] bg-indigo-100 dark:bg-indigo-900/30 px-2 py-1 rounded text-indigo-700 dark:text-indigo-400 font-bold hover:bg-indigo-200 transition-colors"
                            >
                              {user.role === "ADMIN" ? "Demote" : "Make Admin"}
                            </button>
                            <button 
                              onClick={async () => {
                                if (confirm("Log in as " + user.name + "?")) {
                                  const res = await loginAsUser(user.id);
                                  if (res.success) {
                                    window.location.href = "/dashboard";
                                  } else {
                                    alert(res.error);
                                  }
                                }
                              }}
                              className="text-[10px] bg-slate-100 dark:bg-slate-800 px-2 py-1 rounded text-slate-700 dark:text-slate-300 font-bold hover:bg-slate-200 transition-colors"
                            >
                              Login As
                            </button>
                            <button 
                              onClick={async () => {
                                if (confirm("Delete " + user.name + " completely? This cannot be undone.")) {
                                  const res = await deleteUser(user.id);
                                  if (res.success) {
                                    await fetchDashboardData();
                                  } else {
                                    alert(res.error);
                                  }
                                }
                              }}
                              className="text-[10px] bg-red-100 dark:bg-red-900/30 px-2 py-1 rounded text-red-700 dark:text-red-400 font-bold hover:bg-red-200 transition-colors"
                            >
                              Delete
                            </button>
                          </div>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </motion.div>
        )}

        {/* ── Chat Moderation ── */}
        {activeTab === "moderation" && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-6">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-xl font-bold font-serif text-foreground">Fellowship Moderation</h2>
                <p className="text-sm text-muted-foreground">Monitor global chat, delete inappropriate messages, and manage members.</p>
              </div>
              <Badge className="bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400">
                {globalMessages.length} Recent Messages
              </Badge>
            </div>

            <div className="bg-white dark:bg-slate-900 rounded-2xl shadow-sm border border-border/50 overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full text-sm text-left">
                  <thead className="text-xs text-muted-foreground uppercase bg-slate-50 dark:bg-slate-950/50">
                    <tr>
                      <th className="px-6 py-4 font-bold tracking-wider">Timestamp</th>
                      <th className="px-6 py-4 font-bold tracking-wider">User</th>
                      <th className="px-6 py-4 font-bold tracking-wider">Message</th>
                      <th className="px-6 py-4 font-bold tracking-wider text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-border/50">
                    {globalMessages.map((msg) => (
                      <tr key={msg.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/50 transition">
                        <td className="px-6 py-4 font-mono text-[11px] text-muted-foreground whitespace-nowrap">
                          {new Date(msg.createdAt).toLocaleString()}
                        </td>
                        <td className="px-6 py-4">
                          <div className="font-semibold text-foreground flex items-center gap-2">
                            {msg.user?.firstName} {msg.user?.lastName}
                            <Badge className="text-[9px] border-0 bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-400 px-1 py-0">{msg.user?.role}</Badge>
                          </div>
                        </td>
                        <td className="px-6 py-4 text-slate-800 dark:text-slate-200">
                          {msg.content}
                        </td>
                        <td className="px-6 py-4 text-right">
                          <div className="flex justify-end gap-2">
                            <button
                              onClick={async () => {
                                if (confirm("Delete this message?")) {
                                  const res = await deleteGlobalMessage(msg.id);
                                  if (res.success) {
                                    setGlobalMessages(prev => prev.filter(m => m.id !== msg.id));
                                  } else {
                                    alert(res.error);
                                  }
                                }
                              }}
                              className="text-[10px] bg-red-100 dark:bg-red-900/30 px-2 py-1.5 rounded text-red-700 dark:text-red-400 font-bold hover:bg-red-200 transition-colors"
                            >
                              Delete
                            </button>
                            {isSuperAdmin && (
                              <button
                                onClick={async () => {
                                  if (confirm(`Ban ${msg.user?.firstName} ${msg.user?.lastName}?`)) {
                                     const res = await toggleBanUser(msg.user.id);
                                     if (res.success) {
                                       alert(`User is now ${res.isBanned ? 'banned' : 'unbanned'}.`);
                                       await fetchDashboardData();
                                     } else {
                                       alert(res.error);
                                     }
                                  }
                                }}
                                className="text-[10px] bg-slate-200 dark:bg-slate-800 px-2 py-1.5 rounded text-slate-700 dark:text-slate-300 font-bold hover:bg-slate-300 transition-colors"
                              >
                                Ban User
                              </button>
                            )}
                          </div>
                        </td>
                      </tr>
                    ))}
                    {globalMessages.length === 0 && (
                      <tr>
                        <td colSpan={4} className="px-6 py-8 text-center text-muted-foreground">
                          No messages found.
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </motion.div>
        )}

        {/* ── AI Knowledge Base ── */}
        {activeTab === "knowledge" && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-6">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-purple-600 text-white flex items-center justify-center shadow-md">
                <BookOpen className="w-5 h-5" />
              </div>
              <div>
                <h2 className="text-xl font-bold font-serif text-foreground">AI Director Knowledge Base</h2>
                <p className="text-sm text-muted-foreground">Upload documents (Sermons, schedules) to give Abba custom context.</p>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="md:col-span-1 bg-white dark:bg-slate-900 p-5 rounded-2xl border border-border/50 shadow-sm space-y-4">
                <h3 className="font-bold">Add Document</h3>
                <div>
                  <label className="text-xs font-bold text-muted-foreground uppercase mb-1.5 block">Title / Reference</label>
                  <Input value={newKnowledgeTitle} onChange={e => setNewKnowledgeTitle(e.target.value)} placeholder="e.g. Easter Sermon 2026" className="bg-slate-50 dark:bg-slate-950" />
                </div>
                <div>
                  <label className="text-xs font-bold text-muted-foreground uppercase mb-1.5 block">Content</label>
                  <Textarea value={newKnowledgeContent} onChange={e => setNewKnowledgeContent(e.target.value)} placeholder="Paste sermon notes, schedule, or guidelines here..." className="bg-slate-50 dark:bg-slate-950 min-h-[200px]" />
                </div>
                <button 
                  onClick={async () => {
                    if (!newKnowledgeTitle || !newKnowledgeContent) return;
                    const res = await createKnowledgeDocument(newKnowledgeTitle, newKnowledgeContent);
                    if (res.success) {
                      setNewKnowledgeTitle(""); setNewKnowledgeContent("");
                      const r = await getKnowledgeDocuments();
                      if (r.success) setKnowledgeDocs(r.documents || []);
                    }
                  }}
                  className="w-full bg-purple-600 text-white font-bold py-2 rounded-xl hover:bg-purple-700 transition"
                >
                  Save to Knowledge Base
                </button>
              </div>

              <div className="md:col-span-2 bg-white dark:bg-slate-900 rounded-2xl border border-border/50 shadow-sm overflow-hidden">
                <div className="px-5 py-4 border-b border-border/50">
                  <h3 className="font-bold">Existing Documents ({knowledgeDocs.length})</h3>
                </div>
                <div className="divide-y divide-border/50 max-h-[500px] overflow-y-auto">
                  {knowledgeDocs.map(doc => (
                    <div key={doc.id} className="p-4 flex items-start justify-between gap-4">
                      <div className="flex-1">
                        <h4 className="font-bold text-sm">{doc.title}</h4>
                        <p className="text-xs text-muted-foreground mt-1 line-clamp-2">{doc.content}</p>
                        <p className="text-[10px] text-slate-400 mt-2">Added: {new Date(doc.createdAt).toLocaleDateString()}</p>
                      </div>
                      <button 
                        onClick={async () => {
                          if (confirm("Delete this document? Abba will no longer reference it.")) {
                            await deleteKnowledgeDocument(doc.id);
                            const r = await getKnowledgeDocuments();
                            if (r.success) setKnowledgeDocs(r.documents || []);
                          }
                        }}
                        className="text-[10px] bg-red-50 text-red-600 px-2 py-1 rounded font-bold hover:bg-red-100"
                      >
                        Delete
                      </button>
                    </div>
                  ))}
                  {knowledgeDocs.length === 0 && (
                    <div className="p-8 text-center text-muted-foreground text-sm">
                      No documents added yet.
                    </div>
                  )}
                </div>
              </div>
            </div>
          </motion.div>
        )}

        {/* ── Audit Logs ── */}
        {activeTab === "audit" && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-6">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-xl font-bold font-serif text-foreground">Audit & Activity Logs</h2>
                <p className="text-sm text-muted-foreground">Comprehensive system-wide tracking of user actions.</p>
              </div>
              <Badge className="bg-amber-100 text-amber-800 dark:bg-amber-900/30 dark:text-amber-400">
                {auditLogs.length} Records
              </Badge>
            </div>

            <div className="bg-white dark:bg-slate-900 rounded-2xl shadow-sm border border-border/50 overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full text-sm text-left">
                  <thead className="text-xs text-muted-foreground uppercase bg-slate-50 dark:bg-slate-950/50">
                    <tr>
                      <th className="px-6 py-4 font-bold tracking-wider">Timestamp</th>
                      <th className="px-6 py-4 font-bold tracking-wider">User</th>
                      <th className="px-6 py-4 font-bold tracking-wider">Action</th>
                      <th className="px-6 py-4 font-bold tracking-wider">Details</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-border/50">
                    {auditLogs.map((log) => (
                      <tr key={log.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/50 transition">
                        <td className="px-6 py-4 font-mono text-[11px] text-muted-foreground whitespace-nowrap">
                          {new Date(log.createdAt).toLocaleString()}
                        </td>
                        <td className="px-6 py-4">
                          <div className="font-semibold text-foreground">{log.user?.name}</div>
                          <div className="text-[10px] text-muted-foreground">{log.user?.email}</div>
                        </td>
                        <td className="px-6 py-4">
                          <Badge variant="outline" className="text-[10px] uppercase tracking-wider font-bold shadow-sm">
                            {log.action}
                          </Badge>
                        </td>
                        <td className="px-6 py-4">
                          <pre className="text-[10px] bg-slate-100 dark:bg-slate-950 p-2 rounded-lg text-slate-700 dark:text-slate-300 overflow-x-auto max-w-xs md:max-w-md">
                            {JSON.stringify(log.details, null, 2)}
                          </pre>
                        </td>
                      </tr>
                    ))}
                    {auditLogs.length === 0 && (
                      <tr>
                        <td colSpan={4} className="px-6 py-8 text-center text-muted-foreground">
                          No audit logs found or connected.
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </motion.div>
        )}

        {activeTab === "users" && (
          <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} className="space-y-6">
            <div className="bg-white dark:bg-slate-900 p-5 rounded-2xl border border-border/50 shadow-sm">
              <div className="flex items-center gap-3 mb-6">
                <div className="w-10 h-10 rounded-xl bg-slate-900 dark:bg-slate-100 flex items-center justify-center shadow-md">
                  <Users className="w-5 h-5 text-white dark:text-slate-900" />
                </div>
                <div className="flex-1 flex justify-between items-start">
                  <div>
                    <h2 className="font-bold font-serif text-lg text-foreground">Parishioner Directory</h2>
                    <p className="text-xs text-muted-foreground font-medium">Manage and search all registered parishioners and youth members.</p>
                  </div>
                  <button 
                    onClick={() => {
                      if (allUsers.length === 0) return;
                      const headers = ["ID", "Name", "Email", "Role", "Joined", "Stars", "XP", "Level"];
                      const csvContent = "data:text/csv;charset=utf-8," 
                        + headers.join(",") + "\n"
                        + allUsers.map(u => `${u.id},"${u.name}","${u.email}",${u.role},"${u.joined}",${u.stars || 0},${u.xp || 0},${u.level || 1}`).join("\n");
                      const encodedUri = encodeURI(csvContent);
                      const link = document.createElement("a");
                      link.setAttribute("href", encodedUri);
                      link.setAttribute("download", `ignite_users_${new Date().toISOString().split('T')[0]}.csv`);
                      document.body.appendChild(link);
                      link.click();
                      document.body.removeChild(link);
                    }}
                    className="text-xs bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 font-bold px-3 py-1.5 rounded-lg hover:bg-slate-200 transition-colors"
                  >
                    📥 Export CSV
                  </button>
                </div>
              </div>

              {/* Search Bar */}
              <div className="mb-6">
                <Input 
                  value={userSearchQuery}
                  onChange={e => setUserSearchQuery(e.target.value)}
                  placeholder="Search by name or email..."
                  className="bg-slate-50 dark:bg-slate-950 w-full"
                />
              </div>

              {/* Directory List */}
              <div className="space-y-4">
                {allUsers
                  .filter(u => 
                    u.name.toLowerCase().includes(userSearchQuery.toLowerCase()) || 
                    u.email.toLowerCase().includes(userSearchQuery.toLowerCase())
                  )
                  .map(user => (
                    <div key={user.id} className="p-4 bg-slate-50 dark:bg-slate-800/50 rounded-xl border border-border/50 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-full bg-slate-200 dark:bg-slate-700 flex items-center justify-center text-slate-600 dark:text-slate-300 font-bold">
                          {user.name.charAt(0)}
                        </div>
                        <div>
                          <div className="text-sm font-bold text-foreground flex items-center gap-2">
                            {user.name}
                            <Badge className={cn("text-[9px] font-bold border-0", 
                              user.role === "ADMIN" ? "bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400" : 
                              user.role === "LEADER" ? "bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-400" : 
                              "bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-400"
                            )}>
                              {user.status}
                            </Badge>
                          </div>
                          <p className="text-xs text-muted-foreground mt-0.5">{user.email}</p>
                          <p className="text-[10px] text-slate-400 mt-1">Joined: {user.joined} · ⭐ {user.stars} Stars</p>
                        </div>
                      </div>

                      <div className="flex gap-2 self-end sm:self-center">
                        <select
                          value=""
                          onChange={async (e) => {
                            const badgeId = e.target.value;
                            if (!badgeId) return;
                            const badge = badges.find(b => b.id === badgeId);
                            if (confirm(`Award ${badge?.name} to ${user.name}?`)) {
                              await handleAwardBadge(user.id, badgeId);
                              await fetchAllUsersData();
                            }
                          }}
                          className="text-xs bg-amber-50 dark:bg-amber-950 hover:bg-amber-100 px-3 py-1.5 rounded-lg text-amber-600 dark:text-amber-400 font-bold transition-colors cursor-pointer outline-none focus:ring-2 focus:ring-amber-500 appearance-none"
                        >
                          <option value="">+ Award Badge</option>
                          {badges.map(b => {
                            const hasBadge = user.badges?.find((ub: any) => ub.badgeId === b.id || ub.id === b.id);
                            if (hasBadge) return null; // Don't show badges they already have
                            return (
                              <option key={b.id} value={b.id}>{b.imageUrl} {b.name}</option>
                            );
                          })}
                        </select>
                        <button 
                          onClick={() => setSelectedUserForBadges(user)}
                          className="text-xs bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 px-3 py-1.5 rounded-lg text-slate-700 dark:text-slate-300 font-bold transition-colors"
                        >
                          Manage
                        </button>
                        {isSuperAdmin && (
                          <>
                            <button 
                              onClick={async () => {
                                const pts = prompt("How many Grace Points to grant?");
                                if (pts && !isNaN(Number(pts))) {
                                  const reason = prompt("Reason for grant?");
                                  if (reason) {
                                    const res = await awardGracePoints(user.id, Number(pts), reason);
                                    if (res.success) {
                                      alert("Points granted!");
                                      await fetchAllUsersData();
                                    } else {
                                      alert(res.error);
                                    }
                                  }
                                }
                              }}
                              className="text-xs bg-emerald-50 dark:bg-emerald-950 hover:bg-emerald-100 px-3 py-1.5 rounded-lg text-emerald-600 dark:text-emerald-400 font-bold transition-colors"
                            >
                              Grant XP
                            </button>
                            <select
                              value={user.role}
                              onChange={async (e) => {
                                const newRole = e.target.value;
                                if (confirm(`Change ${user.name}'s role to ${newRole}?`)) {
                                  const res = await updateUserRole(user.id, newRole);
                                  if (res.success) {
                                    await fetchAllUsersData();
                                    await fetchDashboardData();
                                  } else {
                                    alert(res.error);
                                  }
                                }
                              }}
                              className="text-xs bg-indigo-50 dark:bg-indigo-950 hover:bg-indigo-100 px-3 py-1.5 rounded-lg text-indigo-600 dark:text-indigo-400 font-bold transition-colors cursor-pointer outline-none focus:ring-2 focus:ring-indigo-500 appearance-none"
                            >
                              <option value="MEMBER">Role: MEMBER</option>
                              <option value="LEADER">Role: LEADER</option>
                              <option value="PRIEST">Role: PRIEST</option>
                              <option value="ADMIN">Role: ADMIN</option>
                            </select>
                            <button 
                              onClick={async () => {
                                if (confirm(`Log in as ${user.name}?`)) {
                                  const res = await loginAsUser(user.id);
                                  if (res.success) {
                                    window.location.href = "/dashboard";
                                  } else {
                                    alert(res.error);
                                  }
                                }
                              }}
                              className="text-xs bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 px-3 py-1.5 rounded-lg text-slate-700 dark:text-slate-300 font-bold transition-colors"
                            >
                              Login As
                            </button>
                            <button 
                              onClick={async () => {
                                if (confirm(`Delete ${user.name} completely? This cannot be undone.`)) {
                                  const res = await deleteUser(user.id);
                                  if (res.success) {
                                    await fetchAllUsersData();
                                    await fetchDashboardData();
                                  } else {
                                    alert(res.error);
                                  }
                                }
                              }}
                              className="text-xs bg-red-50 dark:bg-red-950 hover:bg-red-100 px-3 py-1.5 rounded-lg text-red-600 dark:text-red-400 font-bold transition-colors"
                            >
                              Delete
                            </button>
                            <button 
                              onClick={async () => {
                                if (confirm(`${user.isBanned ? 'Unban' : 'Ban'} ${user.name}?`)) {
                                  const res = await toggleBanUser(user.id);
                                  if (res.success) {
                                    alert(`User is now ${res.isBanned ? 'banned' : 'unbanned'}.`);
                                    await fetchAllUsersData();
                                  } else {
                                    alert(res.error);
                                  }
                                }
                              }}
                              className="text-xs bg-orange-50 dark:bg-orange-950 hover:bg-orange-100 px-3 py-1.5 rounded-lg text-orange-600 dark:text-orange-400 font-bold transition-colors"
                            >
                              {user.isBanned ? 'Unban' : 'Ban'}
                            </button>
                          </>
                        )}
                      </div>
                    </div>
                  ))}
              </div>
            </div>
          </motion.div>
        )}

        {activeTab === "trivia" && (
          <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} className="space-y-6">
            <div className="bg-white dark:bg-slate-900 p-5 rounded-2xl border border-border/50 shadow-sm">
              <div className="flex items-center gap-3 mb-6">
                <div className="w-10 h-10 rounded-xl bg-slate-900 dark:bg-slate-100 flex items-center justify-center shadow-md">
                  <BookOpen className="w-5 h-5 text-white dark:text-slate-900" />
                </div>
                <div className="flex-1">
                  <h2 className="font-bold font-serif text-lg text-foreground">Trivia Question Bank</h2>
                  <p className="text-xs text-muted-foreground font-medium">Browse, search, and verify all 500 questions loaded from the text bank.</p>
                </div>
              </div>

              {/* Search Bar */}
              <div className="mb-6">
                <Input 
                  value={triviaSearchQuery}
                  onChange={e => {
                    setTriviaSearchQuery(e.target.value);
                    setTriviaPage(1); // Reset to page 1 on search
                  }}
                  placeholder="Search questions or answers..."
                  className="bg-slate-50 dark:bg-slate-950 w-full"
                />
              </div>

              {/* Questions List with Pagination */}
              {(() => {
                const filteredQuestions = TRIVIA_QUESTIONS.filter(q => 
                  q.q.toLowerCase().includes(triviaSearchQuery.toLowerCase()) || 
                  q.a.toLowerCase().includes(triviaSearchQuery.toLowerCase()) ||
                  q.options.some(o => o.toLowerCase().includes(triviaSearchQuery.toLowerCase()))
                );

                const itemsPerPage = 10;
                const totalPages = Math.ceil(filteredQuestions.length / itemsPerPage);
                const startIndex = (triviaPage - 1) * itemsPerPage;
                const paginatedQuestions = filteredQuestions.slice(startIndex, startIndex + itemsPerPage);

                return (
                  <div className="space-y-4">
                    {paginatedQuestions.map((q, idx) => (
                      <div key={idx} className="p-4 bg-slate-50 dark:bg-slate-800/50 rounded-xl border border-border/50">
                        <p className="font-bold text-sm text-foreground mb-3 font-serif">
                          {startIndex + idx + 1}. {q.q}
                        </p>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                          {q.options.map(opt => {
                            const isCorrect = opt === q.a;
                            return (
                              <div 
                                key={opt}
                                className={cn(
                                  "p-2.5 rounded-lg border text-xs font-semibold flex items-center justify-between",
                                  isCorrect 
                                    ? "bg-green-50 border-green-200 text-green-700 dark:bg-green-950/20 dark:border-green-800 dark:text-green-400" 
                                    : "bg-white border-border/50 text-slate-600 dark:bg-slate-900 dark:text-slate-400"
                                )}
                              >
                                <span>{opt}</span>
                                {isCorrect && <span className="text-[10px] bg-green-500 text-white px-1.5 py-0.5 rounded-full font-bold">Correct</span>}
                              </div>
                            );
                          })}
                        </div>
                      </div>
                    ))}

                    {/* Pagination Controls */}
                    {totalPages > 1 && (
                      <div className="flex items-center justify-between pt-4 border-t border-border/50 mt-6 flex-wrap gap-3">
                        <p className="text-xs text-muted-foreground font-medium">
                          Showing {startIndex + 1}–{Math.min(startIndex + itemsPerPage, filteredQuestions.length)} of {filteredQuestions.length} questions
                        </p>
                        <div className="flex gap-2">
                          <button
                            disabled={triviaPage === 1}
                            onClick={() => setTriviaPage(prev => Math.max(1, prev - 1))}
                            className="px-3 py-1.5 bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 rounded-lg text-xs font-bold disabled:opacity-50 transition-colors"
                          >
                            Previous
                          </button>
                          <button
                            disabled={triviaPage === totalPages}
                            onClick={() => setTriviaPage(prev => Math.min(totalPages, prev + 1))}
                            className="px-3 py-1.5 bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 rounded-lg text-xs font-bold disabled:opacity-50 transition-colors"
                          >
                            Next
                          </button>
                        </div>
                      </div>
                    )}
                  </div>
                );
              })()}
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
          <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* ── Post Notice Board Announcement Panel ── */}
              <div className="bg-white dark:bg-slate-900 p-5 rounded-2xl border border-border/50 shadow-sm flex flex-col justify-between">
                <div>
                  <div className="flex items-center gap-3 mb-4">
                    <div className="w-10 h-10 rounded-xl gradient-royal text-white flex items-center justify-center shadow-md">
                      <Send className="w-5 h-5" />
                    </div>
                    <div>
                      <h2 className="font-bold font-serif text-lg">Post Notice Board</h2>
                      <p className="text-xs text-muted-foreground">Broadcast an announcement to the Notice Board and send push alert.</p>
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
                  </div>
                </div>
                
                <button 
                  onClick={handlePostNotice}
                  disabled={noticeStatus === "loading" || !noticeTitle || !noticeContent}
                  className="w-full h-12 rounded-xl gradient-royal text-white font-bold flex items-center justify-center gap-2 shadow-md hover:opacity-90 transition-opacity disabled:opacity-50 mt-4"
                >
                  {noticeStatus === "loading" ? <Loader2 className="w-5 h-5 animate-spin" /> : 
                   noticeStatus === "success" ? <CheckCircle2 className="w-5 h-5" /> :
                   <Send className="w-4 h-4" />}
                  {noticeStatus === "success" ? "Posted Successfully!" : "Broadcast Notice"}
                </button>
              </div>

              {/* ── Send Direct Push Notification Panel ── */}
              <div className="bg-white dark:bg-slate-900 p-5 rounded-2xl border border-border/50 shadow-sm flex flex-col justify-between">
                <div>
                  <div className="flex items-center gap-3 mb-4">
                    <div className="w-10 h-10 rounded-xl bg-amber-600 text-white flex items-center justify-center shadow-md">
                      <BellRing className="w-5 h-5" />
                    </div>
                    <div>
                      <h2 className="font-bold font-serif text-lg">Send Direct Push Alert</h2>
                      <p className="text-xs text-muted-foreground">Send a direct lockscreen alert. This will NOT be saved to the Notice Board.</p>
                    </div>
                  </div>
                  
                  <div className="space-y-4">
                    <div>
                      <label className="text-xs font-bold text-muted-foreground uppercase tracking-widest mb-1.5 block">Alert Title</label>
                      <Input value={directTitle} onChange={e => setDirectTitle(e.target.value)} placeholder="e.g. Daily Devotion Ready!" className="bg-slate-50 dark:bg-slate-950" />
                    </div>
                    <div>
                      <label className="text-xs font-bold text-muted-foreground uppercase tracking-widest mb-1.5 block">Target Audience</label>
                      <select 
                        value={directTarget} 
                        onChange={e => setDirectTarget(e.target.value)}
                        className="w-full bg-slate-50 dark:bg-slate-950 border border-border/50 rounded-md px-3 py-2 text-sm"
                      >
                        <option value="ALL">Everyone</option>
                        <option value="MEMBER">Members Only</option>
                        <option value="LEADER">Leaders Only</option>
                        <option value="ADMIN">Admins Only</option>
                      </select>
                    </div>
                    <div>
                      <label className="text-xs font-bold text-muted-foreground uppercase tracking-widest mb-1.5 block">Alert Message</label>
                      <Textarea value={directMessage} onChange={e => setDirectMessage(e.target.value)} placeholder="e.g. Today's scripture reading is now live. Check it out!" className="bg-slate-50 dark:bg-slate-950 min-h-[120px]" />
                    </div>
                  </div>
                </div>
                
                <button 
                  onClick={handleSendDirectPush}
                  disabled={directStatus === "loading" || !directTitle || !directMessage}
                  className="w-full h-12 rounded-xl bg-amber-600 hover:bg-amber-700 text-white font-bold flex items-center justify-center gap-2 shadow-md hover:opacity-90 transition-opacity disabled:opacity-50 mt-4"
                >
                  {directStatus === "loading" ? <Loader2 className="w-5 h-5 animate-spin" /> : 
                   directStatus === "success" ? <CheckCircle2 className="w-5 h-5" /> :
                   <BellRing className="w-4 h-4" />}
                  {directStatus === "success" ? "Sent Successfully!" : "Send Direct Push"}
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

            {/* ── Badges Management ── */}
            <div className="bg-white dark:bg-slate-900 p-5 rounded-2xl border border-border/50 shadow-sm">
              <h2 className="text-lg font-bold text-foreground mb-4">Badges & Medals</h2>
              
              <div className="space-y-4 mb-6">
                <Input value={newBadgeName} onChange={e => setNewBadgeName(e.target.value)} placeholder="Badge Name (e.g. Gospel Pilgrim)" />
                <Input value={newBadgeDesc} onChange={e => setNewBadgeDesc(e.target.value)} placeholder="Description (e.g. Read all Gospels)" />
                <Input value={newBadgeUrl} onChange={e => setNewBadgeUrl(e.target.value)} placeholder="Emoji Icon or Image URL (defaults to 🏅)" />
                <button onClick={handleCreateBadge} disabled={creatingBadge} className="px-4 py-2 bg-slate-900 text-white rounded-lg text-sm font-bold w-full">
                  {creatingBadge ? "Adding..." : "Add Badge"}
                </button>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {badges.map(b => (
                  <div key={b.id} className="p-4 border rounded-xl flex items-center justify-between bg-slate-50 dark:bg-slate-950">
                    <div className="flex items-center gap-3">
                      <span className="text-3xl">{b.imageUrl && b.imageUrl.length < 5 ? b.imageUrl : "🏅"}</span>
                      <div>
                        <p className="text-sm font-bold">{b.name}</p>
                        <p className="text-xs text-muted-foreground">{b.description}</p>
                      </div>
                    </div>
                    <button onClick={() => handleDeleteBadge(b.id)} className="text-red-500 text-xs font-bold hover:underline shrink-0 ml-2">
                      Delete
                    </button>
                  </div>
                ))}
              </div>
            </div>

            {/* ── Custom Quizzes ── */}
            <div className="bg-white dark:bg-slate-900 p-5 rounded-2xl border border-border/50 shadow-sm">
              <h2 className="text-lg font-bold text-foreground mb-4">Custom Parish Quizzes</h2>
              <p className="text-xs text-muted-foreground mb-4">Create a custom quiz exclusively for your parish members.</p>
              
              <div className="space-y-4 mb-6 bg-slate-50 dark:bg-slate-950 p-4 rounded-xl border border-border/50">
                <Input value={newQuizTitle} onChange={e => setNewQuizTitle(e.target.value)} placeholder="Quiz Title (e.g. Parish History)" className="bg-white dark:bg-slate-900" />
                <Input value={newQuizDesc} onChange={e => setNewQuizDesc(e.target.value)} placeholder="Description (e.g. Weekly Sunday School Quiz)" className="bg-white dark:bg-slate-900" />
                
                <div className="pt-2 border-t border-border/50">
                  <p className="text-xs font-bold text-muted-foreground mb-3">Add Question</p>
                  <Input value={newQuizQuestion} onChange={e => setNewQuizQuestion(e.target.value)} placeholder="Question Text" className="mb-2 bg-white dark:bg-slate-900" />
                  <Input value={newQuizAnswer} onChange={e => setNewQuizAnswer(e.target.value)} placeholder="Correct Answer" className="mb-2 border-green-500 bg-white dark:bg-slate-900" />
                  <Input value={newQuizOption1} onChange={e => setNewQuizOption1(e.target.value)} placeholder="Wrong Option 1" className="mb-2 bg-white dark:bg-slate-900" />
                  <Input value={newQuizOption2} onChange={e => setNewQuizOption2(e.target.value)} placeholder="Wrong Option 2" className="mb-2 bg-white dark:bg-slate-900" />
                  <Input value={newQuizOption3} onChange={e => setNewQuizOption3(e.target.value)} placeholder="Wrong Option 3" className="mb-3 bg-white dark:bg-slate-900" />
                </div>

                <button onClick={handleCreateQuiz} disabled={creatingQuiz} className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg text-sm font-bold w-full shadow-md transition-colors">
                  {creatingQuiz ? "Creating..." : "Publish Custom Quiz"}
                </button>
              </div>
            </div>

            {/* ── Spiritual Missions View ── */}
            <div className="bg-white dark:bg-slate-900 p-5 rounded-2xl border border-border/50 shadow-sm">
              <h2 className="text-lg font-bold text-foreground mb-4">Active Spiritual Missions</h2>
              <p className="text-xs text-muted-foreground mb-4">Active missions youth can complete to earn Grace Points.</p>
              
              <div className="space-y-3">
                {missions.map(m => (
                  <div key={m.id} className="p-4 border rounded-xl flex items-center justify-between bg-slate-50 dark:bg-slate-950">
                    <div>
                      <p className="font-bold text-sm text-foreground flex items-center gap-2">⚔️ {m.title}</p>
                      <p className="text-xs text-muted-foreground mt-1">{m.description}</p>
                    </div>
                    <Badge className="bg-amber-100 text-amber-800 dark:bg-amber-900/30 dark:text-amber-300 font-bold shrink-0 ml-3 border-0">
                      +{m.xpReward} GP
                    </Badge>
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

      {/* Badge Management Modal */}
      {selectedUserForBadges && (
        <div className="fixed inset-0 z-[100] bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white dark:bg-slate-900 rounded-2xl w-full max-w-md overflow-hidden shadow-2xl">
            <div className="p-5 border-b border-border/50 flex items-center justify-between">
              <h3 className="font-bold font-serif text-lg text-foreground">Manage Badges</h3>
              <button onClick={() => setSelectedUserForBadges(null)} className="text-slate-400 hover:text-slate-600">✕</button>
            </div>
            <div className="p-5">
              <p className="text-xs text-muted-foreground mb-4">Editing badges for <span className="font-bold text-foreground">{selectedUserForBadges.name}</span></p>
              <div className="space-y-3 max-h-[60vh] overflow-y-auto pr-2">
                {badges.length === 0 ? (
                  <p className="text-sm text-muted-foreground text-center py-4">No badges exist in the system yet. Create them in the Content tab.</p>
                ) : (
                  badges.map(b => {
                    const hasBadge = selectedUserForBadges.badges?.find((ub: any) => ub.id === b.id);
                    return (
                      <div key={b.id} className="flex items-center justify-between p-3 rounded-xl border border-border/50 bg-slate-50 dark:bg-slate-800/50">
                        <div className="flex items-center gap-3">
                          <div className="text-2xl">{b.imageUrl}</div>
                          <div>
                            <p className="text-sm font-bold text-foreground leading-none">{b.name}</p>
                            <p className="text-[10px] text-muted-foreground mt-1">{b.description}</p>
                          </div>
                        </div>
                        <button
                          onClick={async () => {
                            if (hasBadge) {
                              await handleRevokeBadge(selectedUserForBadges.id, b.id);
                              setSelectedUserForBadges({...selectedUserForBadges, badges: selectedUserForBadges.badges.filter((x:any) => x.id !== b.id)});
                            } else {
                              await handleAwardBadge(selectedUserForBadges.id, b.id);
                              setSelectedUserForBadges({...selectedUserForBadges, badges: [...(selectedUserForBadges.badges || []), b]});
                            }
                          }}
                          className={cn("px-3 py-1.5 rounded-lg text-xs font-bold transition-colors", hasBadge ? "bg-red-100 text-red-600 hover:bg-red-200" : "bg-green-100 text-green-700 hover:bg-green-200")}
                        >
                          {hasBadge ? "Revoke" : "Award"}
                        </button>
                      </div>
                    );
                  })
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
