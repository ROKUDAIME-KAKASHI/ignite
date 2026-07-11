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

  if (PUBLIC_ROUTES.includes(pathname) || pathname.startsWith("/admin") || !user) return null;

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
    <div 
      className="md:hidden sticky top-0 left-0 right-0 z-40 h-16 flex items-center px-4 shrink-0 shadow-sm border-b border-amber-900/30"
      style={{
        backgroundImage: `linear-gradient(to right, rgba(15, 18, 41, 0.85), rgba(15, 18, 41, 0.6)), url('/header-image.png')`,
        backgroundSize: 'cover',
        backgroundPosition: 'center',
        color: 'white'
      }}
    >
      {!isHome ? (
        <button
          onClick={() => router.back()}
          className="w-10 h-10 -ml-2 rounded-xl flex items-center justify-center hover:bg-white/10 transition-colors"
          aria-label="Go back"
        >
          <ArrowLeft className="w-5 h-5 text-white" />
        </button>
      ) : (
        <div className="w-8 h-8 rounded-lg bg-amber-700 flex items-center justify-center shadow-md mr-3">
          <svg viewBox="0 0 40 40" className="w-4 h-4 text-white" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
            <line x1="20" y1="8" x2="20" y2="34" />
            <line x1="8" y1="18" x2="32" y2="18" />
            <circle cx="20" cy="5" r="2" />
            <circle cx="16" cy="8" r="2" />
            <circle cx="24" cy="8" r="2" />
            <circle cx="5" cy="18" r="2" />
            <circle cx="8" cy="14" r="2" />
            <circle cx="8" cy="22" r="2" />
            <circle cx="35" cy="18" r="2" />
            <circle cx="32" cy="14" r="2" />
            <circle cx="32" cy="22" r="2" />
            <path d="M15 34h10M12 38h16" />
          </svg>
        </div>
      )}
      
      <h1 className="text-lg font-bold font-serif text-white ml-2 drop-shadow-md">
        {getTitle()}
      </h1>
    </div>
  );
}
