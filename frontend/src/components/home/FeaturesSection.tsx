"use client";

import { motion } from "framer-motion";
import Link from "next/link";
import { FadeUp } from "./FadeUp";
import React from "react";

const featureCards = [
  { icon: "📖", title: "Sacred Scripture", sub: "All 66 Books", delay: 0 },
  { icon: "⚔️", title: "Daily Missions",   sub: "Works of Mercy", delay: 0.1 },
  { icon: "🕊️", title: "Parish Events",   sub: "Gather & Pray", delay: 0.2 },
  { icon: "🕯️", title: "Prayer Reminders",sub: "Never Forget", delay: 0.3 },
  { icon: "🙏", title: "Prayer Wall",      sub: "Community Faith", delay: 0.4 },
  { icon: "👑", title: "Grace Points",     sub: "Grow in Faith", delay: 0.5 },
];

export function FeaturesSection() {
  return (
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
  );
}
