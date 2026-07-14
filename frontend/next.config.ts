import type { NextConfig } from "next";
import withPWAInit from "@ducanh2912/next-pwa";

const withPWA = withPWAInit({
  dest: "public",
  disable: false,
  register: true,
  customWorkerSrc: "worker",
  fallbacks: {
    document: "/~offline",
  },
  workboxOptions: {
    runtimeCaching: [
      {
        urlPattern: /\/(guides|scripture).*/i,
        handler: 'StaleWhileRevalidate',
        options: {
          cacheName: 'offline-content-cache',
          expiration: {
            maxEntries: 100,
            maxAgeSeconds: 30 * 24 * 60 * 60, // 30 days
          },
        }
      },
      {
        urlPattern: /\/api\/.*/i,
        handler: 'NetworkOnly',
        options: {
          backgroundSync: {
            name: 'api-sync-queue',
            options: {
              maxRetentionTime: 24 * 60 // 24 hours
            }
          }
        }
      }
    ]
  }
});

const nextConfig: NextConfig = {
  turbopack: {},
};

const config = withPWA(nextConfig);
config.turbopack = {};
export default config;
