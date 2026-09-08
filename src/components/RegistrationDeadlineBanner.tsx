'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Clock, ArrowRight, Sparkles, Flame, AlertCircle } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

// Registration deadline: 10 September 2026 at 23:59:59 IST (10D/09M/2026)
const REGISTRATION_DEADLINE_ISO = '2026-09-10T23:59:59+05:30';

export default function RegistrationDeadlineBanner() {
  const pathname = usePathname();
  const { user } = useAuth();
  const [mounted, setMounted] = useState(false);
  const [isClosed, setIsClosed] = useState(false);
  const [timeLeft, setTimeLeft] = useState({
    days: 0,
    hours: 0,
    minutes: 0,
    seconds: 0,
  });

  useEffect(() => {
    setMounted(true);
    const target = new Date(REGISTRATION_DEADLINE_ISO).getTime();

    const calculateTime = () => {
      const now = new Date().getTime();
      const diff = target - now;

      if (diff <= 0) {
        setIsClosed(true);
        setTimeLeft({ days: 0, hours: 0, minutes: 0, seconds: 0 });
        return;
      }

      const days = Math.floor(diff / (1000 * 60 * 60 * 24));
      const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
      const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
      const seconds = Math.floor((diff % (1000 * 60)) / 1000);

      setTimeLeft({ days, hours, minutes, seconds });
    };

    calculateTime();
    const interval = setInterval(calculateTime, 1000);
    return () => clearInterval(interval);
  }, []);

  if (!mounted) return null;

  return (
    <div className="relative w-full bg-gradient-to-r from-amber-950/90 via-purple-950/90 to-amber-950/90 border-b border-amber-500/30 text-white z-50 backdrop-blur-xl shadow-lg">
      <div className="max-w-7xl mx-auto px-3 sm:px-6 lg:px-8 py-2 sm:py-2.5 flex flex-wrap items-center justify-between gap-2 sm:gap-4 text-xs">
        
        {/* Left: Urgency tag & message */}
        <div className="flex items-center gap-2 sm:gap-3 flex-wrap">
          <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-amber-500/20 border border-amber-400/40 text-amber-300 font-bold text-[10px] sm:text-xs uppercase tracking-wider animate-pulse font-mono">
            <Flame className="w-3.5 h-3.5 text-amber-400" />
            <span>Strict Deadline</span>
          </span>

          <div className="flex items-center gap-1.5 text-zinc-200 text-[11px] sm:text-xs font-medium">
            <span className="hidden sm:inline">⚡</span>
            <span>
              Registration Closes on <strong className="text-white font-bold underline decoration-amber-400/60 underline-offset-2">10 Sept 2026</strong> (10D/09M/2026)
            </span>
          </div>
        </div>

        {/* Right: Countdown Ticker & CTA */}
        <div className="flex items-center gap-3 sm:gap-4 ml-auto">
          {isClosed ? (
            <span className="inline-flex items-center gap-1 text-rose-400 font-bold text-xs bg-rose-950/60 px-2.5 py-1 rounded-lg border border-rose-500/40">
              <AlertCircle className="w-3.5 h-3.5" />
              Registration Closed
            </span>
          ) : (
            <div className="flex items-center gap-1 sm:gap-1.5 font-mono text-amber-300 font-bold text-xs sm:text-sm bg-black/40 px-2.5 py-0.5 rounded-lg border border-white/10 shadow-inner">
              <Clock className="w-3.5 h-3.5 text-amber-400 hidden xs:inline" />
              <div className="flex items-center gap-1">
                <span className="text-white">{String(timeLeft.days).padStart(2, '0')}</span>
                <span className="text-[10px] text-zinc-400 font-sans">d</span>
                <span className="text-amber-400/60">:</span>
                <span className="text-white">{String(timeLeft.hours).padStart(2, '0')}</span>
                <span className="text-[10px] text-zinc-400 font-sans">h</span>
                <span className="text-amber-400/60">:</span>
                <span className="text-white">{String(timeLeft.minutes).padStart(2, '0')}</span>
                <span className="text-[10px] text-zinc-400 font-sans">m</span>
                <span className="text-amber-400/60">:</span>
                <span className="text-amber-300 animate-pulse">{String(timeLeft.seconds).padStart(2, '0')}</span>
                <span className="text-[10px] text-zinc-400 font-sans">s</span>
              </div>
            </div>
          )}

          {pathname !== '/register' && !user && !isClosed && (
            <Link
              href="/register"
              className="inline-flex items-center gap-1 bg-gradient-to-r from-amber-400 to-amber-300 hover:from-amber-300 hover:to-white text-black font-extrabold text-[11px] sm:text-xs px-3 sm:px-3.5 py-1 rounded-lg transition-all shadow-md hover:scale-105 active:scale-95 whitespace-nowrap"
            >
              <span>Register</span>
              <ArrowRight className="w-3 h-3" />
            </Link>
          )}
        </div>

      </div>
    </div>
  );
}
