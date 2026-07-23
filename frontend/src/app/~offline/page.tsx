import { AlertCircle, WifiOff, Dices, Gamepad2, BookOpen } from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";

export const metadata = {
  title: "Offline | Ignite",
};

export default function OfflinePage() {
  return (
    <div className="flex-1 flex flex-col items-center justify-center min-h-[80vh] px-4 py-8 text-center space-y-6 max-w-md mx-auto">
      <div className="relative">
        <div className="absolute inset-0 blur-2xl opacity-25 bg-amber-500 rounded-full" />
        <div className="w-20 h-20 rounded-3xl bg-card border border-border/60 shadow-xl flex items-center justify-center relative z-10 mx-auto">
          <WifiOff className="w-9 h-9 text-amber-500" />
        </div>
      </div>
      
      <div>
        <h1 className="text-2xl font-bold font-serif mb-2 text-foreground">You are Offline</h1>
        <p className="text-sm text-muted-foreground max-w-sm mx-auto">
          No internet connection detected. You can still play offline games and access cached pages!
        </p>
      </div>

      {/* Offline Available Games Section */}
      <div className="w-full bg-card/60 backdrop-blur-md border border-amber-500/20 rounded-2xl p-4 text-left space-y-3 shadow-md">
        <div className="flex items-center gap-2 mb-1">
          <Gamepad2 className="w-4 h-4 text-amber-500" />
          <h2 className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Available Offline Games</h2>
        </div>

        <div className="grid grid-cols-2 gap-2">
          <Link href="/ludo" className="p-3 bg-amber-500/10 hover:bg-amber-500/20 border border-amber-500/30 rounded-xl flex flex-col items-center justify-center text-center transition-all group">
            <Dices className="w-6 h-6 text-amber-500 mb-1 group-hover:scale-110 transition-transform" />
            <span className="text-xs font-bold text-foreground">Bible Ludo</span>
            <span className="text-[10px] text-muted-foreground">Solo & Local</span>
          </Link>

          <Link href="/quizzes" className="p-3 bg-blue-500/10 hover:bg-blue-500/20 border border-blue-500/30 rounded-xl flex flex-col items-center justify-center text-center transition-all group">
            <BookOpen className="w-6 h-6 text-blue-500 mb-1 group-hover:scale-110 transition-transform" />
            <span className="text-xs font-bold text-foreground">Bible Quizzes</span>
            <span className="text-[10px] text-muted-foreground">Offline Trivia</span>
          </Link>
        </div>
      </div>

      <div className="p-3 bg-amber-50 dark:bg-amber-900/10 border border-amber-200/50 dark:border-amber-800/30 rounded-xl w-full flex items-start gap-2.5">
        <AlertCircle className="w-4 h-4 text-amber-600 dark:text-amber-400 mt-0.5 shrink-0" />
        <p className="text-xs text-amber-800 dark:text-amber-400 text-left leading-relaxed font-medium">
          Once connection is restored, online features like live multiplayer and leaderboard updates will resume automatically.
        </p>
      </div>

      <Link href="/" className="w-full inline-flex items-center justify-center gradient-gold text-white font-bold h-11 rounded-xl shadow-md halo-glow transition-transform hover:scale-[1.02]">
        Try Reconnecting
      </Link>
    </div>
  );
}
