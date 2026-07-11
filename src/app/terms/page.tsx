"use client";

import Link from "next/link";
import { ArrowLeft, FileText } from "lucide-react";

export default function TermsPage() {
  return (
    <div className="min-h-screen bg-[#03030f] text-zinc-300 font-sans py-24 relative bg-grid">
      <div className="max-w-3xl mx-auto px-6 relative z-10">
        <Link href="/" className="inline-flex items-center gap-2 text-xs text-zinc-500 hover:text-white transition-colors mb-12 group">
          <ArrowLeft className="h-4 w-4 group-hover:-translate-x-1 transition-transform" />
          Back to home
        </Link>

        <div className="flex items-center gap-3 mb-6">
          <div className="p-2 bg-white/5 rounded-xl border border-white/5 text-white">
            <FileText className="h-5 w-5" />
          </div>
          <span className="text-xs font-bold text-zinc-500 uppercase tracking-widest font-mono">legal</span>
        </div>

        <h1 className="text-3xl sm:text-4xl font-extrabold text-white mb-2">Terms of Service</h1>
        <p className="text-xs text-zinc-500 mb-12">Last Updated: September 1, 2026</p>

        <div className="space-y-8 text-sm leading-relaxed text-zinc-400">
          <section className="space-y-3">
            <h2 className="text-lg font-bold text-white">1. Event Registration</h2>
            <p>
              By registering for DESIGNTHON, you agree to provide accurate, current, and complete information. Each participant must complete their registration and submit any required payments to be verified. Teams must consist of 3 to 4 members.
            </p>
          </section>

          <section className="space-y-3">
            <h2 className="text-lg font-bold text-white">2. Code of Conduct</h2>
            <p>
              We are committed to providing a harassment-free and inclusive experience for all participants. You agree to treat all attendees, jury members, partners, and staff with respect. Any form of harassment, discrimination, or academic dishonesty will lead to immediate disqualification.
            </p>
          </section>

          <section className="space-y-3">
            <h2 className="text-lg font-bold text-white">3. Intellectual Property</h2>
            <p>
              All submissions, designs, code, and prototypes created during the hackathon remain the intellectual property of the respective participants. However, by submitting your project, you grant DESIGNTHON and its official partners a non-exclusive license to showcase, document, or feature your project for promotional purposes.
            </p>
          </section>

          <section className="space-y-3">
            <h2 className="text-lg font-bold text-white">4. Payment and Refunds</h2>
            <p>
              All registration fees are final. Payments are non-refundable except in cases where the event is canceled or rescheduled by the organizers.
            </p>
          </section>

          <section className="space-y-3">
            <h2 className="text-lg font-bold text-white">5. Limitation of Liability</h2>
            <p>
              DESIGNTHON organizers, partner firms (ArtArtist, Value Laden), and venue hosts (Samskruti College) are not liable for any direct, indirect, incidental, or consequential damages resulting from your participation in the hackathon.
            </p>
          </section>
        </div>

        <div className="border-t border-white/5 mt-16 pt-8 flex justify-between text-xs text-zinc-500 font-medium">
          <span>© 2026 designthon.in</span>
          <Link href="/privacy" className="hover:text-white transition-colors">Privacy Policy</Link>
        </div>
      </div>
    </div>
  );
}
