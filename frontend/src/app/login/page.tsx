"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Mail, Lock, Eye, EyeOff } from "lucide-react";
import { motion } from "framer-motion";
import { login, signup } from "@/app/actions/auth";
import { useAuth } from "@/context/AuthContext";

function Cross({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 40 40" className={className} fill="none" stroke="currentColor" strokeWidth="3.5" strokeLinecap="round">
      <line x1="20" y1="4" x2="20" y2="36" />
      <line x1="6" y1="14" x2="34" y2="14" />
    </svg>
  );
}

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [isRegistering, setIsRegistering] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const router = useRouter();
  const { user, loading: authLoading, setUser } = useAuth();

  useEffect(() => {
    if (!authLoading && user) {
      router.push("/dashboard");
    }
  }, [user, authLoading, router]);

  const handleAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      const formData = new FormData();
      formData.append("email", email);
      formData.append("password", password);
      
      let res;
      if (isRegistering) {
        formData.append("firstName", firstName);
        formData.append("lastName", lastName);
        res = await signup(formData);
      } else {
        res = await login(formData);
      }

      if (res.error) {
        setError(res.error);
      } else if (res.success && res.user) {
        setUser({
          ...res.user,
          displayName: `${res.user.firstName} ${res.user.lastName}`
        });
        router.push("/dashboard");
      }
    } catch (err: any) {
      setError("An unexpected error occurred. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex-1 flex flex-col items-center justify-center min-h-screen px-6 relative overflow-hidden bg-background">
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
        initial={{ opacity: 0, y: 24 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
        className="relative z-10 w-full max-w-sm"
      >
        <div className="flex flex-col items-center mb-8">
          <Link href="/">
            <motion.div
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ delay: 0.1, duration: 0.4 }}
              className="w-16 h-16 rounded-2xl gradient-gold flex items-center justify-center shadow-xl halo-glow mb-4 hover:scale-[1.05] transition-transform"
            >
              <Cross className="w-8 h-8 text-white" />
            </motion.div>
          </Link>
          <h1 className="text-3xl font-extrabold text-gradient-gold font-serif">Ignite</h1>
          <p className="text-muted-foreground text-sm mt-1 font-medium uppercase tracking-widest text-center">Youth Ministry Platform</p>
          <p className="text-xs text-muted-foreground italic font-serif mt-2 text-center px-4">
            "Come, follow me." — Matthew 4:19
          </p>
        </div>

        <div className="glass dark:glass-dark rounded-3xl p-7 border border-white/50 dark:border-white/10 shadow-2xl card-holy">
          <h2 className="text-xl font-bold text-foreground font-serif mb-1">
            {isRegistering ? "Begin Your Journey" : "Welcome Back"}
          </h2>
          <p className="text-muted-foreground text-sm mb-6 italic font-serif">
            {isRegistering ? "Join the community of faith." : "Continue your walk with Christ."}
          </p>

          <form onSubmit={handleAuth} className="space-y-4">
            {isRegistering && (
              <div className="flex gap-2">
                <div className="space-y-2 flex-1">
                  <Label htmlFor="firstName" className="text-sm font-semibold">First Name</Label>
                  <Input id="firstName" required value={firstName} onChange={e => setFirstName(e.target.value)} placeholder="John" className="h-11 rounded-xl bg-background/70" />
                </div>
                <div className="space-y-2 flex-1">
                  <Label htmlFor="lastName" className="text-sm font-semibold">Last Name</Label>
                  <Input id="lastName" required value={lastName} onChange={e => setLastName(e.target.value)} placeholder="Doe" className="h-11 rounded-xl bg-background/70" />
                </div>
              </div>
            )}
            <div className="space-y-2">
              <Label htmlFor="email" className="text-sm font-semibold">Email Address</Label>
              <div className="relative">
                <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <Input
                  id="email"
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="you@example.com"
                  className="pl-10 h-11 rounded-xl border-border/60 bg-background/70"
                />
              </div>
            </div>

            <div className="space-y-2">
              <div className="flex justify-between items-center">
                <Label htmlFor="password" className="text-sm font-semibold">Password</Label>
                {!isRegistering && (
                  <Link href="/login/forgot-password" className="text-xs font-bold text-emerald-600 hover:text-emerald-700">
                    Forgot Password?
                  </Link>
                )}
              </div>
              <div className="relative">
                <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <Input
                  id="password"
                  type={showPassword ? "text" : "password"}
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="pl-10 pr-10 h-11 rounded-xl border-border/60 bg-background/70"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3.5 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            {error && (
              <motion.p
                initial={{ opacity: 0, y: -4 }}
                animate={{ opacity: 1, y: 0 }}
                className="text-sm text-red-600 bg-red-50 dark:bg-red-950/30 border border-red-200 dark:border-red-800 rounded-xl px-3 py-2"
              >
                ⚠️ {error}
              </motion.p>
            )}

            <Button
              type="submit"
              disabled={loading}
              className="w-full h-11 rounded-xl gradient-gold text-white font-bold shadow-lg halo-glow hover:opacity-90 transition-opacity"
            >
              {loading ? (
                <span className="flex items-center gap-2">
                  <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24" fill="none">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z" />
                  </svg>
                  {isRegistering ? "Creating account…" : "Signing in…"}
                </span>
              ) : (
                isRegistering ? "Create Account ✝" : "Sign In →"
              )}
            </Button>
          </form>

          <div className="divider-cross my-4" />

          <div className="text-center">
            <button
              onClick={() => { setIsRegistering(!isRegistering); setError(""); }}
              className="text-sm text-muted-foreground hover:text-primary font-medium transition-colors"
            >
              {isRegistering
                ? "Already have an account? Sign in"
                : "New to Ignite? Join the community →"}
            </button>
          </div>
        </div>

        <p className="text-center text-[10px] text-muted-foreground mt-6 tracking-widest uppercase">
          ✝ Soli Deo Gloria ✝
        </p>
      </motion.div>
    </div>
  );
}
