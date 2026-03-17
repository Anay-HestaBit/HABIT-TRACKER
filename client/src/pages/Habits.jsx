import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Plus, 
  Flame, 
  Trash2, 
  Edit3, 
  Check, 
  Loader2, 
  Search,
  CheckCircle2,
  X,
  Sparkles,
  ShieldCheck
} from 'lucide-react';
import api from '../api/axios';
import { useAuth } from '../context/AuthContext';
import PomodoroTimer from '../components/PomodoroTimer';

const HabitCard = ({ habit, onComplete, onDelete, onEdit }) => {
  const isCompletedToday = habit.completions?.some(c => {
    const today = new Date().toISOString().split('T')[0];
    return c.date.startsWith(today);
  });

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
          <div className="w-12 h-12 rounded-2xl bg-slate-800 flex items-center justify-center text-xl" style={{ borderLeft: `4px solid ${habit.color}` }}>
            <span style={{ color: habit.color }}>{habit.name.charAt(0).toUpperCase()}</span>
          </div>
          <div>
            <h3 className="text-lg font-black text-white">{habit.name}</h3>
            <p className="text-xs text-slate-500 font-bold uppercase tracking-widest">{habit.frequency}</p>
          </div>
        </div>
        <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
          <button onClick={() => onEdit(habit)} className="p-2 text-slate-500 hover:text-white transition-colors">
            <Edit3 size={18} />
          </button>
          <button onClick={() => onDelete(habit._id)} className="p-2 text-slate-500 hover:text-rose-500 transition-colors">
            <Trash2 size={18} />
          </button>
        </div>
      </div>

      <div className="flex items-end justify-between">
        <div className="flex items-center gap-2 text-orange-500 font-black italic">
          <Flame size={20} className="fill-current" />
          <span className="text-xl">{habit.streak}</span>
        </div>
        
        <button
          onClick={() => !isCompletedToday && onComplete(habit._id)}
          disabled={isCompletedToday}
          className={`px-6 py-3 rounded-2xl font-black transition-all flex items-center gap-2 ${
            isCompletedToday 
              ? 'bg-emerald-500/10 text-emerald-500 cursor-default' 
              : 'bg-white text-black hover:bg-blue-600 hover:text-white shadow-xl hover:shadow-blue-500/20'
          }`}
        >
          {isCompletedToday ? (
            <><Check size={20} /> Done</>
          ) : (
            <><div className="w-5 h-5 rounded-full border-2 border-current/30" /> Complete</>
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
          <h2 className="text-2xl font-black text-white">{habit ? 'Edit Habit' : 'New Habit'}</h2>
          <button onClick={onClose} className="p-2 text-slate-500 hover:text-white hover:bg-slate-800 rounded-xl transition-all">
            <X size={24} />
          </button>
        </div>

        <form onSubmit={(e) => { e.preventDefault(); onSave(formData); }} className="space-y-6">
          <div className="space-y-2">
            <label className="text-sm font-bold text-slate-500 ml-1 uppercase tracking-widest">Habit Name</label>
            <input
              type="text"
              required
              value={formData.name}
              onChange={(e) => setFormData({...formData, name: e.target.value})}
              placeholder="e.g. Morning Meditation"
              className="w-full bg-slate-900/50 border border-slate-700 rounded-2xl py-4 px-6 text-white focus:outline-none focus:ring-2 focus:ring-blue-500/50 transition-all font-medium"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <label className="text-sm font-bold text-slate-500 ml-1 uppercase tracking-widest">Frequency</label>
              <select
                value={formData.frequency}
                onChange={(e) => setFormData({...formData, frequency: e.target.value})}
                className="w-full bg-slate-900/50 border border-slate-700 rounded-2xl py-4 px-6 text-white appearance-none outline-none focus:ring-2 focus:ring-blue-500/50 transition-all"
              >
                <option value="daily">Daily</option>
                <option value="weekly">Weekly</option>
              </select>
            </div>
            <div className="space-y-2">
              <label className="text-sm font-bold text-slate-500 ml-1 uppercase tracking-widest">Accent Color</label>
              <div className="flex items-center gap-3">
                <input
                  type="color"
                  value={formData.color}
                  onChange={(e) => setFormData({...formData, color: e.target.value})}
                  className="w-12 h-12 rounded-xl bg-transparent border-none cursor-pointer p-0"
                />
                <span className="text-sm font-mono text-slate-400 uppercase">{formData.color}</span>
              </div>
            </div>
          </div>

          <button
            type="submit"
            className="w-full py-4 rounded-2xl bg-blue-600 text-white font-black text-lg shadow-xl shadow-blue-600/20 hover:translate-y-[-2px] hover:shadow-blue-600/40 active:translate-y-0 transition-all"
          >
            {habit ? 'Save Changes' : 'Create Habit'}
          </button>
        </form>
      </motion.div>
    </div>
  );
};

const Habits = () => {
  const [habits, setHabits] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingHabit, setEditingHabit] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [aiSuggestion, setAiSuggestion] = useState(null);
  const { setUser } = useAuth();

  useEffect(() => {
    fetchHabits();
  }, []);

  const fetchHabits = async () => {
    try {
      const { data } = await api.get('/habits');
      setHabits(data);
    } catch (err) {
      console.error('Error fetching habits');
    } finally {
      setLoading(false);
    }
  };

  const handleCreateOrUpdate = async (formData) => {
    try {
      if (editingHabit) {
        await api.put(`/habits/${editingHabit._id}`, formData);
      } else {
        await api.post('/habits', formData);
      }
      setIsModalOpen(false);
      setEditingHabit(null);
      fetchHabits();
    } catch (err) {
      console.error('Error saving habit');
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
        worldState: data.worldState
      }));
    } catch (err) {
      console.error('Error completing habit');
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm('Are you sure you want to remove this habit?')) {
      try {
        await api.delete(`/habits/${id}`);
        setHabits(habits.filter(h => h._id !== id));
      } catch (err) {
        console.error('Error deleting habit');
      }
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
              <h1 className="text-5xl font-black text-white mb-2 italic tracking-tighter">My Journey</h1>
              <p className="text-slate-500 font-medium">Build consistency, unlock rewards, and evolve.</p>
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
                      className="absolute bottom-full right-0 mb-4 w-64 p-4 bg-indigo-600 text-white rounded-2xl shadow-2xl z-50 text-sm font-medium"
                    >
                      {aiSuggestion}
                      <div className="absolute top-full right-6 -translate-y-1/2 w-4 h-4 bg-indigo-600 rotate-45" />
                    </motion.div>
                  )}
                </AnimatePresence>
              </button>
              <button
                onClick={() => { setEditingHabit(null); setIsModalOpen(true); }}
                className="flex items-center gap-2 px-6 py-3 rounded-2xl bg-white text-black font-bold shadow-xl shadow-white/5 hover:translate-y-[-2px] transition-all"
              >
                <Plus size={20} />
                Create New
              </button>
            </div>
          </header>

          <div className="relative group max-w-md">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500 group-focus-within:text-blue-500 transition-colors" size={20} />
            <input
              type="text"
              placeholder="Search habits..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full bg-slate-800/50 border border-slate-700/50 rounded-2xl py-3 pl-12 pr-4 text-white focus:outline-none focus:ring-2 focus:ring-blue-500/30 transition-all font-medium"
            />
          </div>

          {loading ? (
            <div className="flex justify-center py-20"><Loader2 size={32} className="animate-spin text-blue-500" /></div>
          ) : filteredHabits.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <AnimatePresence>
                {filteredHabits.map((habit) => (
                  <HabitCard 
                    key={habit._id} 
                    habit={habit} 
                    onComplete={handleComplete} 
                    onDelete={handleDelete}
                    onEdit={(h) => { setEditingHabit(h); setIsModalOpen(true); }}
                  />
                ))}
              </AnimatePresence>
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center py-24 bg-slate-800/20 rounded-[3rem] border border-dashed border-slate-700">
              <Plus size={40} className="text-slate-600 mb-4" />
              <h3 className="text-xl font-bold text-white mb-2">No habits found</h3>
              <p className="text-slate-500 mb-8">Ready to start your journey? Create your first habit!</p>
              <button onClick={() => setIsModalOpen(true)} className="px-8 py-3 rounded-2xl bg-blue-600 text-white font-bold transition-all hover:scale-105 active:scale-95">Get Started</button>
            </div>
          )}
        </div>

        <div className="lg:col-span-1 space-y-8">
            <PomodoroTimer onComplete={() => console.log('Work session complete!')} />
            
            {/* Streak Shield Card - Feature Addition */}
            <div className="bg-gradient-to-br from-indigo-900/40 to-slate-900/40 p-6 rounded-3xl border border-indigo-500/20 relative overflow-hidden group">
                <div className="relative z-10">
                    <div className="flex items-center gap-3 mb-4">
                        <div className="p-2 bg-indigo-500/20 rounded-xl">
                            <ShieldCheck className="w-5 h-5 text-indigo-400" />
                        </div>
                        <h3 className="font-bold text-white">Streak Shields</h3>
                    </div>
                    <p className="text-xs text-slate-400 mb-6 leading-relaxed">
                        Protect your hard-earned streaks for 24 hours. Use them wisely during busy days!
                    </p>
                    <div className="flex justify-between items-end">
                        <div>
                            <p className="text-[10px] text-slate-500 uppercase tracking-wider mb-1">Available</p>
                            <div className="flex gap-1">
                                <div className="w-2 h-4 bg-indigo-500 rounded-sm" />
                                <div className="w-2 h-4 bg-indigo-500/30 rounded-sm" />
                                <div className="w-2 h-4 bg-indigo-500/30 rounded-sm" />
                            </div>
                        </div>
                        <button className="px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold rounded-xl transition-all disabled:opacity-50" disabled>
                            Activate (Level 5)
                        </button>
                    </div>
                </div>
                <div className="absolute -top-4 -right-4 w-24 h-24 bg-indigo-500/10 rounded-full blur-3xl group-hover:bg-indigo-500/20 transition-all" />
            </div>
        </div>
      </div>

      <AnimatePresence>
        {isModalOpen && (
          <HabitModal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} habit={editingHabit} onSave={handleCreateOrUpdate} />
        )}
      </AnimatePresence>
    </div>
  );
};

export default Habits;
