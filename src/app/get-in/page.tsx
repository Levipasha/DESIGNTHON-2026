'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '../../context/AuthContext';
import {
  Users, Plus, Search, ArrowRight, School,
  Crown, CheckCircle2, Loader, ShieldAlert, Sparkles, UserPlus
} from 'lucide-react';

interface PublicTeam {
  id: string;
  name: string;
  description: string;
  college: string;
  leaderName: string;
  members: string[];
  remainingSlots: number;
  status: 'open' | 'full';
  joinRequests: any[];
}

function CreateTeamTab({ token, onCreated }: { token: string; onCreated: () => void }) {
  const [name, setName]         = useState('');
  const [desc, setDesc]         = useState('');
  const [loading, setLoading]   = useState(false);
  const [error, setError]       = useState('');

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;
    setLoading(true); setError('');
    try {
      const res = await fetch(process.env.NEXT_PUBLIC_API_URL + '/api/teams/create', {
        method: 'POST',
        headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: name.trim(), description: desc.trim() }),
      });
      const data = await res.json();
      if (res.ok) { onCreated(); }
      else { setError(data.message || 'Failed to create team.'); }
    } catch { setError('Network error.'); }
    finally { setLoading(false); }
  };

  return (
    <div className="max-w-lg mx-auto">
      <div className="glass-panel border-white/5 rounded-3xl p-8 relative overflow-hidden">
        <div className="absolute top-0 left-1/2 -translate-x-1/2 h-[1px] w-4/5 bg-gradient-to-r from-transparent via-white/20 to-transparent" />

        {/* Leader badge */}
        <div className="flex justify-center mb-6">
          <div className="w-14 h-14 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-center">
            <Crown className="h-6 w-6 text-white" />
          </div>
        </div>

        <h2 className="text-xl font-bold text-white text-center tracking-tight">Create Your Team</h2>
        <p className="text-xs text-zinc-500 text-center mt-1.5 mb-7 leading-relaxed">
          You'll become the <span className="text-white font-semibold">Group Leader</span>. You can invite members from your dashboard after creating the team.
        </p>

        {error && (
          <div className="flex items-start gap-2 bg-rose-950/20 border border-rose-500/30 text-rose-300 text-xs p-3 rounded-xl mb-5">
            <ShieldAlert className="h-4 w-4 flex-shrink-0 mt-0.5" />
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleCreate} className="space-y-4">
          <div>
            <label className="block text-[10px] font-bold text-zinc-500 uppercase tracking-widest mb-1.5 pl-1">Team Name *</label>
            <input
              type="text"
              required
              placeholder="e.g. Pixel Pioneers"
              value={name}
              onChange={e => setName(e.target.value)}
              className="block w-full px-4 py-3 rounded-xl border border-white/5 bg-white/5 text-zinc-100 placeholder-zinc-600 focus:outline-none focus:border-white/20 text-sm transition-all"
              maxLength={40}
            />
          </div>

          <div>
            <label className="block text-[10px] font-bold text-zinc-500 uppercase tracking-widest mb-1.5 pl-1">Team Description</label>
            <textarea
              placeholder="What's your team's design vision or approach?"
              value={desc}
              onChange={e => setDesc(e.target.value)}
              rows={3}
              className="block w-full px-4 py-3 rounded-xl border border-white/5 bg-white/5 text-zinc-100 placeholder-zinc-600 focus:outline-none focus:border-white/20 text-sm transition-all resize-none"
              maxLength={200}
            />
          </div>

          {/* Team size reminder */}
          <div className="flex items-center gap-2 bg-white/3 border border-white/5 rounded-xl px-4 py-3">
            <Users className="h-4 w-4 text-zinc-500 flex-shrink-0" />
            <span className="text-xs text-zinc-400">Teams require <strong className="text-white">3–4 members</strong> total. Invite others from your dashboard.</span>
          </div>

          <button
            type="submit"
            disabled={loading || !name.trim()}
            className="w-full py-3.5 px-4 rounded-xl bg-white hover:bg-zinc-100 text-black font-bold text-sm transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50 active:scale-[0.98]"
          >
            {loading ? <Loader className="h-4 w-4 animate-spin" /> : <Crown className="h-4 w-4" />}
            {loading ? 'Creating team…' : 'Create Team & Become Leader'}
          </button>
        </form>
      </div>
    </div>
  );
}

