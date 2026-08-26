"use client";

import Link from "next/link";
import { ArrowLeft, Shield } from "lucide-react";

export default function PrivacyPage() {
  return (
    <div className="min-h-screen bg-[#03030f] text-zinc-300 font-sans py-24 relative bg-grid">
      <div className="max-w-3xl mx-auto px-6 relative z-10">
        <Link href="/" className="inline-flex items-center gap-2 text-xs text-zinc-500 hover:text-white transition-colors mb-12 group">
          <ArrowLeft className="h-4 w-4 group-hover:-translate-x-1 transition-transform" />
          Back to home
        </Link>

        <div className="flex items-center gap-3 mb-6">
          <div className="p-2 bg-white/5 rounded-xl border border-white/5 text-white">
            <Shield className="h-5 w-5" />
          </div>
          <span className="text-xs font-bold text-zinc-500 uppercase tracking-widest font-mono">legal</span>
        </div>

        <h1 className="text-3xl sm:text-4xl font-extrabold text-white mb-2">Privacy Policy</h1>
        <p className="text-xs text-zinc-500 mb-12">Last Updated: September 1, 2026</p>

        <div className="space-y-8 text-sm leading-relaxed text-zinc-400">
          <section className="space-y-3">
            <h2 className="text-lg font-bold text-white">1. Information We Collect</h2>
            <p>
              When you register for DESIGNATHON, we collect personal information necessary to organize the event, manage teams, and process registrations. This includes your name, email address, contact number, college/organization details, and payment information.
            </p>
          </section>

          <section className="space-y-3">
            <h2 className="text-lg font-bold text-white">2. How We Use Your Information</h2>
            <p>
              We use the collected information to:
            </p>
            <ul className="list-disc list-inside space-y-1.5 pl-2">
              <li>Verify your identity and eligibility for the hackathon.</li>
              <li>Coordinate team formation and communication.</li>
              <li>Provide access to our user dashboard and real-time updates.</li>
              <li>Process payment transactions and issue registration tickets.</li>
              <li>Send notifications regarding deadlines, schedules, and announcements.</li>
            </ul>
          </section>

          <section className="space-y-3">
            <h2 className="text-lg font-bold text-white">3. Information Sharing and Disclosure</h2>
            <p>
              We do not sell or rent your personal information to third parties. We may share necessary details with our official partners (ArtArtist, Value Laden, Samskruti College) and sponsors solely for internship evaluations, jury assessments, or event logistics.
            </p>
          </section>

          <section className="space-y-3">
            <h2 className="text-lg font-bold text-white">4. Data Security</h2>
            <p>
              We implement appropriate technical and organizational security measures to protect your personal data against unauthorized access, alteration, or disclosure. All transaction details are processed through secure gateway channels.
            </p>
          </section>

          <section className="space-y-3">
            <h2 className="text-lg font-bold text-white">5. Your Rights</h2>
            <p>
              You have the right to access, correct, or request the deletion of your personal data stored in your profile dashboard. For any privacy-related inquiries, contact us at <a href="mailto:support@designathon.in" className="text-white underline">support@designathon.in</a>.
            </p>
          </section>
        </div>

        <div className="border-t border-white/5 mt-16 pt-8 flex justify-between text-xs text-zinc-500 font-medium">
          <span>© 2026 designathon.in</span>
          <Link href="/terms" className="hover:text-white transition-colors">Terms of Service</Link>
        </div>
      </div>
    </div>
  );
}
