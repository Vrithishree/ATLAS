import { motion } from 'framer-motion';
import { Search, Bell, Globe, ChevronDown, Activity } from 'lucide-react';

interface TopNavProps {
  scanning: boolean;
  phase: string;
}

export default function TopNav({ scanning, phase }: TopNavProps) {
  return (
    <header className="sticky top-0 z-30 glass-card border-b border-crimson-500/15 px-6 py-3 flex items-center justify-between">
      <div className="flex items-center gap-4">
        <div>
          <h1 className="text-sm font-600 text-crimson-100 flex items-center gap-2">
            Vulnerability Assessment
            <span className="text-[10px] font-400 text-crimson-400/50 px-2 py-0.5 rounded-full border border-crimson-500/20">
              Prototype v1
            </span>
          </h1>
          <p className="text-[11px] text-crimson-300/40 mt-0.5">Automated security assessment workflow</p>
        </div>
      </div>

      <div className="flex items-center gap-3">
        {/* Status pill */}
        <motion.div
          animate={scanning ? { boxShadow: ['0 0 0 0 rgba(220,28,28,0.4)', '0 0 0 6px rgba(220,28,28,0)'] } : {}}
          transition={{ duration: 2, repeat: Infinity }}
          className="hidden md:flex items-center gap-2 px-3 py-1.5 rounded-full glass-card text-xs"
        >
          <span className={`w-2 h-2 rounded-full ${scanning ? 'bg-crimson-500 status-dot-active' : 'bg-emerald-400'}`} />
          <span className="text-crimson-200/80 font-500">{phase}</span>
        </motion.div>

        <div className="hidden lg:flex items-center gap-2 px-3 py-1.5 rounded-lg glass-card text-xs text-crimson-300/50">
          <Search size={14} />
          <span>Search findings...</span>
          <kbd className="text-[10px] px-1.5 py-0.5 rounded border border-crimson-500/20 text-crimson-400/40">⌘K</kbd>
        </div>

        <button className="relative p-2 rounded-lg glass-card text-crimson-300/60 hover:text-crimson-300 transition">
          <Bell size={16} />
          <span className="absolute top-1.5 right-1.5 w-1.5 h-1.5 rounded-full bg-crimson-500" />
        </button>

        <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg glass-card cursor-pointer">
          <Globe size={14} className="text-crimson-400" />
          <span className="text-xs text-crimson-200/80 hidden sm:inline">us-east-1</span>
          <ChevronDown size={12} className="text-crimson-300/40" />
        </div>

        <div className="hidden sm:flex items-center gap-2 px-3 py-1.5 rounded-lg glass-card">
          <Activity size={14} className="text-emerald-400" />
          <span className="text-xs text-crimson-200/70">Live</span>
        </div>
      </div>
    </header>
  );
}
