import { motion } from 'framer-motion';
import {
  Bell,
  Activity,
  Shield,
  RefreshCw,
  Download,
} from 'lucide-react';

interface TopNavProps {
  scanning: boolean;
  phase: string;
}

export default function TopNav({ scanning, phase }: TopNavProps) {
  return (
    <header className="sticky top-0 z-30 glass-card border-b border-crimson-500/15 px-6 py-4 flex items-center justify-between">

      {/* Left Section */}
      <div>
      </div>

      {/* Right Section */}
      <div className="flex items-center gap-3">

        {/* Assessment Status */}
        <motion.div
          animate={
            scanning
              ? {
                  boxShadow: [
                    '0 0 0 0 rgba(220,38,38,0.35)',
                    '0 0 0 10px rgba(220,38,38,0)',
                  ],
                }
              : {}
          }
          transition={{ duration: 2, repeat: Infinity }}
          className="hidden md:flex items-center gap-2 px-4 py-2 rounded-xl glass-card"
        >
          <Shield
            size={16}
            className={scanning ? "text-red-400" : "text-emerald-400"}
          />

          <div>
            <p className="text-[10px] uppercase text-crimson-300/40">
              Assessment Status
            </p>

            <p className="text-xs text-crimson-100">
              {phase}
            </p>
          </div>
        </motion.div>

        {/* Refresh */}
        <button className="p-2 rounded-lg glass-card hover:bg-crimson-500/10 transition">
          <RefreshCw
            size={16}
            className="text-crimson-300"
          />
        </button>

        {/* Export */}
        <button className="p-2 rounded-lg glass-card hover:bg-crimson-500/10 transition">
          <Download
            size={16}
            className="text-crimson-300"
          />
        </button>

        {/* Notification */}
        <button className="relative p-2 rounded-lg glass-card hover:bg-crimson-500/10 transition">
          <Bell
            size={16}
            className="text-crimson-300"
          />

          <span className="absolute top-2 right-2 w-2 h-2 rounded-full bg-red-500" />
        </button>

        {/* Module Health */}
        <div className="hidden lg:flex items-center gap-2 px-3 py-2 rounded-lg glass-card">
          <Activity className="text-emerald-400" size={15} />

          <div>

            <p className="text-xs text-emerald-400">
              Healthy
            </p>
          </div>
        </div>

      </div>
    </header>
  );
}