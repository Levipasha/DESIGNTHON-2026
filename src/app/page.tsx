'use client';

import React, { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import { Calendar, MapPin, Award, Users, ShieldAlert, Sparkles, MessageSquare, ArrowRight, CheckCircle2, ChevronDown, Trophy, Clock, Cpu, BookOpen, Layers, Check, Ticket, ChevronLeft, ChevronRight, Palette, Lightbulb, Rocket, Flame } from 'lucide-react';
import { CoverflowCarousel } from '@/components/ui/coverflow-carousel';

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
    description: "Become the DESIGNTHON Champion and take home the grand cash reward.",
    features: [
      "Grand ₹20,000 Cash Prize",
      "DESIGNTHON Winner Trophy",
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
  'Internship Opportunities with Partners',
  'Verified Participation Certificate',
  'Team Collaboration & Networking',
  'Food & Refreshments Included Both Days'
];

// FAQ items
const FAQS = [
  { q: 'What is the schedule for the 2 days?', a: 'Day 1 (12 Sept) is an intensive, hands-on UI/UX Design Workshop covering Figma, Design Thinking, UX Research, and mentorship from industry leads. Day 2 (13 Sept) is the full-day UI/UX Hackathon where teams build interactive prototypes for live problem statements and present to jury judges.' },
  { q: 'Can I participate individually?', a: 'Yes. Register individually first and then log in to create or join a team of 3-4 members.' },
  { q: 'How many members are allowed in a team?', a: 'Teams must consist of 3-4 members. You can form your team anytime before the hackathon begins.' },
  { q: 'Is the registration fee per student?', a: 'Yes. Every participant pays ₹1000 individually which covers full 2-day access (Day 1 Workshop + Day 2 Hackathon), food, mentorship, and certificates.' },
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
  const [timeLeft, setTimeLeft] = useState({ days: 0, hours: 0, minutes: 0, seconds: 0 });
  const [faqOpen, setFaqOpen] = useState<number | null>(null);
  const marqueeRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const marqueeContainer = marqueeRef.current;
    if (!marqueeContainer) return;

    const updateOpacity = () => {
      const items = marqueeContainer.querySelectorAll('.marquee-item');
      const containerRect = marqueeContainer.getBoundingClientRect();
      const centerY = containerRect.top + containerRect.height / 2;

      items.forEach((item) => {
        const itemRect = item.getBoundingClientRect();
        const itemCenterY = itemRect.top + itemRect.height / 2;
        const distance = Math.abs(centerY - itemCenterY);
        const maxDistance = containerRect.height / 2;
        const normalizedDistance = Math.min(distance / maxDistance, 1);
        const opacity = 1 - normalizedDistance * 0.75;
        (item as HTMLElement).style.opacity = opacity.toString();
      });
    };

    const animationFrame = () => {
      updateOpacity();
      requestAnimationFrame(animationFrame);
    };

    const frame = requestAnimationFrame(animationFrame);

    return () => cancelAnimationFrame(frame);
  }, []);

  // Countdown timer logic targeting Sept 12, 2026 at 09:00 AM
  useEffect(() => {
    const targetDate = new Date('2026-09-12T09:00:00+05:30').getTime();

    const timer = setInterval(() => {
      const now = new Date().getTime();
      const difference = targetDate - now;

      if (difference <= 0) {
        clearInterval(timer);
        setTimeLeft({ days: 0, hours: 0, minutes: 0, seconds: 0 });
        return;
      }

      const days = Math.floor(difference / (1000 * 60 * 60 * 24));
      const hours = Math.floor((difference % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
      const minutes = Math.floor((difference % (1000 * 60 * 60)) / (1000 * 60));
      const seconds = Math.floor((difference % (1000 * 60)) / 1000);

      setTimeLeft({ days, hours, minutes, seconds });
    }, 1000);

    return () => clearInterval(timer);
  }, []);

  const toggleFaq = (index: number) => {
    setFaqOpen(faqOpen === index ? null : index);
  };

  return (
    <div className="flex-1 w-full bg-[#03030f] relative overflow-hidden bg-grid">
      {/* Decorative ambient glows */}
      <div className="absolute top-[-10%] left-[-10%] w-[50%] h-[50%] rounded-full bg-zinc-800/5 blur-[120px] pointer-events-none" />
      <div className="absolute bottom-[20%] right-[-10%] w-[50%] h-[50%] rounded-full bg-zinc-900/10 blur-[120px] pointer-events-none" />

      {/* Hero Section with Vertical Marquee */}
      <section className="relative pt-20 pb-16 md:pt-28 md:pb-24 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto overflow-hidden">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-20 items-center">
          
          {/* Left Column - Hero Content */}
          <div className="space-y-8 max-w-xl text-left">
            {/* Floating Tag */}
            <div className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-4 py-1.5 text-xs font-semibold text-zinc-300 backdrop-blur-md">
              <Sparkles className="h-3.5 w-3.5 text-amber-400 animate-pulse" />
              <span>2-Day Event: <strong className="text-white font-bold">Day 1 Workshop</strong> • <strong className="text-white font-bold">Day 2 UI/UX Hackathon</strong></span>
            </div>

            {/* Hero Title */}
            <h1 className="text-4xl sm:text-5xl md:text-6xl font-extrabold tracking-tight leading-tight text-white">
              DESIGNTHON 2026
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
                className="group relative px-6 py-3.5 bg-gradient-to-r from-white to-zinc-200 hover:from-white hover:to-zinc-300 text-black rounded-xl font-bold text-xs overflow-hidden transition-all duration-300 hover:scale-105 hover:shadow-lg shadow-white/5 flex items-center gap-1.5 cursor-pointer"
              >
                <span className="relative z-10">REGISTER NOW (₹1000)</span>
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
              <div className="group flex items-center gap-3.5 bg-white/[0.02] border border-white/5 hover:border-white/10 rounded-2xl p-4 transition-all duration-300 hover:bg-white/[0.04] hover:scale-[1.02] hover:shadow-lg hover:shadow-black/20 text-left">
                <div className="flex items-center justify-center h-10 w-10 rounded-xl bg-white/5 text-zinc-400 group-hover:text-white transition-colors flex-shrink-0">
                  <Calendar className="h-5 w-5" />
                </div>
                <div className="flex flex-col">
                  <span className="text-[10px] text-zinc-500 uppercase tracking-wider font-bold">Duration:</span>
                  <span className="text-xs font-bold text-white">12–13 Sept '26</span>
                  <span className="text-[9px] text-zinc-400 font-mono">2 Full Days</span>
                </div>
              </div>

              <div className="group flex items-center gap-3.5 bg-white/[0.02] border border-white/5 hover:border-white/10 rounded-2xl p-4 transition-all duration-300 hover:bg-white/[0.04] hover:scale-[1.02] hover:shadow-lg hover:shadow-black/20 text-left">
                <div className="flex items-center justify-center h-10 w-10 rounded-xl bg-white/5 text-zinc-400 group-hover:text-white transition-colors flex-shrink-0">
                  <MapPin className="h-5 w-5" />
                </div>
                <div className="flex flex-col">
                  <span className="text-[10px] text-zinc-500 uppercase tracking-wider font-bold">Venue:</span>
                  <span className="text-xs font-bold text-white">Cohort, Hyd</span>
                  <span className="text-[9px] text-zinc-400 font-mono">In-Person</span>
                </div>
              </div>

              <div className="group flex items-center gap-3.5 bg-white/[0.02] border border-white/5 hover:border-white/10 rounded-2xl p-4 transition-all duration-300 hover:bg-white/[0.04] hover:scale-[1.02] hover:shadow-lg hover:shadow-black/20 text-left">
                <div className="flex items-center justify-center h-10 w-10 rounded-xl bg-white/5 text-zinc-400 group-hover:text-white transition-colors flex-shrink-0">
                  <Ticket className="h-5 w-5" />
                </div>
                <div className="flex flex-col">
                  <span className="text-[10px] text-zinc-500 uppercase tracking-wider font-bold">Access Pass:</span>
                  <span className="text-xs font-bold text-white">₹1000 / student</span>
                  <span className="text-[9px] text-emerald-400 font-mono">Workshop + Hackathon</span>
                </div>
              </div>
            </div>

          </div>

          {/* Right Column - Vertical Marquee */}
          <div ref={marqueeRef} className="relative h-[400px] sm:h-[450px] flex items-center justify-center">
            <div className="relative w-full h-full font-mono">
              <VerticalMarquee speed={25} className="h-full">
                {marqueeItems.map((item, idx) => (
                  <div
                    key={idx}
                    className="text-2xl md:text-3xl lg:text-4xl font-light tracking-tight py-6 text-zinc-500 text-center marquee-item transition-opacity duration-300"
                  >
                    {item}
                  </div>
                ))}
              </VerticalMarquee>
              
              {/* Top vignette */}
              <div className="pointer-events-none absolute top-0 left-0 right-0 h-32 bg-gradient-to-b from-[#03030f] via-[#03030f]/50 to-transparent z-10"></div>
              
              {/* Bottom vignette */}
              <div className="pointer-events-none absolute bottom-0 left-0 right-0 h-32 bg-gradient-to-t from-[#03030f] via-[#03030f]/50 to-transparent z-10"></div>
            </div>
          </div>

        </div>
      </section>

      {/* Countdown Ticker Section */}
      <section className="py-16 bg-white/[0.02] border-y border-white/5 backdrop-blur-sm">
        <div className="max-w-4xl mx-auto px-4 text-center">
          <p className="text-xs font-bold text-zinc-400 uppercase tracking-widest mb-6">Hacking Starts In</p>
          <div className="grid grid-cols-4 gap-4 max-w-lg mx-auto mb-12">
            {Object.entries(timeLeft).map(([label, value]) => (
              <div key={label} className="flex flex-col items-center p-3 rounded-xl bg-[#08081a]/60 border border-white/5 shadow-inner">
                <span className="text-2xl sm:text-4xl font-extrabold text-white font-mono">{String(value).padStart(2, '0')}</span>
                <span className="text-[10px] text-zinc-500 capitalize mt-1 font-semibold">{label}</span>
              </div>
            ))}
          </div>

          {/* Slideshow (Coverflow Carousel) */}
          <div className="max-w-4xl mx-auto mb-8 relative">
            <CoverflowCarousel
              slides={SLIDESHOW_IMAGES}
              showNavigation
              showPagination
              cardWidth="clamp(250px, 35vw, 360px)"
              autoPlay={true}
              autoPlayInterval={2000}
              className="py-6"
              cardClassName="border border-white/10 hover:border-white/20 transition-all duration-300 shadow-2xl"
            />
          </div>

          {/* National Level Hackathon Info Text */}
          <div className="inline-flex items-center gap-2.5 px-4 py-2 rounded-full border border-white/5 bg-white/[0.01] backdrop-blur-md">
            <span className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse" />
            <p className="text-xs sm:text-sm font-semibold text-zinc-300 tracking-wide">
              Conducted National Level Hackathon on 8/08/2026 at Nellore
            </p>
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
          <span className="text-xs font-bold text-zinc-400 uppercase tracking-widest mb-2 block font-mono">What is DESIGNTHON?</span>
          <h2 className="text-3xl sm:text-4xl font-extrabold text-white">Designing the Digital Frontiers</h2>
        </div>
        <p className="text-zinc-300 text-sm sm:text-base leading-relaxed max-w-3xl mx-auto">
          DESIGNTHON is a two-day national UI/UX event combining an in-depth <strong className="text-white">Day 1 Workshop</strong> and a thrilling <strong className="text-white">Day 2 Hackathon</strong>. It brings together students, designers, artists, and innovators from across India to learn, collaborate in teams of 3–4, create impactful digital experiences, and present their prototypes to an expert panel.
        </p>
        <p className="text-zinc-400 text-xs sm:text-sm leading-relaxed max-w-3xl mx-auto">
          Whether you're a complete beginner or an experienced designer, DESIGNTHON provides everything: hands-on training, industry mentors, food, and a national platform to win prizes.
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
            { step: '1', title: 'Complete Registration', desc: 'Fill individual registration form.' },
            { step: '2', title: 'Pay Registration Fee', desc: 'Pay ₹1000 individual student fee.' },
            { step: '3', title: 'Create or Join Team', desc: 'Form team of 3-4 members.' },
            { step: '4', title: 'Confirmation Receipt', desc: 'Download payment receipt pdf.' },
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
            { label: 'Registration Opens', date: 'Now Live (Open for All Students)' },
            { label: 'Registration Closes', date: '10 September 2026' },
            { label: 'Team Formation Closes', date: '11 September 2026' },
            { label: 'Day 1 • UI/UX Design Workshop', date: '12 September (09:00 AM – Full Day)' },
            { label: 'Day 2 • Live UI/UX Hackathon Sprint', date: '13 September (09:00 AM – 04:00 PM)' },
            { label: 'Day 2 • Final Demos & Grand Awards', date: '13 September (04:30 PM – Evening)' },
          ].map((item, idx) => {
            const isEven = idx % 2 === 0;
            return (
              <div key={idx} className={`flex flex-col sm:flex-row items-start relative ${isEven ? 'sm:flex-row-reverse' : ''}`}>
                {/* timeline node dot */}
                <div className="absolute left-4 sm:left-1/2 transform -translate-x-[50%] top-1 h-3.5 w-3.5 rounded-full border border-white bg-[#03030f] z-10" />
                
                <div className="w-full sm:w-[45%] pl-10 sm:pl-0 sm:px-6 text-left sm:text-right">
                  <div className={`p-4 rounded-xl glass-panel border-white/5 flex flex-col justify-center text-left hover:border-white/20 transition-all`}>
                    <span className="text-[10px] text-zinc-500 uppercase font-bold tracking-wider">{item.label}</span>
                    <span className="text-xs font-semibold text-white mt-1">{item.date}</span>
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
              <a href="tel:+919912937061" className="block font-semibold text-zinc-200 mt-1 hover:text-white">+91 9912937061</a>
            </div>
            <div className="p-4 rounded-xl border border-white/5 bg-[#050514]/40 flex flex-col justify-center">
              <span className="text-[10px] text-zinc-500 uppercase font-bold">Vamshi</span>
              <a href="tel:+918341339097" className="block font-semibold text-zinc-200 mt-1 hover:text-white">+91 83413 39097</a>
            </div>
            <div className="p-4 rounded-xl border border-white/5 bg-[#050514]/40 flex flex-col justify-center">
              <span className="text-[10px] text-zinc-500 uppercase font-bold">Arpan</span>
              <a href="tel:+918121422761" className="block font-semibold text-zinc-200 mt-1 hover:text-white">+91 81214 22761</a>
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

interface VerticalMarqueeProps {
  children: React.ReactNode;
  pauseOnHover?: boolean;
  reverse?: boolean;
  className?: string;
  speed?: number;
  onItemsRef?: (items: HTMLElement[]) => void;
}

function VerticalMarquee({
  children,
  pauseOnHover = false,
  reverse = false,
  className,
  speed = 30,
  onItemsRef,
}: VerticalMarqueeProps) {
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (onItemsRef && containerRef.current) {
      const items = Array.from(containerRef.current.querySelectorAll('.marquee-item')) as HTMLElement[];
      onItemsRef(items);
    }
  }, [onItemsRef]);

  return (
    <div
      ref={containerRef}
      className={cn(
        "group flex flex-col overflow-hidden",
        className
      )}
      style={
        {
          "--duration": `${speed}s`,
        } as React.CSSProperties
      }
    >
      <div
        className={cn(
          "flex shrink-0 flex-col animate-[marquee-vertical_var(--duration)_linear_infinite]",
          reverse && "[animation-direction:reverse]",
          pauseOnHover && "group-hover:[animation-play-state:paused]"
        )}
      >
        {children}
      </div>
      <div
        className={cn(
          "flex shrink-0 flex-col animate-[marquee-vertical_var(--duration)_linear_infinite]",
          reverse && "[animation-direction:reverse]",
          pauseOnHover && "group-hover:[animation-play-state:paused]"
        )}
        aria-hidden="true"
      >
        {children}
      </div>
    </div>
  );
}

const marqueeItems = [
  "Undergraduate Students",
  "Postgraduate Students",
  "UI/UX Designers",
  "Graphic Designers",
  "Product Designers",
  "Creative Artists",
];
