import type { Metadata, Viewport } from "next";

import "./globals.css";
import { ThemeProvider } from "@/components/ThemeProvider";
import { AuthProvider } from "@/context/AuthContext";
import { Navigation } from "@/components/layout/Navigation";
import { MobileHeader } from "@/components/layout/MobileHeader";
import { GlobalChat } from "@/components/GlobalChat";
import { PushNotificationManager } from "@/components/PushNotificationManager";
import { CustomGoogleOAuthProvider } from "@/components/providers/GoogleAuthProvider";
import { InAppBrowserDetector } from "@/components/layout/InAppBrowserDetector";
import { InstallPrompt } from "@/components/InstallPrompt";
import { OfflineHandler } from "@/components/OfflineHandler";
import { OfflinePrefetcher } from "@/components/OfflinePrefetcher";

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
  title: "Ignite — Jacobite Orthodox Youth Movement Platform",
  description: "Your daily spiritual companion. Scripture, prayer, missions and community for Jacobite Orthodox youth navigating the fast-paced world.",
  manifest: "/manifest.json",
  appleWebApp: {
    capable: true,
    statusBarStyle: "default",
    title: "Ignite",
  },
  openGraph: {
    title: "Ignite — Jacobite Orthodox Youth Movement",
    description: "In a world that never stops, your faith never should.",
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
            </AuthProvider>
          </CustomGoogleOAuthProvider>
        </ThemeProvider>
        <InAppBrowserDetector />
      </body>
    </html>
  );
}
