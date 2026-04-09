import React, { useMemo } from 'react';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Cloud, Sun, Wind, Info, ChevronRight, Sparkles, TreeDeciduous, Flame, Zap, Star } from 'lucide-react';

const defaultWorldState = { treeLevel: 1, branches: 2, leaves: 5, flowers: 0, fruits: 0, season: 'spring', glowIntensity: 0.2 };

// Seeded random — stable across renders so tree doesn't jitter
const seededRand = (seed) => { const x = Math.sin(seed + 1) * 10000; return x - Math.floor(x); };

const EvolvingTree = ({ state }) => {
  const { treeLevel, branches, leaves, flowers = 0, fruits = 0, glowIntensity = 0.2 } = state;
  const level = Math.max(1, treeLevel);
  const branchCount = Math.min(branches, 16);
  const leafCount   = Math.min(leaves, 200);
  const flowerCount = Math.min(flowers, 20);
  const fruitCount  = Math.min(fruits, 12);
  const trunkWidth  = 8 + level * 0.6;
  const trunkHeight = 40 + level * 2;
  const glowColor   = level >= 20 ? '#a78bfa' : level >= 10 ? '#60a5fa' : '#4ade80';

  const renderedBranches = useMemo(() => {
    const items = [];
    for (let i = 0; i < branchCount; i++) {
      const angle  = (i / branchCount) * 260 - 130;
      const length = 25 + level * 2 + seededRand(i * 7) * 15;
      const rad    = (angle * Math.PI) / 180;
      const startY = 155 - (i % 3) * 8;
      items.push({ id: i, x1: 100, y1: startY, x2: 100 + Math.cos(rad) * length, y2: startY + Math.sin(rad) * length, width: Math.max(1, 3.5 - (i / branchCount) * 2) });
    }
    return items;
  }, [branchCount, level]);

  const renderedLeaves = useMemo(() => {
    const items = [];
    const perBranch = Math.ceil(leafCount / Math.max(renderedBranches.length, 1));
    renderedBranches.forEach((b, bIdx) => {
      const dx = b.x2 - b.x1; const dy = b.y2 - b.y1;
      for (let i = 0; i < perBranch && items.length < leafCount; i++) {
        const t = 0.4 + (i / perBranch) * 0.6; const s = bIdx * 100 + i;
        items.push({ id: `l-${bIdx}-${i}`, x: b.x1 + dx * t + (seededRand(s) - 0.5) * 18, y: b.y1 + dy * t + (seededRand(s+1) - 0.5) * 18, r: 2.5 + seededRand(s+2) * 3, green: i%3===0?'#22c55e':i%3===1?'#4ade80':'#86efac' });
      }
    });
    return items;
  }, [renderedBranches, leafCount]);

  const renderedFlowers = useMemo(() =>
    renderedBranches.slice(0, flowerCount).map((b, i) => ({ id: `f-${i}`, x: b.x2 + (seededRand(i*3)-.5)*8, y: b.y2 + (seededRand(i*3+1)-.5)*8, color: i%2===0?'#f9a8d4':'#fde68a' }))
  , [renderedBranches, flowerCount]);

  const renderedFruits = useMemo(() =>
    renderedBranches.slice(2, 2 + fruitCount).map((b, i) => ({ id: `r-${i}`, x: b.x2 + (seededRand(i*5)-.5)*6, y: b.y2 + 5 + seededRand(i*5+1)*6, color: i%2===0?'#f87171':'#fb923c' }))
  , [renderedBranches, fruitCount]);

  return (
    <svg viewBox="0 0 200 220" className="w-full h-full drop-shadow-2xl">
      <defs>
        <radialGradient id="treeGlow" cx="50%" cy="60%" r="50%">
          <stop offset="0%" stopColor={glowColor} stopOpacity={glowIntensity * 0.5} />
          <stop offset="100%" stopColor={glowColor} stopOpacity="0" />
        </radialGradient>
        <radialGradient id="groundGlow">
          <stop offset="0%" stopColor="#4ade80" stopOpacity="0.15" />
          <stop offset="100%" stopColor="#4ade80" stopOpacity="0" />
        </radialGradient>
      </defs>
      <ellipse cx="100" cy="150" rx={50 + level*2} ry={40 + level} fill="url(#treeGlow)" />
      <ellipse cx="100" cy="205" rx="55" ry="10" fill="url(#groundGlow)" />
      <motion.g
        animate={{ rotate: [-0.4, 0.6, -0.4] }}
        transition={{ duration: 6, repeat: Infinity, ease: 'easeInOut' }}
        style={{ transformOrigin: '100px 200px' }}
      >
        <motion.rect x={100 - trunkWidth/2} y={200 - trunkHeight} width={trunkWidth} height={trunkHeight} rx={trunkWidth/2} fill="#78350f"
          initial={{ height: 0, y: 200 }} animate={{ height: trunkHeight, y: 200 - trunkHeight }} transition={{ duration: 1.2, type: 'spring' }} />
        {renderedBranches.map((b, i) => (
          <motion.line key={b.id} x1={b.x1} y1={b.y1} x2={b.x1} y2={b.y1} animate={{ x2: b.x2, y2: b.y2 }}
            transition={{ duration: 0.8, delay: 0.3 + i * 0.04 }} stroke="#92400e" strokeWidth={b.width} strokeLinecap="round" />
        ))}
        {renderedLeaves.map((leaf) => (
          <motion.circle key={leaf.id} cx={leaf.x} cy={leaf.y} r={0} animate={{ r: leaf.r }}
            transition={{ duration: 0.4, delay: 0.6 }} fill={leaf.green} opacity="0.9" />
        ))}
        {renderedFlowers.map((f) => (
          <motion.g key={f.id} initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 1.2 }}>
            <circle cx={f.x} cy={f.y} r="3.5" fill={f.color} />
            <circle cx={f.x} cy={f.y} r="1.5" fill="#fef08a" />
          </motion.g>
        ))}
        {renderedFruits.map((f) => (
          <motion.circle key={f.id} cx={f.x} cy={f.y} r={0} animate={{ r: 4 }} transition={{ delay: 1.4 }} fill={f.color} />
        ))}
        {level >= 5 && (
          <motion.g initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 1.8 }}>
            <rect x="78" y="28" width="44" height="18" rx="9" fill={glowColor} fillOpacity="0.2" stroke={glowColor} strokeWidth="1" strokeOpacity="0.6" />
            <text x="100" y="41" textAnchor="middle" fill={glowColor} fontSize="8" fontWeight="bold">LVL {level}</text>
          </motion.g>
        )}
      </motion.g>
    </svg>
  );
};

