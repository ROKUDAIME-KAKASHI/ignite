"use client";

import { motion } from "framer-motion";
import { FadeUp } from "./FadeUp";
import React from "react";

export function ProblemSection() {
  return (
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
  );
}
