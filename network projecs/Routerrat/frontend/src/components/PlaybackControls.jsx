import React from 'react';
import { Play, Pause, SkipBack, SkipForward, Clock } from 'lucide-react';
import { motion } from 'framer-motion';

export default function PlaybackControls({ isPlaying, onTogglePlay, currentTime, totalTime, onSeek, impactTime = 8 }) {
  // Calculate percentage
  const progress = totalTime > 0 ? (currentTime / totalTime) * 100 : 0;
  const impactProgress = totalTime > 0 ? (impactTime / totalTime) * 100 : 50;

  return (
    <div className="glass-panel p-4 flex items-center gap-4 sticky bottom-4 z-50 shadow-[0_0_50px_rgba(0,0,0,0.8)] border border-white/20">
      <div className="flex gap-2">
        <motion.button 
          whileHover={{ scale: 1.1 }}
          whileTap={{ scale: 0.9 }}
          onClick={() => onSeek(0)}
          className="p-2 text-[#94a3b8] hover:text-white bg-white/5 rounded-full"
        >
          <SkipBack className="w-4 h-4" />
        </motion.button>
        <motion.button 
          whileHover={{ scale: 1.1 }}
          whileTap={{ scale: 0.9 }}
          onClick={onTogglePlay}
          className="p-2 text-[#00f3ff] hover:text-white bg-[#00f3ff]/10 border border-[#00f3ff]/30 rounded-full"
        >
          {isPlaying ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4 ml-0.5" />}
        </motion.button>
        <motion.button 
          whileHover={{ scale: 1.1 }}
          whileTap={{ scale: 0.9 }}
          onClick={() => onSeek(totalTime)}
          className="p-2 text-[#94a3b8] hover:text-white bg-white/5 rounded-full"
        >
          <SkipForward className="w-4 h-4" />
        </motion.button>
      </div>

      <div className="flex-1 flex flex-col gap-2 mx-2 relative mt-2">
        <div className="flex justify-between text-xs font-mono text-[#94a3b8]">
          <span className="flex items-center gap-1"><Clock className="w-3 h-3" /> T-{totalTime - currentTime}s</span>
          <span 
            className="absolute text-[#ff0055] font-bold uppercase tracking-widest text-[9px] -translate-x-1/2 whitespace-nowrap"
            style={{ left: `${impactProgress}%`, top: '-14px' }}
          >
            Impact Point
          </span>
        </div>
        <div className="h-2 bg-black rounded-full overflow-hidden relative cursor-pointer" onClick={(e) => {
          const rect = e.currentTarget.getBoundingClientRect();
          const x = e.clientX - rect.left;
          const percentage = x / rect.width;
          onSeek(Math.floor(percentage * totalTime));
        }}>
          <div 
            className="absolute top-0 left-0 bottom-0 bg-gradient-to-r from-[#00f3ff] to-[#ff0055] transition-all duration-300"
            style={{ width: `${progress}%` }}
          />
          <div 
            className="absolute top-0 bottom-0 w-[2px] bg-[#ff0055] shadow-[0_0_5px_#ff0055] pointer-events-none"
            style={{ left: `${impactProgress}%` }}
          />
        </div>
      </div>
    </div>
  );
}
