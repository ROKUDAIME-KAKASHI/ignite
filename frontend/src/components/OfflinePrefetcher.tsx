"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";

const ROUTES_TO_PRECACHE = [
  "/ludo",
  "/quizzes",
  "/chess",
  "/bible",
  "/missions",
  "/prayer",
  "/comfort",
  "/intercession",
  "/~offline"
];

export function OfflinePrefetcher() {
  const router = useRouter();

  useEffect(() => {
    if (typeof window === "undefined" || !navigator.onLine) return;

    // 1. Next.js Client Router prefetch
    ROUTES_TO_PRECACHE.forEach((route) => {
      try {
        router.prefetch(route);
      } catch {}
    });

    // 2. Service Worker Cache prefetch if supported
    if ("caches" in window) {
      caches.open("offline-pages-cache").then((cache) => {
        ROUTES_TO_PRECACHE.forEach((url) => {
          fetch(url, { cache: "reload" })
            .then((res) => {
              if (res.ok) cache.put(url, res);
            })
            .catch(() => {});
        });
      });
    }
  }, [router]);

  return null;
}
