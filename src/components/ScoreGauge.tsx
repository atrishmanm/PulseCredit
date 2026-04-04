import { motion } from 'motion/react';

interface ScoreGaugeProps {
  score: number;
  maxScore?: number;
  size?: 'sm' | 'md' | 'lg';
  showLabel?: boolean;
}

interface ScoreBand {
  label: string;
  color: string;
  min: number;
  max: number;
  range: string;
}

const BASE_BANDS = [
  { label: 'Poor', color: '#ef4444', minRatio: 0, maxRatio: 0.3 },
  { label: 'Fair', color: '#f97316', minRatio: 0.3, maxRatio: 0.5 },
  { label: 'Good', color: '#eab308', minRatio: 0.5, maxRatio: 0.7 },
  { label: 'Very Good', color: '#84cc16', minRatio: 0.7, maxRatio: 0.85 },
  { label: 'Excellent', color: '#22c55e', minRatio: 0.85, maxRatio: 1 },
];

function clamp(value: number, min: number, max: number): number {
  return Math.min(max, Math.max(min, value));
}

function formatRange(min: number, max: number, isLast: boolean): string {
  const lower = Math.round(min);
  const upper = Math.round(max);
  return isLast ? `${lower}-${upper}` : `${lower}-${Math.max(lower, upper - 1)}`;
}

