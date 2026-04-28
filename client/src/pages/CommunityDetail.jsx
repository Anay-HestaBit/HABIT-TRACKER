import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  AlertTriangle,
  CheckCircle2,
  Crown,
  Loader2,
  Pencil,
  Shield,
  ShieldCheck,
  Trash2,
  Users,
} from 'lucide-react';
import api from '../api/axios';
import { useToast } from '../context/ToastContext';
import { useAuth } from '../context/AuthContext';

const CommunityDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const { pushToast } = useToast();
  const [community, setCommunity] = useState(null);
  const [habits, setHabits] = useState([]);
  const [leaderboard, setLeaderboard] = useState([]);
  const [leaderboardRange, setLeaderboardRange] = useState(7);
  const [loading, setLoading] = useState(true);
  const [accessDenied, setAccessDenied] = useState(false);
  const [accessMessage, setAccessMessage] = useState('');
  const [accessInviteCode, setAccessInviteCode] = useState('');
  const [newHabitName, setNewHabitName] = useState('');
  const [newHabitDescription, setNewHabitDescription] = useState('');
  const [communityName, setCommunityName] = useState('');
  const [communityDescription, setCommunityDescription] = useState('');
  const [confirmAction, setConfirmAction] = useState(null);
  const [confirmStep, setConfirmStep] = useState(1);
  const [confirmInput, setConfirmInput] = useState('');
  const [processing, setProcessing] = useState(false);

  const shieldAvailable = Boolean(community?.streakShield?.available);
  const shieldResetsAt = community?.streakShield?.resetsAt
    ? new Date(community.streakShield.resetsAt)
    : null;

  const isOwner = community && user
    ? String(community.owner) === String(user._id)
    : false;
  const isAdmin = community && user
    ? community.members?.some((member) => {
      const memberId = member.userId?._id || member.userId;
      return String(memberId) === String(user._id) && (member.role === 'admin' || member.role === 'owner');
    })
    : false;

  const loadCommunity = async () => {
    setLoading(true);
    setAccessDenied(false);
    setAccessMessage('');
    try {
      const communityRes = await api.get(`/communities/${id}`);
      setCommunity(communityRes.data);
      setCommunityName(communityRes.data.name || '');
      setCommunityDescription(communityRes.data.description || '');

      const [habitsRes, leaderboardRes] = await Promise.all([
        api.get(`/communities/${id}/habits`),
        api.get(`/communities/${id}/leaderboard`, { params: { days: leaderboardRange } }),
      ]);
      setHabits(habitsRes.data.habits || []);
      setLeaderboard(leaderboardRes.data.leaderboard || []);
      setLeaderboardRange(leaderboardRes.data.rangeDays || leaderboardRange);
    } catch (err) {
      const status = err.response?.status;
      if (status === 403 || status === 401) {
        setAccessDenied(true);
        setAccessMessage(err.response?.data?.message || 'You are not a member of this community.');
      } else {
        pushToast({
          type: 'error',
          title: 'Community unavailable',
          message: err.response?.data?.message || 'Please try again.'
        });
        navigate('/community');
      }
    } finally {
      setLoading(false);
    }
  };

  const refreshLeaderboard = async () => {
    try {
      const { data } = await api.get(`/communities/${id}/leaderboard`, { params: { days: leaderboardRange } });
      setLeaderboard(data.leaderboard || []);
      setLeaderboardRange(data.rangeDays || leaderboardRange);
    } catch (err) {
      // Non-blocking: leaderboard can refresh later.
    }
  };

  useEffect(() => {
    loadCommunity();
  }, [id, leaderboardRange]);

  const openConfirm = (action) => {
    setConfirmAction(action);
    setConfirmStep(1);
    setConfirmInput('');
  };

  const closeConfirm = () => {
    setConfirmAction(null);
    setConfirmStep(1);
    setConfirmInput('');
  };

  const runConfirmedAction = async () => {
    if (!confirmAction) return;
    if (confirmAction.confirmText && confirmInput !== confirmAction.confirmText) return;

    setProcessing(true);
    try {
      await confirmAction.onConfirm();
      closeConfirm();
    } finally {
      setProcessing(false);
    }
  };

  const handleCreateHabit = async (e) => {
    e.preventDefault();
    if (!newHabitName.trim()) return;
    setProcessing(true);
    try {
      const { data } = await api.post(`/communities/${id}/habits`, {
        name: newHabitName,
        description: newHabitDescription,
        frequency: 'daily',
      });
      setHabits((prev) => [data.habit, ...prev]);
      setCommunity(data.community || community);
      setNewHabitName('');
      setNewHabitDescription('');
      pushToast({ type: 'success', title: 'Community habit added', message: 'Everyone can track it now.' });
    } catch (err) {
      pushToast({
        type: 'error',
        title: 'Habit failed',
        message: err.response?.data?.message || 'Please try again.'
      });
    } finally {
      setProcessing(false);
    }
  };

  const handleComplete = async (habitId) => {
    setProcessing(true);
    try {
      const { data } = await api.post(`/communities/${id}/habits/${habitId}/complete`);
      setHabits((prev) => prev.map((habit) => habit._id === habitId ? data.habit : habit));
      setCommunity(data.community || community);
      refreshLeaderboard();
      pushToast({ type: 'success', title: 'Marked complete', message: 'Community XP increased.' });
    } catch (err) {
      pushToast({
        type: 'error',
        title: 'Completion failed',
        message: err.response?.data?.message || 'Try again later.'
      });
    } finally {
      setProcessing(false);
    }
  };

  const handleUseShield = async (habitId) => {
    setProcessing(true);
    try {
      const { data } = await api.post(`/communities/${id}/habits/${habitId}/shield`);
      setHabits((prev) => prev.map((habit) => habit._id === habitId ? data.habit : habit));
      setCommunity(data.community || community);
      refreshLeaderboard();
      pushToast({ type: 'success', title: 'Community shield used', message: 'Shared streak protected.' });
    } catch (err) {
      pushToast({
        type: 'error',
        title: 'Shield unavailable',
        message: err.response?.data?.message || 'Try again later.'
      });
    } finally {
      setProcessing(false);
    }
  };

  const handleSaveCommunity = () => {
    const payload = { name: communityName };
    if (isAdmin) payload.description = communityDescription;

    openConfirm({
      title: 'Update community?',
      message: isAdmin
        ? 'This will update the community name and details for every member.'
        : 'This will update the community name for every member.',
      tone: 'primary',
      onConfirm: async () => {
        try {
          const { data } = await api.patch(`/communities/${id}`, payload);
          setCommunity(data.community);
          pushToast({ type: 'success', title: 'Community updated', message: 'Changes are live for members.' });
        } catch (err) {
          pushToast({ type: 'error', title: 'Update failed', message: err.response?.data?.message || 'Try again.' });
        }
      },
    });
  };

  const handleApprove = async (userId, username = 'this user') => {
    openConfirm({
      title: 'Approve request?',
      message: `${username} will join this community and see member activity.`,
      tone: 'primary',
      onConfirm: async () => {
        try {
          const { data } = await api.post(`/communities/${id}/approve`, { userId });
          setCommunity(data.community);
          pushToast({ type: 'success', title: 'Request approved', message: 'New member added.' });
        } catch (err) {
          pushToast({ type: 'error', title: 'Approval failed', message: err.response?.data?.message || 'Try again.' });
        }
      },
    });
  };

  const handleReject = async (userId, username = 'this user') => {
    openConfirm({
      title: 'Reject request?',
      message: `${username} will not be added to this community.`,
      tone: 'danger',
      onConfirm: async () => {
        try {
          const { data } = await api.post(`/communities/${id}/reject`, { userId });
          setCommunity(data.community);
          pushToast({ type: 'success', title: 'Request rejected', message: 'The request was declined.' });
        } catch (err) {
          pushToast({ type: 'error', title: 'Rejection failed', message: err.response?.data?.message || 'Try again.' });
        }
      },
    });
  };

  const handleRoleChange = async (userId, role, username = 'this member') => {
    openConfirm({
      title: 'Change member role?',
      message: `${username} will become ${role}. This changes their community permissions.`,
      tone: 'primary',
      onConfirm: async () => {
        try {
          const { data } = await api.post(`/communities/${id}/role`, { userId, role });
          setCommunity(data.community);
          pushToast({ type: 'success', title: 'Role updated', message: 'Member permissions changed.' });
        } catch (err) {
          pushToast({ type: 'error', title: 'Role update failed', message: err.response?.data?.message || 'Try again.' });
        }
      },
    });
  };

  const handleRemoveMember = async (userId, username = 'Member') => {
    openConfirm({
      title: 'Remove member?',
      message: `${username} will lose access to this community.`,
      confirmText: username,
      tone: 'danger',
      onConfirm: async () => {
        try {
          const { data } = await api.post(`/communities/${id}/remove`, { userId });
          setCommunity(data.community);
          pushToast({ type: 'success', title: 'Member removed', message: 'They no longer have access.' });
        } catch (err) {
          pushToast({ type: 'error', title: 'Removal failed', message: err.response?.data?.message || 'Try again.' });
        }
      },
    });
  };

  const handleLeave = async () => {
    openConfirm({
      title: 'Leave community?',
      message: 'You will lose access to shared habits, chat, and leaderboard history for this community.',
      confirmText: 'LEAVE',
      tone: 'danger',
      onConfirm: async () => {
        try {
          await api.post(`/communities/${id}/leave`);
          pushToast({ type: 'success', title: 'Left community', message: 'You can rejoin later.' });
          navigate('/community');
        } catch (err) {
          pushToast({ type: 'error', title: 'Unable to leave', message: err.response?.data?.message || 'Try again.' });
        }
      },
    });
  };

  const handleDeleteCommunity = async () => {
    openConfirm({
      title: 'Delete community?',
      message: 'This permanently deletes the community, chat messages, shared habits, leaderboard data, and join requests.',
      confirmText: community.name,
      tone: 'danger',
      onConfirm: async () => {
        try {
          await api.delete(`/communities/${id}`);
          pushToast({ type: 'success', title: 'Community deleted', message: 'The community was removed.' });
          navigate('/community');
        } catch (err) {
          pushToast({ type: 'error', title: 'Delete failed', message: err.response?.data?.message || 'Try again.' });
        }
      },
    });
  };

  const handleRequestAccess = async () => {
    if (!accessInviteCode.trim()) return;
    setProcessing(true);
    try {
      await api.post('/communities/join', { code: accessInviteCode });
      pushToast({
        type: 'success',
        title: 'Request sent',
        message: 'The owner will approve it soon.'
      });
      navigate('/community');
    } catch (err) {
      pushToast({
        type: 'error',
        title: 'Request failed',
        message: err.response?.data?.message || 'Check the code and try again.'
      });
    } finally {
      setProcessing(false);
    }
  };

  if (loading) {
    return (
      <div className="h-[60vh] flex flex-col items-center justify-center gap-3">
        <Loader2 className="animate-spin text-primary" size={36} />
        <p className="text-muted-foreground">Loading community...</p>
      </div>
    );
  }

  if (accessDenied) {
    return (
      <div className="space-y-6">
        <div className="glass p-8 rounded-[2rem] border border-white/10 max-w-xl">
          <h1 className="text-2xl font-black mb-2">Access required</h1>
          <p className="text-muted-foreground mb-6">{accessMessage}</p>
          <div className="space-y-3 mb-6">
            <label className="text-xs font-black uppercase tracking-widest text-muted-foreground">Invite code</label>
            <input
              value={accessInviteCode}
              onChange={(e) => setAccessInviteCode(e.target.value)}
              placeholder="Enter invite code"
              className="w-full bg-secondary/50 border border-secondary/60 rounded-2xl px-4 py-3 text-foreground uppercase tracking-widest"
            />
            <button
              onClick={handleRequestAccess}
              disabled={processing || !accessInviteCode.trim()}
              className="w-full px-6 py-3 rounded-2xl bg-primary text-primary-foreground font-bold disabled:opacity-50"
            >
              Request access
            </button>
          </div>
          <button
            onClick={() => navigate('/community')}
            className="px-6 py-3 rounded-2xl bg-secondary text-foreground font-bold"
          >
            Back to Community Hub
          </button>
        </div>
      </div>
    );
  }

  if (!community) return null;

  const auditLabel = (entry) => {
    switch (entry.action) {
      case 'approve_request':
        return 'Approved a join request';
      case 'reject_request':
        return 'Rejected a join request';
      case 'remove_member':
        return 'Removed a member';
      case 'update_role':
        return `Updated role to ${entry.meta?.role || 'member'}`;
      case 'update_community':
        return 'Updated community details';
      default:
        return 'Updated community';
    }
  };

  const isCompletedToday = (habit) => {
    const today = new Date();
    today.setUTCHours(0, 0, 0, 0);
    return habit.completions?.some(c => {
      if (String(c.userId) !== String(user?._id)) return false;
      const d = new Date(c.date);
      d.setUTCHours(0, 0, 0, 0);
      return d.getTime() === today.getTime();
    });
  };

  const leaderboardUserIds = new Set(leaderboard.map((entry) => String(entry.user?._id)));
  const quietMembers = (community.members || [])
    .filter((member) => !leaderboardUserIds.has(String(member.userId?._id || member.userId)))
    .slice(0, 4);
  const completedInRange = leaderboard.reduce((total, entry) => total + (entry.rangeCompletions || 0), 0);

  return (
    <div className="space-y-10">
      <header className="flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div>
          <h1 className="text-4xl font-black mb-2">{community.name}</h1>
          <p className="text-muted-foreground font-medium">{community.description || 'Shared community habits'}</p>
          <p className="text-xs text-muted-foreground mt-2 uppercase tracking-widest">
            Invite code: {community.inviteCode}
          </p>
        </div>
        <div className="flex items-center gap-3">
          <button
            onClick={() => navigate(`/community/${id}/chat`)}
            className="px-5 py-3 rounded-2xl bg-primary text-primary-foreground font-bold"
          >
            Open chat
          </button>
          <button
            onClick={handleLeave}
            disabled={processing || isOwner}
            className="px-5 py-3 rounded-2xl bg-secondary text-foreground font-bold disabled:opacity-50"
          >
            {isOwner ? 'Owner cannot leave' : 'Leave community'}
          </button>
        </div>
      </header>

      <div className="grid lg:grid-cols-3 gap-6">
        <div className="glass p-5 rounded-2xl border border-white/10 lg:col-span-2">
          <div className="flex items-center gap-2 mb-4">
            <Pencil size={18} className="text-primary" />
            <h2 className="text-lg font-black">Community profile</h2>
          </div>
          <div className="grid md:grid-cols-[1fr_1.4fr_auto] gap-3">
            <input
              value={communityName}
              onChange={(e) => setCommunityName(e.target.value)}
              placeholder="Community name"
              className="bg-secondary/50 border border-secondary/60 rounded-xl px-4 py-3 text-foreground"
            />
            <input
              value={communityDescription}
              onChange={(e) => setCommunityDescription(e.target.value)}
              placeholder={isAdmin ? 'Community details' : 'Only admins can edit details'}
              disabled={!isAdmin}
              className="bg-secondary/50 border border-secondary/60 rounded-xl px-4 py-3 text-foreground disabled:opacity-60"
            />
            <button
              onClick={handleSaveCommunity}
              disabled={processing || !communityName.trim()}
              className="px-5 py-3 rounded-xl bg-primary text-primary-foreground font-bold disabled:opacity-50"
            >
              Save
            </button>
          </div>
          <p className="mt-3 text-xs text-muted-foreground">
            Any member can update the name. Community details and destructive actions are admin-controlled.
          </p>
        </div>

        {isAdmin && (
          <div className="glass p-5 rounded-2xl border border-rose-500/20 bg-rose-500/5">
            <div className="flex items-start gap-3">
              <AlertTriangle className="text-rose-300 mt-1" size={20} />
              <div>
                <h2 className="font-black text-foreground">Danger zone</h2>
                <p className="text-sm text-muted-foreground mt-1 mb-4">
                  Delete this community and all shared data.
                </p>
                <button
                  onClick={handleDeleteCommunity}
                  disabled={processing}
                  className="flex items-center gap-2 px-4 py-2 rounded-xl bg-rose-500/15 text-rose-200 font-bold"
                >
                  <Trash2 size={16} /> Delete community
                </button>
              </div>
            </div>
          </div>
        )}
      </div>

      <div className="grid lg:grid-cols-3 gap-6">
        <div className="glass p-6 rounded-[2rem] border border-white/10 lg:col-span-2">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-black">Community habits</h2>
            <div className="text-xs font-bold text-muted-foreground flex items-center gap-1">
              <Users size={14} /> {community.members?.length || 0}
            </div>
          </div>

          <form onSubmit={handleCreateHabit} className="grid md:grid-cols-2 gap-3 mb-6">
            <input
              value={newHabitName}
              onChange={(e) => setNewHabitName(e.target.value)}
              placeholder="New habit"
              className="bg-secondary/50 border border-secondary/60 rounded-2xl px-4 py-3 text-foreground"
            />
            <input
              value={newHabitDescription}
              onChange={(e) => setNewHabitDescription(e.target.value)}
              placeholder="Description"
              className="bg-secondary/50 border border-secondary/60 rounded-2xl px-4 py-3 text-foreground"
            />
            <button
              type="submit"
              disabled={processing}
              className="md:col-span-2 px-4 py-3 rounded-2xl bg-primary text-primary-foreground font-bold"
            >
              Add community habit
            </button>
          </form>

          <div className="space-y-3">
            {habits.map((habit) => (
              <div key={habit._id} className="flex items-center justify-between p-4 rounded-2xl bg-secondary/40 border border-white/5">
                <div>
                  <p className="font-bold text-foreground">{habit.name}</p>
                  <p className="text-xs text-muted-foreground">{habit.description || 'Shared habit'}</p>
                </div>
                <div className="flex items-center gap-2">
                  {shieldAvailable && !isCompletedToday(habit) && (
                    <button
                      onClick={() => handleUseShield(habit._id)}
                      disabled={processing}
                      className="px-3 py-2 rounded-xl bg-indigo-500/10 text-indigo-300 font-bold"
                      title="Use community shield"
                    >
                      <Shield size={16} />
                    </button>
                  )}
                  <button
                    onClick={() => handleComplete(habit._id)}
                    disabled={processing || isCompletedToday(habit)}
                    className={`px-4 py-2 rounded-xl font-bold flex items-center gap-2 ${
                      isCompletedToday(habit)
                        ? 'bg-emerald-500/10 text-emerald-400 cursor-default'
                        : 'bg-primary text-primary-foreground'
                    }`}
                  >
                    <CheckCircle2 size={16} /> {isCompletedToday(habit) ? 'Done' : 'Complete'}
                  </button>
                </div>
              </div>
            ))}
            {habits.length === 0 && (
              <p className="text-sm text-muted-foreground">No community habits yet. Add the first one.</p>
            )}
          </div>
        </div>

        <div className="space-y-6">
          <div className="glass p-6 rounded-[2rem] border border-white/10">
            <h3 className="text-lg font-black mb-3">Community world</h3>
            <p className="text-sm text-muted-foreground">Level {community.level} · {community.xp} XP</p>
            <p className="text-xs text-muted-foreground mt-2">Season: {community.worldState?.season}</p>
            <p className="text-xs text-muted-foreground">Leaves: {community.worldState?.leaves}</p>
          </div>

          <div className="glass p-6 rounded-[2rem] border border-white/10">
            <h3 className="text-lg font-black mb-3">Community shield</h3>
            <p className="text-sm text-muted-foreground">
              {shieldAvailable ? 'Shield ready to use.' : 'Shield on cooldown.'}
            </p>
            {shieldResetsAt && !shieldAvailable && (
              <p className="text-xs text-muted-foreground mt-2">
                Resets {shieldResetsAt.toLocaleDateString()}
              </p>
            )}
          </div>

          <div className="glass p-6 rounded-[2rem] border border-white/10">
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-lg font-black">Top members</h3>
              <div className="flex items-center gap-2 text-xs">
                <button
                  onClick={() => setLeaderboardRange(7)}
                  className={leaderboardRange === 7
                    ? 'px-2 py-1 rounded-lg bg-secondary text-foreground font-bold'
                    : 'px-2 py-1 rounded-lg bg-secondary/60 text-foreground'}
                >
                  7d
                </button>
                <button
                  onClick={() => setLeaderboardRange(30)}
                  className={leaderboardRange === 30
                    ? 'px-2 py-1 rounded-lg bg-secondary text-foreground font-bold'
                    : 'px-2 py-1 rounded-lg bg-secondary/60 text-foreground'}
                >
                  30d
                </button>
              </div>
            </div>
            {leaderboard.length ? (
              <div className="space-y-2">
                {leaderboard.map((entry, index) => (
                  <div key={entry.user?._id || index} className="flex items-center justify-between text-sm">
                    <div className="flex items-center gap-2">
                      <span className="text-muted-foreground">#{index + 1}</span>
                      <span className="font-bold text-foreground">{entry.user?.username || 'Member'}</span>
                    </div>
                    <span className="text-muted-foreground">{entry.rangeCompletions} {leaderboardRange}d</span>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-sm text-muted-foreground">No completions yet.</p>
            )}
          </div>

          <div className="glass p-6 rounded-[2rem] border border-white/10">
            <h3 className="text-lg font-black mb-3">Community badges</h3>
            {community.badges?.length ? (
              <div className="space-y-2">
                {community.badges.map((badge) => (
                  <div key={badge.name} className="flex items-center gap-2 text-sm text-primary">
                    <ShieldCheck size={16} /> {badge.name}
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-sm text-muted-foreground">No badges yet.</p>
            )}
          </div>

          <div className="glass p-4 lg:p-5 rounded-2xl border border-white/10">
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-base font-black">Members</h3>
              <span className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">
                {community.members?.length || 0} total
              </span>
            </div>
            <div className="space-y-1.5 max-h-[360px] overflow-y-auto pr-1">
              {community.members?.map((member) => {
                const memberId = member.userId?._id || member.userId;
                const username = member.userId?.username || 'Member';
                const canManageMember = isAdmin
                  && member.role !== 'owner'
                  && String(memberId) !== String(user?._id)
                  && (isOwner || member.role !== 'admin');

                return (
                  <div
                    key={memberId}
                    className="flex items-center justify-between gap-3 rounded-xl bg-secondary/30 px-3 py-2 text-sm"
                  >
                    <div className="flex min-w-0 items-center gap-2">
                      {member.role === 'owner' ? <Crown size={14} className="text-amber-400" /> : <Users size={14} />}
                      <div className="min-w-0">
                        <p className="truncate font-bold text-foreground">{username}</p>
                        <p className="text-[10px] uppercase tracking-widest text-muted-foreground">{member.role}</p>
                      </div>
                    </div>
                    {canManageMember && (
                      <div className="flex shrink-0 items-center gap-1.5">
                        {isOwner && (
                          <button
                            onClick={() => handleRoleChange(memberId, member.role === 'admin' ? 'member' : 'admin', username)}
                            disabled={processing}
                            className="px-2.5 py-1 rounded-lg bg-secondary text-foreground font-bold text-xs"
                          >
                            {member.role === 'admin' ? 'Member' : 'Admin'}
                          </button>
                        )}
                        <button
                          onClick={() => handleRemoveMember(memberId, username)}
                          disabled={processing}
                          className="px-2.5 py-1 rounded-lg bg-rose-500/10 text-rose-300 font-bold text-xs"
                        >
                          Remove
                        </button>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>

          {isAdmin && community.pendingRequests?.length > 0 && (
            <div className="glass p-6 rounded-[2rem] border border-white/10">
              <h3 className="text-lg font-black mb-3">Pending requests</h3>
              <div className="space-y-2">
                {community.pendingRequests.map((request) => (
                  <div key={request.userId?._id || request.userId} className="flex items-center justify-between text-sm">
                    <span>{request.userId?.username || 'User'}</span>
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => handleApprove(request.userId?._id || request.userId, request.userId?.username || 'User')}
                        disabled={processing}
                        className="px-3 py-1 rounded-lg bg-secondary text-foreground font-bold"
                      >
                        Approve
                      </button>
                      <button
                        onClick={() => handleReject(request.userId?._id || request.userId, request.userId?.username || 'User')}
                        disabled={processing}
                        className="px-3 py-1 rounded-lg bg-secondary/60 text-foreground font-bold"
                      >
                        Reject
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {isAdmin && community.auditLog?.length > 0 && (
            <div className="glass p-6 rounded-[2rem] border border-white/10">
              <h3 className="text-lg font-black mb-3">Audit log</h3>
              <div className="space-y-2">
                {community.auditLog.slice(0, 8).map((entry, index) => (
                  <div key={`${entry.createdAt}-${index}`} className="text-xs text-muted-foreground">
                    <span className="font-semibold text-foreground">{auditLabel(entry)}</span>
                    <span className="mx-2">·</span>
                    <span>{new Date(entry.createdAt).toLocaleDateString()}</span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>

      <div className="grid lg:grid-cols-3 gap-6">
        <div className="glass p-6 rounded-[2rem] border border-white/10 lg:col-span-2">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 mb-5">
            <div>
              <h2 className="text-xl font-black">Accountability board</h2>
              <p className="text-sm text-muted-foreground">
                Spot quiet members early and nudge the group before momentum drops.
              </p>
            </div>
            <button
              onClick={() => navigate(`/community/${id}/chat`)}
              className="px-4 py-2 rounded-xl bg-primary text-primary-foreground font-bold"
            >
              Send check-in
            </button>
          </div>
          <div className="grid md:grid-cols-3 gap-3">
            <div className="rounded-2xl bg-secondary/40 p-4 border border-white/5">
              <p className="text-[10px] uppercase tracking-widest text-muted-foreground font-black mb-2">Range activity</p>
              <p className="text-3xl font-black">{completedInRange}</p>
              <p className="text-xs text-muted-foreground">habit completions in {leaderboardRange} days</p>
            </div>
            <div className="rounded-2xl bg-secondary/40 p-4 border border-white/5">
              <p className="text-[10px] uppercase tracking-widest text-muted-foreground font-black mb-2">Coverage</p>
              <p className="text-3xl font-black">{leaderboard.length}/{community.members?.length || 0}</p>
              <p className="text-xs text-muted-foreground">members active on the board</p>
            </div>
            <div className="rounded-2xl bg-secondary/40 p-4 border border-white/5">
              <p className="text-[10px] uppercase tracking-widest text-muted-foreground font-black mb-2">Shared shield</p>
              <p className="text-3xl font-black">{shieldAvailable ? 'Ready' : 'Cooldown'}</p>
              <p className="text-xs text-muted-foreground">protects one missed day</p>
            </div>
          </div>
        </div>

        <div className="glass p-6 rounded-[2rem] border border-white/10">
          <h2 className="text-lg font-black mb-3">Needs a nudge</h2>
          {quietMembers.length > 0 ? (
            <div className="space-y-2">
              {quietMembers.map((member) => (
                <div key={member.userId?._id || member.userId} className="flex items-center justify-between rounded-xl bg-secondary/40 px-3 py-2 text-sm">
                  <span className="font-bold">{member.userId?.username || 'Member'}</span>
                  <span className="text-xs text-muted-foreground">{member.role}</span>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-sm text-muted-foreground">Everyone has activity in this range.</p>
          )}
        </div>
      </div>

      {confirmAction && (
        <div className="fixed inset-0 z-[120] flex items-center justify-center p-6">
          <div className="absolute inset-0 bg-black/70 backdrop-blur-sm" onClick={closeConfirm} />
          <motion.div
            initial={{ opacity: 0, scale: 0.96, y: 10 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            className="relative z-10 w-full max-w-md glass p-6 rounded-3xl border border-white/10"
          >
            <div className="flex items-start gap-3 mb-4">
              <div className={`p-2 rounded-xl ${confirmAction.tone === 'danger' ? 'bg-rose-500/10 text-rose-300' : 'bg-primary/10 text-primary'}`}>
                <AlertTriangle size={20} />
              </div>
              <div>
                <h3 className="text-xl font-black">{confirmAction.title}</h3>
                <p className="text-sm text-muted-foreground mt-1">{confirmAction.message}</p>
              </div>
            </div>

            {confirmStep === 1 ? (
              <div className="flex gap-3">
                <button onClick={closeConfirm} className="flex-1 px-4 py-3 rounded-xl bg-secondary text-foreground font-bold">
                  Cancel
                </button>
                <button
                  onClick={() => setConfirmStep(2)}
                  className={`flex-1 px-4 py-3 rounded-xl font-bold ${
                    confirmAction.tone === 'danger' ? 'bg-rose-500 text-white' : 'bg-primary text-primary-foreground'
                  }`}
                >
                  Continue
                </button>
              </div>
            ) : (
              <div className="space-y-4">
                {confirmAction.confirmText ? (
                  <div>
                    <p className="text-sm text-muted-foreground mb-2">
                      Type <span className="font-black text-foreground">{confirmAction.confirmText}</span> to confirm.
                    </p>
                    <input
                      value={confirmInput}
                      onChange={(e) => setConfirmInput(e.target.value)}
                      className="w-full bg-secondary/60 border border-secondary/70 rounded-xl px-4 py-3 text-foreground"
                      autoFocus
                    />
                  </div>
                ) : (
                  <p className="text-sm text-muted-foreground">
                    Confirm one more time to apply this change.
                  </p>
                )}
                <div className="flex gap-3">
                  <button onClick={closeConfirm} className="flex-1 px-4 py-3 rounded-xl bg-secondary text-foreground font-bold">
                    Cancel
                  </button>
                  <button
                    onClick={runConfirmedAction}
                    disabled={processing || (confirmAction.confirmText && confirmInput !== confirmAction.confirmText)}
                    className={`flex-1 px-4 py-3 rounded-xl font-bold disabled:opacity-50 ${
                      confirmAction.tone === 'danger' ? 'bg-rose-500 text-white' : 'bg-primary text-primary-foreground'
                    }`}
                  >
                    {processing ? 'Working...' : 'Confirm'}
                  </button>
                </div>
              </div>
            )}
          </motion.div>
        </div>
      )}
    </div>
  );
};

export default CommunityDetail;
