"use client";

import { useRouter, usePathname } from "next/navigation";
import { ArrowLeft } from "lucide-react";
import { useEffect } from "react";
import { useAuth } from "@/context/AuthContext";

const PUBLIC_ROUTES = ["/", "/login"];

export function MobileHeader() {
  const router = useRouter();
  const pathname = usePathname();
  const { user, loading } = useAuth();

  // Handle physical back button closing the app
  // By pushing a history state when the app mounts, we ensure there's a history stack
  useEffect(() => {
    if (typeof window !== "undefined") {
      // If history length is 1 (app just opened), push a dummy state
      if (window.history.length === 1) {
        window.history.pushState(null, "", window.location.href);
      }

      const handlePopState = (event: PopStateEvent) => {
        // If they press back and hit our dummy state or we need to prevent exit,
        // we could push another state, but Next.js usually handles popstate.
        // The pushState above is usually enough to prevent immediate exit on first back press.
      };

      window.addEventListener("popstate", handlePopState);
      return () => window.removeEventListener("popstate", handlePopState);
    }
  }, [pathname]);

  if (PUBLIC_ROUTES.includes(pathname) || pathname.startsWith("/admin") || (!loading && !user)) return null;

  const isHome = pathname === "/dashboard";

  // Map pathname to a readable title
  const getTitle = () => {
    if (pathname === "/dashboard") return "Home";
    if (pathname === "/bible") return "Scripture";
    if (pathname === "/journeys") return "Journeys";
    if (pathname === "/missions") return "Missions";
    if (pathname === "/quizzes") return "Games";
    if (pathname === "/events") return "Events";
    if (pathname === "/notifications") return "Notices";
    if (pathname === "/profile") return "Profile";
    if (pathname.startsWith("/scan")) return "QR Scanner";
    return "Ignite";
  };

  return (
    <div className="md:hidden sticky top-0 left-0 right-0 z-40 bg-white/90 dark:bg-[#0f1229]/90 backdrop-blur-md border-b border-border/50 h-14 flex items-center px-4 shrink-0">
      {!isHome ? (
        <button
          onClick={() => router.back()}
          className="w-10 h-10 -ml-2 rounded-xl flex items-center justify-center hover:bg-black/5 dark:hover:bg-white/5 transition-colors"
          aria-label="Go back"
        >
          <ArrowLeft className="w-5 h-5 text-foreground" />
        </button>
      ) : (
        <div className="w-8 h-8 rounded-lg bg-amber-700 flex items-center justify-center shadow-md mr-3">
          <svg viewBox="0 0 40 40" className="w-4 h-4 text-white" fill="none" stroke="currentColor" strokeWidth="4" strokeLinecap="round">
            <line x1="20" y1="4" x2="20" y2="36" />
            <line x1="6" y1="14" x2="34" y2="14" />
          </svg>
        </div>
      )}
      
      <h1 className="text-lg font-bold font-serif text-foreground ml-1">
        {getTitle()}
      </h1>
    </div>
  );
}
