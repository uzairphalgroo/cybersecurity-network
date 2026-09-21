import React, { useMemo, useState } from 'react';
import { AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid, Brush } from 'recharts';
import { Activity } from 'lucide-react';
import { motion } from 'framer-motion';

export default function FlapChart({ telemetry }) {
  const data = useMemo(() => {
    if (!telemetry || !telemetry.history) return [];
    
    // Create a time series from the history array
    return telemetry.history.map((snapshot, index) => {
      // Flap count logic: if path length changed dramatically, it's a flap event
      return {
        time: `T-${telemetry.history.length - index}`,
        pathLength: snapshot.as_path ? snapshot.as_path.length : 0,
        isFlap: index > 0 && Math.abs((snapshot.as_path?.length || 0) - (telemetry.history[index-1].as_path?.length || 0)) > 1
      };
    });
  }, [telemetry]);

  if (!data || data.length === 0) {
    return (
      <div className="glass-panel p-4 md:p-6 h-[250px] lg:h-[320px] flex items-center justify-center flex-col text-[#475569]">
        <Activity className="w-12 h-12 mb-4 opacity-50" />
        <p className="font-mono text-sm uppercase tracking-widest">Awaiting Historical Data</p>
      </div>
    );
  }

  const CustomTooltip = ({ active, payload, label }) => {
    if (active && payload && payload.length) {
      const dataPoint = payload[0].payload;
      return (
        <div className="bg-[#02040a]/90 backdrop-blur-md border border-white/10 p-3 rounded-lg shadow-xl">
          <p className="text-white font-mono text-xs mb-1">{label}</p>
          <p className="text-[#ff00ff] font-mono font-bold">Length: {dataPoint.pathLength} Hops</p>
          {dataPoint.isFlap && (
            <p className="text-[#ff0055] text-xs font-bold mt-1 uppercase tracking-widest animate-pulse">
              ⚠️ Flap Detected
            </p>
          )}
        </div>
      );
    }
    return null;
  };

  return (
    <motion.div 
      className="glass-panel p-4 md:p-6 h-[250px] lg:h-[320px] flex flex-col"
      whileHover={{ scale: 1.01, boxShadow: "0 20px 40px -10px rgba(255,0,255,0.1)" }}
      transition={{ type: "spring", stiffness: 300 }}
    >
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-xl font-syne font-bold flex items-center gap-2">
          <Activity className="w-5 h-5 text-[#ff00ff]" />
          Route Stability (Flap History)
        </h2>
        <div className="flex items-center gap-2 text-xs font-mono text-[#94a3b8]">
          <span className="w-2 h-2 rounded-full bg-[#ff00ff] shadow-[0_0_10px_#ff00ff]"></span> Path Length
        </div>
      </div>
      
      <div className="flex-1 w-full min-h-[220px]">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={data} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
            <defs>
              <linearGradient id="colorPath" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#ff00ff" stopOpacity={0.4}/>
                <stop offset="95%" stopColor="#00f3ff" stopOpacity={0}/>
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" vertical={false} />
            <XAxis 
              dataKey="time" 
              stroke="#475569" 
              fontSize={10} 
              tickMargin={10}
              tickLine={false}
              axisLine={false}
            />
            <YAxis 
              stroke="#475569" 
              fontSize={10} 
              tickLine={false}
              axisLine={false}
              domain={['dataMin - 1', 'dataMax + 1']}
            />
            <Tooltip content={<CustomTooltip />} cursor={{ stroke: 'rgba(255, 0, 255, 0.4)', strokeWidth: 2 }} />
            <Area 
              type="monotone" 
              dataKey="pathLength" 
              stroke="#ff00ff" 
              strokeWidth={3}
              fillOpacity={1} 
              fill="url(#colorPath)"
              dot={(props) => {
                const { cx, cy, payload } = props;
                if (payload.isFlap) {
                  return (
                    <circle cx={cx} cy={cy} r={6} fill="#ff0055" stroke="#fff" strokeWidth={2} />
                  );
                }
                return <circle cx={cx} cy={cy} r={4} fill="#00f3ff" stroke="#02040a" strokeWidth={2} />;
              }}
              activeDot={{ r: 8, fill: '#fff', stroke: '#ff00ff', strokeWidth: 2 }}
              animationDuration={1500}
              animationEasing="ease-out"
            />
            <Brush 
              dataKey="time" 
              height={30} 
              stroke="#00f3ff"
              fill="#080c16"
              tickFormatter={() => ''}
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>
    </motion.div>
  );
}
