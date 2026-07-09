"use client";

import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { Globe, ArrowUpRight } from "lucide-react";

export function InAppBrowserDetector() {
  const [isInApp, setIsInApp] = useState(false);
  const [platform, setPlatform] = useState("");

  useEffect(() => {
    const ua = navigator.userAgent || navigator.vendor || (window as any).opera;
    
    // Detect Instagram or Facebook in-app browser
    const isInstagram = (ua.indexOf('Instagram') > -1);
    const isFacebook = (ua.indexOf('FBAN') > -1) || (ua.indexOf('FBAV') > -1);
    const isIOS = /iPad|iPhone|iPod/.test(ua) || (navigator.userAgent.includes("Mac") && "ontouchend" in document);

    if (isInstagram || isFacebook) {
      setIsInApp(true);
      setPlatform(isIOS ? "Safari" : "Chrome");
    }
  }, []);

  if (!isInApp) return null;

  return (
    <div className="fixed inset-0 z-[9999] bg-background flex flex-col items-center justify-center p-6 text-center">
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        className="max-w-md w-full bg-card border border-border/50 shadow-2xl rounded-3xl p-8"
      >
        <div className="w-16 h-16 bg-amber-100 dark:bg-amber-900/30 rounded-2xl flex items-center justify-center mx-auto mb-6 text-amber-600 dark:text-amber-400">
          <Globe className="w-8 h-8" />
        </div>
        
        <h2 className="text-2xl font-bold font-serif mb-3 text-foreground">
          Action Required
        </h2>
        
        <p className="text-muted-foreground mb-8">
          Instagram's built-in browser does not support our app's features. Please open this link in your phone's main browser to continue.
        </p>

        <div className="bg-muted/50 rounded-2xl p-4 flex items-center gap-4 text-left border border-border/50">
          <div className="w-10 h-10 shrink-0 bg-background rounded-full shadow-sm flex items-center justify-center text-foreground font-bold text-lg">
            ⋮
          </div>
          <div>
            <p className="text-sm font-bold text-foreground">Tap the three dots</p>
            <p className="text-xs text-muted-foreground mt-0.5">In the top right corner of your screen</p>
          </div>
        </div>

        <div className="flex justify-center my-2">
          <div className="w-0.5 h-6 bg-border/50" />
        </div>

        <div className="bg-muted/50 rounded-2xl p-4 flex items-center gap-4 text-left border border-border/50 mb-6">
          <div className="w-10 h-10 shrink-0 bg-background rounded-full shadow-sm flex items-center justify-center text-foreground">
            <ArrowUpRight className="w-5 h-5" />
          </div>
          <div>
            <p className="text-sm font-bold text-foreground">Select "Open in {platform}"</p>
            <p className="text-xs text-muted-foreground mt-0.5">To load the full application</p>
          </div>
        </div>

      </motion.div>
    </div>
  );
}
