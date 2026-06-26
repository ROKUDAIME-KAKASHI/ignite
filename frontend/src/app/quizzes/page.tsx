"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { cn } from "@/lib/utils";
import { Trophy, ChevronRight, RotateCcw, CheckCircle2, XCircle } from "lucide-react";

/* ─── Quiz data ──────────────────────────────────────────────────────────── */
interface Question {
  id: number;
  type: "mcq" | "truefalse";
  question: string;
  options?: string[];
  answer: string | boolean;
  explanation: string;
  verse?: string;
}

const DAILY_QUIZ: Question[] = [
  {
    id: 1, type: "mcq",
    question: "Which Gospel is the shortest in the New Testament?",
    options: ["Matthew", "Mark", "Luke", "John"],
    answer: "Mark",
    explanation: "The Gospel of Mark is the shortest of the four Gospels, with 16 chapters.",
    verse: "Mark 1:1",
  },
  {
    id: 2, type: "truefalse",
    question: "The Last Supper took place on a Thursday before the Jewish Passover.",
    answer: true,
    explanation: "Jesus celebrated the Last Supper with His apostles on Holy Thursday, the night before His crucifixion.",
    verse: "Luke 22:14-20",
  },
  {
    id: 3, type: "mcq",
    question: "How many Books are in the Orthodox Old Testament?",
    options: ["39", "45", "46", "50"],
    answer: "46",
    explanation: "The Orthodox Old Testament includes up to 51 books depending on the tradition, including books not found in the Protestant Bible.",
  },
  {
    id: 4, type: "truefalse",
    question: "St. Peter was crucified upside-down because he felt unworthy to die like Jesus.",
    answer: true,
    explanation: "Tradition holds that St. Peter requested to be crucified upside-down, as he did not consider himself worthy to die in the same manner as Jesus Christ.",
  },
  {
    id: 5, type: "mcq",
    question: "What does 'Agape' mean in Greek?",
    options: ["Friendship", "Romantic love", "Unconditional / Divine love", "Brotherly love"],
    answer: "Unconditional / Divine love",
    explanation: "Agape refers to the highest form of love — unconditional, sacrificial, divine love. It is the love God has for humanity.",
    verse: "John 3:16",
  },
];

const CATECHISM_QUIZ: Question[] = [
  {
    id: 1, type: "mcq",
    question: "How many Sacraments (Holy Mysteries) are there in the Orthodox Church?",
    options: ["5", "6", "7", "10"],
    answer: "7",
    explanation: "The seven sacraments are: Baptism, Eucharist, Confirmation, Reconciliation, Anointing of the Sick, Holy Orders, and Matrimony.",
  },
  {
    id: 2, type: "truefalse",
    question: "The Immaculate Conception refers to the sinless conception of Jesus Christ.",
    answer: false,
    explanation: "The Immaculate Conception refers to Mary being conceived without original sin — not to Jesus. Jesus's miraculous birth is called the Virgin Birth.",
  },
];

const quizSets = [
  { id: "daily",      label: "Daily Quiz",       emoji: "⭐", questions: DAILY_QUIZ,      xp: 100, color: "gradient-gold",    badge: "bg-amber-100 text-amber-800 dark:bg-amber-900/30 dark:text-amber-300",   desc: "5 questions · Scripture & Faith" },
  { id: "catechism",  label: "Faith",        emoji: "📜", questions: CATECHISM_QUIZ,  xp: 80,  color: "gradient-royal",   badge: "bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300",     desc: "2 questions · Orthodox Teaching" },
];

type Phase = "select" | "quiz" | "result";

