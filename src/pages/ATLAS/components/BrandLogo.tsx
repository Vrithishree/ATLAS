import { motion } from 'framer-motion';

interface BrandLogoProps {
  size?: 'sm' | 'md' | 'lg' | 'xl';
  animated?: boolean;
  showText?: boolean;
}

const sizeMap = {
  sm: { box: 28, font: 'text-base', sub: 'text-[8px]' },
  md: { box: 36, font: 'text-lg', sub: 'text-[9px]' },
  lg: { box: 48, font: 'text-2xl', sub: 'text-[10px]' },
  xl: { box: 64, font: 'text-3xl', sub: 'text-xs' },
};

export function BrandLogo({ size = 'md', animated = false, showText = true }: BrandLogoProps) {
  const s = sizeMap[size];

  return (
  <div className="flex items-center gap-3 select-none">
    <img
      src="/logo.png"
      alt="ATLAS Logo"
      width={s.box}
      height={s.box}
      className="object-contain"
    />

    {showText && (
      <div className="flex flex-col leading-none">
        <span
          className={`font-cinzel font-700 ${s.font} text-crimson-100 tracking-wider`}
        >
          ATLAS
        </span>
      </div>
    )}
  </div>
);
}