import { useState, useEffect, useRef, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, ShieldCheck, Clock, CheckCircle2, Loader2, AlertCircle, UserCheck } from 'lucide-react';
import { Card } from './ui';
import type { Approver, ApprovalState } from '../types';

interface ApprovalModalProps {
  open: boolean;
  onClose: () => void;
  onGranted: () => void;
}

const initialApprovers: Approver[] = [
  { name: 'Sarah Chen', role: 'Security Lead', state: 'Pending' },
  { name: 'Marcus Webb', role: 'Engineering Manager', state: 'Pending' },
  { name: 'Priya Patel', role: 'CISO', state: 'Pending' },
];

export function ApprovalModal({ open, onClose, onGranted }: ApprovalModalProps) {
  const [approvers, setApprovers] = useState<Approver[]>(initialApprovers);
  const [overallState, setOverallState] = useState<ApprovalState>('Pending');
  const timersRef = useRef<ReturnType<typeof setTimeout>[]>([]);

  const reset = useCallback(() => {
    setApprovers(initialApprovers.map(a => ({ ...a })));
    setOverallState('Pending');
  }, []);

  useEffect(() => {
    if (!open) {
      reset();
      timersRef.current.forEach(clearTimeout);
      timersRef.current = [];
      return;
    }

    const delays = [1500, 3500, 5500];
    initialApprovers.forEach((_, i) => {
      const t = setTimeout(() => {
        setApprovers(prev => {
          const next = [...prev];
          next[i] = { ...next[i], state: 'Granted', timestamp: new Date().toLocaleTimeString('en-US', { hour12: false }) };
          return next;
        });
        if (i === initialApprovers.length - 1) {
          const gt = setTimeout(() => {
            setOverallState('Granted');
            const ot = setTimeout(() => onGranted(), 800);
            timersRef.current.push(ot);
          }, 400);
          timersRef.current.push(gt);
        }
      }, delays[i]);
      timersRef.current.push(t);
    });

    return () => {
      timersRef.current.forEach(clearTimeout);
      timersRef.current = [];
    };
  }, [open, onGranted, reset]);

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm"
          onClick={onClose}
        >
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            transition={{ duration: 0.25 }}
            onClick={(e) => e.stopPropagation()}
            className="w-full max-w-lg"
          >
            <Card className="p-6 border-crimson-500/25 shadow-red-lg">
              {/* Header */}
              <div className="flex items-start justify-between mb-6">
                <div className="flex items-center gap-3">
                  <div className="w-11 h-11 rounded-xl bg-crimson-500/10 border border-crimson-500/20 flex items-center justify-center text-crimson-400">
                    <ShieldCheck className="w-6 h-6" />
                  </div>
                  <div>
                    <h3 className="text-base font-700 text-crimson-100">Pentest Approval Request</h3>
                    <p className="text-xs text-crimson-300/50">Multi-party authorization workflow</p>
                  </div>
                </div>
                <button onClick={onClose} className="text-crimson-300/40 hover:text-crimson-300 transition-colors">
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* Overall Status */}
              <div className={`p-4 rounded-xl border mb-5 flex items-center gap-3 transition-colors ${
                overallState === 'Granted'
                  ? 'bg-green-500/10 border-green-500/30'
                  : 'bg-amber-500/10 border-amber-500/30'
              }`}>
                {overallState === 'Granted' ? (
                  <CheckCircle2 className="w-5 h-5 text-green-400" />
                ) : (
                  <Clock className="w-5 h-5 text-amber-400 animate-pulse" />
                )}
                <div className="flex-1">
                  <p className={`text-sm font-600 ${overallState === 'Granted' ? 'text-green-300' : 'text-amber-300'}`}>
                    {overallState === 'Granted' ? 'Approval Granted' : 'Awaiting Approvals'}
                  </p>
                  <p className="text-xs text-crimson-300/40">
                    {overallState === 'Granted'
                      ? 'All approvers have authorized the pentest operation'
                      : 'Notifying designated approvers in sequence...'}
                  </p>
                </div>
                {overallState === 'Pending' && (
                  <Loader2 className="w-4 h-4 text-amber-400 animate-spin" />
                )}
              </div>

              {/* Approvers List */}
              <div className="space-y-2.5">
                {approvers.map((a, i) => (
                  <motion.div
                    key={i}
                    initial={{ opacity: 0, x: -8 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: i * 0.08 }}
                    className={`flex items-center gap-3 p-3 rounded-lg border transition-colors ${
                      a.state === 'Granted'
                        ? 'bg-green-500/5 border-green-500/20'
                        : 'bg-surface-800/40 border-crimson-500/10'
                    }`}
                  >
                    <div className={`w-9 h-9 rounded-full flex items-center justify-center text-xs font-600 transition-colors ${
                      a.state === 'Granted'
                        ? 'bg-green-500/20 text-green-300'
                        : 'bg-surface-700/60 text-crimson-300/50'
                    }`}>
                      {a.state === 'Granted' ? <UserCheck className="w-4 h-4" /> : a.name.split(' ').map(n => n[0]).join('')}
                    </div>
                    <div className="flex-1">
                      <p className="text-sm font-500 text-crimson-100">{a.name}</p>
                      <p className="text-xs text-crimson-300/40">{a.role}</p>
                    </div>
                    <div className="flex items-center gap-2">
                      {a.timestamp && <span className="text-[10px] font-mono text-crimson-300/30">{a.timestamp}</span>}
                      {a.state === 'Granted' ? (
                        <span className="flex items-center gap-1 text-xs text-green-400 font-500">
                          <CheckCircle2 className="w-3.5 h-3.5" /> Granted
                        </span>
                      ) : (
                        <span className="flex items-center gap-1 text-xs text-amber-400 font-500">
                          <Clock className="w-3.5 h-3.5 animate-pulse" /> Pending
                        </span>
                      )}
                    </div>
                  </motion.div>
                ))}
              </div>

              {/* Footer */}
              <div className="mt-5 pt-4 border-t border-crimson-500/10 flex items-center gap-2">
                <AlertCircle className="w-3.5 h-3.5 text-crimson-400/50" />
                <p className="text-xs text-crimson-300/40">
                  Pentest will begin automatically once all approvals are granted
                </p>
              </div>
            </Card>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
