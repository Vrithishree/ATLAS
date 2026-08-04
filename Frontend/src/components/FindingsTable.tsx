import { motion, AnimatePresence } from 'framer-motion';
import { ChevronDown, AlertCircle } from 'lucide-react';
import type { Finding } from '../data';
import { SEVERITY_META } from '../data';

interface FindingsTableProps {
  findings: Finding[];
  complete: boolean;
}

export default function FindingsTable({ findings, complete }: FindingsTableProps) {
  return (
    <div className="glass-card-bright rounded-2xl overflow-hidden">
      <div className="flex items-center justify-between px-5 py-4 border-b border-crimson-500/10 bg-crimson-950/20">
        <div className="flex items-center gap-3">
          <AlertCircle size={20} className="text-crimson-400" />
          <div>
            <h2 className="text-base font-600 text-crimson-100">Findings</h2>
            <p className="text-[11px] text-crimson-300/50">
              {complete ? `${findings.length} vulnerabilities detected` : 'Streaming findings in real time...'}
            </p>
          </div>
        </div>
        <div className="text-xs text-crimson-300/40">
          {findings.length} {findings.length === 1 ? 'record' : 'records'}
        </div>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="text-[10px] uppercase tracking-wider text-crimson-300/40 border-b border-crimson-500/10">
              <th className="text-left font-600 px-5 py-3">Severity</th>
              <th className="text-left font-600 px-5 py-3">Vulnerability</th>
              <th className="text-left font-600 px-5 py-3 hidden md:table-cell">Affected Asset</th>
              <th className="text-left font-600 px-5 py-3">CVSS</th>
              <th className="text-left font-600 px-5 py-3 hidden sm:table-cell">Status</th>
            </tr>
          </thead>
          <tbody>
            <AnimatePresence initial={false}>
              {findings.map((f) => {
                const meta = SEVERITY_META[f.severity];
                return (
                  <motion.tr
                    key={f.id}
                    initial={{ opacity: 0, x: -20, backgroundColor: 'rgba(220, 28, 28, 0.15)' }}
                    animate={{ opacity: 1, x: 0, backgroundColor: 'rgba(0, 0, 0, 0)' }}
                    transition={{ duration: 0.5 }}
                    className="border-b border-crimson-500/5 hover:bg-crimson-500/5 transition"
                  >
                    <td className="px-5 py-3">
                      <span
                        className="text-[10px] uppercase tracking-wider font-600 px-2 py-1 rounded"
                        style={{ background: meta.bg, color: meta.color, border: `1px solid ${meta.ring}40` }}
                      >
                        {meta.label}
                      </span>
                    </td>
                    <td className="px-5 py-3">
                      <div className="text-crimson-100/90 font-500">{f.vulnerability}</div>
                      <div className="text-[11px] text-crimson-300/40 mt-0.5 truncate max-w-md">{f.description}</div>
                    </td>
                    <td className="px-5 py-3 hidden md:table-cell">
                      <span className="text-crimson-300/70 font-mono text-xs">{f.affectedAsset}</span>
                    </td>
                    <td className="px-5 py-3">
                      <div className="flex items-center gap-2">
                        <div className="w-12 h-1 rounded-full bg-crimson-950/60 overflow-hidden">
                          <div
                            className="h-full rounded-full"
                            style={{ width: `${(f.cvss / 10) * 100}%`, background: meta.color }}
                          />
                        </div>
                        <span className="text-xs font-mono font-600" style={{ color: meta.color }}>{f.cvss.toFixed(1)}</span>
                      </div>
                    </td>
                    <td className="px-5 py-3 hidden sm:table-cell">
                      <span className={`text-[10px] uppercase tracking-wider px-2 py-1 rounded ${
                        f.status === 'Confirmed' ? 'bg-crimson-500/10 text-crimson-400 border border-crimson-500/30'
                        : f.status === 'Verified' ? 'bg-amber-500/10 text-amber-400 border border-amber-500/30'
                        : 'bg-crimson-300/5 text-crimson-300/50 border border-crimson-300/10'
                      }`}>
                        {f.status}
                      </span>
                    </td>
                  </motion.tr>
                );
              })}
            </AnimatePresence>
          </tbody>
        </table>
        {findings.length === 0 && (
          <div className="px-5 py-10 text-center text-sm text-crimson-300/30">
            No findings yet — assessment in progress.
          </div>
        )}
      </div>
    </div>
  );
}
