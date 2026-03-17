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
    className="glass p-8 rounded-[2.5rem] border border-white/5 flex flex-col"
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
    <div className="h-72 w-full">
      <ResponsiveContainer width="100%" height="100%">
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
        className="glass p-8 rounded-[2.5rem] border border-white/5"
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
            <div className="flex gap-1">
              {[0.1, 0.3, 0.6, 1].map(o => (
                <div key={o} className="w-3 h-3 rounded-sm bg-primary" style={{ opacity: o }} />
              ))}
            </div>
            <span>More</span>
          </div>
        </div>
        
        <div className="grid grid-cols-7 sm:grid-cols-14 md:grid-cols-28 lg:grid-cols-52 gap-2">
          {[...Array(52 * 7)].map((_, i) => {
            const dateStr = new Date(new Date().setDate(new Date().getDate() - (52 * 7 - i))).toISOString().split('T')[0];
            const dataPoint = heatmapData.find(d => d.date.split('T')[0] === dateStr);
            const intensity = dataPoint ? (dataPoint.habitsCompleted / (dataPoint.totalHabits || 1)) : 0;
            const opacity = dataPoint ? (0.2 + intensity * 0.8) : 0.05;
            
            return (
              <div 
                key={i} 
                className="aspect-square rounded-sm bg-primary transition-all hover:scale-150 cursor-pointer" 
                style={{ opacity }}
                title={`${dateStr}: ${dataPoint?.habitsCompleted || 0} habits`}
              />
            );
          })}
        </div>
      </motion.div>
    </div>
  );
};

export default Progress;