export function ScoreGauge({ score, maxScore = 1000, size = 'lg', showLabel = true }: ScoreGaugeProps) {
  const normalized = clamp(score / maxScore, 0, 1);
  const percentage = normalized * 100;

  const bands: ScoreBand[] = BASE_BANDS.map((band, index) => {
    const min = band.minRatio * maxScore;
    const max = band.maxRatio * maxScore;
    return {
      label: band.label,
      color: band.color,
      min,
      max,
      range: formatRange(min, max, index === BASE_BANDS.length - 1),
    };
  });

  const getScoreInfo = () => {
    const clampedScore = clamp(score, 0, maxScore);
    const activeBand = bands.find((band, index) => {
      if (index === bands.length - 1) return clampedScore >= band.min && clampedScore <= band.max;
      return clampedScore >= band.min && clampedScore < band.max;
    });
    return activeBand || bands[0];
  };

  const scoreInfo = getScoreInfo();

  const sizeConfig = {
    sm: {
      gaugeWidth: 220,
      gaugeHeight: 130,
      valueClass: 'text-5xl',
      pointerLength: 78,
      centerRadius: 8,
    },
    md: {
      gaugeWidth: 240,
      gaugeHeight: 140,
      valueClass: 'text-5xl',
      pointerLength: 84,
      centerRadius: 9,
    },
    lg: {
      gaugeWidth: 260,
      gaugeHeight: 150,
      valueClass: 'text-6xl',
      pointerLength: 90,
      centerRadius: 10,
    },
  }[size];

  const cx = 130;
  const cy = 130;
  const arcRadius = 90;
  const arcLength = Math.PI * arcRadius;
  const strokeDashoffset = arcLength * (1 - normalized);

  const toPoint = (ratio: number, radius = arcRadius) => {
    const angle = (-180 + ratio * 180) * (Math.PI / 180);
    return {
      x: cx + radius * Math.cos(angle),
      y: cy + radius * Math.sin(angle),
    };
  };

  const describeArc = (startRatio: number, endRatio: number, radius = arcRadius) => {
    const start = toPoint(startRatio, radius);
    const end = toPoint(endRatio, radius);
    return `M ${start.x} ${start.y} A ${radius} ${radius} 0 0 1 ${end.x} ${end.y}`;
  };

  const scorePoint = toPoint(normalized, arcRadius);
  const pointerStartPoint = toPoint(0, arcRadius - 12);
  const pointerTipPoint = toPoint(normalized, arcRadius - 12);
  const markerValues = [
    0,
    Math.round(maxScore * 0.3),
    Math.round(maxScore * 0.5),
    Math.round(maxScore * 0.7),
    Math.round(maxScore * 0.85),
    maxScore,
  ];

  return (
    <motion.div
      className="flex flex-col items-center justify-center py-6 px-4 w-full"
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.5 }}
    >
      {/* Semi-circle gauge */}
      <div className="relative w-full flex justify-center mb-8">
        <svg
          width={sizeConfig.gaugeWidth}
          height={sizeConfig.gaugeHeight}
          viewBox="0 0 260 160"
          className="drop-shadow-lg"
        >
          <defs>
            <linearGradient id="gauge-track" x1="0%" y1="0%" x2="100%" y2="0%">
              <stop offset="0%" stopColor="rgba(239,68,68,0.35)" />
              <stop offset="40%" stopColor="rgba(234,179,8,0.3)" />
              <stop offset="100%" stopColor="rgba(34,197,94,0.35)" />
            </linearGradient>
          </defs>

          <path
            d={describeArc(0, 1)}
            fill="none"
            stroke="url(#gauge-track)"
            strokeWidth="18"
            strokeLinecap="round"
            opacity="0.4"
          />

          {bands.map((band, index) => (
            <path
              key={band.label}
              d={describeArc(band.min / maxScore, band.max / maxScore)}
              fill="none"
              stroke={band.color}
              strokeWidth="18"
              strokeLinecap={index === 0 || index === bands.length - 1 ? 'round' : 'butt'}
              opacity="0.22"
            />
          ))}

          <motion.path
            d={describeArc(0, 1)}
            fill="none"
            stroke={scoreInfo.color}
            strokeWidth="10"
            strokeLinecap="round"
            strokeDasharray={arcLength}
            initial={{ strokeDashoffset: arcLength }}
            animate={{ strokeDashoffset }}
            transition={{ duration: 1.2, ease: 'easeOut' }}
            style={{ filter: `drop-shadow(0 0 10px ${scoreInfo.color}90)` }}
          />

          {markerValues.map((value) => {
            const ratio = value / maxScore;
            const markerPoint = toPoint(ratio, arcRadius + 1);
            const labelPoint = toPoint(ratio, arcRadius + 18);
            return (
              <g key={value}>
                <circle cx={markerPoint.x} cy={markerPoint.y} r="2" fill="rgba(255,255,255,0.45)" />
                <text
                  x={labelPoint.x}
                  y={labelPoint.y + (ratio > 0.1 && ratio < 0.9 ? -2 : 3)}
                  textAnchor="middle"
                  fontSize="9"
                  fill="rgba(255,255,255,0.42)"
                  fontWeight="600"
                >
                  {value}
                </text>
              </g>
            );
          })}

          <motion.line
            x1={cx}
            y1={cy}
            initial={{ x2: pointerStartPoint.x, y2: pointerStartPoint.y }}
            animate={{ x2: pointerTipPoint.x, y2: pointerTipPoint.y }}
            transition={{ duration: 1.2, ease: 'easeOut' }}
            stroke={scoreInfo.color}
            strokeWidth="3"
            strokeLinecap="round"
            style={{ filter: `drop-shadow(0 0 8px ${scoreInfo.color}90)` }}
          />

          <motion.circle
            cx={scorePoint.x}
            cy={scorePoint.y}
            r="5"
            fill={scoreInfo.color}
            initial={{ opacity: 0, scale: 0.6 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.6, delay: 0.4 }}
            style={{ filter: `drop-shadow(0 0 10px ${scoreInfo.color})` }}
          />

          <circle
            cx={cx}
            cy={cy}
            r={sizeConfig.centerRadius}
            fill="rgba(255,255,255,0.15)"
            stroke={scoreInfo.color}
            strokeWidth="2"
          />
        </svg>
      </div>

      {/* Score display */}
      <div className="text-center space-y-3 mb-6">
        <motion.div
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.3 }}
        >
          <p className={`${sizeConfig.valueClass} font-black font-headline`} style={{ color: scoreInfo.color }}>
            {Math.round(score)}
          </p>
          <p className="text-sm text-white/50 font-medium">out of {maxScore}</p>
          <p className="text-xs text-white/40 mt-1">{percentage.toFixed(1)}%</p>
        </motion.div>

        {/* Label badge */}
        {showLabel && (
          <motion.div
            className="inline-block"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
          >
            <span
              className="px-5 py-2 rounded-full text-sm font-bold"
              style={{
                backgroundColor: `${scoreInfo.color}15`,
                border: `2px solid ${scoreInfo.color}`,
                color: scoreInfo.color,
              }}
            >
              {scoreInfo.label}
            </span>
          </motion.div>
        )}
      </div>

      {/* Legend */}
      <motion.div
        className="w-full grid grid-cols-5 gap-2 pt-4 border-t border-white/10"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.5 }}
      >
        {bands.map((item) => (
          <div key={item.label} className="text-center">
            <div
              className="w-2.5 h-2.5 rounded-full mx-auto mb-1.5"
              style={{ backgroundColor: item.color }}
            />
            <p className="text-xs text-white/70 font-medium">{item.label === 'Very Good' ? 'V.Good' : item.label}</p>
            <p className="text-xs text-white/40 leading-tight">{item.range}</p>
          </div>
        ))}
      </motion.div>
    </motion.div>
  );
}
