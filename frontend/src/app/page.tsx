"use client";

import {
  motion,
  useScroll, useTransform,
  useMotionValue, useSpring,
  useInView,
  AnimatePresence,
} from "framer-motion";
import { useRef, useState, useEffect, useCallback } from "react";
import Link from "next/link";
import { ArrowRight, ChevronDown } from "lucide-react";
import { HeroNav } from "@/components/layout/HeroNav";

/* ─────────────────────────────────────────────────────────────────────────────
   HELPERS
───────────────────────────────────────────────────────────────────────────── */
function Cross({ className = "" }: { className?: string }) {
  return (
    <svg viewBox="0 0 40 40" className={className} fill="none" stroke="currentColor" strokeWidth="3.5" strokeLinecap="round">
      <line x1="20" y1="4" x2="20" y2="36" /><line x1="6" y1="14" x2="34" y2="14" />
    </svg>
  );
}

function FadeUp({ children, delay = 0, className = &quot;&quot; }: { children: React.ReactNode; delay?: number; className?: string }) {
  const ref = useRef(null);
  const inView = useInView(ref, { once: true, margin: &quot;-80px&quot; });
  return (
    <motion.div ref={ref} initial={{ opacity: 0, y: 40 }} animate={inView ? { opacity: 1, y: 0 } : {}}
      transition={{ duration: 0.7, delay, ease: [0.22, 1, 0.36, 1] }} className={className}>
      {children}
    </motion.div>
  );
}

function Counter({ to, suffix = &quot;&quot; }: { to: number; suffix?: string }) {
  const ref = useRef(null);
  const inView = useInView(ref, { once: true });
  const [count, setCount] = useState(0);
  useEffect(() => {
    if (!inView) return;
    let n = 0;
    const step = Math.ceil(to / (1800 / 16));
    const t = setInterval(() => { n += step; if (n >= to) { setCount(to); clearInterval(t); } else setCount(n); }, 16);
    return () => clearInterval(t);
  }, [inView, to]);
  return <span ref={ref}>{count.toLocaleString()}{suffix}</span>;
}

/* ─────────────────────────────────────────────────────────────────────────────
   3D TILT CARD — mouse tracking per-card
───────────────────────────────────────────────────────────────────────────── */
function TiltCard({ children, className = &quot;&quot;, intensity = 10 }: {
  children: React.ReactNode; className?: string; intensity?: number;
}) {
  const ref = useRef<HTMLDivElement>(null);
  const x = useMotionValue(0);
  const y = useMotionValue(0);
  const rotateX = useSpring(useTransform(y, [-0.5, 0.5], [intensity, -intensity]), { stiffness: 200, damping: 20 });
  const rotateY = useSpring(useTransform(x, [-0.5, 0.5], [-intensity, intensity]), { stiffness: 200, damping: 20 });
  const glareX = useTransform(x, [-0.5, 0.5], [0, 100]);
  const glareY = useTransform(y, [-0.5, 0.5], [0, 100]);

  const handleMouse = useCallback((e: React.MouseEvent) => {
    if (!ref.current) return;
    const rect = ref.current.getBoundingClientRect();
    x.set((e.clientX - rect.left) / rect.width - 0.5);
    y.set((e.clientY - rect.top) / rect.height - 0.5);
  }, [x, y]);

  const handleLeave = useCallback(() => { x.set(0); y.set(0); }, [x, y]);

  return (
    <motion.div
      ref={ref}
      onMouseMove={handleMouse}
      onMouseLeave={handleLeave}
      style={{ rotateX, rotateY, transformStyle: "preserve-3d" }}
      className={`relative ${className}`}
    >
      {/* Glare overlay */}
      <motion.div
        className="absolute inset-0 rounded-3xl pointer-events-none z-10 opacity-0 hover:opacity-100 transition-opacity duration-300"
        style={{
          background: `radial-gradient(circle at ${glareX}% ${glareY}%, rgba(255,255,255,0.15) 0%, transparent 60%)`,
        }}
      />
      {children}
    </motion.div>
  );
}

