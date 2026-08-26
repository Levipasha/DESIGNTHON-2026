'use client';

import React, { useState, useEffect, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { useAuth } from '../../../context/AuthContext';
import { useSocket } from '../../../context/SocketContext';
import { Sparkles, Users, School, User, ArrowRight, CheckCircle2, ShieldAlert, Loader } from 'lucide-react';

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
  joinRequests: any[];
}

function JoinTeamDetails() {
  const router = useSearchParams();
  const teamId = router.get('teamId');
  const nextRouter = useRouter();
  
  const { user, token, loading: authLoading } = useAuth();
  const { addToast, socket } = useSocket();

  const [team, setTeam] = useState<Team | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  useEffect(() => {
    if (!teamId) {
      setError('Invalid invite link. Missing Team ID.');
      setLoading(false);
      return;
    }

    const fetchTeam = async () => {
      try {
        const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/public/teams/${teamId}`);
        const data = await res.json();
        
        if (res.ok) {
          setTeam(data);
          // Check if this user already requested
          if (user && data.joinRequests?.some((r: any) => r.userId === user.id && r.status === 'pending')) {
            setSubmitted(true);
          }
        } else {
          setError(data.message || 'Team not found.');
        }
      } catch (err) {
        console.error('Error fetching team details:', err);
        setError('Could not connect to the server.');
      } finally {
        setLoading(false);
      }
    };

    fetchTeam();
  }, [teamId, user]);

  const handleJoinRequest = async () => {
    if (!user) {
      addToast('Authentication Required', 'Please log in to accept this invitation.', 'warning');
      nextRouter.push('/login');
      return;
    }

    if (user.paymentStatus !== 'paid') {
      addToast('Payment Required', 'You must complete the registration payment before joining a team.', 'warning');
      nextRouter.push('/register');
      return;
    }

    if (user.teamId) {
      addToast('Action Prohibited', 'You are already in a team. Leave your current team first.', 'warning');
      return;
    }

    if (!team) return;

    setSubmitting(true);
    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/teams/join-request`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ teamId: team.id }),
      });

      const data = await res.json();

      if (res.ok && data.success) {
        setSubmitted(true);
        addToast('Request Dispatched', `Join request sent to ${team.leaderName}.`, 'success');

        // Emit instant socket event for real-time notification
        if (socket) {
          socket.emit('new_join_request', {
            leaderId: team.leaderId,
            teamId: team.id,
            requesterName: user.name,
          });
        }
      } else {
        addToast('Request Failed', data.message || 'Unable to request to join team.', 'warning');
      }
    } catch (err) {
      console.error(err);
      addToast('Connection Error', 'Failed to dispatch request to leader.', 'warning');
    } finally {
      setSubmitting(false);
    }
  };

  if (loading || authLoading) {
    return (
      <div className="flex flex-col items-center gap-3 py-20 text-zinc-500">
        <Loader className="h-6 w-6 animate-spin" />
        <span className="text-xs font-semibold">Retrieving invitation details...</span>
      </div>
    );
  }

  if (error) {
    return (
      <div className="glass-panel border-white/5 p-8 rounded-3xl max-w-md mx-auto text-center">
        <ShieldAlert className="h-12 w-12 text-rose-500 mx-auto mb-4" />
        <h3 className="text-lg font-bold text-white">Invitation Error</h3>
        <p className="text-xs text-zinc-500 mt-2 mb-6">{error}</p>
        <button
          id="btn-goto-teams"
          onClick={() => nextRouter.push('/teams')}
          className="px-6 py-2.5 bg-white text-black font-bold text-xs rounded-xl shadow-lg hover:bg-zinc-200 transition-all cursor-pointer flex items-center justify-center gap-2 mx-auto"
        >
          Browse Public Teams
          <ArrowRight className="h-4 w-4" />
        </button>
      </div>
    );
  }

  if (!team) return null;

  const isFull = team.status === 'full' || team.remainingSlots <= 0;

  return (
    <div className="glass-panel border-white/5 rounded-3xl p-8 relative overflow-hidden backdrop-blur-2xl shadow-2xl max-w-md mx-auto">
      <div className="absolute top-0 left-[50%] transform -translate-x-[50%] h-[1px] w-[80%] bg-gradient-to-r from-transparent via-white/20 to-transparent" />

      {/* Header icon */}
      <div className="flex justify-center mb-6">
        <div className="w-14 h-14 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-center">
          <Users className="h-6 w-6 text-white" />
        </div>
      </div>

      <h1 className="text-xl font-bold text-white text-center tracking-tight">{team.name}</h1>
      <p className="text-[11px] text-zinc-500 text-center mt-1">
        Invite to join team at <strong className="text-zinc-300">{team.college}</strong>
      </p>

      {/* Team Specs Card */}
      <div className="my-6 p-4 rounded-2xl border border-white/5 bg-[#050514]/40 space-y-4 text-left">
        <div className="flex gap-3 items-start">
          <School className="h-4 w-4 text-zinc-500 shrink-0 mt-0.5" />
          <div>
            <h4 className="text-[10px] text-zinc-500 font-bold uppercase tracking-wider">Institution</h4>
            <p className="text-xs text-zinc-200 font-medium mt-0.5">{team.college}</p>
          </div>
        </div>

        <div className="flex gap-3 items-start">
          <User className="h-4 w-4 text-zinc-500 shrink-0 mt-0.5" />
          <div>
            <h4 className="text-[10px] text-zinc-500 font-bold uppercase tracking-wider">Team Leader</h4>
            <p className="text-xs text-zinc-200 font-medium mt-0.5">{team.leaderName}</p>
          </div>
        </div>

        {team.description && (
          <div className="flex gap-3 items-start">
            <Users className="h-4 w-4 text-zinc-500 shrink-0 mt-0.5" />
            <div>
              <h4 className="text-[10px] text-zinc-500 font-bold uppercase tracking-wider">Vision / Focus</h4>
              <p className="text-xs text-zinc-400 mt-1 leading-relaxed">{team.description}</p>
            </div>
          </div>
        )}

        <div className="border-t border-white/5 pt-3 flex justify-between items-center text-xs">
          <span className="text-zinc-500">Remaining Slots</span>
          <span className="font-bold text-zinc-200 font-mono">{team.remainingSlots} Slots Left</span>
        </div>
      </div>

      {/* Interactive Actions based on Auth Context */}
      {!user ? (
        <div className="space-y-4">
          <div className="flex gap-2.5 items-start bg-amber-950/20 border border-amber-500/30 text-amber-300 text-xxs p-3 rounded-xl text-left leading-normal">
            <ShieldAlert className="h-4 w-4 shrink-0 text-amber-400 mt-0.5" />
            <span>You must sign in with Google and complete individual registration payment before requesting to join.</span>
          </div>
          <button
            id="btn-login-to-join"
            onClick={() => nextRouter.push(`/login?redirect=/teams/join?teamId=${team.id}`)}
            className="w-full py-3 px-4 rounded-xl bg-white hover:bg-zinc-100 text-black font-bold text-xs transition-all flex items-center justify-center gap-1.5 cursor-pointer active:scale-[0.98]"
          >
            Sign In with Google to Join
            <ArrowRight className="h-4 w-4" />
          </button>
        </div>
      ) : user.paymentStatus !== 'paid' ? (
        <div className="space-y-4">
          <div className="flex gap-2.5 items-start bg-rose-950/20 border border-rose-500/30 text-rose-300 text-xxs p-3 rounded-xl text-left leading-normal">
            <ShieldAlert className="h-4 w-4 shrink-0 text-rose-400 mt-0.5" />
            <span>Payment pending. Every member must complete the ₹1000 registration fee before joining a team.</span>
          </div>
          <button
            id="btn-register-payment"
            onClick={() => nextRouter.push('/register')}
            className="w-full py-3 px-4 rounded-xl bg-white hover:bg-zinc-100 text-black font-bold text-xs transition-all flex items-center justify-center gap-1.5 cursor-pointer active:scale-[0.98]"
          >
            Proceed to Payment (₹1000)
            <ArrowRight className="h-4 w-4" />
          </button>
        </div>
      ) : user.teamId ? (
        <div className="space-y-4">
          <div className="flex gap-2.5 items-start bg-purple-950/20 border border-purple-500/30 text-purple-300 text-xxs p-3 rounded-xl text-left leading-normal">
            <CheckCircle2 className="h-4 w-4 shrink-0 text-purple-400 mt-0.5" />
            <span>You are already a member of a team. To join another, you must leave your current team first.</span>
          </div>
          <button
            id="btn-goto-dashboard"
            onClick={() => nextRouter.push('/dashboard?tab=team')}
            className="w-full py-3 px-4 rounded-xl border border-white/10 bg-white/5 text-zinc-200 hover:text-white hover:bg-white/10 font-bold text-xs transition-all flex items-center justify-center gap-1.5 cursor-pointer"
          >
            Go to Team Dashboard
          </button>
        </div>
      ) : isFull ? (
        <div className="space-y-4">
          <div className="flex gap-2.5 items-start bg-zinc-900 border border-zinc-700 text-zinc-400 text-xxs p-3 rounded-xl text-left leading-normal">
            <ShieldAlert className="h-4 w-4 shrink-0 text-zinc-500 mt-0.5" />
            <span>This team has already filled all its slots (maximum 4 members).</span>
          </div>
          <button
            disabled
            className="w-full py-3 px-4 rounded-xl bg-zinc-900 text-zinc-600 font-bold text-xs border border-white/5"
          >
            Team Full
          </button>
        </div>
      ) : submitted ? (
        <div className="space-y-4">
          <div className="flex gap-2.5 items-start bg-emerald-950/20 border border-emerald-500/30 text-emerald-300 text-xxs p-3 rounded-xl text-left leading-normal">
            <CheckCircle2 className="h-4 w-4 shrink-0 text-emerald-400 mt-0.5" />
            <span>Your request to join has been sent. The team leader ({team.leaderName}) must approve it.</span>
          </div>
          <button
            id="btn-goto-overview"
            onClick={() => nextRouter.push('/dashboard')}
            className="w-full py-3 px-4 rounded-xl bg-white text-black hover:bg-zinc-200 font-bold text-xs transition-all flex items-center justify-center gap-1.5 cursor-pointer"
          >
            Go to Overview Dashboard
          </button>
        </div>
      ) : (
        <button
          id="btn-request-join"
          onClick={handleJoinRequest}
          disabled={submitting}
          className="w-full py-3.5 px-4 rounded-xl bg-white hover:bg-zinc-100 text-black font-bold text-xs transition-all flex items-center justify-center gap-1.5 cursor-pointer disabled:opacity-50 active:scale-[0.98]"
        >
          {submitting ? (
            <Loader className="h-4 w-4 animate-spin" />
          ) : (
            <Users className="h-4 w-4" />
          )}
          {submitting ? 'Sending Join Request…' : 'Request to Join Team'}
        </button>
      )}
    </div>
  );
}

