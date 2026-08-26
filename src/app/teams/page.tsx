'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '../../context/AuthContext';
import { useSocket } from '../../context/SocketContext';
import { 
  Search, Filter, ArrowUpDown, Sparkles, User, Users, School, 
  ArrowRight, CheckCircle2, ShieldAlert, Globe, 
  ExternalLink, UserCheck, Plus, Check, Loader 
} from 'lucide-react';

interface Team {
  id: string;
  name: string;
  description: string;
  college: string;
  leaderId: string;
  leaderName: string;
  members: string[];
  remainingSlots: number;
  status: 'open' | 'full';
  inviteLink: string;
  joinRequests: any[];
  createdAt: string;
}

interface Participant {
  id: string;
  name: string;
  college: string;
  branch: string;
  year: string;
  gender: string;
  linkedin?: string;
  portfolio?: string;
  teamId?: string;
  teamName?: string;
  teamRole?: 'leader' | 'member';
  paymentStatus: string;
  createdAt: string;
}

export default function TeamsPage() {
  const router = useRouter();
  const { user, token } = useAuth();
  const { addToast, socket } = useSocket();

  // Active Tab: 'teams' | 'participants'
  const [activeTab, setActiveTab] = useState<'teams' | 'participants'>('teams');

  // Teams Data State
  const [teams, setTeams] = useState<Team[]>([]);
  const [colleges, setColleges] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);

  // Teams Filter State
  const [search, setSearch] = useState('');
  const [selectedCollege, setSelectedCollege] = useState('');
  const [slotsOnly, setSlotsOnly] = useState(false);
  const [sortOrder, setSortOrder] = useState('alphabetical'); // alphabetical | newest

  // Request State
  const [pendingRequests, setPendingRequests] = useState<{ [teamId: string]: boolean }>({});

  // Participants Data State
  const [participants, setParticipants] = useState<Participant[]>([]);
  const [participantsLoading, setParticipantsLoading] = useState(false);
  const [participantSearch, setParticipantSearch] = useState('');
  const [participantCollege, setParticipantCollege] = useState('');
  const [participantStatus, setParticipantStatus] = useState<'all' | 'solo' | 'team'>('all');
  const [participantSort, setParticipantSort] = useState('alphabetical');

  // Fetch distinct colleges
  useEffect(() => {
    const fetchColleges = async () => {
      try {
        let res = await fetch('/api/public/colleges');
        if (!res.ok && process.env.NEXT_PUBLIC_API_URL) {
          res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/public/colleges`);
        }
        if (res.ok) {
          const list = await res.json();
          setColleges(list);
        }
      } catch (err) {
        console.error('Failed to fetch colleges:', err);
      }
    };
    fetchColleges();
  }, []);

  // Fetch teams with filters
  const fetchTeams = async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (search) params.append('search', search);
      if (selectedCollege) params.append('college', selectedCollege);
      if (slotsOnly) params.append('slotsAvailable', 'true');
      params.append('sort', sortOrder);

      const apiUrl = process.env.NEXT_PUBLIC_API_URL || '';
      let res = await fetch(`${apiUrl}/api/public/teams?${params.toString()}`);
      if (!res.ok && !apiUrl.includes('localhost')) {
        try {
          const fallbackRes = await fetch(`/api/public/teams?${params.toString()}`);
          if (fallbackRes.ok) res = fallbackRes;
        } catch {}
      }

      if (res.ok) {
        const list = await res.json();
        setTeams(list);

        // Find which teams have a pending request from current user
        if (user) {
          const pendingObj: { [teamId: string]: boolean } = {};
          list.forEach((t: Team) => {
            const hasPending = t.joinRequests?.some((r: any) => r.userId === user.id && r.status === 'pending');
            if (hasPending) pendingObj[t.id] = true;
          });
          setPendingRequests(pendingObj);
        }
      }
    } catch (err) {
      console.error('Error fetching teams:', err);
    } finally {
      setLoading(false);
    }
  };

  // Fetch public participants list
  const fetchParticipants = async () => {
    setParticipantsLoading(true);
    try {
      const params = new URLSearchParams();
      if (participantSearch) params.append('search', participantSearch);
      if (participantCollege) params.append('college', participantCollege);
      if (participantStatus === 'solo') params.append('lookingForTeam', 'true');
      params.append('sort', participantSort);

      // Try internal Next.js route first, then fallback to NEXT_PUBLIC_API_URL
      let res: Response | null = null;
      try {
        res = await fetch(`/api/public/participants?${params.toString()}`);
      } catch {}

      if (!res || !res.ok) {
        if (process.env.NEXT_PUBLIC_API_URL) {
          try {
            const remoteRes = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/public/participants?${params.toString()}`);
            if (remoteRes.ok) res = remoteRes;
          } catch {}
        }
      }

      if (res && res.ok) {
        let list: Participant[] = await res.json();
        if (participantStatus === 'team') {
          list = list.filter((p) => !!p.teamId);
        }
        setParticipants(list);
      }
    } catch (err) {
      console.error('Error fetching participants:', err);
    } finally {
      setParticipantsLoading(false);
    }
  };

  useEffect(() => {
    fetchTeams();
  }, [search, selectedCollege, slotsOnly, sortOrder, user]);

  useEffect(() => {
    if (activeTab === 'participants') {
      fetchParticipants();
    }
  }, [activeTab, participantSearch, participantCollege, participantStatus, participantSort]);

  // Handle Join Request
  const handleJoinRequest = async (team: Team) => {
    if (!user) {
      addToast('Authentication Required', 'Please log in to join a team.', 'warning');
      router.push('/login');
      return;
    }

    if (user.paymentStatus !== 'paid') {
      addToast('Payment Required', 'You must complete the registration payment before joining a team.', 'warning');
      router.push('/register');
      return;
    }

    if (user.teamId) {
      addToast('Action Prohibited', 'You are already in a team. Leave your current team first.', 'warning');
      return;
    }

    try {
      const savedToken = localStorage.getItem('designthon_token');
      const res = await fetch(process.env.NEXT_PUBLIC_API_URL + '/api/teams/join-request', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${savedToken}`,
        },
        body: JSON.stringify({ teamId: team.id }),
      });

      const data = await res.json();

      if (res.ok && data.success) {
        setPendingRequests(prev => ({ ...prev, [team.id]: true }));
        addToast('Request Dispatched', `Join request sent to ${team.leaderName}.`, 'success');

        // Emit instant socket event for real-time notification trigger
        if (socket) {
          socket.emit('new_join_request', {
            leaderId: team.leaderId,
            teamId: team.id,
            requesterName: user.name
          });
        }
      } else {
        addToast('Request Failed', data.message || 'Unable to join team.', 'warning');
      }
    } catch (err) {
      console.error(err);
      addToast('Connection Error', 'Failed to dispatch request to leader.', 'warning');
    }
  };

  return (
    <div className="flex-1 w-full bg-[#03030f] relative overflow-hidden bg-grid py-20 px-4 sm:px-6 lg:px-8">
      {/* ambient glows */}
      <div className="absolute top-[-10%] left-[-15%] w-[40%] h-[40%] rounded-full bg-zinc-800/5 blur-[100px] pointer-events-none" />
      <div className="absolute bottom-[-10%] right-[-15%] w-[40%] h-[40%] rounded-full bg-zinc-900/10 blur-[100px] pointer-events-none" />

      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="text-center mb-12">
          <div className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-3.5 py-1 text-[11px] font-semibold text-zinc-300 backdrop-blur-md mb-4 shadow-sm">
            <Sparkles className="h-3.5 w-3.5 text-purple-400" />
            Hackathon Matchmaking Hub
          </div>
          <h1 className="text-3xl sm:text-4xl font-extrabold text-white tracking-tight">
            {activeTab === 'teams' ? 'Public Design Teams' : 'Registered Participants'}
          </h1>
          <p className="text-xs text-zinc-400 mt-2.5 max-w-lg mx-auto leading-relaxed">
            {activeTab === 'teams'
              ? 'Browse public design groups looking for members. Send a request to join a team or create your own.'
              : 'Browse participants registered for DESIGNATHON 2026. Explore attendees from top colleges and connect with future teammates.'}
          </p>

          {/* Section Switcher Tabs */}
          <div className="flex justify-center mt-8">
            <div className="inline-flex p-1 rounded-2xl border border-white/10 bg-[#070719]/80 backdrop-blur-xl shadow-2xl">
              <button
                onClick={() => setActiveTab('teams')}
                className={`flex items-center gap-2 px-6 py-2.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                  activeTab === 'teams'
                    ? 'bg-white text-black shadow-lg'
                    : 'text-zinc-400 hover:text-white hover:bg-white/5'
                }`}
              >
                <Users className="h-4 w-4" />
                <span>Teams</span>
                <span className={`text-[10px] px-1.5 py-0.5 rounded-full font-mono font-semibold ${
                  activeTab === 'teams' ? 'bg-black/10 text-black' : 'bg-white/10 text-zinc-300'
                }`}>
                  {teams.length}
                </span>
              </button>

              <button
                onClick={() => setActiveTab('participants')}
                className={`flex items-center gap-2 px-6 py-2.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                  activeTab === 'participants'
                    ? 'bg-white text-black shadow-lg'
                    : 'text-zinc-400 hover:text-white hover:bg-white/5'
                }`}
              >
                <UserCheck className="h-4 w-4" />
                <span>Participants</span>
                <span className={`text-[10px] px-1.5 py-0.5 rounded-full font-mono font-semibold ${
                  activeTab === 'participants' ? 'bg-black/10 text-black' : 'bg-white/10 text-zinc-300'
                }`}>
                  {participants.length}
                </span>
              </button>
            </div>
          </div>
        </div>

        {/* ========================================================================= */}
        {/* --- SECTION 1: PUBLIC DESIGN TEAMS --- */}
        {/* ========================================================================= */}
        {activeTab === 'teams' && (
          <div className="space-y-10 animate-[fadeIn_0.25s_ease-out]">
            {/* Filter Toolbar */}
            <div className="glass-panel border-white/5 rounded-2xl p-5 flex flex-col md:flex-row gap-4 items-center justify-between backdrop-blur-xl">
              {/* Search Box */}
              <div className="relative w-full md:w-80">
                <span className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-zinc-500">
                  <Search className="h-4 w-4" />
                </span>
                <input
                  type="text"
                  placeholder="Search by team leader or name..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  className="block w-full pl-10 pr-4 py-2 rounded-xl border border-white/5 bg-[#050514]/60 text-zinc-100 placeholder-zinc-600 focus:outline-none focus:border-white/20 text-xs"
                />
              </div>

              {/* Filters Group */}
              <div className="flex flex-wrap items-center gap-4 w-full md:w-auto">
                {/* College Filter */}
                <div className="relative flex-1 sm:flex-none">
                  <select
                    value={selectedCollege}
                    onChange={(e) => setSelectedCollege(e.target.value)}
                    className="w-full sm:w-44 py-2 px-3 pr-8 rounded-xl border border-white/5 bg-[#050514]/60 text-zinc-300 focus:outline-none focus:border-white/20 text-xs appearance-none cursor-pointer"
                  >
                    <option value="">All Colleges</option>
                    {colleges.map((c) => (
                      <option key={c} value={c}>{c}</option>
                    ))}
                  </select>
                  <span className="absolute inset-y-0 right-0 flex items-center pr-3.5 pointer-events-none text-zinc-500">
                    <Filter className="h-3 w-3" />
                  </span>
                </div>

                {/* Sorting Dropdown */}
                <div className="relative flex-1 sm:flex-none">
                  <select
                    value={sortOrder}
                    onChange={(e) => setSortOrder(e.target.value)}
                    className="w-full sm:w-44 py-2 px-3 pr-8 rounded-xl border border-white/5 bg-[#050514]/60 text-zinc-300 focus:outline-none focus:border-white/20 text-xs appearance-none cursor-pointer"
                  >
                    <option value="alphabetical">Sort Alphabetical</option>
                    <option value="newest">Sort Newest</option>
                  </select>
                  <span className="absolute inset-y-0 right-0 flex items-center pr-3.5 pointer-events-none text-zinc-500">
                    <ArrowUpDown className="h-3 w-3" />
                  </span>
                </div>

                {/* Slots available toggle */}
                <label className="flex items-center gap-2 text-xs font-semibold text-zinc-400 cursor-pointer select-none pl-1">
                  <input
                    type="checkbox"
                    checked={slotsOnly}
                    onChange={(e) => setSlotsOnly(e.target.checked)}
                    className="rounded border-white/10 text-zinc-600 focus:ring-zinc-500 bg-black/40 h-4 w-4"
                  />
                  Slots Available Only
                </label>
              </div>
            </div>

            {/* Grid Lists */}
            {loading ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {[1, 2, 3].map((s) => (
                  <div key={s} className="glass-panel border-white/5 p-6 rounded-2xl h-60 animate-pulse flex flex-col justify-between">
                    <div className="space-y-3">
                      <div className="h-4 bg-white/5 rounded w-1/3"></div>
                      <div className="h-6 bg-white/5 rounded w-2/3"></div>
                      <div className="h-10 bg-white/5 rounded"></div>
                    </div>
                    <div className="h-8 bg-white/5 rounded w-1/2 mt-4"></div>
                  </div>
                ))}
              </div>
            ) : teams.length === 0 ? (
              <div className="text-center py-20 glass-panel border-white/5 rounded-3xl">
                <Users className="h-12 w-12 text-zinc-600 mx-auto mb-4" />
                <h3 className="text-lg font-bold text-white">No Public Teams Found</h3>
                <p className="text-xs text-zinc-500 mt-1">Try modifying your search queries or create a team yourself.</p>
                {user?.paymentStatus === 'paid' && !user?.teamId && (
                  <button
                    onClick={() => router.push('/dashboard?tab=team')}
                    className="mt-6 px-6 py-2.5 bg-white text-black font-bold text-xs rounded-xl shadow-lg hover:bg-zinc-200 transition-all flex items-center gap-1.5 mx-auto cursor-pointer"
                  >
                    Create a Team Now
                    <ArrowRight className="h-4 w-4" />
                  </button>
                )}
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {teams.map((team) => {
                  const isFull = team.status === 'full' || team.remainingSlots <= 0;
                  const hasRequested = pendingRequests[team.id];

                  return (
                    <div
                      key={team.id}
                      className="glass-panel border-white/5 hover:border-white/20 p-6 rounded-2xl flex flex-col justify-between transition-all duration-300 relative group text-left"
                    >
                      {/* border highlight on hover */}
                      <div className="absolute top-0 inset-x-0 h-[2px] bg-gradient-to-r from-white/20 to-zinc-500/20 opacity-0 group-hover:opacity-100 transition-opacity" />

                      {/* Header / Meta */}
                      <div>
                        <div className="flex justify-between items-start gap-4 mb-3">
                          <div className="flex items-center gap-1.5 rounded-full bg-white/5 border border-white/10 px-2.5 py-0.5 text-[10px] font-semibold text-zinc-300">
                            <School className="h-3 w-3 text-zinc-400" />
                            {team.college}
                          </div>
                          <span className={`text-[10px] font-bold uppercase tracking-wider font-mono ${isFull ? 'text-zinc-600' : 'text-emerald-400 animate-pulse'}`}>
                            {isFull ? 'Full' : 'Open'}
                          </span>
                        </div>

                        <h3 className="text-base font-bold text-white tracking-tight leading-snug group-hover:text-white transition-colors">
                          {team.name}
                        </h3>
                        <p className="text-xxs text-zinc-500 mt-1 flex items-center gap-1">
                          <User className="h-3 w-3 text-zinc-600" />
                          Leader: <strong className="text-zinc-400 font-semibold">{team.leaderName}</strong>
                        </p>

                        <p className="text-xs text-zinc-400 mt-3.5 leading-relaxed line-clamp-3">
                          {team.description}
                        </p>
                      </div>

                      {/* Footer / Slots & Actions */}
                      <div className="mt-6 pt-4 border-t border-white/5 flex items-center justify-between gap-4">
                        <div className="flex flex-col text-left">
                          <span className="text-[10px] text-zinc-500 font-bold uppercase tracking-wider">Remaining</span>
                          <span className="text-xs font-bold text-zinc-200 font-mono mt-0.5 flex items-center gap-1">
                            <Users className="h-3.5 w-3.5 text-zinc-600" />
                            {team.remainingSlots} Slots
                          </span>
                        </div>

                        {user?.teamId === team.id ? (
                          <span className="text-[11px] font-bold text-zinc-300 border border-white/10 bg-white/5 px-3.5 py-2 rounded-xl">
                            Your Team
                          </span>
                        ) : hasRequested ? (
                          <button
                            disabled
                            className="px-4 py-2 border border-white/5 bg-white/5 text-zinc-500 rounded-xl text-xs font-semibold"
                          >
                            Request Pending
                          </button>
                        ) : isFull ? (
                          <button
                            disabled
                            className="px-4 py-2 bg-zinc-900 border border-white/5 text-zinc-600 rounded-xl text-xs font-semibold"
                          >
                            Team Full
                          </button>
                        ) : (
                          <button
                            onClick={() => handleJoinRequest(team)}
                            className="px-4 py-2 bg-white hover:bg-zinc-200 text-black font-bold text-xs rounded-xl shadow-lg transition-all flex items-center gap-1 cursor-pointer"
                          >
                            Join Team
                            <ArrowRight className="h-3.5 w-3.5" />
                          </button>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        )}

        {/* ========================================================================= */}
        {/* --- SECTION 2: REGISTERED PARTICIPANTS --- */}
        {/* ========================================================================= */}
        {activeTab === 'participants' && (
          <div className="space-y-10 animate-[fadeIn_0.25s_ease-out]">
            {/* Toolbar */}
            <div className="glass-panel border-white/5 rounded-2xl p-5 flex flex-col md:flex-row gap-4 items-center justify-between backdrop-blur-xl">
              {/* Search Box */}
              <div className="relative w-full md:w-80">
                <span className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-zinc-500">
                  <Search className="h-4 w-4" />
                </span>
                <input
                  type="text"
                  placeholder="Search participant name, branch, college..."
                  value={participantSearch}
                  onChange={(e) => setParticipantSearch(e.target.value)}
                  className="block w-full pl-10 pr-4 py-2 rounded-xl border border-white/5 bg-[#050514]/60 text-zinc-100 placeholder-zinc-600 focus:outline-none focus:border-white/20 text-xs"
                />
              </div>

              {/* Filters Group */}
              <div className="flex flex-wrap items-center gap-4 w-full md:w-auto">
                {/* College Filter */}
                <div className="relative flex-1 sm:flex-none">
                  <select
                    value={participantCollege}
                    onChange={(e) => setParticipantCollege(e.target.value)}
                    className="w-full sm:w-44 py-2 px-3 pr-8 rounded-xl border border-white/5 bg-[#050514]/60 text-zinc-300 focus:outline-none focus:border-white/20 text-xs appearance-none cursor-pointer"
                  >
                    <option value="">All Colleges</option>
                    {colleges.map((c) => (
                      <option key={c} value={c}>{c}</option>
                    ))}
                  </select>
                  <span className="absolute inset-y-0 right-0 flex items-center pr-3.5 pointer-events-none text-zinc-500">
                    <Filter className="h-3 w-3" />
                  </span>
                </div>

                {/* Team Status Filter */}
                <div className="relative flex-1 sm:flex-none">
                  <select
                    value={participantStatus}
                    onChange={(e) => setParticipantStatus(e.target.value as any)}
                    className="w-full sm:w-44 py-2 px-3 pr-8 rounded-xl border border-white/5 bg-[#050514]/60 text-zinc-300 focus:outline-none focus:border-white/20 text-xs appearance-none cursor-pointer"
                  >
                    <option value="all">All Participants</option>
                    <option value="solo">Looking for Team (Solo)</option>
                    <option value="team">In a Team</option>
                  </select>
                  <span className="absolute inset-y-0 right-0 flex items-center pr-3.5 pointer-events-none text-zinc-500">
                    <Users className="h-3 w-3" />
                  </span>
                </div>

                {/* Sorting Dropdown */}
                <div className="relative flex-1 sm:flex-none">
                  <select
                    value={participantSort}
                    onChange={(e) => setParticipantSort(e.target.value)}
                    className="w-full sm:w-44 py-2 px-3 pr-8 rounded-xl border border-white/5 bg-[#050514]/60 text-zinc-300 focus:outline-none focus:border-white/20 text-xs appearance-none cursor-pointer"
                  >
                    <option value="alphabetical">Sort Alphabetical</option>
                    <option value="newest">Sort Newest</option>
                  </select>
                  <span className="absolute inset-y-0 right-0 flex items-center pr-3.5 pointer-events-none text-zinc-500">
                    <ArrowUpDown className="h-3 w-3" />
                  </span>
                </div>
              </div>
            </div>

            {/* Participants Grid */}
            {participantsLoading ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {[1, 2, 3].map((s) => (
                  <div key={s} className="glass-panel border-white/5 p-6 rounded-2xl h-56 animate-pulse flex flex-col justify-between">
                    <div className="space-y-3">
                      <div className="h-5 bg-white/5 rounded w-1/2"></div>
                      <div className="h-4 bg-white/5 rounded w-3/4"></div>
                      <div className="h-4 bg-white/5 rounded w-1/3"></div>
                    </div>
                    <div className="h-8 bg-white/5 rounded w-full mt-4"></div>
                  </div>
                ))}
              </div>
            ) : participants.length === 0 ? (
              <div className="text-center py-20 glass-panel border-white/5 rounded-3xl">
                <UserCheck className="h-12 w-12 text-zinc-600 mx-auto mb-4" />
                <h3 className="text-lg font-bold text-white">No Participants Found</h3>
                <p className="text-xs text-zinc-500 mt-1">Try adjusting your search query or college filters.</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {participants.map((p) => {
                  const hasTeam = !!p.teamId;
                  const isMe = user?.id === p.id;
                  const isLeader = user?.teamRole === 'leader';
                  const initials = p.name ? p.name.trim().split(' ').map(n => n[0]).join('').substring(0, 2).toUpperCase() : 'U';

                  return (
                    <div
                      key={p.id}
                      className="glass-panel border-white/5 hover:border-white/20 p-6 rounded-2xl flex flex-col justify-between transition-all duration-300 relative group text-left"
                    >
                      {/* border highlight on hover */}
                      <div className="absolute top-0 inset-x-0 h-[2px] bg-gradient-to-r from-purple-500/30 to-blue-500/30 opacity-0 group-hover:opacity-100 transition-opacity" />

                      {/* Header Profile */}
                      <div>
                        <div className="flex items-start justify-between gap-3 mb-4">
                          <div className="flex items-center gap-3">
                            <div className="w-11 h-11 rounded-2xl bg-gradient-to-br from-purple-600/20 to-blue-600/20 border border-purple-500/30 flex items-center justify-center font-extrabold text-white text-sm shadow-inner">
                              {initials}
                            </div>
                            <div>
                              <h3 className="text-sm font-bold text-white flex items-center gap-1.5">
                                {p.name}
                                {isMe && (
                                  <span className="text-[9px] bg-white/10 text-zinc-300 px-1.5 py-0.5 rounded font-normal">
                                    You
                                  </span>
                                )}
                              </h3>
                              <p className="text-xxs text-zinc-400 mt-0.5 flex items-center gap-1">
                                <School className="h-3 w-3 text-zinc-500 shrink-0" />
                                <span className="truncate max-w-[170px]" title={p.college}>{p.college}</span>
                              </p>
                            </div>
                          </div>

                          {/* Team Status Badge */}
                          {hasTeam ? (
                            <span className="text-[9px] font-bold px-2 py-0.5 rounded-full bg-purple-500/10 text-purple-400 border border-purple-500/20 font-mono shrink-0">
                              {p.teamRole === 'leader' ? 'Leader' : 'In Team'}
                            </span>
                          ) : (
                            <span className="text-[9px] font-bold px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 font-mono shrink-0 flex items-center gap-1">
                              <span className="h-1.5 w-1.5 rounded-full bg-emerald-400 animate-pulse"></span>
                              Looking for Team
                            </span>
                          )}
                        </div>

                        {/* Details */}
                        <div className="space-y-2 text-xs text-zinc-400 bg-white/[0.02] p-3 rounded-xl border border-white/5">
                          {p.branch && (
                            <div className="flex justify-between items-center text-xxs">
                              <span className="text-zinc-500">Branch & Year:</span>
                              <span className="text-zinc-300 font-semibold">{p.branch} {p.year ? `· ${p.year}` : ''}</span>
                            </div>
                          )}

                          <div className="flex justify-between items-center text-xxs">
                            <span className="text-zinc-500">Team Status:</span>
                            <span className="text-zinc-300 font-semibold truncate max-w-[150px]">
                              {p.teamName ? p.teamName : 'No Team Assigned'}
                            </span>
                          </div>
                        </div>
                      </div>

                      {/* Links and Actions Footer */}
                      <div className="mt-5 pt-3.5 border-t border-white/5 flex items-center justify-between gap-2">
                        {/* Social/Portfolio Links */}
                        <div className="flex items-center gap-1.5">
                          {p.linkedin && (
                            <a
                              href={p.linkedin.startsWith('http') ? p.linkedin : `https://${p.linkedin}`}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="p-1.5 rounded-lg border border-white/5 bg-white/5 text-zinc-400 hover:text-white hover:bg-white/10 transition-colors"
                              title="LinkedIn Profile"
                            >
                              <svg className="h-3.5 w-3.5 text-blue-400 fill-current" viewBox="0 0 24 24">
                                <path d="M19 3a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h14m-.5 15.5v-5.3a3.26 3.26 0 0 0-3.26-3.26c-.85 0-1.84.52-2.28 1.3v-1.11h-2.79v8.37h2.79v-4.93c0-.77.62-1.4 1.39-1.4a1.4 1.4 0 0 1 1.4 1.4v4.93h2.75M6.88 8.56a1.68 1.68 0 0 0 1.68-1.68c0-.93-.75-1.69-1.68-1.69a1.69 1.69 0 0 0-1.69 1.69c0 .93.76 1.68 1.69 1.68m1.39 9.94v-8.37H5.5v8.37h2.77z"/>
                              </svg>
                            </a>
                          )}
                          {p.portfolio && (
                            <a
                              href={p.portfolio.startsWith('http') ? p.portfolio : `https://${p.portfolio}`}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="p-1.5 rounded-lg border border-white/5 bg-white/5 text-zinc-400 hover:text-white hover:bg-white/10 transition-colors"
                              title="Portfolio Website"
                            >
                              <Globe className="h-3.5 w-3.5 text-purple-400" />
                            </a>
                          )}
                        </div>

                        {/* Quick Action */}
                        {isLeader && !hasTeam && !isMe ? (
                          <button
                            onClick={() => router.push(`/dashboard?tab=team`)}
                            className="px-3 py-1.5 rounded-lg bg-purple-600/20 hover:bg-purple-600/30 text-purple-300 border border-purple-500/30 text-xxs font-bold transition-all flex items-center gap-1 cursor-pointer"
                          >
                            <Plus className="h-3 w-3" />
                            Invite to Team
                          </button>
                        ) : !user ? (
                          <button
                            onClick={() => router.push('/login')}
                            className="text-xxs text-zinc-500 hover:text-zinc-300 transition-colors cursor-pointer flex items-center gap-1"
                          >
                            Connect <ArrowRight className="h-3 w-3" />
                          </button>
                        ) : (
                          <span className="text-[10px] text-zinc-600 font-mono">
                            Verified Attendee
                          </span>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

