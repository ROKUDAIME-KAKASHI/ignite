"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ChevronLeft, MessageCircleQuestion, Send, ShieldCheck, User, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useRouter } from "next/navigation";
import { cn } from "@/lib/utils";
import { askQuestion, getMentorshipQuestions } from "./actions";

type Question = {
  id: string;
  text: string;
  answer: string | null;
  answeredBy: string | null;
  isAnonymous: boolean;
  createdAt: Date;
  askedBy: string;
};


export default function MentorshipPage() {
  const router = useRouter();
  const [questions, setQuestions] = useState<Question[]>([]);
  const [newQuestion, setNewQuestion] = useState("");
  const [isAnonymous, setIsAnonymous] = useState(false);
  const [activeTab, setActiveTab] = useState<"all" | "my">("all");
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    getMentorshipQuestions().then(data => {
      setQuestions(data);
      setIsLoading(false);
    });
  }, []);

  const handleSubmit = async () => {
    if (newQuestion.trim().length < 10 || isSubmitting) return;
    
    setIsSubmitting(true);
    const res = await askQuestion(newQuestion, isAnonymous);
    
    if (res.success && res.question) {
      setQuestions([res.question, ...questions]);
      setNewQuestion("");
      setActiveTab("my");
    } else {
      alert(res.error || "Failed to ask question");
    }
    setIsSubmitting(false);
  };

  return (
    <div className="flex-1 flex flex-col min-h-screen bg-slate-50">
      
      {/* ── Header ── */}
      <div className="relative overflow-hidden px-5 pt-8 pb-10 bg-gradient-to-br from-indigo-900 to-slate-800 shadow-md sticky top-0 z-20">
        <svg viewBox="0 0 200 200" className="absolute right-0 top-0 w-48 h-48 opacity-10 text-white" fill="none" stroke="currentColor" strokeWidth="6">
          <circle cx="100" cy="100" r="80" />
        </svg>
        <div className="relative z-10">
          <div className="flex items-center gap-3 mb-2">
            <button onClick={() => router.back()} className="w-10 h-10 rounded-xl bg-white/10 flex items-center justify-center hover:bg-white/20 transition-colors">
              <ChevronLeft className="w-5 h-5 text-white" />
            </button>
            <div className="w-10 h-10 rounded-xl bg-white/20 backdrop-blur-sm flex items-center justify-center text-white">
              <MessageCircleQuestion className="w-5 h-5" />
            </div>
            <div>
              <h1 className="text-xl font-extrabold text-white font-serif">Ask a Priest</h1>
              <p className="text-indigo-200 text-xs font-bold uppercase tracking-wider">Mentorship Hub</p>
            </div>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex gap-1 bg-white p-1 m-4 rounded-xl shadow-sm border border-slate-200">
        <button
          onClick={() => setActiveTab("all")}
          className={cn(
            "flex-1 py-2.5 text-sm font-bold rounded-lg transition-all duration-200",
            activeTab === "all" ? "bg-indigo-50 text-indigo-700" : "text-slate-500"
          )}
        >
          Recent Answers
        </button>
        <button
          onClick={() => setActiveTab("my")}
          className={cn(
            "flex-1 py-2.5 text-sm font-bold rounded-lg transition-all duration-200",
            activeTab === "my" ? "bg-indigo-50 text-indigo-700" : "text-slate-500"
          )}
        >
          My Questions
        </button>
      </div>

      <div className="flex-1 p-4 pb-32 overflow-y-auto">
        <div className="space-y-4">
          <AnimatePresence>
            {questions
              .filter(q => activeTab === "all" ? q.answer !== null : true)
              .map(q => (
              <motion.div 
                key={q.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-sm"
              >
                {/* Question */}
                <div className="p-4 bg-slate-50 border-b border-slate-100">
                  <div className="flex items-center gap-2 mb-2">
                    <div className="w-6 h-6 rounded-full bg-slate-200 flex items-center justify-center">
                      <User className="w-3 h-3 text-slate-500" />
                    </div>
                    <span className="text-xs font-bold text-slate-500">
                      {q.askedBy}
                    </span>
                    <span className="text-[10px] text-slate-400 ml-auto">
                      {new Date(q.createdAt).toLocaleDateString()}
                    </span>
                  </div>
                  <p className="text-sm font-semibold text-slate-900 leading-relaxed">{q.text}</p>
                </div>

                {/* Answer */}
                <div className="p-4">
                  {q.answer ? (
                    <div>
                      <div className="flex items-center gap-2 mb-2">
                        <ShieldCheck className="w-4 h-4 text-indigo-600" />
                        <span className="text-xs font-bold text-indigo-700 uppercase tracking-wide">
                          Answered by {q.answeredBy}
                        </span>
                      </div>
                      <p className="text-sm text-slate-700 leading-relaxed">{q.answer}</p>
                    </div>
                  ) : (
                    <div className="flex items-center gap-2 text-amber-600">
                      <div className="w-2 h-2 rounded-full bg-amber-500 animate-pulse" />
                      <span className="text-xs font-bold uppercase tracking-wide">Awaiting Response</span>
                    </div>
                  )}
                </div>
              </motion.div>
            ))}
          </AnimatePresence>
        </div>
      </div>

      {/* Input Box */}
      <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-slate-200 p-4 pb-[5.5rem] md:pb-safe z-30">
        <div className="max-w-3xl mx-auto flex flex-col gap-2">
          <div className="flex items-center gap-2 px-2">
            <input 
              type="checkbox" 
              id="anon" 
              checked={isAnonymous} 
              onChange={e => setIsAnonymous(e.target.checked)}
              className="rounded text-indigo-600 focus:ring-indigo-500 w-3.5 h-3.5 border-slate-300"
            />
            <label htmlFor="anon" className="text-xs font-semibold text-slate-500 cursor-pointer">Ask anonymously</label>
          </div>
          <div className="flex items-end gap-2">
            <textarea
              value={newQuestion}
              onChange={e => setNewQuestion(e.target.value)}
              placeholder="Ask a question about faith, scripture, or struggles..."
              className="flex-1 bg-slate-50 border border-slate-200 rounded-2xl p-3 text-sm focus:outline-none focus:border-indigo-400 focus:ring-1 focus:ring-indigo-400 resize-none"
              rows={2}
            />
            <Button 
              onClick={handleSubmit}
              disabled={newQuestion.trim().length < 10 || isSubmitting}
              className="h-12 w-12 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white shrink-0 shadow-md flex items-center justify-center"
            >
              {isSubmitting ? <Loader2 className="w-5 h-5 animate-spin" /> : <Send className="w-5 h-5" />}
            </Button>
          </div>
        </div>
      </div>
      
    </div>
  );
}
