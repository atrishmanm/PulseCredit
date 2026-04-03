import { Activity } from 'lucide-react';
import { cn } from '@/src/lib/utils';

interface ScoreGaugeProps {
  score: number;
  maxScore?: number;
  size?: 'sm' | 'md' | 'lg';
  showLabel?: boolean;
}

export function ScoreGauge({ score, maxScore = 100, size = 'md', showLabel = true }: ScoreGaugeProps) {
  const percentage = (score / maxScore) * 100;

  // Determine color and label based on score
  const getScoreInfo = () => {
    if (percentage < 20) return { label: 'Poor', color: '#DC2626', bgColor: 'bg-red-500' };
    if (percentage < 40) return { label: 'Fair', color: '#F97316', bgColor: 'bg-orange-500' };
    if (percentage < 60) return { label: 'Good', color: '#FBBF24', bgColor: 'bg-yellow-500' };
    if (percentage < 80) return { label: 'Very Good', color: '#84CC16', bgColor: 'bg-lime-500' };
    return { label: 'Excellent', color: '#22C55E', bgColor: 'bg-green-500' };
  };

  const scoreInfo = getScoreInfo();

  const sizeMap = {
    sm: { outer: 'w-24 h-24', inner: 'w-20 h-20', text: 'text-xl', labelSize: 'text-xs' },
    md: { outer: 'w-40 h-40', inner: 'w-36 h-36', text: 'text-4xl', labelSize: 'text-sm' },
    lg: { outer: 'w-56 h-56', inner: 'w-52 h-52', text: 'text-5xl', labelSize: 'text-base' },
  };

  const sizes = sizeMap[size];
  const radius = size === 'sm' ? 40 : size === 'md' ? 70 : 100;
  const circumference = Math.PI * radius;
  const offset = circumference - (percentage / 100) * circumference;

  return (
    <div className="flex flex-col items-center gap-4">
      {/* SVG Gauge */}
      <div className={cn(sizes.outer, 'relative flex items-center justify-center')}>
        {/* Background Circle */}
        <svg className="absolute w-full h-full" style={{ transform: 'rotate(-90deg)' }}>
          <circle
            cx="50%"
            cy="50%"
            r={radius}
            fill="none"
            stroke="currentColor"
            strokeWidth="8"
            className="text-surface-container-highest"
          />
          {/* Progress Arc */}
          <circle
            cx="50%"
            cy="50%"
            r={radius}
            fill="none"
            stroke={scoreInfo.color}
            strokeWidth="8"
            strokeDasharray={circumference}
            strokeDashoffset={offset}
            strokeLinecap="round"
            className="transition-all duration-500 ease-out"
            style={{
              filter: `drop-shadow(0 0 8px ${scoreInfo.color}30)`,
            }}
          />
        </svg>

        {/* Center Content */}
        <div className="absolute flex flex-col items-center">
          <div className={cn(sizes.text, 'font-black font-headline text-on-surface')} style={{ color: scoreInfo.color }}>
            {Math.round(score)}
          </div>
          {showLabel && (
            <div className={cn(sizes.labelSize, 'font-bold text-on-surface-variant uppercase tracking-widest')}>
              {scoreInfo.label}
            </div>
          )}
        </div>

        {/* Animated Icon Background */}
        <div
          className={cn(sizes.inner, 'absolute rounded-full opacity-10 blur-xl pointer-events-none')}
          style={{ backgroundColor: scoreInfo.color }}
        />
      </div>

      {/* Score Range Legend */}
      {size !== 'sm' && (
        <div className="w-full max-w-xs space-y-3">
          <p className="text-xs font-bold text-on-surface-variant uppercase tracking-widest text-center">Score Scale</p>
          <div className="space-y-2">
            <div className="flex items-center justify-between text-xs">
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 rounded-full bg-red-500" />
                <span className="text-on-surface-variant">Poor: 0-20</span>
              </div>
            </div>
            <div className="flex items-center justify-between text-xs">
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 rounded-full bg-orange-500" />
                <span className="text-on-surface-variant">Fair: 20-40</span>
              </div>
            </div>
            <div className="flex items-center justify-between text-xs">
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 rounded-full bg-yellow-500" />
                <span className="text-on-surface-variant">Good: 40-60</span>
              </div>
            </div>
            <div className="flex items-center justify-between text-xs">
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 rounded-full bg-lime-500" />
                <span className="text-on-surface-variant">Very Good: 60-80</span>
              </div>
            </div>
            <div className="flex items-center justify-between text-xs">
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 rounded-full bg-green-500" />
                <span className="text-on-surface-variant">Excellent: 80-100</span>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
