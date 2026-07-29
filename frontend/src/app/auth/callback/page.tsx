"use client";

import { useEffect, useState } from "react";
import { googleAuth } from "@/app/actions/auth";
import { useAuth } from "@/context/AuthContext";

export default function GoogleAuthCallback() {
  const [status, setStatus] = useState("Processing Google Sign-In...");
  const { setUser } = useAuth();

  useEffect(() => {
    const hash = window.location.hash;
    if (!hash) {
      setStatus("Error: No authentication data received from Google.");
      return;
    }

    const params = new URLSearchParams(hash.replace("#", "?"));
    const accessToken = params.get("access_token");

    if (!accessToken) {
      setStatus("Error: Authentication failed or access token missing.");
      return;
    }

    setStatus("Verifying credentials...");

    googleAuth(accessToken)
      .then((res) => {
        if (res.error) {
          setStatus("Error: " + res.error);
        } else if (res.success && res.user) {
          setStatus("Success! Redirecting to dashboard...");
          setUser({
            ...res.user,
            displayName: `${res.user.firstName} ${res.user.lastName}`
          });
          window.location.href = "/dashboard";
        }
      })
      .catch((err) => {
        setStatus("Network Error: " + err.message);
      });
  }, [setUser]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-background text-foreground">
      <div className="glass p-8 rounded-2xl flex flex-col items-center max-w-md text-center shadow-2xl">
        <svg className="animate-spin h-10 w-10 text-amber-500 mb-4" viewBox="0 0 24 24" fill="none">
          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z" />
        </svg>
        <h2 className="text-xl font-bold font-serif mb-2">Authenticating</h2>
        <p className="text-muted-foreground">{status}</p>
        
        {status.startsWith("Error") && (
          <button 
            onClick={() => window.location.href = "/login"}
            className="mt-6 px-6 py-2 bg-red-100 text-red-800 rounded-lg hover:bg-red-200 transition-colors"
          >
            Return to Login
          </button>
        )}
      </div>
    </div>
  );
}
