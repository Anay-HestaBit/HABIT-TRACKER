import React, { useMemo } from 'react';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { 
  Cloud, 
  Sun, 
  Wind, 
  Info,
  ChevronRight,
  Sparkles,
  TreeDeciduous
} from 'lucide-react';

const EvolvingTree = ({ state }) => {
  const { treeLevel, branches, leaves, flowers, fruits } = state || { treeLevel: 1, branches: 2, leaves: 5 };

  // Generate branches based on state
  const renderedBranches = useMemo(() => {
    const items = [];
    const count = Math.min(branches, 12);
    for (let i = 0; i < count; i++) {
      const angle = (i / count) * 180 - 90;
      const x2 = 100 + Math.cos((angle * Math.PI) / 180) * (40 + treeLevel * 5);
      const y2 = 150 + Math.sin((angle * Math.PI) / 180) * (40 + treeLevel * 5);
      items.push({ x1: 100, y1: 160, x2, y2, id: i });
    }
    return items;
  }, [branches, treeLevel]);

  // Generate leaves
  const renderedLeaves = useMemo(() => {
    const items = [];
    const leafCount = Math.min(leaves, 40);
    renderedBranches.forEach((branch, bIdx) => {
      const perBranch = Math.ceil(leafCount / renderedBranches.length);
      for (let i = 0; i < perBranch; i++) {
        const offset = (i / perBranch) * 20;
        items.push({ 
          x: branch.x2 + (Math.random() - 0.5) * 15, 
          y: branch.y2 + (Math.random() - 0.5) * 15,
          id: `${bIdx}-${i}`
        });
      }
    });
    return items;
  }, [renderedBranches, leaves]);

  return (
    <svg viewBox="0 0 200 200" className="w-full h-full">
      {/* Trunk */}
      <motion.path
        d="M90 200 Q100 150 110 200"
        fill="#5D4037"
        initial={{ d: "M95 200 Q100 180 105 200" }}
        animate={{ d: `M${100 - 10 - treeLevel} 200 Q100 ${180 - treeLevel * 10} ${100 + 10 + treeLevel} 200` }}
        transition={{ duration: 1, type: "spring" }}
      />
      
      {/* Main Core */}
      <motion.circle
        cx="100"
        cy="150"
        r={10 + treeLevel * 2}
        fill="#795548"
        animate={{ r: 10 + treeLevel * 2 }}
        transition={{ duration: 1, type: "spring" }}
      />

      {/* Branches */}
      {renderedBranches.map((branch, i) => (
        <motion.line
          key={branch.id}
          x1={branch.x1}
          y1={branch.y1}
          x2={branch.x1}
          y2={branch.y1}
          animate={{ x2: branch.x2, y2: branch.y2 }}
          transition={{ duration: 1, delay: i * 0.1 }}
          stroke="#795548"
          strokeWidth={4 - Math.min(treeLevel, 3)}
          strokeLinecap="round"
        />
      ))}

      {/* Leaves */}
      {renderedLeaves.map((leaf, i) => (
        <motion.circle
          key={leaf.id}
          cx={leaf.x}
          cy={leaf.y}
          r={0}
          animate={{ r: 3 + Math.random() * 2 }}
          transition={{ duration: 0.5, delay: 0.5 + i * 0.05 }}
          fill={i % 2 === 0 ? "#4CAF50" : "#81C784"}
        />
      ))}

      {/* Glow Effect */}
      <defs>
        <radialGradient id="treeGlow">
          <stop offset="0%" stopColor="rgba(139, 92, 246, 0.3)" />
          <stop offset="100%" stopColor="transparent" />
        </radialGradient>
      </defs>
      <circle cx="100" cy="140" r="60" fill="url(#treeGlow)" />
    </svg>
  );
};

