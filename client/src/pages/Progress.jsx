import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer,
  LineChart,
  Line,
  AreaChart,
  Area
} from 'recharts';
import { 
  BarChart3, 
  Calendar, 
  TrendingUp, 
  CheckCircle2, 
  Zap,
  Loader2
} from 'lucide-react';
import api from '../api/axios';

const ChartCard = ({ title, children, icon: Icon, delay }) => (
  <motion.div
    initial={{ opacity: 0, y: 20 }}
    animate={{ opacity: 1, y: 0 }}
    transition={{ delay }}
    className="glass p-8 rounded-[2.5rem] border border-white/5 flex flex-col min-w-0"
  >
    <div className="flex items-center justify-between mb-8">
      <div className="flex items-center gap-3">
        <div className="w-10 h-10 rounded-xl bg-primary/20 flex items-center justify-center text-primary">
          <Icon size={20} />
        </div>
        <h3 className="text-xl font-black">{title}</h3>
      </div>
      <div className="flex gap-2">
        <button className="px-3 py-1.5 rounded-lg bg-secondary/50 text-xs font-bold hover:bg-secondary transition-colors">W</button>
        <button className="px-3 py-1.5 rounded-lg bg-primary text-xs font-bold">M</button>
      </div>
    </div>
    <div className="h-72 w-full min-w-0">
      <ResponsiveContainer width="100%" height="100%" minHeight={1} minWidth={1}>
        {children}
      </ResponsiveContainer>
    </div>
  </motion.div>
);

