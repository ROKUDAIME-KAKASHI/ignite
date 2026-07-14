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
    <div className="flex-1 bg-[#fdfbf7] text-gray-900 font-sans h-full overflow-hidden">
      <HeroNav />

      {/* ── HERO SECTION (SPLIT LAYOUT) ── */}
      <section className="relative pt-32 pb-20 px-6 lg:min-h-screen flex items-center">
        {/* Subtle animated background pattern */}
        <div className="absolute inset-0 z-0 overflow-hidden pointer-events-none opacity-[0.03]">
          <svg width="100%" height="100%" xmlns="http://www.w3.org/2000/svg">
            <defs>
              <pattern id="grid" width="40" height="40" patternUnits="userSpaceOnUse">
                <path d="M 40 0 L 0 0 0 40" fill="none" stroke="currentColor" strokeWidth="1"/>
              </pattern>
            </defs>
            <rect width="100%" height="100%" fill="url(#grid)" />
          </svg>
        </div>

        <div className="max-w-7xl mx-auto w-full grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-8 items-center relative z-10 pt-12 lg:pt-0">
          
          {/* Left Column: Text & CTAs */}
          <div className="flex flex-col items-start text-left">
            <FadeUp>
              <motion.div 
                animate={{ y: [0, -4, 0] }} 
                transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
                className="inline-flex items-center gap-3 bg-white border border-gray-200 rounded-full px-5 py-2 mb-8 shadow-sm"
              >
                <span className="text-amber-700 font-extrabold text-sm tracking-widest uppercase">Ignite Youth</span>
                <span className="text-gray-400 text-xs font-medium border-l border-gray-200 pl-3">Ministry Platform</span>
              </motion.div>
            </FadeUp>
            
            <FadeUp delay={0.1}>
              <h1 className="text-5xl lg:text-7xl font-extrabold font-serif leading-[1.1] mb-6 text-gray-900">
                In a world that never stops, <br />
                <span className="text-amber-700 relative">
                  your faith never should.
                  <motion.svg className="absolute -bottom-2 left-0 w-full h-3 text-amber-300/50" viewBox="0 0 200 12" preserveAspectRatio="none">
                    <motion.path 
                      d="M0,10 Q100,0 200,10" 
                      fill="none" 
                      stroke="currentColor" 
                      strokeWidth="4" 
                      initial={{ pathLength: 0 }}
                      animate={{ pathLength: 1 }}
                      transition={{ duration: 1.5, delay: 0.8, ease: "easeInOut" }}
                    />
                  </motion.svg>
                </span>
              </h1>
            </FadeUp>

            <FadeUp delay={0.2}>
              <p className="text-gray-600 text-lg lg:text-xl leading-relaxed mb-10 max-w-lg">
                Your daily spiritual companion for scripture, prayer, missions and community. Built for Jacobite Orthodox youth navigating a fast-paced world.
              </p>
            </FadeUp>

            <FadeUp delay={0.3}>
              <div className="flex flex-col sm:flex-row gap-4 w-full sm:w-auto">
                <Link
                  href="/login"
                  className="inline-flex items-center justify-center gap-2 px-8 py-4 rounded-xl bg-amber-700 text-white font-bold text-base hover:bg-amber-800 transition-colors shadow-lg shadow-amber-900/10 group"
                >
                  Begin Your Journey 
                  <motion.span className="group-hover:translate-x-1 transition-transform">
                    <ArrowRight className="w-5 h-5" />
                  </motion.span>
                </Link>
                <a
                  href="#discover"
                  className="inline-flex items-center justify-center gap-2 px-8 py-4 rounded-xl bg-white border border-gray-200 text-gray-800 font-bold text-base hover:bg-gray-50 transition-colors"
                >
                  Discover More
                </a>
              </div>
            </FadeUp>

            <FadeUp delay={0.4} className="mt-12 flex items-center gap-6 text-sm font-medium text-gray-500">
              <div className="flex items-center gap-2"><CheckCircle2 className="w-4 h-4 text-amber-600" /> Free forever</div>
              <div className="flex items-center gap-2"><CheckCircle2 className="w-4 h-4 text-amber-600" /> 66 Books</div>
              <div className="flex items-center gap-2"><CheckCircle2 className="w-4 h-4 text-amber-600" /> Gamified Faith</div>
            </FadeUp>
          </div>

          {/* Right Column: Animated UI Mockups */}
          <div className="relative h-[500px] lg:h-[600px] w-full hidden md:block">
            {/* Main App Mockup Card */}
            <motion.div 
              className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-80 bg-white rounded-3xl shadow-2xl border border-gray-100 p-6 z-20"
              initial={{ opacity: 0, y: 50, x: "-50%" }}
              animate={{ opacity: 1, y: "-50%", x: "-50%" }}
              transition={{ duration: 0.8, delay: 0.3 }}
            >
              <div className="flex items-center gap-4 mb-6">
                <div className="w-12 h-12 rounded-full bg-amber-100 flex items-center justify-center text-xl">✝️</div>
                <div>
                  <div className="h-3 w-24 bg-gray-200 rounded-full mb-2"></div>
                  <div className="h-2 w-16 bg-gray-100 rounded-full"></div>
                </div>
              </div>
              <div className="space-y-3 mb-6">
                <div className="h-16 w-full bg-[#fdfbf7] rounded-xl border border-gray-100 p-3 flex items-center gap-3">
                  <div className="w-8 h-8 rounded-lg bg-amber-50 flex items-center justify-center text-sm">📖</div>
                  <div className="flex-1">
                    <div className="h-2 w-full bg-gray-200 rounded-full mb-2"></div>
                    <div className="h-2 w-2/3 bg-gray-100 rounded-full"></div>
                  </div>
                </div>
                <div className="h-16 w-full bg-[#fdfbf7] rounded-xl border border-gray-100 p-3 flex items-center gap-3">
                  <div className="w-8 h-8 rounded-lg bg-amber-50 flex items-center justify-center text-sm">⚔️</div>
                  <div className="flex-1">
                    <div className="h-2 w-full bg-gray-200 rounded-full mb-2"></div>
                    <div className="h-2 w-1/2 bg-gray-100 rounded-full"></div>
                  </div>
                </div>
              </div>
              <div className="h-10 w-full bg-amber-700 rounded-xl text-white flex items-center justify-center font-bold text-sm shadow-md">
                Complete Daily Mission
              </div>
            </motion.div>

            {/* Floating Element 1: Streak Badge */}
            <motion.div 
              className="absolute top-16 right-4 lg:right-12 bg-white p-4 rounded-2xl shadow-xl border border-gray-100 z-30 flex items-center gap-4"
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1, y: [0, -10, 0] }}
              transition={{ duration: 4, repeat: Infinity, ease: "easeInOut", delay: 0.5 }}
            >
              <div className="text-3xl">🕯️</div>
              <div>
                <p className="font-bold text-gray-900 font-serif">12 Day Streak</p>
                <p className="text-xs text-amber-700 font-medium">On fire for Christ!</p>
              </div>
            </motion.div>

            {/* Floating Element 2: Notification */}
            <motion.div 
              className="absolute bottom-24 left-0 lg:left-8 bg-white p-4 rounded-2xl shadow-xl border border-gray-100 z-30 flex items-center gap-3"
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1, y: [0, 10, 0] }}
              transition={{ duration: 5, repeat: Infinity, ease: "easeInOut", delay: 0.7 }}
            >
              <div className="w-10 h-10 rounded-full bg-blue-50 flex items-center justify-center text-lg">🙏</div>
              <div>
                <p className="font-bold text-gray-900 text-sm">New Prayer Request</p>
                <p className="text-xs text-gray-500">Maria is asking for prayers...</p>
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
      <section id="discover" className="py-20 px-6 bg-white border-y border-gray-100">
        <div className="max-w-4xl mx-auto text-center">
          <FadeUp>
            <h2 className="text-3xl md:text-4xl font-bold font-serif mb-6 text-gray-900">
              Notifications pull us everywhere — except toward God.
            </h2>
            <p className="text-gray-600 text-lg leading-relaxed mb-12">
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
                  className="bg-[#fdfbf7] rounded-2xl p-8 border border-gray-200 text-center h-full transition-shadow hover:shadow-md"
                >
                  <p className="text-4xl mb-4">{s.icon}</p>
                  <p className="text-3xl font-extrabold font-serif text-gray-900">{s.stat}</p>
                  <p className="text-sm text-gray-500 mt-2 font-medium uppercase tracking-wider">{s.label}</p>
                </motion.div>
              </FadeUp>
            ))}
          </div>
        </div>
      </section>

      {/* ── FEATURES ── */}
      <section className="py-24 px-6 bg-[#fdfbf7]">
        <div className="max-w-6xl mx-auto">
          <div className="flex flex-col md:flex-row justify-between items-end mb-12 gap-6">
            <FadeUp className="max-w-xl text-left">
              <h2 className="text-3xl md:text-4xl font-bold font-serif mb-4 text-gray-900">
                Your complete spiritual companion
              </h2>
              <p className="text-gray-600 text-lg">
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
                    className="bg-white rounded-2xl p-8 border border-gray-200 hover:border-amber-700/30 shadow-sm hover:shadow-lg transition h-full"
                  >
                    <div className="w-14 h-14 rounded-2xl bg-amber-50 text-2xl flex items-center justify-center mb-6 text-amber-700 group-hover:scale-110 transition-transform">
                      {f.icon}
                    </div>
                    <p className="font-bold text-xl text-gray-900 font-serif mb-2 group-hover:text-amber-700 transition-colors">{f.title}</p>
                    <p className="text-sm text-gray-600 leading-relaxed">{f.sub}</p>
                  </motion.div>
                </Link>
              </FadeUp>
            ))}
          </div>
        </div>
      </section>

      {/* ── HOW IT WORKS ── */}
      <section className="py-24 px-6 bg-white border-y border-gray-100">
        <div className="max-w-7xl mx-auto grid md:grid-cols-2 gap-16 items-center">
          <div className="order-2 md:order-1 relative h-[500px] bg-[#fdfbf7] rounded-3xl border border-gray-200 overflow-hidden flex items-center justify-center">
            {/* Minimal animated representation of the app's timeline */}
            <div className="w-64 space-y-4">
              {[1, 2, 3].map((item, i) => (
                <motion.div 
                  key={i}
                  className="bg-white p-4 rounded-xl shadow-sm border border-gray-100 flex gap-3 items-center"
                  initial={{ opacity: 0, x: -20 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: i * 0.2 }}
                >
                  <div className="w-10 h-10 rounded-full bg-amber-100 flex items-center justify-center font-bold text-amber-800 font-serif">
                    0{item}
                  </div>
                  <div className="flex-1">
                    <div className="h-2 w-full bg-gray-200 rounded-full mb-2"></div>
                    <div className="h-2 w-2/3 bg-gray-100 rounded-full"></div>
                  </div>
                </motion.div>
              ))}
            </div>
          </div>

          <div className="order-1 md:order-2">
            <FadeUp>
              <p className="text-sm font-bold text-amber-700 tracking-widest uppercase mb-2">Simple. Powerful. Sacred.</p>
              <h2 className="text-3xl md:text-5xl font-bold font-serif text-gray-900 mb-10">How Ignite works</h2>
            </FadeUp>
            
            <div className="space-y-8">
              {steps.map((step, i) => (
                <FadeUp key={step.num} delay={i * 0.1}>
                  <div className="flex gap-5 items-start group">
                    <div className="w-14 h-14 rounded-full bg-[#fdfbf7] border border-gray-200 flex items-center justify-center shrink-0 text-2xl group-hover:bg-amber-50 group-hover:border-amber-200 transition-colors">
                      {step.emoji}
                    </div>
                    <div>
                      <h3 className="font-bold text-xl text-gray-900 font-serif mb-2">{step.title}</h3>
                      <p className="text-gray-600 leading-relaxed text-lg">{step.desc}</p>
                    </div>
                  </div>
                </FadeUp>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ── TESTIMONIALS (ANIMATED TICKER) ── */}
      <section className="py-24 bg-[#fdfbf7] overflow-hidden">
        <div className="max-w-5xl mx-auto px-6 text-center mb-16">
          <FadeUp>
            <h2 className="text-3xl md:text-4xl font-bold font-serif text-gray-900">
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
              <div key={i} className="w-[350px] shrink-0 bg-white rounded-2xl p-8 border border-gray-200 shadow-sm flex flex-col">
                <div className="flex items-center gap-3 mb-6">
                  <div className="w-12 h-12 rounded-full bg-amber-50 flex items-center justify-center text-2xl">
                    {t.emoji}
                  </div>
                  <div className="text-left">
                    <p className="font-bold text-gray-900 font-serif">{t.name}</p>
                    <p className="text-xs text-gray-500 uppercase tracking-wider">{t.role}</p>
                  </div>
                </div>
                <p className="text-gray-600 italic font-serif leading-relaxed text-left flex-1">"{t.quote}"</p>
                <div className="mt-6 flex items-center gap-2">
                  <span className="text-amber-700">🕯️</span>
                  <span className="text-sm font-bold text-amber-700">{t.streak} day streak</span>
                </div>
              </div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* ── FINAL CTA ── */}
      <section className="py-32 px-6 text-center border-t border-gray-200 bg-white relative overflow-hidden">
        {/* Subtle radial glow */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full max-w-2xl h-full bg-amber-50/50 rounded-full blur-[120px] pointer-events-none" />
        
        <FadeUp className="max-w-2xl mx-auto relative z-10">
          <div className="w-16 h-16 rounded-2xl bg-amber-700 flex items-center justify-center mx-auto mb-8 shadow-md text-white text-2xl">
            ✝️
          </div>
          <h2 className="text-4xl md:text-6xl font-extrabold font-serif text-gray-900 leading-[1.1] mb-6">
            Your faith journey <br/> begins with one step.
          </h2>
          <p className="text-gray-600 text-lg mb-10 max-w-xl mx-auto">
            Join thousands of Jacobite Orthodox youth who are reclaiming five minutes a day for God.
          </p>
          <Link
            href="/login"
            className="inline-flex items-center justify-center gap-2 px-10 py-5 rounded-xl bg-amber-700 text-white font-bold text-lg hover:bg-amber-800 transition hover:scale-105 shadow-xl shadow-amber-900/10"
          >
            Join Ignite — It&apos;s Free
            <ArrowRight className="w-5 h-5" />
          </Link>
          <p className="text-gray-400 text-xs mt-12 tracking-[0.3em] uppercase">✝ Soli Deo Gloria ✝</p>
        </FadeUp>
      </section>
    </div>
  );
}
