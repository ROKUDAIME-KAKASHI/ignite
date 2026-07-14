"use client";

import { useEffect, useState } from "react";
import { useAuth } from "@/context/AuthContext";
import { urlB64ToUint8Array } from "@/lib/utils";

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
          if ('serviceWorker' in navigator) {
            await navigator.serviceWorker.register('/sw.js');
          }
          const registration = await navigator.serviceWorker.ready;
          const subscription = await registration.pushManager.subscribe({
            userVisibleOnly: true,
            applicationServerKey: urlB64ToUint8Array(process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY || "BIr1RWyN87fiJWv_-co9Peyyo6tl3Xx51znoApIegoOQVxEGfC01BK-2qFLB5F4KBKWRPwDE_8zTAUA_2h-2MYc")
          });
          await fetch('/api/notifications/subscribe', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ subscription: subscription.toJSON() })
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
        if ('serviceWorker' in navigator) {
          await navigator.serviceWorker.register('/sw.js');
        }
        const registration = await navigator.serviceWorker.ready;
        const subscription = await registration.pushManager.subscribe({
          userVisibleOnly: true,
          applicationServerKey: urlB64ToUint8Array(process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY || "BIr1RWyN87fiJWv_-co9Peyyo6tl3Xx51znoApIegoOQVxEGfC01BK-2qFLB5F4KBKWRPwDE_8zTAUA_2h-2MYc")
        });

        await fetch('/api/notifications/subscribe', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ subscription: subscription.toJSON() })
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
