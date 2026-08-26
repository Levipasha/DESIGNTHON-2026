'use client';

import React, { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '../../context/AuthContext';
import { useSocket } from '../../context/SocketContext';
import { LayoutDashboard, Users, Ticket, Award, Calendar, Sparkles, CheckCircle2, ShieldAlert, Copy, ExternalLink, Plus, UserPlus, LogOut, Check, X, Shield, Download, Bell, HelpCircle, School, Loader } from 'lucide-react';
import QRCode from 'qrcode';

export default function UserDashboard() {
  const router = useRouter();
  const { user, token, loading, logout, refreshUser } = useAuth();
  const { socket, addToast, triggerRefreshNotifications } = useSocket();

  // Tab State: overview | team | receipt | certificate
  const [activeTab, setActiveTab] = useState('overview');

  // Team States
  const [teamDetails, setTeamDetails] = useState<any>(null);
  const [teamLoading, setTeamLoading] = useState(false);
  const [creatingTeam, setCreatingTeam] = useState(false);
  const [teamForm, setTeamForm] = useState({ name: '', description: '', logoUrl: '' });
  const [copiedLink, setCopiedLink] = useState(false);
  const qrCanvasRef = useRef<HTMLCanvasElement>(null);

  // Invite system state
  const [inviteEmail, setInviteEmail]         = useState('');
  const [inviteSending, setInviteSending]     = useState(false);
  const [inviteMsg, setInviteMsg]             = useState<{ text: string; ok: boolean } | null>(null);
  const [pendingInvites, setPendingInvites]   = useState<any[]>([]);
  const [respondingInvite, setRespondingInvite] = useState<string | null>(null);

  // General dashboard announcements
  const [announcements, setAnnouncements] = useState<any[]>([]);

  // Form input validation messages
  const [teamError, setTeamError] = useState('');

  // Generate QR code onto canvas whenever teamDetails.inviteLink or activeTab changes
  useEffect(() => {
    if (teamDetails?.inviteLink && qrCanvasRef.current) {
      QRCode.toCanvas(qrCanvasRef.current, teamDetails.inviteLink, {
        width: 144,
        margin: 1,
        color: { dark: '#000000', light: '#ffffff' },
      });
    }
  }, [teamDetails?.inviteLink, activeTab]);
  const [teamSuccess, setTeamSuccess] = useState('');

  // Redirect if not logged in
  useEffect(() => {
    if (!loading && !user) {
      router.push('/login');
    }
  }, [user, loading, router]);

  // Fetch Team Details
  const fetchMyTeam = async () => {
    if (!user || !user.teamId) {
      setTeamDetails(null);
      return;
    }
    setTeamLoading(true);
    try {
      const res = await fetch(process.env.NEXT_PUBLIC_API_URL + '/api/teams/my-team', {
        headers: {
          Authorization: `Bearer ${token}`
        }
      });
      if (res.ok) {
        const data = await res.json();
        setTeamDetails(data);
      }
    } catch (err) {
      console.error('Error fetching my team details:', err);
    } finally {
      setTeamLoading(false);
    }
  };

  // Fetch Announcements (user-scoped notifications)
  const fetchAnnouncements = async () => {
    if (!user) return;
    try {
      const res = await fetch(process.env.NEXT_PUBLIC_API_URL + '/api/notifications', {
        headers: {
          Authorization: `Bearer ${token}`
        }
      });
      if (res.ok) {
        const list = await res.json();
        // Sort by date newest first
        list.sort((a: any, b: any) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
        setAnnouncements(list);
      }
    } catch (err) {
      console.error('Error fetching notifications feed:', err);
    }
  };

  useEffect(() => {
    if (user) {
      fetchMyTeam();
      fetchAnnouncements();
      fetchPendingInvites();
    }
  }, [user]);

  // Fetch pending invites for this user
  const fetchPendingInvites = async () => {
    if (!token) return;
    try {
      const res = await fetch(process.env.NEXT_PUBLIC_API_URL + '/api/teams/my-invites', {
        headers: { Authorization: `Bearer ${token}` }
      });
      if (res.ok) setPendingInvites(await res.json());
    } catch { }
  };

  // Send invite (leader only)
  const handleSendInvite = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!inviteEmail.trim()) return;
    setInviteSending(true); setInviteMsg(null);
    try {
      const res = await fetch(process.env.NEXT_PUBLIC_API_URL + '/api/teams/invite', {
        method: 'POST',
        headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' },
        body: JSON.stringify({ inviteeEmail: inviteEmail.trim().toLowerCase() }),
      });
      const data = await res.json();
      setInviteMsg({ text: res.ok ? `Invite sent to ${inviteEmail}!` : (data.message || 'Failed to send invite.'), ok: res.ok });
      if (res.ok) setInviteEmail('');
    } catch { setInviteMsg({ text: 'Network error.', ok: false }); }
    finally { setInviteSending(false); }
  };

  // Respond to an invite (accept/reject)
  const handleInviteRespond = async (inviteId: string, action: 'accept' | 'reject') => {
    setRespondingInvite(inviteId);
    try {
      const res = await fetch(process.env.NEXT_PUBLIC_API_URL + '/api/teams/invite-respond', {
        method: 'POST',
        headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' },
        body: JSON.stringify({ inviteId, action }),
      });
      const data = await res.json();
      if (res.ok) {
        addToast(action === 'accept' ? 'Team Joined!' : 'Invite Declined', data.message, action === 'accept' ? 'success' : 'warning');
        await refreshUser();
        fetchPendingInvites();
        if (action === 'accept') fetchMyTeam();
      } else {
        addToast('Error', data.message || 'Failed.', 'warning');
      }
    } catch { }
    finally { setRespondingInvite(null); }
  };

  // Socket triggers for auto-updating team state
  useEffect(() => {
    if (!socket || !user) return;

    // Join team socket room if they have one
    if (user.teamId) {
      socket.emit('join_team_room', user.teamId);
    }

    socket.on('team_updated', () => {
      console.log('[Socket] Team updated, reloading details...');
      fetchMyTeam();
      refreshUser();
    });

    socket.on('request_response_received', () => {
      console.log('[Socket] Request response, reloading user...');
      refreshUser();
    });

    return () => {
      socket.off('team_updated');
      socket.off('request_response_received');
    };
  }, [socket, user]);

  if (loading || !user) {
    return (
      <div className="flex-1 w-full bg-[#03030f] flex items-center justify-center text-zinc-400">
        <div className="flex flex-col items-center gap-3">
          <div className="w-8 h-8 rounded-full border border-purple-500/30 border-t-purple-500 animate-spin"></div>
          <span className="text-xs font-semibold">Loading user dashboard session...</span>
        </div>
      </div>
    );
  }

  // Create Team
  const handleCreateTeam = async (e: React.FormEvent) => {
    e.preventDefault();
    setTeamError('');
    setTeamSuccess('');
    setCreatingTeam(true);

    try {
      const res = await fetch(process.env.NEXT_PUBLIC_API_URL + '/api/teams/create', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify(teamForm)
      });
      const data = await res.json();

      if (res.ok && data.success) {
        setTeamSuccess('Team created successfully!');
        addToast('Team Created', `Successfully formed team "${data.team.name}".`, 'success');
        
        // Refresh session profile and load team
        await refreshUser();
        if (socket) {
          socket.emit('team_modified', data.team.id);
        }
      } else {
        setTeamError(data.message || 'Failed to create team.');
      }
    } catch (err) {
      console.error(err);
      setTeamError('Server connection failed.');
    } finally {
      setCreatingTeam(false);
    }
  };

  // Respond to join request (Accept / Reject)
  const handleRespondRequest = async (requestUserId: string, status: 'approved' | 'rejected') => {
    try {
      const res = await fetch(process.env.NEXT_PUBLIC_API_URL + '/api/teams/respond-request', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({
          teamId: teamDetails?.id,
          requestUserId,
          status
        })
      });
      const data = await res.json();

      if (res.ok && data.success) {
        addToast(
          status === 'approved' ? 'Request Approved' : 'Request Declined',
          status === 'approved' ? 'Participant is now in your team.' : 'Join request declined.',
          status === 'approved' ? 'success' : 'warning'
        );

        // Fetch fresh team details
        fetchMyTeam();

        // Notify responder via Socket
        if (socket) {
          socket.emit('request_response', {
            userId: requestUserId,
            teamId: teamDetails?.id,
            status
          });
          socket.emit('team_modified', teamDetails?.id);
        }
      } else {
        addToast('Action Failed', data.message || 'Could not update request.', 'warning');
      }
    } catch (err) {
      console.error(err);
      addToast('Connection Error', 'Failed to communicate approval choice.', 'warning');
    }
  };

  // Remove member or Leave team
  const handleRemoveMember = async (targetUserId: string) => {
    const isSelf = targetUserId === user.id;
    const confirmMsg = isSelf 
      ? 'Are you sure you want to leave this team?' 
      : 'Are you sure you want to remove this member?';

    if (!confirm(confirmMsg)) return;

    try {
      const res = await fetch(process.env.NEXT_PUBLIC_API_URL + '/api/teams/remove-member', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({
          teamId: teamDetails?.id,
          targetUserId
        })
      });
      const data = await res.json();

      if (res.ok && data.success) {
        addToast(
          isSelf ? 'Team Left' : 'Member Removed',
          isSelf ? 'You have successfully left the team.' : 'Member removed from team.',
          'warning'
        );

        // Refresh user context and fetch team again
        await refreshUser();
        fetchMyTeam();

        // Emit Socket event to update team room
        if (socket) {
          socket.emit('team_modified', teamDetails?.id);
          socket.emit('request_response', {
            userId: targetUserId,
            teamId: teamDetails?.id,
            status: 'rejected' // Simulates removal alert
          });
        }
      } else {
        addToast('Action Failed', data.message || 'Operation failed.', 'warning');
      }
    } catch (err) {
      console.error(err);
      addToast('Connection Error', 'Failed to remove member.', 'warning');
    }
  };

  const copyInviteLink = () => {
    if (!teamDetails) return;
    navigator.clipboard.writeText(teamDetails.inviteLink);
    setCopiedLink(true);
    addToast('Link Copied', 'Team invitation URL copied to clipboard.', 'success');
    setTimeout(() => setCopiedLink(false), 2000);
  };

  const printReceipt = () => {
    window.print();
  };

  // Calculate team completion %
  const completionPercentage = teamDetails 
    ? Math.round((teamDetails.members.length / 4) * 100) 
    : 0;

  return (
    <div className="flex-1 w-full bg-[#03030f] relative overflow-hidden bg-grid py-12 px-4 sm:px-6 lg:px-8">
      {/* Decorative ambient glows */}
      <div className="absolute top-[-10%] left-[-15%] w-[45%] h-[45%] rounded-full bg-purple-900/10 blur-[100px] pointer-events-none" />
      <div className="absolute bottom-[-10%] right-[-15%] w-[45%] h-[45%] rounded-full bg-blue-900/10 blur-[100px] pointer-events-none" />

      <div className="max-w-7xl mx-auto flex flex-col md:flex-row gap-8">
        
        {/* Left Side Navigation Sidebar */}
        <aside className="w-full md:w-64 flex-shrink-0 flex flex-col gap-2">
          {/* User Brief profile card */}
          <div className="glass-panel border-white/5 rounded-2xl p-5 mb-4 backdrop-blur-xl relative overflow-hidden">
            <div className="absolute top-0 right-0 h-[2px] w-[50%] bg-gradient-to-r from-purple-500/50 to-blue-500/50" />
            <span className="text-[10px] text-zinc-500 font-bold uppercase tracking-wider block">Attendee</span>
            <h2 className="text-sm font-extrabold text-white mt-0.5 truncate">{user.name}</h2>
            <p className="text-xxs text-zinc-400 mt-1 truncate">{user.college}</p>
            
            {/* Role Badge */}
            <div className="flex items-center gap-1.5 mt-3 pt-3 border-t border-white/5">
              <span className={`text-[10px] font-semibold px-2 py-0.5 rounded-full ${
                user.paymentStatus === 'paid' 
                  ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20' 
                  : 'bg-amber-500/10 text-amber-400 border border-amber-500/20'
              }`}>
                {user.paymentStatus === 'paid' ? 'Registered Attendee' : 'Payment Pending'}
              </span>
            </div>
          </div>

          {/* Navigation Items */}
          <button
            onClick={() => setActiveTab('overview')}
            className={`w-full py-3 px-4 rounded-xl text-xs font-semibold flex items-center gap-3 transition-all cursor-pointer ${
              activeTab === 'overview'
                ? 'bg-white/5 border border-white/10 text-white shadow-inner'
                : 'text-zinc-400 hover:text-white hover:bg-white/5 border border-transparent'
            }`}
          >
            <LayoutDashboard className="h-4.5 w-4.5 text-purple-400" />
            Overview Dashboard
          </button>

          <button
            onClick={() => setActiveTab('team')}
            className={`w-full py-3 px-4 rounded-xl text-xs font-semibold flex items-center gap-3 transition-all cursor-pointer ${
              activeTab === 'team'
                ? 'bg-white/5 border border-white/10 text-white shadow-inner'
                : 'text-zinc-400 hover:text-white hover:bg-white/5 border border-transparent'
            }`}
          >
            <Users className="h-4.5 w-4.5 text-blue-400" />
            Team Management
          </button>

          <button
            onClick={() => setActiveTab('receipt')}
            className={`w-full py-3 px-4 rounded-xl text-xs font-semibold flex items-center gap-3 transition-all cursor-pointer ${
              activeTab === 'receipt'
                ? 'bg-white/5 border border-white/10 text-white shadow-inner'
                : 'text-zinc-400 hover:text-white hover:bg-white/5 border border-transparent'
            }`}
          >
            <Ticket className="h-4.5 w-4.5 text-indigo-400" />
            Payment & QR Code
          </button>

          <button
            onClick={() => setActiveTab('certificate')}
            className={`w-full py-3 px-4 rounded-xl text-xs font-semibold flex items-center gap-3 transition-all cursor-pointer ${
              activeTab === 'certificate'
                ? 'bg-white/5 border border-white/10 text-white shadow-inner'
                : 'text-zinc-400 hover:text-white hover:bg-white/5 border border-transparent'
            }`}
          >
            <Award className="h-4.5 w-4.5 text-yellow-400" />
            E-Certificates
          </button>
        </aside>

        {/* Right Side Content Panel */}
        <main className="flex-1 min-h-[450px]">
          
          {/* Pending Invites Banner (Teamless Users) */}
          {!user.teamId && pendingInvites.length > 0 && (
            <div className="mb-6 space-y-3 animate-[fadeIn_0.2s_ease-out]">
              {pendingInvites.map(inv => (
                <div key={inv.id} className="glass-panel border-white/10 bg-white/5 rounded-2xl p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-l-4 border-l-purple-500 shadow-xl">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-purple-500/10 border border-purple-500/20 flex items-center justify-center">
                      <Bell className="h-5 w-5 text-purple-400" />
                    </div>
                    <div className="text-left">
                      <span className="text-[10px] text-zinc-500 font-bold uppercase tracking-wider">Pending Team Invite</span>
                      <h4 className="text-sm font-bold text-white mt-0.5">
                        You're invited to join <span className="text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-blue-400 font-extrabold">{inv.teamName}</span>
                      </h4>
                      <p className="text-xxs text-zinc-400 mt-0.5">Invited by {inv.leaderName} ({inv.inviteeEmail})</p>
                    </div>
                  </div>
                  <div className="flex gap-2 self-end sm:self-center">
                    <button
                      onClick={() => handleInviteRespond(inv.id, 'reject')}
                      disabled={respondingInvite === inv.id}
                      className="px-4 py-2 rounded-xl border border-white/10 bg-white/5 text-zinc-400 hover:text-white text-xs font-semibold transition-all cursor-pointer"
                    >
                      Decline
                    </button>
                    <button
                      onClick={() => handleInviteRespond(inv.id, 'accept')}
                      disabled={respondingInvite === inv.id}
                      className="px-4 py-2 rounded-xl bg-white text-black text-xs font-bold hover:bg-zinc-100 transition-all cursor-pointer flex items-center gap-1.5 active:scale-[0.98]"
                    >
                      {respondingInvite === inv.id ? (
                        <Loader className="h-3.5 w-3.5 animate-spin" />
                      ) : (
                        <Check className="h-3.5 w-3.5" />
                      )}
                      Accept & Join
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
          {/* --- TAB 1: OVERVIEW DASHBOARD --- */}
          {activeTab === 'overview' && (
            <div className="space-y-6 animate-[fadeIn_0.2s_ease-out]">
              {/* Event updates banners */}
              <div className="glass-panel border-white/5 rounded-2xl p-6 backdrop-blur-xl flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                  <h1 className="text-xl font-bold text-white tracking-tight flex items-center gap-2">
                    Welcome to DESIGNATHON 2026!
                    <Sparkles className="h-4.5 w-4.5 text-purple-400" />
                  </h1>
                  <p className="text-xs text-zinc-400 mt-1 max-w-xl">
                    Your registration has been completed. Join a team or create one below to start preparation. Cohort check-in desk will open on Saturday, Sept 12 at 09:00 AM.
                  </p>
                </div>
                {user.paymentStatus === 'paid' ? (
                  <div className="flex-shrink-0 self-start md:self-center px-4 py-2 border border-emerald-500/20 bg-emerald-500/10 text-emerald-400 font-bold rounded-xl text-xs flex items-center gap-1.5 shadow-sm">
                    <CheckCircle2 className="h-4 w-4" />
                    Entry Confirmed
                  </div>
                ) : (
                  <button
                    onClick={() => router.push('/register')}
                    className="flex-shrink-0 self-start md:self-center px-4 py-2 bg-amber-500 text-black hover:bg-amber-400 font-bold rounded-xl text-xs transition-all cursor-pointer shadow-lg shadow-amber-500/10"
                  >
                    Complete Payment
                  </button>
                )}
              </div>

              {/* Layout grid cards */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                
                {/* Announcements Feed */}
                <div className="glass-panel border-white/5 rounded-2xl p-6 flex flex-col h-96">
                  <h3 className="text-sm font-bold text-white mb-4 pb-2 border-b border-white/5 flex items-center gap-2">
                    <Bell className="h-4 w-4 text-purple-400" />
                    Announcements & Logs
                  </h3>
                  <div className="flex-1 overflow-y-auto custom-scrollbar space-y-3.5 pr-1">
                    {announcements.length === 0 ? (
                      <div className="h-full flex items-center justify-center text-center text-xs text-zinc-500 py-10">
                        No broadcast messages received yet.
                      </div>
                    ) : (
                      announcements.map((ann, idx) => (
                        <div key={ann.id || idx} className="p-3 bg-white/[0.01] hover:bg-white/[0.02] border border-white/5 rounded-xl transition-all">
                          <div className="flex items-start justify-between gap-2">
                            <span className="font-bold text-xs text-zinc-200">{ann.title}</span>
                            <span className="text-[9px] text-zinc-500 shrink-0 font-mono">
                              {new Date(ann.createdAt).toLocaleDateString()}
                            </span>
                          </div>
                          <p className="text-zinc-400 text-xxs mt-1 leading-normal">{ann.message}</p>
                        </div>
                      ))
                    )}
                  </div>
                </div>

                {/* Timeline and schedule progress */}
                <div className="glass-panel border-white/5 rounded-2xl p-6 flex flex-col h-96">
                  <h3 className="text-sm font-bold text-white mb-4 pb-2 border-b border-white/5 flex items-center gap-2">
                    <Calendar className="h-4 w-4 text-blue-400" />
                    Schedule Progress
                  </h3>
                  <div className="flex-1 overflow-y-auto custom-scrollbar space-y-4 pr-1 text-xs">
                    <div className="flex gap-4 items-start opacity-100">
                      <span className="text-[10px] font-mono text-purple-400 shrink-0 w-16 pt-0.5">ONLINE NOW</span>
                      <div className="flex-1 pl-4 border-l-2 border-purple-500 relative">
                        <div className="absolute left-[-6px] top-1.5 h-2 w-2 rounded-full bg-purple-500 ring-4 ring-purple-900/30" />
                        <h4 className="font-semibold text-zinc-200">Matchmaking & Team Prep</h4>
                        <p className="text-xxs text-zinc-500 mt-0.5">Forms teams on the dashboard, invite peers, draft ideas.</p>
                      </div>
                    </div>

                    <div className="flex gap-4 items-start opacity-60">
                      <span className="text-[10px] font-mono text-zinc-500 shrink-0 w-16 pt-0.5">SEPT 12, 09:00</span>
                      <div className="flex-1 pl-4 border-l-2 border-white/10 relative">
                        <div className="absolute left-[-5px] top-1.5 h-1.5 w-1.5 rounded-full bg-zinc-700" />
                        <h4 className="font-semibold text-zinc-300">Venue Entry Check-in</h4>
                        <p className="text-xxs text-zinc-500 mt-0.5">Scan entry tickets at Cohort registration desk.</p>
                      </div>
                    </div>

                    <div className="flex gap-4 items-start opacity-60">
                      <span className="text-[10px] font-mono text-zinc-500 shrink-0 w-16 pt-0.5">SEPT 12, 11:00</span>
                      <div className="flex-1 pl-4 border-l-2 border-white/10 relative">
                        <div className="absolute left-[-5px] top-1.5 h-1.5 w-1.5 rounded-full bg-zinc-700" />
                        <h4 className="font-semibold text-zinc-300">Hacking Commences</h4>
                        <p className="text-xxs text-zinc-500 mt-0.5">Prompts reveal. Hacking session commences for 2 days.</p>
                      </div>
                    </div>

                    <div className="flex gap-4 items-start opacity-60">
                      <span className="text-[10px] font-mono text-zinc-500 shrink-0 w-16 pt-0.5">SEPT 13, 02:00</span>
                      <div className="flex-1 pl-4 border-l-2 border-white/10 relative">
                        <div className="absolute left-[-5px] top-1.5 h-1.5 w-1.5 rounded-full bg-zinc-700" />
                        <h4 className="font-semibold text-zinc-300">Prototype Freeze</h4>
                        <p className="text-xxs text-zinc-500 mt-0.5">Lock designs, submit deliverables, pitch rehearsal.</p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* --- TAB 2: TEAM MANAGEMENT --- */}
          {activeTab === 'team' && (
            <div className="space-y-6 animate-[fadeIn_0.2s_ease-out]">
              {/* check if user is not in a team */}
              {!user.teamId ? (
                /* No team — send to Get In page */
                <div className="glass-panel border-white/5 rounded-2xl p-10 text-center relative overflow-hidden">
                  <div className="absolute top-0 left-1/2 -translate-x-1/2 h-[1px] w-3/5 bg-gradient-to-r from-transparent via-white/20 to-transparent" />
                  <div className="w-14 h-14 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-center mx-auto mb-5">
                    <Users className="h-6 w-6 text-white" />
                  </div>
                  <h3 className="text-lg font-bold text-white">You're not in a team yet</h3>
                  <p className="text-xs text-zinc-500 mt-2 mb-6 max-w-sm mx-auto leading-relaxed">
                    Join an open team or create your own and become Group Leader. Teams require 3–4 members.
                  </p>

                  {/* Pending invites shown here too */}
                  {pendingInvites.length > 0 && (
                    <div className="mb-6 text-left space-y-3">
                      <p className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest">Pending Team Invites ({pendingInvites.length})</p>
                      {pendingInvites.map(inv => (
                        <div key={inv.id} className="glass-panel border-white/8 rounded-xl p-4 flex items-center justify-between gap-4">
                          <div>
                            <p className="text-xs font-semibold text-white">{inv.teamName}</p>
                            <p className="text-[10px] text-zinc-500 mt-0.5">Invited by <span className="text-zinc-300">{inv.leaderName}</span></p>
                          </div>
                          <div className="flex gap-2">
                            <button
                              onClick={() => handleInviteRespond(inv.id, 'reject')}
                              disabled={respondingInvite === inv.id}
                              className="px-3 py-1.5 rounded-lg border border-white/10 bg-white/5 text-zinc-400 hover:text-white text-xs font-semibold transition-all cursor-pointer"
                            >
                              Decline
                            </button>
                            <button
                              onClick={() => handleInviteRespond(inv.id, 'accept')}
                              disabled={respondingInvite === inv.id}
                              className="px-3 py-1.5 rounded-lg bg-white text-black text-xs font-bold hover:bg-zinc-100 transition-all cursor-pointer flex items-center gap-1.5"
                            >
                              <Check className="h-3 w-3" />Accept
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}

                  <button
                    onClick={() => router.push('/get-in')}
                    className="inline-flex items-center gap-2 px-8 py-3 rounded-xl bg-white hover:bg-zinc-100 text-black font-bold text-sm transition-all cursor-pointer active:scale-[0.97]"
                  >
                    <UserPlus className="h-4 w-4" />
                    Go to Get In Page
                  </button>
                </div>
              ) : (
                /* user is in a team - display team status and dashboard */
                <div className="space-y-6">
                  
                  {/* Team details header */}
                  {teamLoading || !teamDetails ? (
                    <div className="glass-panel border-white/5 p-6 rounded-2xl animate-pulse h-32" />
                  ) : (
                    <div className="glass-panel border-white/5 p-6 rounded-2xl relative overflow-hidden flex flex-col md:flex-row md:items-center justify-between gap-6 backdrop-blur-xl">
                      {/* Ambient background blur */}
                      <div className="absolute top-0 right-0 h-[2px] w-[60%] bg-gradient-to-r from-purple-500/50 to-blue-500/50" />

                      <div className="space-y-1">
                        <div className="flex items-center gap-2">
                          <h1 className="text-xl font-bold text-white tracking-tight">{teamDetails.name}</h1>
                          <span className="text-[9px] bg-purple-500/10 border border-purple-500/20 text-purple-400 font-semibold px-2 py-0.5 rounded-full uppercase tracking-wider font-mono">
                            ID: {teamDetails.id}
                          </span>
                        </div>
                        <p className="text-xs text-zinc-400 max-w-xl">{teamDetails.description}</p>
                        <p className="text-xxs text-zinc-500 mt-2 flex items-center gap-1">
                          <School className="h-3.5 w-3.5" />
                          College Restriction: <strong className="text-zinc-400 font-semibold">{teamDetails.college}</strong>
                        </p>
                      </div>

                      <div className="flex-shrink-0 flex flex-col items-end gap-1.5">
                        <span className="text-xxs text-zinc-500 uppercase tracking-widest font-bold">Team Completion</span>
                        <div className="flex items-center gap-2">
                          <div className="w-24 h-2 bg-white/5 rounded-full overflow-hidden border border-white/5">
                            <div className="h-full bg-gradient-to-r from-purple-500 to-blue-500" style={{ width: `${completionPercentage}%` }}></div>
                          </div>
                          <span className="text-xs font-bold text-white font-mono">{completionPercentage}%</span>
                        </div>
                        <span className="text-[10px] text-zinc-500 mt-1">({teamDetails.members.length} / 4 Members)</span>
                      </div>
                    </div>
                  )}

                  {/* Team Members, Invites & Requests Grid */}
                  {/* Pending Invites Banner (for non-leaders with no team yet — covered above; here show sent invite status for leader) */}

                  <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                    
                    {/* Team Members List */}
                    <div className="lg:col-span-2 space-y-4">
                      <div className="glass-panel border-white/5 rounded-2xl p-6">
                        <h3 className="text-sm font-bold text-white mb-4 pb-2 border-b border-white/5 flex items-center gap-2">
                          <Users className="h-4.5 w-4.5 text-zinc-400" />
                          Team Members List
                        </h3>

                        <div className="space-y-3">
                          {teamDetails?.members.map((member: any) => {
                            const isLeader = teamDetails.leaderId === member.id;
                            const isMe = member.id === user.id;

                            return (
                              <div
                                key={member.id}
                                className="flex items-center justify-between p-3.5 rounded-xl border border-white/5 bg-[#050514]/40 hover:bg-[#050514]/60 transition-colors"
                              >
                                <div className="flex items-center gap-3">
                                  <div className="w-9 h-9 rounded-xl bg-purple-500/10 border border-purple-500/20 flex items-center justify-center font-bold text-purple-300 uppercase">
                                    {member.name.substring(0, 2)}
                                  </div>
                                  <div className="text-left">
                                    <h4 className="text-xs font-bold text-white flex items-center gap-1.5">
                                      {member.name}
                                      {isMe && <span className="text-[9px] bg-white/10 text-zinc-300 px-1.5 py-0.5 rounded font-normal">You</span>}
                                      {isLeader && <span className="text-[9px] bg-purple-500/10 text-purple-400 border border-purple-500/20 px-1.5 py-0.5 rounded font-normal">Leader</span>}
                                    </h4>
                                    <p className="text-[10px] text-zinc-500 truncate max-w-[200px]">{member.email}</p>
                                  </div>
                                </div>

                                <div className="flex items-center gap-3">
                                  {/* Payment status badge */}
                                  <span className="hidden sm:inline-block text-[9px] bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 px-2 py-0.5 rounded-full font-semibold">
                                    Paid
                                  </span>

                                  {/* Remove member logic */}
                                  {user.id === teamDetails.leaderId && !isLeader && (
                                    <button
                                      onClick={() => handleRemoveMember(member.id)}
                                      className="p-1.5 rounded-lg text-rose-500 hover:bg-rose-500/10 transition-colors cursor-pointer"
                                      title="Remove Member"
                                    >
                                      <X className="h-4 w-4" />
                                    </button>
                                  )}
                                  
                                  {/* Leave team logic */}
                                  {isMe && !isLeader && (
                                    <button
                                      onClick={() => handleRemoveMember(user.id)}
                                      className="px-2.5 py-1 rounded-lg border border-rose-500/20 text-rose-400 hover:bg-rose-500/10 text-[10px] font-semibold flex items-center gap-1 transition-colors cursor-pointer"
                                    >
                                      <LogOut className="h-3 w-3" />
                                      Leave
                                    </button>
                                  )}
                                </div>
                              </div>
                            );
                          })}
                        </div>
                      </div>

                      {/* Pending Join Requests (Leader only) */}
                      {user.id === teamDetails?.leaderId && (
                        <div className="glass-panel border-white/5 rounded-2xl p-6">
                          <h3 className="text-sm font-bold text-white mb-4 pb-2 border-b border-white/5 flex items-center gap-2">
                            <UserPlus className="h-4.5 w-4.5 text-blue-400" />
                            Pending Join Requests
                          </h3>

                          {/* list of requests */}
                          {!teamDetails?.joinRequests || teamDetails.joinRequests.filter((r: any) => r.status === 'pending').length === 0 ? (
                            <p className="text-xs text-zinc-500 text-center py-6">
                              No pending join requests at the moment. Share invite links.
                            </p>
                          ) : (
                            <div className="space-y-3">
                              {teamDetails.joinRequests
                                .filter((r: any) => r.status === 'pending')
                                .map((req: any) => (
                                  <div
                                    key={req.userId}
                                    className="flex items-center justify-between p-3.5 rounded-xl border border-white/5 bg-[#050514]/40"
                                  >
                                    <div className="text-left">
                                      <h4 className="text-xs font-bold text-white">{req.name}</h4>
                                      <p className="text-[10px] text-zinc-500 mt-0.5">{req.college} • {req.email}</p>
                                    </div>
                                    <div className="flex gap-2">
                                      <button
                                        onClick={() => handleRespondRequest(req.userId, 'approved')}
                                        className="p-1.5 bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-400 border border-emerald-500/20 rounded-lg cursor-pointer transition-colors"
                                        title="Accept Request"
                                      >
                                        <Check className="h-4 w-4" />
                                      </button>
                                      <button
                                        onClick={() => handleRespondRequest(req.userId, 'rejected')}
                                        className="p-1.5 bg-rose-500/10 hover:bg-rose-500/20 text-rose-400 border border-rose-500/20 rounded-lg cursor-pointer transition-colors"
                                        title="Decline Request"
                                      >
                                        <X className="h-4 w-4" />
                                      </button>
                                    </div>
                                  </div>
                                ))}
                            </div>
                          )}
                        </div>
                      )}
                    </div>

                    {/* QR Code Invitation & Invite Link Box */}
                    <div className="space-y-6">

                      {/* Invite by Email (Leader Only) */}
                      {user.id === teamDetails?.leaderId && teamDetails?.remainingSlots > 0 && (
                        <div className="glass-panel border-white/5 rounded-2xl p-6">
                          <h3 className="text-sm font-bold text-white mb-1 flex items-center gap-2">
                            <UserPlus className="h-4.5 w-4.5 text-zinc-400" />
                            Invite Member by Email
                          </h3>
                          <p className="text-[10px] text-zinc-500 mb-4 leading-relaxed">
                            Enter the Gmail address of a registered, paid participant. They'll see the invite on their dashboard.
                          </p>
                          {inviteMsg && (
                            <div className={`flex items-center gap-2 text-xs p-2.5 rounded-xl mb-3 border ${
                              inviteMsg.ok
                                ? 'bg-emerald-950/20 border-emerald-500/30 text-emerald-300'
                                : 'bg-rose-950/20 border-rose-500/30 text-rose-300'
                            }`}>
                              {inviteMsg.ok ? <CheckCircle2 className="h-3.5 w-3.5 flex-shrink-0" /> : <ShieldAlert className="h-3.5 w-3.5 flex-shrink-0" />}
                              {inviteMsg.text}
                            </div>
                          )}
                          <form onSubmit={handleSendInvite} className="flex flex-col gap-2">
                            <input
                              type="email"
                              required
                              placeholder="friend@gmail.com"
                              value={inviteEmail}
                              onChange={e => setInviteEmail(e.target.value)}
                              className="block w-full px-3.5 py-2.5 rounded-xl border border-white/5 bg-white/5 text-zinc-100 placeholder-zinc-600 focus:outline-none focus:border-white/20 text-xs transition-all"
                            />
                            <button
                              type="submit"
                              disabled={inviteSending || !inviteEmail.trim()}
                              className="w-full py-2.5 rounded-xl bg-white hover:bg-zinc-100 text-black font-bold text-xs transition-all flex items-center justify-center gap-1.5 cursor-pointer disabled:opacity-50"
                            >
                              {inviteSending ? 'Sending...' : 'Send Invite'}
                            </button>
                          </form>
                        </div>
                      )}

                    </div>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* --- TAB 3: RECEIPT DOWNLOADER --- */}
          {activeTab === 'receipt' && (
            <div className="space-y-6 animate-[fadeIn_0.2s_ease-out]">
              <div className="glass-panel border-white/5 p-8 rounded-3xl max-w-xl mx-auto relative overflow-hidden backdrop-blur-xl shadow-2xl">
                <div className="absolute top-0 right-0 bg-emerald-500/10 border-b border-l border-emerald-500/20 text-emerald-400 text-[10px] px-3.5 py-1 font-bold">
                  PAID CONFIRMED
                </div>

                <div className="flex justify-between items-start border-b border-white/5 pb-4 mb-4 text-left">
                  <div>
                    <h2 className="text-base font-bold text-white tracking-widest font-mono">DESIGNATHON 2026</h2>
                    <p className="text-[10px] text-zinc-500 mt-0.5">Cohort, Hyderabad, India</p>
                  </div>
                  <div className="text-right">
                    <p className="text-[9px] text-zinc-500 uppercase">Receipt No</p>
                    <p className="text-xs font-semibold text-zinc-200 font-mono">REC-{user.id.substring(0, 6).toUpperCase()}</p>
                  </div>
                </div>

                <div className="space-y-3.5 text-xs text-left border-b border-white/5 pb-4 mb-4">
                  <div className="flex justify-between">
                    <span className="text-zinc-500">Attendee Name</span>
                    <span className="font-semibold text-zinc-200">{user.name}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-zinc-500">College</span>
                    <span className="font-semibold text-zinc-200">{user.college}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-zinc-500">Registered Email</span>
                    <span className="font-semibold text-zinc-200">{user.email}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-zinc-500">Reference Txn ID</span>
                    <span className="font-semibold text-zinc-200 font-mono text-[10px]">{user.paymentId || 'pay_simulated'}</span>
                  </div>
                  {user.couponUsed && (
                    <div className="flex justify-between text-emerald-400">
                      <span>Coupon Applied</span>
                      <span>{user.couponUsed}</span>
                    </div>
                  )}
                </div>

                <div className="flex justify-between items-center text-left">
                  <div>
                    <p className="text-[9px] text-zinc-500 uppercase">Amount Paid</p>
                    <p className="text-2xl font-extrabold text-white font-mono">₹{user.amountPaid || '1000'}</p>
                  </div>
                  {/* Event Check-in QR */}
                  <div className="h-20 w-20 bg-white p-1 rounded-xl shadow-lg border border-white/5">
                    <img
                      src={`https://quickchart.io/qr?text=${encodeURIComponent(user.id)}&size=100&margin=1`}
                      alt="Check-in QR"
                      className="w-full h-full object-contain"
                    />
                  </div>
                </div>

                <div className="mt-6 pt-4 border-t border-white/5 text-[10px] text-zinc-500 text-center leading-normal">
                  Show this check-in QR code at the registration desk for instant manual QR verification.
                </div>
              </div>

              <div className="max-w-xl mx-auto flex gap-4 justify-center">
                <button
                  onClick={printReceipt}
                  className="px-6 py-2.5 rounded-xl border border-white/10 hover:border-white/20 bg-white/5 hover:bg-white/10 text-white font-bold text-xs flex items-center gap-2 cursor-pointer transition-all shadow-inner"
                >
                  <Download className="h-4.5 w-4.5" />
                  Print Receipt / PDF
                </button>
              </div>
            </div>
          )}

          {/* --- TAB 4: CERTIFICATES UNLOCKED --- */}
          {activeTab === 'certificate' && (
            <div className="space-y-6 animate-[fadeIn_0.2s_ease-out] text-center">
              {!user.checkedIn ? (
                <div className="glass-panel border-white/5 p-12 rounded-3xl max-w-xl mx-auto">
                  <Award className="h-12 w-12 text-zinc-600 mx-auto mb-4" />
                  <h3 className="text-lg font-bold text-white">Certificates Locked</h3>
                  <p className="text-xs text-zinc-500 mt-2 max-w-sm mx-auto leading-relaxed">
                    Participation certificates are unlocked automatically after you scan your QR code check-in at the Cohort event registration desk.
                  </p>
                  <div className="mt-8 p-4 rounded-xl border border-white/5 bg-white/[0.01] flex items-center gap-3 text-left">
                    <Shield className="h-5 w-5 text-purple-400 flex-shrink-0" />
                    <p className="text-[10px] text-zinc-400">
                      Are you at the venue? Head over to the admin desk, show your ticket QR, and get checked in to unlock this tab instantly.
                    </p>
                  </div>
                </div>
              ) : (
                /* checked in -> display certificate */
                <div className="space-y-6">
                  {/* Certificate Frame */}
                  <div className="border border-yellow-500/20 bg-[#0d0d1f]/90 p-8 sm:p-12 rounded-3xl max-w-3xl mx-auto relative overflow-hidden shadow-2xl text-left border-double border-4">
                    {/* Glowing ring borders */}
                    <div className="absolute top-0 left-[50%] transform -translate-x-[50%] h-[1px] w-[90%] bg-gradient-to-r from-transparent via-yellow-500/50 to-transparent" />
                    
                    <div className="text-center space-y-6">
                      <span className="text-[10px] text-yellow-400 font-bold uppercase tracking-widest font-mono">CERTIFICATE OF PARTICIPATION</span>
                      
                      <div className="space-y-2">
                        <h1 className="text-3xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-yellow-100 via-yellow-300 to-amber-200 tracking-wide font-serif">DESIGNATHON 2026</h1>
                        <p className="text-[10px] text-zinc-500 uppercase tracking-wider">COHORT, HYDERABAD, INDIA</p>
                      </div>

                      <div className="py-4 space-y-3.5 max-w-md mx-auto">
                        <p className="text-xs text-zinc-400 leading-relaxed">
                          This is to certify that the creative design capabilities of
                        </p>
                        <h2 className="text-xl font-bold text-white border-b border-white/10 pb-2 max-w-xs mx-auto tracking-wide">{user.name}</h2>
                        <p className="text-xs text-zinc-400 leading-relaxed">
                          from <strong className="text-zinc-300 font-semibold">{user.college}</strong> has been successfully recognized for participation and contribution in the 2-day design hackathon at DESIGNATHON 2026.
                        </p>
                      </div>

                      {/* Signatures */}
                      <div className="grid grid-cols-2 gap-8 pt-8 max-w-sm mx-auto border-t border-white/5">
                        <div className="text-center">
                          <p className="font-mono text-zinc-400 text-xs italic font-semibold">Uday Sangisetti</p>
                          <p className="text-[9px] text-zinc-500 uppercase tracking-wider mt-1 border-t border-white/5 pt-1">Founder, ArtArtist</p>
                        </div>
                        <div className="text-center">
                          <p className="font-mono text-zinc-400 text-xs italic font-semibold">Lavanya Pasunoori</p>
                          <p className="text-[9px] text-zinc-500 uppercase tracking-wider mt-1 border-t border-white/5 pt-1">Founder, Value Laden</p>
                        </div>
                      </div>
                    </div>
                  </div>

                  <button
                    onClick={printReceipt}
                    className="px-6 py-2.5 rounded-xl border border-yellow-500/20 bg-yellow-500/5 hover:bg-yellow-500/10 text-yellow-400 font-bold text-xs flex items-center gap-2 cursor-pointer transition-all mx-auto"
                  >
                    <Download className="h-4.5 w-4.5" />
                    Download PDF Certificate
                  </button>
                </div>
              )}
            </div>
          )}

        </main>
      </div>

      <style jsx>{`
        @keyframes fadeIn {
          from { opacity: 0; transform: translateY(5px); }
          to { opacity: 1; transform: translateY(0); }
        }
      `}</style>
    </div>
  );
}
