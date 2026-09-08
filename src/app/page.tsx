'use client';

import React, { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import { Calendar, MapPin, Award, Users, ShieldAlert, Sparkles, MessageSquare, ArrowRight, CheckCircle2, ChevronDown, Trophy, Clock, Cpu, BookOpen, Layers, Check, Ticket, ChevronLeft, ChevronRight, Palette, Lightbulb, Rocket, Flame } from 'lucide-react';

const PRIZE_TIERS = [
  {
    name: "Second Prize",
    icon: <Sparkles className="h-5 w-5 text-zinc-300" />,
    prizeValue: "Exclusive Internship",
    description: "Receive internship offers from our top partner firms.",
    features: [
      "Internship offer from ArtArtist",
      "Internship offer from Value Laden",
      "Portfolio Review sessions",
      "Direct Jury Mentorship"
    ],
    color: "zinc"
  },
  {
    name: "First Prize",
    icon: <Trophy className="h-5 w-5 text-white" />,
    prizeValue: "₹20,000 Cash",
    description: "Become the DESIGNATHON Champion and take home the grand cash reward.",
    features: [
      "Grand ₹20,000 Cash Prize",
      "DESIGNATHON Winner Trophy",
      "Winner E-Certificate",
      "National Portfolio Spotlight"
    ],
    popular: true,
    color: "white"
  },
  {
    name: "Third Prize",
    icon: <Layers className="h-5 w-5 text-zinc-400" />,
    prizeValue: "Mystery Gift Hamper",
    description: "A surprise premium gift curated especially for our winning creative team.",
    features: [
      "Exclusive Mystery Gift",
      "Hamper of Design Assets",
      "Finalist Certificate",
      "Creative Recognition"
    ],
    color: "zinc"
  }
];

// Guest Speakers & Mentors
const SPEAKERS = [
  { name: 'Praneeth Margam', role: 'Design Lead, Chai Shots', image: '/speaker-praneeth.jpg' },
  { name: 'Uday Sangisetti', role: 'Founder, ArtArtist', image: '/speaker-uday.jpg' },
  { name: 'Lavanya Pasunoori', role: 'Founder, Value Laden', image: '/speaker-lavanya.jpg' },
  { name: 'Vishnu Kondoj', role: 'Founder, MasterBrush Art Foundation & 17-Year Graphic Designer at Tech Mahindra', image: '/speaker-new.jpg', bw: true },
];

// Why Participate bullets
const BENEFITS = [
  'Day 1 hands-on UI/UX workshop by industry leads',
  'Day 2 live hackathon solving real-world challenges',
  'Figma mastery & Design Thinking frameworks',
  'Collaborate with talented designers in teams of 3-4',
  '1-on-1 direct jury mentorship and critique',
  'Direct internship opportunities at partner firms',
  '₹20,000 Grand Cash Prize + Winner Trophies',
  'Verified participation certificate for every student'
];

// Highlights list
const HIGHLIGHTS = [
  '2-Day National UI/UX Event',
  'Day 1: Hands-on UI/UX Workshop',
  'Day 2: Live UI/UX Hackathon',
  'Design Thinking & Prototyping',
  'Expert Speaker Sessions & Mentorship',
  'Team Collaboration (3–4 Members)',
  'Accommodation Provided for Out-of-State Teams (3–4 Members)',
  'Live Jury Pitches & Demos',
  '₹20,000 Cash Prize Pool',
  'Delicious Food Provided Both Days'
];

const INCLUSIONS = [
  'Day 1: Full-Day Hands-on Workshop',
  'Day 2: Live UI/UX Hackathon Access',
  'Figma & Design Thinking Masterclasses',
  '1-on-1 Mentorship from Industry Leads',
  'Participation in ₹20,000 Prize Pool',
  'Accommodation for Out-of-State Teams (3–4 Members)',
  'Internship Opportunities with Partners',
  'Verified Participation Certificate',
  'Team Collaboration & Networking',
  'Food & Refreshments Included Both Days'
];

// FAQ items
const FAQS = [
  { q: 'What is the schedule for the 2 days?', a: 'Day 1 (12 Sept) is an intensive, hands-on UI/UX Design Workshop covering Figma, Design Thinking, UX Research, and mentorship from industry leads. Day 2 (13 Sept) is the full-day UI/UX Hackathon where teams build interactive prototypes for live problem statements and present to jury judges.' },
  { q: 'Is accommodation provided for out-of-state teams?', a: 'Yes! Accommodation is provided per team for teams of 3–4 members joining from outside the state. Please note that accommodation is provided exclusively for full teams of 3–4 members and is NOT provided for individual registrants or local attendees.' },
  { q: 'Can I participate individually?', a: 'Yes. Register individually first and then log in to create or join a team of 3-4 members.' },
  { q: 'How many members are allowed in a team?', a: 'Teams must consist of 3-4 members. You can form your team anytime before the hackathon begins.' },
  { q: 'Is the registration pass individual?', a: 'Yes. Every participant registers individually, which covers full 2-day access (Day 1 Workshop + Day 2 Hackathon), food, mentorship, and certificates.' },
  { q: 'Are beginners allowed to join?', a: 'Absolutely! Day 1 is dedicated to teaching UI/UX design concepts, tools, and best practices so participants of all skill levels can build confidently on Day 2.' },
  { q: 'Will certificates and food be provided?', a: 'Yes. Official participation certificates and food/refreshments are provided for both days of the event.' },
];

const SLIDESHOW_IMAGES = [
  { src: '/slideshow-1.jpg', alt: 'National Level Hackathon Nellore 1' },
  { src: '/slideshow-2.jpg', alt: 'National Level Hackathon Nellore 2' },
  { src: '/slideshow-3.jpg', alt: 'National Level Hackathon Nellore 3' },
  { src: '/slideshow-4.jpg', alt: 'National Level Hackathon Nellore 4' },
  { src: '/slideshow-5.jpg', alt: 'National Level Hackathon Nellore 5' }
];

export default function LandingPage() {
  const [activeTimerTab, setActiveTimerTab] = useState<'registration' | 'event'>('registration');
  const [regTimeLeft, setRegTimeLeft] = useState({ days: 0, hours: 0, minutes: 0, seconds: 0, isClosed: false });
  const [eventTimeLeft, setEventTimeLeft] = useState({ days: 0, hours: 0, minutes: 0, seconds: 0, isStarted: false });
  const [faqOpen, setFaqOpen] = useState<number | null>(null);

  // Countdown timer logic targeting Registration Deadline (10 Sept 2026 23:59:59 IST) & Event Start (12 Sept 2026 09:00:00 IST)
  useEffect(() => {
    const regTargetDate = new Date('2026-09-10T23:59:59+05:30').getTime();
    const eventTargetDate = new Date('2026-09-12T09:00:00+05:30').getTime();

    const updateTimers = () => {
      const now = new Date().getTime();
      
      // Registration countdown
      const regDiff = regTargetDate - now;
      if (regDiff <= 0) {
        setRegTimeLeft({ days: 0, hours: 0, minutes: 0, seconds: 0, isClosed: true });
      } else {
        setRegTimeLeft({
          days: Math.floor(regDiff / (1000 * 60 * 60 * 24)),
          hours: Math.floor((regDiff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60)),
          minutes: Math.floor((regDiff % (1000 * 60 * 60)) / (1000 * 60)),
          seconds: Math.floor((regDiff % (1000 * 60)) / 1000),
          isClosed: false,
        });
      }

      // Event kickoff countdown
      const eventDiff = eventTargetDate - now;
      if (eventDiff <= 0) {
        setEventTimeLeft({ days: 0, hours: 0, minutes: 0, seconds: 0, isStarted: true });
      } else {
        setEventTimeLeft({
          days: Math.floor(eventDiff / (1000 * 60 * 60 * 24)),
          hours: Math.floor((eventDiff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60)),
          minutes: Math.floor((eventDiff % (1000 * 60 * 60)) / (1000 * 60)),
          seconds: Math.floor((eventDiff % (1000 * 60)) / 1000),
          isStarted: false,
        });
      }
    };

    updateTimers();
    const timer = setInterval(updateTimers, 1000);
    return () => clearInterval(timer);
  }, []);

  const toggleFaq = (index: number) => {
    setFaqOpen(faqOpen === index ? null : index);
  };

  const displayTime = activeTimerTab === 'registration' ? regTimeLeft : eventTimeLeft;

  return (
    <div className="flex-1 w-full bg-[#03030f] relative overflow-hidden bg-grid">
      {/* Decorative ambient glows */}
      <div className="absolute top-[-10%] left-[-10%] w-[50%] h-[50%] rounded-full bg-amber-600/5 blur-[120px] pointer-events-none" />
      <div className="absolute bottom-[20%] right-[-10%] w-[50%] h-[50%] rounded-full bg-purple-900/10 blur-[120px] pointer-events-none" />

      {/* Hero Section with Vertical Marquee */}
      <section className="relative pt-20 pb-16 md:pt-28 md:pb-24 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto overflow-hidden">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-20 items-center">
          
          {/* Left Column - Hero Content */}
          <div className="space-y-8 max-w-xl text-left">
            {/* Floating Tag */}
            <div className="inline-flex items-center gap-2 rounded-full border border-amber-500/30 bg-amber-500/10 px-4 py-1.5 text-xs font-semibold text-amber-300 backdrop-blur-md shadow-lg shadow-amber-950/30">
              <Flame className="h-3.5 w-3.5 text-amber-400 animate-pulse" />
              <span>🚨 <strong className="text-white font-bold">Registration Closes: 10 Sept 2026</strong> • <strong className="text-white font-bold">Workshop & Hackathon</strong></span>
            </div>

            {/* Hero Title */}
            <h1 className="text-4xl sm:text-5xl md:text-6xl font-extrabold tracking-tight leading-tight text-white">
              DESIGNATHON 2026
              <span className="block text-zinc-500 text-xs sm:text-sm font-semibold tracking-[0.25em] uppercase font-mono mt-1">
                by SkyWeb
              </span>
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-white via-zinc-300 to-zinc-500 block mt-2 text-2xl sm:text-3xl md:text-4xl font-bold">
                Creating the Future Through Art & Technology
              </span>
            </h1>

            {/* Tagline */}
            <p className="text-zinc-400 text-xs sm:text-sm md:text-base leading-relaxed">
              Experience an immersive 2-day design journey. Attend an intensive hands-on UI/UX workshop on <strong className="text-zinc-200">Day 1</strong>, then collaborate and compete in the live design hackathon on <strong className="text-zinc-200">Day 2</strong> for <strong className="text-white font-semibold">₹20,000</strong> in prizes and internships.
            </p>

            {/* Call to Actions */}
            <div className="flex flex-wrap gap-4">
              <Link
                href="/register"
                className="group relative px-6 py-3.5 bg-gradient-to-r from-amber-400 via-amber-300 to-white hover:from-white hover:to-amber-300 text-black rounded-xl font-bold text-xs overflow-hidden transition-all duration-300 hover:scale-105 hover:shadow-xl shadow-amber-500/10 flex items-center gap-1.5 cursor-pointer"
              >
                <span className="relative z-10">REGISTER BEFORE 10 SEPT</span>
                <ArrowRight className="h-4 w-4 relative z-10" />
                <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent translate-x-[-200%] group-hover:translate-x-[200%] transition-transform duration-700"></div>
              </Link>
              <Link
                href="/teams"
                className="group relative px-6 py-3.5 border border-white/10 hover:border-white/20 bg-white/5 hover:bg-white/10 text-zinc-300 hover:text-white rounded-xl font-bold text-xs overflow-hidden transition-all duration-300 hover:scale-105 hover:shadow-lg flex items-center gap-1.5 cursor-pointer shadow-inner"
              >
                <span className="relative z-10">EXPLORE TEAMS</span>
                <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/5 to-transparent translate-x-[-200%] group-hover:translate-x-[200%] transition-transform duration-700"></div>
              </Link>
            </div>

            {/* Event Quick Info Cards */}
            <div className="pt-8 border-t border-white/5 grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div className="group flex items-center gap-3.5 bg-amber-500/[0.04] border border-amber-500/20 hover:border-amber-500/40 rounded-2xl p-4 transition-all duration-300 hover:bg-amber-500/[0.08] hover:scale-[1.02] hover:shadow-lg hover:shadow-amber-950/20 text-left">
                <div className="flex items-center justify-center h-10 w-10 rounded-xl bg-amber-500/10 text-amber-400 group-hover:text-amber-300 transition-colors flex-shrink-0">
                  <Clock className="h-5 w-5 animate-pulse" />
                </div>
                <div className="flex flex-col">
                  <span className="text-[10px] text-amber-400 uppercase tracking-wider font-bold">Reg. Deadline:</span>
                  <span className="text-xs font-bold text-white">10 Sept 2026</span>
                  <span className="text-[9px] text-amber-300/80 font-mono">11:59 PM (10D/09M)</span>
                </div>
              </div>

              <div className="group flex items-center gap-3.5 bg-white/[0.02] border border-white/5 hover:border-white/10 rounded-2xl p-4 transition-all duration-300 hover:bg-white/[0.04] hover:scale-[1.02] hover:shadow-lg hover:shadow-black/20 text-left">
                <div className="flex items-center justify-center h-10 w-10 rounded-xl bg-white/5 text-zinc-400 group-hover:text-white transition-colors flex-shrink-0">
                  <Calendar className="h-5 w-5" />
                </div>
                <div className="flex flex-col">
                  <span className="text-[10px] text-zinc-500 uppercase tracking-wider font-bold">Event Days:</span>
                  <span className="text-xs font-bold text-white">12–13 Sept '26</span>
                  <span className="text-[9px] text-zinc-400 font-mono">2 Full Days</span>
                </div>
              </div>

              <div className="group flex items-center gap-3.5 bg-white/[0.02] border border-white/5 hover:border-white/10 rounded-2xl p-4 transition-all duration-300 hover:bg-white/[0.04] hover:scale-[1.02] hover:shadow-lg hover:shadow-black/20 text-left">
                <div className="flex items-center justify-center h-10 w-10 rounded-xl bg-white/5 text-zinc-400 group-hover:text-white transition-colors flex-shrink-0">
                  <Ticket className="h-5 w-5" />
                </div>
                <div className="flex flex-col">
                  <span className="text-[10px] text-zinc-500 uppercase tracking-wider font-bold">Access Pass:</span>
                  <span className="text-xs font-bold text-white">Workshop + Hack</span>
                  <span className="text-[9px] text-emerald-400 font-mono">Food & Certs Included</span>
                </div>
              </div>
            </div>

          </div>

          {/* Right Column - Pure CSS Photo Slideshow */}
          <div className="relative flex flex-col items-center justify-center w-full">
            <div className="slideshow border border-white/10 shadow-2xl shadow-purple-950/20 bg-[#08081a]">
              <div className="slides">
                {SLIDESHOW_IMAGES.map((img, idx) => (
                  <div key={idx} className="slide relative group">
                    <img
                      src={img.src}
                      alt={img.alt}
                      className="w-full h-full object-cover"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent pointer-events-none" />
                  </div>
                ))}
              </div>
            </div>
            
            {/* National Level Hackathon Info Badge */}
            <div className="mt-4 flex justify-center">
              <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full border border-white/10 bg-[#08081a]/80 backdrop-blur-md shadow-lg">
                <span className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse" />
                <p className="text-[11px] font-semibold text-zinc-300 tracking-wide">
                  Conducted National Level Hackathon on 8/08/2026 at Nellore
                </p>
              </div>
            </div>
          </div>

        </div>
      </section>

      {/* Upgraded Countdown Ticker Section */}
      <section className="py-16 bg-gradient-to-b from-amber-950/10 via-[#0a0718] to-white/[0.01] border-y border-amber-500/20 backdrop-blur-md relative overflow-hidden">
        {/* Glow orb */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-amber-500/10 blur-[100px] rounded-full pointer-events-none" />
        
        <div className="max-w-4xl mx-auto px-4 text-center relative z-10 space-y-6">
          
          {/* Tab Switcher for Countdown */}
          <div className="inline-flex items-center p-1 rounded-full bg-black/60 border border-white/10 backdrop-blur-md">
            <button
              onClick={() => setActiveTimerTab('registration')}
              className={`px-4 py-1.5 rounded-full text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5 ${
                activeTimerTab === 'registration'
                  ? 'bg-gradient-to-r from-amber-500 to-amber-400 text-black shadow-lg shadow-amber-500/20'
                  : 'text-zinc-400 hover:text-white'
              }`}
            >
              <Flame className="w-3.5 h-3.5" />
              <span>Registration Closes (10 Sept)</span>
            </button>
            <button
              onClick={() => setActiveTimerTab('event')}
              className={`px-4 py-1.5 rounded-full text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5 ${
                activeTimerTab === 'event'
                  ? 'bg-gradient-to-r from-purple-600 to-blue-600 text-white shadow-lg shadow-purple-600/20'
                  : 'text-zinc-400 hover:text-white'
              }`}
            >
              <Sparkles className="w-3.5 h-3.5" />
              <span>Event Kickoff (12 Sept)</span>
            </button>
          </div>

          {/* Title & Badge */}
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-amber-500/10 border border-amber-500/20 text-amber-300 text-xs font-mono font-bold mb-2">
              <Clock className="w-3.5 h-3.5 animate-spin" style={{ animationDuration: '6s' }} />
              <span>{activeTimerTab === 'registration' ? 'REGISTRATION DEADLINE: 10D/09M/2026 (11:59 PM IST)' : 'HACKATHON EVENT STARTS: 12 SEPT 2026 (09:00 AM IST)'}</span>
            </div>
            <h3 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
              {activeTimerTab === 'registration' ? 'Registration Closes In' : 'DESIGNATHON Hacking Starts In'}
            </h3>
            <p className="text-zinc-400 text-xs sm:text-sm mt-1 max-w-md mx-auto">
              {activeTimerTab === 'registration' 
                ? 'Strict cutoff on September 10th, 2026. Late registrations will not be accepted once the clock hits zero.'
                : 'Get ready for 2 action-packed days of workshop mastery and live UI/UX prototyping!'}
            </p>
          </div>

          {/* Countdown Clock Grid */}
          <div className="grid grid-cols-4 gap-3 sm:gap-6 max-w-xl mx-auto pt-2">
            {[
              { label: 'Days', value: displayTime.days },
              { label: 'Hours', value: displayTime.hours },
              { label: 'Minutes', value: displayTime.minutes },
              { label: 'Seconds', value: displayTime.seconds },
            ].map((item, idx) => (
              <div
                key={item.label}
                className="relative group p-4 sm:p-5 rounded-2xl bg-gradient-to-b from-[#110d24] to-[#060412] border border-amber-500/20 hover:border-amber-400/40 shadow-xl shadow-black/40 transition-all duration-300 hover:scale-105 flex flex-col items-center justify-center overflow-hidden"
              >
                {/* Top glow accent */}
                <div className="absolute top-0 left-0 right-0 h-[2px] bg-gradient-to-r from-transparent via-amber-400/60 to-transparent" />
                
                <span className="text-3xl sm:text-5xl font-black text-white font-mono tracking-tight group-hover:text-amber-300 transition-colors">
                  {String(item.value).padStart(2, '0')}
                </span>
                <span className="text-[10px] sm:text-xs text-zinc-400 uppercase tracking-widest mt-1.5 font-bold">
                  {item.label}
                </span>

                {/* Live pulsing dot on seconds */}
                {item.label === 'Seconds' && (
                  <div className="absolute top-2 right-2 flex items-center justify-center">
                    <span className="h-2 w-2 rounded-full bg-amber-400 animate-ping absolute" />
                    <span className="h-2 w-2 rounded-full bg-amber-400" />
                  </div>
                )}
              </div>
            ))}
          </div>

          {/* Action CTA within Countdown */}
          <div className="pt-4 flex flex-col sm:flex-row items-center justify-center gap-3">
            <Link
              href="/register"
              className="px-6 py-3 rounded-xl bg-gradient-to-r from-amber-400 to-amber-300 hover:from-amber-300 hover:to-white text-black font-extrabold text-xs shadow-lg shadow-amber-500/20 hover:scale-105 transition-all flex items-center gap-2 cursor-pointer"
            >
              <span>REGISTER NOW BEFORE 10 SEPT CLOSES</span>
              <ArrowRight className="w-4 h-4" />
            </Link>
            <span className="text-xs text-zinc-400 font-medium">
              Limited seats • ₹649 Pass / ₹999 with Stay
            </span>
          </div>

        </div>
      </section>

      {/* 2-Day Event Schedule & Breakdown Section */}
      <section id="schedule" className="py-24 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center relative">
        {/* Decorative backdrop light */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-3/4 h-3/4 bg-white/[0.015] blur-3xl rounded-full pointer-events-none" />

        <div className="max-w-3xl mx-auto space-y-4 mb-16">
          <div className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-4 py-1.5 text-xs font-semibold text-zinc-300 backdrop-blur-md font-mono">
            <Clock className="h-3.5 w-3.5 text-zinc-400" />
            <span>2-DAY IMMERSIVE SCHEDULE</span>
          </div>
          <h2 className="text-3xl sm:text-4xl md:text-5xl font-extrabold text-white tracking-tight">
            1 Day Workshop + 1 Day UI/UX Hackathon
          </h2>
          <p className="text-zinc-400 text-xs sm:text-sm md:text-base leading-relaxed max-w-2xl mx-auto">
            A comprehensive 2-day experience designed to take you from foundational design thinking to high-stakes prototyping and live jury presentations.
          </p>
        </div>

        {/* 2-Day Cards Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 max-w-5xl mx-auto text-left relative z-10">
          
          {/* DAY 1: Workshop Card */}
          <div className="group relative rounded-3xl p-8 glass-panel border border-white/10 hover:border-white/20 transition-all duration-300 hover:shadow-2xl hover:shadow-black/40 flex flex-col justify-between overflow-hidden">
            {/* Top accent glow line */}
            <div className="absolute top-0 left-0 right-0 h-[2px] bg-gradient-to-r from-transparent via-blue-500/50 to-transparent" />
            
            <div>
              {/* Header Badge */}
              <div className="flex items-center justify-between gap-4 mb-6">
                <span className="px-3 py-1 rounded-full bg-blue-500/10 border border-blue-500/20 text-blue-300 text-[11px] font-bold tracking-wider uppercase font-mono">
                  DAY 1 • 12 SEPT 2026
                </span>
                <span className="text-[11px] text-zinc-500 font-mono font-medium">09:00 AM – 05:00 PM</span>
              </div>

              {/* Icon & Title */}
              <div className="flex items-center gap-4 mb-4">
                <div className="w-12 h-12 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-center flex-shrink-0 group-hover:scale-105 group-hover:bg-white/10 transition-all">
                  <BookOpen className="h-6 w-6 text-blue-400" />
                </div>
                <div>
                  <h3 className="text-xl sm:text-2xl font-extrabold text-white tracking-tight">
                    Hands-on Design Workshop
                  </h3>
                  <p className="text-xs text-zinc-400">Master UI/UX tools, frameworks & industry secrets</p>
                </div>
              </div>

              <p className="text-xs sm:text-sm text-zinc-300 leading-relaxed mb-6">
                Learn directly from active design leads and founders. Gain hands-on practical skills in Figma, Design Systems, UX Research, and interactive prototyping.
              </p>

              {/* Modules list */}
              <div className="space-y-3.5 pt-4 border-t border-white/5">
                {[
                  {
                    title: "UI/UX & Modern Figma Workflow",
                    desc: "Auto-layouts, responsive constraints, component states & design tokens."
                  },
                  {
                    title: "Design Thinking & UX Frameworks",
                    desc: "Empathy mapping, user personas, wireframing & rapid UX research methods."
                  },
                  {
                    title: "Industry Speaker Keynote Sessions",
                    desc: "Live sessions by leads from Chai Shots, ArtArtist, Value Laden & MasterBrush."
                  },
                  {
                    title: "1-on-1 Mentorship & Portfolio Clinic",
                    desc: "Direct feedback from mentors to sharpen your approach before the hackathon."
                  }
                ].map((item, idx) => (
                  <div key={idx} className="flex items-start gap-3 text-left">
                    <div className="w-5 h-5 rounded-full bg-blue-500/10 border border-blue-500/20 flex items-center justify-center flex-shrink-0 mt-0.5">
                      <Check className="w-3 h-3 text-blue-400" />
                    </div>
                    <div>
                      <h4 className="text-xs font-bold text-white">{item.title}</h4>
                      <p className="text-[11px] text-zinc-400 leading-snug">{item.desc}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Bottom Info Pill */}
            <div className="mt-8 pt-4 border-t border-white/5 flex items-center justify-between text-[11px] text-zinc-400">
              <span className="flex items-center gap-1.5 text-zinc-300 font-semibold">
                <Sparkles className="w-3.5 h-3.5 text-blue-400" />
                Zero prior experience required
              </span>
              <span className="text-zinc-500 font-mono">Food Provided</span>
            </div>
          </div>

          {/* DAY 2: Hackathon Card */}
          <div className="group relative rounded-3xl p-8 glass-panel border border-white/10 hover:border-white/20 transition-all duration-300 hover:shadow-2xl hover:shadow-black/40 flex flex-col justify-between overflow-hidden">
            {/* Top accent glow line */}
            <div className="absolute top-0 left-0 right-0 h-[2px] bg-gradient-to-r from-transparent via-amber-400/60 to-transparent" />

            <div>
              {/* Header Badge */}
              <div className="flex items-center justify-between gap-4 mb-6">
                <span className="px-3 py-1 rounded-full bg-amber-400/10 border border-amber-400/20 text-amber-300 text-[11px] font-bold tracking-wider uppercase font-mono">
                  DAY 2 • 13 SEPT 2026
                </span>
                <span className="text-[11px] text-zinc-500 font-mono font-medium">09:00 AM – 06:00 PM</span>
              </div>

              {/* Icon & Title */}
              <div className="flex items-center gap-4 mb-4">
                <div className="w-12 h-12 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-center flex-shrink-0 group-hover:scale-105 group-hover:bg-white/10 transition-all">
                  <Trophy className="h-6 w-6 text-amber-400" />
                </div>
                <div>
                  <h3 className="text-xl sm:text-2xl font-extrabold text-white tracking-tight">
                    Live UI/UX Hackathon
                  </h3>
                  <p className="text-xs text-zinc-400">Collaborate, prototype & pitch for ₹20,000 in prizes</p>
                </div>
              </div>

              <p className="text-xs sm:text-sm text-zinc-300 leading-relaxed mb-6">
                Put your skills to the test in a 3-4 member squad. Solve real industry problem statements, create working prototypes, and pitch in front of the jury.
              </p>

              {/* Modules list */}
              <div className="space-y-3.5 pt-4 border-t border-white/5">
                {[
                  {
                    title: "09:00 AM • Problem Statement Reveal",
                    desc: "Real-world design challenge tracks unveiled across FinTech, EdTech & AI."
                  },
                  {
                    title: "Live UI/UX Prototyping Sprint",
                    desc: "Intensive team design sprint with continuous guidance from roving mentors."
                  },
                  {
                    title: "Jury Presentation & Design Pitch",
                    desc: "Present your prototype walkthrough and design decisions directly to the jury."
                  },
                  {
                    title: "Grand Finale & ₹20,000 Awards",
                    desc: "Cash prize distribution, winner trophies, internship offers & certificates."
                  }
                ].map((item, idx) => (
                  <div key={idx} className="flex items-start gap-3 text-left">
                    <div className="w-5 h-5 rounded-full bg-amber-400/10 border border-amber-400/20 flex items-center justify-center flex-shrink-0 mt-0.5">
                      <Check className="w-3 h-3 text-amber-400" />
                    </div>
                    <div>
                      <h4 className="text-xs font-bold text-white">{item.title}</h4>
                      <p className="text-[11px] text-zinc-400 leading-snug">{item.desc}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Bottom Info Pill */}
            <div className="mt-8 pt-4 border-t border-white/5 flex items-center justify-between text-[11px] text-zinc-400">
              <span className="flex items-center gap-1.5 text-amber-300 font-semibold">
                <Flame className="w-3.5 h-3.5 text-amber-400" />
                ₹20k Cash Pool + Internships
              </span>
              <span className="text-zinc-500 font-mono">Food Provided</span>
            </div>
          </div>

        </div>
      </section>

      {/* About Section */}
      <section className="py-24 max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center space-y-6">
        <div>
          <span className="text-xs font-bold text-zinc-400 uppercase tracking-widest mb-2 block font-mono">What is DESIGNATHON?</span>
          <h2 className="text-3xl sm:text-4xl font-extrabold text-white">Designing the Digital Frontiers</h2>
        </div>
        <p className="text-zinc-300 text-sm sm:text-base leading-relaxed max-w-3xl mx-auto">
          DESIGNATHON is a two-day national UI/UX event combining an in-depth <strong className="text-white">Day 1 Workshop</strong> and a thrilling <strong className="text-white">Day 2 Hackathon</strong>. It brings together students, designers, artists, and innovators from across India to learn, collaborate in teams of 3–4, create impactful digital experiences, and present their prototypes to an expert panel.
        </p>
        <p className="text-zinc-400 text-xs sm:text-sm leading-relaxed max-w-3xl mx-auto">
          Whether you're a complete beginner or an experienced designer, DESIGNATHON provides everything: hands-on training, industry mentors, food, and a national platform to win prizes.
        </p>
      </section>

      {/* Why Participate & Highlights Grid */}
      <section className="py-24 bg-white/[0.005] border-y border-white/5">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
            
            {/* Why Participate */}
            <div className="text-left space-y-6">
              <h2 className="text-2xl sm:text-3xl font-bold text-white flex items-center gap-2">
                <CheckCircle2 className="h-6 w-6 text-zinc-400" />
                Why Participate?
              </h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mt-6">
                {BENEFITS.map((b, idx) => (
                  <div key={idx} className="flex gap-2.5 items-start text-zinc-300 text-xs">
                    <span className="h-1.5 w-1.5 bg-zinc-500 rounded-full mt-1.5 flex-shrink-0" />
                    <span>{b}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Highlights */}
            <div className="text-left space-y-6 lg:border-l lg:border-white/5 lg:pl-12">
              <h2 className="text-2xl sm:text-3xl font-bold text-white flex items-center gap-2">
                <Sparkles className="h-6 w-6 text-zinc-400" />
                Event Highlights
              </h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mt-6">
                {HIGHLIGHTS.map((h, idx) => (
                  <div key={idx} className="flex gap-2.5 items-start text-zinc-300 text-xs">
                    <span className="h-1.5 w-1.5 bg-zinc-500 rounded-full mt-1.5 flex-shrink-0" />
                    <span>{h}</span>
                  </div>
                ))}
              </div>
            </div>

          </div>
        </div>
      </section>

      {/* Prize Pool Details */}
      <section id="prizes" className="py-24 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center relative overflow-hidden">
        
        {/* Header Block */}
        <div className="text-center space-y-4 mb-20 max-w-3xl mx-auto">
          <div className="inline-flex p-2 bg-white/5 rounded-xl text-zinc-400 border border-white/5 mb-2 rotate-[-1deg]">
            <Trophy className="h-6 w-6 animate-bounce" />
          </div>
          <div className="relative w-fit mx-auto">
            <h2 className="text-3xl sm:text-4xl font-extrabold text-white rotate-[-1deg] tracking-tight">
              Rewards Worth Competing For
              <div className="absolute -right-10 top-0 text-zinc-500 rotate-12 text-sm">
                ✨
              </div>
              <div className="absolute -left-8 bottom-0 text-zinc-600 -rotate-12 text-sm">
                ⭐️
              </div>
            </h2>
            <div
              className="absolute -bottom-2 left-1/2 -translate-x-1/2 w-36 h-2 bg-white/5 
              rotate-[-1deg] rounded-full blur-sm"
            />
          </div>
          <p className="text-zinc-400 text-xs sm:text-sm max-w-lg mx-auto rotate-[-1deg] mt-4 leading-relaxed">
            Showcase your design thinking and build premium prototypes for exciting rewards.
          </p>
        </div>

        {/* Neo-brutalist Prize Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-5xl mx-auto relative z-10">
          {PRIZE_TIERS.map((tier, index) => (
            <div
              key={tier.name}
              className={cn(
                "relative group transition-all duration-300",
                index === 0 && "rotate-[-1deg]",
                index === 1 && "rotate-[1deg]",
                index === 2 && "rotate-[-2deg]"
              )}
            >
              {/* Neo-brutalist card shadow box */}
              <div
                className={cn(
                  "absolute inset-0 bg-[#08081a]/50 backdrop-blur-xl",
                  "border-2 border-white/5",
                  "rounded-2xl shadow-[4px_4px_0px_0px_rgba(255,255,255,0.05)]",
                  "transition-all duration-300",
                  "group-hover:shadow-[8px_8px_0px_0px_rgba(255,255,255,0.1)]",
                  "group-hover:border-white/15",
                  "group-hover:translate-x-[-4px]",
                  "group-hover:translate-y-[-4px]"
                )}
              />

              <div className="relative p-8 text-left">
                {tier.popular && (
                  <div
                    className="absolute -top-3 -right-2 bg-white text-black 
                    font-bold px-3.5 py-1.5 rounded-full rotate-12 text-[10px] uppercase tracking-wider border-2 border-black/80 shadow-md font-mono"
                  >
                    Champion!
                  </div>
                )}

                <div className="mb-6">
                  <div
                    className="w-12 h-12 rounded-xl mb-4 flex items-center justify-center border-2 border-white/5 bg-white/5"
                  >
                    {tier.icon}
                  </div>
                  <h3 className="text-xl font-extrabold text-white tracking-tight">
                    {tier.name}
                  </h3>
                  <p className="text-xs text-zinc-500 mt-1 leading-normal">
                    {tier.description}
                  </p>
                </div>

                {/* Prize Value */}
                <div className="mb-6 font-mono">
                  <span className="text-3xl font-black text-white tracking-tight">
                    {tier.prizeValue}
                  </span>
                </div>

                {/* Features Checklist */}
                <div className="space-y-3 mb-8">
                  {tier.features.map((feature) => (
                    <div
                      key={feature}
                      className="flex items-center gap-3"
                    >
                      <div
                        className="w-4 h-4 rounded-full border border-white/10 
                        flex items-center justify-center bg-white/5 shrink-0"
                      >
                        <Check className="w-2.5 h-2.5 text-zinc-400" />
                      </div>
                      <span className="text-xs text-zinc-300 font-medium">
                        {feature}
                      </span>
                    </div>
                  ))}
                </div>

                {/* Action button */}
                <Link
                  href="/register"
                  className={cn(
                    "w-full h-11 flex items-center justify-center font-bold text-xs uppercase tracking-wider relative",
                    "border border-white/10 rounded-xl transition-all duration-300",
                    "shadow-[3px_3px_0px_0px_rgba(255,255,255,0.05)]",
                    "hover:shadow-[5px_5px_0px_0px_rgba(255,255,255,0.1)] hover:border-white/20",
                    "hover:translate-x-[-2px] hover:translate-y-[-2px]",
                    tier.popular
                      ? "bg-white text-black hover:bg-zinc-100"
                      : "bg-white/5 text-white hover:bg-white/10"
                  )}
                >
                  Register to Win
                </Link>
              </div>
            </div>
          ))}
        </div>

        {/* Decorative canvas symbols */}
        <div className="absolute -z-10 inset-0 overflow-hidden opacity-10 pointer-events-none">
          <div className="absolute top-40 left-20 text-4xl rotate-12 text-white">
            ✨
          </div>
          <div className="absolute bottom-40 right-20 text-4xl -rotate-12 text-white">
            ⭐️
          </div>
        </div>
      </section>

      {/* Guest Speakers */}
      <section id="speakers" className="py-24 bg-white/[0.01] border-y border-white/5">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="max-w-3xl mx-auto text-center mb-16">
            <span className="text-xs font-bold text-zinc-400 uppercase tracking-widest">Learn from Experts</span>
            <h2 className="text-3xl sm:text-4xl font-bold text-white mt-2 mb-4">Guest Speakers</h2>
            <p className="text-zinc-400 text-sm">Gain insights and design guidance from active founders and leads in tech.</p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8 max-w-5xl mx-auto">
            {SPEAKERS.map((s, idx) => (
              <div key={idx} className="glass-panel border-white/5 rounded-2xl overflow-hidden group hover:border-zinc-500/20 transition-all duration-300">
                <div className="h-56 relative overflow-hidden bg-zinc-900">
                  <img
                    src={s.image}
                    alt={s.name}
                    className={`w-full h-full object-cover group-hover:scale-105 transition-transform duration-500 ${s.bw ? 'grayscale' : ''}`}
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-[#03030f] via-transparent to-transparent opacity-85" />
                </div>
                <div className="p-4 text-left">
                  <h3 className="text-sm font-bold text-white">{s.name}</h3>
                  <p className="text-xxs text-zinc-400 mt-1">{s.role}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* How it Works / Steps */}
      <section className="py-24 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="max-w-3xl mx-auto text-center mb-16">
          <span className="text-xs font-bold text-zinc-400 uppercase tracking-widest">Event Steps</span>
          <h2 className="text-3xl sm:text-4xl font-bold text-white mt-2 mb-2">How It Works</h2>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-5 gap-4 max-w-5xl mx-auto text-left">
          {[
            { step: '1', title: 'Enter Details', desc: 'Fill individual registration form.' },
            { step: '2', title: 'Get Access Pass', desc: 'Complete registration & unlock your pass.' },
            { step: '3', title: 'Create or Join Team', desc: 'Form team of 3-4 members.' },
            { step: '4', title: 'Confirmation Receipt', desc: 'Download official entry pass.' },
            { step: '5', title: 'Participate in Event', desc: 'Design prototypes at venue.' },
          ].map((item, idx) => (
            <div key={idx} className="p-5 rounded-2xl glass-panel border-white/5 flex flex-col justify-between h-44 hover:border-white/10 transition-all">
              <span className="text-2xl font-bold text-zinc-500/40 font-mono">0{item.step}</span>
              <div>
                <h4 className="text-xs font-bold text-white mt-2">{item.title}</h4>
                <p className="text-xxs text-zinc-500 mt-1.5 leading-normal">{item.desc}</p>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Rules & Eligibility Section */}
      <section className="py-24 bg-white/[0.005] border-y border-white/5">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-12 max-w-5xl mx-auto">
            {/* Eligibility */}
            <div className="glass-panel border-white/5 p-8 rounded-2xl text-left space-y-4">
              <h3 className="text-sm font-bold text-purple-400 flex items-center gap-2 uppercase tracking-wider mb-2">
                <Users className="h-4.5 w-4.5" />
                Eligibility
              </h3>
              <ul className="space-y-2.5 text-xs text-zinc-300">
                {['Undergraduate Students', 'Postgraduate Students', 'UI/UX Designers', 'Graphic Designers', 'Product Designers', 'Creative Artists'].map((el, i) => (
                  <li key={i} className="flex gap-2 items-center">
                    <CheckCircle2 className="h-4 w-4 text-purple-500/50 flex-shrink-0" />
                    <span>{el}</span>
                  </li>
                ))}
              </ul>
            </div>

            {/* Team Rules */}
            <div className="glass-panel border-white/5 p-8 rounded-2xl text-left space-y-4">
              <h3 className="text-sm font-bold text-white flex items-center gap-2 uppercase tracking-wider mb-2">
                <Layers className="h-4.5 w-4.5" />
                Team Rules
              </h3>
              <ul className="space-y-2.5 text-xs text-zinc-300">
                {[
                  'Maximum 4 members',
                  'Minimum 3 members',
                  'One team leader',
                  'One registration per participant',
                  'Accommodation provided for out-of-state teams (3–4 members, not for individuals)',
                  'Team changes close before the event',
                  'All members must complete payment'
                ].map((rule, i) => (
                  <li key={i} className="flex gap-2 items-center">
                    <CheckCircle2 className="h-4 w-4 text-zinc-500/50 flex-shrink-0" />
                    <span>{rule}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      </section>

      {/* Timeline Section */}
      <section className="py-24 max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <span className="text-xs font-bold text-zinc-400 uppercase tracking-widest font-mono">TIMELINE</span>
          <h2 className="text-3xl font-bold text-white mt-2">Important Deadlines</h2>
        </div>

        <div className="space-y-6 relative before:absolute before:inset-y-0 before:left-4 sm:before:left-1/2 before:w-[1px] before:bg-white/5">
          {[
            { label: 'Registration Opens', date: 'Now Live (Open for All Students)', highlight: false },
            { label: 'Registration Closes (Strict Deadline)', date: '10 September 2026 • 11:59 PM IST (10D/09M/2026)', highlight: true, tag: 'CLOSING DEADLINE' },
            { label: 'Team Formation Closes', date: '11 September 2026', highlight: false },
            { label: 'Day 1 • UI/UX Design Workshop', date: '12 September (09:00 AM – Full Day)', highlight: false },
            { label: 'Day 2 • Live UI/UX Hackathon Sprint', date: '13 September (09:00 AM – 04:00 PM)', highlight: false },
            { label: 'Day 2 • Final Demos & Grand Awards', date: '13 September (04:30 PM – Evening)', highlight: false },
          ].map((item, idx) => {
            const isEven = idx % 2 === 0;
            return (
              <div key={idx} className={`flex flex-col sm:flex-row items-start relative ${isEven ? 'sm:flex-row-reverse' : ''}`}>
                {/* timeline node dot */}
                <div className={`absolute left-4 sm:left-1/2 transform -translate-x-[50%] top-1 h-3.5 w-3.5 rounded-full z-10 ${
                  item.highlight
                    ? 'border-2 border-amber-400 bg-amber-500 shadow-lg shadow-amber-500/50 animate-pulse'
                    : 'border border-white bg-[#03030f]'
                }`} />
                
                <div className="w-full sm:w-[45%] pl-10 sm:pl-0 sm:px-6 text-left sm:text-right">
                  <div className={`p-4 rounded-xl flex flex-col justify-center text-left transition-all ${
                    item.highlight
                      ? 'glass-panel border-amber-500/40 bg-amber-500/[0.06] shadow-lg shadow-amber-950/30 ring-1 ring-amber-400/30'
                      : 'glass-panel border-white/5 hover:border-white/20'
                  }`}>
                    <div className="flex items-center justify-between gap-2">
                      <span className={`text-[10px] uppercase font-bold tracking-wider ${item.highlight ? 'text-amber-300' : 'text-zinc-500'}`}>
                        {item.label}
                      </span>
                      {item.tag && (
                        <span className="px-2 py-0.5 rounded-full bg-amber-500/20 border border-amber-400/40 text-amber-300 text-[9px] font-mono font-bold uppercase tracking-wider">
                          {item.tag}
                        </span>
                      )}
                    </div>
                    <span className={`text-xs font-semibold mt-1 ${item.highlight ? 'text-white font-bold' : 'text-white'}`}>
                      {item.date}
                    </span>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </section>

      {/* Inclusions / What's Included */}
      <section className="py-24 bg-white/[0.005] border-y border-white/5">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <div className="max-w-3xl mx-auto mb-16">
            <span className="text-xs font-bold text-zinc-400 uppercase tracking-widest font-mono">INCLUSIONS</span>
            <h2 className="text-3xl font-bold text-white mt-2">What's Included</h2>
            <p className="text-zinc-500 text-xs mt-1">Hospitality facilities provided to every verified participant.</p>
          </div>

          {/* Partners Logo Strip */}
          <div className="mb-20 max-w-4xl mx-auto px-4">
            <p className="text-[10px] text-zinc-600 font-bold uppercase tracking-widest mb-8">Our Official Partners</p>
            <div className="flex flex-wrap items-center justify-center gap-12 md:gap-20">
              {/* Art Artist */}
              <div className="flex flex-col items-center gap-3 group">
                <img src="/partner-artartist.png" alt="ArtArtist" className="h-16 md:h-20 w-auto object-contain filter brightness-90 group-hover:brightness-100 group-hover:scale-105 transition-all duration-300" />
                <span className="text-[9px] font-semibold text-zinc-500 group-hover:text-zinc-400 transition-colors uppercase tracking-wider font-mono">ArtArtist</span>
              </div>
              
              {/* Value Laden */}
              <div className="flex flex-col items-center gap-3 group">
                <img src="/partner-valueladen.jpg" alt="Value Laden" className="h-16 md:h-20 w-auto object-contain rounded filter brightness-90 group-hover:brightness-100 group-hover:scale-105 transition-all duration-300" />
                <span className="text-[9px] font-semibold text-zinc-500 group-hover:text-zinc-400 transition-colors uppercase tracking-wider font-mono">Value Laden</span>
              </div>

              {/* Samskruti */}
              <div className="flex flex-col items-center gap-3 group">
                <img src="/partner-samskruti.png" alt="Samskruti" className="h-16 md:h-20 w-auto object-contain rounded filter brightness-90 group-hover:brightness-100 group-hover:scale-105 transition-all duration-300" />
                <span className="text-[9px] font-semibold text-zinc-500 group-hover:text-zinc-400 transition-colors uppercase tracking-wider font-mono">Samskruti College</span>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 gap-6 max-w-4xl mx-auto">
            {INCLUSIONS.map((item, idx) => (
              <div key={idx} className="p-4 rounded-xl glass-panel border-white/5 flex items-center gap-3 text-left">
                <CheckCircle2 className="h-5 w-5 text-emerald-400 flex-shrink-0" />
                <span className="text-xs text-zinc-300 font-semibold">{item}</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* FAQ Accordions */}
      <section id="faq" className="py-24 max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <span className="text-xs font-bold text-purple-400 uppercase tracking-widest">Common Inquiries</span>
          <h2 className="text-3xl font-bold text-white mt-2">Frequently Asked Questions</h2>
        </div>

        <div className="space-y-4">
          {FAQS.map((faq, idx) => (
            <div
              key={idx}
              className="rounded-2xl glass-panel border-white/5 overflow-hidden transition-all duration-300"
            >
              <button
                onClick={() => toggleFaq(idx)}
                className="w-full px-6 py-5 text-left flex items-center justify-between text-white hover:bg-white/5 transition-colors cursor-pointer"
              >
                <span className="text-xs font-semibold">{faq.q}</span>
                <ChevronDown className={`h-4 w-4 text-zinc-400 transition-transform duration-350 ${faqOpen === idx ? 'transform rotate-180' : ''}`} />
              </button>
              {faqOpen === idx && (
                <div className="px-6 pb-5 pt-1 text-xs text-zinc-400 leading-relaxed border-t border-white/5 bg-white/[0.01]">
                  {faq.a}
                </div>
              )}
            </div>
          ))}
        </div>
      </section>

      {/* Helpdesk Support Section */}
      <section className="py-24 max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
        <div className="glass-panel border-white/10 p-8 sm:p-12 rounded-3xl relative overflow-hidden bg-gradient-to-b from-[#110d29]/60 to-[#03030f]/60">
          <div className="absolute top-0 left-[50%] transform -translate-x-[50%] h-[1px] w-[80%] bg-gradient-to-r from-transparent via-purple-500 to-transparent" />
          <h2 className="text-2xl sm:text-3xl font-extrabold text-white mb-3">Have Questions or Need Help?</h2>
          <p className="text-zinc-400 text-xs sm:text-sm mb-8 max-w-lg mx-auto">
            Our organizing team is available to help resolve payment inquiries, college group approvals, or event coordination.
          </p>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 max-w-4xl mx-auto mb-8 text-left text-xs">
            <div className="p-4 rounded-xl border border-white/5 bg-[#050514]/40 flex flex-col justify-center">
              <span className="text-[10px] text-zinc-500 uppercase font-bold">Email Helpdesk</span>
              <a href="mailto:official@skywebdev.xyz" className="block font-semibold text-zinc-200 mt-1 hover:text-white truncate">official@skywebdev.xyz</a>
            </div>
            <div className="p-4 rounded-xl border border-white/5 bg-[#050514]/40 flex flex-col justify-center">
              <span className="text-[10px] text-zinc-500 uppercase font-bold">Helpline</span>
              <a href="tel:+918121422761" className="block font-semibold text-zinc-200 mt-1 hover:text-white">+91 81214 22761</a>
            </div>
            <div className="p-4 rounded-xl border border-white/5 bg-[#050514]/40 flex flex-col justify-center">
              <span className="text-[10px] text-zinc-500 uppercase font-bold">Rabbani</span>
              <a href="tel:+919912937061" className="block font-semibold text-zinc-200 mt-1 hover:text-white">+91 99129 37061</a>
            </div>
            <div className="p-4 rounded-xl border border-white/5 bg-[#050514]/40 flex flex-col justify-center">
              <span className="text-[10px] text-zinc-500 uppercase font-bold">Vamshi</span>
              <a href="tel:+918341339097" className="block font-semibold text-zinc-200 mt-1 hover:text-white">+91 83413 39097</a>
            </div>
            <div className="p-4 rounded-xl border border-white/5 bg-[#050514]/40 flex flex-col justify-center">
              <span className="text-[10px] text-zinc-500 uppercase font-bold">Kalyan</span>
              <a href="tel:+917396566279" className="block font-semibold text-zinc-200 mt-1 hover:text-white">+91 7396 566 279</a>
            </div>
            <div className="p-4 rounded-xl border border-white/5 bg-[#050514]/40 flex flex-col justify-center">
              <span className="text-[10px] text-zinc-500 uppercase font-bold">Arun</span>
              <a href="tel:+918897959612" className="block font-semibold text-zinc-200 mt-1 hover:text-white">+91 88979 59612</a>
            </div>
            <div className="p-4 rounded-xl border border-white/5 bg-[#050514]/40 flex flex-col justify-center sm:col-span-2 lg:col-span-1">
              <span className="text-[10px] text-zinc-500 uppercase font-bold">Vicky</span>
              <a href="tel:+917396514989" className="block font-semibold text-zinc-200 mt-1 hover:text-white">+91 7396 514 989</a>
            </div>
          </div>

          <a
            href="mailto:official@skywebdev.xyz"
            className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-white/5 hover:bg-white/10 text-white font-medium text-xs border border-white/10 hover:border-white/20 transition-all shadow-inner"
          >
            Shoot us an Email
            <ArrowRight className="h-4 w-4" />
          </a>
        </div>
      </section>

      <style>{`
        @keyframes marquee-vertical {
          from {
            transform: translateY(0);
          }
          to {
            transform: translateY(-50%);
          }
        }
      `}</style>
    </div>
  );
}

function cn(...classes: any[]) {
  return classes.filter(Boolean).join(' ');
}


