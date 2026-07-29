import { motion } from 'framer-motion';

interface BrandLogoProps {
  size?: number;
  withGlow?: boolean;
  scanning?: boolean;
  showText?: boolean;
  className?: string;
}

export default function BrandLogo({ size = 40, withGlow = true, scanning = false, showText = false, className = '' }: BrandLogoProps) {
  return (
    <div className={`flex items-center gap-3 ${className}`}>
      <div className="relative" style={{ width: size, height: size }}>
        {scanning && (
          <>
            <motion.div
              className="absolute inset-0 rounded-full border-2 border-crimson-500/60"
              style={{ borderTopColor: 'transparent', borderBottomColor: 'transparent' }}
              animate={{ rotate: 360 }}
              transition={{ duration: 3, repeat: Infinity, ease: 'linear' }}
            />
            <motion.div
              className="absolute inset-[-4px] rounded-full border border-crimson-400/40"
              style={{ borderLeftColor: 'transparent', borderRightColor: 'transparent' }}
              animate={{ rotate: -360 }}
              transition={{ duration: 5, repeat: Infinity, ease: 'linear' }}
            />
          </>
        )}
        <motion.div
          className="relative w-full h-full rounded-full overflow-hidden flex items-center justify-center"
          style={{
            boxShadow: withGlow ? '0 0 20px rgba(220, 28, 28, 0.5), 0 0 40px rgba(220, 28, 28, 0.2)' : 'none',
          }}
          animate={scanning ? {
            boxShadow: [
              '0 0 20px rgba(220, 28, 28, 0.5), 0 0 40px rgba(220, 28, 28, 0.2)',
              '0 0 30px rgba(220, 28, 28, 0.9), 0 0 60px rgba(220, 28, 28, 0.4)',
              '0 0 20px rgba(220, 28, 28, 0.5), 0 0 40px rgba(220, 28, 28, 0.2)',
            ],
          } : {}}
          transition={scanning ? { duration: 2, repeat: Infinity, ease: 'easeInOut' } : {}}
        >
          <img src="/logo.png" alt="ATLAS" className="w-full h-full object-cover rounded-full" />
        </motion.div>
      </div>
      {showText && (
        <div className="flex flex-col leading-none">
          <span className="font-cinzel font-700 text-xl tracking-[0.2em] text-crimson-200 text-glow-red">ATLAS</span>
          <span className="text-[9px] tracking-[0.3em] text-crimson-400/60 mt-1 font-inter">CYBERSECURITY</span>
        </div>
      )}
    </div>
  );
}
