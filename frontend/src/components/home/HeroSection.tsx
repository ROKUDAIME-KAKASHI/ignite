"use client";

import { motion } from "framer-motion";
import Link from "next/link";
import { ArrowRight, CheckCircle2 } from "lucide-react";
import { FadeUp } from "./FadeUp";
import React from "react";

export function HeroSection() {
  return (
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
  );
}
