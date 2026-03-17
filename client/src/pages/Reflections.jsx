import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  BookOpen, 
  Smile, 
  Meh, 
  Frown, 
  Sunrise, 
  Save,
  Loader2,
  Calendar as CalendarIcon
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

  useEffect(() => {
    // fetchData();
    // Simplified entries for demo
    setEntries([
      { id: 1, date: '2026-03-16', content: 'Feeling great today! Completed all my habits and the tree is looking bigger.', mood: 'amazing' },
      { id: 2, date: '2026-03-15', content: 'Struggled a bit with reading, but got it done eventually. Need to sleep more.', mood: 'okay' }
    ]);
  }, []);

  const handleSave = async () => {
    if (!content) return;
    setLoading(true);
    try {
      // await api.post('/reflections', { content, mood, date: new Date() });
      setIsSuccess(true);
      setTimeout(() => setIsSuccess(false), 3000);
      setEntries([
        { id: Date.now(), date: new Date().toISOString().split('T')[0], content, mood },
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
                  ? 'bg-emerald-500 text-white shadow-xl shadow-emerald-500/20' 
                  : 'bg-primary text-white shadow-xl shadow-primary/20 hover:translate-y-[-2px]'
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
                key={entry.id}
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
    </div>
  );
};


export default Reflections;
