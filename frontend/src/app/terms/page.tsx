"use client";

import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";
import { useRouter } from "next/navigation";

export default function TermsOfServicePage() {
  const router = useRouter();
  
  return (
    <div className="flex-1 bg-gray-50 dark:bg-[#0a0a0a] py-12 px-6">
      <div className="max-w-3xl mx-auto bg-white dark:bg-slate-900 rounded-[2rem] shadow-xl p-8 lg:p-12 border border-slate-200 dark:border-slate-800">
        <Button variant="ghost" onClick={() => router.back()} className="mb-6 -ml-4 text-slate-500">
          <ArrowLeft className="w-4 h-4 mr-2" /> Back
        </Button>
        
        <h1 className="text-4xl font-extrabold font-serif mb-2 bg-gradient-to-br from-gray-900 to-gray-500 bg-clip-text text-transparent dark:from-gray-100 dark:to-gray-500">
          Terms of Service
        </h1>
        <p className="text-slate-500 mb-8 font-medium">Last Updated: {new Date().toLocaleDateString()}</p>
        
        <div className="space-y-8 text-slate-700 dark:text-slate-300 leading-relaxed">
          <section>
            <h2 className="text-2xl font-bold text-slate-900 dark:text-white mb-4">1. Acceptance of Terms</h2>
            <p>
              By accessing and using Ignite, you agree to be bound by these Terms of Service and our Privacy Policy. If you do not agree to these terms, please do not use our application.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-slate-900 dark:text-white mb-4">2. Description of Service</h2>
            <p>
              Ignite is a gamified spiritual and community application providing features such as bible reading, mini-games (Chess, Ludo, Trivia, etc.), and community fellowship chat. We reserve the right to modify or discontinue any part of the service at any time without prior notice.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-slate-900 dark:text-white mb-4">3. User Conduct</h2>
            <p>You agree to use Ignite only for lawful purposes. You are strictly prohibited from:</p>
            <ul className="list-disc pl-5 mt-2 space-y-2">
              <li>Posting abusive, defamatory, or obscene content in community areas (like Fellowship).</li>
              <li>Attempting to hack, exploit, or disrupt the application or its servers.</li>
              <li>Impersonating other users or providing false information.</li>
            </ul>
            <p className="mt-4">
              We reserve the right to immediately suspend or terminate the account of any user who violates these rules.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-slate-900 dark:text-white mb-4">4. Intellectual Property</h2>
            <p>
              All content provided on Ignite, including text, graphics, logos, and software, is the property of Ignite and is protected by copyright and intellectual property laws. You may not reproduce, distribute, or create derivative works without explicit permission.
            </p>
          </section>
          
          <section>
            <h2 className="text-2xl font-bold text-slate-900 dark:text-white mb-4">5. Disclaimer of Warranties</h2>
            <p>
              Ignite is provided on an "as-is" and "as available" basis. We make no warranties, expressed or implied, regarding the reliability, accuracy, or availability of the service.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-slate-900 dark:text-white mb-4">6. Limitation of Liability</h2>
            <p>
              In no event shall Ignite or its developers be liable for any indirect, incidental, special, or consequential damages arising out of your use or inability to use the application.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-slate-900 dark:text-white mb-4">7. Governing Law</h2>
            <p>
              These Terms shall be governed and construed in accordance with the laws of India, without regard to its conflict of law provisions.
            </p>
          </section>
        </div>
      </div>
    </div>
  );
}
