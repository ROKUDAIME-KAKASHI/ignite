"use client";

import React, { createContext, useContext, useEffect, useState, useCallback } from "react";
import { onAuthStateChanged, User, updateProfile, signOut } from "firebase/auth";
import { auth } from "@/lib/firebase";
import { useRouter } from "next/navigation";

interface AuthContextType {
  user: User | null;
  loading: boolean;
  updateDisplayName: (name: string) => Promise<void>;
  logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType>({
  user: null,
  loading: true,
  updateDisplayName: async () => {},
  logout: async () => {},
});

export const useAuth = () => useContext(AuthContext);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (firebaseUser) => {
      setUser(firebaseUser);
      setLoading(false);
    });
    return () => unsubscribe();
  }, []);

  /** Update the Firebase display name and refresh local state */
  const updateDisplayName = useCallback(async (name: string) => {
    if (!auth.currentUser) throw new Error("Not authenticated");
    await updateProfile(auth.currentUser, { displayName: name.trim() });
    // Force re-render by cloning the user object
    setUser({ ...auth.currentUser } as User);
  }, []);

  /** Sign out and redirect to home */
  const logout = useCallback(async () => {
    await signOut(auth);
    router.push("/");
  }, [router]);

  return (
    <AuthContext.Provider value={{ user, loading, updateDisplayName, logout }}>
      {children}
    </AuthContext.Provider>
  );
}
