import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  BookOpen, 
  Smile, 
  Meh, 
  Frown, 
  Sunrise, 
  Save,
  CheckCircle2,
  Loader2,
  Calendar as CalendarIcon,
  Shield,
  Eye,
  EyeOff
} from 'lucide-react';
import api from '../api/axios';

const MoodButton = ({ mood, active, onClick }) => {
  const moods = {
    amazing: { icon: Smile, color: 'text-emerald-500', bg: 'bg-emerald-500/10' },
    good: { icon: Smile, color: 'text-blue-500', bg: 'bg-blue-500/10' },
    okay: { icon: Meh, color: 'text-yellow-500', bg: 'bg-yellow-500/10' },
    bad: { icon: Frown, color: 'text-orange-500', bg: 'bg-orange-500/10' },
    terrible: { icon: Frown, color: 'text-red-500', bg: 'bg-red-500/10' }
  };
  
  const { icon: Icon, color, bg } = moods[mood];
  
  return (
    <button
      onClick={() => onClick(mood)}
      className={`flex-1 flex flex-col items-center gap-2 p-4 rounded-2xl border transition-all ${
        active 
          ? `${bg} ${color.replace('text-', 'border-')} border-2 scale-105` 
          : 'bg-secondary/30 border-white/5 hover:bg-secondary transition-colors'
      }`}
    >
      <Icon size={24} className={active ? color : 'text-muted-foreground'} />
      <span className="text-[10px] font-black uppercase tracking-widest">{mood}</span>
    </button>
  );
};

