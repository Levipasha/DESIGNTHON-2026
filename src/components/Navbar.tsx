'use client';

import React, { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { useAuth } from '../context/AuthContext';
import { useSocket } from '../context/SocketContext';
import { Bell, Menu, X, LogOut, LayoutDashboard, Settings, User as UserIcon, Shield } from 'lucide-react';
import { motion } from 'framer-motion';

interface DBNotification {
  id: string;
  title: string;
  message: string;
  type: 'info' | 'success' | 'warning';
  readBy: string[];
  createdAt: string;
}

export default function Navbar() {
  const { user, token, logout, isAdmin } = useAuth();
  const { notificationsCount, triggerRefreshNotifications } = useSocket();
  const pathname = usePathname();
  const router = useRouter();

  const [mounted, setMounted] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [notifDropdownOpen, setNotifDropdownOpen] = useState(false);
  const [notifications, setNotifications] = useState<DBNotification[]>([]);
  const notifRef = useRef<HTMLDivElement>(null);

  // Slide Tabs navigation state
  const [position, setPosition] = useState({
    left: 0,
    width: 0,
    opacity: 0,
  });
  const [selected, setSelected] = useState(0);
  const tabsRef = useRef<any[]>([]);

  // Navigation tabs configuration based on role/auth
  const tabs = [
    { label: 'Home', href: '/' },
    { label: 'Public Teams', href: '/teams' },
    ...(user ? [{ label: 'Dashboard', href: '/dashboard' }] : []),
    ...(isAdmin ? [{ label: 'Admin', href: '/admin' }] : []),
  ];

  // Helper to match active tab index
  const getSelectedTabIndex = () => {
    const idx = tabs.findIndex(t => {
      if (t.href === '/') return pathname === '/';
      return pathname.startsWith(t.href);
    });
    return idx !== -1 ? idx : 0;
  };

  useEffect(() => {
    setMounted(true);
  }, []);

  // Sync active slide tab highlight on mount, route changes, or user state changes
  useEffect(() => {
    if (!mounted) return;

    const selectedIdx = getSelectedTabIndex();
    setSelected(selectedIdx);

    // Give it a brief timeout to let DOM dimensions settle
    const timer = setTimeout(() => {
      const selectedTab = tabsRef.current[selectedIdx];
      if (selectedTab) {
        const { width } = selectedTab.getBoundingClientRect();
        setPosition({
          left: selectedTab.offsetLeft,
          width,
          opacity: 1,
        });
      }
    }, 50);

    return () => clearTimeout(timer);
  }, [pathname, user, isAdmin, mounted]);

  // Fetch notifications list when dropdown opens
  useEffect(() => {
    if (!user || !notifDropdownOpen) return;

    const fetchNotifications = async () => {
      try {
        const savedToken = localStorage.getItem('designthon_token');
        const res = await fetch('https://designthon-backend.vercel.app/api/notifications', {
          headers: {
            Authorization: `Bearer ${savedToken}`,
          },
        });
        if (res.ok) {
          const data = await res.json();
          data.sort((a: any, b: any) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
          setNotifications(data);
        }
      } catch (err) {
        console.error('Error fetching notifications:', err);
      }
    };

    fetchNotifications();
  }, [user, notifDropdownOpen, notificationsCount]);

  // Click outside notification dropdown to close
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (notifRef.current && !notifRef.current.contains(event.target as Node)) {
        setNotifDropdownOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  // Slide highlight tracking on hover
  const handleTabMouseEnter = (index: number) => {
    const tabEl = tabsRef.current[index];
    if (tabEl) {
      const { width } = tabEl.getBoundingClientRect();
      setPosition({
        left: tabEl.offsetLeft,
        width,
        opacity: 1,
      });
    }
  };

  // Reset highlight cursor back to the active page tab on mouse exit
  const handleMouseLeaveContainer = () => {
    const activeIdx = getSelectedTabIndex();
    const activeTabEl = tabsRef.current[activeIdx];
    if (activeTabEl) {
      const { width } = activeTabEl.getBoundingClientRect();
      setPosition({
        left: activeTabEl.offsetLeft,
        width,
        opacity: 1,
      });
    } else {
      setPosition(prev => ({ ...prev, opacity: 0 }));
    }
  };

  // Fallback layout during initial load
  if (!mounted) {
    return (
      <header className="sticky top-0 z-40 w-full border-b border-white/5 bg-[#03030f]/50 backdrop-blur-md">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="flex h-16 items-center justify-between">
            <div className="flex items-center">
              <Link href="/" className="flex items-center group">
                <img src="/logo.png" alt="Logo" className="h-12 w-auto object-contain" />
              </Link>
            </div>
          </div>
        </div>
      </header>
    );
  }

  const markAsRead = async (notifId: string) => {
    try {
      const savedToken = localStorage.getItem('designthon_token');
      const res = await fetch('https://designthon-backend.vercel.app/api/notifications/read', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${savedToken}`,
        },
        body: JSON.stringify({ notificationId: notifId }),
      });
      if (res.ok) {
        setNotifications(prev =>
          prev.map(n => (n.id === notifId ? { ...n, readBy: [...n.readBy, user?.id || ''] } : n))
        );
        triggerRefreshNotifications();
      }
    } catch (err) {
      console.error('Failed to mark notification as read:', err);
    }
  };

  const handleLogout = () => {
    logout();
    router.push('/');
  };

  return (
    <header className="sticky top-0 z-40 w-full border-b border-white/5 bg-[#03030f]/60 backdrop-blur-md">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="flex h-16 items-center justify-between">
          
          {/* Logo */}
          <div className="flex items-center">
            <Link href="/" className="flex items-center group">
              <img src="/logo.png" alt="Logo" className="h-12 w-auto object-contain" />
            </Link>
          </div>

          {/* Navigation Links - Desktop with sliding cursor tab highlight */}
          <ul
            onMouseLeave={handleMouseLeaveContainer}
            className="hidden md:flex relative items-center gap-1.5 p-1 rounded-full border border-white/5 bg-[#070719]/40 backdrop-blur-md"
          >
            {tabs.map((tab, i) => (
              <li
                key={tab.label}
                ref={(el) => { tabsRef.current[i] = el; }}
                onMouseEnter={() => handleTabMouseEnter(i)}
                className="relative z-10 block cursor-pointer"
              >
                <Link
                  href={tab.href}
                  className={`px-4 py-2 text-xs font-semibold uppercase tracking-wider block transition-colors duration-250 ${
                    pathname === tab.href || (tab.href !== '/' && pathname.startsWith(tab.href))
                      ? 'text-white'
                      : 'text-zinc-400 hover:text-white'
                  }`}
                >
                  {tab.label}
                </Link>
              </li>
            ))}

            {/* Slide pill highlight block */}
            <motion.li
              animate={position}
              transition={{ type: 'spring', stiffness: 350, damping: 28 }}
              className="absolute z-0 h-8 rounded-full bg-white/10 border border-white/20 shadow-[0_0_10px_rgba(255,255,255,0.05)]"
            />
          </ul>

          {/* Right section - User Profile, Notifications */}
          <div className="hidden md:flex items-center gap-4">
            {user ? (
              <>
                {/* Notification Dropdown Container */}
                <div className="relative" ref={notifRef}>
                  <button
                    onClick={() => setNotifDropdownOpen(!notifDropdownOpen)}
                    className="relative p-2 rounded-lg text-zinc-400 hover:text-white hover:bg-white/5 transition-all cursor-pointer"
                  >
                    <Bell className="h-5 w-5" />
                    {notificationsCount > 0 && (
                      <span className="absolute top-1.5 right-1.5 flex h-4 w-4 items-center justify-center rounded-full bg-white text-[9px] font-extrabold text-black ring-2 ring-background">
                        {notificationsCount}
                      </span>
                    )}
                  </button>

                  {/* Dropdown Card */}
                  {notifDropdownOpen && (
                    <div className="absolute right-0 mt-2 w-80 rounded-xl border border-white/10 bg-[#0d0d1f]/95 shadow-2xl backdrop-blur-xl p-2 z-50 animate-[slideIn_0.2s_ease-out]">
                      <div className="flex items-center justify-between px-3 py-2 border-b border-white/5">
                        <span className="text-xs font-bold text-zinc-400 uppercase tracking-wider">
                          Notifications
                        </span>
                        {notificationsCount > 0 && (
                          <span className="text-[10px] bg-zinc-800 text-zinc-300 border border-zinc-700 px-2 py-0.5 rounded-full font-semibold">
                            {notificationsCount} New
                          </span>
                        )}
                      </div>
                      <div className="max-h-64 overflow-y-auto custom-scrollbar py-1">
                        {notifications.length === 0 ? (
                          <div className="px-4 py-8 text-center text-xs text-zinc-500">
                            No notifications yet
                          </div>
                        ) : (
                          notifications.map((notif) => {
                            const isUnread = !notif.readBy.includes(user.id);
                            return (
                              <div
                                key={notif.id}
                                onClick={() => isUnread && markAsRead(notif.id)}
                                className={`p-3 rounded-lg text-left transition-colors cursor-pointer text-xs mb-1 ${
                                  isUnread 
                                    ? 'bg-white/5 hover:bg-white/10 border-l-2 border-white' 
                                    : 'hover:bg-white/5 opacity-70'
                                }`}
                              >
                                <div className="flex justify-between items-start gap-1 font-semibold text-zinc-200 mb-0.5">
                                  <span>{notif.title}</span>
                                  {isUnread && <span className="h-1.5 w-1.5 bg-white rounded-full flex-shrink-0 mt-1"></span>}
                                </div>
                                <p className="text-zinc-400 leading-normal text-[11px]">{notif.message}</p>
                                <span className="text-[9px] text-zinc-500 mt-1 block">
                                  {new Date(notif.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                </span>
                              </div>
                            );
                          })
                        )}
                      </div>
                    </div>
                  )}
                </div>

                {/* Profile Details */}
                <div className="flex items-center gap-3 pl-2 border-l border-white/10">
                  <div className="flex flex-col text-right">
                    <span className="text-xs font-semibold text-zinc-200 max-w-[120px] truncate">{user.name}</span>
                    <span className="text-[10px] text-zinc-500 capitalize">{user.role.replace('-', ' ')}</span>
                  </div>
                  <button
                    onClick={handleLogout}
                    className="p-2 rounded-lg text-zinc-400 hover:text-rose-400 hover:bg-rose-500/5 transition-all cursor-pointer"
                    title="Log Out"
                  >
                    <LogOut className="h-4.5 w-4.5" />
                  </button>
                </div>
              </>
            ) : (
              <div className="flex items-center gap-3">
                <Link
                  href="/login"
                  className="text-xs font-medium text-zinc-400 hover:text-white px-3 py-1.5 transition-colors"
                >
                  Log In
                </Link>
                <Link
                  href="/register"
                  className="text-xs font-semibold text-black bg-white hover:bg-zinc-200 px-4 py-2 rounded-xl transition-all shadow-lg shadow-white/5 hover:-translate-y-0.5 active:translate-y-0 duration-200"
                >
                  Register Now
                </Link>
              </div>
            )}
          </div>

          {/* Mobile menu toggle */}
          <div className="flex md:hidden items-center gap-3">
            {user && (
              <button
                onClick={() => setNotifDropdownOpen(!notifDropdownOpen)}
                className="relative p-2 rounded-lg text-zinc-400 hover:text-white"
              >
                <Bell className="h-5 w-5" />
                {notificationsCount > 0 && (
                  <span className="absolute top-1.5 right-1.5 h-3.5 w-3.5 bg-white text-black font-extrabold rounded-full flex items-center justify-center text-[8px]">
                    {notificationsCount}
                  </span>
                )}
              </button>
            )}
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="p-2 rounded-lg text-zinc-400 hover:text-white hover:bg-white/5 transition-colors cursor-pointer"
            >
              {mobileMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Drawer */}
      {mobileMenuOpen && (
        <div className="md:hidden border-t border-white/5 bg-[#03030f] p-4 flex flex-col gap-3 animate-[slideIn_0.2s_ease-out]">
          <Link
            href="/"
            onClick={() => setMobileMenuOpen(false)}
            className={`px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
              pathname === '/' ? 'bg-white/5 text-white' : 'text-zinc-400 hover:text-white'
            }`}
          >
            Home
          </Link>
          <Link
            href="/teams"
            onClick={() => setMobileMenuOpen(false)}
            className={`px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
              pathname === '/teams' ? 'bg-white/5 text-white' : 'text-zinc-400 hover:text-white'
            }`}
          >
            Public Teams
          </Link>
          {user && (
            <Link
              href="/dashboard"
              onClick={() => setMobileMenuOpen(false)}
              className={`px-3 py-2 rounded-lg text-sm font-medium transition-colors flex items-center gap-2 ${
                pathname.startsWith('/dashboard') ? 'bg-white/5 text-white' : 'text-zinc-400 hover:text-white'
              }`}
            >
              <LayoutDashboard className="h-4.5 w-4.5" />
              Dashboard
            </Link>
          )}
          {isAdmin && (
            <Link
              href="/admin"
              onClick={() => setMobileMenuOpen(false)}
              className={`px-3 py-2 rounded-lg text-sm font-medium transition-colors flex items-center gap-2 text-white bg-white/5 border border-white/10 ${
                pathname.startsWith('/admin') ? 'bg-white/10 text-white' : ''
              }`}
            >
              <Shield className="h-4.5 w-4.5" />
              Admin Panel
            </Link>
          )}

          {user ? (
            <div className="border-t border-white/5 pt-3 mt-1 flex flex-col gap-2">
              <div className="flex items-center justify-between px-3 py-1">
                <div className="flex flex-col">
                  <span className="text-sm font-semibold text-white">{user.name}</span>
                  <span className="text-[10px] text-zinc-500 capitalize">{user.role.replace('-', ' ')}</span>
                </div>
                <button
                  onClick={handleLogout}
                  className="flex items-center gap-1.5 text-xs text-rose-400 hover:text-rose-300 font-medium cursor-pointer"
                >
                  <LogOut className="h-4 w-4" />
                  Log Out
                </button>
              </div>
            </div>
          ) : (
            <div className="border-t border-white/5 pt-3 mt-1 flex flex-col gap-2">
              <Link
                href="/login"
                onClick={() => setMobileMenuOpen(false)}
                className="w-full text-center py-2.5 rounded-xl border border-white/10 text-sm font-medium text-zinc-300 hover:bg-white/5 transition-colors"
              >
                Log In
              </Link>
              <Link
                href="/register"
                onClick={() => setMobileMenuOpen(false)}
                className="w-full text-center py-2.5 rounded-xl bg-white text-black hover:bg-zinc-200 text-sm font-bold shadow-lg shadow-white/5 transition-all"
              >
                Register Now
              </Link>
            </div>
          )}
        </div>
      )}
    </header>
  );
}
