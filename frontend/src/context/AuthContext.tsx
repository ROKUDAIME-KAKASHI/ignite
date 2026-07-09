"use client";

import React, { createContext, useContext, useEffect, useState, useCallback } from "react";
import { useRouter, usePathname } from "next/navigation";
import { logout as logoutAction, updateProfile as updateProfileAction } from "@/app/actions/auth";

const PROTECTED_ROUTES = [
  "/dashboard",
  "/profile",
  "/events",
  "/missions",
  "/journeys",
  "/quizzes",
  "/prayer",
  "/memory-match",
  "/wordle",
  "/ludo",
  "/bible",
  "/guides",
  "/appointments",
  "/trivia",
  "/scan",
  "/mentorship",
  "/lions-den",
  "/noahs-ark"
];

interface AuthUser {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  role: string;
  displayName?: string;
  xp?: number;
  level?: number;
  streak?: number;
  stars?: number;
  churchId?: string | null;
}

interface AuthContextType {
  user: AuthUser | null;
  loading: boolean;
  updateDisplayName: (name: string) => Promise<void>;
  logout: () => Promise<void>;
  setUser: (user: AuthUser | null) => void;
  refreshUser: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType>({
  user: null,
  loading: true,
  updateDisplayName: async () => {},
  logout: async () => {},
  setUser: () => {},
  refreshUser: async () => {},
});

export const useAuth = () => useContext(AuthContext);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    const isProtected = PROTECTED_ROUTES.some(r => pathname.startsWith(r));
    if (!loading && !user && isProtected) {
      router.replace("/");
    }
  }, [user, loading, pathname, router]);

  useEffect(() => {
    fetch("/api/auth/me")
      .then(res => res.json())
      .then(data => {
        if (data.user) {
          setUser({ ...data.user, displayName: `${data.user.firstName} ${data.user.lastName}` });
        }
      })
      .finally(() => setLoading(false));
  }, []);

  const updateDisplayName = useCallback(async (name: string) => {
    if (!user) throw new Error("Not authenticated");
    const parts = name.trim().split(" ");
    const firstName = parts[0];
    const lastName = parts.slice(1).join(" ");
    const res = await updateProfileAction(firstName, lastName);
    if (res.user) {
      setUser({ ...res.user, displayName: `${res.user.firstName} ${res.user.lastName}` });
    }
  }, [user]);

  const logout = useCallback(async () => {
    await logoutAction();
    setUser(null);
    window.location.replace("/");
  }, []);

  const refreshUser = useCallback(async () => {
    try {
      const res = await fetch("/api/auth/me");
      const data = await res.json();
      if (data.user) {
        setUser({ ...data.user, displayName: `${data.user.firstName} ${data.user.lastName}` });
      }
    } catch (e) {
      console.error("Failed to refresh user", e);
    }
  }, []);

  const isProtected = PROTECTED_ROUTES.some(r => pathname.startsWith(r));
  const shouldHideChildren = isProtected && !user && !loading;

  return (
    <AuthContext.Provider value={{ user, loading, updateDisplayName, logout, setUser, refreshUser }}>
      {shouldHideChildren ? (
        <div className="flex-1 flex bg-background items-center justify-center">
           <div className="animate-pulse flex flex-col items-center gap-4">
             <div className="w-10 h-10 rounded-2xl bg-amber-700 flex items-center justify-center shadow-md">
               <svg viewBox="0 0 40 40" className="w-5 h-5 text-white" fill="none" stroke="currentColor" strokeWidth="3.5" strokeLinecap="round">
                 <line x1="20" y1="4" x2="20" y2="36" />
                 <line x1="6" y1="14" x2="34" y2="14" />
               </svg>
             </div>
           </div>
        </div>
      ) : children}
    </AuthContext.Provider>
  );
}
