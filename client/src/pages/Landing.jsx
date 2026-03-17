import React from 'react';
import { motion, useScroll, useTransform } from 'framer-motion';
import { Link } from 'react-router-dom';
import { 
  Globe2, 
  ArrowRight, 
  Zap, 
  Trophy, 
  Heart, 
  ShieldCheck, 
  Sparkles, 
  Focus, 
  BarChart3, 
  Layers,
  CheckCircle2,
  Users,
  Flame
} from 'lucide-react';

const FeatureCard = ({ icon: Icon, title, description, delay }) => (
  <motion.div
    initial={{ opacity: 0, y: 20 }}
    whileInView={{ opacity: 1, y: 0 }}
    transition={{ delay, duration: 0.6 }}
    viewport={{ once: true }}
    className="group relative p-8 rounded-[2.5rem] bg-slate-900/40 border border-white/5 hover:border-blue-500/30 transition-all overflow-hidden"
  >
    <div className="absolute top-0 right-0 w-32 h-32 bg-blue-500/5 rounded-full blur-3xl group-hover:bg-blue-500/10 transition-all" />
    <div className="relative z-10">
      <div className="w-14 h-14 rounded-2xl bg-blue-500/10 flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-500">
        <Icon className="text-blue-400" size={28} />
      </div>
      <h3 className="text-xl font-bold text-white mb-3">{title}</h3>
      <p className="text-slate-500 font-medium leading-relaxed">{description}</p>
    </div>
  </motion.div>
);

