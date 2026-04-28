import React, { useState, useEffect, useRef, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Link, useLocation } from 'react-router-dom';
import { 
  Plus, 
  Flame, 
  Trash2, 
  Edit3, 
  Check, 
  Loader2, 
  Search,
  X,
  Sparkles,
  ShieldCheck,
  Layers,
  LayoutGrid,
  List
} from 'lucide-react';
import api from '../api/axios';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import PomodoroTimer from '../components/PomodoroTimer';

const isHabitCompletedToday = (habit) => {
  const today = new Date();
  today.setUTCHours(0, 0, 0, 0);
  return habit.completions?.some(c => {
    const d = new Date(c.date);
    d.setUTCHours(0, 0, 0, 0);
    return d.getTime() === today.getTime();
  });
};

const HabitCard = ({ habit, onComplete, onDelete, onEdit, onShield, shieldAvailable }) => {
  const isCompletedToday = isHabitCompletedToday(habit);

  return (
    <motion.div
      layout
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.9 }}
      className={`glass group p-6 rounded-[2rem] border transition-all ${
        isCompletedToday ? 'border-emerald-500/30' : 'border-white/5 hover:border-primary/30'
      }`}
    >
      <div className="flex items-start justify-between mb-6">
        <div className="flex gap-4">
          <div className="w-12 h-12 rounded-2xl bg-secondary/60 flex items-center justify-center text-xl" style={{ borderLeft: `4px solid ${habit.color}` }}>
            <span style={{ color: habit.color }}>{habit.name.charAt(0).toUpperCase()}</span>
          </div>
          <div>
            <h3 className="text-lg font-black text-foreground">{habit.name}</h3>
            <p className="text-xs text-muted-foreground font-bold uppercase tracking-widest">{habit.frequency}</p>
          </div>
        </div>
        <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
          <button onClick={() => onEdit(habit)} className="p-2 text-muted-foreground hover:text-foreground transition-colors">
            <Edit3 size={18} />
          </button>
          <button onClick={() => onDelete(habit)} className="p-2 text-muted-foreground hover:text-rose-500 transition-colors">
            <Trash2 size={18} />
          </button>
        </div>
      </div>

      <div className="flex items-end justify-between">
        <div className="flex items-center gap-2 text-orange-500 font-black italic">
          <Flame size={20} className="fill-current" />
          <span className="text-xl">{habit.streak}</span>
        </div>

        <div className="flex items-center gap-2">
          {shieldAvailable && !isCompletedToday && (
            <button
              onClick={() => onShield(habit._id)}
              className="px-3 py-3 rounded-2xl font-black transition-all flex items-center gap-2 bg-indigo-500/10 text-indigo-400 hover:bg-indigo-500/20"
              title="Use a streak shield for today"
            >
              <ShieldCheck size={18} />
              Shield
            </button>
          )}
          <button
            onClick={() => !isCompletedToday && onComplete(habit._id)}
            disabled={isCompletedToday}
            className={`px-6 py-3 rounded-2xl font-black transition-all flex items-center gap-2 ${
              isCompletedToday 
                ? 'bg-emerald-500/10 text-emerald-500 cursor-default' 
                : 'bg-primary text-primary-foreground hover:bg-primary/90 shadow-xl hover:shadow-primary/20'
            }`}
          >
            {isCompletedToday ? (
              <><Check size={20} /> Done</>
            ) : (
              <><div className="w-5 h-5 rounded-full border-2 border-current/30" /> Complete</>
            )}
          </button>
        </div>
      </div>
    </motion.div>
  );
};

