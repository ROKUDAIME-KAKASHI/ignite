"use client";

import { useEffect, useState } from "react";
import { requestNotificationPermission, onMessageListener } from "@/lib/firebase";

export function PushNotificationManager() {
  const [isSupported, setIsSupported] = useState(false);
  const [permission, setPermission] = useState<NotificationPermission>("default");
  const [token, setToken] = useState<string | null>(null);

  useEffect(() => {
    if (typeof window !== "undefined" && "Notification" in window) {
      setIsSupported(true);
      setPermission(Notification.permission);
    }
    
    // Listen for incoming messages while app is in foreground
    const setupListener = async () => {
      try {
        const payload: any = await onMessageListener();
        if (payload?.notification) {
          // You could replace this with a toast notification
          console.log("Foreground push notification received:", payload);
        }
      } catch (err) {
        console.error("Failed to listen for messages:", err);
      }
    };
    
    setupListener();
  }, []);

  const handleEnableNotifications = async () => {
    const fcmToken = await requestNotificationPermission();
    if (fcmToken) {
      setToken(fcmToken);
      setPermission("granted");
      // Here you would typically send the token to your backend API
      // await fetch('/api/user/push-token', { method: 'POST', body: JSON.stringify({ token: fcmToken }) });
    } else {
      setPermission("denied");
    }
  };

  if (!isSupported || permission === "granted") return null;

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
            onClick={() => setPermission("denied")}
          >
            Not Now
          </button>
          <button 
            className="text-xs px-3 py-1.5 rounded-md bg-blue-600 text-white hover:bg-blue-700"
            onClick={handleEnableNotifications}
          >
            Enable
          </button>
        </div>
      </div>
    </div>
  );
}
