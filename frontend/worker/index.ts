// To disable all workbox logging during development, you can set self.__WB_DISABLE_DEV_LOGS to true
// https://developers.google.com/web/tools/workbox/guides/configure-workbox#disable_logging

declare let self: ServiceWorkerGlobalScope;

// listen to message event from window
self.addEventListener('message', event => {
  if (event.data && event.data.type === 'SKIP_WAITING') {
    self.skipWaiting();
  }
});

// PWABuilder requirements
// Background Sync
self.addEventListener('sync', (event) => {
  console.log('Background sync event fired:', event.tag);
  // Add your background sync logic here
});

// Periodic Sync
self.addEventListener('periodicsync', (event) => {
  console.log('Periodic sync event fired:', event.tag);
  // Add your periodic sync logic here
});

// Push Notifications
self.addEventListener('push', (event) => {
  if (event.data) {
    const data = event.data.json();
    const options = {
      body: data.body,
      icon: data.icon || '/icon-192x192.png',
      vibrate: [100, 50, 100],
      data: {
        dateOfArrival: Date.now(),
        primaryKey: '2'
      }
    };
    event.waitUntil(self.registration.showNotification(data.title, options));
  }
});
