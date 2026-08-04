import { motion } from 'framer-motion';
import type { ReactNode } from 'react';

interface CardProps {
  children: ReactNode;
  className?: string;
  hover?: boolean;
  delay?: number;
  onClick?: () => void;
}

export function Card({ children, className = '', hover = false, delay = 0, onClick }: CardProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, delay, ease: 'easeOut' }}
      whileHover={hover ? { y: -2 } : {}}
      onClick={onClick}
      className={`glass-card ${hover ? 'glass-card-hover' : ''} ${className}`}
    >
      {children}
    </motion.div>
  );
}

interface SectionTitleProps {
  icon?: ReactNode;
  title: string;
  subtitle?: string;
  action?: ReactNode;
}

export function SectionTitle({ icon, title, subtitle, action }: SectionTitleProps) {
  return (
    <div className="flex items-center justify-between mb-4">
      <div className="flex items-center gap-3">
        {icon && (
          <div className="w-9 h-9 rounded-lg bg-crimson-500/10 border border-crimson-500/20 flex items-center justify-center text-crimson-400">
            {icon}
          </div>
        )}
        <div>
          <h3 className="text-sm font-600 text-crimson-100 tracking-wide">{title}</h3>
          {subtitle && <p className="text-xs text-crimson-300/50 mt-0.5">{subtitle}</p>}
        </div>
      </div>
      {action}
    </div>
  );
}

interface BadgeProps {
  children: ReactNode;
  variant?: 'default' | 'critical' | 'high' | 'medium' | 'low' | 'info' | 'success';
  className?: string;
}

const badgeVariants = {
  default: 'bg-crimson-500/10 text-crimson-300 border-crimson-500/20',
  critical: 'bg-red-500/15 text-red-300 border-red-500/40',
  high: 'bg-orange-500/15 text-orange-300 border-orange-500/40',
  medium: 'bg-amber-500/15 text-amber-300 border-amber-500/40',
  low: 'bg-yellow-500/10 text-yellow-200 border-yellow-500/30',
  info: 'bg-crimson-500/5 text-crimson-300 border-crimson-500/20',
  success: 'bg-green-500/15 text-green-300 border-green-500/40',
};

export function Badge({ children, variant = 'default', className = '' }: BadgeProps) {
  return (
    <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-xs font-500 border ${badgeVariants[variant]} ${className}`}>
      {children}
    </span>
  );
}

interface StatCardProps {
  label: string;
  value: string | number;
  icon?: ReactNode;
  trend?: string;
  trendUp?: boolean;
  delay?: number;
  accent?: boolean;
}

export function StatCard({ label, value, icon, trend, trendUp, delay = 0, accent = false }: StatCardProps) {
  return (
    <Card delay={delay} hover className="p-5 relative overflow-hidden">
      {accent && (
        <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-crimson-500/50 to-transparent" />
      )}
      <div className="flex items-start justify-between">
        <div>
          <p className="text-xs text-crimson-300/50 uppercase tracking-wider font-500">{label}</p>
          <p className="text-2xl font-700 text-crimson-100 mt-2">{value}</p>
          {trend && (
            <p className={`text-xs mt-1.5 flex items-center gap-1 ${trendUp ? 'text-green-400' : 'text-crimson-400'}`}>
              {trendUp ? '▲' : '▼'} {trend}
            </p>
          )}
        </div>
        {icon && (
          <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${accent ? 'bg-crimson-500/15 text-crimson-400' : 'bg-surface-800/60 text-crimson-300/60'}`}>
            {icon}
          </div>
        )}
      </div>
    </Card>
  );
}

interface SkeletonProps {
  className?: string;
}

export function Skeleton({ className = '' }: SkeletonProps) {
  return (
    <div className={`animate-pulse bg-surface-600/40 rounded ${className}`} />
  );
}
