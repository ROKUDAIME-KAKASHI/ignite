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
} from "@/app/admin/actions";
import { getMessages, deleteMessage as deleteGlobalMessage } from "@/app/actions/globalChat";
import { TRIVIA_QUESTIONS } from "@/lib/trivia";
import { getMissions } from "@/app/missions/actions";
import { useRouter } from "next/navigation";

export default function PriestDashboardPage() {
  const router = useRouter();
  const isSuperAdmin = false;

  const [activeTab, setActiveTab] = useState<"users" | "prayers" | "notices" | "events" | "appointments" | "moderation" | "knowledge">("users");
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
              <h1 className="text-xl font-bold text-foreground">Priest Dashboard</h1>
              <p className="text-xs text-muted-foreground font-medium">Manage Your Parish</p>
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
          {(["users", "appointments", "notices", "events", "knowledge", "moderation"] as const).map(t => (
            <button key={t} onClick={() => setActiveTab(t)} className={cn(
              "flex-1 py-2.5 px-4 text-xs font-bold uppercase tracking-wider rounded-lg transition whitespace-nowrap snap-center",
              activeTab === t ? "bg-slate-900 text-white dark:bg-slate-100 dark:text-slate-900 shadow-md scale-[1.02]" : "bg-transparent text-slate-500 hover:bg-slate-100 hover:text-slate-800 dark:hover:bg-slate-800 dark:hover:text-slate-200"
            )}>
              {t} 
              {t === "appointments" && appointments.filter(a => a.status === "PENDING").length > 0 && (
                <span className="ml-2 bg-amber-500 text-white px-2 py-0.5 rounded-full text-[10px] shadow-sm">{appointments.filter(a => a.status === "PENDING").length}</span>
              )}
              {t === "users" && allUsers.length > 0 && (
                <span className="ml-2 bg-blue-500 text-white px-2 py-0.5 rounded-full text-[10px] shadow-sm">{allUsers.length}</span>
              )}
            </button>
          ))}
        </div>

        
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
                <div className="overflow-x-auto w-full">
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
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
                  </div>
              </div>
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

        

                
      </div>

      
    </div>
  );
}