const Progress = () => {
  const [chartData, setChartData] = useState([]);
  const [heatmapData, setHeatmapData] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [cData, hData] = await Promise.all([
          api.get('/progress/charts'),
          api.get('/progress/heatmap')
        ]);
        
        // Format chart data for Recharts
        const formatted = cData.data.map(item => ({
          name: new Date(item.date).toLocaleDateString(undefined, { weekday: 'short' }),
          completed: item.habitsCompleted,
          xp: item.xpEarned
        }));
        
        setChartData(formatted);
        setHeatmapData(hData.data);
      } catch (err) {
        console.error('Error fetching progress data');
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  if (loading) return (
    <div className="h-[60vh] flex flex-col items-center justify-center gap-4">
      <Loader2 size={40} className="animate-spin text-primary" />
      <p className="text-muted-foreground font-medium">Crunching your numbers...</p>
    </div>
  );

  return (
    <div className="space-y-10">
      <header>
        <h1 className="text-4xl font-black mb-2">Analytics</h1>
        <p className="text-muted-foreground font-medium">Visualize your growth and consistency trends.</p>
      </header>

      <div className="grid md:grid-cols-2 gap-8">
        <ChartCard title="Habit Completion" icon={CheckCircle2} delay={0.1}>
          <BarChart data={chartData}>
            <CartesianGrid strokeDasharray="3 3" stroke="#ffffff10" vertical={false} />
            <XAxis 
              dataKey="name" 
              axisLine={false} 
              tickLine={false} 
              tick={{ fill: '#94a3b8', fontSize: 12, fontWeight: 600 }}
              dy={10}
            />
            <YAxis 
              hide 
            />
            <Tooltip 
              cursor={{ fill: '#ffffff05' }}
              contentStyle={{ 
                backgroundColor: '#1e293b', 
                border: '1px solid rgba(255,255,255,0.1)', 
                borderRadius: '16px',
                fontWeight: '600'
              }}
            />
            <Bar 
              dataKey="completed" 
              fill="#8b5cf6" 
              radius={[6, 6, 0, 0]} 
              barSize={32}
            />
          </BarChart>
        </ChartCard>

        <ChartCard title="XP Progression" icon={Zap} delay={0.2}>
          <AreaChart data={chartData}>
            <defs>
              <linearGradient id="colorXp" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#8b5cf6" stopOpacity={0.3}/>
                <stop offset="95%" stopColor="#8b5cf6" stopOpacity={0}/>
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" stroke="#ffffff10" vertical={false} />
            <XAxis 
              dataKey="name" 
              axisLine={false} 
              tickLine={false} 
              tick={{ fill: '#94a3b8', fontSize: 12, fontWeight: 600 }}
              dy={10}
            />
            <YAxis hide />
            <Tooltip 
              contentStyle={{ 
                backgroundColor: '#1e293b', 
                border: '1px solid rgba(255,255,255,0.1)', 
                borderRadius: '16px',
                fontWeight: '600'
              }}
            />
            <Area 
              type="monotone" 
              dataKey="xp" 
              stroke="#8b5cf6" 
              strokeWidth={3}
              fillOpacity={1} 
              fill="url(#colorXp)" 
            />
          </AreaChart>
        </ChartCard>
      </div>

      {/* Simplified Heatmap Placeholder since full GitHub heatmap implementation is large */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
        className="glass p-8 rounded-[2.5rem] border border-white/5 overflow-x-auto"
      >
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-primary/20 flex items-center justify-center text-primary">
              <Calendar size={20} />
            </div>
            <h3 className="text-xl font-black">Consistency Map</h3>
          </div>
          <div className="flex items-center gap-2 text-xs font-bold text-muted-foreground uppercase">
            <span>Less</span>
            <div className="flex gap-1 mr-2">
              {[0.05, 0.3, 0.6, 0.9].map(o => (
                <div key={o} className="w-3 h-3 rounded-sm bg-primary" style={{ opacity: o }} />
              ))}
            </div>
            <span>More</span>
          </div>
        </div>
        
        <div className="min-w-[800px]">
          {/* Month Labels */}
          <div className="flex mb-2 text-[10px] font-black uppercase text-muted-foreground tracking-widest ml-10">
            {(() => {
              const months = [];
              const today = new Date();
              for (let i = 11; i >= 0; i--) {
                const date = new Date(today.getFullYear(), today.getMonth() - i, 1);
                months.push(date.toLocaleString('default', { month: 'short' }));
              }
              return months.map((m, i) => (
                <div key={i} className="flex-1 text-center">{m}</div>
              ));
            })()}
          </div>

          <div className="flex gap-4">
            {/* Day Labels */}
            <div className="flex flex-col justify-between text-[10px] font-black uppercase text-muted-foreground h-[110px] py-1">
              <span>Mon</span>
              <span>Wed</span>
              <span>Fri</span>
            </div>

            {/* Heatmap Grid */}
            <div className="flex-1 grid grid-flow-col grid-rows-7 gap-1">
              {(() => {
                const cells = [];
                const today = new Date();
                const totalDays = 52 * 7;
                
                // Align to Monday
                const startOffset = (today.getDay() + 6) % 7;
                const startDate = new Date(today);
                startDate.setDate(today.getDate() - totalDays + startOffset);

                for (let i = 0; i < totalDays; i++) {
                  const d = new Date(startDate);
                  d.setDate(startDate.getDate() + i);
                  const dateStr = d.toISOString().split('T')[0];
                  
                  const dataPoint = heatmapData.find(dp => dp.date.startsWith(dateStr));
                  const habitsDone = dataPoint?.habitsCompleted || 0;
                  const total = dataPoint?.totalHabits || 1;
                  const ratio = habitsDone / total;
                  
                  let opacity = 0.05;
                  if (habitsDone > 0) {
                    opacity = 0.2 + (Math.min(habitsDone, 4) / 4) * 0.8;
                  }

                  cells.push(
                    <div
                      key={i}
                      className="w-3 h-3 rounded-sm bg-primary transition-all hover:scale-150 cursor-pointer relative group"
                      style={{ opacity }}
                    >
                      <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 px-2 py-1 bg-popover text-popover-foreground text-[10px] rounded opacity-0 group-hover:opacity-100 whitespace-nowrap z-10 pointer-events-none border border-border shadow-xl font-bold">
                        {habitsDone} habits on {d.toLocaleDateString(undefined, { month: 'short', day: 'numeric' })}
                      </div>
                    </div>
                  );
                }
                return cells;
              })()}
            </div>
          </div>
        </div>
      </motion.div>
    </div>
  );
};

export default Progress;
