'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { ArrowLeft } from 'lucide-react';

export default function PrivacyPage() {
  const router = useRouter();

  return (
    <div className="app-shell">
      <header className="topbar">
        <div className="app-container flex h-16 items-center justify-between">
          <Link href="/" className="brand">
            Streak Tracker
          </Link>
          <div className="flex items-center gap-2">
            <Link className="btn btn-ghost" href="/terms">
              Terms
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
            <h1 className="mt-2">Privacy Policy</h1>
            <p className="text-caption mt-2">Last Updated: {new Date().toLocaleDateString()}</p>

            <div className="mt-6 space-y-6">
              <section>
                <h3>1. Introduction</h3>
                <p className="text-body mt-2">
                  Streak Tracker respects your privacy and is committed to protecting your personal data. This policy
                  explains how we collect, use, and safeguard information when you use our service.
                </p>
              </section>

              <section>
                <h3>2. Information We Collect</h3>
                <ul className="text-body mt-2 list-disc space-y-2 pl-5">
                  <li>Account information such as email and password for authentication.</li>
                  <li>Habit data including names, streak counts, and check-in dates.</li>
                  <li>Usage data such as timestamps and interaction events.</li>
                </ul>
              </section>

              <section>
                <h3>3. How We Use Information</h3>
                <ul className="text-body mt-2 list-disc space-y-2 pl-5">
                  <li>Operate and maintain the product.</li>
                  <li>Process your streak tracking data.</li>
                  <li>Display anonymized leaderboard information.</li>
                  <li>Improve reliability and user experience.</li>
                </ul>
              </section>

              <section>
                <h3>4. Storage and Security</h3>
                <p className="text-body mt-2">
                  Data is stored securely with Supabase. We apply reasonable security controls to protect against
                  unauthorized access, disclosure, and modification.
                </p>
              </section>

              <section>
                <h3>5. Data Sharing</h3>
                <p className="text-body mt-2">
                  We do not sell personal data. Habit data remains private to your account. Leaderboard data is shown in
                  limited public form.
                </p>
              </section>

              <section>
                <h3>6. Your Rights</h3>
                <ul className="text-body mt-2 list-disc space-y-2 pl-5">
                  <li>Access and review your data.</li>
                  <li>Correct inaccurate information.</li>
                  <li>Delete your account and associated data.</li>
                </ul>
              </section>

              <section>
                <h3>7. Cookies</h3>
                <p className="text-body mt-2">
                  We use essential cookies/session storage for authentication and core product operation.
                </p>
              </section>

              <section>
                <h3>8. Children&apos;s Privacy</h3>
                <p className="text-body mt-2">The service is not intended for children under 13 years of age.</p>
              </section>

              <section>
                <h3>9. Policy Changes</h3>
                <p className="text-body mt-2">
                  Policy updates may be posted on this page with a revised &quot;Last Updated&quot; date.
                </p>
              </section>

              <section>
                <h3>10. Contact</h3>
                <p className="text-body mt-2">For privacy questions, contact us through the support channels listed on our website.</p>
              </section>
            </div>
          </article>
        </div>
      </main>
    </div>
  );
}