function JoinTeamTab({ token, userId }: { token: string; userId: string }) {
  const router = useRouter();
  const [teams, setTeams]       = useState<PublicTeam[]>([]);
  const [search, setSearch]     = useState('');
  const [loading, setLoading]   = useState(true);
  const [requested, setRequested] = useState<Record<string, boolean>>({});
  const [sending, setSending]   = useState<Record<string, boolean>>({});

  const fetchTeams = async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (search) params.append('search', search);
      params.append('slotsAvailable', 'true');
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/public/teams?${params}`);
      if (res.ok) {
        const list: PublicTeam[] = await res.json();
        setTeams(list);
        const pending: Record<string, boolean> = {};
        list.forEach(t => {
          if (t.joinRequests?.some((r: any) => r.userId === userId && r.status === 'pending')) {
            pending[t.id] = true;
          }
        });
        setRequested(pending);
      }
    } catch { } finally { setLoading(false); }
  };

  useEffect(() => {
    const t = setTimeout(fetchTeams, 300);
    return () => clearTimeout(t);
  }, [search]);

  const sendRequest = async (team: PublicTeam) => {
    setSending(p => ({ ...p, [team.id]: true }));
    try {
      const res = await fetch(process.env.NEXT_PUBLIC_API_URL + '/api/teams/join-request', {
        method: 'POST',
        headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' },
        body: JSON.stringify({ teamId: team.id }),
      });
      if (res.ok) setRequested(p => ({ ...p, [team.id]: true }));
    } catch { } finally { setSending(p => ({ ...p, [team.id]: false })); }
  };

  const memberDots = (count: number, max = 4) => (
    <div className="flex gap-1">
      {Array.from({ length: max }).map((_, i) => (
        <div key={i} className={`w-2 h-2 rounded-full ${i < count ? 'bg-white' : 'bg-white/15'}`} />
      ))}
    </div>
  );

  return (
    <div>
      {/* Search */}
      <div className="relative max-w-md mx-auto mb-8">
        <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-zinc-500" />
        <input
          type="text"
          placeholder="Search teams by name or leader…"
          value={search}
          onChange={e => setSearch(e.target.value)}
          className="w-full pl-11 pr-4 py-3 rounded-xl border border-white/5 bg-white/5 text-zinc-100 placeholder-zinc-600 focus:outline-none focus:border-white/20 text-sm transition-all"
        />
      </div>

      {loading ? (
        <div className="flex items-center justify-center gap-3 py-20 text-zinc-500">
          <Loader className="h-5 w-5 animate-spin" />
          <span className="text-sm">Loading teams…</span>
        </div>
      ) : teams.length === 0 ? (
        <div className="text-center py-20">
          <Users className="h-12 w-12 text-zinc-700 mx-auto mb-3" />
          <h3 className="text-sm font-semibold text-zinc-400">No open teams found</h3>
          <p className="text-xs text-zinc-600 mt-1">Try a different search or create your own team.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {teams.map(team => {
            const hasSent  = requested[team.id];
            const isSending = sending[team.id];
            const memberCount = team.members?.length ?? 0;

            return (
              <div key={team.id} className="glass-panel border-white/5 hover:border-white/15 rounded-2xl p-5 flex flex-col gap-4 transition-all duration-200 group relative overflow-hidden">
                {/* hover top line */}
                <div className="absolute top-0 inset-x-0 h-[1px] bg-gradient-to-r from-transparent via-white/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />

                {/* Top */}
                <div className="flex justify-between items-start gap-3">
                  <div className="flex items-center gap-1.5 rounded-full bg-white/5 border border-white/8 px-2.5 py-1 text-[10px] font-semibold text-zinc-300">
                    <School className="h-3 w-3" />
                    {team.college}
                  </div>
                  <span className="text-[10px] font-bold font-mono text-emerald-400 uppercase tracking-wider animate-pulse">Open</span>
                </div>

                {/* Name + leader */}
                <div>
                  <h3 className="text-sm font-bold text-white leading-snug">{team.name}</h3>
                  <p className="text-[11px] text-zinc-500 mt-0.5">Leader: <span className="text-zinc-300 font-medium">{team.leaderName}</span></p>
                  {team.description && (
                    <p className="text-xs text-zinc-500 mt-2 leading-relaxed line-clamp-2">{team.description}</p>
                  )}
                </div>

                {/* Members */}
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-[9px] text-zinc-600 uppercase font-bold tracking-widest mb-1">Members</p>
                    {memberDots(memberCount)}
                  </div>
                  <span className="text-[10px] text-zinc-500">{team.remainingSlots} slot{team.remainingSlots !== 1 ? 's' : ''} left</span>
                </div>

                {/* Action */}
                <button
                  onClick={() => sendRequest(team)}
                  disabled={hasSent || isSending}
                  className={`w-full py-2.5 rounded-xl font-semibold text-xs flex items-center justify-center gap-2 transition-all cursor-pointer ${
                    hasSent
                      ? 'bg-white/5 border border-white/8 text-zinc-500 cursor-default'
                      : 'bg-white hover:bg-zinc-100 text-black active:scale-[0.97]'
                  }`}
                >
                  {isSending ? <Loader className="h-3.5 w-3.5 animate-spin" /> :
                   hasSent ? <><CheckCircle2 className="h-3.5 w-3.5" />Request Sent</> :
                   <><UserPlus className="h-3.5 w-3.5" />Request to Join</>}
                </button>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

export default function GetInPage() {
  const router  = useRouter();
  const { user, token, loading, refreshUser } = useAuth();
  const [tab, setTab] = useState<'join' | 'create'>('join');

  useEffect(() => {
    if (!loading) {
      if (!user) { router.push('/login'); return; }
      if (user.paymentStatus !== 'paid') { router.push('/register'); return; }
      if (user.teamId) { router.push('/dashboard'); }
    }
  }, [user, loading, router]);

  const handleCreated = async () => {
    await refreshUser();
    router.push('/dashboard?tab=team');
  };

  if (loading || !user) {
    return (
      <div className="flex-1 w-full bg-[#03030f] flex items-center justify-center">
        <Loader className="h-6 w-6 text-zinc-500 animate-spin" />
      </div>
    );
  }

  return (
    <div className="flex-1 w-full bg-[#03030f] bg-grid relative overflow-hidden py-16 px-4 sm:px-6 lg:px-8">
      <div className="max-w-5xl mx-auto">

        {/* Header */}
        <div className="text-center mb-12">
          <div className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-3 py-1 text-[11px] font-semibold text-zinc-400 backdrop-blur-md mb-4">
            <Sparkles className="h-3 w-3" />
            You're registered — now get in!
          </div>
          <h1 className="text-3xl sm:text-4xl font-extrabold text-white tracking-tight">
            Join or Create a Team
          </h1>
          <p className="text-sm text-zinc-500 mt-2 max-w-md mx-auto leading-relaxed">
            Teams must have <strong className="text-zinc-300">3–4 members</strong>. Browse open teams to join, or start your own and invite people from your dashboard.
          </p>
        </div>

        {/* Tab Bar */}
        <div className="flex justify-center mb-10">
          <div className="inline-flex bg-white/5 border border-white/8 rounded-2xl p-1 gap-1">
            {(['join', 'create'] as const).map(t => (
              <button
                key={t}
                onClick={() => setTab(t)}
                className={`px-6 py-2.5 rounded-xl text-sm font-semibold transition-all cursor-pointer ${
                  tab === t
                    ? 'bg-white text-black shadow'
                    : 'text-zinc-400 hover:text-white'
                }`}
              >
                {t === 'join' ? (
                  <span className="flex items-center gap-2"><Users className="h-4 w-4" />Browse & Join</span>
                ) : (
                  <span className="flex items-center gap-2"><Plus className="h-4 w-4" />Create Team</span>
                )}
              </button>
            ))}
          </div>
        </div>

        {/* Tab Content */}
        {tab === 'join'
          ? <JoinTeamTab token={token!} userId={user.id} />
          : <CreateTeamTab token={token!} onCreated={handleCreated} />
        }
      </div>
    </div>
  );
}
