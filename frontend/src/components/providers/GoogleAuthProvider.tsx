"use client";

import { GoogleOAuthProvider } from "@react-oauth/google";

export function CustomGoogleOAuthProvider({ children }: { children: React.ReactNode }) {
  const clientId = process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID || "";
  
  // If no client ID is provided yet, just return children without the provider
  // This prevents crashes before the user sets up Google Auth
  if (!clientId) {
    return <>{children}</>;
  }

  return (
    <GoogleOAuthProvider clientId={clientId}>
      {children}
    </GoogleOAuthProvider>
  );
}
