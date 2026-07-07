"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { ChevronLeft, Lock, Star, Map, BookOpen, CheckCircle2, ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { cn } from "@/lib/utils";

const JOURNEY_NODES = [
  { id: 1, title: "The Incarnation", type: "read", status: "completed", stars: 3 },
  { id: 2, title: "Sermon on the Mount", type: "quiz", status: "completed", stars: 3 },
  { id: 3, title: "The Parables", type: "read", status: "current", stars: 0 },
  { id: 4, title: "The Bread of Life", type: "read", status: "locked", stars: 0 },
  { id: 5, title: "The Passion Narrative", type: "boss", status: "locked", stars: 0 },
];

export default function JourneysPage() {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState<"map" | "library">("map");

  return (
    <div className="flex-1 flex flex-col min-h-screen bg-[#fdfbf7]">
      {/* ── Header ── */}
      <div className="relative overflow-hidden px-5 pt-8 pb-10 bg-gradient-to-br from-emerald-800 to-green-700 shadow-md">
        <svg viewBox="0 0 200 200" className="absolute right-0 top-0 w-48 h-48 opacity-10 text-white" fill="none" stroke="currentColor" strokeWidth="6">
          <circle cx="100" cy="100" r="80" />
        </svg>
        <div className="relative z-10">
          <div className="flex items-center gap-3 mb-2">
            <div className="w-10 h-10 rounded-xl bg-white/20 backdrop-blur-sm flex items-center justify-center text-white">
              <Map className="w-5 h-5" />
            </div>
            <div>
              <h1 className="text-2xl font-extrabold text-white font-serif">Biblical Journeys</h1>
              <p className="text-green-200 text-xs font-bold uppercase tracking-wider">A Deep Dive into the Life of Christ</p>
            </div>
          </div>
          <div className="flex gap-2 mt-4">
            <Badge className="bg-white/20 text-white border-0 backdrop-blur-sm hover:bg-white/30">✝️ The Synoptic Gospels</Badge>
            <Badge className="bg-white/20 text-white border-0 backdrop-blur-sm hover:bg-white/30">⭐ 6/15 Stars</Badge>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex gap-1 bg-muted p-1 m-4 rounded-xl">
        <button
          onClick={() => setActiveTab("map")}
          className={cn(
            "flex-1 py-2 text-sm font-semibold rounded-lg transition-all duration-200",
            activeTab === "map" ? "bg-card text-emerald-700 shadow-sm" : "text-muted-foreground"
          )}
        >
          Path Map
        </button>
        <button
          onClick={() => setActiveTab("library")}
          className={cn(
            "flex-1 py-2 text-sm font-semibold rounded-lg transition-all duration-200",
            activeTab === "library" ? "bg-card text-emerald-700 shadow-sm" : "text-muted-foreground"
          )}
        >
          All Courses
        </button>
      </div>

      {activeTab === "map" ? (
        <div className="flex-1 p-4 pb-24 overflow-y-auto">
          <div className="max-w-md mx-auto relative">
            {/* The Path Line */}
            <div className="absolute left-1/2 top-4 bottom-4 w-2 bg-emerald-100 dark:bg-emerald-900/30 -translate-x-1/2 rounded-full z-0" />
            
            <div className="space-y-12 relative z-10 py-4">
              {JOURNEY_NODES.map((node, index) => {
                const isLeft = index % 2 === 0;
                
                let bgColor = "bg-muted text-muted-foreground";
                let icon = <Lock className="w-6 h-6" />;
                let shadow = "";
                
                if (node.status === "completed") {
                  bgColor = "bg-emerald-500 text-white";
                  icon = <CheckCircle2 className="w-6 h-6" />;
                  shadow = "shadow-lg shadow-emerald-500/30";
                } else if (node.status === "current") {
                  bgColor = "gradient-gold text-white halo-glow";
                  icon = node.type === "read" ? <BookOpen className="w-6 h-6" /> : <Star className="w-6 h-6" />;
                  shadow = "shadow-xl ring-4 ring-amber-500/20 ring-offset-2";
                }

                return (
                  <div key={node.id} className={cn("flex items-center gap-4", isLeft ? "flex-row" : "flex-row-reverse")}>
                    
                    {/* Node Content */}
                    <div className={cn("flex-1", isLeft ? "text-right" : "text-left")}>
                      <motion.div 
                        initial={{ opacity: 0, x: isLeft ? -20 : 20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: index * 0.1 }}
                      >
                        <h3 className={cn("font-bold font-serif text-sm", node.status === "locked" ? "text-muted-foreground" : "text-foreground")}>
                          {node.title}
                        </h3>
                        {node.status !== "locked" && (
                          <div className={cn("flex gap-0.5 mt-1", isLeft ? "justify-end" : "justify-start")}>
                            {[1, 2, 3].map(star => (
                              <Star key={star} className={cn("w-3 h-3", star <= node.stars ? "text-amber-500 fill-amber-500" : "text-slate-300")} />
                            ))}
                          </div>
                        )}
                      </motion.div>
                    </div>

                    {/* Node Button */}
                    <motion.button 
                      whileHover={node.status !== "locked" ? { scale: 1.1 } : {}}
                      whileTap={node.status !== "locked" ? { scale: 0.95 } : {}}
                      className={cn(
                        "w-16 h-16 rounded-full flex items-center justify-center shrink-0 border-4 border-[#fdfbf7] transition-all",
                        bgColor, shadow
                      )}
                    >
                      {icon}
                    </motion.button>
                    
                    <div className="flex-1" />
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      ) : (
        <div className="flex-1 p-6 space-y-4">
          <p className="text-sm text-muted-foreground mb-4">Enroll in a new biblical journey to deepen your knowledge of scripture and church history.</p>
          
          {[
            { title: "The Patriarchs", desc: "Genesis: The origin story of God's people.", progress: 5, total: 15, icon: "📖", color: "from-amber-500 to-orange-400" },
            { title: "The Synoptic Gospels", desc: "A deep dive into the life of Jesus Christ.", progress: 2, total: 5, icon: "✝️", color: "from-purple-500 to-indigo-400" },
            { title: "The Exodus Experience", desc: "Follow Moses and the Israelites out of Egypt.", progress: 0, total: 20, icon: "🌊", color: "from-blue-500 to-cyan-400" },
            { title: "Acts of the Apostles", desc: "The birth of the early church.", progress: 0, total: 15, icon: "🕊️", color: "from-rose-500 to-red-400" },
          ].map((course, i) => (
            <div key={i} className="bg-card rounded-2xl border border-border/60 card-holy p-4 flex gap-4">
              <div className={cn("w-16 h-16 rounded-2xl bg-gradient-to-br flex items-center justify-center text-3xl shadow-inner shrink-0", course.color)}>
                {course.icon}
              </div>
              <div className="flex-1">
                <h3 className="font-bold text-foreground font-serif">{course.title}</h3>
                <p className="text-xs text-muted-foreground mt-0.5 mb-3 line-clamp-1">{course.desc}</p>
                <div className="flex items-center justify-between">
                  <span className="text-[10px] font-bold text-muted-foreground uppercase">{course.progress} / {course.total} Lessons</span>
                  <Button size="sm" variant="outline" className="h-7 text-xs rounded-lg">Enroll</Button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
