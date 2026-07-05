// To disable all workbox logging during development, you can set self.__WB_DISABLE_DEV_LOGS to true
// https://developers.google.com/web/tools/workbox/guides/configure-workbox#disable_logging

const _self = self as any;

// listen to message event from window
_self.addEventListener('message', (event: any) => {
  if (event.data && event.data.type === 'SKIP_WAITING') {
    _self.skipWaiting();
  }
});

// PWABuilder requirements
// Background Sync
_self.addEventListener('sync', (event: any) => {
  console.log('Background sync event fired:', event.tag);
  // Add your background sync logic here
});

// Periodic Sync
_self.addEventListener('periodicsync', (event: any) => {
  console.log('Periodic sync event fired:', event.tag);
  // Add your periodic sync logic here
});

// Push Notifications
_self.addEventListener('push', (event: any) => {
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
    event.waitUntil(_self.registration.showNotification(data.title, options));
  }
});

export {};

