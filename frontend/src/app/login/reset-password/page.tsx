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
        <div className="w-12 h-12 rounded-full bg-red-100 text-red-500 mx-auto flex items-center justify-center mb-4">
          <Lock className="w-6 h-6" />
        </div>
        <h2 className="text-xl font-bold text-slate-900 mb-2">Invalid Link</h2>
        <p className="text-slate-600 mb-6">This password reset link is invalid or missing.</p>
        <Link href="/login/forgot-password">
          <Button className="w-full bg-slate-900 text-white rounded-xl">Request New Link</Button>
        </Link>
      </div>
    );
  }

  if (status === "success") {
    return (
      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="text-center space-y-6">
        <div className="w-16 h-16 rounded-full bg-emerald-100 text-emerald-600 mx-auto flex items-center justify-center mb-4">
          <CheckCircle2 className="w-8 h-8" />
        </div>
        <h2 className="text-2xl font-black font-serif text-slate-900">Password Reset!</h2>
        <p className="text-slate-600">Your password has been successfully updated. You can now sign in with your new password.</p>
        <Link href="/login" className="block w-full mt-4">
          <Button className="w-full h-12 rounded-xl font-bold bg-emerald-600 hover:bg-emerald-700 text-white shadow-lg shadow-emerald-500/20">
            Sign In Now
          </Button>
        </Link>
      </motion.div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="w-12 h-12 rounded-2xl bg-blue-100 flex items-center justify-center text-blue-600 mb-6">
        <Lock className="w-6 h-6" />
      </div>
      
      <h1 className="text-3xl font-black font-serif text-slate-900 mb-2">New Password</h1>
      <p className="text-slate-600">Please enter your new password below.</p>
      
      <div className="space-y-4 pt-2">
        <div className="space-y-2">
          <label className="text-sm font-bold text-slate-700">New Password</label>
          <Input 
            type="password" 
            value={password} 
            onChange={e => setPassword(e.target.value)} 
            required 
            minLength={6}
            placeholder="••••••••"
            className="h-12 rounded-xl bg-slate-50 border-slate-200"
          />
        </div>
        <div className="space-y-2">
          <label className="text-sm font-bold text-slate-700">Confirm Password</label>
          <Input 
            type="password" 
            value={confirmPassword} 
            onChange={e => setConfirmPassword(e.target.value)} 
            required 
            minLength={6}
            placeholder="••••••••"
            className="h-12 rounded-xl bg-slate-50 border-slate-200"
          />
        </div>
      </div>

      {status === "error" && (
        <p className="text-sm text-red-500 font-bold bg-red-50 p-3 rounded-lg">{errorMsg}</p>
      )}

      <Button 
        type="submit" 
        disabled={status === "loading" || !password || !confirmPassword}
        className="w-full h-12 rounded-xl font-bold bg-blue-600 hover:bg-blue-700 text-white shadow-lg shadow-blue-500/20"
      >
        {status === "loading" ? <Loader2 className="w-5 h-5 animate-spin" /> : "Reset Password"}
      </Button>
    </form>
  );
}

export default function ResetPasswordPage() {
  return (
    <div className="flex-1 flex flex-col min-h-screen bg-slate-50 items-center justify-center p-6">
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-md bg-white rounded-3xl shadow-xl p-8 border border-slate-100"
      >
        <Suspense fallback={<div className="flex justify-center p-10"><Loader2 className="w-8 h-8 animate-spin text-slate-400" /></div>}>
          <ResetPasswordForm />
        </Suspense>
      </motion.div>
    </div>
  );
}
