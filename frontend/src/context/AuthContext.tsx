"use client";

import React, { createContext, useContext, useEffect, useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import { logout as logoutAction, updateProfile as updateProfileAction } from "@/app/actions/auth";

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
    router.push("/");
  }, [router]);

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

  return (
    <AuthContext.Provider value={{ user, loading, updateDisplayName, logout, setUser, refreshUser }}>
      {children}
    </AuthContext.Provider>
  );
}
