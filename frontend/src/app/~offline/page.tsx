import { AlertCircle, WifiOff } from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";

export const metadata = {
  title: "Offline | Ignite",
};

export default function OfflinePage() {
  return (
    <div className="flex-1 flex flex-col items-center justify-center min-h-[70vh] px-6 text-center space-y-6">
      <div className="relative">
        <div className="absolute inset-0 blur-2xl opacity-20 bg-amber-500 rounded-full" />
        <div className="w-24 h-24 rounded-3xl bg-card border border-border/60 shadow-xl flex items-center justify-center relative z-10 mx-auto">
          <WifiOff className="w-10 h-10 text-muted-foreground" />
        </div>
      </div>
      
      <div>
        <h1 className="text-2xl font-bold font-serif mb-2">You are offline</h1>
        <p className="text-sm text-muted-foreground max-w-sm mx-auto">
          It looks like you've lost your internet connection. Don't worry, some of your cached Scripture and Guides are still available.
        </p>
      </div>

      <div className="p-4 bg-amber-50 dark:bg-amber-900/10 border border-amber-200/50 dark:border-amber-800/30 rounded-2xl max-w-sm w-full mx-auto flex items-start gap-3">
        <AlertCircle className="w-5 h-5 text-amber-600 mt-0.5 shrink-0" />
        <p className="text-xs text-amber-800 dark:text-amber-400 text-left leading-relaxed font-medium">
          Once your connection is restored, this page will automatically refresh or you can click below.
        </p>
      </div>

      <Button asChild className="gradient-gold text-white font-bold px-8 h-12 rounded-xl shadow-md halo-glow">
        <Link href="/">
          Try Again
        </Link>
      </Button>
    </div>
  );
}
