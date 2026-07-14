"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { ChevronLeft, Lock, Star, Map, BookOpen, CheckCircle2, ChevronRight, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { cn } from "@/lib/utils";
import { getJourneys, enrollCourse, completeNode } from "./actions";
import { useAuth } from "@/context/AuthContext";

export default function JourneysPage() {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState<"map" | "library">("map");
  const [courses, setCourses] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedNode, setSelectedNode] = useState<any | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [activeCourseId, setActiveCourseId] = useState<string | null>(null);
  const { refreshUser } = useAuth();

  const fetchJourneys = async () => {
    const data = await getJourneys();
    setCourses(data);
    if (!activeCourseId && data.length > 0) {
      // Find the first course with progress, else fallback to the first course
      const inProgress = data.find(c => c.completedNodes > 0);
      setActiveCourseId(inProgress ? inProgress.id : data[0].id);
    }
  };

  useEffect(() => {
    fetchJourneys().then(() => setIsLoading(false));
  }, []);

  const handleEnroll = async (courseId: string) => {
    setIsProcessing(true);
    await enrollCourse(courseId);
    await fetchJourneys();
    setActiveCourseId(courseId);
    setActiveTab("map");
    setIsProcessing(false);
  };

  const handleCompleteNode = async () => {
    if (!selectedNode) return;
    setIsProcessing(true);
    await completeNode(selectedNode.id);
    await fetchJourneys();
    setSelectedNode(null);
    setIsProcessing(false);
    refreshUser(); // Sync points across app
  };

  if (isLoading) {
    return (
      <div className="flex-1 flex flex-col h-full bg-background items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-emerald-700" />
      </div>
    );
  }

  // Active course defaults to the selected activeCourseId
  const activeCourse = courses.find(c => c.id === activeCourseId) || courses[0];
  const maxStars = activeCourse?.totalNodes * 3 || 0;

  return (
    <div className="flex-1 flex flex-col h-full bg-background">
      {/* ── Header ── */}
      <div className="relative overflow-hidden px-5 pt-8 pb-10 bg-gradient-to-br from-emerald-800 to-green-700 shadow-md">
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
              <Map className="w-5 h-5" />
            </div>
            <div>
              <h1 className="text-2xl font-extrabold text-white font-serif">Biblical Journeys</h1>
              <p className="text-green-200 text-xs font-bold uppercase tracking-wider">Deepen your knowledge</p>
            </div>
          </div>
          {activeCourse && (
            <div className="flex gap-2 mt-4">
              <Badge className="bg-white/20 text-white border-0 backdrop-blur-sm hover:bg-white/30">{activeCourse.icon} {activeCourse.title}</Badge>
              <Badge className="bg-white/20 text-white border-0 backdrop-blur-sm hover:bg-white/30">⭐ {activeCourse.earnedStars}/{maxStars} Stars</Badge>
            </div>
          )}
        </div>
      </div>

      {/* Tabs */}
      <div className="flex gap-1 bg-muted p-1 m-4 rounded-xl">
        <button
          onClick={() => setActiveTab("map")}
          className={cn(
            "flex-1 py-2 text-sm font-semibold rounded-lg transition duration-200",
            activeTab === "map" ? "bg-card text-emerald-700 shadow-sm" : "text-muted-foreground"
          )}
        >
          Path Map
        </button>
        <button
          onClick={() => setActiveTab("library")}
          className={cn(
            "flex-1 py-2 text-sm font-semibold rounded-lg transition duration-200",
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
              {activeCourse?.nodes.map((node: any, index: number) => {
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
                      onClick={() => {
                        if (node.status !== "locked") {
                          setSelectedNode(node);
                        }
                      }}
                      whileHover={node.status !== "locked" ? { scale: 1.1 } : {}}
                      whileTap={node.status !== "locked" ? { scale: 0.95 } : {}}
                      className={cn(
                        "w-16 h-16 rounded-full flex items-center justify-center shrink-0 border-4 border-[#fdfbf7] transition",
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
          
          {courses.map((course) => (
            <div key={course.id} className="bg-card rounded-2xl border border-border/60 card-holy p-4 flex gap-4">
              <div className={cn("w-16 h-16 rounded-2xl bg-gradient-to-br flex items-center justify-center text-3xl shadow-inner shrink-0", course.color)}>
                {course.icon}
              </div>
              <div className="flex-1">
                <h3 className="font-bold text-foreground font-serif">{course.title}</h3>
                <p className="text-xs text-muted-foreground mt-0.5 mb-3 line-clamp-1">{course.description}</p>
                <div className="flex items-center justify-between">
                  <span className="text-[10px] font-bold text-muted-foreground uppercase">{course.completedNodes} / {course.totalNodes} Lessons</span>
                  {course.completedNodes > 0 ? (
                    <Button size="sm" onClick={() => { setActiveCourseId(course.id); setActiveTab("map"); }} className="h-7 text-xs rounded-lg">
                      Continue
                    </Button>
                  ) : (
                    <Button size="sm" variant="outline" onClick={() => handleEnroll(course.id)} disabled={isProcessing} className="h-7 text-xs rounded-lg">
                      {isProcessing ? "..." : "Enroll"}
                    </Button>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Node Content Modal */}
      {selectedNode && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
          <motion.div 
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            className="bg-white dark:bg-slate-900 rounded-3xl p-6 w-full max-w-sm shadow-2xl relative overflow-hidden"
          >
            {selectedNode.status === "completed" && (
              <div className="absolute top-0 left-0 right-0 h-2 bg-emerald-500" />
            )}
            
            <button 
              onClick={() => setSelectedNode(null)}
              className="absolute top-4 right-4 w-8 h-8 flex items-center justify-center rounded-full bg-slate-100 dark:bg-slate-800 text-slate-500 hover:text-slate-700"
            >
              ✕
            </button>

            <div className="mt-4 mb-2 flex items-center gap-2 text-emerald-600 dark:text-emerald-400">
              {selectedNode.type === "read" ? <BookOpen className="w-5 h-5" /> : <Star className="w-5 h-5" />}
              <span className="text-xs font-bold uppercase tracking-wider">{selectedNode.type}</span>
            </div>

            <h2 className="text-2xl font-black font-serif text-slate-900 dark:text-white mb-2">
              {selectedNode.title}
            </h2>
            
            <p className="text-slate-600 dark:text-slate-300 mb-8 text-sm leading-relaxed">
              {selectedNode.content}
            </p>

            {selectedNode.status === "completed" ? (
              <div className="flex items-center justify-center gap-2 p-3 bg-emerald-50 dark:bg-emerald-900/20 text-emerald-700 dark:text-emerald-400 rounded-xl font-bold">
                <CheckCircle2 className="w-5 h-5" /> Completed
              </div>
            ) : (
              <div className="space-y-3">
                {selectedNode.type === "read" && (
                  <Button 
                    onClick={() => {
                      // Basic heuristic to jump to the bible
                      router.push("/bible");
                    }} 
                    variant="outline"
                    className="w-full h-12 rounded-xl text-emerald-700 dark:text-emerald-400 border-emerald-200 dark:border-emerald-900 hover:bg-emerald-50 dark:hover:bg-emerald-900/20 font-bold text-base"
                  >
                    <BookOpen className="w-4 h-4 mr-2" /> Start Reading
                  </Button>
                )}
                <Button 
                  onClick={handleCompleteNode} 
                  disabled={isProcessing}
                  className="w-full h-12 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-lg shadow-lg shadow-emerald-500/20"
                >
                  {isProcessing ? <Loader2 className="w-5 h-5 animate-spin" /> : "Complete Step"}
                </Button>
              </div>
            )}
          </motion.div>
        </div>
      )}
    </div>
  );
}