/* ─── Main Page ──────────────────────────────────────────────────────────── */
export default function QuizzesPage() {
  const [phase, setPhase] = useState<Phase>(&quot;select&quot;);
  const [activeSet, setActiveSet] = useState(quizSets[0]);
  const [currentQ, setCurrentQ] = useState(0);
  const [answers, setAnswers] = useState<(string | boolean | null)[]>([]);
  const [selected, setSelected] = useState<string | boolean | null>(null);
  const [revealed, setRevealed] = useState(false);
  const [score, setScore] = useState(0);

  const questions = activeSet.questions;
  const q = questions[currentQ];
  const totalQ = questions.length;

  /* Start quiz */
  const startQuiz = (set: typeof quizSets[0]) => {
    setActiveSet(set);
    setCurrentQ(0);
    setAnswers(new Array(set.questions.length).fill(null));
    setSelected(null);
    setRevealed(false);
    setScore(0);
    setPhase(&quot;quiz&quot;);
  };

  /* Submit answer */
  const submitAnswer = () => {
    if (selected === null) return;
    const correct = selected === q.answer;
    if (correct) setScore((s) => s + 1);
    setAnswers((prev) => { const a = [...prev]; a[currentQ] = selected; return a; });
    setRevealed(true);
  };

  /* Next question */
  const nextQuestion = () => {
    if (currentQ + 1 >= totalQ) {
      setPhase(&quot;result&quot;);
    } else {
      setCurrentQ((n) => n + 1);
      setSelected(null);
      setRevealed(false);
    }
  };

  const progress = ((currentQ + (revealed ? 1 : 0)) / totalQ) * 100;

  return (
    <div className="flex-1 overflow-y-auto">

      {/* ── Header ── */}
      <div className="relative overflow-hidden px-5 pt-8 pb-10 gradient-spirit">
        <svg viewBox="0 0 200 200" className="absolute right-0 top-0 w-48 h-48 opacity-10 text-white" fill="none" stroke="currentColor" strokeWidth="6">
          <line x1="100" y1="10" x2="100" y2="190" /><line x1="20" y1="70" x2="180" y2="70" />
        </svg>
        <div className="relative z-10">
          <div className="flex items-center gap-3 mb-2">
            <div className="w-10 h-10 rounded-xl bg-white/20 backdrop-blur-sm flex items-center justify-center text-xl">🎓</div>
            <div>
              <h1 className="text-2xl font-extrabold text-white font-serif">Daily Quizzes</h1>
              <p className="text-orange-100 text-xs font-bold uppercase tracking-wider">Test Your Faith & Knowledge</p>
            </div>
          </div>
          <p className="text-orange-100/80 text-sm mt-2 italic font-serif">
            &quot;Study to show yourself approved unto God.&quot; — 2 Timothy 2:15
          </p>
        </div>
      </div>

      <div className="px-4 pt-4 pb-8">
        <AnimatePresence mode="wait">

          {/* ── SELECT ── */}
          {phase === &quot;select&quot; && (
            <motion.div key="select" initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -12 }} className="space-y-4">
              <p className="text-xs text-muted-foreground italic font-serif">&quot;Knowledge of God is the beginning of wisdom.&quot; — Proverbs 9:10</p>
              {quizSets.map((set) => (
                <div key={set.id} className="bg-card rounded-2xl border border-border/60 card-holy card-holy-hover overflow-hidden">
                  <div className="p-5 flex items-start gap-4">
                    <div className={`w-14 h-14 rounded-2xl ${set.color} flex items-center justify-center text-3xl shadow-lg shrink-0`}>
                      {set.emoji}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between gap-2 flex-wrap mb-1">
                        <h3 className="font-bold text-foreground font-serif text-base">{set.label}</h3>
                        <Badge className={cn("text-[10px] border-0 px-2", set.badge)}>+{set.xp} XP</Badge>
                      </div>
                      <p className="text-xs text-muted-foreground mb-3">{set.desc}</p>
                      <Button
                        onClick={() => startQuiz(set)}
                        className={`w-full h-9 rounded-xl font-bold text-sm text-white ${set.color} shadow-md hover:opacity-90`}
                      >
                        Begin Quiz <ChevronRight className="w-4 h-4 ml-1" />
                      </Button>
                    </div>
                  </div>
                </div>
              ))}
            </motion.div>
          )}

          {/* ── QUIZ ── */}
          {phase === &quot;quiz&quot; && (
            <motion.div key={`quiz-${currentQ}`} initial={{ opacity: 0, x: 30 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -30 }} transition={{ duration: 0.3 }} className="space-y-4">
              {/* Progress */}
              <div className="space-y-1.5">
                <div className="flex justify-between text-xs font-semibold text-muted-foreground">
                  <span>Question {currentQ + 1} of {totalQ}</span>
                  <span>{Math.round(progress)}%</span>
                </div>
                <Progress value={progress} className="h-2 rounded-full bg-muted [&>div]:gradient-spirit [&>div]:rounded-full&quot; />
              </div>

              {/* Question card */}
              <div className="bg-card rounded-2xl border border-border/60 card-holy p-5">
                <Badge className={cn("mb-3 text-[10px] border-0 px-2", q.type === "mcq" ? "bg-orange-100 text-orange-800 dark:bg-orange-900/30 dark:text-orange-300" : "bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300")}>
                  {q.type === &quot;mcq&quot; ? &quot;Multiple Choice&quot; : &quot;True or False&quot;}
                </Badge>
                <p className="text-base font-bold text-foreground font-serif leading-snug">{q.question}</p>
                {q.verse && <p className="text-xs text-primary font-semibold mt-1.5">See: {q.verse}</p>}
              </div>

              {/* Options */}
              <div className="space-y-2.5">
                {(q.type === &quot;mcq&quot; ? q.options! : [&quot;True&quot;, &quot;False&quot;]).map((opt) => {
                  const val = q.type === "truefalse" ? opt === "True" : opt;
                  const isSelected = selected === val;
                  const isCorrect  = q.answer === val;
                  const showCorrect = revealed && isCorrect;
                  const showWrong   = revealed && isSelected && !isCorrect;

                  return (
                    <motion.button
                      key={String(opt)}
                      whileTap={!revealed ? { scale: 0.98 } : {}}
                      onClick={() => { if (!revealed) setSelected(val); }}
                      disabled={revealed}
                      className={cn(
                        &quot;w-full text-left px-4 py-3.5 rounded-xl border-2 text-sm font-semibold transition-all duration-200 flex items-center justify-between&quot;,
                        !revealed && isSelected ? &quot;border-primary bg-primary/8 text-primary&quot; :
                        !revealed ? &quot;border-border/60 bg-card text-foreground hover:border-primary/50 hover:bg-primary/4&quot; :
                        showCorrect ? "border-green-500 bg-green-50 dark:bg-green-900/20 text-green-700 dark:text-green-300" :
                        showWrong   ? "border-red-400 bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400" :
                        "border-border/30 bg-muted/40 text-muted-foreground"
                      )}
                    >
                      <span>{String(opt)}</span>
                      {revealed && showCorrect && <CheckCircle2 className="w-4 h-4 text-green-500 shrink-0" />}
                      {revealed && showWrong   && <XCircle    className="w-4 h-4 text-red-400 shrink-0"   />}
                    </motion.button>
                  );
                })}
              </div>

              {/* Explanation */}
              <AnimatePresence>
                {revealed && (
                  <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} className={cn(
                    "rounded-2xl p-4 border",
                    selected === q.answer
                      ? "bg-green-50 dark:bg-green-900/15 border-green-200 dark:border-green-800"
                      : "bg-red-50 dark:bg-red-900/15 border-red-200 dark:border-red-800"
                  )}>
                    <p className="text-sm font-bold mb-1">{selected === q.answer ? &quot;✅ Correct!&quot; : &quot;❌ Incorrect&quot;}</p>
                    <p className="text-xs text-muted-foreground leading-relaxed font-serif italic">{q.explanation}</p>
                  </motion.div>
                )}
              </AnimatePresence>

              {/* Actions */}
              {!revealed ? (
                <Button onClick={submitAnswer} disabled={selected === null} className="w-full h-11 rounded-xl gradient-spirit text-white font-bold shadow-md">
                  Submit Answer
                </Button>
              ) : (
                <Button onClick={nextQuestion} className="w-full h-11 rounded-xl gradient-gold text-white font-bold shadow-md halo-glow">
                  {currentQ + 1 >= totalQ ? &quot;See Results&quot; : &quot;Next Question →&quot;}
                </Button>
              )}
            </motion.div>
          )}

          {/* ── RESULT ── */}
          {phase === &quot;result&quot; && (
            <motion.div key="result" initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} className="space-y-5 text-center">
              <motion.div animate={{ rotateY: [0, 360] }} transition={{ duration: 1.5, ease: "easeOut" }}
                className="w-20 h-20 rounded-3xl gradient-gold flex items-center justify-center mx-auto shadow-2xl halo-glow text-4xl">
                {score === totalQ ? &quot;🏆&quot; : score >= totalQ / 2 ? &quot;⭐&quot; : &quot;🌿&quot;}
              </motion.div>
              <div>
                <p className="text-[10px] font-bold text-primary uppercase tracking-widest mb-1">Quiz Complete</p>
                <h2 className="text-3xl font-extrabold text-foreground font-serif">{score} / {totalQ} Correct</h2>
                <p className="text-muted-foreground text-sm mt-1">
                  {score === totalQ ? &quot;Perfect score! Deo Gratias! 🎉&quot; :
                   score >= totalQ / 2 ? &quot;Great effort! Keep studying God's Word.&quot; :
                   &quot;Keep going! Every reading builds wisdom.&quot;}
                </p>
              </div>
              <div className="bg-card rounded-2xl border border-border/60 card-holy p-5 text-left space-y-2">
                <p className="text-xs font-bold text-muted-foreground uppercase tracking-widest mb-3">Your Answers</p>
                {questions.map((q, i) => {
                  const correct = answers[i] === q.answer;
                  return (
                    <div key={q.id} className="flex items-start gap-2">
                      {correct
                        ? <CheckCircle2 className="w-4 h-4 text-green-500 shrink-0 mt-0.5" />
                        : <XCircle className="w-4 h-4 text-red-400 shrink-0 mt-0.5" />}
                      <p className="text-xs text-foreground/80 font-serif">{q.question}</p>
                    </div>
                  );
                })}
              </div>
              <div className="rounded-2xl gradient-gold p-4 text-white text-center card-holy halo-glow">
                <p className="text-xs font-bold uppercase tracking-widest opacity-80 mb-1">Grace Points Earned</p>
                <p className="text-3xl font-extrabold font-serif">+{Math.round((score / totalQ) * activeSet.xp)} XP</p>
              </div>
              <div className="flex gap-3">
                <Button onClick={() => startQuiz(activeSet)} variant=&quot;outline&quot; className=&quot;flex-1 h-11 rounded-xl font-bold border-border/60&quot;>
                  <RotateCcw className="w-4 h-4 mr-2" /> Retry
                </Button>
                <Button onClick={() => setPhase(&quot;select&quot;)} className=&quot;flex-1 h-11 rounded-xl gradient-royal text-white font-bold shadow-md&quot;>
                  More Quizzes <ChevronRight className="w-4 h-4 ml-1" />
                </Button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
