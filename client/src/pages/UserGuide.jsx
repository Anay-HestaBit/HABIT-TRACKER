import React from 'react';
import { motion } from 'framer-motion';
import { 
  Globe2, 
  Zap, 
  Flame, 
  Trophy, 
  BookOpen, 
  ChevronRight, 
  Star,
  Shield,
  Target
} from 'lucide-react';

const GuideSection = ({ icon: Icon, title, description, delay }) => (
  <motion.div
    initial={{ opacity: 0, x: -20 }}
    animate={{ opacity: 1, x: 0 }}
    transition={{ delay }}
    className="flex gap-6 p-6 rounded-3xl hover:bg-secondary/30 transition-all group"
  >
    <div className="w-12 h-12 rounded-2xl bg-primary/10 flex items-center justify-center text-primary shrink-0 group-hover:scale-110 transition-transform">
      <Icon size={24} />
    </div>
    <div>
      <h3 className="text-xl font-bold mb-2">{title}</h3>
      <p className="text-muted-foreground leading-relaxed">{description}</p>
    </div>
  </motion.div>
);

const UserGuide = () => {
  const steps = [
    {
      icon: Target,
      title: "1. Create Your Habits",
      description: "Stat by adding habits you want to build. Choose between daily or weekly frequencies. Give them a name and a color that motivates you.",
      delay: 0.1
    },
    {
      icon: Zap,
      title: "2. Track Completion",
      description: "Mark your habits as complete every day. Each completion earns you XP and contributes to your digital world's growth.",
      delay: 0.2
    },
    {
      icon: Flame,
      title: "3. Maintain Streaks",
      description: "Consistency is key. Building streaks unlocks bonuses and accelerates your level progression. Level up from a Seedling to a Majestic Oak!",
      delay: 0.3
    },
    {
      icon: Globe2,
      title: "4. Evolve Your World",
      description: "Visit the 'Visual World' to see your progress manifest. Your tree grows new branches and leaves based on your habits and streaks.",
      delay: 0.4
    },
    {
      icon: Shield,
      title: "5. Use Streak Shields",
      description: "Life happens. Use your monthly Streak Shield to protect your progress if you miss a day. It resets every 30 days.",
      delay: 0.5
    }
  ];

  return (
    <div className="max-w-4xl space-y-12 pb-20">
      <header className="text-center space-y-4">
        <motion.div
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          className="inline-block p-4 rounded-3xl bg-primary/20 text-primary mb-4"
        >
          <BookOpen size={32} />
        </motion.div>
        <h1 className="text-5xl font-black">Explorer's Guide</h1>
        <p className="text-xl text-muted-foreground">Master the art of consistency and build your digital empire.</p>
      </header>

      <div className="grid gap-4">
        {steps.map((step, i) => (
          <GuideSection key={i} {...step} />
        ))}
      </div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.6 }}
        className="glass p-10 rounded-[3rem] border border-primary/20 bg-primary/5 text-center space-y-6"
      >
        <div className="flex justify-center gap-2">
          {[...Array(5)].map((_, i) => (
            <Star key={i} className="text-primary fill-primary" size={20} />
          ))}
        </div>
        <h2 className="text-2xl font-bold">Ready to start your journey?</h2>
        <p className="text-muted-foreground max-w-lg mx-auto">
          Remember, the best time to start was yesterday. The second best time is right now. Good luck, Explorer!
        </p>
      </motion.div>
    </div>
  );
};

export default UserGuide;
