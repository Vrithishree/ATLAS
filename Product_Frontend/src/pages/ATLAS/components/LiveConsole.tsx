import { useEffect, useRef, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Terminal } from 'lucide-react';
import type { LogEntry } from '../types';

interface LiveConsoleProps {
  logs: LogEntry[];
  isStreaming: boolean;
  title?: string;
  height?: string;
}

const levelColors: Record<string, string> = {
  info: 'text-crimson-300/70',
  success: 'text-green-400',
  warning: 'text-amber-400',
  error: 'text-red-400',
};

const levelPrefix: Record<string, string> = {
  info: '›',
  success: '✓',
  warning: '!',
  error: '✗',
};

export function LiveConsole({ logs, isStreaming, title = 'ATLAS Live Console', height = 'h-64' }: LiveConsoleProps) {
  const scrollRef = useRef<HTMLDivElement>(null);
  const [autoScroll, setAutoScroll] = useState(true);

  useEffect(() => {
    if (autoScroll && scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [logs, autoScroll]);

  const handleScroll = () => {
    if (!scrollRef.current) return;
    const { scrollTop, scrollHeight, clientHeight } = scrollRef.current;
    setAutoScroll(scrollHeight - scrollTop - clientHeight < 40);
  };

  return (
    <div className={`glass-card-bright overflow-hidden flex flex-col ${height}`}>
      <div className="flex items-center justify-between px-4 py-2.5 border-b border-crimson-500/10 bg-surface-800/40">
        <div className="flex items-center gap-2">
          <Terminal className="w-4 h-4 text-crimson-400" />
          <span className="text-xs font-mono text-crimson-200">{title}</span>
        </div>
        <div className="flex items-center gap-2">
          {isStreaming && (
            <div className="flex items-center gap-1.5">
              <span className="w-1.5 h-1.5 rounded-full bg-crimson-500 animate-pulse" />
              <span className="text-[10px] font-mono text-crimson-400">LIVE</span>
            </div>
          )}
          <button
            onClick={() => setAutoScroll(!autoScroll)}
            className="text-[10px] font-mono text-crimson-300/40 hover:text-crimson-300 transition-colors"
          >
            {autoScroll ? 'AUTO' : 'MANUAL'}
          </button>
        </div>
      </div>
      <div
        ref={scrollRef}
        onScroll={handleScroll}
        className="flex-1 overflow-y-auto scrollbar-thin p-3 font-mono text-xs space-y-1 bg-surface-900/40"
      >
        <AnimatePresence initial={false}>
          {logs.map((log) => (
            <motion.div
              key={log.id}
              initial={{ opacity: 0, x: -8 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.2 }}
              className="flex gap-2 leading-relaxed"
            >
              <span className="text-crimson-300/30 shrink-0">{log.time}</span>
              <span className={`shrink-0 ${levelColors[log.level]}`}>{levelPrefix[log.level]}</span>
              {log.agent && <span className="text-crimson-500/40 shrink-0">[{log.agent}]</span>}
              <span className={levelColors[log.level]}>{log.message}</span>
            </motion.div>
          ))}
        </AnimatePresence>
        {isStreaming && (
          <div className="flex gap-2">
            <span className="text-crimson-300/30">{new Date().toLocaleTimeString('en-US', { hour12: false })}</span>
            <span className="text-crimson-400 animate-pulse">▊</span>
          </div>
        )}
      </div>
    </div>
  );
}