const HabitListRow = ({ habit, onComplete, onDelete, onEdit, onShield, shieldAvailable }) => {
  const isCompletedToday = isHabitCompletedToday(habit);

  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: 8 }}
      className={`glass group flex flex-col gap-3 rounded-2xl border px-4 py-3 sm:flex-row sm:items-center sm:justify-between ${
        isCompletedToday ? 'border-emerald-500/30' : 'border-white/5 hover:border-primary/30'
      }`}
    >
      <div className="flex min-w-0 items-center gap-3">
        <div
          className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-secondary/60 text-base font-black"
          style={{ borderLeft: `4px solid ${habit.color}` }}
        >
          <span style={{ color: habit.color }}>{habit.name.charAt(0).toUpperCase()}</span>
        </div>
        <div className="min-w-0">
          <h3 className="truncate text-base font-black text-foreground">{habit.name}</h3>
          <div className="mt-1 flex items-center gap-3 text-xs text-muted-foreground">
            <span className="font-bold uppercase tracking-widest">{habit.frequency}</span>
            <span className="flex items-center gap-1 font-black text-orange-500">
              <Flame size={14} className="fill-current" />
              {habit.streak}
            </span>
          </div>
        </div>
      </div>

      <div className="flex shrink-0 flex-wrap items-center gap-2 sm:justify-end">
        <button onClick={() => onEdit(habit)} className="p-2 text-muted-foreground hover:text-foreground transition-colors" title="Edit habit">
          <Edit3 size={17} />
        </button>
        <button onClick={() => onDelete(habit)} className="p-2 text-muted-foreground hover:text-rose-500 transition-colors" title="Delete habit">
          <Trash2 size={17} />
        </button>
        {shieldAvailable && !isCompletedToday && (
          <button
            onClick={() => onShield(habit._id)}
            className="px-3 py-2 rounded-xl font-black transition-all flex items-center gap-2 bg-indigo-500/10 text-indigo-400 hover:bg-indigo-500/20 text-sm"
            title="Use a streak shield for today"
          >
            <ShieldCheck size={16} />
            Shield
          </button>
        )}
        <button
          onClick={() => !isCompletedToday && onComplete(habit._id)}
          disabled={isCompletedToday}
          className={`px-4 py-2 rounded-xl font-black transition-all flex items-center gap-2 text-sm ${
            isCompletedToday
              ? 'bg-emerald-500/10 text-emerald-500 cursor-default'
              : 'bg-primary text-primary-foreground hover:bg-primary/90'
          }`}
        >
          {isCompletedToday ? (
            <><Check size={18} /> Done</>
          ) : (
            <><div className="w-4 h-4 rounded-full border-2 border-current/30" /> Complete</>
          )}
        </button>
      </div>
    </motion.div>
  );
};

const HabitModal = ({ isOpen, onClose, habit, onSave }) => {
  const [formData, setFormData] = useState(habit || {
    name: '',
    description: '',
    frequency: 'daily',
    color: '#3b82f6'
  });

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-6 sm:p-0">
      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="absolute inset-0 bg-black/80 backdrop-blur-sm" onClick={onClose} />
      <motion.div 
        initial={{ opacity: 0, scale: 0.9, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.9, y: 20 }}
        className="glass w-full max-w-lg p-8 rounded-[2.5rem] border border-white/10 relative z-10 overflow-hidden"
      >
        <div className="flex justify-between items-center mb-8">
          <h2 className="text-2xl font-black text-foreground">{habit ? 'Edit Habit' : 'New Habit'}</h2>
          <button onClick={onClose} className="p-2 text-muted-foreground hover:text-foreground hover:bg-secondary rounded-xl transition-all">
            <X size={24} />
          </button>
        </div>

        <form onSubmit={(e) => { e.preventDefault(); onSave(formData); }} className="space-y-6">
          <div className="space-y-2">
            <label className="text-sm font-bold text-muted-foreground ml-1 uppercase tracking-widest">Habit Name</label>
            <input
              type="text"
              required
              value={formData.name}
              onChange={(e) => setFormData({...formData, name: e.target.value})}
              placeholder="e.g. Morning Meditation"
              className="w-full bg-secondary/50 border border-secondary/60 rounded-2xl py-4 px-6 text-foreground focus:outline-none focus:ring-2 focus:ring-blue-500/50 transition-all font-medium"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <label className="text-sm font-bold text-muted-foreground ml-1 uppercase tracking-widest">Frequency</label>
              <select
                value={formData.frequency}
                onChange={(e) => setFormData({...formData, frequency: e.target.value})}
                className="w-full bg-secondary/50 border border-secondary/60 rounded-2xl py-4 px-6 text-foreground appearance-none outline-none focus:ring-2 focus:ring-blue-500/50 transition-all"
              >
                <option value="daily">Daily</option>
                <option value="weekly">Weekly</option>
              </select>
            </div>
            <div className="space-y-2">
              <label className="text-sm font-bold text-muted-foreground ml-1 uppercase tracking-widest">Accent Color</label>
              <div className="flex items-center gap-3">
                <input
                  type="color"
                  value={formData.color}
                  onChange={(e) => setFormData({...formData, color: e.target.value})}
                  className="w-12 h-12 rounded-xl bg-transparent border-none cursor-pointer p-0"
                />
                <span className="text-sm font-mono text-muted-foreground uppercase">{formData.color}</span>
              </div>
            </div>
          </div>

          <button
            type="submit"
            className="w-full py-4 rounded-2xl bg-primary text-primary-foreground font-black text-lg shadow-xl shadow-primary/20 hover:translate-y-[-2px] hover:shadow-primary/40 active:translate-y-0 transition-all"
          >
            {habit ? 'Save Changes' : 'Create Habit'}
          </button>
        </form>
      </motion.div>
    </div>
  );
};

