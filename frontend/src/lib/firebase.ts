import { initializeApp } from "firebase/app";
import { getMessaging, getToken, onMessage } from "firebase/messaging";

// Your web app's Firebase configuration from public/firebase-messaging-sw.js
const firebaseConfig = {
  apiKey: "AIzaSyCe0Sq2BgMMvVeMrpHdIYpvm3W_9lMR1qY",
  authDomain: "ignite-72c8b.firebaseapp.com",
  projectId: "ignite-72c8b",
  storageBucket: "ignite-72c8b.firebasestorage.app",
  messagingSenderId: "1071264021784",
  appId: "1:1071264021784:web:3d11300ae9b3182c06f26d",
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Initialize Firebase Cloud Messaging and get a reference to the service
export const messaging = typeof window !== "undefined" ? getMessaging(app) : null;

export const requestNotificationPermission = async () => {
  if (typeof window !== "undefined" && "Notification" in window) {
    const permission = await Notification.requestPermission();
    
    if (permission === "granted") {
      try {
        // We will need a VAPID key to get the token securely.
        // Usually you pass a vapidKey property here: getToken(messaging, { vapidKey: 'YOUR_PUBLIC_VAPID_KEY_HERE' })
        // If we don't have one, Firebase will use the default mechanism or throw an error.
        const token = await getToken(messaging!);
        console.log("FCM Token:", token);
        return token;
      } catch (error) {
        console.error("An error occurred while retrieving token. ", error);
        return null;
      }
    } else {
      console.log("Unable to get permission to notify.");
      return null;
    }
  }
};

export const onMessageListener = () =>
  new Promise((resolve) => {
    if (messaging) {
      onMessage(messaging, (payload) => {
        resolve(payload);
      });
    }
  });
