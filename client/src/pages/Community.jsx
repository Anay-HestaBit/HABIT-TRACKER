import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Users, Plus, KeyRound, Loader2 } from 'lucide-react';
import { Link } from 'react-router-dom';
import api from '../api/axios';
import { useToast } from '../context/ToastContext';

const Community = () => {
  const [communities, setCommunities] = useState([]);
  const [pending, setPending] = useState([]);
  const [loading, setLoading] = useState(true);
  const [creating, setCreating] = useState(false);
  const [joining, setJoining] = useState(false);
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [inviteCode, setInviteCode] = useState('');
  const { pushToast } = useToast();

  const fetchCommunities = async () => {
    setLoading(true);
    try {
      const { data } = await api.get('/communities');
      setCommunities(data.communities || []);
      setPending(data.pending || []);
    } catch (err) {
      pushToast({
        type: 'error',
        title: 'Failed to load communities',
        message: 'Please try again shortly.'
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCommunities();
  }, []);

  const handleCreate = async (e) => {
    e.preventDefault();
    if (!name.trim()) return;
    setCreating(true);
    try {
      await api.post('/communities', { name, description });
      setName('');
      setDescription('');
      pushToast({
        type: 'success',
        title: 'Community created',
        message: 'Invite members with your code.'
      });
      fetchCommunities();
    } catch (err) {
      pushToast({
        type: 'error',
        title: 'Could not create community',
        message: err.response?.data?.message || 'Please try again.'
      });
    } finally {
      setCreating(false);
    }
  };

  const handleJoin = async (e) => {
    e.preventDefault();
    if (!inviteCode.trim()) return;
    setJoining(true);
    try {
      await api.post('/communities/join', { code: inviteCode });
      setInviteCode('');
      pushToast({
        type: 'success',
        title: 'Join request sent',
        message: 'The owner will approve it soon.'
      });
      fetchCommunities();
    } catch (err) {
      pushToast({
        type: 'error',
        title: 'Join request failed',
        message: err.response?.data?.message || 'Check the code and try again.'
      });
    } finally {
      setJoining(false);
    }
  };

  const pendingIds = new Set(pending.map((community) => community._id));
  const visibleCommunities = communities.filter((community) => !pendingIds.has(community._id));

  return (
    <div className="space-y-10">
      <header className="flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div>
          <h1 className="text-4xl font-black mb-2">Community Hub</h1>
          <p className="text-muted-foreground font-medium">Collaborate on shared habits and a common world.</p>
        </div>
      </header>

      <div className="grid lg:grid-cols-2 gap-6">
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="glass p-6 rounded-[2rem] border border-white/10"
        >
          <div className="flex items-center gap-3 mb-6">
            <div className="w-10 h-10 rounded-xl bg-primary/20 flex items-center justify-center text-primary">
              <Plus size={18} />
            </div>
            <div>
              <h2 className="text-xl font-black">Create community</h2>
              <p className="text-sm text-muted-foreground">Start a new shared space.</p>
            </div>
          </div>
          <form onSubmit={handleCreate} className="space-y-4">
            <input
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Community name"
              className="w-full bg-secondary/50 border border-secondary/60 rounded-2xl px-4 py-3 text-foreground"
              required
            />
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="What is this community about?"
              className="w-full bg-secondary/50 border border-secondary/60 rounded-2xl px-4 py-3 text-foreground h-24 resize-none"
            />
            <button
              type="submit"
              disabled={creating}
              className="w-full py-3 rounded-2xl bg-primary text-primary-foreground font-bold"
            >
              {creating ? 'Creating...' : 'Create community'}
            </button>
          </form>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="glass p-6 rounded-[2rem] border border-white/10"
        >
          <div className="flex items-center gap-3 mb-6">
            <div className="w-10 h-10 rounded-xl bg-secondary/60 flex items-center justify-center text-muted-foreground">
              <KeyRound size={18} />
            </div>
            <div>
              <h2 className="text-xl font-black">Join by code</h2>
              <p className="text-sm text-muted-foreground">Request access to a community.</p>
            </div>
          </div>
          <form onSubmit={handleJoin} className="space-y-4">
            <input
              value={inviteCode}
              onChange={(e) => setInviteCode(e.target.value)}
              placeholder="Invite code"
              className="w-full bg-secondary/50 border border-secondary/60 rounded-2xl px-4 py-3 text-foreground uppercase tracking-widest"
              required
            />
            <button
              type="submit"
              disabled={joining}
              className="w-full py-3 rounded-2xl bg-secondary text-foreground font-bold"
            >
              {joining ? 'Requesting...' : 'Send join request'}
            </button>
          </form>
        </motion.div>
      </div>

      <div className="glass p-6 rounded-[2rem] border border-white/10">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-black">Your communities</h2>
          <div className="flex items-center gap-2 text-xs font-bold text-muted-foreground">
            <Users size={14} /> {communities.length}
          </div>
        </div>

        {loading ? (
          <div className="flex items-center gap-2 text-muted-foreground">
            <Loader2 size={16} className="animate-spin" /> Loading communities...
          </div>
        ) : visibleCommunities.length > 0 ? (
          <div className="grid md:grid-cols-2 gap-4">
            {visibleCommunities.map((community) => (
              <Link
                key={community._id}
                to={`/community/${community._id}`}
                className="glass p-4 rounded-2xl border border-white/5 hover:border-primary/30 transition-all"
              >
                <p className="text-lg font-black text-foreground">{community.name}</p>
                <p className="text-xs text-muted-foreground">{community.description || 'Shared community habits'}</p>
                <p className="text-[10px] mt-2 text-muted-foreground uppercase tracking-widest">
                  Invite code: {community.inviteCode}
                </p>
              </Link>
            ))}
          </div>
        ) : (
          <p className="text-sm text-muted-foreground">No communities yet. Create one or join by code.</p>
        )}
      </div>

      <AnimatePresence>
        {pending.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 10 }}
            className="glass p-6 rounded-[2rem] border border-white/10"
          >
            <h2 className="text-xl font-black mb-3">Pending requests</h2>
            <div className="space-y-2">
              {pending.map((community) => (
                <div key={community._id} className="flex items-center justify-between bg-secondary/40 p-3 rounded-2xl">
                  <div>
                    <p className="font-bold text-foreground">{community.name}</p>
                    <p className="text-xs text-muted-foreground">Awaiting approval</p>
                  </div>
                </div>
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default Community;
