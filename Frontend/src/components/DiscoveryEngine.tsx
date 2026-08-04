import { motion, AnimatePresence } from 'framer-motion';
import {
  Globe, Lock, Network, Cpu, Server, Webhook, Route,
  CheckCircle2, Loader2, Radar, ChevronDown, Zap,
} from 'lucide-react';
import type { DiscoveryTask, DiscoveryResult } from '../data';
import type { LucideIcon } from 'lucide-react';

interface DiscoveryEngineProps {
  tasks: DiscoveryTask[];
  activeTaskIndex: number;
  completedTasks: number[];
  taskProgress: number;
  discoveryComplete: boolean;
  discoveryResult: DiscoveryResult | null;
  collapsed: boolean;
}

const ICON_MAP: Record<string, LucideIcon> = {
  Globe, Lock, Network, Cpu, Server, Webhook, Route,
};

export default function DiscoveryEngine({
  tasks, activeTaskIndex, completedTasks, taskProgress, discoveryComplete, discoveryResult, collapsed,
}: DiscoveryEngineProps) {
  const overall = discoveryComplete ? 100 : Math.round(((completedTasks.length + taskProgress / 100) / tasks.length) * 100);

  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="glass-card-bright rounded-2xl overflow-hidden"
    >
      {/* Header */}
      <div className="flex items-center justify-between px-5 py-4 border-b border-crimson-500/10 bg-crimson-950/20">
        <div className="flex items-center gap-3">
          <div className="relative">
            <motion.div
              animate={discoveryComplete ? {} : { rotate: 360 }}
              transition={{ duration: 4, repeat: Infinity, ease: 'linear' }}
              className="text-crimson-400"
            >
              <Radar size={22} />
            </motion.div>
          </div>
          <div>
            <h2 className="text-base font-600 text-crimson-100">AI Reconnaissance Engine</h2>
            <p className="text-[11px] text-crimson-300/50">
              {discoveryComplete ? 'Reconnaissance complete' : 'Mapping Target Infrastructure & Attack Surface'}
            </p>
          </div>
        </div>
        <div className="flex items-center gap-4">
          <div className="hidden sm:flex items-center gap-2">
            <span className="text-[10px] uppercase tracking-wider text-crimson-300/40">Progress</span>
            <span className="text-lg font-700 font-cinzel text-crimson-200">{overall}%</span>
          </div>
          <AnimatePresence>
            {discoveryComplete && (
              <motion.div
                initial={{ scale: 0, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/30"
              >
                <CheckCircle2 size={14} className="text-emerald-400" />
                <span className="text-xs text-emerald-400 font-500">Complete</span>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>

      <AnimatePresence initial={false}>
        {!collapsed && (
          <motion.div
            initial={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
            className="overflow-hidden"
          >
            <div className="p-5">
              {/* Overall progress bar */}
              <div className="mb-6">
                <div className="h-1.5 rounded-full bg-crimson-950/60 overflow-hidden">
                  <motion.div
                    className="h-full progress-shimmer rounded-full"
                    initial={{ width: 0 }}
                    animate={{ width: `${overall}%` }}
                    transition={{ duration: 0.5, ease: 'easeOut' }}
                  />
                </div>
              </div>

              {/* Rotating scan visualization */}
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-5 mb-6">
                <div className="flex items-center justify-center py-2">
                  <div className="relative w-32 h-32">
                    {/* Outer rotating ring */}
                    {!discoveryComplete && (
                      <>
                        <motion.div
                          className="absolute inset-0 rounded-full border-2 border-crimson-500/30"
                          style={{ borderTopColor: '#dc1c1c', borderRightColor: 'transparent' }}
                          animate={{ rotate: 360 }}
                          transition={{ duration: 2, repeat: Infinity, ease: 'linear' }}
                        />
                        <motion.div
                          className="absolute inset-3 rounded-full border border-crimson-400/20"
                          style={{ borderBottomColor: '#ff4444', borderLeftColor: 'transparent' }}
                          animate={{ rotate: -360 }}
                          transition={{ duration: 3, repeat: Infinity, ease: 'linear' }}
                        />
                      </>
                    )}
                    {/* Center */}
                    <div className="absolute inset-6 rounded-full bg-crimson-950/80 flex flex-col items-center justify-center glow-red">
                      {discoveryComplete ? (
                        <CheckCircle2 size={28} className="text-emerald-400" />
                      ) : (
                        <motion.div
                          animate={{ scale: [1, 1.15, 1] }}
                          transition={{ duration: 1.5, repeat: Infinity }}
                        >
                          <Radar size={28} className="text-crimson-400 drop-shadow-[0_0_12px_rgba(220,28,28,0.8)]" />
                        </motion.div>
                      )}
                      <span className="text-[9px] text-crimson-300/50 mt-1 uppercase tracking-wider">
                        {discoveryComplete ? 'Done' : 'Scanning'}
                      </span>
                    </div>
                    {/* Orbiting dots */}
                    {!discoveryComplete && [0, 1, 2].map((i) => (
                      <motion.div
                        key={i}
                        className="absolute top-1/2 left-1/2 w-1.5 h-1.5 rounded-full bg-crimson-400"
                        style={{ boxShadow: '0 0 8px #dc1c1c' }}
                        animate={{
                          x: [Math.cos((i * 2 * Math.PI) / 3) * 56, Math.cos((i * 2 * Math.PI) / 3 + 2 * Math.PI) * 56],
                          y: [Math.sin((i * 2 * Math.PI) / 3) * 56, Math.sin((i * 2 * Math.PI) / 3 + 2 * Math.PI) * 56],
                        }}
                        transition={{ duration: 3, repeat: Infinity, ease: 'linear' }}
                      />
                    ))}
                  </div>
                </div>

                {/* Live counters */}
                <div className="lg:col-span-2 grid grid-cols-2 sm:grid-cols-3 gap-3">
                  <CounterCard label="Ports Scanned " value={discoveryComplete ? 65535 : Math.round(65535 * (taskProgress / 100))} max={65535} active={!discoveryComplete} />
                  <CounterCard label="Assets Identified" value={discoveryComplete ? 2 : completedTasks.length > 0 ? 1 : 0} active={!discoveryComplete} />
                  <CounterCard label="Running Services" value={discoveryResult ? discoveryResult.services.length : 0} active={!discoveryComplete} />
                  <CounterCard label="Endpoints" value={discoveryResult ? discoveryResult.endpoints.length : 0} active={!discoveryComplete} />
                  <CounterCard label="API Surface" value={discoveryResult ? discoveryResult.apis.length : 0} active={!discoveryComplete} />
                  <CounterCard label="Technologies" value={discoveryResult ? discoveryResult.technologies.length : 0} active={!discoveryComplete} />
                </div>
              </div>

              {/* Task list */}
              <div className="space-y-2">
                {tasks.map((task, idx) => {
                  const Icon = ICON_MAP[task.icon] || Globe;
                  const isActive = idx === activeTaskIndex && !discoveryComplete;
                  const isDone = completedTasks.includes(idx) || discoveryComplete;
                  return (
                    <motion.div
                      key={task.id}
                      animate={isActive ? { backgroundColor: 'rgba(220, 28, 28, 0.06)' } : {}}
                      className={`flex items-center gap-3 px-3 py-2.5 rounded-lg border transition ${
                        isActive ? 'border-crimson-500/30' : isDone ? 'border-emerald-500/15' : 'border-transparent'
                      }`}
                    >
                      <div className={`shrink-0 ${isDone ? 'text-emerald-400' : isActive ? 'text-crimson-400' : 'text-crimson-300/30'}`}>
                        {isDone ? <CheckCircle2 size={18} /> : isActive ? <Loader2 size={18} className="animate-spin" /> : <Icon size={18} />}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between">
                          <span className={`text-sm font-500 ${isDone ? 'text-crimson-100/80' : isActive ? 'text-crimson-100' : 'text-crimson-300/40'}`}>
                            {task.label}
                          </span>
                          {isActive && (
                            <span className="text-[10px] text-crimson-400 font-mono">{Math.round(taskProgress)}%</span>
                          )}
                          {isDone && (
                            <span className="text-[10px] text-emerald-400/60 font-mono">OK</span>
                          )}
                        </div>
                        <p className="text-[11px] text-crimson-300/40 truncate">{task.description}</p>
                        {isActive && (
                          <div className="h-0.5 mt-2 rounded-full bg-crimson-950/60 overflow-hidden">
                            <motion.div
                              className="h-full progress-shimmer rounded-full"
                              animate={{ width: `${taskProgress}%` }}
                              transition={{ duration: 0.3 }}
                            />
                          </div>
                        )}
                      </div>
                    </motion.div>
                  );
                })}
              </div>

              {/* Discovery results summary */}
              <AnimatePresence>
                {discoveryComplete && discoveryResult && (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: 'auto' }}
                    transition={{ duration: 0.5, delay: 0.2 }}
                    className="mt-5 overflow-hidden"
                  >
                    <div className="flex items-center gap-2 mb-3">
                      <Zap size={14} className="text-crimson-400" />
                      <span className="text-xs uppercase tracking-wider text-crimson-300/60 font-600">Reconnaissance Summary</span>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                      <ResultBlock title="DNS Intelligence">
                        <Row k="Hostname" v={discoveryResult.dns.hostname} />
                        <Row k="IPs" v={discoveryResult.dns.ips.join(', ')} />
                        <Row k="Nameservers" v={discoveryResult.dns.nameservers.join(', ')} />
                      </ResultBlock>
                      <ResultBlock title="TLS Configuration">
                        <Row k="Issuer" v={discoveryResult.ssl.issuer} />
                        <Row k="Protocol" v={discoveryResult.ssl.protocol} />
                        <Row k="Valid Until" v={discoveryResult.ssl.validTo} />
                      </ResultBlock>
                      <ResultBlock title="Open Ports">
                        {discoveryResult.ports.map((p) => (
                          <div key={p.port} className="flex items-center justify-between text-[11px] py-0.5">
                            <span className="text-crimson-300/60">:{p.port} {p.service}</span>
                            <span className={`px-1.5 py-0.5 rounded text-[9px] ${p.state === 'open' ? 'bg-emerald-500/10 text-emerald-400' : 'bg-amber-500/10 text-amber-400'}`}>
                              {p.state}
                            </span>
                          </div>
                        ))}
                      </ResultBlock>
                      <ResultBlock title="Technologies Detected">
                        <div className="flex flex-wrap gap-1.5">
                          {discoveryResult.technologies.map((t) => (
                            <span key={t} className="text-[10px] px-2 py-0.5 rounded-full bg-crimson-500/10 border border-crimson-500/20 text-crimson-300/70">
                              {t}
                            </span>
                          ))}
                        </div>
                      </ResultBlock>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {collapsed && (
        <div className="px-5 py-3 flex items-center justify-between text-xs text-crimson-300/50">
          <span className="flex items-center gap-2">
            <CheckCircle2 size={14} className="text-emerald-400" />
            Discovery complete — {discoveryResult?.technologies.length || 0} technologies, {discoveryResult?.ports.length || 0} ports
          </span>
          <ChevronDown size={14} className="rotate-180" />
        </div>
      )}
    </motion.div>
  );
}

function CounterCard({ label, value, max, active }: { label: string; value: number; max?: number; active: boolean }) {
  return (
    <div className="glass-card rounded-lg px-3 py-2.5">
      <p className="text-[9px] uppercase tracking-wider text-crimson-300/40 mb-1">{label}</p>
      <motion.span
        key={value}
        initial={{ opacity: 0.5 }}
        animate={{ opacity: 1 }}
        className={`text-lg font-700 font-cinzel ${active ? 'text-crimson-200' : 'text-crimson-100/80'}`}
      >
        {value.toLocaleString()}
      </motion.span>
      {max && <span className="text-[10px] text-crimson-300/30 ml-1">/{max.toLocaleString()}</span>}
    </div>
  );
}

function ResultBlock({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="glass-card rounded-lg p-3">
      <p className="text-[10px] uppercase tracking-wider text-crimson-400/60 font-600 mb-2">{title}</p>
      <div className="space-y-0.5">{children}</div>
    </div>
  );
}

function Row({ k, v }: { k: string; v: string }) {
  return (
    <div className="flex items-center justify-between text-[11px] py-0.5">
      <span className="text-crimson-300/50">{k}</span>
      <span className="text-crimson-200/80 font-mono truncate ml-2 max-w-[60%] text-right">{v}</span>
    </div>
  );
}
