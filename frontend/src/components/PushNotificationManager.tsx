"use client";

import { useEffect } from "react";
import OneSignal from "react-onesignal";
import { useAuth } from "@/context/AuthContext";

export function PushNotificationManager() {
  const { user } = useAuth();

  useEffect(() => {
    const initOneSignal = async () => {
      try {
        await OneSignal.init({
          // TODO: Replace with your actual OneSignal App ID from the dashboard
          appId: process.env.NEXT_PUBLIC_ONESIGNAL_APP_ID || "YOUR_ONESIGNAL_APP_ID_HERE",
          // Enables testing on localhost without https
          allowLocalhostAsSecureOrigin: process.env.NODE_ENV === "development",
        });

        // Prompt the user for permission using OneSignal's built-in slidedown
        OneSignal.Slidedown.promptPush();

        // If the user is logged in, link their OneSignal subscription to their User ID
        if (user?.id) {
          OneSignal.login(user.id);
        }
      } catch (err) {
        console.error("OneSignal Initialization Error:", err);
      }
    };

    if (typeof window !== "undefined") {
      initOneSignal();
    }
  }, [user]);

  // OneSignal handles its own prompt UI, so we don't need to render anything here
  return null;
}
