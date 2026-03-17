import React from 'react';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { Globe2, ArrowRight, Zap, Trophy, Heart } from 'lucide-react';

const Landing = () => {
  return (
    <div className="min-h-screen bg-background relative overflow-hidden">
      {/* Background Orbs */}
      <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-primary/20 rounded-full blur-[120px] animate-pulse" />
      <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-purple-600/10 rounded-full blur-[120px]" />

      <nav className="relative z-10 flex items-center justify-between px-6 py-8 max-w-7xl mx-auto">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-primary flex items-center justify-center shadow-lg shadow-primary/30">
            <Globe2 className="text-white" size={24} />
          </div>
          <span className="text-xl font-bold tracking-tight text-foreground">HabitJourney</span>
        </div>
        <div className="flex items-center gap-6">
          <Link to="/login" className="text-muted-foreground hover:text-white transition-colors font-medium">Log In</Link>
          <Link to="/signup" className="px-5 py-2.5 rounded-full bg-white text-black font-semibold hover:bg-opacity-90 transition-all shadow-xl shadow-white/10">
            Get Started
          </Link>
        </div>
      </nav>

      <main className="relative z-10 max-w-7xl mx-auto px-6 pt-20 pb-32 grid lg:grid-cols-2 gap-16 items-center text-center lg:text-left">
        <motion.div
          initial={{ opacity: 0, x: -50 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.8 }}
        >
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary/10 border border-primary/20 text-accent text-sm font-semibold mb-6">
            <Zap size={14} className="fill-current" />
            <span>GAMIFIED HABIT TRACKING</span>
          </div>
          <h1 className="text-5xl lg:text-7xl font-black leading-[1.1] mb-8 bg-gradient-to-b from-white to-gray-400 bg-clip-text text-transparent">
            Build Your World, <br />
            <span className="text-primary italic">One Habit</span> at a Time.
          </h1>
          <p className="text-xl text-muted-foreground mb-10 max-w-xl mx-auto lg:mx-0 leading-relaxed">
            Experience the most immersive habit tracker ever built. Watch your digital world evolve and grow as you stay consistent. Gamify your life, earn XP, and unlock badges.
          </p>
          <div className="flex flex-col sm:flex-row items-center gap-4 justify-center lg:justify-start">
            <Link to="/signup" className="group px-8 py-4 rounded-full bg-primary text-white font-bold text-lg flex items-center gap-2 hover:translate-y-[-2px] transition-all shadow-2xl shadow-primary/40">
              Start Your Journey
              <ArrowRight size={20} className="group-hover:translate-x-1 transition-transform" />
            </Link>
            <Link to="/login" className="px-8 py-4 rounded-full glass border border-white/10 text-white font-bold text-lg hover:bg-white/5 transition-all">
              Live Demo
            </Link>
          </div>

          <div className="mt-16 flex items-center gap-8 justify-center lg:justify-start">
            <div className="flex -space-x-3">
              {[1, 2, 3, 4].map(i => (
                <div key={i} className="w-10 h-10 rounded-full border-2 border-background bg-secondary flex items-center justify-center overflow-hidden">
                  <img src={`https://i.pravatar.cc/100?img=${i+10}`} alt="user" />
                </div>
              ))}
            </div>
            <p className="text-sm text-muted-foreground">
              <span className="text-white font-semibold">1,000+</span> users already growing
            </p>
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, scale: 0.8, rotate: 5 }}
          animate={{ opacity: 1, scale: 1, rotate: 0 }}
          transition={{ duration: 1.2, ease: "easeOut" }}
          className="relative"
        >
          <div className="aspect-square rounded-[3rem] glass p-8 relative z-20 overflow-hidden border border-white/10 shadow-[0_0_50px_rgba(139,92,246,0.3)]">
            {/* Visual representation of the world */}
            <div className="w-full h-full rounded-[2rem] bg-gradient-to-br from-[#1e1b4b] to-[#0f172a] flex items-center justify-center relative">
              <motion.div
                animate={{ 
                  y: [0, -10, 0],
                  rotate: [0, 1, 0]
                }}
                transition={{ duration: 4, repeat: Infinity }}
              >
                <Globe2 size={120} className="text-primary/40 blur-xl absolute" />
                <Globe2 size={120} className="text-primary relative" />
              </motion.div>
              
              {/* Floating stats */}
              <motion.div 
                className="absolute top-10 right-10 glass-light p-4 rounded-2xl border border-white/10 shadow-xl"
                animate={{ x: [0, 5, 0] }}
                transition={{ duration: 3, repeat: Infinity }}
              >
                <div className="flex items-center gap-2 text-primary font-bold">
                  <Trophy size={16} />
                  <span>Streak: 12</span>
                </div>
              </motion.div>

              <motion.div 
                className="absolute bottom-10 left-10 glass-light p-4 rounded-2xl border border-white/10 shadow-xl"
                animate={{ x: [0, -5, 0] }}
                transition={{ duration: 3, delay: 0.5, repeat: Infinity }}
              >
                <div className="flex items-center gap-2 text-accent font-bold">
                  <Heart size={16} />
                  <span>Level 4</span>
                </div>
              </motion.div>
            </div>
          </div>
          
          {/* Decorative blurs */}
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[120%] h-[120%] bg-primary/10 rounded-full blur-[80px] -z-10" />
        </motion.div>
      </main>
    </div>
  );
};

export default Landing;
