'use client';

import React from 'react';
import Link from 'next/link';

export default function Footer() {
  return (
    <footer className="w-full border-t border-white/5 bg-[#03030f] py-12 text-zinc-400">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {/* Brand */}
          <div className="flex flex-col gap-4 text-left">
            <Link href="/" className="flex items-center">
              <img src="/logo.png" alt="Logo" className="h-10 w-auto object-contain" />
            </Link>
            <p className="text-xs text-zinc-500 max-w-xs leading-relaxed">
              Creating the Future Through Art & Technology. Design • Collaborate • Innovate • Win.
            </p>
          </div>

          {/* Quick Links */}
          <div className="text-left">
            <h3 className="text-xs font-bold text-white uppercase tracking-wider mb-4">Event</h3>
            <ul className="space-y-2 text-xs">
              <li>
                <Link href="/#speakers" className="hover:text-white transition-colors">
                  Guest Speakers
                </Link>
              </li>
              <li>
                <Link href="/#prizes" className="hover:text-white transition-colors">
                  Prize Pool
                </Link>
              </li>
              <li>
                <Link href="/#faq" className="hover:text-white transition-colors">
                  FAQ
                </Link>
              </li>
            </ul>
          </div>

          {/* Sponsors & Powered By */}
          <div className="text-left">
            <h3 className="text-xs font-bold text-white uppercase tracking-wider mb-4">Partners & Sponsors</h3>
            <div className="space-y-3.5 text-xs">
              <div>
                <p className="text-[10px] text-zinc-600 font-bold uppercase tracking-wider">Powered By</p>
                <p className="text-zinc-400 mt-0.5">SkyWeb IT Solutions Pvt. Ltd.</p>
              </div>
              <div>
                <p className="text-[10px] text-zinc-600 font-bold uppercase tracking-wider">Official Partners</p>
                <p className="text-zinc-400 mt-0.5 leading-relaxed">
                  Samskruti • ArtArtist • Value Laden
                </p>
              </div>
            </div>
          </div>

          {/* Contact */}
          <div className="text-left">
            <h3 className="text-xs font-bold text-white uppercase tracking-wider mb-4">Contact Support</h3>
            <ul className="space-y-1.5 text-xs text-zinc-500">
              <li>Email: <a href="mailto:official@skywebdev.xyz" className="text-zinc-400 hover:text-white transition-colors">official@skywebdev.xyz</a></li>
              <li>Helpline: <a href="tel:+919912937061" className="text-zinc-400 hover:text-white transition-colors">+91 9912937061</a></li>
              <li className="pt-2 text-[10px] uppercase font-bold text-zinc-400 tracking-wider">Team Contacts:</li>
              <li className="text-[11px]"><span className="text-zinc-400">Vamshi:</span> <a href="tel:+918341339097" className="text-zinc-300 hover:text-white transition-colors">+91 83413 39097</a></li>
              <li className="text-[11px]"><span className="text-zinc-400">Arpan:</span> <a href="tel:+918121422761" className="text-zinc-300 hover:text-white transition-colors">+91 81214 22761</a></li>
              <li className="text-[11px]"><span className="text-zinc-400">Kalyan:</span> <a href="tel:+917396566279" className="text-zinc-300 hover:text-white transition-colors">+91 7396 566 279</a></li>
              <li className="text-[11px]"><span className="text-zinc-400">Arun:</span> <a href="tel:+918897959612" className="text-zinc-300 hover:text-white transition-colors">+91 88979 59612</a></li>
              <li className="text-[11px]"><span className="text-zinc-400">Vicky:</span> <a href="tel:+917396514989" className="text-zinc-300 hover:text-white transition-colors">+91 7396 514 989</a></li>
              <li className="pt-2">Venue: <span className="text-zinc-400">Cohort, Hyderabad, India</span></li>
            </ul>
          </div>
        </div>

        <div className="mt-12 pt-8 border-t border-white/5 flex flex-col sm:flex-row items-center justify-between gap-4 text-[10px] text-zinc-600">
          <p>© {new Date().getFullYear()} DESIGNTHON. Powered by SkyWeb IT Solutions Pvt. Ltd. All rights reserved.</p>
          <div className="flex gap-4">
            <Link href="/" className="hover:text-zinc-400 transition-colors">designthon.in</Link>
            <Link href="/privacy" className="hover:text-zinc-400 transition-colors">Privacy Policy</Link>
            <Link href="/terms" className="hover:text-zinc-400 transition-colors">Terms of Service</Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
