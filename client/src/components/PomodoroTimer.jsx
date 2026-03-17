import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Play, Pause, RotateCcw, Coffee, Target, Volume2, VolumeX } from 'lucide-react';

const PomodoroTimer = ({ onComplete }) => {
  const [minutes, setMinutes] = useState(25);
  const [seconds, setSeconds] = useState(0);
  const [isActive, setIsActive] = useState(false);
  const [mode, setMode] = useState('work'); // work, break
  const [muted, setMuted] = useState(false);
  
  const timerRef = useRef(null);
  const audioRef = useRef(new Audio('https://assets.mixkit.co/active_storage/sfx/2869/2869-preview.mp3'));

  useEffect(() => {
    if (isActive) {
      timerRef.current = setInterval(() => {
        if (seconds > 0) {
          setSeconds(seconds - 1);
        } else if (minutes > 0) {
          setMinutes(minutes - 1);
          setSeconds(59);
        } else {
          handleTimerComplete();
        }
      }, 1000);
    } else {
      clearInterval(timerRef.current);
    }
    return () => clearInterval(timerRef.current);
  }, [isActive, seconds, minutes]);

  const handleTimerComplete = () => {
    setIsActive(false);
    if (!muted) audioRef.current.play();
    
    if (mode === 'work') {
      if (onComplete) onComplete();
      setMode('break');
      setMinutes(5);
    } else {
      setMode('work');
      setMinutes(25);
    }
    setSeconds(0);
  };

  const toggleTimer = () => setIsActive(!isActive);

  const resetTimer = () => {
    setIsActive(false);
    setMode('work');
    setMinutes(25);
    setSeconds(0);
  };

  const formatTime = (m, s) => `${m}:${s < 10 ? `0${s}` : s}`;

  return (
    <div className="bg-slate-800/50 backdrop-blur-xl p-6 rounded-3xl border border-slate-700/50 shadow-2xl relative overflow-hidden group">
      <div className="relative z-10">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-2">
            {mode === 'work' ? (
              <Target className="w-5 h-5 text-rose-500 animate-pulse" />
            ) : (
              <Coffee className="w-5 h-5 text-emerald-500 animate-bounce" />
            )}
            <span className="text-sm font-bold uppercase tracking-wider text-slate-400">
              {mode === 'work' ? 'Deep Work' : 'Break Time'}
            </span>
          </div>
          <button 
            onClick={() => setMuted(!muted)}
            className="p-2 hover:bg-slate-700/50 rounded-xl transition-all text-slate-500"
          >
            {muted ? <VolumeX size={18} /> : <Volume2 size={18} />}
          </button>
        </div>

        <div className="text-center mb-8">
          <motion.h2 
            key={minutes + seconds}
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className="text-6xl font-black text-white font-mono tracking-tighter"
          >
            {formatTime(minutes, seconds)}
          </motion.h2>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={toggleTimer}
            className={`flex-1 py-3 rounded-2xl font-bold flex items-center justify-center gap-2 transition-all shadow-lg ${
              isActive 
                ? 'bg-slate-700 text-white hover:bg-slate-600' 
                : 'bg-blue-600 text-white hover:bg-blue-500 shadow-blue-500/20'
            }`}
          >
            {isActive ? <Pause size={20} /> : <Play size={20} />}
            {isActive ? 'Pause' : 'Start Focus'}
          </button>
          
          <button
            onClick={resetTimer}
            className="p-3 bg-slate-700/50 text-slate-400 hover:text-white rounded-2xl transition-all hover:bg-slate-700"
          >
            <RotateCcw size={20} />
          </button>
        </div>
      </div>

      {/* Background Progressive Fill */}
      <motion.div 
        initial={{ height: '0%' }}
        animate={{ height: `${((mode === 'work' ? 25*60 : 5*60) - (minutes*60 + seconds)) / (mode === 'work' ? 25*60 : 5*60) * 100}%` }}
        className={`absolute bottom-0 left-0 w-full opacity-10 pointer-events-none transition-all duration-1000 ${
          mode === 'work' ? 'bg-rose-500' : 'bg-emerald-500'
        }`}
      />
    </div>
  );
};

export default PomodoroTimer;
