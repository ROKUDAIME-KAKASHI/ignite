"use client";

import { useState, Suspense } from "react";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Lock, Loader2, CheckCircle2 } from "lucide-react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { resetPassword } from "@/app/actions/resetPassword";

function ResetPasswordForm() {
  const searchParams = useSearchParams();
  const token = searchParams.get("token");

  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [status, setStatus] = useState<"idle" | "loading" | "success" | "error">("idle");
  const [errorMsg, setErrorMsg] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!token) {
      setStatus("error");
      setErrorMsg("Missing reset token");
      return;
    }
    if (password !== confirmPassword) {
      setStatus("error");
      setErrorMsg("Passwords do not match");
      return;
    }
    if (password.length < 6) {
      setStatus("error");
      setErrorMsg("Password must be at least 6 characters");
      return;
    }

    setStatus("loading");
    
    const res = await resetPassword(token, password);
    if (res.success) {
      setStatus("success");
    } else {
      setStatus("error");
      setErrorMsg(res.error || "Failed to reset password");
    }
  };

  if (!token) {
    return (
      <div className="text-center">
        <div className="w-12 h-12 rounded-2xl bg-red-950/40 border border-red-500/30 text-red-400 mx-auto flex items-center justify-center mb-6 shadow-inner">
          <Lock className="w-6 h-6" />
        </div>
        <h2 className="text-2xl font-black font-serif text-white mb-2">Invalid Link</h2>
        <p className="text-slate-300 text-sm mb-6 leading-relaxed">This password reset link is invalid or missing.</p>
        <Link href="/login/forgot-password">
          <Button className="w-full h-11 bg-white/10 text-white rounded-xl hover:bg-white/20 border border-white/20 backdrop-blur-md transition-colors">Request New Link</Button>
        </Link>
      </div>
    );
  }

  if (status === "success") {
    return (
      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="text-center space-y-6">
        <div className="w-16 h-16 rounded-2xl bg-emerald-950/40 border border-emerald-500/30 text-emerald-400 mx-auto flex items-center justify-center mb-4 shadow-inner">
          <CheckCircle2 className="w-8 h-8" />
        </div>
        <h2 className="text-3xl font-black font-serif text-white">Password Reset!</h2>
        <p className="text-slate-300 text-sm leading-relaxed">Your password has been successfully updated. You can now sign in with your new password.</p>
        <Link href="/login" className="block w-full mt-4">
          <Button className="w-full h-12 rounded-xl font-bold bg-emerald-600 hover:bg-emerald-700 text-white shadow-lg shadow-emerald-500/20 transition-all">
            Sign In Now
          </Button>
        </Link>
      </motion.div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="w-12 h-12 rounded-2xl bg-blue-950/40 border border-blue-500/30 flex items-center justify-center text-blue-400 mb-6 shadow-inner">
        <Lock className="w-6 h-6" />
      </div>
      
      <div>
        <h1 className="text-3xl font-black font-serif text-white mb-2">New Password</h1>
        <p className="text-slate-300 text-sm leading-relaxed">Please enter your new password below.</p>
      </div>
      
      <div className="space-y-4 pt-2">
        <div className="space-y-2">
          <label className="text-sm font-bold text-white">New Password</label>
          <Input 
            type="password" 
            value={password} 
            onChange={e => setPassword(e.target.value)} 
            required 
            minLength={6}
            placeholder="••••••••"
            className="h-11 rounded-xl bg-background/70 border-border/60 text-white"
          />
        </div>
        <div className="space-y-2">
          <label className="text-sm font-bold text-white">Confirm Password</label>
          <Input 
            type="password" 
            value={confirmPassword} 
            onChange={e => setConfirmPassword(e.target.value)} 
            required 
            minLength={6}
            placeholder="••••••••"
            className="h-11 rounded-xl bg-background/70 border-border/60 text-white"
          />
        </div>
      </div>

      {status === "error" && (
        <p className="text-sm text-red-400 font-bold bg-red-950/30 border border-red-500/30 p-3 rounded-xl">{errorMsg}</p>
      )}

      <Button 
        type="submit" 
        disabled={status === "loading" || !password || !confirmPassword}
        className="w-full h-11 rounded-xl font-bold bg-blue-600 hover:bg-blue-700 text-white shadow-lg shadow-blue-500/20 transition-all"
      >
        {status === "loading" ? <Loader2 className="w-5 h-5 animate-spin" /> : "Reset Password"}
      </Button>
    </form>
  );
}

export default function ResetPasswordPage() {
  return (
    <div className="flex-1 flex flex-col items-center justify-center h-full px-6 relative overflow-hidden bg-background">
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-40 left-1/2 -translate-x-1/2 w-[500px] h-[500px] rounded-full opacity-15"
          style={{ background: "radial-gradient(circle, #d4a017 0%, #c2410c 50%, transparent 75%)" }}
        />
        <svg viewBox="0 0 300 300" className="absolute inset-0 w-full h-full opacity-[0.03] dark:opacity-[0.04] text-foreground" fill="none" stroke="currentColor" strokeWidth="8">
          <line x1="150" y1="30" x2="150" y2="270" />
          <line x1="40" y1="110" x2="260" y2="110" />
        </svg>
      </div>

      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="relative z-10 w-full max-w-sm glass dark:glass-dark rounded-3xl shadow-2xl p-8 border border-white/50 dark:border-white/10 card-holy"
      >
        <Suspense fallback={<div className="flex justify-center p-10"><Loader2 className="w-8 h-8 animate-spin text-slate-500" /></div>}>
          <ResetPasswordForm />
        </Suspense>
      </motion.div>
    </div>
  );
}