const World = () => {
  const { user } = useAuth();
  const worldState = user?.worldState || { treeLevel: 1, branches: 2, leaves: 5 };

  return (
    <div className="h-[calc(100vh-12rem)] flex flex-col lg:flex-row gap-8">
      {/* Visual Scene Area */}
      <div className="flex-1 glass rounded-[3rem] border border-white/10 relative overflow-hidden bg-gradient-to-b from-[#0f172a] to-[#1e1b4b]">
        {/* Sky Elements */}
        <div className="absolute top-12 left-12 flex gap-12 text-white/10">
          <Cloud className="animate-pulse" size={48} />
          <Wind className="mt-20 animate-bounce" size={32} />
        </div>
        <Sun className="absolute top-10 right-10 text-yellow-500/20 blur-xl animate-pulse" size={120} />
        <Sun className="absolute top-10 right-10 text-yellow-500/10" size={120} />

        {/* The Evolving Tree */}
        <div className="absolute inset-0 flex items-center justify-center p-10 mt-10">
          <div className="w-full max-w-[500px] aspect-square relative">
            <EvolvingTree state={worldState} />
            
            {/* Ground */}
            <div className="absolute bottom-10 left-1/2 -translate-x-1/2 w-[80%] h-12 bg-[#2c1810] rounded-full blur-2xl opacity-50" />
            <div className="absolute bottom-20 left-1/2 -translate-x-1/2 w-[60%] h-4 bg-[#4CAF50]/20 rounded-full blur-xl" />
          </div>
        </div>

        {/* Floating Particles */}
        <div className="absolute inset-0 pointer-events-none">
          {[...Array(20)].map((_, i) => (
            <motion.div
              key={i}
              className="absolute w-1 h-1 bg-white rounded-full"
              initial={{ 
                x: Math.random() * 100 + "%", 
                y: Math.random() * 100 + "%",
                opacity: Math.random() 
              }}
              animate={{ 
                y: [null, "-=100"],
                opacity: [0, 1, 0]
              }}
              transition={{ 
                duration: Math.random() * 5 + 5, 
                repeat: Infinity,
                ease: "linear"
              }}
            />
          ))}
        </div>

        {/* Status Overlay */}
        <div className="absolute bottom-10 left-10 glass-light px-6 py-4 rounded-3xl border border-white/10 backdrop-blur-md">
          <div className="flex items-center gap-3 mb-2">
            <TreeDeciduous className="text-primary" />
            <h3 className="font-black text-lg">World Level {worldState.treeLevel}</h3>
          </div>
          <p className="text-sm text-muted-foreground font-medium">Evolution: {worldState.branches} Branches, {worldState.leaves} Leaves</p>
        </div>
      </div>

      {/* World Info & Controls */}
      <div className="w-full lg:w-96 flex flex-col gap-6">
        <motion.div 
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          className="glass p-8 rounded-[2.5rem] border border-white/10"
        >
          <div className="flex items-center gap-2 mb-6">
            <Sparkles className="text-primary" size={20} />
            <h2 className="text-xl font-black">World Evolution</h2>
          </div>
          
          <div className="space-y-6">
            <div className="p-4 rounded-2xl bg-secondary/30 border border-white/5">
              <div className="flex justify-between items-center mb-2">
                <span className="text-sm font-bold uppercase tracking-wider opacity-60">Visual Tier</span>
                <span className="text-primary font-black">Seedling</span>
              </div>
              <div className="w-full h-2 bg-secondary rounded-full overflow-hidden">
                <div className="h-full bg-primary" style={{ width: '40%' }} />
              </div>
              <p className="text-[10px] mt-2 text-muted-foreground font-medium">Reach Level 5 to evolve into a Small Tree</p>
            </div>

            <div className="space-y-4">
              <h4 className="text-sm font-black uppercase text-muted-foreground tracking-widest px-1">Evolution Rules</h4>
              {[
                "1 Habit Completion = +5 Leaves",
                "Level Up = +1 Branch",
                "7 Day Streak = Seasonal Change",
                "30 Day Streak = World Expansion"
              ].map((rule, i) => (
                <div key={i} className="flex items-center gap-3 text-sm font-medium">
                  <div className="w-1.5 h-1.5 rounded-full bg-primary" />
                  {rule}
                </div>
              ))}
            </div>
          </div>
        </motion.div>

        <Link 
          to="/habits" 
          className="glass p-6 rounded-[2rem] border border-white/10 flex items-center justify-between group hover:border-primary/50 transition-all"
        >
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-2xl bg-primary/20 flex items-center justify-center text-primary group-hover:scale-110 transition-transform">
              <ChevronRight size={24} />
            </div>
            <div>
              <p className="text-sm font-bold opacity-60">Next Task</p>
              <p className="font-black">Complete Daily Habits</p>
            </div>
          </div>
          <Info size={20} className="text-muted-foreground" />
        </Link>
      </div>
    </div>
  );
};

export default World;
