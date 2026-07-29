"use client";

import { Button } from "@/components/ui/button";
import { ArrowLeft, BookOpen, AlertCircle, Handshake } from "lucide-react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";

export default function TermsOfServicePage() {
  const router = useRouter();

  const container = {
    hidden: { opacity: 0 },
    show: { opacity: 1, transition: { staggerChildren: 0.1 } }
  };

  const item = {
    hidden: { opacity: 0, y: 20 },
    show: { opacity: 1, y: 0, transition: { type: "spring", stiffness: 300, damping: 24 } }
  };
  
  return (
    <div className="flex-1 bg-[url('https://www.transparenttextures.com/patterns/dark-matter.png')] bg-fixed bg-[#0a0a0a] min-h-screen py-16 px-6 relative overflow-hidden">
      
      {/* Decorative background glows */}
      <div className="absolute top-0 right-1/4 w-[500px] h-[500px] bg-amber-500/10 rounded-full blur-[120px] pointer-events-none" />
      <div className="absolute bottom-0 left-1/4 w-[600px] h-[600px] bg-emerald-500/10 rounded-full blur-[150px] pointer-events-none" />

      <motion.div 
        variants={container}
        initial="hidden"
        animate="show"
        className="max-w-4xl mx-auto relative z-10"
      >
        <motion.div variants={item}>
          <Button variant="ghost" onClick={() => router.back()} className="mb-8 text-slate-300 hover:text-white hover:bg-white/10 pl-2">
            <ArrowLeft className="w-5 h-5 mr-2" /> Back to App
          </Button>
        </motion.div>
        
        <motion.div variants={item} className="mb-12 text-center">
          <div className="w-20 h-20 mx-auto bg-gradient-to-br from-amber-500 to-amber-700 rounded-2xl flex items-center justify-center mb-6 shadow-lg shadow-amber-500/20 rotate-3">
            <BookOpen className="w-10 h-10 text-white -rotate-3" />
          </div>
          <h1 className="text-5xl md:text-6xl font-extrabold font-serif mb-4 text-white tracking-tight drop-shadow-lg">
            Terms of Service
          </h1>
          <p className="text-amber-400 font-semibold tracking-widest uppercase text-sm">Legal Agreement • Last Updated: {new Date().toLocaleDateString()}</p>
        </motion.div>
        
        <motion.div variants={item} className="space-y-8">
          
          <div className="bg-[#111]/80 backdrop-blur-xl border border-white/10 rounded-[2rem] p-8 md:p-10 shadow-2xl">
            <div className="flex items-center gap-4 mb-6">
              <div className="p-3 bg-white/5 rounded-xl border border-white/10"><Handshake className="w-6 h-6 text-emerald-400" /></div>
              <h2 className="text-2xl font-bold text-white font-serif">1. Acceptance of Terms</h2>
            </div>
            <p className="text-slate-400 leading-relaxed text-lg">
              By accessing and using Ignite, you agree to be bound by these Terms of Service and our Privacy Policy. If you do not agree to these terms, please do not use our application.
            </p>
          </div>

          <div className="bg-[#111]/80 backdrop-blur-xl border border-white/10 rounded-[2rem] p-8 md:p-10 shadow-2xl">
            <div className="flex items-center gap-4 mb-6">
              <div className="p-3 bg-white/5 rounded-xl border border-white/10"><AlertCircle className="w-6 h-6 text-red-400" /></div>
              <h2 className="text-2xl font-bold text-white font-serif">2. User Conduct & Rules</h2>
            </div>
            <p className="text-slate-400 leading-relaxed text-lg mb-4">You agree to use Ignite only for lawful purposes. You are strictly prohibited from:</p>
            <ul className="space-y-3 text-slate-300">
              <li className="flex items-start gap-3"><div className="mt-1.5 w-1.5 h-1.5 rounded-full bg-red-500 shrink-0"/> <span>Posting abusive, defamatory, or obscene content in community areas.</span></li>
              <li className="flex items-start gap-3"><div className="mt-1.5 w-1.5 h-1.5 rounded-full bg-red-500 shrink-0"/> <span>Attempting to hack, exploit, or disrupt the application or its servers.</span></li>
            </ul>
            <div className="mt-6 p-4 bg-amber-500/10 border border-amber-500/20 rounded-xl">
              <p className="font-bold text-amber-400 text-center">
                We reserve the right to immediately suspend or terminate the account of any user who violates these rules.
              </p>
            </div>
          </div>

          <div className="bg-[#111]/80 backdrop-blur-xl border border-white/10 rounded-[2rem] p-8 md:p-10 shadow-2xl">
            <div className="flex items-center gap-4 mb-6">
              <div className="p-3 bg-white/5 rounded-xl border border-white/10"><BookOpen className="w-6 h-6 text-blue-400" /></div>
              <h2 className="text-2xl font-bold text-white font-serif">3. Disclaimers & Limitations</h2>
            </div>
            <p className="text-slate-400 leading-relaxed text-lg mb-4">
              Ignite is provided on an "as-is" and "as available" basis. We make no warranties, expressed or implied, regarding the reliability, accuracy, or availability of the service.
            </p>
            <p className="text-slate-500 text-sm italic border-t border-white/10 pt-4">These Terms shall be governed and construed in accordance with the laws of India.</p>
          </div>

        </motion.div>
      </motion.div>
    </div>
  );
}
