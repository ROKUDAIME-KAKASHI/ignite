// Scripts for firebase and firebase messaging
importScripts('https://www.gstatic.com/firebasejs/10.8.0/firebase-app-compat.js');
importScripts('https://www.gstatic.com/firebasejs/10.8.0/firebase-messaging-compat.js');

// Initialize the Firebase app in the service worker
// Note: Normally you'd want to inject the real config here, 
// but for now we'll rely on the frontend to handle the token generation.
firebase.initializeApp({
  apiKey: "AIzaSyCe0Sq2BgMMvVeMrpHdIYpvm3W_9lMR1qY",
  authDomain: "ignite-72c8b.firebaseapp.com",
  projectId: "ignite-72c8b",
  storageBucket: "ignite-72c8b.firebasestorage.app",
  messagingSenderId: "1071264021784",
  appId: "1:1071264021784:web:3d11300ae9b3182c06f26d",
});

// Retrieve firebase messaging
const messaging = firebase.messaging();

messaging.onBackgroundMessage((payload) => {
  console.log('[firebase-messaging-sw.js] Received background message ', payload);
  // Customize notification here
  const notificationTitle = payload.notification?.title || 'Ignite System';
  const notificationOptions = {
    body: payload.notification?.body,
    icon: '/favicon.ico'
  };

  self.registration.showNotification(notificationTitle, notificationOptions);
});
