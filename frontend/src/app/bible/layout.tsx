"use client";

import { useEffect, useRef } from "react";
import { useAuth } from "@/context/AuthContext";
import { awardXP } from "@/app/actions/gamification";

export default function BibleLayout({ children }: { children: React.ReactNode }) {
  const { user, setUser } = useAuth();
  const lastActivity = useRef(Date.now());

  useEffect(() => {
    const updateActivity = () => { lastActivity.current = Date.now(); };
    window.addEventListener("scroll", updateActivity, true);
    window.addEventListener("click", updateActivity, true);
    window.addEventListener("keypress", updateActivity, true);
    window.addEventListener("touchstart", updateActivity, true);
    window.addEventListener("mousemove", updateActivity, true);

    return () => {
      window.removeEventListener("scroll", updateActivity, true);
      window.removeEventListener("click", updateActivity, true);
      window.removeEventListener("keypress", updateActivity, true);
      window.removeEventListener("touchstart", updateActivity, true);
      window.removeEventListener("mousemove", updateActivity, true);
    };
  }, []);

  useEffect(() => {
    if (!user) return;

    // We track time in localStorage so it persists as they navigate between chapters
    const today = new Date().toISOString().split("T")[0];
    const key = `bible_read_time_${today}`;
    const awardedKey = `bible_read_awarded_${today}`;

    if (localStorage.getItem(awardedKey) === "1") return;

    const interval = setInterval(() => {
      if (localStorage.getItem(awardedKey) === "1") {
        clearInterval(interval);
        return;
      }

      // ANTI-CHEAT: Check if tab is active and user is not idle (45 seconds)
      const isVisible = document.visibilityState === "visible";
      const isIdle = Date.now() - lastActivity.current > 45000;

      if (!isVisible || isIdle) {
        return; // Pause timer if cheating/away
      }

      let time = parseInt(localStorage.getItem(key) || "0", 10);
      time += 1;
      localStorage.setItem(key, time.toString());

      // 10 minutes = 600 seconds
      if (time >= 600) {
        localStorage.setItem(awardedKey, "1");
        clearInterval(interval);
        awardXP(50, "Read Scripture for 10 minutes today").then((res) => {
          if (res.success && res.xp) {
            setUser({ ...user, xp: res.xp, level: res.level });
          }
        });
      }
    }, 1000);

    return () => clearInterval(interval);
  }, [user, setUser]);

  return <div className="flex flex-col h-full flex-1">{children}</div>;
}
