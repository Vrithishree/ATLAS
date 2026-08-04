import { motion } from 'framer-motion';
import type { Severity } from '../data';
import { SEVERITY_META } from '../data';

interface DonutChartProps {
  counts: Record<Severity, number>;
  total: number;
  animate: boolean;
}

const ORDER: Severity[] = ['critical', 'high', 'medium', 'low', 'info'];

export default function DonutChart({ counts, total, animate }: DonutChartProps) {
  const size = 200;
  const cx = size / 2;
  const cy = size / 2;
  const radius = 80;
  const stroke = 22;
  const circumference = 2 * Math.PI * radius;

  let offset = 0;
  const segments = ORDER.map((sev) => {
    const count = counts[sev] || 0;
    const fraction = total > 0 ? count / total : 0;
    const length = fraction * circumference;
    const seg = { sev, length, offset, count };
    offset += length;
    return seg;
  });

  return (
    <div className="relative flex items-center justify-center" style={{ width: size, height: size }}>
      <svg width={size} height={size} className="-rotate-90">
        {/* Background ring */}
        <circle
          cx={cx}
          cy={cy}
          r={radius}
          fill="none"
          stroke="rgba(220, 28, 28, 0.08)"
          strokeWidth={stroke}
        />
        {segments.map((seg) => {
          if (seg.length === 0) return null;
          return (
            <motion.circle
              key={seg.sev}
              cx={cx}
              cy={cy}
              r={radius}
              fill="none"
              stroke={SEVERITY_META[seg.sev].ring}
              strokeWidth={stroke}
              strokeLinecap="round"
              strokeDasharray={`${seg.length} ${circumference - seg.length}`}
              initial={{ strokeDashoffset: circumference }}
              animate={{ strokeDashoffset: animate ? -seg.offset : -seg.offset }}
              transition={{ duration: 1, ease: 'easeOut' }}
              style={{
                filter: `drop-shadow(0 0 4px ${SEVERITY_META[seg.sev].ring}80)`,
              }}
            />
          );
        })}
      </svg>
      <div className="absolute inset-0 flex flex-col items-center justify-center">
        <motion.span
          key={total}
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          className="text-3xl font-700 text-crimson-100 font-cinzel"
        >
          {total}
        </motion.span>
        <span className="text-[10px] uppercase tracking-[0.2em] text-crimson-300/50 mt-1">Findings</span>
      </div>
    </div>
  );
}
