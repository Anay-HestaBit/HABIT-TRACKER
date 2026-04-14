import React from 'react';
import { motion } from 'framer-motion';
import { BookOpen, CheckCircle2, Sparkles, Shield, HelpCircle } from 'lucide-react';

const UserGuide = () => {
  const quickStart = [
    {
      title: 'Create your first habit',
      detail: 'Go to Habits → Create New. Pick daily or weekly and choose a color you like.'
    },
    {
      title: 'Complete it daily',
      detail: 'Tap Complete to earn XP and build your streak.'
    },
    {
      title: 'Watch your world evolve',
      detail: 'Each level grows your tree — branches, leaves, flowers, and fruits.'
    },
    {
      title: 'Use streak shields wisely',
      detail: 'Shields protect your streak on a busy day (once you unlock them).'
    },
  ];

  const faqs = [
    {
      q: 'How do streaks work?'
    , a: 'Complete a habit each day to keep the streak alive. Missing a day breaks it unless you use a shield.'
    },
    {
      q: 'Why did my XP increase?'
    , a: 'XP is earned per completion and increases with streak length. More streak = more XP.'
    },
    {
      q: 'What counts as “done today”?'
    , a: 'Habits are tracked by IST day boundaries (Asia/Kolkata), so your daily completion stays aligned with Indian time.'
    },
    {
      q: 'How do I unlock achievements?'
    , a: 'Complete habits, build streaks, and level up your world. New achievements appear automatically.'
    },
    {
      q: 'Can I delete a habit?'
    , a: 'Yes. Use the trash icon in Habits. You will be asked to confirm twice.'
    },
    {
      q: 'How is the Journal protected?'
    , a: 'Your Journal uses a separate password that is not recoverable. You must enter it to view past reflections.'
    },
  ];

  return (
    <div className="max-w-4xl space-y-10 pb-20">
      <header className="text-center space-y-4">
        <motion.div
          initial={{ scale: 0.9, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          className="inline-block p-4 rounded-3xl bg-primary/20 text-primary"
        >
          <BookOpen size={32} />
        </motion.div>
        <h1 className="text-4xl md:text-5xl font-black">User Guide</h1>
        <p className="text-lg text-muted-foreground">Simple steps to build your streaks and grow your world.</p>
      </header>

      <section className="glass p-8 rounded-[2.5rem] border border-white/10">
        <div className="flex items-center gap-3 mb-6">
          <Sparkles className="text-primary" />
          <h2 className="text-2xl font-black">Quick Start</h2>
        </div>
        <div className="grid gap-5">
          {quickStart.map((step) => (
            <div key={step.title} className="flex gap-4">
              <div className="w-10 h-10 rounded-2xl bg-primary/10 text-primary flex items-center justify-center">
                <CheckCircle2 size={20} />
              </div>
              <div>
                <p className="font-bold">{step.title}</p>
                <p className="text-muted-foreground text-sm">{step.detail}</p>
              </div>
            </div>
          ))}
        </div>
      </section>

      <section className="glass p-8 rounded-[2.5rem] border border-white/10">
        <div className="flex items-center gap-3 mb-6">
          <Shield className="text-primary" />
          <h2 className="text-2xl font-black">Streak Shields</h2>
        </div>
        <p className="text-muted-foreground">
          Shields protect your streak once you unlock them. Use them on a day you miss to keep your progress intact.
        </p>
      </section>

      <section className="glass p-8 rounded-[2.5rem] border border-white/10">
        <div className="flex items-center gap-3 mb-6">
          <HelpCircle className="text-primary" />
          <h2 className="text-2xl font-black">FAQs</h2>
        </div>
        <div className="space-y-4">
          {faqs.map((item) => (
            <div key={item.q} className="p-4 rounded-2xl bg-secondary/40 border border-white/5">
              <p className="font-bold mb-1">{item.q}</p>
              <p className="text-sm text-muted-foreground">{item.a}</p>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
};

export default UserGuide;
