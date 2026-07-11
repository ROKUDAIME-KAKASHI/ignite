"use client";

import { useEffect, useState } from "react";
import { X, Download } from "lucide-react";
import { Button } from "@/components/ui/button";

export function InstallPrompt() {
  const [isInstallable, setIsInstallable] = useState(false);
  const [deferredPrompt, setDeferredPrompt] = useState<any>(null);
  const [isIOS, setIsIOS] = useState(false);
  const [isStandalone, setIsStandalone] = useState(true); // default true to avoid flash
  const [dismissed, setDismissed] = useState(true);

  useEffect(() => {
    if (typeof window === "undefined") return;

    // Check if running in standalone mode (already installed)
    const standalone = window.matchMedia('(display-mode: standalone)').matches || (navigator as any).standalone;
    setIsStandalone(standalone);
    
    setDismissed(localStorage.getItem("pwa-install-dismissed") === "true");

    // Detect iOS Safari
    const ua = window.navigator.userAgent;
    const isIOSDevice = /iPad|iPhone|iPod/.test(ua) && !(window as any).MSStream;
    setIsIOS(isIOSDevice);

    if (isIOSDevice && !standalone) {
      setIsInstallable(true);
    }

    const handleBeforeInstallPrompt = (e: Event) => {
      e.preventDefault();
      setDeferredPrompt(e);
      setIsInstallable(true);
    };

    window.addEventListener("beforeinstallprompt", handleBeforeInstallPrompt);

    return () => {
      window.removeEventListener("beforeinstallprompt", handleBeforeInstallPrompt);
    };
  }, []);

  const handleInstallClick = async () => {
    if (deferredPrompt) {
      deferredPrompt.prompt();
      const { outcome } = await deferredPrompt.userChoice;
      if (outcome === "accepted") {
        setDeferredPrompt(null);
        setIsInstallable(false);
      }
    } else if (isIOS) {
      alert('To install the app and remove the browser header, tap the Share icon at the bottom of your screen and select "Add to Home Screen".');
    }
  };

  const handleDismiss = () => {
    localStorage.setItem("pwa-install-dismissed", "true");
    setDismissed(true);
    setIsInstallable(false);
  };

  if (isStandalone || dismissed || !isInstallable) return null;

  return (
    <div className="fixed top-0 left-0 right-0 z-[100] bg-amber-700 text-white px-4 py-3 flex items-center justify-between shadow-lg safe-area-pt">
      <div className="flex items-center gap-3">
        <div className="w-10 h-10 bg-white/20 rounded-lg flex items-center justify-center shrink-0">
          <Download className="w-5 h-5" />
        </div>
        <div className="flex-1 min-w-0">
          <p className="text-sm font-bold leading-tight">Install Ignite App</p>
          <p className="text-xs text-white/80 leading-snug">Remove the browser link bar for a full-screen native experience.</p>
        </div>
      </div>
      <div className="flex items-center gap-2 shrink-0">
        <Button size="sm" variant="secondary" className="text-xs h-8 bg-white text-amber-900 hover:bg-gray-100 font-bold" onClick={handleInstallClick}>
          Install
        </Button>
        <button onClick={handleDismiss} className="p-2 -mr-2 text-white/70 hover:text-white">
          <X className="w-5 h-5" />
        </button>
      </div>
    </div>
  );
}
