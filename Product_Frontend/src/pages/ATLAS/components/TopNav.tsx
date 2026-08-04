import { motion } from 'framer-motion';
import { LayoutDashboard, Crosshair, ShieldAlert, FileText, Activity } from 'lucide-react';
import { BrandLogo } from './BrandLogo';
import type { View } from '../types';

interface TopNavProps {
  view: View;
  onNavigate: (view: View) => void;
  assessmentActive: boolean;
  pentestActive: boolean;
}

const navItems: { id: View; label: string; icon: typeof LayoutDashboard }[] = [
  { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { id: 'assessment', label: 'Assessment', icon: Crosshair },
  { id: 'pentest', label: 'AI Pentest', icon: Activity },
  { id: 'risk', label: 'Risk Analysis', icon: ShieldAlert },
  { id: 'reports', label: 'Reports', icon: FileText },
];

export function TopNav({ view, onNavigate, assessmentActive, pentestActive }: TopNavProps) {
  return (
    <header className="sticky top-0 z-40 border-b border-crimson-500/10 bg-surface-900/70 backdrop-blur-xl">
      <div className="max-w-[1600px] mx-auto px-6 h-16 flex items-center justify-between">
        <div className="flex items-center gap-8">
          <BrandLogo size="md" />
          <div className="hidden md:flex items-center gap-1">
            {navItems.map((item) => {
              const isActive = view === item.id;
              const isDisabled =
                (item.id === 'pentest' && !pentestActive) ||
                (item.id === 'assessment' && !assessmentActive && view !== 'assessment');
              const Icon = item.icon;
              return (
                <button
                  key={item.id}
                  onClick={() => !isDisabled && onNavigate(item.id)}
                  disabled={isDisabled}
                  className={`relative px-4 py-2 rounded-lg text-sm font-500 transition-all duration-200 flex items-center gap-2
                    ${isActive
                      ? 'text-crimson-200 bg-crimson-500/10'
                      : isDisabled
                        ? 'text-crimson-300/20 cursor-not-allowed'
                        : 'text-crimson-300/60 hover:text-crimson-200 hover:bg-crimson-500/5'
                    }`}
                >
                  <Icon className="w-4 h-4" />
                  {item.label}
                  {isActive && (
                    <motion.div
                      layoutId="navIndicator"
                      className="absolute -bottom-px left-2 right-2 h-px bg-gradient-to-r from-transparent via-crimson-500 to-transparent"
                    />
                  )}
                </button>
              );
            })}
          </div>
        </div>
        <div className="flex items-center gap-4">
          <div className="hidden lg:flex items-center gap-2 px-3 py-1.5 rounded-lg bg-crimson-500/5 border border-crimson-500/15">
            <span className="w-2 h-2 rounded-full bg-green-400 animate-pulse" />
            <span className="text-xs font-500 text-crimson-300/60">Orchestrator Online</span>
          </div>
        </div>
      </div>
    </header>
  );
}