export default function JoinTeamPage() {
  return (
    <div className="flex-1 w-full bg-[#03030f] bg-grid relative overflow-hidden py-24 px-4 sm:px-6 lg:px-8 flex items-center justify-center min-h-[80vh]">
      {/* Decorative ambient glows */}
      <div className="absolute top-[-10%] left-[-15%] w-[45%] h-[45%] rounded-full bg-purple-900/10 blur-[100px] pointer-events-none" />
      <div className="absolute bottom-[-10%] right-[-15%] w-[45%] h-[45%] rounded-full bg-blue-900/10 blur-[100px] pointer-events-none" />

      <div className="max-w-xl w-full text-center relative z-10 space-y-8">
        {/* SEO friendly single h1 for header section */}
        <div className="space-y-3">
          <div className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-3 py-1 text-[11px] font-semibold text-zinc-400 backdrop-blur-md mb-2">
            <Sparkles className="h-3 w-3 animate-pulse" />
            DESIGNATHON 2026 Matchmaking
          </div>
          <h2 className="text-3xl font-extrabold text-white tracking-tight">Team Invitation</h2>
        </div>

        <Suspense fallback={
          <div className="flex flex-col items-center gap-3 py-20 text-zinc-500">
            <Loader className="h-6 w-6 animate-spin" />
            <span className="text-xs">Loading invitation details...</span>
          </div>
        }>
          <JoinTeamDetails />
        </Suspense>
      </div>
    </div>
  );
}
