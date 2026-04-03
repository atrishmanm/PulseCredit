import { motion } from 'motion/react';

interface ScoreGaugeProps {
  score: number;
  maxScore?: number;
}

<<<<<<< HEAD
export function ScoreGauge({ score, maxScore = 1000 }: ScoreGaugeProps) {
  const percentage = Math.min(100, Math.max(0, (score / maxScore) * 100));

  const getScoreInfo = () => {
    if (score < 300) return { label: 'Poor', color: '#ef4444', range: '0-299' };
    if (score < 500) return { label: 'Fair', color: '#f97316', range: '300-499' };
    if (score < 700) return { label: 'Good', color: '#eab308', range: '500-699' };
    if (score < 850) return { label: 'Very Good', color: '#84cc16', range: '700-849' };
    return { label: 'Excellent', color: '#22c55e', range: '850-1000' };
=======
export function ScoreGauge({ score, maxScore = 1000, size = 'lg', showLabel = false }: ScoreGaugeProps) {
  const percentage = Math.min(100, Math.max(0, (score / maxScore) * 100));

  const getScoreInfo = () => {
    if (maxScore === 1000) {
      // Lifetime score (0-1000)
      if (score < 300) return { label: 'Poor', color: '#ef4444', range: '0-299' };
      if (score < 500) return { label: 'Fair', color: '#f97316', range: '300-499' };
      if (score < 700) return { label: 'Good', color: '#eab308', range: '500-699' };
      if (score < 850) return { label: 'Very Good', color: '#84cc16', range: '700-849' };
      return { label: 'Excellent', color: '#22c55e', range: '850-1000' };
    } else {
      // Health score (0-100)
      if (percentage < 20) return { label: 'Poor', color: '#ef4444', range: '0-20%' };
      if (percentage < 40) return { label: 'Fair', color: '#f97316', range: '20-40%' };
      if (percentage < 60) return { label: 'Good', color: '#eab308', range: '40-60%' };
      if (percentage < 80) return { label: 'Very Good', color: '#84cc16', range: '60-80%' };
      return { label: 'Excellent', color: '#22c55e', range: '80-100%' };
    }
>>>>>>> eff9882 (added semi-circle map for Lifetime score)
  };

  const scoreInfo = getScoreInfo();
  const radius = 80;
  const circumference = Math.PI * radius;
  const strokeDashoffset = circumference - (percentage / 100) * circumference;
<<<<<<< HEAD
=======

  // Size scaling
  const sizeMap = { sm: 0.65, md: 0.85, lg: 1 };
  const scale = sizeMap[size];
>>>>>>> eff9882 (added semi-circle map for Lifetime score)

  return (
    <motion.div
      className="flex flex-col items-center justify-center py-6 px-4 w-full"
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.5 }}
    >
      {/* Semi-circle gauge */}
      <div className="relative w-full flex justify-center mb-8">
<<<<<<< HEAD
        <svg width="260" height="150" viewBox="0 0 260 150" className="drop-shadow-lg">
=======
        <svg
          width={260 * scale}
          height={150 * scale}
          viewBox="0 0 260 150"
          className="drop-shadow-lg"
        >
>>>>>>> eff9882 (added semi-circle map for Lifetime score)
          {/* Background track */}
          <path
            d="M 20 130 A 90 90 0 0 1 240 130"
            fill="none"
            stroke="rgba(255, 255, 255, 0.1)"
            strokeWidth="14"
            strokeLinecap="round"
          />

<<<<<<< HEAD
          {/* Color zones background */}
          <path
            d="M 20 130 A 90 90 0 0 1 70 35"
            fill="none"
            stroke="#ef4444"
            strokeWidth="14"
            strokeLinecap="round"
            opacity="0.2"
          />
          <path
            d="M 70 35 A 90 90 0 0 1 130 10"
            fill="none"
            stroke="#f97316"
            strokeWidth="14"
            strokeLinecap="round"
            opacity="0.2"
          />
          <path
            d="M 130 10 A 90 90 0 0 1 190 35"
            fill="none"
            stroke="#eab308"
            strokeWidth="14"
            strokeLinecap="round"
            opacity="0.2"
          />
          <path
            d="M 190 35 A 90 90 0 0 1 240 130"
            fill="none"
            stroke="#22c55e"
            strokeWidth="14"
            strokeLinecap="round"
            opacity="0.2"
          />
=======
          {/* Color zones - vary based on maxScore */}
          {maxScore === 1000 ? (
            <>
              <path
                d="M 20 130 A 90 90 0 0 1 70 35"
                fill="none"
                stroke="#ef4444"
                strokeWidth="14"
                strokeLinecap="round"
                opacity="0.2"
              />
              <path
                d="M 70 35 A 90 90 0 0 1 130 10"
                fill="none"
                stroke="#f97316"
                strokeWidth="14"
                strokeLinecap="round"
                opacity="0.2"
              />
              <path
                d="M 130 10 A 90 90 0 0 1 190 35"
                fill="none"
                stroke="#eab308"
                strokeWidth="14"
                strokeLinecap="round"
                opacity="0.2"
              />
              <path
                d="M 190 35 A 90 90 0 0 1 240 130"
                fill="none"
                stroke="#22c55e"
                strokeWidth="14"
                strokeLinecap="round"
                opacity="0.2"
              />
            </>
          ) : (
            <>
              {/* Health score zones: 0-20% Poor, 20-40% Fair, 40-60% Good, 60-80% VGood, 80-100% Excellent */}
              <path
                d="M 20 130 A 90 90 0 0 1 44 60"
                fill="none"
                stroke="#ef4444"
                strokeWidth="14"
                strokeLinecap="round"
                opacity="0.2"
              />
              <path
                d="M 44 60 A 90 90 0 0 1 85 20"
                fill="none"
                stroke="#f97316"
                strokeWidth="14"
                strokeLinecap="round"
                opacity="0.2"
              />
              <path
                d="M 85 20 A 90 90 0 0 1 175 20"
                fill="none"
                stroke="#eab308"
                strokeWidth="14"
                strokeLinecap="round"
                opacity="0.2"
              />
              <path
                d="M 175 20 A 90 90 0 0 1 216 60"
                fill="none"
                stroke="#84cc16"
                strokeWidth="14"
                strokeLinecap="round"
                opacity="0.2"
              />
              <path
                d="M 216 60 A 90 90 0 0 1 240 130"
                fill="none"
                stroke="#22c55e"
                strokeWidth="14"
                strokeLinecap="round"
                opacity="0.2"
              />
            </>
          )}
>>>>>>> eff9882 (added semi-circle map for Lifetime score)

          {/* Progress bar */}
          <motion.path
            d="M 20 130 A 90 90 0 0 1 240 130"
            fill="none"
            stroke={scoreInfo.color}
            strokeWidth="14"
            strokeLinecap="round"
            strokeDasharray={circumference}
            initial={{ strokeDashoffset: circumference }}
            animate={{ strokeDashoffset }}
            transition={{ duration: 1.2, ease: 'easeOut' }}
            style={{
              filter: `drop-shadow(0 0 12px ${scoreInfo.color}60)`,
            }}
          />

          {/* Pointer indicator */}
<<<<<<< HEAD
          <motion.g
            initial={{ rotate: 0 }}
            animate={{ rotate: (percentage / 100) * 180 }}
            transition={{ duration: 1.2, ease: 'easeOut' }}
            style={{ transformOrigin: '130px 130px' }}
          >
            <circle cx="130" cy="130" r="7" fill={scoreInfo.color} style={{ filter: `drop-shadow(0 0 6px ${scoreInfo.color})` }} />
            <line x1="130" y1="130" x2="130" y2="25" stroke={scoreInfo.color} strokeWidth="3" strokeLinecap="round" />
          </motion.g>
=======
          {(() => {
            // Semicircle: 0% = left (180°), 100% = right (0°)
            const degrees = 180 - (percentage / 100) * 180;
            const radians = (degrees * Math.PI) / 180;
            const px = 130 + 80 * Math.cos(radians);
            const py = 130 - 80 * Math.sin(radians); // Minus because Y is inverted in SVG

            return (
              <g>
                <motion.line
                  x1="130"
                  y1="130"
                  x2={px}
                  y2={py}
                  stroke={scoreInfo.color}
                  strokeWidth="3"
                  strokeLinecap="round"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 0.8, duration: 0.3 }}
                  style={{ filter: `drop-shadow(0 0 6px ${scoreInfo.color})` }}
                />
                <motion.circle
                  cx={px}
                  cy={py}
                  r="6"
                  fill={scoreInfo.color}
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ delay: 0.8, duration: 0.3 }}
                  style={{ filter: `drop-shadow(0 0 8px ${scoreInfo.color})` }}
                />
              </g>
            );
          })()}
