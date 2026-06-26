"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ArrowLeft, CheckCircle2, ChevronRight, BookHeart } from "lucide-react";
import { useRouter } from "next/navigation";
import { cn } from "@/lib/utils";

const EXAM_OF_CONSCIENCE = [
  {
    category: "My Relationship with God",
    questions: [
      "Have I neglected my daily prayers or the reading of Scripture?",
      "Have I attended Holy Qurbana regularly on Sundays and feast days?",
      "Have I put my trust in superstitions, astrology, or secular ideologies rather than God?",
      "Have I used the name of God, Jesus Christ, or the Saints in vain or in anger?",
      "Have I been ashamed to show myself as a Christian in public?"
    ]
  },
  {
    category: "My Relationship with Others",
    questions: [
      "Have I been disobedient or disrespectful to my parents or elders?",
      "Have I harbored hatred, anger, or a desire for revenge against anyone?",
      "Have I gossiped, judged others, or damaged someone's reputation?",
      "Have I neglected those in need when I had the capacity to help?",
      "Have I been jealous of the success or blessings of others?"
    ]
  },
  {
    category: "My Personal Integrity",
    questions: [
      "Have I lied or been deceitful in my words or actions?",
      "Have I viewed impure media or entertained impure thoughts?",
      "Have I misused my body through addiction, gluttony, or lack of care?",
      "Have I stolen, cheated, or taken what does not belong to me?",
      "Have I wasted time or been lazy in my duties (school, work, family)?"
    ]
  }
];

const ORTHODOX_PRAYERS = [
  {
    title: "The Jesus Prayer",
    text: "Lord Jesus Christ, Son of God, have mercy on me, a sinner."
  },
  {
    title: "The Trisagion (Kauma)",
    text: "Holy art thou, O God!\nHoly art thou, Almighty!\nHoly art thou, Immortal!\n† Crucified for us, have mercy on us. (Repeat 3 times)"
  },
  {
    title: "The Lord's Prayer",
    text: "Our Father, who art in heaven, hallowed be thy Name; thy kingdom come; thy will be done on earth, as it is in heaven. Give us this day our daily bread; and forgive us our trespasses, as we forgive those who trespass against us; and lead us not into temptation, but deliver us from the evil one. For thine is the kingdom, the power, and the glory, for ever and ever. Amen."
  },
  {
    title: "Hail Mary",
    text: "Peace be with you, Mary, full of grace, the Lord is with you. Blessed are you among women, and blessed is the fruit of your womb, Jesus. Holy Mary, Mother of God, pray for us sinners, now and at the hour of our death. Amen."
  },
  {
    title: "Psalm 51 (Prayer of Repentance)",
    text: "Have mercy on me, O God, according to your steadfast love; according to your abundant mercy blot out my transgressions. Wash me thoroughly from my iniquity, and cleanse me from my sin. For I know my transgressions, and my sin is ever before me..."
  }
];

