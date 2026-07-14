"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ArrowLeft, Mail, Loader2, CheckCircle2, Copy } from "lucide-react";
import Link from "next/link";
import { requestPasswordReset } from "@/app/actions/resetPassword";

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState("");
  const [status, setStatus] = useState<"idle" | "loading" | "success" | "error">("idle");
  const [errorMsg, setErrorMsg] = useState("");
  const [resetUrl, setResetUrl] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) return;
    setStatus("loading");
    
    const res = await requestPasswordReset(email);
    if (res.success) {
      setStatus("success");
      if (res.resetUrl) {
        setResetUrl(res.resetUrl);
      }
    } else {
      setStatus("error");
      setErrorMsg(res.error || "Failed to send reset email");
    }
  };

  const copyLink = () => {
    if (resetUrl) {
      navigator.clipboard.writeText(resetUrl);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  return (
    <div className="flex-1 flex flex-col h-full bg-slate-50 items-center justify-center p-6 relative">
      <Link href="/login" className="absolute top-6 left-6 w-10 h-10 flex items-center justify-center rounded-full bg-white shadow-sm text-slate-600 hover:text-slate-900 z-10">
        <ArrowLeft className="w-5 h-5" />
      </Link>

      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-md bg-white rounded-3xl shadow-xl p-8 border border-slate-100"
      >
        <div className="w-12 h-12 rounded-2xl bg-emerald-100 flex items-center justify-center text-emerald-600 mb-6">
          <Mail className="w-6 h-6" />
        </div>
        
        <h1 className="text-3xl font-black font-serif text-slate-900 mb-2">Reset Password</h1>
        
        {status === "success" ? (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-6">
            <p className="text-slate-600">
              If an account with that email exists, we have sent a password reset link to <strong className="text-slate-900">{email}</strong>.
            </p>
            <div className="p-4 bg-emerald-50 rounded-2xl flex flex-col items-start gap-3">
              <div className="flex gap-3">
                <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0 mt-0.5" />
                <p className="text-sm text-emerald-800 font-medium">Please check your inbox and spam folder for the link.</p>
              </div>
              
              {/* DEV ONLY: Show the reset link directly */}
              {resetUrl && (
                <div className="w-full mt-2">
                  <p className="text-xs font-bold text-slate-500 mb-1 uppercase tracking-wider">DEV MODE: Reset Link</p>
                  <div className="flex items-center gap-2 bg-white rounded-xl border border-emerald-200 p-2">
                    <input 
                      type="text" 
                      readOnly 
                      value={resetUrl}
                      className="flex-1 bg-transparent text-xs text-slate-600 focus:outline-none px-2"
                    />
                    <Button 
                      onClick={copyLink}
                      variant="secondary"
                      size="sm"
                      className="h-8 rounded-lg text-xs font-bold bg-emerald-100 hover:bg-emerald-200 text-emerald-700"
                    >
                      {copied ? "Copied!" : <><Copy className="w-3 h-3 mr-1" /> Copy</>}
                    </Button>
                  </div>
                </div>
              )}
            </div>
            <Link href="/login" className="block w-full">
              <Button className="w-full h-12 rounded-xl font-bold bg-slate-900 hover:bg-slate-800 text-white">
                Return to Login
              </Button>
            </Link>
          </motion.div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-6">
            <p className="text-slate-600">
              Enter the email address associated with your account, and we'll send you a link to reset your password.
            </p>
            
            <div className="space-y-2">
              <label className="text-sm font-bold text-slate-700">Email Address</label>
              <Input 
                type="email" 
                value={email} 
                onChange={e => setEmail(e.target.value)} 
                required 
                placeholder="hello@example.com"
                className="h-12 rounded-xl bg-slate-50 border-slate-200"
              />
            </div>

            {status === "error" && (
              <p className="text-sm text-red-500 font-bold bg-red-50 p-3 rounded-lg">{errorMsg}</p>
            )}

            <Button 
              type="submit" 
              disabled={status === "loading" || !email}
              className="w-full h-12 rounded-xl font-bold bg-emerald-600 hover:bg-emerald-700 text-white shadow-lg shadow-emerald-500/20"
            >
              {status === "loading" ? <Loader2 className="w-5 h-5 animate-spin" /> : "Send Reset Link"}
            </Button>
          </form>
        )}
      </motion.div>
    </div>
  );
}
