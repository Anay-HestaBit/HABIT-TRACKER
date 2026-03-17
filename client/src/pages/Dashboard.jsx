import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { 
  Zap, 
  Trophy, 
  Flame, 
  TrendingUp, 
  CheckCircle2, 
  AlertCircle,
  Loader2,
  Plus,
  Globe2
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import api from '../api/axios';
import { Link } from 'react-router-dom';
import ConsistencyBoard from '../components/ConsistencyBoard';

const StatsCard = ({ icon: Icon, label, value, subtext, color, delay }) => (
  <motion.div
    initial={{ opacity: 0, y: 20 }}
    animate={{ opacity: 1, y: 0 }}
    transition={{ delay }}
    className="glass p-6 rounded-3xl border border-white/5 relative overflow-hidden group"
  >
    <div className={`absolute top-0 right-0 w-24 h-24 blur-[60px] opacity-20 -mr-10 -mt-10 ${color}`} />
    
    <div className="flex items-start justify-between mb-4">
      <div className={`p-3 rounded-2xl ${color} bg-opacity-10 text-opacity-100`}>
        <Icon size={24} className={color.replace('bg-', 'text-')} />
      </div>
    </div>
    
    <div className="space-y-1">
      <h3 className="text-3xl font-black">{value}</h3>
      <p className="text-muted-foreground font-medium text-sm">{label}</p>
    </div>
    
    <p className="mt-4 text-xs font-bold text-muted-foreground uppercase tracking-widest">{subtext}</p>
  </motion.div>
);

const Dashboard = () => {
  const { user } = useAuth();
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const { data } = await api.get('/progress/dashboard');
        setStats(data);
      } catch (err) {
        setError('Failed to load dashboard stats');
      } finally {
        setLoading(false);
      }
    };
    fetchStats();
  }, []);

  if (loading) return (
    <div className="h-[60vh] flex flex-col items-center justify-center gap-4">
      <Loader2 size={40} className="animate-spin text-primary" />
      <p className="text-muted-foreground font-medium">Loading your journey...</p>
    </div>
  );

  return (
    <div className="space-y-10">
      <header className="flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div>
          <h1 className="text-4xl font-black mb-2">
            {stats?.totalHabits === 0 ? 'Welcome' : 'Welcome back'}, {user?.fullName?.split(' ')[0] || user?.username}!
          </h1>
          <p className="text-muted-foreground font-medium">Your world is thriving. Keep up the consistency!</p>
        </div>
        <Link 
          to="/habits" 
          className="flex items-center gap-2 px-6 py-3 rounded-2xl bg-primary text-white font-bold shadow-xl shadow-primary/20 hover:translate-y-[-2px] transition-all"
        >
          <Plus size={20} />
          New Habit
        </Link>
      </header>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatsCard 
          icon={Flame} 
          label="Current Streak" 
          value={`${stats?.maxStreak || 0} Days`} 
          subtext="Your Progress"
          color="bg-orange-500"
          delay={0.1}
        />
        <StatsCard 
          icon={Zap} 
          label="Total XP" 
          value={stats?.user?.xp || 0} 
          subtext={`Level ${stats?.user?.level} Seedling`}
          color="bg-primary"
          delay={0.2}
        />
        <StatsCard 
          icon={CheckCircle2} 
          label="Completed Today" 
          value={`${stats?.habitsCompletedToday || 0}/${stats?.totalHabits || 0}`} 
          subtext={`${stats?.completionPercentage || 0}% Daily Goal`}
          color="bg-emerald-500"
          delay={0.3}
        />
        <StatsCard 
          icon={Trophy} 
          label="Achievements" 
          value={`${stats?.user?.badges?.length || 0} Unlocked`} 
          subtext="Next: Consistency Pro"
          color="bg-blue-500"
          delay={0.4}
        />
      </div>
      
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.5 }}
      >
        <ConsistencyBoard />
      </motion.div>

      <div className="grid lg:grid-cols-3 gap-8">
        {/* World Preview Card */}
        <motion.div 
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.5 }}
          className="lg:col-span-2 glass rounded-[2.5rem] border border-white/5 p-8 relative overflow-hidden flex flex-col items-center justify-center min-h-[400px]"
        >
          <div className="absolute inset-0 bg-gradient-to-br from-primary/5 to-accent/5" />
          <div className="relative z-10 text-center">
            <h2 className="text-2xl font-black mb-8">Visual World State</h2>
            <div className="w-48 h-48 rounded-full bg-primary/20 flex items-center justify-center mb-8 relative">
              <div className="absolute inset-0 rounded-full border-4 border-dashed border-primary/30 animate-spin-slow" />
              <Globe2 size={80} className="text-primary" />
            </div>
            <p className="text-muted-foreground font-medium mb-6">Level {stats?.user?.level} World evolving...</p>
            <Link to="/world" className="px-8 py-3 rounded-full glass border border-white/10 hover:bg-white/5 transition-all font-bold">
              Enter Visual World
            </Link>
          </div>
        </motion.div>

        {/* Quick Tips or Reminders */}
        <motion.div 
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.6 }}
          className="glass rounded-[2.5rem] border border-white/5 p-8"
        >
          <h2 className="text-xl font-black mb-6 flex items-center gap-2">
            <AlertCircle className="text-primary" size={20} />
            Quick Tips
          </h2>
          <div className="space-y-4">
            {[
              "Complete your habits today for a 50 XP bonus!",
              "Building consistency evoloves your digital world.",
              "Check the Visual World to see your growth.",
              "Use Streak Shields to protect your progress."
            ].map((tip, i) => (
              <div key={i} className="p-4 rounded-2xl bg-secondary/30 border border-white/5 text-sm font-medium">
                {tip}
              </div>
            ))}
          </div>
        </motion.div>
      </div>
    </div>
  );
};

export default Dashboard;
