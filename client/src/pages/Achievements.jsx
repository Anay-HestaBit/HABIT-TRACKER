import React from 'react';
import { motion } from 'framer-motion';
import { Award, Star, Zap, Flame, Trophy, Shield, Moon, Sun, Lock, PlusCircle } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

const BadgeCard = ({ badge, isUnlocked, delay }) => (
  <motion.div
    // FIX: Only animate opacity — scale animation causes subpixel rendering
    // which makes text appear blurry, especially on non-retina displays.
    initial={{ opacity: 0 }}
    animate={{ opacity: 1 }}
    transition={{ delay, duration: 0.4 }}
    className={`relative p-6 rounded-[2rem] border flex flex-col items-center text-center transition-all ${
      isUnlocked
        ? 'glass border-primary/30 shadow-lg shadow-primary/10'
        : 'bg-secondary/50 border-secondary/60 opacity-60'
    }`}
  >
    {/* Lock overlay for locked badges - solid so it doesn't add blur */}
    {!isUnlocked && (
      <div className="absolute inset-0 rounded-[2rem] bg-secondary/70 z-10 flex items-center justify-center">
        <Lock className="w-6 h-6 text-muted-foreground" />
      </div>
    )}

    <div
      className={`w-20 h-20 rounded-3xl mb-6 flex items-center justify-center shadow-2xl ${
        isUnlocked
          ? 'bg-primary/20 text-primary shadow-primary/20'
          : 'bg-secondary text-muted-foreground'
      }`}
    >
      <div className="w-8 h-8">{badge.icon}</div>
    </div>

    <h3 className={`text-lg font-black mb-2 ${isUnlocked ? 'text-foreground' : 'text-muted-foreground'}`}>
      {badge.name}
    </h3>
    <p className="text-sm text-muted-foreground font-medium mb-4">{badge.description}</p>

    <div
      className={`px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest ${
        isUnlocked
          ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20'
          : 'bg-secondary text-muted-foreground'
      }`}
    >
      {isUnlocked ? '✓ Unlocked' : 'Locked'}
    </div>
  </motion.div>
);

const Achievements = () => {
  const { user } = useAuth();

  const allBadges = [
    { id: 1, name: 'Day One',        description: 'Complete your first habit.',    icon: <Zap />,        },
    { id: 2, name: 'Creator',        description: 'Create your first habit.',      icon: <PlusCircle />, },
    { id: 3, name: 'Consistency Pro',description: 'Maintain a 7-day streak.',      icon: <Flame />,      },
    { id: 4, name: 'Habit Master',   description: 'Complete 30 total habits.',     icon: <Trophy />,     },
    { id: 5, name: 'Early Bird',     description: 'Complete a habit before 8 AM.', icon: <Sun />,        },
    { id: 6, name: 'Night Owl',      description: 'Complete a habit after 10 PM.', icon: <Moon />,       },
    { id: 7, name: 'World Builder',  description: 'Reach World Level 5.',          icon: <Star />,       },
    { id: 8, name: 'Streak Shield',  description: 'Use your first streak shield.', icon: <Shield />,     },
  ];

  const unlockedNames = user?.badges?.map(b => b.name) || [];
  const unlockedCount = unlockedNames.length;
  const xpToNextLevel = 1000 - (user?.xp % 1000 || 0);

  return (
    <div className="space-y-10">
      <header className="flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div>
          <h1 className="text-4xl font-black mb-2">My Trophies</h1>
          <p className="text-muted-foreground font-medium">
            {unlockedCount} of {allBadges.length} achievements unlocked
          </p>
        </div>
        <div className="glass px-6 py-4 rounded-2xl border border-white/10 flex items-center gap-6">
          <div>
            <p className="text-[10px] font-black uppercase text-muted-foreground tracking-widest mb-1">
              Total XP
            </p>
            <p className="text-2xl font-black text-primary">{user?.xp || 0}</p>
          </div>
          <div className="w-px h-10 bg-white/10" />
          <div>
            <p className="text-[10px] font-black uppercase text-muted-foreground tracking-widest mb-1">
              Level
            </p>
            <p className="text-2xl font-black">{user?.level || 1}</p>
          </div>
          <div className="w-px h-10 bg-white/10" />
          <div>
            <p className="text-[10px] font-black uppercase text-muted-foreground tracking-widest mb-1">
              Next Level
            </p>
            <p className="text-sm font-bold text-muted-foreground">{xpToNextLevel} XP away</p>
          </div>
        </div>
      </header>

      {/* Progress bar */}
      <div className="glass p-4 rounded-2xl border border-white/10">
        <div className="flex justify-between text-xs font-bold text-muted-foreground mb-2">
          <span>Achievement Progress</span>
          <span>{unlockedCount} / {allBadges.length}</span>
        </div>
        <div className="w-full bg-secondary/60 rounded-full h-2">
          <div
            className="bg-primary h-2 rounded-full transition-all duration-700"
            style={{ width: `${(unlockedCount / allBadges.length) * 100}%` }}
          />
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {allBadges.map((badge, i) => (
          <BadgeCard
            key={badge.id}
            badge={badge}
            isUnlocked={unlockedNames.includes(badge.name)}
            delay={i * 0.05}
          />
        ))}
      </div>
    </div>
  );
};

export default Achievements;