/* ─────────────────────────────────────────────────────────────────────────────
   FLOATING PARTICLE CROSSES
───────────────────────────────────────────────────────────────────────────── */
function FloatingParticles() {
  const particles = [
    { x: &quot;10%&quot;,  y: &quot;15%&quot;, size: 12, delay: 0,   duration: 6,  opacity: 0.12 },
    { x: &quot;85%&quot;,  y: &quot;20%&quot;, size: 20, delay: 1.2, duration: 8,  opacity: 0.08 },
    { x: "20%",  y: "70%", size: 8,  delay: 0.4, duration: 7,  opacity: 0.10 },
    { x: "75%",  y: "65%", size: 16, delay: 2,   duration: 9,  opacity: 0.07 },
    { x: "50%",  y: "85%", size: 10, delay: 0.8, duration: 6.5,opacity: 0.09 },
    { x: "90%",  y: "50%", size: 14, delay: 1.6, duration: 7.5,opacity: 0.06 },
    { x: "5%",   y: "45%", size: 18, delay: 2.4, duration: 8.5,opacity: 0.08 },
    { x: "60%",  y: "10%", size: 9,  delay: 0.3, duration: 6,  opacity: 0.11 },
    { x: "35%",  y: "55%", size: 22, delay: 1.8, duration: 10, opacity: 0.05 },
    { x: "70%",  y: "35%", size: 7,  delay: 3,   duration: 5.5,opacity: 0.13 },
  ];

  return (
    <div className="absolute inset-0 pointer-events-none overflow-hidden">
      {particles.map((p, i) => (
        <motion.div
          key={i}
          className="absolute text-white"
          style={{ left: p.x, top: p.y, opacity: p.opacity }}
          animate={{ y: [0, -20, 0], rotate: [0, 15, -15, 0], opacity: [p.opacity, p.opacity * 1.5, p.opacity] }}
          transition={{ duration: p.duration, delay: p.delay, repeat: Infinity, ease: "easeInOut" }}
        >
          <svg width={p.size} height={p.size} viewBox="0 0 20 20" fill="currentColor">
            <rect x="8.5" y="1" width="3" height="18" rx="1" />
            <rect x="1" y="6" width="18" height="3" rx="1" />
          </svg>
        </motion.div>
      ))}
    </div>
  );
}

/* ─────────────────────────────────────────────────────────────────────────────
   3D FEATURE CARDS (floating)
───────────────────────────────────────────────────────────────────────────── */
const featureCards = [
  { icon: &quot;📖&quot;, title: &quot;Sacred Scripture&quot;, sub: &quot;All 66 Books&quot;, gradient: &quot;gradient-royal&quot;,   delay: 0    },
  { icon: "⚔️", title: "Daily Missions",   sub: "Works of Mercy", gradient: "gradient-crimson", delay: 0.1  },
  { icon: "🕊️", title: "Parish Events",   sub: "Gather & Pray",  gradient: "gradient-life",    delay: 0.2  },
  { icon: "🕯️", title: "Prayer Reminders",sub: "Never Forget",   gradient: "gradient-spirit",  delay: 0.3  },
  { icon: "🙏", title: "Prayer Wall",      sub: "Community Faith",gradient: "gradient-lent",    delay: 0.4  },
  { icon: "👑", title: "Grace Points",     sub: "Grow in Faith",  gradient: "gradient-gold",    delay: 0.5  },
];

const steps = [
  { num: "01", title: "Begin Your Journey", desc: "Create your account, set your spiritual goals, choose your reading plan.", emoji: "🌅" },
  { num: "02", title: "Pray. Read. Act.",    desc: "Each day: a verse, a reflection, a prayer, and a mission. Five minutes can change everything.", emoji: "✝️" },
  { num: "03", title: "Grow Together",       desc: "Share events, lift prayer requests, earn Grace Points, and climb in faith — together.", emoji: "🌿" },
];

const testimonials = [
  { name: "Maria Santos", age: 19, role: "Youth Leader",          quote: "I hadn't prayed in weeks. Ignite's morning reminder changed everything. 94-day streak and counting.", emoji: "👩‍🦱", streak: 94  },
  { name: "James Okoro",  age: 17, role: "Member",               quote: "The missions made faith tangible. Acts of Charity bring me closer to God than I ever expected.",    emoji: "👦🏿", streak: 52  },
  { name: "Clara Reyes",  age: 22, role: "Praise & Worship Lead", quote: "The Bible reader is gorgeous. My small group bookmarks the same verses — it unites us.",             emoji: "👩🏻", streak: 120 },
];

