"use client";

import { motion } from "framer-motion";
import { Badge } from "@/components/ui/badge";
import { Users, Activity, Heart, BookOpen, ShieldCheck, TrendingUp, AlertTriangle } from "lucide-react";
import { cn } from "@/lib/utils";

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
  { id: 1, type: "warning", message: "Firebase Auth rate limit approaching (85%)" },
  { id: 2, type: "info", message: "Database backup completed successfully at 03:00 AM" },
];

export default function AdminDashboardPage() {
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
                <motion.div 
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.1 }}
                  key={stat.label} 
                  className="bg-white dark:bg-slate-900 p-4 rounded-2xl border border-border/50 shadow-sm flex flex-col justify-between h-28"
                >
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
                </motion.div>
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

        {/* ── Quick Actions ── */}
        <div>
          <h2 className="text-sm font-bold text-slate-500 uppercase tracking-wider mb-3 px-1">Quick Actions</h2>
          <div className="grid grid-cols-2 gap-3">
            <button className="p-3 bg-white dark:bg-slate-900 rounded-xl border border-border/50 shadow-sm text-sm font-bold text-foreground hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors">
              Manage Content
            </button>
            <button className="p-3 bg-white dark:bg-slate-900 rounded-xl border border-border/50 shadow-sm text-sm font-bold text-foreground hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors">
              Send Broadcast
            </button>
            <button className="p-3 bg-white dark:bg-slate-900 rounded-xl border border-border/50 shadow-sm text-sm font-bold text-foreground hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors">
              Export Logs
            </button>
            <button className="p-3 bg-red-50 dark:bg-red-950/20 rounded-xl border border-red-200 dark:border-red-900/50 shadow-sm text-sm font-bold text-red-600 dark:text-red-400 hover:bg-red-100 dark:hover:bg-red-900/30 transition-colors">
              System Restart
            </button>
          </div>
        </div>
        
      </div>
    </div>
  );
}