export default function GuidesPage() {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState<"confession" | "prayers">("confession");
  const [checkedItems, setCheckedItems] = useState<Record<string, boolean>>({});

  const toggleCheck = (idx: string) => {
    setCheckedItems(prev => ({ ...prev, [idx]: !prev[idx] }));
  };

  return (
    <div className="flex-1 flex flex-col bg-slate-50 dark:bg-slate-950 min-h-screen">
      
      {/* ── Header ── */}
      <div className="px-5 pt-8 pb-6 bg-white dark:bg-slate-900 border-b border-border/50 sticky top-0 z-20">
        <div className="flex items-center gap-3">
          <button onClick={() => router.back()} className="w-10 h-10 rounded-xl bg-slate-100 dark:bg-slate-800 flex items-center justify-center hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors">
            <ArrowLeft className="w-5 h-5 text-foreground" />
          </button>
          <div>
            <h1 className="text-xl font-bold font-serif text-foreground">Spiritual Guides</h1>
            <p className="text-xs text-muted-foreground font-medium">Prepare your heart</p>
          </div>
        </div>
      </div>

      <div className="px-4 py-6">
        
        {/* ── Tabs ── */}
        <div className="flex bg-slate-200/50 dark:bg-slate-800/50 p-1 rounded-xl mb-6">
          <button 
            onClick={() => setActiveTab("confession")}
            className={cn(
              "flex-1 py-2.5 text-sm font-bold rounded-lg transition-all",
              activeTab === "confession" ? "bg-white dark:bg-slate-700 text-foreground shadow-sm" : "text-muted-foreground hover:text-foreground"
            )}
          >
            Confession Guide
          </button>
          <button 
            onClick={() => setActiveTab("prayers")}
            className={cn(
              "flex-1 py-2.5 text-sm font-bold rounded-lg transition-all",
              activeTab === "prayers" ? "bg-white dark:bg-slate-700 text-foreground shadow-sm" : "text-muted-foreground hover:text-foreground"
            )}
          >
            Common Prayers
          </button>
        </div>

        {/* ── Content ── */}
        <AnimatePresence mode="wait">
          
          {activeTab === "confession" && (
            <motion.div 
              key="confession"
              initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }}
              className="space-y-6 pb-20"
            >
              <div className="bg-gradient-to-r from-purple-700 to-indigo-600 rounded-3xl p-6 text-white shadow-lg">
                <div className="w-12 h-12 bg-white/20 rounded-2xl flex items-center justify-center backdrop-blur-sm mb-4">
                  <BookHeart className="w-6 h-6 text-white" />
                </div>
                <h2 className="text-2xl font-bold font-serif mb-2">Examination of Conscience</h2>
                <p className="text-purple-100 text-sm leading-relaxed">
                  Before approaching the sacrament of Holy Confession, spend time in quiet reflection. Ask the Holy Spirit to reveal your sins. 
                  (These checkboxes are completely private and do not save to the database).
                </p>
              </div>

              {EXAM_OF_CONSCIENCE.map((section, sIdx) => (
                <div key={section.category} className="bg-white dark:bg-slate-900 rounded-2xl border shadow-sm overflow-hidden">
                  <div className="bg-slate-50 dark:bg-slate-800/50 px-4 py-3 border-b">
                    <h3 className="font-bold text-foreground text-sm uppercase tracking-wider">{section.category}</h3>
                  </div>
                  <div className="divide-y divide-border">
                    {section.questions.map((q, qIdx) => {
                      const id = `${sIdx}-${qIdx}`;
                      const isChecked = !!checkedItems[id];
                      return (
                        <div 
                          key={id} 
                          onClick={() => toggleCheck(id)}
                          className="px-4 py-4 flex gap-4 cursor-pointer hover:bg-slate-50 dark:hover:bg-slate-800/30 transition-colors active:bg-slate-100"
                        >
                          <div className={cn(
                            "w-6 h-6 rounded-full border-2 flex items-center justify-center shrink-0 transition-colors mt-0.5",
                            isChecked ? "bg-purple-600 border-purple-600 text-white" : "border-slate-300 dark:border-slate-600"
                          )}>
                            {isChecked && <CheckCircle2 className="w-4 h-4" />}
                          </div>
                          <p className={cn(
                            "text-sm leading-relaxed transition-colors",
                            isChecked ? "text-muted-foreground line-through opacity-70" : "text-foreground"
                          )}>
                            {q}
                          </p>
                        </div>
                      );
                    })}
                  </div>
                </div>
              ))}
            </motion.div>
          )}

          {activeTab === "prayers" && (
            <motion.div 
              key="prayers"
              initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }}
              className="space-y-4 pb-20"
            >
              {ORTHODOX_PRAYERS.map((prayer, idx) => (
                <div key={idx} className="bg-white dark:bg-slate-900 rounded-2xl border shadow-sm p-5 card-holy hover:shadow-md transition-shadow">
                  <h3 className="text-lg font-bold font-serif text-amber-700 dark:text-amber-500 mb-3">{prayer.title}</h3>
                  <p className="text-sm text-foreground/80 leading-loose whitespace-pre-wrap font-medium">
                    {prayer.text}
                  </p>
                </div>
              ))}
            </motion.div>
          )}

        </AnimatePresence>

      </div>
    </div>
  );
}
