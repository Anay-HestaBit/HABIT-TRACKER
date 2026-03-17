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
  X
} from 'lucide-react';
import api from '../api/axios';
import { useAuth } from '../context/AuthContext';

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
          <div className="w-12 h-12 rounded-2xl bg-secondary flex items-center justify-center text-xl" style={{ color: habit.color }}>
            {/* Logic for icon could be better, for now using a char */}
            {habit.name.charAt(0).toUpperCase()}
          </div>
          <div>
            <h3 className="text-lg font-black">{habit.name}</h3>
            <p className="text-xs text-muted-foreground font-bold uppercase tracking-widest">{habit.frequency}</p>
          </div>
        </div>
        <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
          <button onClick={() => onEdit(habit)} className="p-2 text-muted-foreground hover:text-white transition-colors">
            <Edit3 size={18} />
          </button>
          <button onClick={() => onDelete(habit._id)} className="p-2 text-muted-foreground hover:text-destructive transition-colors">
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
              ? 'bg-emerald-500/20 text-emerald-500 cursor-default' 
              : 'bg-white text-black hover:bg-primary hover:text-white shadow-xl hover:shadow-primary/30'
          }`}
        >
          {isCompletedToday ? (
            <>
              <Check size={20} />
              Done
            </>
          ) : (
            <>
              Complete
              <div className="w-5 h-5 rounded-full border-2 border-current/30" />
            </>
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
    color: '#8B5CF6'
  });

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-6 sm:p-0">
      <motion.div 
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="absolute inset-0 bg-black/60 backdrop-blur-sm"
        onClick={onClose}
      />
      <motion.div 
        initial={{ opacity: 0, scale: 0.9, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.9, y: 20 }}
        className="glass w-full max-w-lg p-8 rounded-[2.5rem] border border-white/10 relative z-10"
      >
        <div className="flex justify-between items-center mb-8">
          <h2 className="text-2xl font-black">{habit ? 'Edit Habit' : 'New Habit'}</h2>
          <button onClick={onClose} className="p-2 text-muted-foreground hover:text-white hover:bg-secondary rounded-xl transition-all">
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
              placeholder="e.g. Read for 30 mins"
              className="w-full bg-secondary/50 border border-white/5 rounded-2xl py-4 px-6 text-foreground focus:outline-none focus:ring-2 focus:ring-primary/50 transition-all font-medium"
            />
          </div>

          <div className="space-y-2">
            <label className="text-sm font-bold text-muted-foreground ml-1 uppercase tracking-widest">Description (Optional)</label>
            <textarea
              value={formData.description}
              onChange={(e) => setFormData({...formData, description: e.target.value})}
              placeholder="Why this habit?"
              className="w-full bg-secondary/50 border border-white/5 rounded-2xl py-4 px-6 text-foreground focus:outline-none focus:ring-2 focus:ring-primary/50 transition-all font-medium h-24 resize-none"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <label className="text-sm font-bold text-muted-foreground ml-1 uppercase tracking-widest">Frequency</label>
              <select
                value={formData.frequency}
                onChange={(e) => setFormData({...formData, frequency: e.target.value})}
                className="w-full bg-secondary/50 border border-white/5 rounded-2xl py-4 px-6 text-foreground focus:outline-none focus:ring-2 focus:ring-primary/50 transition-all font-medium"
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
                <span className="text-sm font-medium opacity-60 uppercase">{formData.color}</span>
              </div>
            </div>
          </div>

          <button
            type="submit"
            className="w-full py-4 rounded-2xl bg-primary text-white font-black text-lg shadow-xl shadow-primary/20 hover:translate-y-[-2px] hover:shadow-primary/40 active:translate-y-0 transition-all"
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
      
      // Update local habit state
      setHabits(habits.map(h => h._id === id ? data.habit : h));
      
      // Update global user state (XP, Level, etc.)
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

  const filteredHabits = habits.filter(h => 
    h.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="space-y-10">
      <header className="flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div>
          <h1 className="text-4xl font-black mb-2">My Habits</h1>
          <p className="text-muted-foreground font-medium">Strive for consistency and watch your world bloom.</p>
        </div>
        <button
          onClick={() => { setEditingHabit(null); setIsModalOpen(true); }}
          className="flex items-center gap-2 px-6 py-3 rounded-2xl bg-white text-black font-bold shadow-xl shadow-white/5 hover:translate-y-[-2px] transition-all"
        >
          <Plus size={20} />
          Create New
        </button>
      </header>

      <div className="relative group max-w-md">
        <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-muted-foreground group-focus-within:text-primary transition-colors" size={20} />
        <input
          type="text"
          placeholder="Search habits..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="w-full bg-secondary/30 border border-white/5 rounded-2xl py-3 pl-12 pr-4 text-foreground focus:outline-none focus:ring-2 focus:ring-primary/30 transition-all font-medium"
        />
      </div>

      {loading ? (
        <div className="flex justify-center py-20">
          <Loader2 size={32} className="animate-spin text-primary" />
        </div>
      ) : filteredHabits.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
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
        <div className="flex flex-col items-center justify-center py-24 glass rounded-[3rem] border border-dashed border-white/10">
          <div className="w-20 h-20 rounded-3xl bg-secondary flex items-center justify-center mb-6 text-muted-foreground">
            <PlusCircle size={40} />
          </div>
          <h3 className="text-xl font-bold mb-2">No habits found</h3>
          <p className="text-muted-foreground mb-8">Ready to start your journey? Create your first habit!</p>
          <button
            onClick={() => setIsModalOpen(true)}
            className="px-8 py-3 rounded-2xl bg-primary text-white font-bold transition-all hover:scale-105 active:scale-95"
          >
            Get Started
          </button>
        </div>
      )}

      <AnimatePresence>
        {isModalOpen && (
          <HabitModal 
            isOpen={isModalOpen} 
            onClose={() => setIsModalOpen(false)} 
            habit={editingHabit}
            onSave={handleCreateOrUpdate}
          />
        )}
      </AnimatePresence>
    </div>
  );
};

const PlusCircle = ({ size }) => <Plus size={size} />;

export default Habits;
