"use client";

import { useEffect, useState } from "react";
import { useAuth } from "@/context/AuthContext";

function urlB64ToUint8Array(base64String: string) {
  const padding = "=".repeat((4 - (base64String.length % 4)) % 4);
  const base64 = (base64String + padding)
    .replace(/\-/g, "+")
    .replace(/_/g, "/");
  const rawData = window.atob(base64);
  const outputArray = new Uint8Array(rawData.length);
  for (let i = 0; i < rawData.length; ++i) {
    outputArray[i] = rawData.charCodeAt(i);
  }
  return outputArray;
}

export function PushNotificationManager() {
  const [isSupported, setIsSupported] = useState(false);
  const [permission, setPermission] = useState<NotificationPermission>("default");
  const { user } = useAuth();

  useEffect(() => {
    if (typeof window !== "undefined" && "serviceWorker" in navigator && "PushManager" in window) {
      const dismissed = localStorage.getItem("push-notifications-dismissed");
      if (dismissed === "true") {
        setTimeout(() => setPermission("denied"), 0);
      } else {
        setTimeout(() => setIsSupported(true), 0);
        setTimeout(() => setPermission(Notification.permission), 0);
      }
    }
  }, []);

  // Silently re-subscribe if permission is already granted and a user is logged in
  useEffect(() => {
    if (permission === "granted" && user) {
      (async () => {
        try {
          const registration = await navigator.serviceWorker.ready;
          const subscription = await registration.pushManager.subscribe({
            userVisibleOnly: true,
            applicationServerKey: urlB64ToUint8Array(process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY || "BEl62iUYgUivxIkv69yViEuiBIa-Ib9-SkvMeAtA3LFgDyepqRQ58A1Qggk37R4tM_L407V2Q2r21Xb_kR33-Rk")
          });
          await fetch('/api/notifications/subscribe', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ subscription })
          });
        } catch (e) {
          console.error("Silent resubscribe failed:", e);
        }
      })();
    }
  }, [permission, user]);

  const handleEnableNotifications = async () => {
    try {
      const permissionResult = await Notification.requestPermission();
      if (permissionResult === "granted") {
        const registration = await navigator.serviceWorker.ready;
        const subscription = await registration.pushManager.subscribe({
          userVisibleOnly: true,
          applicationServerKey: urlB64ToUint8Array(process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY || "BEl62iUYgUivxIkv69yViEuiBIa-Ib9-SkvMeAtA3LFgDyepqRQ58A1Qggk37R4tM_L407V2Q2r21Xb_kR33-Rk")
        });

        await fetch('/api/notifications/subscribe', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ subscription })
        });
        
        setPermission("granted");
      } else {
        localStorage.setItem("push-notifications-dismissed", "true");
        setPermission("denied");
      }
    } catch (err) {
      console.error("Failed to subscribe:", err);
    }
  };

  if (!isSupported || permission === "granted" || permission === "denied") return null;

  return (
    <div className="fixed bottom-4 right-4 z-50 bg-white dark:bg-gray-800 p-4 rounded-lg shadow-lg border border-gray-200 dark:border-gray-700 max-w-sm">
      <div className="flex flex-col gap-2">
        <h3 className="text-sm font-semibold">Enable Push Notifications</h3>
        <p className="text-xs text-gray-500 dark:text-gray-400">
          Stay updated with daily devotions and messages from your youth group.
        </p>
        <div className="flex justify-end gap-2 mt-2">
          <button 
            className="text-xs px-3 py-1.5 rounded-md hover:bg-gray-100 dark:hover:bg-gray-700"
            onClick={() => {
              localStorage.setItem("push-notifications-dismissed", "true");
              setPermission("denied");
            }}
          >
            Not Now
          </button>
          <button 
            className="text-xs px-3 py-1.5 rounded-md bg-amber-700 text-white hover:bg-amber-800"
            onClick={handleEnableNotifications}
          >
            Enable
          </button>
        </div>
      </div>
    </div>
  );
}
