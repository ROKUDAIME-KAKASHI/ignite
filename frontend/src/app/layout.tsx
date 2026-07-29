import type { Metadata, Viewport } from "next";

import "./globals.css";
import { ThemeProvider } from "@/components/ThemeProvider";
import { AuthProvider } from "@/context/AuthContext";
import { Navigation } from "@/components/layout/Navigation";
import { MobileHeader } from "@/components/layout/MobileHeader";
import dynamic from "next/dynamic";

const GlobalChat = dynamic(() => import("@/components/GlobalChat").then(mod => mod.GlobalChat));
const PushNotificationManager = dynamic(() => import("@/components/PushNotificationManager").then(mod => mod.PushNotificationManager));
const InAppBrowserDetector = dynamic(() => import("@/components/layout/InAppBrowserDetector").then(mod => mod.InAppBrowserDetector));
const InstallPrompt = dynamic(() => import("@/components/InstallPrompt").then(mod => mod.InstallPrompt));
const OfflineHandler = dynamic(() => import("@/components/OfflineHandler").then(mod => mod.OfflineHandler));
const OfflinePrefetcher = dynamic(() => import("@/components/OfflinePrefetcher").then(mod => mod.OfflinePrefetcher));
import { CustomGoogleOAuthProvider } from "@/components/providers/GoogleAuthProvider";
import { Toaster } from "sonner";

import { Inter, Playfair_Display } from "next/font/google";

const inter = Inter({ 
  variable: "--font-inter", 
  subsets: ["latin"],
  display: "swap",
});

const playfair = Playfair_Display({ 
  variable: "--font-playfair", 
  subsets: ["latin"],
  display: "swap",
});

export const metadata: Metadata = {
  title: "Ignite | Daily Christian Youth Devotional & Prayer App",
  description: "Ignite is the ultimate Christian youth app. Build daily spiritual habits with a 5-minute devotional, youth Bible reading, prayer tracker, fellowship, and missions.",
  keywords: [
    "Ignite",
    "Christian youth app",
    "Daily Christian devotional",
    "Youth Bible app",
    "Prayer app for youth",
    "Christian missions",
    "Faith and fellowship",
    "Christian spiritual tracker",
    "5-minute devotional",
    "Youth faith builder",
    "Christian habits"
  ],
  manifest: "/manifest.json",
  appleWebApp: {
    capable: true,
    statusBarStyle: "default",
    title: "Ignite",
  },
  openGraph: {
    title: "Ignite | Daily Christian Youth Devotional",
    description: "Build daily spiritual habits with Ignite: Scripture, prayer, missions, and fellowship for Christian youth.",
    type: "website",
  },
  icons: {
    icon: "/icon-192x192.png",
    apple: "/icon-192x192.png",
  },
};

export const viewport: Viewport = {
  themeColor: "#d4a017",
  minimumScale: 1,
  initialScale: 1,
  width: "device-width",
  viewportFit: "cover",
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html
      lang="en"
      suppressHydrationWarning
      className={`${inter.variable} ${playfair.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col bg-background text-foreground md:flex-row">
        <ThemeProvider attribute="class" defaultTheme="light" enableSystem disableTransitionOnChange>
          <CustomGoogleOAuthProvider>
            <AuthProvider>
              <OfflineHandler />
              <OfflinePrefetcher />
              <Navigation />
              <MobileHeader />
              <InstallPrompt />
              <main className="flex-1 flex flex-col w-full overflow-hidden relative pb-20 md:pb-0">
                {children}
                <GlobalChat />
                <PushNotificationManager />
              </main>
              <Toaster position="top-center" richColors />
            </AuthProvider>
          </CustomGoogleOAuthProvider>
        </ThemeProvider>
        <InAppBrowserDetector />
      </body>
    </html>
  );
}