const SEASON_STYLE = {
  spring: { label: 'Spring', bg: 'bg-emerald-500/20', text: 'text-emerald-400', dot: '🌸' },
  summer: { label: 'Summer', bg: 'bg-yellow-500/20',  text: 'text-yellow-400',  dot: '☀️' },
  autumn: { label: 'Autumn', bg: 'bg-orange-500/20',  text: 'text-orange-400',  dot: '🍂' },
  winter: { label: 'Winter', bg: 'bg-blue-500/20',    text: 'text-blue-400',    dot: '❄️' },
};

const World = () => {
  const { user } = useAuth();
  const worldState = user?.worldState || defaultWorldState;
  const season = SEASON_STYLE[worldState.season] || SEASON_STYLE.spring;

  const evolutionTier =
    worldState.treeLevel >= 20 ? 'Ancient Tree 🌳' :
    worldState.treeLevel >= 15 ? 'Great Tree 🌲'   :
    worldState.treeLevel >= 10 ? 'Tall Tree 🌴'    :
    worldState.treeLevel >= 5  ? 'Young Tree 🪴'   : 'Seedling 🌱';

  const xpPerLevel = 1000;
  const xpToNextLevel = xpPerLevel - ((user?.xp || 0) % xpPerLevel);
  const unlockedBadges = user?.badges || [];

  return (
    <div className="h-[calc(100vh-12rem)] flex flex-col lg:flex-row gap-8">

      {/* Visual Scene */}
      <div id="tour-world-scene" className="flex-1 glass rounded-[3rem] border border-white/10 relative overflow-hidden bg-gradient-to-b from-slate-950 via-slate-900 to-slate-800">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_20%_20%,rgba(99,102,241,0.15),transparent_40%),radial-gradient(circle_at_80%_30%,rgba(34,197,94,0.18),transparent_45%)]" />
        <div className="absolute inset-x-0 bottom-0 h-40 bg-gradient-to-t from-slate-900 to-transparent" />
        <Cloud className="absolute top-12 left-12 text-foreground/5 animate-pulse" size={56} />
        <Wind  className="absolute top-28 left-20 text-foreground/5 animate-bounce" size={32} />
        <Sun   className="absolute top-8 right-8 text-yellow-500/20 blur-xl animate-pulse" size={130} />
        <Sun   className="absolute top-8 right-8 text-yellow-500/8" size={130} />

        {[...Array(18)].map((_, i) => (
          <motion.div key={i} className="absolute w-0.5 h-0.5 bg-white rounded-full"
            style={{ left: `${seededRand(i*11)*80+5}%`, top: `${seededRand(i*11+1)*40}%` }}
            animate={{ opacity: [0.2, 1, 0.2] }}
            transition={{ duration: 2 + seededRand(i)*3, repeat: Infinity, delay: seededRand(i*3)*3 }} />
        ))}

        {[...Array(10)].map((_, i) => (
          <motion.div key={`p${i}`} className="absolute w-1 h-1 rounded-full"
            style={{ left: `${seededRand(i*7)*90+5}%`, background: i%3===0?'#a78bfa':i%3===1?'#4ade80':'#fde68a' }}
            animate={{ y: [0, -80], opacity: [0, 0.8, 0] }}
            transition={{ duration: 4 + seededRand(i)*4, repeat: Infinity, delay: seededRand(i*5)*5 }} />
        ))}

        <div className="absolute inset-0 flex items-center justify-center p-10 mt-6">
          <div className="w-full max-w-[460px] aspect-square">
            <EvolvingTree state={worldState} />
          </div>
        </div>

        <div className="absolute bottom-24 left-1/2 -translate-x-1/2 w-[80%] h-10 bg-emerald-900/30 rounded-full blur-2xl" />
        <div className="absolute bottom-10 left-1/2 -translate-x-1/2 w-[95%] h-14 bg-emerald-900/40 rounded-full blur-3xl" />

        {/* Season badge */}
        <div className={`absolute top-6 right-6 px-4 py-2 rounded-full ${season.bg} border border-white/10 flex items-center gap-2`}>
          <span>{season.dot}</span>
          <span className={`text-xs font-black uppercase tracking-wider ${season.text}`}>{season.label}</span>
        </div>

        {/* Status overlay */}
        <div className="absolute bottom-8 left-8 glass px-6 py-4 rounded-3xl border border-white/10">
          <div className="flex items-center gap-3 mb-1">
            <TreeDeciduous className="text-primary" size={18} />
            <h3 className="font-black text-foreground">{evolutionTier}</h3>
          </div>
          <p className="text-xs text-muted-foreground font-medium">
            {worldState.branches} Branches · {worldState.leaves} Leaves
            {worldState.flowers > 0 && ` · ${worldState.flowers} Flowers`}
            {worldState.fruits  > 0 && ` · ${worldState.fruits} Fruits`}
          </p>
        </div>
      </div>

      {/* Side Panel */}
      <div className="w-full lg:w-96 flex flex-col gap-5 overflow-y-auto">

        {/* XP */}
        <motion.div initial={{ opacity:0, x:20 }} animate={{ opacity:1, x:0 }} className="glass p-6 rounded-[2rem] border border-white/10">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <Zap className="text-primary" size={18} />
              <h3 className="font-black text-foreground">Level {user?.level || 1}</h3>
            </div>
            <span className="text-xs font-bold text-muted-foreground">{user?.xp || 0} XP total</span>
          </div>
          <div className="w-full h-2.5 bg-secondary/60 rounded-full overflow-hidden">
            <motion.div className="h-full bg-gradient-to-r from-primary to-accent rounded-full"
              initial={{ width: 0 }} animate={{ width: `${100 - xpToNextLevel}%` }} transition={{ duration: 1, delay: 0.5 }} />
          </div>
          <p className="text-xs text-muted-foreground mt-2 font-medium">{xpToNextLevel} XP to Level {(user?.level||1) + 1}</p>
        </motion.div>

        {/* Badges */}
        {unlockedBadges.length > 0 && (
          <motion.div initial={{ opacity:0, x:20 }} animate={{ opacity:1, x:0 }} transition={{ delay:0.1 }} className="glass p-6 rounded-[2rem] border border-white/10">
            <h3 className="font-black text-foreground mb-4 flex items-center gap-2">
              <Star className="text-yellow-400" size={18} /> Earned Badges
            </h3>
            <div className="space-y-2">
              {unlockedBadges.map((b, i) => (
                <motion.div key={b.name} initial={{ opacity:0, x:-10 }} animate={{ opacity:1, x:0 }} transition={{ delay: 0.2 + i*0.06 }}
                  className="flex items-center gap-3 bg-secondary/50 rounded-2xl px-4 py-2.5">
                  <span className="text-base">⭐</span>
                  <span className="text-sm font-bold text-primary">{b.name}</span>
                  <span className="ml-auto text-[10px] text-emerald-400 font-black uppercase tracking-wider">✓</span>
                </motion.div>
              ))}
            </div>
          </motion.div>
        )}

        {/* Empty state for new users */}
        {unlockedBadges.length === 0 && (
          <motion.div initial={{ opacity:0, x:20 }} animate={{ opacity:1, x:0 }} transition={{ delay:0.1 }} className="glass p-6 rounded-[2rem] border border-white/10 text-center">
            <p className="text-4xl mb-3">🌱</p>
            <p className="font-bold text-foreground mb-1">Your journey begins</p>
            <p className="text-sm text-muted-foreground">Complete habits to grow your tree and earn badges.</p>
          </motion.div>
        )}

        {/* Evolution Rules */}
        <motion.div initial={{ opacity:0, x:20 }} animate={{ opacity:1, x:0 }} transition={{ delay:0.2 }} className="glass p-6 rounded-[2rem] border border-white/10">
          <div className="flex items-center gap-2 mb-4">
            <Sparkles className="text-primary" size={18} />
            <h3 className="font-black text-foreground">How It Grows</h3>
          </div>
          <div className="space-y-3">
            {[
              { rule: 'Level Up',       reward: '+1 Branch, +5 Leaves', icon: '🌿' },
              { rule: '7-Day Streak',   reward: 'Season Changes',       icon: '🌤️' },
              { rule: 'Level 10',       reward: 'Flowers Bloom',        icon: '🌸' },
              { rule: 'Level 15',       reward: 'Fruits Appear',        icon: '🍎' },
              { rule: 'Level 20+',      reward: 'Ancient Tree + Purple Glow', icon: '✨' },
            ].map(({ rule, reward, icon }) => (
              <div key={rule} className="flex items-start gap-3 text-sm">
                <span className="text-base">{icon}</span>
                <div>
                  <span className="font-bold text-foreground">{rule}</span>
                  <span className="text-muted-foreground"> → {reward}</span>
                </div>
              </div>
            ))}
          </div>
        </motion.div>

        {/* CTA */}
        <Link to="/habits" className="glass p-5 rounded-[2rem] border border-white/10 flex items-center justify-between group hover:border-primary/50 transition-all">
          <div className="flex items-center gap-4">
            <div className="w-11 h-11 rounded-2xl bg-primary/20 flex items-center justify-center text-primary group-hover:scale-110 transition-transform">
              <ChevronRight size={22} />
            </div>
            <div>
              <p className="text-xs text-muted-foreground font-bold uppercase tracking-wider">Keep Growing</p>
              <p className="font-black text-foreground">Complete Today's Habits</p>
            </div>
          </div>
          <Info size={18} className="text-muted-foreground" />
        </Link>
      </div>
    </div>
  );
};

export default World;