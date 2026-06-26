"use client";

import { motion } from "framer-motion";
import Link from "next/link";
import { ArrowRight, ChevronDown } from "lucide-react";
import { HeroNav } from "@/components/layout/HeroNav";
import React from "react";

function FadeUp({ children, delay = 0, className = "" }: { children: React.ReactNode; delay?: number; className?: string }) {
  return (
    <motion.div initial={{ opacity: 0, y: 30 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true, margin: "-50px" }}
      transition={{ duration: 0.6, delay, ease: "easeOut" }} className={className}>
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
  return (
    <div className="flex-1 bg-[#fdfbf7] text-gray-900 font-sans min-h-screen">
      <HeroNav />

      {/* HERO SECTION */}
      <section className="pt-40 pb-20 px-6 flex flex-col items-center justify-center text-center">
        <FadeUp>
          <div className="inline-flex items-center gap-3 bg-white border border-gray-200 rounded-full px-5 py-2 mb-8 shadow-sm">
            <span className="text-amber-700 font-extrabold text-sm tracking-widest uppercase">Ignite Youth</span>
            <span className="text-gray-400 text-xs font-medium border-l border-gray-200 pl-3">Ministry Platform</span>
          </div>
        </FadeUp>
        
        <FadeUp delay={0.1}>
          <h1 className="text-5xl md:text-7xl font-extrabold font-serif leading-[1.1] mb-6 text-gray-900 max-w-4xl mx-auto">
            In a world that never stops, <br className="hidden md:block" />
            <span className="text-amber-700">your faith never should.</span>
          </h1>
        </FadeUp>

        <FadeUp delay={0.2}>
          <p className="text-gray-600 text-lg md:text-xl leading-relaxed mb-10 max-w-2xl mx-auto">
            Your daily spiritual companion for scripture, prayer, missions and community — built for Jacobite Orthodox youth navigating the fast-paced world.
          </p>
        </FadeUp>

        <FadeUp delay={0.3}>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link
              href="/login"
              className="inline-flex items-center justify-center gap-2 px-8 py-4 rounded-xl bg-amber-700 text-white font-bold text-base hover:bg-amber-800 transition-colors"
            >
              Begin Your Journey <ArrowRight className="w-5 h-5" />
            </Link>
            <a
              href="#discover"
              className="inline-flex items-center justify-center gap-2 px-8 py-4 rounded-xl bg-white border border-gray-200 text-gray-800 font-bold text-base hover:bg-gray-50 transition-colors"
            >
              Discover More <ChevronDown className="w-5 h-5" />
            </a>
          </div>
        </FadeUp>
      </section>

      {/* THE PROBLEM */}
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
                <div className="bg-[#fdfbf7] rounded-2xl p-8 border border-gray-200 text-center h-full">
                  <p className="text-4xl mb-4">{s.icon}</p>
                  <p className="text-3xl font-extrabold font-serif text-gray-900">{s.stat}</p>
                  <p className="text-sm text-gray-500 mt-2 font-medium uppercase tracking-wider">{s.label}</p>
                </div>
              </FadeUp>
            ))}
          </div>
        </div>
      </section>

      {/* FEATURES */}
      <section className="py-20 px-6 bg-[#fdfbf7]">
        <div className="max-w-5xl mx-auto">
          <FadeUp className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold font-serif mb-4 text-gray-900">
              Your complete spiritual companion
            </h2>
            <p className="text-gray-600 text-lg max-w-xl mx-auto">
              Six powerful modules bringing your faith alive — every single day.
            </p>
          </FadeUp>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {featureCards.map((f) => (
              <FadeUp key={f.title} delay={f.delay}>
                <Link href="/login" className="block h-full group">
                  <div className="bg-white rounded-2xl p-6 border border-gray-200 hover:border-amber-700/30 hover:shadow-md transition-all h-full">
                    <div className="w-12 h-12 rounded-xl bg-amber-50 text-2xl flex items-center justify-center mb-4 text-amber-700">
                      {f.icon}
                    </div>
                    <p className="font-bold text-lg text-gray-900 font-serif mb-1 group-hover:text-amber-700 transition-colors">{f.title}</p>
                    <p className="text-sm text-gray-600">{f.sub}</p>
                  </div>
                </Link>
              </FadeUp>
            ))}
          </div>
        </div>
      </section>

      {/* HOW IT WORKS */}
      <section className="py-20 px-6 bg-white border-y border-gray-100">
        <div className="max-w-3xl mx-auto">
          <FadeUp className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold font-serif text-gray-900">How Ignite works</h2>
          </FadeUp>
          <div className="space-y-6">
            {steps.map((step, i) => (
              <FadeUp key={step.num} delay={i * 0.1}>
                <div className="flex gap-6 bg-[#fdfbf7] rounded-2xl p-6 border border-gray-200 items-start md:items-center">
                  <div className="w-16 h-16 rounded-full bg-white shadow-sm border border-gray-100 flex items-center justify-center shrink-0 text-3xl">
                    {step.emoji}
                  </div>
                  <div>
                    <p className="text-xs font-bold text-amber-700 tracking-widest uppercase mb-1">Step {step.num}</p>
                    <h3 className="font-bold text-xl text-gray-900 font-serif mb-2">{step.title}</h3>
                    <p className="text-gray-600 leading-relaxed">{step.desc}</p>
                  </div>
                </div>
              </FadeUp>
            ))}
          </div>
        </div>
      </section>

      {/* TESTIMONIALS */}
      <section className="py-20 px-6 bg-[#fdfbf7]">
        <div className="max-w-5xl mx-auto">
          <FadeUp className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold font-serif text-gray-900">
              Voices of the Community
            </h2>
          </FadeUp>
          <div className="grid md:grid-cols-3 gap-6">
            {testimonials.map((t, i) => (
              <FadeUp key={t.name} delay={i * 0.1}>
                <div className="bg-white rounded-2xl p-8 border border-gray-200 h-full flex flex-col">
                  <div className="flex items-center gap-3 mb-6">
                    <div className="w-12 h-12 rounded-full bg-amber-50 flex items-center justify-center text-2xl">
                      {t.emoji}
                    </div>
                    <div>
                      <p className="font-bold text-gray-900 font-serif">{t.name}</p>
                      <p className="text-xs text-gray-500 uppercase tracking-wider">{t.role}</p>
                    </div>
                  </div>
                  <p className="text-gray-600 italic font-serif leading-relaxed flex-1">"{t.quote}"</p>
                  <div className="mt-6 flex items-center gap-2">
                    <span className="text-amber-700">🕯️</span>
                    <span className="text-sm font-bold text-amber-700">{t.streak} day streak</span>
                  </div>
                </div>
              </FadeUp>
            ))}
          </div>
        </div>
      </section>

      {/* FINAL CTA */}
      <section className="py-24 px-6 text-center border-t border-gray-200 bg-white">
        <FadeUp className="max-w-2xl mx-auto">
          <div className="w-16 h-16 rounded-2xl bg-amber-700 flex items-center justify-center mx-auto mb-8 shadow-sm text-white text-2xl">
            ✝️
          </div>
          <h2 className="text-4xl md:text-5xl font-extrabold font-serif text-gray-900 leading-tight mb-6">
            Your faith journey begins with one step.
          </h2>
          <p className="text-gray-600 text-lg mb-10">Join thousands of Jacobite Orthodox youth who are reclaiming five minutes a day for God.</p>
          <Link
            href="/login"
            className="inline-flex items-center justify-center gap-2 px-10 py-4 rounded-xl bg-amber-700 text-white font-bold text-lg hover:bg-amber-800 transition-colors shadow-sm"
          >
            Join Ignite — It&apos;s Free
            <ArrowRight className="w-5 h-5" />
          </Link>
          <p className="text-gray-400 text-xs mt-10 tracking-[0.3em] uppercase">✝ Soli Deo Gloria ✝</p>
        </FadeUp>
      </section>
    </div>
  );
}
