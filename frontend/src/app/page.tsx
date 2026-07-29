"use client";

import { motion } from "framer-motion";
import Link from "next/link";
import { ArrowRight, ChevronDown, CheckCircle2 } from "lucide-react";
import { HeroNav } from "@/components/layout/HeroNav";
import React, { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/context/AuthContext";

function FadeUp({ children, delay = 0, className = "" }: { children: React.ReactNode; delay?: number; className?: string }) {
  return (
    <motion.div 
      initial={{ opacity: 0, y: 30 }} 
      whileInView={{ opacity: 1, y: 0 }} 
      viewport={{ once: true, margin: "-50px" }}
      transition={{ duration: 0.6, delay, ease: "easeOut" }} 
      className={className}
    >
      {children}
    </motion.div>
  );
}

const featureCards = [
  { icon: "📖", title: "Sacred Scripture", sub: "All 66 Books", delay: 0 },
  { icon: "⚔️", title: "Daily Missions",   sub: "Works of Mercy", delay: 0.1 },
  { icon: "🕊️", title: "Parish Events",   sub: "Gather & Pray", delay: 0.2 },
  { icon: "🕯️", title: "Prayer Reminders",sub: "Never Forget", delay: 0.3 },
  { icon: "🙏", title: "Prayer Wall",      sub: "Community Faith", delay: 0.4 },
  { icon: "👑", title: "Grace Points",     sub: "Grow in Faith", delay: 0.5 },
];

const steps = [
  { num: "01", title: "Begin Your Journey", desc: "Create your account, set your spiritual goals, choose your reading plan.", emoji: "🌅" },
  { num: "02", title: "Pray. Read. Act.",    desc: "Each day: a verse, a reflection, a prayer, and a mission. Five minutes can change everything.", emoji: "✝️" },
  { num: "03", title: "Grow Together",       desc: "Share events, lift prayer requests, earn Grace Points, and climb in faith — together.", emoji: "🌿" },
];

const testimonials = [
  { name: "Maria Santos", age: 19, role: "Youth Leader",          quote: "I hadn't prayed in weeks. Ignite's morning reminder changed everything. 94-day streak and counting.", emoji: "👩‍🦱", streak: 94 },
  { name: "James Okoro",  age: 17, role: "Member",               quote: "The missions made faith tangible. Acts of Charity bring me closer to God than I ever expected.",    emoji: "👦🏿", streak: 52 },
  { name: "Clara Reyes",  age: 22, role: "Praise & Worship Lead", quote: "The Bible reader is gorgeous. My small group bookmarks the same verses — it unites us.",             emoji: "👩🏻", streak: 120 },
];

export default function HeroPage() {
  const { user, loading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!loading && user) {
      router.push("/dashboard");
    }
  }, [user, loading, router]);

  return (
    <div className="flex-1 bg-[url('https://www.transparenttextures.com/patterns/dark-matter.png')] bg-fixed bg-[#0a0a0a] text-white font-sans h-full overflow-hidden relative">
      <HeroNav />
      
      {/* Global decorative background glows */}
      <div className="absolute top-0 right-1/4 w-[600px] h-[600px] bg-amber-500/10 rounded-full blur-[150px] pointer-events-none" />
      <div className="absolute bottom-0 left-1/4 w-[600px] h-[600px] bg-emerald-500/10 rounded-full blur-[150px] pointer-events-none" />

      {/* ── HERO SECTION (SPLIT LAYOUT) ── */}
      <section className="relative pt-32 pb-20 px-6 lg:min-h-screen flex items-center">
        {/* Subtle animated background pattern */}
        <div className="absolute inset-0 z-0 overflow-hidden pointer-events-none opacity-[0.02]">
          <svg width="100%" height="100%" xmlns="http://www.w3.org/2000/svg">
            <defs>
              <pattern id="grid" width="40" height="40" patternUnits="userSpaceOnUse">
                <path d="M 40 0 L 0 0 0 40" fill="none" stroke="white" strokeWidth="1"/>
              </pattern>
            </defs>
            <rect width="100%" height="100%" fill="url(#grid)" />
          </svg>
        </div>

        <div className="max-w-7xl mx-auto w-full grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-8 items-center relative z-10 pt-12 lg:pt-0">
          
          {/* Left Column: Text & CTAs */}
          <div className="flex flex-col items-start text-left">
            <div className="inline-flex items-center gap-3 bg-[#111]/80 backdrop-blur-xl border border-white/10 rounded-full px-5 py-2 mb-8 shadow-2xl animate-in fade-in slide-in-from-bottom-4 duration-700">
              <span className="text-amber-500 font-extrabold text-sm tracking-widest uppercase">Ignite Youth</span>
              <span className="text-slate-400 text-xs font-medium border-l border-white/10 pl-3">Ministry Platform</span>
            </div>
            
            <h1 className="text-5xl lg:text-7xl font-extrabold font-serif leading-[1.1] mb-6 text-white drop-shadow-lg animate-in fade-in slide-in-from-bottom-8 duration-1000 delay-75 fill-mode-both">
              In a world that never stops, <br />
              <span className="text-amber-700 relative">
                your faith never should.
                <svg className="absolute -bottom-2 left-0 w-full h-3 text-amber-300/50" viewBox="0 0 200 12" preserveAspectRatio="none">
                  <path 
                    d="M0,10 Q100,0 200,10" 
                    fill="none" 
                    stroke="currentColor" 
                    strokeWidth="4" 
                  />
                </svg>
              </span>
            </h1>

            <p className="text-slate-400 text-lg lg:text-xl leading-relaxed mb-10 max-w-lg animate-in fade-in slide-in-from-bottom-8 duration-1000 delay-150 fill-mode-both">
              Your daily spiritual companion for scripture, prayer, missions and community. Built for Christian youth navigating a fast-paced world.
            </p>

            <div className="flex flex-col sm:flex-row gap-4 w-full sm:w-auto animate-in fade-in slide-in-from-bottom-8 duration-1000 delay-300 fill-mode-both">
              <Link
                href="/login"
                className="inline-flex items-center justify-center gap-2 px-8 py-4 rounded-xl bg-amber-600 text-white font-bold text-base hover:bg-amber-700 transition-colors shadow-lg shadow-amber-600/20 group"
              >
                Begin Your Journey 
                <span className="group-hover:translate-x-1 transition-transform inline-block">
                  <ArrowRight className="w-5 h-5" />
                </span>
              </Link>
              <a
                href="#discover"
                className="inline-flex items-center justify-center gap-2 px-8 py-4 rounded-xl bg-[#111]/80 backdrop-blur-xl border border-white/10 text-white font-bold text-base hover:bg-white/5 transition-colors"
              >
                Discover More
              </a>
            </div>

            <div className="mt-12 flex items-center gap-6 text-sm font-medium text-slate-400 animate-in fade-in slide-in-from-bottom-8 duration-1000 delay-500 fill-mode-both">
              <div className="flex items-center gap-2"><CheckCircle2 className="w-4 h-4 text-amber-500" /> Free forever</div>
              <div className="flex items-center gap-2"><CheckCircle2 className="w-4 h-4 text-amber-500" /> 66 Books</div>
              <div className="flex items-center gap-2"><CheckCircle2 className="w-4 h-4 text-amber-500" /> Gamified Faith</div>
            </div>
          </div>

          {/* Right Column: Animated UI Mockups */}
          <div className="relative h-[500px] lg:h-[600px] w-full hidden md:block">
            {/* Main App Mockup Card */}
            <motion.div 
              className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-80 bg-[#111]/80 backdrop-blur-2xl rounded-3xl shadow-2xl border border-white/10 p-6 z-20"
              initial={{ opacity: 0, y: 50, x: "-50%" }}
              animate={{ opacity: 1, y: "-50%", x: "-50%" }}
              transition={{ duration: 0.8, delay: 0.3 }}
            >
              <div className="flex items-center gap-4 mb-6">
                <div className="w-12 h-12 rounded-full bg-amber-500/20 border border-amber-500/30 flex items-center justify-center text-xl">✝️</div>
                <div>
                  <div className="h-3 w-24 bg-white/20 rounded-full mb-2"></div>
                  <div className="h-2 w-16 bg-white/10 rounded-full"></div>
                </div>
              </div>
              <div className="space-y-3 mb-6">
                <div className="h-16 w-full bg-white/5 rounded-xl border border-white/10 p-3 flex items-center gap-3">
                  <div className="w-8 h-8 rounded-lg bg-amber-500/20 border border-amber-500/30 flex items-center justify-center text-sm">📖</div>
                  <div className="flex-1">
                    <div className="h-2 w-full bg-white/20 rounded-full mb-2"></div>
                    <div className="h-2 w-2/3 bg-white/10 rounded-full"></div>
                  </div>
                </div>
                <div className="h-16 w-full bg-white/5 rounded-xl border border-white/10 p-3 flex items-center gap-3">
                  <div className="w-8 h-8 rounded-lg bg-amber-500/20 border border-amber-500/30 flex items-center justify-center text-sm">⚔️</div>
                  <div className="flex-1">
                    <div className="h-2 w-full bg-white/20 rounded-full mb-2"></div>
                    <div className="h-2 w-1/2 bg-white/10 rounded-full"></div>
                  </div>
                </div>
              </div>
              <div className="h-10 w-full bg-amber-600 rounded-xl text-white flex items-center justify-center font-bold text-sm shadow-md shadow-amber-600/20">
                Complete Daily Mission
              </div>
            </motion.div>

            {/* Floating Element 1: Streak Badge */}
            <motion.div 
              className="absolute top-16 right-4 lg:right-12 bg-[#111]/80 backdrop-blur-xl p-4 rounded-2xl shadow-2xl border border-white/10 z-30 flex items-center gap-4"
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1, y: [0, -10, 0] }}
              transition={{ duration: 4, repeat: Infinity, ease: "easeInOut", delay: 0.5 }}
            >
              <div className="text-3xl">🕯️</div>
              <div>
                <p className="font-bold text-white font-serif">12 Day Streak</p>
                <p className="text-xs text-amber-500 font-medium">On fire for Christ!</p>
              </div>
            </motion.div>

            {/* Floating Element 2: Notification */}
            <motion.div 
              className="absolute bottom-24 left-0 lg:left-8 bg-[#111]/80 backdrop-blur-xl p-4 rounded-2xl shadow-2xl border border-white/10 z-30 flex items-center gap-3"
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1, y: [0, 10, 0] }}
              transition={{ duration: 5, repeat: Infinity, ease: "easeInOut", delay: 0.7 }}
            >
              <div className="w-10 h-10 rounded-full bg-blue-500/20 border border-blue-500/30 flex items-center justify-center text-lg">🙏</div>
              <div>
                <p className="font-bold text-white text-sm">New Prayer Request</p>
                <p className="text-xs text-slate-400">Maria is asking for prayers...</p>
              </div>
            </motion.div>

            {/* Decorative background blob */}
            <motion.div 
              className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-amber-200/40 rounded-full blur-3xl z-10"
              animate={{ scale: [1, 1.1, 1], opacity: [0.5, 0.7, 0.5] }}
              transition={{ duration: 8, repeat: Infinity, ease: "easeInOut" }}
            />
          </div>
        </div>
      </section>

      {/* ── THE PROBLEM ── */}
      <section id="discover" className="py-20 px-6 border-y border-white/10 relative">
        <div className="absolute inset-0 bg-black/40 backdrop-blur-3xl -z-10" />
        <div className="max-w-4xl mx-auto text-center">
          <FadeUp>
            <h2 className="text-3xl md:text-4xl font-bold font-serif mb-6 text-white drop-shadow-lg">
              Notifications pull us everywhere — except toward God.
            </h2>
            <p className="text-slate-400 text-lg leading-relaxed mb-12">
              The average young person checks their phone 96 times a day — yet finds no time for a moment of prayer. Ignite changes that.
            </p>
          </FadeUp>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {[
              { icon: "📱", stat: "96×",   label: "Phone checks per day" },
              { icon: "🙏", stat: "3 min", label: "Avg daily prayer for youth" },
              { icon: "✝️", stat: "5 min", label: "All it takes to transform" },
            ].map((s, i) => (
              <FadeUp key={s.label} delay={i * 0.1}>
                <motion.div 
                  whileHover={{ y: -5 }}
                  className="bg-[#111]/80 backdrop-blur-xl rounded-2xl p-8 border border-white/10 text-center h-full transition-all hover:shadow-emerald-500/10 hover:shadow-2xl hover:border-white/20"
                >
                  <p className="text-4xl mb-4 drop-shadow-lg">{s.icon}</p>
                  <p className="text-3xl font-extrabold font-serif text-white">{s.stat}</p>
                  <p className="text-sm text-slate-400 mt-2 font-medium uppercase tracking-wider">{s.label}</p>
                </motion.div>
              </FadeUp>
            ))}
          </div>
        </div>
      </section>

      {/* ── FEATURES ── */}
      <section className="py-24 px-6 relative">
        <div className="max-w-6xl mx-auto relative z-10">
          <div className="flex flex-col md:flex-row justify-between items-end mb-12 gap-6">
            <FadeUp className="max-w-xl text-left">
              <h2 className="text-3xl md:text-4xl font-bold font-serif mb-4 text-white drop-shadow-lg">
                Your complete spiritual companion
              </h2>
              <p className="text-slate-400 text-lg">
                Six powerful modules bringing your faith alive — every single day.
              </p>
            </FadeUp>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {featureCards.map((f, i) => (
              <FadeUp key={f.title} delay={f.delay}>
                <Link href="/login" className="block h-full group">
                  <motion.div 
                    whileHover={{ y: -5 }}
                    className="bg-[#111]/80 backdrop-blur-xl rounded-2xl p-8 border border-white/10 hover:border-amber-500/30 hover:shadow-2xl hover:shadow-amber-500/10 transition h-full"
                  >
                    <div className="w-14 h-14 rounded-2xl bg-amber-500/10 border border-amber-500/20 text-2xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform shadow-lg shadow-amber-500/10">
                      {f.icon}
                    </div>
                    <p className="font-bold text-xl text-white font-serif mb-2 group-hover:text-amber-500 transition-colors">{f.title}</p>
                    <p className="text-sm text-slate-400 leading-relaxed">{f.sub}</p>
                  </motion.div>
                </Link>
              </FadeUp>
            ))}
          </div>
        </div>
      </section>

      {/* ── HOW IT WORKS ── */}
      <section className="py-24 px-6 border-y border-white/10 relative">
        <div className="absolute inset-0 bg-black/40 backdrop-blur-3xl -z-10" />
        <div className="max-w-7xl mx-auto grid md:grid-cols-2 gap-16 items-center">
          <div className="order-2 md:order-1 relative h-[500px] bg-[#111]/50 backdrop-blur-sm rounded-3xl border border-white/10 overflow-hidden flex items-center justify-center shadow-2xl">
            {/* Minimal animated representation of the app's timeline */}
            <div className="w-64 space-y-4">
              {[1, 2, 3].map((item, i) => (
                  <motion.div 
                    key={i}
                    className="bg-[#111]/80 backdrop-blur-xl p-4 rounded-xl shadow-lg border border-white/10 flex gap-3 items-center"
                    initial={{ opacity: 0, x: -20 }}
                    whileInView={{ opacity: 1, x: 0 }}
                    viewport={{ once: true }}
                    transition={{ delay: i * 0.2 }}
                  >
                    <div className="w-10 h-10 rounded-full bg-amber-500/20 border border-amber-500/30 flex items-center justify-center font-bold text-amber-500 font-serif">
                      0{item}
                    </div>
                    <div className="flex-1">
                      <div className="h-2 w-full bg-white/20 rounded-full mb-2"></div>
                      <div className="h-2 w-2/3 bg-white/10 rounded-full"></div>
                    </div>
                  </motion.div>
              ))}
            </div>
          </div>

          <div className="order-1 md:order-2">
            <FadeUp>
              <p className="text-sm font-bold text-amber-500 tracking-widest uppercase mb-2">Simple. Powerful. Sacred.</p>
              <h2 className="text-3xl md:text-5xl font-bold font-serif text-white mb-10 drop-shadow-lg">How Ignite works</h2>
            </FadeUp>
            
            <div className="space-y-8">
              {steps.map((step, i) => (
                <FadeUp key={step.num} delay={i * 0.1}>
                  <div className="flex gap-5 items-start group">
                    <div className="w-14 h-14 rounded-full bg-[#111]/80 backdrop-blur-xl border border-white/10 flex items-center justify-center shrink-0 text-2xl group-hover:border-amber-500/50 group-hover:bg-amber-500/10 transition-colors shadow-lg shadow-black/50">
                      {step.emoji}
                    </div>
                    <div>
                      <h3 className="font-bold text-xl text-white font-serif mb-2">{step.title}</h3>
                      <p className="text-slate-400 leading-relaxed text-lg">{step.desc}</p>
                    </div>
                  </div>
                </FadeUp>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ── TESTIMONIALS (ANIMATED TICKER) ── */}
      <section className="py-24 relative overflow-hidden">
        <div className="max-w-5xl mx-auto px-6 text-center mb-16 relative z-10">
          <FadeUp>
            <h2 className="text-3xl md:text-4xl font-bold font-serif text-white drop-shadow-lg">
              Voices of the Community
            </h2>
          </FadeUp>
        </div>

        <div className="relative w-full flex">
          <motion.div 
            className="flex gap-6 px-6"
            animate={{ x: [0, -1000] }}
            transition={{ duration: 25, repeat: Infinity, ease: "linear" }}
          >
            {/* Double the array for seamless scrolling */}
            {[...testimonials, ...testimonials].map((t, i) => (
              <div key={i} className="w-[350px] shrink-0 bg-[#111]/80 backdrop-blur-xl rounded-2xl p-8 border border-white/10 shadow-2xl flex flex-col hover:border-white/20 transition-colors">
                <div className="flex items-center gap-3 mb-6">
                  <div className="w-12 h-12 rounded-full bg-white/5 border border-white/10 flex items-center justify-center text-2xl drop-shadow-md">
                    {t.emoji}
                  </div>
                  <div className="text-left">
                    <p className="font-bold text-white font-serif">{t.name}</p>
                    <p className="text-xs text-slate-400 uppercase tracking-wider">{t.role}</p>
                  </div>
                </div>
                <p className="text-slate-300 italic font-serif leading-relaxed text-left flex-1">"{t.quote}"</p>
                <div className="mt-6 flex items-center gap-2">
                  <span className="text-amber-500 drop-shadow-md">🕯️</span>
                  <span className="text-sm font-bold text-amber-500">{t.streak} day streak</span>
                </div>
              </div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* ── FINAL CTA ── */}
      <section className="py-32 px-6 text-center border-t border-white/10 relative overflow-hidden">
        {/* Subtle radial glow */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full max-w-2xl h-full bg-amber-500/20 rounded-full blur-[150px] pointer-events-none -z-10" />
        
        <FadeUp className="max-w-2xl mx-auto relative z-10">
          <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-amber-500 to-amber-700 flex items-center justify-center mx-auto mb-8 shadow-lg shadow-amber-500/20 text-white text-2xl">
            ✝️
          </div>
          <h2 className="text-4xl md:text-6xl font-extrabold font-serif text-white drop-shadow-lg leading-[1.1] mb-6">
            Your faith journey <br/> begins with one step.
          </h2>
          <p className="text-slate-400 text-lg mb-10 max-w-xl mx-auto">
            Join thousands of Christian youth who are reclaiming five minutes a day for God.
          </p>
          <Link
            href="/login"
            className="inline-flex items-center justify-center gap-2 px-10 py-5 rounded-xl bg-amber-600 text-white font-bold text-lg hover:bg-amber-700 transition hover:scale-105 shadow-2xl shadow-amber-600/30"
          >
            Join Ignite — It&apos;s Free
            <ArrowRight className="w-5 h-5" />
          </Link>
          <p className="text-slate-500 text-xs mt-12 tracking-[0.3em] uppercase drop-shadow-md">✝ Soli Deo Gloria ✝</p>
        </FadeUp>
      </section>
    </div>
  );
}