const Reflections = () => {
  const [content, setContent] = useState('');
  const [mood, setMood] = useState('okay');
  const [loading, setLoading] = useState(false);
  const [entries, setEntries] = useState([]);
  const [isSuccess, setIsSuccess] = useState(false);
  const [hasJournalPassword, setHasJournalPassword] = useState(false);
  const [journalPassword, setJournalPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [isUnlocked, setIsUnlocked] = useState(false);
  const [authError, setAuthError] = useState('');
  const [isSettingPassword, setIsSettingPassword] = useState(false);
  const [showSetPassword, setShowSetPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [showUnlockPassword, setShowUnlockPassword] = useState(false);

  useEffect(() => {
    const fetchStatus = async () => {
      try {
        const { data } = await api.get('/reflections/status');
        setHasJournalPassword(Boolean(data?.hasPassword));
      } catch (err) {
        console.error('Error loading journal status');
      }
    };
    fetchStatus();
  }, []);

  useEffect(() => {
    const fetchReflections = async () => {
      try {
        const { data } = await api.get('/reflections', {
          headers: { 'x-journal-password': journalPassword }
        });
        setEntries(data);
      } catch (err) {
        console.error('Error loading reflections');
      }
    };
    if (isUnlocked) fetchReflections();
  }, [isUnlocked, journalPassword]);

  const handleSetPassword = async () => {
    if (journalPassword.length < 8) {
      setAuthError('Password must be at least 8 characters');
      return;
    }
    if (journalPassword !== confirmPassword) {
      setAuthError('Passwords do not match');
      return;
    }
    setIsSettingPassword(true);
    setAuthError('');
    try {
      await api.post('/reflections/set-password', { password: journalPassword });
      setHasJournalPassword(true);
      setIsUnlocked(true);
    } catch (err) {
      setAuthError(err.response?.data?.message || 'Failed to set journal password');
    } finally {
      setIsSettingPassword(false);
    }
  };

  const handleUnlock = async () => {
    setAuthError('');
    try {
      await api.post('/reflections/verify', { password: journalPassword });
      setIsUnlocked(true);
    } catch (err) {
      setAuthError(err.response?.data?.message || 'Invalid journal password');
    }
  };

  const handleSave = async () => {
    if (!content) return;
    setLoading(true);
    try {
      const { data } = await api.post('/reflections', { content, mood, date: new Date() }, {
        headers: { 'x-journal-password': journalPassword }
      });
      setIsSuccess(true);
      setTimeout(() => setIsSuccess(false), 3000);
      setEntries([
        data,
        ...entries
      ]);
      setContent('');
    } catch (err) {
      console.error('Error saving reflection');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-10">
      <header>
        <h1 className="text-4xl font-black mb-2">Daily Journal</h1>
        <p className="text-muted-foreground font-medium">Reflect on your progress and mindful moments.</p>
      </header>

      {!isUnlocked && (
        <motion.div
          id="tour-journal-lock"
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="glass p-8 rounded-[2.5rem] border border-white/10 max-w-2xl"
        >
          <div className="flex items-center gap-3 mb-4">
            <Shield className="text-primary" />
            <h2 className="text-2xl font-black">Private Journal Lock</h2>
          </div>
          <p className="text-muted-foreground mb-6">
            Your journal is protected by a separate password. This password cannot be recovered if forgotten.
          </p>

          {!hasJournalPassword ? (
            <div className="space-y-4">
              <div className="relative">
                <input
                  type={showSetPassword ? 'text' : 'password'}
                  placeholder="Set journal password"
                  value={journalPassword}
                  onChange={(e) => setJournalPassword(e.target.value)}
                  className="w-full bg-secondary/50 border border-white/5 rounded-2xl px-5 py-3 pr-12 text-foreground"
                />
                <button
                  type="button"
                  onClick={() => setShowSetPassword(prev => !prev)}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                  aria-label={showSetPassword ? 'Hide journal password' : 'Show journal password'}
                >
                  {showSetPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
              <div className="relative">
                <input
                  type={showConfirmPassword ? 'text' : 'password'}
                  placeholder="Confirm journal password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  className="w-full bg-secondary/50 border border-white/5 rounded-2xl px-5 py-3 pr-12 text-foreground"
                />
                <button
                  type="button"
                  onClick={() => setShowConfirmPassword(prev => !prev)}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                  aria-label={showConfirmPassword ? 'Hide confirm journal password' : 'Show confirm journal password'}
                >
                  {showConfirmPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
              {authError && <p className="text-sm text-destructive">{authError}</p>}
              <button
                onClick={handleSetPassword}
                disabled={isSettingPassword}
                className="px-6 py-3 rounded-2xl bg-primary text-primary-foreground font-bold"
              >
                {isSettingPassword ? 'Setting...' : 'Set Journal Password'}
              </button>
            </div>
          ) : (
            <div className="space-y-4">
              <div className="relative">
                <input
                  type={showUnlockPassword ? 'text' : 'password'}
                  placeholder="Enter journal password"
                  value={journalPassword}
                  onChange={(e) => setJournalPassword(e.target.value)}
                  className="w-full bg-secondary/50 border border-white/5 rounded-2xl px-5 py-3 pr-12 text-foreground"
                />
                <button
                  type="button"
                  onClick={() => setShowUnlockPassword(prev => !prev)}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                  aria-label={showUnlockPassword ? 'Hide unlock journal password' : 'Show unlock journal password'}
                >
                  {showUnlockPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
              {authError && <p className="text-sm text-destructive">{authError}</p>}
              <button
                onClick={handleUnlock}
                className="px-6 py-3 rounded-2xl bg-primary text-primary-foreground font-bold"
              >
                Unlock Journal
              </button>
            </div>
          )}
        </motion.div>
      )}

      {isUnlocked && (
      <div className="grid lg:grid-cols-2 gap-10">
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          className="glass p-8 rounded-[2.5rem] border border-white/10"
        >
          <div className="flex items-center gap-3 mb-8">
            <Sunrise className="text-primary" />
            <h2 className="text-xl font-black">Today's Reflection</h2>
          </div>

          <div className="space-y-8">
            <div className="space-y-4">
              <label className="text-sm font-black uppercase text-muted-foreground tracking-widest ml-1">How are you feeling?</label>
              <div className="flex gap-3">
                {['terrible', 'bad', 'okay', 'good', 'amazing'].map(m => (
                  <MoodButton key={m} mood={m} active={mood === m} onClick={setMood} />
                ))}
              </div>
            </div>

            <div className="space-y-4">
              <label className="text-sm font-black uppercase text-muted-foreground tracking-widest ml-1">What's on your mind?</label>
              <textarea
                value={content}
                onChange={(e) => setContent(e.target.value)}
                className="w-full bg-secondary/50 border border-white/5 rounded-3xl p-6 text-foreground focus:outline-none focus:ring-2 focus:ring-primary/50 transition-all font-medium h-48 resize-none"
                placeholder="Write about your journey today..."
              />
            </div>

            <button
              onClick={handleSave}
              disabled={loading || !content}
              className={`w-full py-4 rounded-2xl flex items-center justify-center gap-3 font-black text-lg transition-all ${
                isSuccess 
                  ? 'bg-emerald-500 text-primary-foreground shadow-xl shadow-emerald-500/20' 
                  : 'bg-primary text-primary-foreground shadow-xl shadow-primary/20 hover:translate-y-[-2px]'
              } disabled:opacity-50`}
            >
              {loading ? <Loader2 className="animate-spin" /> : isSuccess ? <CheckCircle2 /> : <Save size={20} />}
              {isSuccess ? 'Saved Entry' : 'Save Reflection'}
            </button>
          </div>
        </motion.div>

        <div className="space-y-6">
          <div className="flex items-center justify-between mb-4 px-2">
            <h2 className="text-xl font-black">History</h2>
            <CalendarIcon size={20} className="text-muted-foreground" />
          </div>

          <AnimatePresence>
            {entries.map((entry, i) => (
              <motion.div
                key={entry._id || entry.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.1 }}
                className="glass p-6 rounded-3xl border border-white/5 group hover:border-white/10 transition-all"
              >
                <div className="flex justify-between items-start mb-4">
                  <div className="flex items-center gap-2">
                    <div className="w-8 h-8 rounded-lg bg-secondary flex items-center justify-center text-primary">
                      <BookOpen size={16} />
                    </div>
                    <span className="text-xs font-black uppercase tracking-widest text-muted-foreground">
                      {new Date(entry.date).toLocaleDateString(undefined, { month: 'long', day: 'numeric' })}
                    </span>
                  </div>
                  <div className={`px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest ${
                    entry.mood === 'amazing' ? 'bg-emerald-500/10 text-emerald-500' : 'bg-blue-500/10 text-blue-500'
                  }`}>
                    {entry.mood}
                  </div>
                </div>
                <p className="text-sm font-medium leading-relaxed opacity-80 italic">"{entry.content}"</p>
              </motion.div>
            ))}
          </AnimatePresence>
        </div>
      </div>
      )}
    </div>
  );
};


export default Reflections;