>>>>>>> eff9882 (added semi-circle map for Lifetime score)

          {/* Center circle */}
          <circle cx="130" cy="130" r="10" fill="rgba(255, 255, 255, 0.15)" stroke="rgba(255, 255, 255, 0.4)" strokeWidth="2" />

          {/* Score labels */}
<<<<<<< HEAD
          <text x="25" y="145" fontSize="10" fill="rgba(255, 255, 255, 0.4)" fontWeight="500">300</text>
          <text x="125" y="15" fontSize="10" fill="rgba(255, 255, 255, 0.4)" fontWeight="500" textAnchor="middle">700</text>
          <text x="235" y="145" fontSize="10" fill="rgba(255, 255, 255, 0.4)" fontWeight="500" textAnchor="end">1000</text>
=======
          {maxScore === 1000 ? (
            <>
              <text x="25" y="145" fontSize="10" fill="rgba(255, 255, 255, 0.4)" fontWeight="500">300</text>
              <text x="125" y="15" fontSize="10" fill="rgba(255, 255, 255, 0.4)" fontWeight="500" textAnchor="middle">700</text>
              <text x="235" y="145" fontSize="10" fill="rgba(255, 255, 255, 0.4)" fontWeight="500" textAnchor="end">1000</text>
            </>
          ) : (
            <>
              <text x="15" y="145" fontSize="10" fill="rgba(255, 255, 255, 0.4)" fontWeight="500">0%</text>
              <text x="125" y="10" fontSize="10" fill="rgba(255, 255, 255, 0.4)" fontWeight="500" textAnchor="middle">50%</text>
              <text x="245" y="145" fontSize="10" fill="rgba(255, 255, 255, 0.4)" fontWeight="500" textAnchor="end">100%</text>
            </>
          )}
