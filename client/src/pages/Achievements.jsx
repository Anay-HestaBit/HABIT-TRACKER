import React from 'react';
import { motion } from 'framer-motion';
import { Award, Star, Zap, Flame, Trophy, Shield, Moon, Sun, Filter, PlusCircle } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

const BadgeCard = ({ badge, isUnlocked, delay }) => (
  <motion.div
    initial={{ opacity: 0, scale: 0.9 }}
    animate={{ opacity: 1, scale: 1 }}
    transition={{ delay }}
    className={`glass p-6 rounded-[2rem] border transition-all relative overflow-hidden flex flex-col items-center text-center ${
      isUnlocked ? 'border-primary/30' : 'border-white/5 grayscale opacity-50'
    }`}
  >
    {!isUnlocked && <div className="absolute inset-0 bg-background/20 backdrop-blur-[2px] z-10 flex items-center justify-center" />}
    
    <div className={`w-20 h-20 rounded-3xl mb-6 flex items-center justify-center text-3xl shadow-2xl transition-transform ${
      isUnlocked ? 'bg-primary/20 text-primary shadow-primary/30 group-hover:scale-110' : 'bg-secondary text-muted-foreground'
    }`}>
      {badge.icon}
    </div>

    <h3 className="text-lg font-black mb-2">{badge.name}</h3>
    <p className="text-sm text-muted-foreground font-medium mb-4">{badge.description}</p>
    
    <div className={`px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest ${
      isUnlocked ? 'bg-emerald-500/10 text-emerald-500' : 'bg-secondary text-muted-foreground'
    }`}>
      {isUnlocked ? 'Unlocked' : 'Locked'}
    </div>
  </motion.div>
);

const Achievements = () => {
  const { user } = useAuth();
  
  const allBadges = [
    { id: 1, name: 'Day One', description: 'Complete your first habit.', icon: <Zap />, requirement: 1 },
    { id: 2, name: 'Creator', description: 'Create your first habit.', icon: <PlusCircle />, requirement: 1 },
    { id: 3, name: 'Consistency Pro', description: 'Maintain a 7-day streak.', icon: <Flame />, requirement: 7 },
    { id: 4, name: 'Habit Master', description: 'Complete 100 total habits.', icon: <Trophy />, requirement: 100 },
    { id: 5, name: 'Early Bird', description: 'Complete a habit before 8 AM.', icon: <Sun />, requirement: 0 },
    { id: 6, name: 'Night Owl', description: 'Complete a habit after 10 PM.', icon: <Moon />, requirement: 0 },
    { id: 7, name: 'World Builder', description: 'Reach World Level 5.', icon: <Star />, requirement: 5 },
    { id: 8, name: 'Streak Shield', description: 'Use your first streak shield.', icon: <Shield />, requirement: 1 },
  ];

  // Logic to determine if unlocked
  const unlockedIds = user?.badges?.map(b => b.name) || [];

  return (
    <div className="space-y-10">
      <header className="flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div>
          <h1 className="text-4xl font-black mb-2">My Trophies</h1>
          <p className="text-muted-foreground font-medium">Earn rewards for your loyalty and hard work.</p>
        </div>
        <div className="glass px-6 py-3 rounded-2xl border border-white/10 flex items-center gap-4">
          <div className="text-right">
            <p className="text-[10px] font-black uppercase text-muted-foreground tracking-widest">XP Progress</p>
            <p className="font-bold">{user?.xp} / 1000</p>
          </div>
          <div className="w-12 h-12 rounded-xl bg-primary/20 flex items-center justify-center text-primary font-black">
            {Math.floor((user?.xp || 0) / 100)}
          </div>
        </div>
      </header>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {allBadges.map((badge, i) => (
          <BadgeCard 
            key={badge.id} 
            badge={badge} 
            isUnlocked={unlockedIds.includes(badge.name)} 
            delay={i * 0.05}
          />
        ))}
      </div>
    </div>
  );
};

export default Achievements;