const TemplatePackCard = ({ pack, onSelect }) => (
  <button
    onClick={() => onSelect(pack)}
    className="text-left glass p-5 rounded-3xl border border-white/5 hover:border-primary/30 transition-all group"
  >
    <div className="flex items-start justify-between gap-3 mb-3">
      <div>
        <h3 className="text-lg font-black text-foreground mb-1">{pack.name}</h3>
        <p className="text-xs text-muted-foreground font-medium">{pack.description}</p>
      </div>
      <div className="p-2 rounded-2xl bg-primary/10 text-primary group-hover:scale-110 transition-transform">
        <Layers size={18} />
      </div>
    </div>
    <div className="flex items-center justify-between">
      <span className="text-[10px] uppercase tracking-widest text-muted-foreground font-bold">
        {pack.habits.length} habits
      </span>
      <span className="text-xs font-bold text-primary">View pack</span>
    </div>
  </button>
);

const TemplatePackModal = ({ isOpen, pack, onClose, onApply, isApplying }) => {
  if (!isOpen || !pack) return null;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-6 sm:p-0">
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="absolute inset-0 bg-black/80 backdrop-blur-sm"
        onClick={onClose}
      />
      <motion.div
        initial={{ opacity: 0, scale: 0.95, y: 10 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.95, y: 10 }}
        className="glass w-full max-w-xl p-8 rounded-[2.5rem] border border-white/10 relative z-10"
      >
        <div className="flex items-start justify-between mb-6">
          <div>
            <p className="text-xs font-black uppercase tracking-widest text-muted-foreground mb-2">Starter Pack</p>
            <h2 className="text-2xl font-black text-foreground mb-1">{pack.name}</h2>
            <p className="text-sm text-muted-foreground">{pack.description}</p>
          </div>
          <button onClick={onClose} className="p-2 text-muted-foreground hover:text-foreground hover:bg-secondary rounded-xl transition-all">
            <X size={22} />
          </button>
        </div>

        <div className="space-y-3 max-h-[40vh] overflow-y-auto pr-2">
          {pack.habits.map((habit) => (
            <div key={habit.name} className="p-4 rounded-2xl bg-secondary/40 border border-white/5">
              <div className="flex items-center justify-between mb-1">
                <p className="font-bold text-foreground">{habit.name}</p>
                <span className="text-[10px] uppercase tracking-widest text-muted-foreground font-bold">
                  {habit.frequency}
                </span>
              </div>
              <p className="text-xs text-muted-foreground">{habit.description}</p>
            </div>
          ))}
        </div>

        <div className="flex gap-3 mt-8">
          <button
            onClick={onClose}
            className="flex-1 px-6 py-3 rounded-2xl bg-secondary text-foreground font-bold"
          >
            Maybe later
          </button>
          <button
            onClick={() => onApply(pack)}
            disabled={isApplying}
            className="flex-1 px-6 py-3 rounded-2xl bg-primary text-primary-foreground font-bold shadow-xl shadow-primary/20 disabled:opacity-60"
          >
            {isApplying ? 'Adding...' : `Add ${pack.habits.length} habits`}
          </button>
        </div>
      </motion.div>
    </div>
  );
};

