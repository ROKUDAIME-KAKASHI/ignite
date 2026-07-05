import type { NextConfig } from "next";
import withPWAInit from "@ducanh2912/next-pwa";

const withPWA = withPWAInit({
  dest: "public",
  disable: process.env.NODE_ENV === "development",
  register: true,
  customWorkerDir: "worker",
  workboxOptions: {
    runtimeCaching: [
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
