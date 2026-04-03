import { useHealth } from '@/src/context/HealthContext';
import { GlassCard } from './GlassCard';
import { ScoreGauge } from './ScoreGauge';
import { TrendingUp, TrendingDown, Zap, Target, ArrowUpRight, ArrowDownLeft } from 'lucide-react';
import { motion } from 'motion/react';
import { calculateTrend, generateInsight, getWeeklySummary, calculatePercentile } from '@/src/lib/lifetimeScoring';

export function LifetimeScoreScreen() {
  const { lifetimeScore = 700, trendData = [] } = useHealth();

  // Empty state: no historical data
  if (!trendData || trendData.length === 0) {
    return (
      <motion.div
        className="flex flex-col items-center justify-center py-12"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
      >
        <div className="text-center space-y-4 max-w-xs pb-8">
          <div className="text-6xl">📊</div>
          <div>
            <p className="text-white font-headline text-xl font-bold">Start Your Health Journey</p>
            <p className="text-white/50 text-sm mt-2">Log your daily activities, meals, and vital signs to build your lifetime health score</p>
          </div>
          <div className="pt-4 border-t border-white/10">
            <p className="text-white/60 text-xs">Score initialized at</p>
            <p className="text-primary font-headline text-2xl font-bold">{lifetimeScore}</p>
          </div>
        </div>
        {/* Show gauge even in empty state */}
        <div className="w-full relative rounded-2xl overflow-hidden bg-surface-container-low border border-white/5 p-4">
          <ScoreGauge score={lifetimeScore} maxScore={1000} />
        </div>
      </motion.div>
    );
  }

  const trend = calculateTrend(trendData);
  const insight = generateInsight(lifetimeScore, trend);
  const weeklySummary = getWeeklySummary(trendData);
  const percentile = calculatePercentile(lifetimeScore);
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.08,
        delayChildren: 0.1,
      },
    },
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: { duration: 0.5, ease: [0.22, 1, 0.36, 1] },
    },
  };

  return (
    <motion.div
      className="space-y-3 pb-4"
      variants={containerVariants}
      initial="hidden"
      animate="visible"
    >
      {/* CIBIL-Style Score Gauge */}
      <motion.div variants={itemVariants} className="relative rounded-2xl overflow-hidden bg-surface-container-low border border-white/5">
        <ScoreGauge score={lifetimeScore} maxScore={1000} />
      </motion.div>

      {/* Header Score */}
      <motion.div variants={itemVariants} className="grid grid-cols-2 gap-3">
        {/* Main Score */}
        <div className="relative rounded-xl overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-br from-primary/20 to-transparent" />
          <div className="absolute inset-0 backdrop-blur-sm" />
          <div className="absolute inset-0 border border-primary/30" />
          <div className="relative p-4 text-center">
            <p className="text-white/50 text-xs mb-1">Score</p>
            <p className="font-headline text-4xl font-black text-primary">{Math.round(lifetimeScore)}</p>
            <p className="text-white/30 text-xs mt-1">/ 1000</p>
          </div>
        </div>

        {/* Percentile */}
        <div className="relative rounded-xl overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-br from-secondary/20 to-transparent" />
          <div className="absolute inset-0 backdrop-blur-sm" />
          <div className="absolute inset-0 border border-secondary/30" />
          <div className="relative p-4 text-center">
            <p className="text-white/50 text-xs mb-1">Percentile</p>
            <p className="font-headline text-4xl font-black text-secondary">{percentile}%</p>
            <p className="text-white/30 text-xs mt-1">healthier</p>
          </div>
        </div>
      </motion.div>

      {/* Status Cards */}
      <motion.div variants={itemVariants} className="grid grid-cols-2 gap-3">
        {/* Trend */}
        <div className="relative rounded-xl overflow-hidden">
          <div className={`absolute inset-0 bg-gradient-to-br ${trend === 'up' ? 'from-secondary/20' : trend === 'down' ? 'from-error/20' : 'from-tertiary/20'} to-transparent`} />
          <div className="absolute inset-0 backdrop-blur-sm" />
          <div className={`absolute inset-0 border ${trend === 'up' ? 'border-secondary/30' : trend === 'down' ? 'border-error/30' : 'border-tertiary/30'}`} />
          <div className="relative p-4">
            <div className="flex items-center gap-2">
              {trend === 'up' ? (
                <ArrowUpRight className="w-4 h-4 text-secondary flex-shrink-0" />
              ) : trend === 'down' ? (
                <ArrowDownLeft className="w-4 h-4 text-error flex-shrink-0" />
              ) : (
                <Zap className="w-4 h-4 text-tertiary flex-shrink-0" />
              )}
              <div>
                <p className="text-white/50 text-xs">Status</p>
                <p className="font-headline text-sm font-bold text-white capitalize">
                  {trend === 'up' ? 'Improving' : trend === 'down' ? 'Declining' : 'Stable'}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Weekly Change */}
        <div className="relative rounded-xl overflow-hidden">
          <div className={`absolute inset-0 bg-gradient-to-br ${weeklySummary.weeklyChange > 0 ? 'from-secondary/20' : weeklySummary.weeklyChange < 0 ? 'from-error/20' : 'from-white/10'} to-transparent`} />
          <div className="absolute inset-0 backdrop-blur-sm" />
          <div className={`absolute inset-0 border ${weeklySummary.weeklyChange > 0 ? 'border-secondary/30' : weeklySummary.weeklyChange < 0 ? 'border-error/30' : 'border-white/20'}`} />
          <div className="relative p-4">
            <p className="text-white/50 text-xs mb-1">This Week</p>
            <div className="flex items-baseline gap-1">
              <span className={`font-headline text-2xl font-bold ${weeklySummary.weeklyChange > 0 ? 'text-secondary' : weeklySummary.weeklyChange < 0 ? 'text-error' : 'text-white/70'}`}>
                {weeklySummary.weeklyChange > 0 ? '+' : ''}{weeklySummary.weeklyChange}
              </span>
              <span className="text-white/40 text-xs">pts</span>
            </div>
          </div>
        </div>
      </motion.div>

      {/* Weekly Stats Row */}
      <motion.div variants={itemVariants} className="grid grid-cols-3 gap-2">
        <div className="relative rounded-lg overflow-hidden">
          <div className="absolute inset-0 bg-secondary/10 backdrop-blur-sm" />
          <div className="absolute inset-0 border border-secondary/20" />
          <div className="relative p-3 text-center">
            <p className="text-white/50 text-xs mb-1">Best</p>
            <p className="font-headline text-lg font-bold text-secondary">{weeklySummary.bestDay > 0 ? weeklySummary.bestDay : '—'}</p>
          </div>
        </div>
        <div className="relative rounded-lg overflow-hidden">
          <div className="absolute inset-0 bg-primary/10 backdrop-blur-sm" />
          <div className="absolute inset-0 border border-primary/20" />
          <div className="relative p-3 text-center">
            <p className="text-white/50 text-xs mb-1">Avg</p>
            <p className="font-headline text-lg font-bold text-primary">{weeklySummary.avgWeekly > 0 ? weeklySummary.avgWeekly : '—'}</p>
          </div>
        </div>
        <div className="relative rounded-lg overflow-hidden">
          <div className="absolute inset-0 bg-error/10 backdrop-blur-sm" />
          <div className="absolute inset-0 border border-error/20" />
          <div className="relative p-3 text-center">
            <p className="text-white/50 text-xs mb-1">Worst</p>
            <p className="font-headline text-lg font-bold text-error">{weeklySummary.worstDay > 0 ? weeklySummary.worstDay : '—'}</p>
          </div>
        </div>
      </motion.div>

      {/* Insight */}
      <motion.div variants={itemVariants}>
        <div className="relative rounded-xl overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-br from-secondary/15 to-primary/10" />
          <div className="absolute inset-0 backdrop-blur-sm" />
          <div className="absolute inset-0 border border-secondary/30" />
          <div className="relative p-4 flex gap-3">
            <span className="text-lg flex-shrink-0">💡</span>
            <p className="text-white text-xs leading-relaxed">{insight}</p>
          </div>
        </div>
      </motion.div>

      {/* 30-Day Chart Compact */}
      <motion.div variants={itemVariants}>
        <div className="relative rounded-xl overflow-hidden">
          <div className="absolute inset-0 bg-white/5 backdrop-blur-sm" />
          <div className="absolute inset-0 border border-white/10" />
          <div className="relative p-4">
            <p className="text-white/70 text-xs font-medium mb-3 uppercase tracking-wide">30-Day Trend</p>
            <div className="space-y-1.5">
              {trendData.slice(-7).map((data, idx) => {
                try {
                  const date = new Date(data.date);
                  if (isNaN(date.getTime())) return null;
                  const today = new Date();
                  today.setHours(0, 0, 0, 0);
                  date.setHours(0, 0, 0, 0);
                  const daysAgo = Math.floor((today.getTime() - date.getTime()) / (1000 * 60 * 60 * 24));
                  const displayDate = daysAgo === 0 ? 'T' : daysAgo === 1 ? 'Y' : daysAgo;

                  return (
                    <div key={idx} className="flex items-center gap-2">
                      <span className="text-white/30 w-5 text-xs flex-shrink-0 text-right">{displayDate}</span>
                      <div className="flex-1 bg-white/5 rounded-full h-2 overflow-hidden border border-white/10">
                        <motion.div
                          className="h-full bg-gradient-to-r from-primary to-secondary"
                          initial={{ width: 0 }}
                          animate={{ width: `${Math.min(100, (data.score / 1000) * 100)}%` }}
                          transition={{ duration: 0.5, delay: idx * 0.02 }}
                        />
                      </div>
                      <span className="text-white/60 w-8 text-right text-xs flex-shrink-0 font-medium">{Math.round(data.score)}</span>
                    </div>
                  );
                } catch {
                  return null;
                }
              })}
            </div>
          </div>
        </div>
      </motion.div>
    </motion.div>
  );
}
