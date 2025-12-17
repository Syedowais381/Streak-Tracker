'use client';

import { useRouter } from 'next/navigation';

export default function PrivacyPage() {
  const router = useRouter();

  return (
    <div className="min-h-screen relative overflow-hidden bg-gradient-primary">
      {/* Background */}
      <div className="fixed inset-0 bg-dot-pattern" />
      <div className="fixed top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 rounded-full bg-glow-blob animate-pulse-glow" />

      {/* Header */}
      <header className="fixed top-0 left-0 right-0 z-50 nav-glass">
        <div className="max-w-6xl mx-auto px-4 py-3 flex items-center gap-4">
          <a
            href="/"
            className="text-green-100 font-extrabold tracking-tight uppercase text-lg md:text-xl text-shadow-glow-sm whitespace-nowrap"
          >
            Streak Tracker
          </a>
          <div className="ml-auto flex items-center gap-5 md:gap-8">
            <a className="nav-link text-sm font-semibold whitespace-nowrap" href="/">
              Home
            </a>
            <a className="nav-link text-sm font-semibold whitespace-nowrap" href="/terms">
              Terms
            </a>
          </div>
        </div>
      </header>

      <div className="relative z-10 max-w-3xl mx-auto px-4 pt-20 sm:pt-24 pb-12 sm:pb-16">
        <button
          onClick={() => router.push('/')}
          className="btn-outline-glass text-white font-bold py-2.5 px-5 rounded-xl shadow-lg"
        >
          ← Back
        </button>

        <div className="glass-card rounded-2xl p-6 md:p-8 lg:p-10 mt-6">
          <h1 className="text-3xl md:text-4xl font-extrabold uppercase text-gradient-secondary mb-6">
            Privacy Policy
          </h1>
          
          <div className="space-y-6 text-green-200/85 leading-relaxed">
            <div>
              <p className="text-green-300/70 text-sm mb-2">Last Updated: {new Date().toLocaleDateString()}</p>
            </div>

            <section>
              <h2 className="text-xl md:text-2xl font-bold text-green-100 mb-3">1. Introduction</h2>
              <p className="mb-3">
                Welcome to Streak Tracker. We respect your privacy and are committed to protecting your personal data. 
                This privacy policy explains how we collect, use, and safeguard your information when you use our service.
              </p>
            </section>

            <section>
              <h2 className="text-xl md:text-2xl font-bold text-green-100 mb-3">2. Information We Collect</h2>
              <p className="mb-3">We collect the following types of information:</p>
              <ul className="list-disc list-inside space-y-2 ml-4">
                <li><strong className="text-green-100">Account Information:</strong> Email address and password for account creation and authentication.</li>
                <li><strong className="text-green-100">Habit Data:</strong> Information about habits you track, including habit names, streak counts, and check-in dates.</li>
                <li><strong className="text-green-100">Usage Data:</strong> Information about how you interact with our service, including timestamps and feature usage.</li>
              </ul>
            </section>

            <section>
              <h2 className="text-xl md:text-2xl font-bold text-green-100 mb-3">3. How We Use Your Information</h2>
              <p className="mb-3">We use your information to:</p>
              <ul className="list-disc list-inside space-y-2 ml-4">
                <li>Provide and maintain our service</li>
                <li>Process your habit tracking data</li>
                <li>Display leaderboard information (anonymized)</li>
                <li>Send you important updates about your account</li>
                <li>Improve our service and user experience</li>
              </ul>
            </section>

            <section>
              <h2 className="text-xl md:text-2xl font-bold text-green-100 mb-3">4. Data Storage and Security</h2>
              <p className="mb-3">
                Your data is stored securely using Supabase, a trusted cloud database service. We implement 
                industry-standard security measures to protect your information from unauthorized access, 
                alteration, disclosure, or destruction.
              </p>
            </section>

            <section>
              <h2 className="text-xl md:text-2xl font-bold text-green-100 mb-3">5. Data Sharing</h2>
              <p className="mb-3">
                We do not sell, trade, or rent your personal information to third parties. Your habit data 
                is private and only visible to you. Leaderboard displays show only anonymized streak information 
                without revealing personal details.
              </p>
            </section>

            <section>
              <h2 className="text-xl md:text-2xl font-bold text-green-100 mb-3">6. Your Rights</h2>
              <p className="mb-3">You have the right to:</p>
              <ul className="list-disc list-inside space-y-2 ml-4">
                <li>Access your personal data</li>
                <li>Correct inaccurate information</li>
                <li>Delete your account and data</li>
                <li>Opt-out of certain data processing activities</li>
              </ul>
            </section>

            <section>
              <h2 className="text-xl md:text-2xl font-bold text-green-100 mb-3">7. Cookies and Tracking</h2>
              <p className="mb-3">
                We use essential cookies to maintain your session and provide core functionality. 
                We do not use tracking cookies or third-party analytics that collect personal information.
              </p>
            </section>

            <section>
              <h2 className="text-xl md:text-2xl font-bold text-green-100 mb-3">8. Children's Privacy</h2>
              <p className="mb-3">
                Our service is not intended for users under the age of 13. We do not knowingly collect 
                personal information from children under 13.
              </p>
            </section>

            <section>
              <h2 className="text-xl md:text-2xl font-bold text-green-100 mb-3">9. Changes to This Policy</h2>
              <p className="mb-3">
                We may update this privacy policy from time to time. We will notify you of any changes 
                by posting the new policy on this page and updating the "Last Updated" date.
              </p>
            </section>

            <section>
              <h2 className="text-xl md:text-2xl font-bold text-green-100 mb-3">10. Contact Us</h2>
              <p className="mb-3">
                If you have any questions about this privacy policy or our data practices, please contact us 
                through the contact information provided on our website.
              </p>
            </section>
          </div>
        </div>
      </div>
    </div>
  );
}
