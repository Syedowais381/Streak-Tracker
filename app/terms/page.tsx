'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { ArrowLeft } from 'lucide-react';

export default function TermsPage() {
  const router = useRouter();

  return (
    <div className="app-shell">
      <header className="topbar">
        <div className="app-container flex h-16 items-center justify-between">
          <Link href="/" className="brand">
            Streak Tracker
          </Link>
          <div className="flex items-center gap-2">
            <Link className="btn btn-ghost" href="/privacy">
              Privacy
            </Link>
            <button className="btn btn-ghost" onClick={() => router.push('/')}>
              <ArrowLeft className="h-4 w-4" />
              Back
            </button>
          </div>
        </div>
      </header>

      <main className="section">
        <div className="app-container max-w-3xl">
          <article className="surface-strong p-6 sm:p-8">
            <p className="eyebrow">Legal</p>
            <h1 className="mt-2">Terms of Service</h1>
            <p className="text-caption mt-2">Last Updated: {new Date().toLocaleDateString()}</p>

            <div className="mt-6 space-y-6">
              <section>
                <h3>1. Acceptance of Terms</h3>
                <p className="text-body mt-2">
                  By accessing and using Streak Tracker, you agree to these terms. If you do not agree, please do not
                  use the service.
                </p>
              </section>

              <section>
                <h3>2. Service Description</h3>
                <p className="text-body mt-2">
                  Streak Tracker helps users track daily habits, maintain streaks, and monitor consistency over time.
                </p>
              </section>

              <section>
                <h3>3. User Accounts</h3>
                <ul className="text-body mt-2 list-disc space-y-2 pl-5">
                  <li>Provide accurate account information.</li>
                  <li>Keep your credentials secure.</li>
                  <li>Accept responsibility for activity under your account.</li>
                  <li>Report unauthorized account access promptly.</li>
                </ul>
              </section>

              <section>
                <h3>4. Acceptable Use</h3>
                <ul className="text-body mt-2 list-disc space-y-2 pl-5">
                  <li>Do not use the service for illegal activity.</li>
                  <li>Do not attempt unauthorized system access.</li>
                  <li>Do not disrupt or abuse the platform.</li>
                  <li>Do not manipulate leaderboard outcomes.</li>
                </ul>
              </section>

              <section>
                <h3>5. User Content</h3>
                <p className="text-body mt-2">
                  You retain ownership of your habit data while granting us rights needed to store and process it to
                  provide the service.
                </p>
              </section>

              <section>
                <h3>6. Intellectual Property</h3>
                <p className="text-body mt-2">
                  The service design, branding, and software are owned by Streak Tracker and protected by applicable IP
                  laws.
                </p>
              </section>

              <section>
                <h3>7. Availability</h3>
                <p className="text-body mt-2">
                  We aim for high availability but do not guarantee uninterrupted access due to maintenance or
                  unforeseen events.
                </p>
              </section>

              <section>
                <h3>8. Limitation of Liability</h3>
                <p className="text-body mt-2">
                  To the extent allowed by law, Streak Tracker is not liable for indirect or consequential damages
                  related to service use.
                </p>
              </section>

              <section>
                <h3>9. Termination</h3>
                <p className="text-body mt-2">
                  We may suspend or terminate accounts for violations of these terms or misuse of the service.
                </p>
              </section>

              <section>
                <h3>10. Changes to Terms</h3>
                <p className="text-body mt-2">
                  We may update these terms at any time. Continued use after updates indicates acceptance.
                </p>
              </section>

              <section>
                <h3>11. Governing Law</h3>
                <p className="text-body mt-2">These terms are governed by applicable laws in the relevant jurisdiction.</p>
              </section>

              <section>
                <h3>12. Contact</h3>
                <p className="text-body mt-2">For terms-related questions, contact us through the support channels listed on our website.</p>
              </section>
            </div>
          </article>
        </div>
      </main>
    </div>
  );
}

