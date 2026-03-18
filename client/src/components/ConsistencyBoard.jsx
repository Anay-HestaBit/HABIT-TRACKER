import React, { useState, useEffect, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronLeft, ChevronRight, Calendar, Info } from 'lucide-react';
import api from '../api/axios';

const ConsistencyBoard = () => {
  const currentYear = new Date().getFullYear();
  const [year, setYear] = useState(currentYear);
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [hoveredDay, setHoveredDay] = useState(null);

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        const { data } = await api.get(`/progress/heatmap?year=${year}`);
        setData(data);
      } catch (err) {
        console.error('Error fetching heatmap data');
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [year]);

  const months = [
    'Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun',
    'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'
  ];

  // Generate days for the year
  const boardData = useMemo(() => {
    const days = [];
    const startDate = new Date(year, 0, 1);
    const endDate = new Date(year, 11, 31);
    
    let currentDate = new Date(startDate);
    while (currentDate <= endDate) {
      const dateStr = currentDate.toISOString().split('T')[0];
      const dayData = data.find(d => d.date.startsWith(dateStr));
      
      days.push({
        date: new Date(currentDate),
        count: dayData ? dayData.habitsCompleted : 0,
        intensity: dayData ? Math.min(dayData.habitsCompleted, 4) : 0
      });
      currentDate.setDate(currentDate.getDate() + 1);
    }
    return days;
  }, [year, data]);

  const intensityColors = [
    'bg-slate-800/50',
    'bg-blue-900/40',
    'bg-blue-700/60',
    'bg-blue-500/80',
    'bg-blue-400'
  ];

  return (
    <div className="bg-card/50 backdrop-blur-xl p-8 rounded-[2.5rem] border border-white/5 shadow-2xl">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-8">
        <div>
          <h2 className="text-2xl font-black text-foreground mb-1 flex items-center gap-2">
            <Calendar className="text-blue-500" size={24} />
            Consistency Board
          </h2>
          <p className="text-sm text-muted-foreground font-medium">Visualization of your daily progress through the year.</p>
        </div>

        <div className="flex items-center gap-4 bg-secondary/50 p-2 rounded-2xl border border-white/5">
          <button 
            onClick={() => setYear(year - 1)}
            className="p-2 hover:bg-secondary rounded-xl transition-all text-muted-foreground hover:text-foreground"
          >
            <ChevronLeft size={20} />
          </button>
          <span className="text-lg font-bold text-foreground min-w-[60px] text-center">{year}</span>
          <button 
            onClick={() => year < currentYear && setYear(year + 1)}
            disabled={year >= currentYear}
            className="p-2 hover:bg-secondary rounded-xl transition-all text-muted-foreground hover:text-foreground disabled:opacity-30"
          >
            <ChevronRight size={20} />
          </button>
        </div>
      </div>

      {loading ? (
        <div className="h-48 flex items-center justify-center">
          <div className="w-8 h-8 border-4 border-blue-500 border-t-transparent rounded-full animate-spin" />
        </div>
      ) : (
        <div className="overflow-x-auto pb-4 custom-scrollbar">
          <div className="min-w-[800px]">
            {/* Months labels */}
            <div className="flex mb-2 ml-8">
              {months.map(m => (
                <div key={m} className="flex-1 text-[10px] text-muted-foreground font-bold uppercase tracking-widest text-center">
                  {m}
                </div>
              ))}
            </div>

            <div className="flex">
              {/* Day of week labels */}
              <div className="flex flex-col justify-around pr-4 text-[10px] text-muted-foreground font-black uppercase">
                <span>Mon</span>
                <span>Wed</span>
                <span>Fri</span>
                <span>Sun</span>
              </div>

              {/* The Grid */}
              <div className="flex-1 grid grid-flow-col grid-rows-7 gap-1.5">
                {boardData.map((day, i) => (
                  <motion.div
                    key={i}
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    transition={{ delay: i * 0.001 }}
                    className={`w-3.5 h-3.5 rounded-[3px] transition-all cursor-crosshair relative ${intensityColors[day.intensity]}`}
                    onMouseEnter={() => setHoveredDay(day)}
                    onMouseLeave={() => setHoveredDay(null)}
                  >
                    {hoveredDay === day && (
                      <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 p-2 bg-card/90 text-foreground text-[10px] font-bold rounded-lg shadow-2xl z-50 whitespace-nowrap border border-white/10">
                        {day.date.toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' })}
                        <div className="text-blue-400 mt-1">{day.count} habits completed</div>
                      </div>
                    )}
                  </motion.div>
                ))}
              </div>
            </div>
            
            <div className="mt-8 flex items-center justify-end gap-3 text-[10px] font-bold text-muted-foreground uppercase tracking-widest">
                <span>Less</span>
                <div className="flex gap-1">
                    {intensityColors.map(c => <div key={c} className={`w-3 h-3 rounded-[2px] ${c}`} />)}
                </div>
                <span>More</span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ConsistencyBoard;
