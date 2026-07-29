"use client";

import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";
import { useRouter } from "next/navigation";

export default function PrivacyPolicyPage() {
  const router = useRouter();
  
  return (
    <div className="flex-1 bg-gray-50 dark:bg-[#0a0a0a] py-12 px-6">
      <div className="max-w-3xl mx-auto bg-white dark:bg-slate-900 rounded-[2rem] shadow-xl p-8 lg:p-12 border border-slate-200 dark:border-slate-800">
        <Button variant="ghost" onClick={() => router.back()} className="mb-6 -ml-4 text-slate-500">
          <ArrowLeft className="w-4 h-4 mr-2" /> Back
        </Button>
        
        <h1 className="text-4xl font-extrabold font-serif mb-2 bg-gradient-to-br from-gray-900 to-gray-500 bg-clip-text text-transparent dark:from-gray-100 dark:to-gray-500">
          Privacy Policy
        </h1>
        <p className="text-slate-500 mb-8 font-medium">Last Updated: {new Date().toLocaleDateString()}</p>
        
        <div className="space-y-8 text-slate-700 dark:text-slate-300 leading-relaxed">
          <section>
            <h2 className="text-2xl font-bold text-slate-900 dark:text-white mb-4">1. Introduction</h2>
            <p>
              Welcome to Ignite. We respect your privacy and are committed to protecting your personal data in compliance with the Digital Personal Data Protection (DPDP) Act, 2023 of India. This Privacy Policy outlines what data we collect, why we collect it, and your rights regarding your data.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-slate-900 dark:text-white mb-4">2. The Data We Collect</h2>
            <p>To provide our services, we only collect the minimum required personal data:</p>
            <ul className="list-disc pl-5 mt-2 space-y-2">
              <li><strong>Profile Information:</strong> Your display name, email address, and avatar provided via Google OAuth during registration.</li>
              <li><strong>App Data:</strong> Experience Points (XP), game statistics, completed missions, and any messages or text you post in our community features (like Fellowship).</li>
            </ul>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-slate-900 dark:text-white mb-4">3. How We Use Your Data</h2>
            <p>Your data is exclusively used for the following purposes:</p>
            <ul className="list-disc pl-5 mt-2 space-y-2">
              <li>Authenticating your account securely using OAuth.</li>
              <li>Saving your progress across games, missions, and spiritual journeys.</li>
              <li>Displaying your profile to other users in multiplayer games and leaderboards.</li>
              <li>Improving the performance and security of the application.</li>
            </ul>
            <p className="mt-4 font-semibold text-emerald-600 dark:text-emerald-400">
              We do not sell, rent, or trade your personal data to any third parties for advertising or commercial purposes.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-slate-900 dark:text-white mb-4">4. Your Rights (DPDP Act, 2023)</h2>
            <p>Under the DPDP Act, 2023, you have several rights regarding your personal data:</p>
            <ul className="list-disc pl-5 mt-2 space-y-2">
              <li><strong>Right to Information:</strong> You can request a summary of the personal data being processed by us.</li>
              <li><strong>Right to Correction & Erasure:</strong> You can request correction of inaccurate data, or complete erasure of your account and personal data from our systems. This can be done instantly from your Profile Settings.</li>
              <li><strong>Right of Grievance Redressal:</strong> You have the right to register a grievance if your data privacy is breached.</li>
            </ul>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-slate-900 dark:text-white mb-4">5. Account & Data Deletion</h2>
            <p>
              You have the right to completely delete your account at any time. When you choose to delete your account via the Profile page, all your personal identifiable information (PII), XP, game history, and chat logs are permanently removed from our active database.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-slate-900 dark:text-white mb-4">6. Contact Us</h2>
            <p>
              If you have any questions, concerns, or grievances regarding this Privacy Policy or our data practices, please contact our Data Protection Officer at:
              <br/><br/>
              <strong>Email:</strong> privacy@ignite.app
            </p>
          </section>
        </div>
      </div>
    </div>
  );
}
