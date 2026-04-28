import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { CheckCircle2, Loader2, ShieldCheck, Users, Crown, Shield } from 'lucide-react';
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
  const [journalEntries, setJournalEntries] = useState([]);
  const [leaderboard, setLeaderboard] = useState([]);
  const [leaderboardRange, setLeaderboardRange] = useState(7);
  const [loading, setLoading] = useState(true);
  const [accessDenied, setAccessDenied] = useState(false);
  const [accessMessage, setAccessMessage] = useState('');
  const [accessInviteCode, setAccessInviteCode] = useState('');
  const [newHabitName, setNewHabitName] = useState('');
  const [newHabitDescription, setNewHabitDescription] = useState('');
  const [journalContent, setJournalContent] = useState('');
  const [journalMood, setJournalMood] = useState('okay');
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

      const [habitsRes, journalRes, leaderboardRes] = await Promise.all([
        api.get(`/communities/${id}/habits`),
        api.get(`/communities/${id}/journal`),
        api.get(`/communities/${id}/leaderboard`, { params: { days: leaderboardRange } }),
      ]);
      setHabits(habitsRes.data.habits || []);
      setJournalEntries(journalRes.data.entries || []);
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

  const refreshJournal = async () => {
    try {
      const { data } = await api.get(`/communities/${id}/journal`);
      setJournalEntries(data.entries || []);
    } catch (err) {
      // Non-blocking: journal can refresh later.
    }
  };

  useEffect(() => {
    loadCommunity();
  }, [id, leaderboardRange]);

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

  const handleJournalSubmit = async (e) => {
    e.preventDefault();
    if (!journalContent.trim()) return;
    setProcessing(true);
    try {
      const { data } = await api.post(`/communities/${id}/journal`, {
        content: journalContent,
        mood: journalMood,
      });
      setJournalEntries((prev) => [data, ...prev]);
      setJournalContent('');
      pushToast({ type: 'success', title: 'Journal entry added', message: 'Shared with the community.' });
    } catch (err) {
      pushToast({
        type: 'error',
        title: 'Journal failed',
        message: 'Please try again.'
      });
    } finally {
      setProcessing(false);
    }
  };

  const handlePinEntry = async (entryId, pinned) => {
    setProcessing(true);
    try {
      const action = pinned ? 'pin' : 'unpin';
      await api.post(`/communities/${id}/journal/${entryId}/${action}`);
      await refreshJournal();
      pushToast({
        type: 'success',
        title: pinned ? 'Entry pinned' : 'Entry unpinned',
        message: pinned ? 'Pinned to the top of the journal.' : 'Removed from pinned section.'
      });
    } catch (err) {
      pushToast({
        type: 'error',
        title: 'Update failed',
        message: err.response?.data?.message || 'Try again.'
      });
    } finally {
      setProcessing(false);
    }
  };

  const handleHideEntry = async (entryId, hidden) => {
    setProcessing(true);
    try {
      const action = hidden ? 'hide' : 'unhide';
      await api.post(`/communities/${id}/journal/${entryId}/${action}`);
      await refreshJournal();
      pushToast({
        type: 'success',
        title: hidden ? 'Entry hidden' : 'Entry restored',
        message: hidden ? 'Hidden from non-admin members.' : 'Visible to everyone again.'
      });
    } catch (err) {
      pushToast({
        type: 'error',
        title: 'Update failed',
        message: err.response?.data?.message || 'Try again.'
      });
    } finally {
      setProcessing(false);
    }
  };

  const handleApprove = async (userId) => {
    setProcessing(true);
    try {
      const { data } = await api.post(`/communities/${id}/approve`, { userId });
      setCommunity(data.community);
      pushToast({ type: 'success', title: 'Request approved', message: 'New member added.' });
    } catch (err) {
      pushToast({ type: 'error', title: 'Approval failed', message: err.response?.data?.message || 'Try again.' });
    } finally {
      setProcessing(false);
    }
  };

  const handleReject = async (userId) => {
    setProcessing(true);
    try {
      const { data } = await api.post(`/communities/${id}/reject`, { userId });
      setCommunity(data.community);
      pushToast({ type: 'success', title: 'Request rejected', message: 'The request was declined.' });
    } catch (err) {
      pushToast({ type: 'error', title: 'Rejection failed', message: err.response?.data?.message || 'Try again.' });
    } finally {
      setProcessing(false);
    }
  };

  const handleRoleChange = async (userId, role) => {
    setProcessing(true);
    try {
      const { data } = await api.post(`/communities/${id}/role`, { userId, role });
      setCommunity(data.community);
      pushToast({ type: 'success', title: 'Role updated', message: 'Member permissions changed.' });
    } catch (err) {
      pushToast({ type: 'error', title: 'Role update failed', message: err.response?.data?.message || 'Try again.' });
    } finally {
      setProcessing(false);
    }
  };

  const handleRemoveMember = async (userId) => {
    setProcessing(true);
    try {
      const { data } = await api.post(`/communities/${id}/remove`, { userId });
      setCommunity(data.community);
      pushToast({ type: 'success', title: 'Member removed', message: 'They no longer have access.' });
    } catch (err) {
      pushToast({ type: 'error', title: 'Removal failed', message: err.response?.data?.message || 'Try again.' });
    } finally {
      setProcessing(false);
    }
  };

  const handleLeave = async () => {
    setProcessing(true);
    try {
      await api.post(`/communities/${id}/leave`);
      pushToast({ type: 'success', title: 'Left community', message: 'You can rejoin later.' });
      navigate('/community');
    } catch (err) {
      pushToast({ type: 'error', title: 'Unable to leave', message: err.response?.data?.message || 'Try again.' });
    } finally {
      setProcessing(false);
    }
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
            className="px-5 py-3 rounded-2xl bg-secondary text-foreground font-bold"
          >
            {isOwner ? 'Owner cannot leave' : 'Leave community'}
          </button>
        </div>
      </header>

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

          {isOwner && (
            <div className="glass p-4 lg:p-5 rounded-2xl border border-white/10">
              <div className="flex items-center justify-between mb-3">
                <h3 className="text-base font-black">Members</h3>
                <span className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">
                  {community.members?.length || 0} total
                </span>
              </div>
              <div className="space-y-1.5 max-h-[360px] overflow-y-auto pr-1">
                {community.members?.map((member) => (
                  <div
                    key={member.userId?._id || member.userId}
                    className="flex items-center justify-between gap-3 rounded-xl bg-secondary/30 px-3 py-2 text-sm"
                  >
                    <div className="flex min-w-0 items-center gap-2">
                      {member.role === 'owner' ? <Crown size={14} className="text-amber-400" /> : <Users size={14} />}
                      <div className="min-w-0">
                        <p className="truncate font-bold text-foreground">{member.userId?.username || 'Member'}</p>
                        <p className="text-[10px] uppercase tracking-widest text-muted-foreground">{member.role}</p>
                      </div>
                    </div>
                    {member.role !== 'owner' && (
                      <div className="flex shrink-0 items-center gap-1.5">
                        <button
                          onClick={() => handleRoleChange(member.userId?._id || member.userId, member.role === 'admin' ? 'member' : 'admin')}
                          disabled={processing}
                          className="px-2.5 py-1 rounded-lg bg-secondary text-foreground font-bold text-xs"
                        >
                          {member.role === 'admin' ? 'Member' : 'Admin'}
                        </button>
                        <button
                          onClick={() => handleRemoveMember(member.userId?._id || member.userId)}
                          disabled={processing}
                          className="px-2.5 py-1 rounded-lg bg-secondary/60 text-foreground font-bold text-xs"
                        >
                          Remove
                        </button>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}

          {isOwner && community.pendingRequests?.length > 0 && (
            <div className="glass p-6 rounded-[2rem] border border-white/10">
              <h3 className="text-lg font-black mb-3">Pending requests</h3>
              <div className="space-y-2">
                {community.pendingRequests.map((request) => (
                  <div key={request.userId?._id || request.userId} className="flex items-center justify-between text-sm">
                    <span>{request.userId?.username || 'User'}</span>
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => handleApprove(request.userId?._id || request.userId)}
                        disabled={processing}
                        className="px-3 py-1 rounded-lg bg-secondary text-foreground font-bold"
                      >
                        Approve
                      </button>
                      <button
                        onClick={() => handleReject(request.userId?._id || request.userId)}
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

          {isOwner && community.auditLog?.length > 0 && (
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

      <div className="glass p-4 lg:p-5 rounded-2xl border border-white/10">
        <div className="flex items-center justify-between gap-4 mb-4">
          <h2 className="text-xl font-black">Community journal</h2>
          <span className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">
            {journalEntries.length} entries
          </span>
        </div>
        <form onSubmit={handleJournalSubmit} className="grid md:grid-cols-[150px_1fr_auto] gap-2.5 mb-4">
          <select
            value={journalMood}
            onChange={(e) => setJournalMood(e.target.value)}
            className="bg-secondary/50 border border-secondary/60 rounded-xl px-3 py-2.5 text-sm text-foreground"
          >
            <option value="amazing">Amazing</option>
            <option value="good">Good</option>
            <option value="okay">Okay</option>
            <option value="bad">Bad</option>
            <option value="terrible">Terrible</option>
          </select>
          <input
            value={journalContent}
            onChange={(e) => setJournalContent(e.target.value)}
            placeholder="Share a community update"
            className="bg-secondary/50 border border-secondary/60 rounded-xl px-3 py-2.5 text-sm text-foreground"
          />
          <button
            type="submit"
            disabled={processing}
            className="px-4 py-2.5 rounded-xl bg-primary text-primary-foreground font-bold text-sm"
          >
            Add entry
          </button>
        </form>

        <div className="grid gap-3 xl:grid-cols-2">
          {journalEntries.map((entry) => (
            <div
              key={entry._id}
              className={`p-3 rounded-xl border border-white/5 ${entry.isHidden ? 'bg-secondary/20 opacity-70' : 'bg-secondary/40'}`}
            >
              <div className="flex items-center justify-between gap-3 text-xs text-muted-foreground mb-2">
                <span className="truncate font-bold text-foreground">{entry.userId?.username || 'Member'}</span>
                <div className="flex shrink-0 items-center gap-2">
                  {entry.isPinned && (
                    <span className="px-2 py-0.5 rounded-full bg-indigo-500/10 text-indigo-300 text-[10px] font-bold">Pinned</span>
                  )}
                  {entry.isHidden && (
                    <span className="px-2 py-0.5 rounded-full bg-rose-500/10 text-rose-300 text-[10px] font-bold">Hidden</span>
                  )}
                  <span>{new Date(entry.date).toLocaleDateString()}</span>
                </div>
              </div>
              <p className="text-sm leading-relaxed text-foreground">{entry.content}</p>
              {isAdmin && (
                <div className="flex items-center gap-2 mt-2.5">
                  <button
                    onClick={() => handlePinEntry(entry._id, !entry.isPinned)}
                    disabled={processing}
                    className="px-2.5 py-1 rounded-lg bg-secondary text-foreground font-bold text-xs"
                  >
                    {entry.isPinned ? 'Unpin' : 'Pin'}
                  </button>
                  <button
                    onClick={() => handleHideEntry(entry._id, !entry.isHidden)}
                    disabled={processing}
                    className="px-2.5 py-1 rounded-lg bg-secondary/60 text-foreground font-bold text-xs"
                  >
                    {entry.isHidden ? 'Unhide' : 'Hide'}
                  </button>
                </div>
              )}
            </div>
          ))}
          {journalEntries.length === 0 && (
            <p className="text-sm text-muted-foreground">No journal entries yet.</p>
          )}
        </div>
      </div>
    </div>
  );
};

export default CommunityDetail;