/* ─────────────────────────────────────────────────────────────────────────────
   MAIN HERO PAGE
───────────────────────────────────────────────────────────────────────────── */
export default function HeroPage() {
  const heroRef = useRef<HTMLElement>(null);
  const { scrollYProgress } = useScroll({ target: heroRef, offset: [&quot;start start&quot;, &quot;end start&quot;] });

  // Parallax layers
  const layer1Y  = useTransform(scrollYProgress, [0, 1], [&quot;0%&quot;,   &quot;30%&quot;]);
  const layer2Y  = useTransform(scrollYProgress, [0, 1], ["0%",   "15%"]);
  const layer3Y  = useTransform(scrollYProgress, [0, 1], ["0%",   "8%"]);
  const heroFade = useTransform(scrollYProgress, [0, 0.7], [1, 0]);

  // Global mouse tracking for hero 3D
  const mouseX = useMotionValue(0);
  const mouseY = useMotionValue(0);
  const smoothX = useSpring(mouseX, { stiffness: 60, damping: 20 });
  const smoothY = useSpring(mouseY, { stiffness: 60, damping: 20 });

  // Derived hero rotations
  const heroRotateY = useTransform(smoothX, [-400, 400], [-6, 6]);
  const heroRotateX = useTransform(smoothY, [-300, 300], [4, -4]);

  const handleHeroMouse = useCallback((e: React.MouseEvent) => {
    mouseX.set(e.clientX - window.innerWidth  / 2);
    mouseY.set(e.clientY - window.innerHeight / 2);
  }, [mouseX, mouseY]);
  const handleHeroLeave = useCallback(() => { mouseX.set(0); mouseY.set(0); }, [mouseX, mouseY]);

  return (
    <div className="flex-1 overflow-y-auto overflow-x-hidden bg-background">
      <HeroNav />

      {/* ═══════════════════════════════════════════════════════════
          HERO — Full 3D immersive
      ═══════════════════════════════════════════════════════════ */}
      <section
        ref={heroRef}
        onMouseMove={handleHeroMouse}
        onMouseLeave={handleHeroLeave}
        className="relative min-h-screen flex flex-col items-center justify-center overflow-hidden gradient-dawn"
        style={{ perspective: "1200px" }}
      >
        {/* ── Layer 1: Deep background orbs (slowest parallax) ── */}
        <motion.div style={{ y: layer1Y }} className="absolute inset-0 pointer-events-none">
          <div className="absolute -top-32 -left-32 w-[500px] h-[500px] rounded-full bg-purple-500/20 blur-[100px]" />
          <div className="absolute -bottom-32 -right-32 w-[500px] h-[500px] rounded-full bg-amber-400/20 blur-[100px]" />
          <div className="absolute top-1/2 left-1/4 w-64 h-64 rounded-full bg-blue-400/15 blur-[60px]" />
        </motion.div>

        {/* ── Layer 2: Floating particle crosses ── */}
        <motion.div style={{ y: layer2Y }} className="absolute inset-0 pointer-events-none">
          <FloatingParticles />
        </motion.div>

        {/* ── Layer 3: Big cross watermark (medium parallax, 3D rotated) ── */}
        <motion.div
          style={{ y: layer3Y, rotateY: heroRotateY, rotateX: heroRotateX, transformStyle: "preserve-3d" }}
          className="absolute inset-0 pointer-events-none flex items-center justify-center"
        >
          <motion.svg
            viewBox="0 0 600 600"
            className="w-[500px] h-[500px] opacity-[0.055] text-white"
            fill="none" stroke="currentColor" strokeWidth="16" strokeLinecap="round"
            animate={{ rotate: [0, 1, -1, 0] }}
            transition={{ duration: 12, repeat: Infinity, ease: "easeInOut" }}
          >
            <line x1="300" y1="40"  x2="300" y2="560" />
            <line x1="60"  y1="190" x2="540" y2="190" />
          </motion.svg>
        </motion.div>

        {/* ── Main content: 3D tracking card ── */}
        <motion.div
          style={{
            opacity: heroFade,
            rotateX: heroRotateX,
            rotateY: heroRotateY,
            transformStyle: "preserve-3d",
            z: 60,
          }}
          initial={{ opacity: 0, scale: 0.94, z: -100 }}
          animate={{ opacity: 1, scale: 1, z: 60 }}
          transition={{ duration: 1, ease: [0.22, 1, 0.36, 1] }}
          className="relative z-10 text-center px-6 max-w-3xl mx-auto"
        >
          {/* Brand badge */}
          <motion.div
            initial={{ opacity: 0, y: -20, scale: 0.8 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            transition={{ duration: 0.7, delay: 0.1 }}
            className="flex items-center justify-center mb-8"
          >
            <div className="flex items-center gap-3 bg-white/12 backdrop-blur-xl border border-white/20 rounded-2xl px-5 py-3 shadow-2xl"
              style={{ transform: "translateZ(40px)", boxShadow: "0 8px 40px rgba(0,0,0,0.3), inset 0 1px 0 rgba(255,255,255,0.15)" }}
            >
              <motion.div
                animate={{ rotateY: [0, 360] }}
                transition={{ duration: 8, repeat: Infinity, ease: "linear" }}
                className="w-8 h-8 rounded-xl gradient-gold flex items-center justify-center halo-glow"
              >
                <Cross className="w-4 h-4 text-white" />
              </motion.div>
              <span className="text-white font-extrabold text-lg font-serif tracking-wide">Ignite</span>
              <span className="text-white/50 text-xs font-medium border-l border-white/20 pl-3">Youth Ministry Platform</span>
            </div>
          </motion.div>

          {/* Headline */}
          <motion.h1
            initial={{ opacity: 0, y: 40 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.9, delay: 0.25, ease: [0.22, 1, 0.36, 1] }}
            className="text-5xl md:text-7xl font-extrabold text-white font-serif leading-[1.07] mb-6"
            style={{ transform: "translateZ(20px)", textShadow: "0 4px 40px rgba(0,0,0,0.4)" }}
          >
            In a world that{&quot; &quot;}
            <motion.span
              className="inline-block"
              animate={{ backgroundPosition: ["0% 50%", "100% 50%", "0% 50%"] }}
              transition={{ duration: 4, repeat: Infinity }}
              style={{
                background: "linear-gradient(90deg, #fbbf24, #f59e0b, #fde68a, #f59e0b, #fbbf24)",
                backgroundSize: "200%",
                WebkitBackgroundClip: "text",
                WebkitTextFillColor: "transparent",
                backgroundClip: "text",
              }}
            >
              never stops
            </motion.span>
            ,<br />your faith{&quot; &quot;}
            <motion.span
              className="inline-block"
              animate={{ backgroundPosition: ["0% 50%", "100% 50%", "0% 50%"] }}
              transition={{ duration: 4, repeat: Infinity, delay: 0.5 }}
              style={{
                background: "linear-gradient(90deg, #fbbf24, #f59e0b, #fde68a, #f59e0b, #fbbf24)",
                backgroundSize: "200%",
                WebkitBackgroundClip: "text",
                WebkitTextFillColor: "transparent",
                backgroundClip: "text",
              }}
            >
              never should.
            </motion.span>
          </motion.h1>

          {/* Sub */}
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 0.45 }}
            className="text-white/75 text-lg md:text-xl font-medium leading-relaxed mb-3 max-w-xl mx-auto"
          >
            Your daily spiritual companion for scripture, prayer, missions and community — built for Catholic youth navigating the fast-paced world.
          </motion.p>

          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.6 }}
            className="text-amber-300/80 text-sm italic font-serif mb-10"
          >
            &quot;Come, follow me.&quot; — Matthew 4:19
          </motion.p>

          {/* CTAs */}
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.7 }}
            className="flex flex-col sm:flex-row gap-3 justify-center"
            style={{ transform: "translateZ(30px)" }}
          >
            <Link
              href="/login"
              className="group inline-flex items-center justify-center gap-2 px-8 py-4 rounded-2xl gradient-gold text-white font-extrabold text-base shadow-2xl halo-glow hover:scale-[1.04] active:scale-[0.97] transition-all duration-200"
            >
              Begin Your Journey
              <motion.span
                animate={{ x: [0, 4, 0] }}
                transition={{ duration: 1.5, repeat: Infinity }}
              >
                <ArrowRight className="w-5 h-5" />
              </motion.span>
            </Link>
            <a
              href="#discover"
              className="inline-flex items-center justify-center gap-2 px-8 py-4 rounded-2xl bg-white/12 backdrop-blur-md border border-white/20 text-white font-bold text-base hover:bg-white/22 transition-all hover:scale-[1.02] active:scale-[0.98] duration-200"
            >
              Discover More
              <motion.span animate={{ y: [0, 5, 0] }} transition={{ duration: 1.8, repeat: Infinity }}>
                <ChevronDown className="w-5 h-5" />
              </motion.span>
            </a>
          </motion.div>

          {/* Quick stats */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.95 }}
            className="flex justify-center gap-8 mt-14 flex-wrap"
          >
            {[
              { value: &quot;2,400+&quot;, label: &quot;Youth Members&quot; },
              { value: &quot;66&quot;,     label: &quot;Books of Bible&quot; },
              { value: "∞",      label: "God's Grace" },
            ].map((s) => (
              <div key={s.label} className="text-center">
                <p className="text-2xl font-extrabold text-white font-serif drop-shadow-lg">{s.value}</p>
                <p className="text-white/45 text-xs font-medium uppercase tracking-widest">{s.label}</p>
              </div>
            ))}
          </motion.div>
        </motion.div>

        {/* ── Floating 3D cards in background ── */}
        <div className="absolute inset-0 pointer-events-none overflow-hidden" style={{ perspective: "800px" }}>
          {/* Top-left floating card */}
          <motion.div
            initial={{ opacity: 0, x: -60, rotateY: -25 }}
            animate={{ opacity: 1, x: 0, rotateY: -15 }}
            transition={{ duration: 1.2, delay: 0.8 }}
            style={{ transformStyle: "preserve-3d" }}
            className="absolute top-[15%] left-[2%] w-40 hidden lg:block"
          >
            <motion.div
              animate={{ y: [0, -12, 0], rotateZ: [-2, 1, -2] }}
              transition={{ duration: 6, repeat: Infinity, ease: "easeInOut" }}
              className="bg-white/10 backdrop-blur-xl border border-white/20 rounded-2xl p-4 shadow-2xl"
            >
              <div className="w-8 h-8 rounded-xl gradient-royal flex items-center justify-center text-lg mb-2 shadow-md">📖</div>
              <p className="text-white text-xs font-bold font-serif">Sacred Scripture</p>
              <p className="text-white/50 text-[10px]">66 Books</p>
            </motion.div>
          </motion.div>

          {/* Top-right floating card */}
          <motion.div
            initial={{ opacity: 0, x: 60, rotateY: 25 }}
            animate={{ opacity: 1, x: 0, rotateY: 15 }}
            transition={{ duration: 1.2, delay: 1.0 }}
            style={{ transformStyle: "preserve-3d" }}
            className="absolute top-[20%] right-[3%] w-40 hidden lg:block"
          >
            <motion.div
              animate={{ y: [0, -10, 0], rotateZ: [2, -1, 2] }}
              transition={{ duration: 5, repeat: Infinity, ease: "easeInOut", delay: 1 }}
              className="bg-white/10 backdrop-blur-xl border border-white/20 rounded-2xl p-4 shadow-2xl"
            >
              <div className="w-8 h-8 rounded-xl gradient-crimson flex items-center justify-center text-lg mb-2 shadow-md">⚔️</div>
              <p className="text-white text-xs font-bold font-serif">Daily Missions</p>
              <p className="text-white/50 text-[10px]">Works of Mercy</p>
            </motion.div>
          </motion.div>

          {/* Bottom-left */}
          <motion.div
            initial={{ opacity: 0, x: -40, rotateY: -20 }}
            animate={{ opacity: 1, x: 0, rotateY: -10 }}
            transition={{ duration: 1.2, delay: 1.2 }}
            style={{ transformStyle: "preserve-3d" }}
            className="absolute bottom-[20%] left-[3%] w-44 hidden lg:block"
          >
            <motion.div
              animate={{ y: [0, -14, 0], rotateZ: [-1, 2, -1] }}
              transition={{ duration: 7, repeat: Infinity, ease: "easeInOut", delay: 0.5 }}
              className="bg-white/10 backdrop-blur-xl border border-white/20 rounded-2xl p-4 shadow-2xl"
            >
              <div className="w-8 h-8 rounded-xl gradient-life flex items-center justify-center text-lg mb-2 shadow-md">🕊️</div>
              <p className="text-white text-xs font-bold font-serif">Prayer Wall</p>
              <p className="text-white/50 text-[10px]">Community Faith</p>
              <div className="flex items-center gap-1 mt-2">
                <div className="w-1.5 h-1.5 rounded-full bg-green-400 animate-pulse" />
                <p className="text-white/40 text-[10px]">247 prayers today</p>
              </div>
            </motion.div>
          </motion.div>

          {/* Bottom-right */}
          <motion.div
            initial={{ opacity: 0, x: 40, rotateY: 20 }}
            animate={{ opacity: 1, x: 0, rotateY: 10 }}
            transition={{ duration: 1.2, delay: 1.4 }}
            style={{ transformStyle: "preserve-3d" }}
            className="absolute bottom-[22%] right-[3%] w-44 hidden lg:block"
          >
            <motion.div
              animate={{ y: [0, -8, 0], rotateZ: [1, -2, 1] }}
              transition={{ duration: 6.5, repeat: Infinity, ease: "easeInOut", delay: 1.5 }}
              className="bg-white/10 backdrop-blur-xl border border-white/20 rounded-2xl p-4 shadow-2xl"
            >
              <div className="w-8 h-8 rounded-xl gradient-gold flex items-center justify-center text-lg mb-2 shadow-md">🕯️</div>
              <p className="text-white text-xs font-bold font-serif">12 Day Streak</p>
              <div className="flex gap-0.5 mt-2">
                {Array.from({ length: 7 }).map((_, i) => (
                  <div key={i} className={`h-1.5 flex-1 rounded-full ${i < 5 ? "bg-amber-400" : "bg-white/20"}`} />
                ))}
              </div>
            </motion.div>
          </motion.div>
        </div>

        {/* Scroll indicator */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1.6 }}
          className="absolute bottom-8 left-1/2 -translate-x-1/2 z-10"
        >
          <motion.div animate={{ y: [0, 12, 0] }} transition={{ duration: 2, repeat: Infinity }}
            className="w-6 h-10 rounded-full border-2 border-white/30 flex items-start justify-center pt-2">
            <div className="w-1 h-2 bg-white/60 rounded-full" />
          </motion.div>
        </motion.div>
      </section>

      {/* ═══════════════════════════════════════════════════════════
          THE PROBLEM
      ═══════════════════════════════════════════════════════════ */}
      <section id="discover" className="py-28 px-6 bg-background">
        <div className="max-w-3xl mx-auto text-center">
          <FadeUp>
            <p className="text-[10px] font-bold text-primary uppercase tracking-[0.3em] mb-4">The Challenge We Face</p>
            <h2 className="text-4xl md:text-5xl font-extrabold font-serif text-foreground leading-tight mb-6">
              Notifications pull us<br />
              everywhere —{&quot; &quot;}
              <span style={{ background: "linear-gradient(135deg,#b7791f,#d4a017,#f6c90e)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent", backgroundClip: "text" }}>
                except toward God.
              </span>
            </h2>
            <p className="text-muted-foreground text-lg leading-relaxed">
              The average young person checks their phone <strong className="text-foreground">96 times a day</strong> — yet finds no time for a moment of prayer.
              Social media, streaming, endless noise — all fighting for attention, none pointing toward the eternal.{&quot; &quot;}
              <strong className="text-foreground">Ignite changes that.</strong>
            </p>
          </FadeUp>

          <div className="grid grid-cols-3 gap-5 mt-14">
            {[
              { icon: &quot;📱&quot;, stat: &quot;96×&quot;,   label: &quot;Phone checks per day&quot;,       color: &quot;border-red-200/60 dark:border-red-900/30 bg-red-50/50 dark:bg-red-900/10&quot; },
              { icon: "🙏", stat: "3 min", label: "Avg daily prayer for youth", color: "border-amber-200/60 dark:border-amber-900/30 bg-amber-50/50 dark:bg-amber-900/10" },
              { icon: "✝️", stat: "5 min", label: "All it takes to transform",  color: "border-green-200/60 dark:border-green-900/30 bg-green-50/50 dark:bg-green-900/10" },
            ].map((s, i) => (
              <FadeUp key={s.label} delay={i * 0.1}>
                <TiltCard intensity={8}>
                  <div className={`bg-card rounded-3xl p-5 border card-holy text-center h-full ${s.color}`}>
                    <p className="text-3xl mb-3">{s.icon}</p>
                    <p className="text-2xl font-extrabold text-foreground font-serif">{s.stat}</p>
                    <p className="text-xs text-muted-foreground mt-1.5 leading-snug">{s.label}</p>
                  </div>
                </TiltCard>
              </FadeUp>
            ))}
          </div>
        </div>
      </section>

      {/* ═══════════════════════════════════════════════════════════
          FEATURES — 3D tilt cards
      ═══════════════════════════════════════════════════════════ */}
      <section className="py-28 px-6 bg-parchment dark:bg-card/20" style={{ perspective: "1000px" }}>
        <div className="max-w-4xl mx-auto">
          <FadeUp className="text-center mb-16">
            <p className="text-[10px] font-bold text-primary uppercase tracking-[0.3em] mb-3">Everything You Need</p>
            <h2 className="text-4xl md:text-5xl font-extrabold font-serif text-foreground leading-tight mb-4">
              Your complete{&quot; &quot;}
              <span style={{ background: "linear-gradient(135deg,#b7791f,#f6c90e)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent", backgroundClip: "text" }}>
                spiritual companion.
              </span>
            </h2>
            <p className="text-muted-foreground text-base max-w-xl mx-auto">
              Six powerful modules bringing your faith alive — every single day, no matter how busy life gets.
            </p>
          </FadeUp>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-5">
            {featureCards.map((f, i) => (
              <FadeUp key={f.title} delay={f.delay}>
                <TiltCard intensity={12} className="h-full">
                  <Link href="/login" className="block h-full group">
                    <div className="relative h-full bg-card rounded-3xl p-6 border border-border/60 card-holy overflow-hidden cursor-pointer"
                      style={{ boxShadow: "0 4px 32px rgba(0,0,0,0.06), inset 0 1px 0 rgba(255,255,255,0.5)" }}>
                      {/* Gradient orb */}
                      <div className={`absolute -top-10 -right-10 w-36 h-36 rounded-full ${f.gradient} opacity-10 blur-2xl group-hover:opacity-25 transition-opacity duration-500`} />
                      {/* Depth shimmer line */}
                      <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-white/60 to-transparent" />
                      <div className="relative z-10">
                        <motion.div
                          whileHover={{ scale: 1.12, rotate: [0, -5, 5, 0] }}
                          transition={{ duration: 0.4 }}
                          className={`w-12 h-12 rounded-2xl ${f.gradient} flex items-center justify-center text-2xl shadow-lg mb-4`}
                        >
                          {f.icon}
                        </motion.div>
                        <p className="font-bold text-base text-foreground font-serif mb-1 group-hover:text-primary transition-colors">{f.title}</p>
                        <p className="text-xs text-muted-foreground">{f.sub}</p>
                      </div>
                    </div>
                  </Link>
                </TiltCard>
              </FadeUp>
            ))}
          </div>
        </div>
      </section>

      {/* ═══════════════════════════════════════════════════════════
          STATS
      ═══════════════════════════════════════════════════════════ */}
      <section className="py-24 px-6 gradient-dawn relative overflow-hidden">
        <svg viewBox="0 0 800 400" className="absolute inset-0 w-full h-full opacity-[0.05] text-white" fill="none" stroke="currentColor" strokeWidth="8">
          <line x1="400" y1="0" x2="400" y2="400" /><line x1="0" y1="140" x2="800" y2="140" />
        </svg>
        <FloatingParticles />
        <div className="max-w-4xl mx-auto relative z-10">
          <FadeUp className="text-center mb-14">
            <h2 className="text-3xl font-extrabold font-serif text-white">A community growing in faith</h2>
          </FadeUp>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-5">
            {[
              { to: 2400,  suffix: &quot;+&quot;, label: &quot;Youth Members&quot;,        emoji: &quot;👥&quot; },
              { to: 66,    suffix: &quot;&quot;,  label: "Books of the Bible",   emoji: "📖" },
              { to: 14700, suffix: "+", label: "Prayers Offered",      emoji: "🙏" },
              { to: 48000, suffix: "+", label: "Scripture Verses Read", emoji: "✝️" },
            ].map((s, i) => (
              <FadeUp key={s.label} delay={i * 0.1}>
                <TiltCard intensity={10}>
                  <div className="text-center bg-white/10 backdrop-blur-sm rounded-2xl p-5 border border-white/20 h-full"
                    style={{ boxShadow: "0 4px 24px rgba(0,0,0,0.15), inset 0 1px 0 rgba(255,255,255,0.15)" }}>
                    <p className="text-3xl mb-2">{s.emoji}</p>
                    <p className="text-3xl font-extrabold text-white font-serif">
                      <Counter to={s.to} suffix={s.suffix} />
                    </p>
                    <p className="text-white/55 text-xs mt-1 font-medium uppercase tracking-wider">{s.label}</p>
                  </div>
                </TiltCard>
              </FadeUp>
            ))}
          </div>
        </div>
      </section>

      {/* ═══════════════════════════════════════════════════════════
          HOW IT WORKS
      ═══════════════════════════════════════════════════════════ */}
      <section className="py-28 px-6 bg-background">
        <div className="max-w-3xl mx-auto">
          <FadeUp className="text-center mb-16">
            <p className="text-[10px] font-bold text-primary uppercase tracking-[0.3em] mb-3">Simple. Powerful. Sacred.</p>
            <h2 className="text-4xl font-extrabold font-serif text-foreground">How Ignite works</h2>
          </FadeUp>
          <div className="space-y-5">
            {steps.map((step, i) => (
              <FadeUp key={step.num} delay={i * 0.12}>
                <TiltCard intensity={6}>
                  <div className="flex gap-5 bg-card rounded-3xl p-6 border border-border/60 card-holy"
                    style={{ boxShadow: "0 4px 28px rgba(183,121,31,0.06), inset 0 1px 0 rgba(255,255,255,0.5)" }}>
                    <motion.div
                      whileHover={{ rotateY: 180 }}
                      transition={{ duration: 0.6 }}
                      className="w-14 h-14 rounded-2xl gradient-gold flex items-center justify-center shrink-0 halo-glow shadow-lg"
                    >
                      <span className="text-2xl">{step.emoji}</span>
                    </motion.div>
                    <div>
                      <p className="text-[10px] font-bold text-primary uppercase tracking-widest mb-1">Step {step.num}</p>
                      <h3 className="font-bold text-xl text-foreground font-serif mb-2">{step.title}</h3>
                      <p className="text-muted-foreground text-sm leading-relaxed">{step.desc}</p>
                    </div>
                  </div>
                </TiltCard>
              </FadeUp>
            ))}
          </div>
        </div>
      </section>

      {/* ═══════════════════════════════════════════════════════════
          TESTIMONIALS
      ═══════════════════════════════════════════════════════════ */}
      <section className="py-28 px-6 bg-parchment dark:bg-card/20">
        <div className="max-w-4xl mx-auto">
          <FadeUp className="text-center mb-14">
            <p className="text-[10px] font-bold text-primary uppercase tracking-[0.3em] mb-3">Voices of the Community</p>
            <h2 className="text-4xl font-extrabold font-serif text-foreground">
              Real youth.{&quot; &quot;}
              <span style={{ background: "linear-gradient(135deg,#b7791f,#f6c90e)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent", backgroundClip: "text" }}>
                Real transformation.
              </span>
            </h2>
          </FadeUp>
          <div className="grid md:grid-cols-3 gap-5">
            {testimonials.map((t, i) => (
              <FadeUp key={t.name} delay={i * 0.12}>
                <TiltCard intensity={9} className="h-full">
                  <div className="bg-card rounded-3xl p-6 border border-border/60 card-holy h-full flex flex-col"
                    style={{ boxShadow: "0 4px 28px rgba(183,121,31,0.06), inset 0 1px 0 rgba(255,255,255,0.5)" }}>
                    <div className="flex items-center gap-3 mb-4">
                      <motion.div
                        whileHover={{ scale: 1.1, rotate: 5 }}
                        className="w-12 h-12 rounded-2xl gradient-gold flex items-center justify-center text-2xl shadow-md"
                      >
                        {t.emoji}
                      </motion.div>
                      <div>
                        <p className="font-bold text-foreground text-sm font-serif">{t.name}</p>
                        <p className="text-xs text-muted-foreground">{t.role} · Age {t.age}</p>
                      </div>
                    </div>
                    <p className="text-sm text-muted-foreground italic leading-relaxed font-serif flex-1">&quot;{t.quote}&quot;</p>
                    <div className="mt-4 flex items-center gap-1.5 bg-amber-50 dark:bg-amber-900/20 rounded-xl px-3 py-2 border border-amber-200/50 dark:border-amber-800/30">
                      <span className="candle-flicker text-sm">🕯️</span>
                      <span className="text-xs font-bold text-primary">{t.streak} day streak</span>
                    </div>
                  </div>
                </TiltCard>
              </FadeUp>
            ))}
          </div>
        </div>
      </section>

      {/* ═══════════════════════════════════════════════════════════
          FINAL CTA
      ═══════════════════════════════════════════════════════════ */}
      <section className="py-32 px-6 gradient-dawn relative overflow-hidden">
        <FloatingParticles />
        <div className="absolute inset-0 pointer-events-none">
          <svg viewBox="0 0 800 400" className="absolute inset-0 w-full h-full opacity-[0.06] text-white" fill="none" stroke="currentColor" strokeWidth="10">
            <line x1="400" y1="0" x2="400" y2="400" /><line x1="0" y1="150" x2="800" y2="150" />
          </svg>
          <div className="absolute -top-20 -left-20 w-80 h-80 rounded-full bg-amber-400/20 blur-3xl" />
          <div className="absolute -bottom-20 -right-20 w-80 h-80 rounded-full bg-purple-400/20 blur-3xl" />
        </div>
        <FadeUp className="relative z-10 text-center max-w-2xl mx-auto">
          <motion.div
            animate={{ rotateY: [0, 360] }}
            transition={{ duration: 12, repeat: Infinity, ease: "linear" }}
            className="w-16 h-16 rounded-2xl gradient-gold flex items-center justify-center mx-auto mb-6 shadow-2xl halo-glow"
            style={{ transformStyle: "preserve-3d" }}
          >
            <Cross className="w-8 h-8 text-white" />
          </motion.div>
          <h2 className="text-4xl md:text-5xl font-extrabold font-serif text-white leading-tight mb-4">
            Your faith journey<br />begins with one step.
          </h2>
          <p className="text-white/70 text-lg mb-3">Join thousands of Catholic youth who are reclaiming five minutes a day for God.</p>
          <p className="text-amber-300/80 italic font-serif text-sm mb-10">
            &quot;I am the way, the truth, and the life.&quot; — John 14:6
          </p>
          <Link
            href="/login"
            className="inline-flex items-center justify-center gap-2 px-10 py-4 rounded-2xl gradient-gold text-white font-extrabold text-lg shadow-2xl halo-glow hover:opacity-90 hover:scale-[1.03] active:scale-[0.98] transition-all"
          >
            Join Ignite — It&apos;s Free
            <motion.span animate={{ x: [0, 5, 0] }} transition={{ duration: 1.5, repeat: Infinity }}>
              <ArrowRight className="w-5 h-5" />
            </motion.span>
          </Link>
          <p className="text-white/35 text-xs mt-8 tracking-[0.3em] uppercase">✝ Soli Deo Gloria ✝</p>
        </FadeUp>
      </section>
    </div>
  );
}
