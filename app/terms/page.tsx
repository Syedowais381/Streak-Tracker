'use client';

import { useRouter } from 'next/navigation';

export default function TermsPage() {
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
            <a className="nav-link text-sm font-semibold whitespace-nowrap" href="/privacy">
              Privacy
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
            Terms of Service
          </h1>
          
          <div className="space-y-6 text-green-200/85 leading-relaxed">
            <div>
              <p className="text-green-300/70 text-sm mb-2">Last Updated: {new Date().toLocaleDateString()}</p>
            </div>

            <section>
              <h2 className="text-xl md:text-2xl font-bold text-green-100 mb-3">1. Acceptance of Terms</h2>
              <p className="mb-3">
                By accessing and using Streak Tracker, you accept and agree to be bound by the terms and 
                provision of this agreement. If you do not agree to these terms, please do not use our service.
              </p>
            </section>

            <section>
              <h2 className="text-xl md:text-2xl font-bold text-green-100 mb-3">2. Description of Service</h2>
              <p className="mb-3">
                Streak Tracker is a habit tracking application that allows users to track daily habits, 
                maintain streaks, and monitor their progress. The service is provided "as is" and "as available."
              </p>
            </section>

            <section>
              <h2 className="text-xl md:text-2xl font-bold text-green-100 mb-3">3. User Accounts</h2>
              <p className="mb-3">To use our service, you must:</p>
              <ul className="list-disc list-inside space-y-2 ml-4">
                <li>Create an account with a valid email address</li>
                <li>Provide accurate and complete information</li>
                <li>Maintain the security of your account credentials</li>
                <li>Be responsible for all activities under your account</li>
                <li>Notify us immediately of any unauthorized use</li>
              </ul>
            </section>

            <section>
              <h2 className="text-xl md:text-2xl font-bold text-green-100 mb-3">4. Acceptable Use</h2>
              <p className="mb-3">You agree not to:</p>
              <ul className="list-disc list-inside space-y-2 ml-4">
                <li>Use the service for any illegal purpose</li>
                <li>Attempt to gain unauthorized access to the service</li>
                <li>Interfere with or disrupt the service</li>
                <li>Create multiple accounts to manipulate leaderboards</li>
                <li>Share your account credentials with others</li>
              </ul>
            </section>

            <section>
              <h2 className="text-xl md:text-2xl font-bold text-green-100 mb-3">5. User Content</h2>
              <p className="mb-3">
                You retain ownership of all habit data and content you create. By using our service, 
                you grant us a license to store, process, and display your data as necessary to provide 
                the service. You are solely responsible for the content you create.
              </p>
            </section>

            <section>
              <h2 className="text-xl md:text-2xl font-bold text-green-100 mb-3">6. Intellectual Property</h2>
              <p className="mb-3">
                The service, including its original content, features, and functionality, is owned by 
                Streak Tracker and is protected by international copyright, trademark, and other intellectual 
                property laws.
              </p>
            </section>

            <section>
              <h2 className="text-xl md:text-2xl font-bold text-green-100 mb-3">7. Service Availability</h2>
              <p className="mb-3">
                We strive to provide continuous service availability but do not guarantee uninterrupted 
                access. The service may be temporarily unavailable due to maintenance, updates, or 
                unforeseen circumstances.
              </p>
            </section>

            <section>
              <h2 className="text-xl md:text-2xl font-bold text-green-100 mb-3">8. Limitation of Liability</h2>
              <p className="mb-3">
                Streak Tracker shall not be liable for any indirect, incidental, special, consequential, 
                or punitive damages resulting from your use or inability to use the service.
              </p>
            </section>

            <section>
              <h2 className="text-xl md:text-2xl font-bold text-green-100 mb-3">9. Termination</h2>
              <p className="mb-3">
                We reserve the right to terminate or suspend your account and access to the service 
                immediately, without prior notice, for conduct that we believe violates these Terms 
                of Service or is harmful to other users, us, or third parties.
              </p>
            </section>

            <section>
              <h2 className="text-xl md:text-2xl font-bold text-green-100 mb-3">10. Changes to Terms</h2>
              <p className="mb-3">
                We reserve the right to modify these terms at any time. We will notify users of any 
                material changes by updating the "Last Updated" date. Your continued use of the service 
                after changes constitutes acceptance of the new terms.
              </p>
            </section>

            <section>
              <h2 className="text-xl md:text-2xl font-bold text-green-100 mb-3">11. Governing Law</h2>
              <p className="mb-3">
                These terms shall be governed by and construed in accordance with applicable laws, 
                without regard to its conflict of law provisions.
              </p>
            </section>

            <section>
              <h2 className="text-xl md:text-2xl font-bold text-green-100 mb-3">12. Contact Information</h2>
              <p className="mb-3">
                If you have any questions about these Terms of Service, please contact us through 
                the contact information provided on our website.
              </p>
            </section>
          </div>
        </div>
      </div>
    </div>
  );
}