const Habits = () => {
  const [habits, setHabits] = useState([]);
  const [loading, setLoading] = useState(true);
  const [packs, setPacks] = useState([]);
  const [packsLoading, setPacksLoading] = useState(true);
  const [isPackModalOpen, setIsPackModalOpen] = useState(false);
  const [selectedPack, setSelectedPack] = useState(null);
  const [isApplyingPack, setIsApplyingPack] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingHabit, setEditingHabit] = useState(null);
  const [achievementNotice, setAchievementNotice] = useState(null);
  const [deleteCandidate, setDeleteCandidate] = useState(null);
  const [deleteStep, setDeleteStep] = useState(1);
  const [deleteConfirmText, setDeleteConfirmText] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [aiSuggestion, setAiSuggestion] = useState(null);
  const [viewMode, setViewMode] = useState(() => localStorage.getItem('habitViewMode') || 'grid');
  const { user, setUser } = useAuth();
  const { pushToast } = useToast();
  const location = useLocation();
  const templateSectionRef = useRef(null);
  const shieldAvailable = Boolean(user?.streakShield?.available);
  const shieldResetsAt = user?.streakShield?.resetsAt
    ? new Date(user.streakShield.resetsAt)
    : null;

  const shieldHistory = useMemo(() => {
    const entries = [];
    habits.forEach((habit) => {
      (habit.completions || []).forEach((completion) => {
        if (completion.shielded) {
          entries.push({
            habitName: habit.name,
            date: completion.completedAt || completion.date,
          });
        }
      });
    });
    return entries
      .sort((a, b) => new Date(b.date) - new Date(a.date))
      .slice(0, 5);
  }, [habits]);

  const shieldCooldownDays = shieldResetsAt
    ? Math.max(1, Math.ceil((shieldResetsAt.getTime() - Date.now()) / (1000 * 60 * 60 * 24)))
    : null;

  useEffect(() => {
    fetchHabits();
  }, []);

  useEffect(() => {
    const fetchPacks = async () => {
      setPacksLoading(true);
      try {
        const { data } = await api.get('/templates');
        setPacks(data?.packs || []);
      } catch (err) {
        pushToast({
          type: 'warning',
          title: 'Starter packs unavailable',
          message: 'Try again later to load templates.'
        });
      } finally {
        setPacksLoading(false);
      }
    };
    fetchPacks();
  }, [pushToast]);

  useEffect(() => {
    const params = new URLSearchParams(location.search);
    if (params.get('templates') === '1' && templateSectionRef.current) {
      templateSectionRef.current.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  }, [location.search]);

  useEffect(() => {
    if (!achievementNotice) return;
    const timer = setTimeout(() => setAchievementNotice(null), 6000);
    return () => clearTimeout(timer);
  }, [achievementNotice]);

  useEffect(() => {
    localStorage.setItem('habitViewMode', viewMode);
  }, [viewMode]);

  const fetchHabits = async () => {
    try {
      const { data } = await api.get('/habits');
      setHabits(data);
    } catch (err) {
      pushToast({
        type: 'error',
        title: 'Failed to load habits',
        message: 'Please refresh or try again in a moment.'
      });
    } finally {
      setLoading(false);
    }
  };

  const handleCreateOrUpdate = async (formData) => {
    try {
      if (editingHabit) {
        await api.put(`/habits/${editingHabit._id}`, formData);
        pushToast({
          type: 'success',
          title: 'Habit updated',
          message: 'Your changes are saved.'
        });
      } else {
        const { data } = await api.post('/habits', formData);
        if (data?.newlyUnlockedBadges?.length) {
          setAchievementNotice({ badges: data.newlyUnlockedBadges });
          setUser(prev => ({
            ...prev,
            badges: [...(prev?.badges || []), ...data.newlyUnlockedBadges]
          }));
        }
        pushToast({
          type: 'success',
          title: 'Habit created',
          message: 'New habit added to your list.'
        });
      }
      setIsModalOpen(false);
      setEditingHabit(null);
      fetchHabits();
    } catch (err) {
      pushToast({
        type: 'error',
        title: 'Could not save habit',
        message: 'Please check the details and try again.'
      });
    }
  };

  const handleComplete = async (id) => {
    try {
      const { data } = await api.post(`/habits/${id}/complete`);
      setHabits(habits.map(h => h._id === id ? data.habit : h));
      setUser(prev => ({
        ...prev,
        xp: data.newXP,
        level: data.newLevel,
        worldState: data.worldState,
        badges: data?.newlyUnlockedBadges?.length
          ? [...(prev?.badges || []), ...data.newlyUnlockedBadges]
          : prev?.badges
      }));
      if (data?.newlyUnlockedBadges?.length) {
        setAchievementNotice({ badges: data.newlyUnlockedBadges });
      }
    } catch (err) {
      pushToast({
        type: 'error',
        title: 'Completion failed',
        message: err.response?.data?.message || 'Try again in a moment.'
      });
    }
  };

  const handleUseShield = async (id) => {
    try {
      const { data } = await api.post(`/habits/${id}/shield`);
      setHabits(habits.map(h => h._id === id ? data.habit : h));
      setUser(prev => ({
        ...prev,
        streakShield: data.streakShield || prev?.streakShield,
        badges: data?.newlyUnlockedBadges?.length
          ? [...(prev?.badges || []), ...data.newlyUnlockedBadges]
          : prev?.badges
      }));
      if (data?.newlyUnlockedBadges?.length) {
        setAchievementNotice({ badges: data.newlyUnlockedBadges });
      }
      pushToast({
        type: 'success',
        title: 'Shield used',
        message: 'Streak protected for today.'
      });
    } catch (err) {
      pushToast({
        type: 'error',
        title: 'Shield unavailable',
        message: err.response?.data?.message || 'Try again later.'
      });
    }
  };

  const handleApplyPack = async (pack) => {
    if (!pack) return;
    setIsApplyingPack(true);
    try {
      const { data } = await api.post('/habits/bulk', { habits: pack.habits });
      if (data?.newlyUnlockedBadges?.length) {
        setAchievementNotice({ badges: data.newlyUnlockedBadges });
        setUser(prev => ({
          ...prev,
          badges: [...(prev?.badges || []), ...data.newlyUnlockedBadges]
        }));
      }
      pushToast({
        type: 'success',
        title: 'Pack added',
        message: `${data?.habits?.length || 0} habits added to your list.`
      });
      setIsPackModalOpen(false);
      setSelectedPack(null);
      fetchHabits();
    } catch (err) {
      pushToast({
        type: 'error',
        title: 'Pack failed',
        message: err.response?.data?.message || 'Please try again.'
      });
    } finally {
      setIsApplyingPack(false);
    }
  };

  const handleDeleteRequest = (habit) => {
    setDeleteCandidate(habit);
    setDeleteStep(1);
    setDeleteConfirmText('');
  };

  const handleDeleteConfirmed = async () => {
    if (!deleteCandidate) return;
    try {
      await api.delete(`/habits/${deleteCandidate._id}`);
      setHabits(habits.filter(h => h._id !== deleteCandidate._id));
      setDeleteCandidate(null);
      pushToast({
        type: 'success',
        title: 'Habit removed',
        message: 'You can re-add it anytime.'
      });
    } catch (err) {
      pushToast({
        type: 'error',
        title: 'Delete failed',
        message: 'Please try again.'
      });
    }
  };

  const handleAiMentor = () => {
    const suggestions = [
      "Try adding 'Drink 500ml of water' to your morning routine.",
      "Consistency is key! Maybe a '10-minute stretching' session would help your energy.",
      "Based on your patterns, you're most active in the afternoon. Schedule your hardest habit then!",
      "You've maintained a great streak with meditation. Why not try a 'Gratitude Journal' next?",
      "Deep Work is going great. Add a 'Digital Detox' hour before bed."
    ];
    const random = suggestions[Math.floor(Math.random() * suggestions.length)];
    setAiSuggestion(random);
    setTimeout(() => setAiSuggestion(null), 5000);
  };

  const filteredHabits = habits.filter(h => 
    h.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="space-y-10 max-w-7xl mx-auto">
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-8">
          <header className="flex flex-col md:flex-row md:items-center justify-between gap-6">
            <div>
              <h1 className="text-5xl font-black text-foreground mb-2 italic tracking-tighter">My Journey</h1>
              <p className="text-muted-foreground font-medium">Build consistency, unlock rewards, and evolve.</p>
            </div>
            <div className="flex gap-3">
              <button
                onClick={handleAiMentor}
                className="flex items-center gap-2 px-6 py-3 rounded-2xl bg-indigo-500/10 text-indigo-400 font-bold border border-indigo-500/20 hover:bg-indigo-500/20 transition-all group relative"
              >
                <Sparkles size={20} className="group-hover:rotate-12 transition-transform" />
                AI Mentor
                <AnimatePresence>
                  {aiSuggestion && (
                    <motion.div 
                      initial={{ opacity: 0, scale: 0.9, y: 10 }}
                      animate={{ opacity: 1, scale: 1, y: 0 }}
                      exit={{ opacity: 0, scale: 0.9 }}
                      className="absolute bottom-full right-0 mb-4 w-64 p-4 bg-indigo-600 text-primary-foreground rounded-2xl shadow-2xl z-50 text-sm font-medium"
                    >
                      {aiSuggestion}
                      <div className="absolute top-full right-6 -translate-y-1/2 w-4 h-4 bg-indigo-600 rotate-45" />
                    </motion.div>
                  )}
                </AnimatePresence>
              </button>
              <button
                onClick={() => { setEditingHabit(null); setIsModalOpen(true); }}
                className="flex items-center gap-2 px-6 py-3 rounded-2xl bg-primary text-primary-foreground font-bold shadow-xl shadow-primary/20 hover:translate-y-[-2px] transition-all"
              >
                <Plus size={20} />
                Create New
              </button>
            </div>
          </header>

          <div ref={templateSectionRef} className="glass p-6 rounded-[2.5rem] border border-white/10">
            <div className="flex items-center justify-between mb-4">
              <div>
                <p className="text-xs font-black uppercase tracking-widest text-muted-foreground">Starter Packs</p>
                <h2 className="text-2xl font-black text-foreground">Jump-start your routine</h2>
              </div>
              <span className="text-xs font-bold text-primary">Curated</span>
            </div>
            {packsLoading ? (
              <div className="flex items-center gap-3 text-sm text-muted-foreground">
                <Loader2 size={18} className="animate-spin" /> Loading packs...
              </div>
            ) : packs.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {packs.map((pack) => (
                  <TemplatePackCard
                    key={pack.id}
                    pack={pack}
                    onSelect={(selected) => {
                      setSelectedPack(selected);
                      setIsPackModalOpen(true);
                    }}
                  />
                ))}
              </div>
            ) : (
              <p className="text-sm text-muted-foreground">No packs available right now.</p>
            )}
          </div>

          <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
            <div className="relative group w-full max-w-md">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-muted-foreground group-focus-within:text-blue-500 transition-colors" size={20} />
              <input
                type="text"
                placeholder="Search habits..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full bg-secondary/50 border border-secondary/60 rounded-2xl py-3 pl-12 pr-4 text-foreground focus:outline-none focus:ring-2 focus:ring-blue-500/30 transition-all font-medium"
              />
            </div>
            <div className="inline-flex w-fit rounded-2xl border border-white/10 bg-secondary/40 p-1">
              <button
                type="button"
                onClick={() => setViewMode('grid')}
                className={`flex items-center gap-2 rounded-xl px-3 py-2 text-sm font-bold transition-all ${
                  viewMode === 'grid' ? 'bg-primary text-primary-foreground shadow-lg shadow-primary/20' : 'text-muted-foreground hover:text-foreground'
                }`}
              >
                <LayoutGrid size={16} />
                Grid
              </button>
              <button
                type="button"
                onClick={() => setViewMode('list')}
                className={`flex items-center gap-2 rounded-xl px-3 py-2 text-sm font-bold transition-all ${
                  viewMode === 'list' ? 'bg-primary text-primary-foreground shadow-lg shadow-primary/20' : 'text-muted-foreground hover:text-foreground'
                }`}
              >
                <List size={16} />
                List
              </button>
            </div>
          </div>

          {loading ? (
            <div className="flex justify-center py-20"><Loader2 size={32} className="animate-spin text-blue-500" /></div>
          ) : filteredHabits.length > 0 ? (
            <div className={viewMode === 'list' ? 'space-y-3' : 'grid grid-cols-1 md:grid-cols-2 gap-6'}>
              <AnimatePresence>
                {filteredHabits.map((habit) => (
                  viewMode === 'list' ? (
                    <HabitListRow
                      key={habit._id}
                      habit={habit}
                      onComplete={handleComplete}
                      onDelete={() => handleDeleteRequest(habit)}
                      onEdit={(h) => { setEditingHabit(h); setIsModalOpen(true); }}
                      onShield={handleUseShield}
                      shieldAvailable={shieldAvailable}
                    />
                  ) : (
                    <HabitCard
                    key={habit._id} 
                    habit={habit} 
                    onComplete={handleComplete} 
                    onDelete={() => handleDeleteRequest(habit)}
                    onEdit={(h) => { setEditingHabit(h); setIsModalOpen(true); }}
                    onShield={handleUseShield}
                    shieldAvailable={shieldAvailable}
                  />
                  )
                ))}
              </AnimatePresence>
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center py-24 bg-secondary/30 rounded-[3rem] border border-dashed border-secondary/60">
              <Plus size={40} className="text-muted-foreground mb-4" />
              <h3 className="text-xl font-bold text-foreground mb-2">No habits found</h3>
              <p className="text-muted-foreground mb-8">Ready to start your journey? Create your first habit!</p>
              <button onClick={() => setIsModalOpen(true)} className="px-8 py-3 rounded-2xl bg-primary text-primary-foreground font-bold transition-all hover:scale-105 active:scale-95">Get Started</button>
            </div>
          )}
        </div>

        <div className="lg:col-span-1 space-y-8">
            <PomodoroTimer onComplete={() => console.log('Work session complete!')} />
            
            {/* Streak Shield Card - Feature Addition */}
            <div className="bg-gradient-to-br from-indigo-600/20 to-secondary/40 p-6 rounded-3xl border border-indigo-500/20 relative overflow-hidden group">
                <div className="relative z-10">
                    <div className="flex items-center gap-3 mb-4">
                        <div className="p-2 bg-indigo-500/20 rounded-xl">
                            <ShieldCheck className="w-5 h-5 text-indigo-400" />
                        </div>
                  <h3 className="font-bold text-foreground">Streak Shields</h3>
                    </div>
                <p className="text-xs text-muted-foreground mb-6 leading-relaxed">
                        Protect your hard-earned streaks for 24 hours. Use them wisely during busy days!
                    </p>
                    <div className="flex justify-between items-end">
                        <div>
                    <p className="text-[10px] text-muted-foreground uppercase tracking-wider mb-1">Available</p>
                    <div className="flex items-center gap-2">
                      <div className={`w-2 h-4 rounded-sm ${shieldAvailable ? 'bg-indigo-500' : 'bg-indigo-500/30'}`} />
                      <span className="text-xs font-bold text-muted-foreground">
                        {shieldAvailable ? '1 shield ready' : '0 shield ready'}
                      </span>
                    </div>
                    {!shieldAvailable && shieldResetsAt && (
                      <p className="text-[10px] text-muted-foreground mt-1">
                      Resets in {shieldCooldownDays} day{shieldCooldownDays === 1 ? '' : 's'}
                      </p>
                    )}
                        </div>
                  <button className="px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-primary-foreground text-xs font-bold rounded-xl transition-all disabled:opacity-50" disabled={!shieldAvailable}>
                    {shieldAvailable ? 'Ready to use' : 'On cooldown'}
                  </button>
                    </div>
                    <div className="mt-5">
                      <p className="text-[10px] text-muted-foreground uppercase tracking-wider mb-2">Recent shields</p>
                      {shieldHistory.length > 0 ? (
                        <div className="space-y-2 text-xs text-muted-foreground">
                          {shieldHistory.map((entry, index) => (
                            <div key={`${entry.habitName}-${entry.date}-${index}`} className="flex items-center justify-between">
                              <span className="font-semibold text-foreground">{entry.habitName}</span>
                              <span>{new Date(entry.date).toLocaleDateString()}</span>
                            </div>
                          ))}
                        </div>
                      ) : (
                        <p className="text-xs text-muted-foreground">No shield uses yet.</p>
                      )}
                    </div>
                </div>
                <div className="absolute -top-4 -right-4 w-24 h-24 bg-indigo-500/10 rounded-full blur-3xl group-hover:bg-indigo-500/20 transition-all" />
            </div>
        </div>
      </div>

      <AnimatePresence>
        {isPackModalOpen && (
          <TemplatePackModal
            isOpen={isPackModalOpen}
            pack={selectedPack}
            onClose={() => {
              setIsPackModalOpen(false);
              setSelectedPack(null);
            }}
            onApply={handleApplyPack}
            isApplying={isApplyingPack}
          />
        )}
      </AnimatePresence>

      <AnimatePresence>
        {isModalOpen && (
          <HabitModal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} habit={editingHabit} onSave={handleCreateOrUpdate} />
        )}
      </AnimatePresence>

      <AnimatePresence>
        {achievementNotice && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 20 }}
            className="fixed bottom-6 right-6 z-[120] w-[320px] glass p-5 rounded-2xl border border-primary/30 shadow-2xl"
          >
            <p className="text-xs font-black uppercase tracking-widest text-primary mb-1">Achievement Unlocked</p>
            <p className="font-black text-foreground mb-3">
              {achievementNotice.badges.length === 1
                ? achievementNotice.badges[0].name
                : `${achievementNotice.badges.length} new achievements`}
            </p>
            <p className="text-sm text-muted-foreground mb-4">
              {achievementNotice.badges[0]?.description}
            </p>
            <div className="flex items-center justify-between gap-3">
              <Link
                to="/achievements"
                className="flex-1 text-center px-4 py-2 rounded-xl bg-primary text-primary-foreground font-bold"
              >
                View Trophies
              </Link>
              <button
                onClick={() => setAchievementNotice(null)}
                className="px-4 py-2 rounded-xl bg-secondary text-foreground font-bold"
              >
                Dismiss
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {deleteCandidate && (
          <motion.div className="fixed inset-0 z-[110] flex items-center justify-center p-6">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="absolute inset-0 bg-black/70 backdrop-blur-sm"
              onClick={() => setDeleteCandidate(null)}
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 10 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 10 }}
              className="relative z-10 w-full max-w-md glass p-6 rounded-3xl border border-rose-500/20"
            >
              {deleteStep === 1 ? (
                <>
                  <h3 className="text-xl font-black text-foreground mb-2">Remove habit?</h3>
                  <p className="text-sm text-muted-foreground mb-6">
                    This will hide it from your list. You can re-add it anytime.
                  </p>
                  <div className="flex gap-3">
                    <button
                      onClick={() => setDeleteCandidate(null)}
                      className="flex-1 px-4 py-3 rounded-xl bg-secondary text-foreground font-bold"
                    >
                      Cancel
                    </button>
                    <button
                      onClick={() => setDeleteStep(2)}
                      className="flex-1 px-4 py-3 rounded-xl bg-rose-500 text-primary-foreground font-bold"
                    >
                      Continue
                    </button>
                  </div>
                </>
              ) : (
                <>
                  <h3 className="text-xl font-black text-foreground mb-2">Type the habit name</h3>
                  <p className="text-sm text-muted-foreground mb-4">
                    Enter <span className="font-bold text-foreground">{deleteCandidate.name}</span> to confirm removal.
                  </p>
                  <input
                    value={deleteConfirmText}
                    onChange={(e) => setDeleteConfirmText(e.target.value)}
                    className="w-full bg-secondary/60 border border-secondary/70 rounded-xl px-4 py-3 text-foreground mb-5"
                    placeholder="Habit name"
                  />
                  <div className="flex gap-3">
                    <button
                      onClick={() => setDeleteCandidate(null)}
                      className="flex-1 px-4 py-3 rounded-xl bg-secondary text-foreground font-bold"
                    >
                      Cancel
                    </button>
                    <button
                      onClick={handleDeleteConfirmed}
                      disabled={deleteConfirmText.trim().toLowerCase() !== deleteCandidate.name.toLowerCase()}
                      className="flex-1 px-4 py-3 rounded-xl bg-rose-500 text-primary-foreground font-bold disabled:opacity-50"
                    >
                      Remove Habit
                    </button>
                  </div>
                </>
              )}
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default Habits;
