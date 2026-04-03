import { useHealth } from '@/src/context/HealthContext';
import { GlassCard } from './GlassCard';
import { TrendingUp, TrendingDown, Zap, Target } from 'lucide-react';
import { motion } from 'motion/react';
import { calculateTrend, generateInsight, getWeeklySummary, calculatePercentile } from '@/src/lib/lifetimeScoring';

export function LifetimeScoreScreen() {
  const { lifetimeScore, trendData } = useHealth();

  const trend = calculateTrend(trendData);
  const insight = generateInsight(lifetimeScore || 700, trend);
  const weeklySummary = getWeeklySummary(trendData);
  const percentile = calculatePercentile(lifetimeScore || 700);

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
        delayChildren: 0.2,
      },
    },
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: { duration: 0.6, ease: [0.22, 1, 0.36, 1] },
    },
  };

  return (
    <motion.div
      className="space-y-6"
      variants={containerVariants}
      initial="hidden"
      animate="visible"
    >
      {/* Main Lifetime Score */}
      <motion.div variants={itemVariants}>
        <GlassCard className="bg-gradient-to-br from-primary/20 via-secondary/10 to-transparent border-primary/30">
          <div className="flex items-end justify-between mb-4">
            <div>
              <p className="text-white/60 text-sm font-medium mb-1">Lifetime Health Score</p>
              <div className="flex items-baseline gap-2">
                <span className="font-headline text-6xl font-black bg-gradient-to-r from-primary via-secondary to-tertiary bg-clip-text text-transparent">
                  {lifetimeScore || 700}
                </span>
                <span className="text-white/40 text-sm">/1000</span>
              </div>
            </div>
            <Zap className="w-12 h-12 text-secondary drop-shadow-lg" />
          </div>

          {/* Percentile */}
          <div className="pt-4 border-t border-white/10">
            <p className="text-white/60 text-xs mb-2">You're healthier than {percentile}% of users</p>
            <div className="w-full bg-surface-container rounded-full h-2 overflow-hidden">
              <motion.div
                className="h-full bg-gradient-to-r from-primary to-secondary"
                initial={{ width: 0 }}
                animate={{ width: `${percentile}%` }}
                transition={{ duration: 1, ease: 'easeOut' }}
              />
            </div>
          </div>
        </GlassCard>
      </motion.div>

      {/* Trend & Weekly Summary */}
      <motion.div variants={itemVariants} className="grid grid-cols-2 gap-4">
        {/* Trend */}
        <GlassCard className="bg-gradient-to-br from-secondary/20 to-transparent border-secondary/30">
          <div className="flex items-center gap-3 mb-3">
            {trend === 'up' ? (
              <div className="p-2 bg-secondary/20 rounded-lg">
                <TrendingUp className="w-5 h-5 text-secondary" />
              </div>
            ) : trend === 'down' ? (
              <div className="p-2 bg-error/20 rounded-lg">
                <TrendingDown className="w-5 h-5 text-error" />
              </div>
            ) : (
              <div className="p-2 bg-tertiary/20 rounded-lg">
                <Zap className="w-5 h-5 text-tertiary" />
              </div>
            )}
            <div>
              <p className="text-white/60 text-xs">Trend</p>
              <p className="text-white font-semibold capitalize text-sm">
                {trend === 'up' && '📈 Improving'}
                {trend === 'down' && '📉 Declining'}
                {trend === 'stable' && '➡️ Stable'}
              </p>
            </div>
          </div>
        </GlassCard>

        {/* Weekly Change */}
        <GlassCard className="bg-gradient-to-br from-primary/20 to-transparent border-primary/30">
          <div className="flex items-center gap-3 mb-3">
            <div className="p-2 bg-primary/20 rounded-lg">
              <Target className="w-5 h-5 text-primary" />
            </div>
            <div>
              <p className="text-white/60 text-xs">This Week</p>
              <p className={`text-white font-semibold text-sm ${weeklySummary.weeklyChange >= 0 ? 'text-secondary' : 'text-error'}`}>
                {weeklySummary.weeklyChange > 0 ? '+' : ''}{weeklySummary.weeklyChange}
              </p>
            </div>
          </div>
        </GlassCard>
      </motion.div>

      {/* Weekly Stats */}
      <motion.div variants={itemVariants}>
        <GlassCard className="bg-gradient-to-br from-tertiary/20 to-transparent border-tertiary/30">
          <div className="grid grid-cols-3 gap-4">
            <div>
              <p className="text-white/60 text-xs mb-1">Best Day</p>
              <p className="font-headline font-black text-lg text-secondary">{weeklySummary.bestDay}</p>
            </div>
            <div>
              <p className="text-white/60 text-xs mb-1">Weekly Avg</p>
              <p className="font-headline font-black text-lg text-primary">{weeklySummary.avgWeekly}</p>
            </div>
            <div>
              <p className="text-white/60 text-xs mb-1">Worst Day</p>
              <p className="font-headline font-black text-lg text-error">{weeklySummary.worstDay}</p>
            </div>
          </div>
        </GlassCard>
      </motion.div>

      {/* Insight */}
      <motion.div variants={itemVariants}>
        <GlassCard className="bg-gradient-to-br from-white/5 to-transparent border-white/10 p-5">
          <div className="flex gap-3">
            <div className="text-2xl flex-shrink-0">💡</div>
            <div>
              <p className="text-white/60 text-xs font-medium mb-1">Insight</p>
              <p className="text-white text-sm leading-relaxed">{insight}</p>
            </div>
          </div>
        </GlassCard>
      </motion.div>

      {/* 30-Day History */}
      <motion.div variants={itemVariants}>
        <GlassCard className="bg-gradient-to-br from-white/5 to-transparent border-white/10">
          <p className="text-white/60 text-xs font-medium mb-4">30-Day History</p>
          <div className="space-y-2">
            {trendData.map((data, idx) => (
              <div key={idx} className="flex items-center justify-between text-xs">
                <span className="text-white/40 w-12">{data.date}</span>
                <div className="flex-1 ml-4">
                  <div className="w-full bg-surface-container rounded-full h-1.5">
                    <motion.div
                      className="h-full bg-gradient-to-r from-primary to-secondary rounded-full"
                      initial={{ width: 0 }}
                      animate={{ width: `${(data.score / 1000) * 100}%` }}
                      transition={{ duration: 0.6, delay: idx * 0.02 }}
                    />
                  </div>
                </div>
                <span className="text-white/60 w-8 text-right">{data.score}</span>
              </div>
            ))}
          </div>
        </GlassCard>
      </motion.div>
    </motion.div>
  );
}