>>>>>>> eff9882 (added semi-circle map for Lifetime score)
        </svg>
      </div>

      {/* Score display */}
<<<<<<< HEAD
      <div className="text-center space-y-3 mb-6">
        <motion.div
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.3 }}
        >
          <p className="text-6xl font-black font-headline" style={{ color: scoreInfo.color }}>
            {Math.round(score)}
          </p>
          <p className="text-sm text-white/50 font-medium">out of {maxScore}</p>
        </motion.div>

        {/* Label badge */}
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
      </div>

      {/* Legend */}
      <motion.div
        className="w-full grid grid-cols-5 gap-2 pt-4 border-t border-white/10"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.5 }}
      >
        {[
          { label: 'Poor', color: '#ef4444', range: '0-299' },
          { label: 'Fair', color: '#f97316', range: '300-499' },
          { label: 'Good', color: '#eab308', range: '500-699' },
          { label: 'V.Good', color: '#84cc16', range: '700-849' },
          { label: 'Excellent', color: '#22c55e', range: '850-1000' },
        ].map((item) => (
          <div key={item.label} className="text-center">
            <div
              className="w-2.5 h-2.5 rounded-full mx-auto mb-1.5"
              style={{ backgroundColor: item.color }}
            />
            <p className="text-xs text-white/70 font-medium">{item.label}</p>
            <p className="text-xs text-white/40 leading-tight">{item.range}</p>
          </div>
        ))}
      </motion.div>
=======
      {showLabel && (
        <div className="text-center space-y-3 mb-6">
          <motion.div
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.3 }}
          >
            <p className={`font-black font-headline ${size === 'lg' ? 'text-6xl' : size === 'md' ? 'text-5xl' : 'text-4xl'}`} style={{ color: scoreInfo.color }}>
              {Math.round(score)}
            </p>
            <p className="text-sm text-white/50 font-medium">out of {maxScore}</p>
          </motion.div>

          {/* Label badge */}
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
        </div>
      )}

      {/* Legend - only show for lifetime score */}
      {maxScore === 1000 && !showLabel && (
        <motion.div
          className="w-full grid grid-cols-5 gap-2 pt-4 border-t border-white/10"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.5 }}
        >
          {[
            { label: 'Poor', color: '#ef4444', range: '0-299' },
            { label: 'Fair', color: '#f97316', range: '300-499' },
            { label: 'Good', color: '#eab308', range: '500-699' },
            { label: 'V.Good', color: '#84cc16', range: '700-849' },
            { label: 'Excellent', color: '#22c55e', range: '850-1000' },
          ].map((item) => (
            <div key={item.label} className="text-center">
              <div
                className="w-2.5 h-2.5 rounded-full mx-auto mb-1.5"
                style={{ backgroundColor: item.color }}
              />
              <p className="text-xs text-white/70 font-medium">{item.label}</p>
              <p className="text-xs text-white/40 leading-tight">{item.range}</p>
            </div>
          ))}
        </motion.div>
      )}
>>>>>>> eff9882 (added semi-circle map for Lifetime score)
    </motion.div>
  );
}
