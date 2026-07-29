"use client";

import { Button } from "@/components/ui/button";
import { ArrowLeft, ShieldCheck, Scale, Database, UserX } from "lucide-react";
import { useRouter } from "next/navigation";
import { motion, Variants } from "framer-motion";

export default function PrivacyPolicyPage() {
  const router = useRouter();
  
  const container: Variants = {
    hidden: { opacity: 0 },
    show: { opacity: 1, transition: { staggerChildren: 0.1 } }
  };

  const item: Variants = {
    hidden: { opacity: 0, y: 20 },
    show: { opacity: 1, y: 0, transition: { type: "spring", stiffness: 300, damping: 24 } }
  };

  return (
    <div className="flex-1 bg-[url('https://www.transparenttextures.com/patterns/dark-matter.png')] bg-fixed bg-[#0a0a0a] min-h-screen py-16 px-6 relative overflow-hidden">
      
      {/* Decorative background glows */}
      <div className="absolute top-0 left-1/4 w-[500px] h-[500px] bg-emerald-500/10 rounded-full blur-[120px] pointer-events-none" />
      <div className="absolute bottom-0 right-1/4 w-[600px] h-[600px] bg-amber-500/10 rounded-full blur-[150px] pointer-events-none" />

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
          <div className="w-20 h-20 mx-auto bg-gradient-to-br from-emerald-500 to-emerald-700 rounded-2xl flex items-center justify-center mb-6 shadow-lg shadow-emerald-500/20 rotate-3">
            <ShieldCheck className="w-10 h-10 text-white -rotate-3" />
          </div>
          <h1 className="text-5xl md:text-6xl font-extrabold font-serif mb-4 text-white tracking-tight drop-shadow-lg">
            Privacy Policy
          </h1>
          <p className="text-emerald-400 font-semibold tracking-widest uppercase text-sm">DPDP Act 2023 Compliant • Last Updated: {new Date().toLocaleDateString()}</p>
        </motion.div>
        
        <motion.div variants={item} className="space-y-8">
          
          <div className="bg-[#111]/80 backdrop-blur-xl border border-white/10 rounded-[2rem] p-8 md:p-10 shadow-2xl">
            <div className="flex items-center gap-4 mb-6">
              <div className="p-3 bg-white/5 rounded-xl border border-white/10"><Scale className="w-6 h-6 text-amber-400" /></div>
              <h2 className="text-2xl font-bold text-white font-serif">1. Introduction</h2>
            </div>
            <p className="text-slate-400 leading-relaxed text-lg">
              Welcome to Ignite. We respect your privacy and are deeply committed to protecting your personal data in strict compliance with the Digital Personal Data Protection (DPDP) Act, 2023 of India. This policy outlines our transparent data practices.
            </p>
          </div>

          <div className="bg-[#111]/80 backdrop-blur-xl border border-white/10 rounded-[2rem] p-8 md:p-10 shadow-2xl">
            <div className="flex items-center gap-4 mb-6">
              <div className="p-3 bg-white/5 rounded-xl border border-white/10"><Database className="w-6 h-6 text-blue-400" /></div>
              <h2 className="text-2xl font-bold text-white font-serif">2. Data Minimization & Usage</h2>
            </div>
            <p className="text-slate-400 leading-relaxed text-lg mb-4">To provide our services, we only collect the absolute minimum required personal data:</p>
            <ul className="space-y-3 text-slate-300">
              <li className="flex items-start gap-3"><div className="mt-1.5 w-1.5 h-1.5 rounded-full bg-blue-500 shrink-0"/> <span><strong>Profile Info:</strong> Display name, email, and avatar via Google OAuth.</span></li>
              <li className="flex items-start gap-3"><div className="mt-1.5 w-1.5 h-1.5 rounded-full bg-blue-500 shrink-0"/> <span><strong>App Data:</strong> XP, game stats, and community messages.</span></li>
            </ul>
            <div className="mt-6 p-4 bg-emerald-500/10 border border-emerald-500/20 rounded-xl">
              <p className="font-bold text-emerald-400 text-center">
                We absolutely do not sell, rent, or trade your personal data to any third parties.
              </p>
            </div>
          </div>

          <div className="bg-[#111]/80 backdrop-blur-xl border border-white/10 rounded-[2rem] p-8 md:p-10 shadow-2xl">
            <div className="flex items-center gap-4 mb-6">
              <div className="p-3 bg-white/5 rounded-xl border border-white/10"><UserX className="w-6 h-6 text-red-400" /></div>
              <h2 className="text-2xl font-bold text-white font-serif">3. Your DPDP Rights & Erasure</h2>
            </div>
            <p className="text-slate-400 leading-relaxed text-lg mb-4">Under the DPDP Act, you have complete control over your data:</p>
            <ul className="space-y-4 text-slate-300 mb-6">
              <li className="flex items-start gap-3"><div className="mt-1.5 w-1.5 h-1.5 rounded-full bg-amber-500 shrink-0"/> <span><strong>Right to Information:</strong> You can request a summary of your processed data at any time.</span></li>
              <li className="flex items-start gap-3"><div className="mt-1.5 w-1.5 h-1.5 rounded-full bg-red-500 shrink-0"/> <span><strong>Right to Erasure:</strong> You can permanently delete your account and all associated PII directly from your Profile Settings.</span></li>
            </ul>
            <p className="text-slate-500 text-sm italic">For grievance redressal, contact our Data Protection Officer at privacy@ignite.app</p>
          </div>

        </motion.div>
      </motion.div>
    </div>
  );
}
