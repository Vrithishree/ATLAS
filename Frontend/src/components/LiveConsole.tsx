import { useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Terminal, Trash2 } from 'lucide-react';
import type { ConsoleLog } from '../data';

interface LiveConsoleProps {
  logs: ConsoleLog[];
  onClear: () => void;
  active: boolean;
}

const LEVEL_COLORS: Record<ConsoleLog['level'], string> = {
  info: 'text-cyan-400/80',
  success: 'text-emerald-400',
  warning: 'text-amber-400',
  error: 'text-crimson-400',
  scan: 'text-crimson-300',
};

const LEVEL_PREFIX: Record<ConsoleLog['level'], string> = {
  info: '[INFO]',
  success: '[OK]',
  warning: '[WARN]',
  error: '[ERR]',
  scan: '[SCAN]',
};

export default function LiveConsole({ logs, onClear, active }: LiveConsoleProps) {
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [logs]);

  const formatTime = (ts: number) => {
    const d = new Date(ts);
    return `${String(d.getHours()).padStart(2, '0')}:${String(d.getMinutes()).padStart(2, '0')}:${String(d.getSeconds()).padStart(2, '0')}.${String(d.getMilliseconds()).padStart(3, '0')}`;
  };

  return (
    <div className="glass-card-bright rounded-2xl overflow-hidden h-full flex flex-col">
      <div className="flex items-center justify-between px-4 py-3 border-b border-crimson-500/10 bg-crimson-950/30">
        <div className="flex items-center gap-2">
          <Terminal size={16} className="text-crimson-400" />
          <span className="text-sm font-600 text-crimson-100">Live Activity Console</span>
          {active && (
            <motion.span
              animate={{ opacity: [1, 0.3, 1] }}
              transition={{ duration: 1.5, repeat: Infinity }}
              className="text-[10px] text-crimson-400 px-2 py-0.5 rounded-full border border-crimson-500/30"
            >
              STREAMING
            </motion.span>
          )}
        </div>
        <button
          onClick={onClear}
          className="text-crimson-300/40 hover:text-crimson-300 transition p-1"
          title="Clear console"
        >
          <Trash2 size={14} />
        </button>
      </div>
      <div
        ref={scrollRef}
        className="console-scroll flex-1 overflow-y-auto p-4 bg-surface-500/60 font-mono"
        style={{ minHeight: 240 }}
      >
        {logs.length === 0 ? (
          <p className="text-crimson-300/30 terminal-text">Awaiting assessment initialization...</p>
        ) : (
          <AnimatePresence initial={false}>
            {logs.map((log) => (
              <motion.div
                key={log.id}
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.2 }}
                className="terminal-text flex gap-2 py-0.5"
              >
                <span className="text-crimson-300/30">{formatTime(log.timestamp)}</span>
                <span className={LEVEL_COLORS[log.level]}>{LEVEL_PREFIX[log.level]}</span>
                <span className="text-crimson-100/70 flex-1">{log.message}</span>
              </motion.div>
            ))}
          </AnimatePresence>
        )}
        {active && (
          <div className="terminal-text text-crimson-400 mt-1 cursor-blink">atlas&gt;</div>
        )}
      </div>
    </div>
  );
}