const Landing = () => {
  const { scrollYProgress } = useScroll();
  const y1 = useTransform(scrollYProgress, [0, 1], [0, -200]);
  const opacity = useTransform(scrollYProgress, [0, 0.2], [1, 0]);

  return (
    <div className="min-h-screen bg-[#020617] text-slate-300 selection:bg-blue-500/30">
      {/* Immersive Background */}
      <div className="fixed inset-0 z-0 pointer-events-none">
        <div className="absolute top-[-10%] left-[-10%] w-[50%] h-[50%] bg-blue-600/10 rounded-full blur-[120px] animate-pulse" />
        <div className="absolute bottom-[-10%] right-[-10%] w-[50%] h-[50%] bg-indigo-600/10 rounded-full blur-[120px]" />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full h-full bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-20 brightness-100 contrast-150" />
      </div>

      {/* Nav */}
      <nav className="fixed top-0 left-0 w-full z-50 border-b border-white/5 bg-[#020617]/50 backdrop-blur-xl">
        <div className="max-w-7xl mx-auto px-6 py-5 flex items-center justify-between">
          <Link to="/" className="flex items-center gap-3 group">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center shadow-lg shadow-blue-500/20 group-hover:rotate-12 transition-transform">
              <Globe2 className="text-white" size={24} />
            </div>
            <span className="text-2xl font-black tracking-tighter text-white">Daily Habit Journey</span>
          </Link>
          <div className="hidden md:flex items-center gap-8">
            <a href="#features" className="text-sm font-bold hover:text-white transition-colors uppercase tracking-widest">Features</a>
            <a href="#pricing" className="text-sm font-bold hover:text-white transition-colors uppercase tracking-widest">Why Us</a>
            <div className="h-4 w-[1px] bg-white/10" />
            <Link to="/login" className="text-sm font-bold hover:text-white transition-colors uppercase tracking-widest">Login</Link>
            <Link to="/signup" className="px-6 py-3 rounded-2xl bg-white text-black font-bold hover:bg-slate-200 transition-all shadow-xl shadow-white/5">
              Get Started
            </Link>
          </div>
        </div>
      </nav>

      <main className="relative z-10 pt-44">
        {/* Hero Section */}
        <section className="max-w-7xl mx-auto px-6 mb-32">
          <div className="grid lg:grid-cols-2 gap-16 items-center">
            <motion.div
              initial={{ opacity: 0, x: -30 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.8 }}
            >
              <motion.div 
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-blue-500/10 border border-blue-500/20 text-blue-400 text-xs font-black uppercase tracking-widest mb-8"
              >
                <Sparkles size={14} className="fill-current" />
                <span>The Future of Personal Growth</span>
              </motion.div>
              <h1 className="text-6xl lg:text-8xl font-black leading-[0.9] text-white mb-8 tracking-tighter">
                Evolve Your <br />
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 via-indigo-400 to-purple-400">Digital World.</span>
              </h1>
              <p className="text-xl text-slate-500 mb-10 max-w-xl font-medium leading-relaxed">
                Experience an immersive, gamified habit tracker that turns your daily consistency into a thriving 3D ecosystem. Build habits, earn XP, and unlock your potential.
              </p>
              <div className="flex flex-col sm:flex-row items-center gap-6">
                <Link to="/signup" className="w-full sm:w-auto px-10 py-5 rounded-[2rem] bg-blue-600 text-white font-black text-xl flex items-center justify-center gap-3 hover:translate-y-[-4px] hover:shadow-[0_20px_40px_-15px_rgba(37,99,235,0.4)] transition-all shadow-xl">
                  Start Your Journey
                  <ArrowRight size={24} />
                </Link>
                <Link to="/login" className="w-full sm:w-auto px-10 py-5 rounded-[2rem] bg-slate-800/50 border border-white/5 text-white font-black text-xl hover:bg-slate-800 transition-all flex items-center justify-center gap-3">
                  Live Demo
                </Link>
              </div>
              <div className="mt-12 flex items-center gap-10">
                <div className="flex -space-x-3">
                    {[1,2,3,4,5].map(i => (
                        <div key={i} className="w-10 h-10 rounded-full border-2 border-[#020617] bg-slate-800 overflow-hidden">
                            <img src={`https://i.pravatar.cc/100?img=${i+20}`} alt="avatar" />
                        </div>
                    ))}
                </div>
                <div className="text-sm font-bold">
                    <span className="text-white">Active Growth:</span> 2,400+ Users
                </div>
              </div>
            </motion.div>

            <motion.div
              style={{ y: y1 }}
              className="relative hidden lg:block"
            >
                <div className="aspect-square w-full rounded-[4rem] bg-gradient-to-br from-blue-600/20 to-transparent p-[1px]">
                    <div className="w-full h-full rounded-[4rem] bg-slate-950/80 backdrop-blur-3xl p-12 relative overflow-hidden flex items-center justify-center">
                        <motion.div 
                            animate={{ 
                                rotateY: [0, 360],
                                y: [0, -20, 0]
                            }}
                            transition={{ 
                                rotateY: { duration: 20, repeat: Infinity, ease: "linear" },
                                y: { duration: 4, repeat: Infinity, ease: "easeInOut" }
                            }}
                            className="relative z-10"
                        >
                            <Globe2 size={240} className="text-blue-500 opacity-60 blur-2xl absolute inset-0 m-auto" />
                            <Globe2 size={240} className="text-blue-400 relative" />
                        </motion.div>
                        
                        {/* Floating Cards */}
                        <motion.div 
                            animate={{ x: [-10, 10, -10] }}
                            transition={{ duration: 5, repeat: Infinity }}
                            className="absolute top-20 right-10 glass p-5 rounded-3xl border border-white/10 shadow-2xl z-20"
                        >
                            <div className="flex items-center gap-3 mb-2">
                                <div className="p-2 bg-orange-500/20 rounded-xl"><Flame className="text-orange-500" size={20} /></div>
                                <span className="font-black text-white text-lg">158 Days</span>
                            </div>
                            <p className="text-[10px] font-black uppercase tracking-widest text-slate-500">Master Streak</p>
                        </motion.div>

                        <motion.div 
                            animate={{ x: [10, -10, 10] }}
                            transition={{ duration: 6, repeat: Infinity, delay: 1 }}
                            className="absolute bottom-20 left-10 glass p-5 rounded-3xl border border-white/10 shadow-2xl z-20"
                        >
                            <div className="flex items-center gap-3 mb-2">
                                <div className="p-2 bg-blue-500/20 rounded-xl"><Trophy className="text-blue-400" size={20} /></div>
                                <span className="font-black text-white text-lg">Level 24</span>
                            </div>
                            <p className="text-[10px] font-black uppercase tracking-widest text-slate-500">World Evolution</p>
                        </motion.div>
                    </div>
                </div>
            </motion.div>
          </div>
        </section>

        {/* Features Section */}
        <section id="features" className="max-w-7xl mx-auto px-6 py-32 border-t border-white/5">
          <div className="text-center mb-20">
            <h2 className="text-4xl lg:text-6xl font-black text-white mb-6 uppercase tracking-tighter">The Journey Protocol</h2>
            <p className="text-slate-500 max-w-2xl mx-auto font-medium">We've combined behavioral science with interactive gamification to make consistency inevitable.</p>
          </div>
          
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            <FeatureCard 
              icon={Focus} 
              title="Deep Work Engine" 
              description="A precision Pomodoro system integrated directly into your habit workflow to ensure total focus."
              delay={0.1}
            />
            <FeatureCard 
              icon={Sparkles} 
              title="AI Habit Mentor" 
              description="Intelligent suggestions that adapt to your lifestyle and energy patterns for maximum adherence."
              delay={0.2}
            />
            <FeatureCard 
              icon={ShieldCheck} 
              title="Streak Shields" 
              description="Life happens. Protect your master streaks during emergencies and stay in the game."
              delay={0.3}
            />
            <FeatureCard 
              icon={BarChart3} 
              title="Neural Analytics" 
              description="Deep-dive into your growth with monthly consistency boards and yearly archives."
              delay={0.4}
            />
            <FeatureCard 
              icon={Layers} 
              title="3D World Evolution" 
              description="Your progress manifests physically. Watch your digital planet grow from a seedling to a lush forest."
              delay={0.5}
            />
            <FeatureCard 
              icon={Users} 
              title="Verified Security" 
              description="Elite-grade security with OTP sign-ins, full email verification, and CSRF protection."
              delay={0.6}
            />
          </div>
        </section>

        {/* Final CTA */}
        <section className="max-w-5xl mx-auto px-6 py-40 text-center">
            <div className="relative p-16 rounded-[4rem] bg-gradient-to-b from-blue-600 to-indigo-700 overflow-hidden shadow-2xl shadow-blue-500/20">
                <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-20" />
                <div className="relative z-10">
                    <h2 className="text-4xl lg:text-7xl font-black text-white mb-8 leading-tight tracking-tighter">Your evolution <br /> starts with a click.</h2>
                    <p className="text-blue-100/70 mb-12 text-lg font-medium max-w-xl mx-auto">Join the 1% who take their habits seriously. Transform your life and your digital world today.</p>
                    <Link to="/signup" className="px-12 py-6 rounded-[2rem] bg-white text-blue-600 font-black text-2xl hover:scale-105 transition-all shadow-2xl flex items-center gap-3 mx-auto w-fit">
                        Get Started for Free
                        <ArrowRight size={28} />
                    </Link>
                </div>
            </div>
        </section>

        <footer className="max-w-7xl mx-auto px-6 py-20 border-t border-white/5 flex flex-col md:flex-row justify-between items-center gap-10">
            <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-lg bg-blue-600 flex items-center justify-center">
                    <Globe2 className="text-white" size={18} />
                </div>
                <span className="text-lg font-black text-white">Daily Habit Journey</span>
            </div>
            <p className="text-sm font-bold text-slate-600 uppercase tracking-widest">© 2026 Antigravity Labs. All rights reserved.</p>
            <div className="flex gap-8">
                <a href="#" className="hover:text-white transition-colors text-sm font-bold uppercase tracking-widest">Discord</a>
                <a href="#" className="hover:text-white transition-colors text-sm font-bold uppercase tracking-widest">Twitter</a>
                <a href="#" className="hover:text-white transition-colors text-sm font-bold uppercase tracking-widest">Privacy</a>
            </div>
        </footer>
      </main>
    </div>
  );
};

export default Landing;
