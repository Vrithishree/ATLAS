import { motion, AnimatePresence } from 'framer-motion';
import {
  Shield, Crosshair, Activity, FileText, ChevronLeft,
  ChevronRight, CircleDot, Settings, LifeBuoy,
} from 'lucide-react';
import BrandLogo from './BrandLogo';

interface SidebarProps {
  collapsed: boolean;
  onToggle: () => void;
  scanning: boolean;
}

const NAV = [
  { id: 'vuln', label: 'Vulnerability Assessment', icon: Crosshair, active: true, available: true },
  { id: 'attack-graph', label: 'Attack Graph', icon: Activity, active: false, available: false },
  { id: 'attack-path', label: 'Attack Path', icon: Shield, active: false, available: false },
  { id: 'ai-pentest', label: 'AI Pentest', icon: Crosshair, active: false, available: false },
  { id: 'threat-intel', label: 'Threat Intelligence', icon: Activity, active: false, available: false },
  { id: 'business', label: 'Business Context', icon: FileText, active: false, available: false },
  { id: 'remediation', label: 'Remediation', icon: Shield, active: false, available: false },
];

const SECONDARY = [
  { id: 'settings', label: 'Settings', icon: Settings },
  { id: 'support', label: 'Support', icon: LifeBuoy },
];

export default function Sidebar({ collapsed, onToggle, scanning }: SidebarProps) {
  return (
    <motion.aside
      initial={false}
      animate={{ width: collapsed ? 72 : 256 }}
      transition={{ duration: 0.35, ease: [0.16, 1, 0.3, 1] }}
      className="fixed left-0 top-0 h-screen z-40 glass-card-bright border-r border-crimson-500/15 flex flex-col"
    >
      {/* Logo */}
      <div className="px-4 py-5 flex items-center justify-between border-b border-crimson-500/10">
        <div className="flex items-center gap-3 overflow-hidden">
          <BrandLogo size={collapsed ? 36 : 40} scanning={scanning} />
          <AnimatePresence>
            {!collapsed && (
              <motion.div
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -10 }}
                transition={{ duration: 0.2 }}
                className="flex flex-col leading-none"
              >
                <span className="font-cinzel font-700 text-lg tracking-[0.2em] text-crimson-200 text-glow-red">ATLAS</span>
                <span className="text-[8px] tracking-[0.3em] text-crimson-400/50 mt-0.5 font-inter uppercase">Automated VAPT</span>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
        <button
          onClick={onToggle}
          className="text-crimson-300/40 hover:text-crimson-300 transition p-1"
        >
          {collapsed ? <ChevronRight size={16} /> : <ChevronLeft size={16} />}
        </button>
      </div>

      {/* Nav */}
      <nav className="flex-1 overflow-y-auto py-4">
        <div className="px-3 space-y-1">
          {!collapsed && (
            <p className="text-[10px] uppercase tracking-[0.2em] text-crimson-400/40 px-3 mb-2 mt-1">Modules</p>
          )}
          {NAV.map((item) => {
            const Icon = item.icon;
            return (
              <div
                key={item.id}
                className={`nav-item ${item.active ? 'active' : ''} group relative flex items-center gap-3 px-3 py-2.5 rounded-md cursor-default`}
                title={collapsed ? item.label : undefined}
              >
                <Icon
                  size={18}
                  className={`shrink-0 ${item.active ? 'text-crimson-400' : item.available ? 'text-crimson-300/50' : 'text-crimson-300/20'}`}
                />
                <AnimatePresence>
                  {!collapsed && (
                    <motion.span
                      initial={{ opacity: 0, x: -8 }}
                      animate={{ opacity: 1, x: 0 }}
                      exit={{ opacity: 0, x: -8 }}
                      transition={{ duration: 0.2 }}
                      className={`text-sm flex-1 ${item.active ? 'text-crimson-100 font-500' : item.available ? 'text-crimson-300/60' : 'text-crimson-300/25'}`}
                    >
                      {item.label}
                    </motion.span>
                  )}
                </AnimatePresence>
                {item.active && !collapsed && (
                  <motion.div
                    layoutId="active-indicator"
                    className="absolute right-2 w-1.5 h-1.5 rounded-full bg-crimson-500"
                    animate={{ opacity: [1, 0.4, 1] }}
                    transition={{ duration: 2, repeat: Infinity }}
                  />
                )}
                {!item.available && !collapsed && (
                  <span className="text-[9px] text-crimson-400/30 uppercase tracking-wider">Soon</span>
                )}
              </div>
            );
          })}
        </div>

        <div className="px-3 mt-6 space-y-1">
          {!collapsed && (
            <p className="text-[10px] uppercase tracking-[0.2em] text-crimson-400/40 px-3 mb-2">System</p>
          )}
          {SECONDARY.map((item) => {
            const Icon = item.icon;
            return (
              <div key={item.id} className="nav-item flex items-center gap-3 px-3 py-2.5 rounded-md" title={collapsed ? item.label : undefined}>
                <Icon size={18} className="shrink-0 text-crimson-300/40" />
                <AnimatePresence>
                  {!collapsed && (
                    <motion.span
                      initial={{ opacity: 0, x: -8 }}
                      animate={{ opacity: 1, x: 0 }}
                      exit={{ opacity: 0, x: -8 }}
                      className="text-sm text-crimson-300/50"
                    >
                      {item.label}
                    </motion.span>
                  )}
                </AnimatePresence>
              </div>
            );
          })}
        </div>
      </nav>

      {/* User */}
      <div className="px-3 py-4 border-t border-crimson-500/10">
        <div className="flex items-center gap-3 px-2">
          <div className="w-8 h-8 rounded-full bg-gradient-to-br from-crimson-500 to-crimson-800 flex items-center justify-center text-xs font-600 text-white shrink-0">
          </div>

          <AnimatePresence>
            {!collapsed && (
              <motion.div
                initial={{ opacity: 0, x: -8 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -8 }}
                className="flex-1 min-w-0"
               >
                <p className="text-xs font-500 text-crimson-100 truncate">
                   ATLAS
                </p>
              </motion.div>
             )}
          </AnimatePresence>

        </div>
      </div>
      </motion.aside>
  );
}