import { useHealth } from '../context/HealthContext';
import { GlassCard } from './GlassCard';
import { TrendingUp, TrendingDown, Activity, Moon, Apple, Brain, Heart, AlertCircle } from 'lucide-react';
import { cn } from '../lib/utils';

export function HealthDashboard() {
  const { scoreBreakdown, scoreChanges, trendData } = useHealth();

  const categories = [
    { key: 'sleep', name: 'Sleep', icon: Moon, color: 'text-purple-400', bgColor: 'bg-purple-400/10' },
    { key: 'activity', name: 'Activity', icon: Activity, color: 'text-green-400', bgColor: 'bg-green-400/10' },
    { key: 'diet', name: 'Diet', icon: Apple, color: 'text-orange-400', bgColor: 'bg-orange-400/10' },
    { key: 'stress', name: 'Stress', icon: Brain, color: 'text-blue-400', bgColor: 'bg-blue-400/10' },
    { key: 'habits', name: 'Habits', icon: Heart, color: 'text-pink-400', bgColor: 'bg-pink-400/10' },
  ];

  // Find max score for trend graph scaling
  const maxScore = Math.max(...trendData.map(d => d.score), 1);
  const minScore = Math.min(...trendData.map(d => d.score));

  const lastWeekScore = trendData[trendData.length - 8]?.score || minScore;
  const currentScore = scoreBreakdown.total;
  const scoreDiff = currentScore - lastWeekScore;
  const isPositiveDiff = scoreDiff >= 0;

  return (
    <div className="space-y-8">
      {/* Total Score Card */}
      <GlassCard className="p-8 relative overflow-hidden">
        <div className="absolute -right-20 -top-20 w-64 h-64 rounded-full bg-primary/10 blur-3xl"></div>
        <div className="relative z-10">
          <div className="flex items-end justify-between mb-6">
            <div>
              <p className="text-on-surface-variant text-sm font-medium mb-2">Your Health Score</p>
              <h2 className="text-6xl font-black font-headline text-primary">{scoreBreakdown.total}</h2>
              <p className="text-on-surface-variant text-xs mt-2">out of 1000 points</p>
            </div>
            <div className="text-right">
              <div className={cn("flex items-center gap-1 mb-1", isPositiveDiff ? "text-secondary" : "text-tertiary")}>
                {isPositiveDiff ? <TrendingUp className="w-4 h-4" /> : <TrendingDown className="w-4 h-4" />}
                <span className="text-lg font-bold">
                  {isPositiveDiff ? '+' : ''}{scoreDiff}
                </span>
              </div>
              <p className="text-xs text-on-surface-variant">vs last week</p>
            </div>
          </div>

          {/* Mini Trend Graph */}
          <div className="mt-8 h-24 flex items-end gap-1">
            {trendData.slice(-14).map((point, i) => {
              const height = ((point.score - minScore) / (maxScore - minScore)) * 100;
              return (
                <div
                  key={i}
                  className="flex-1 bg-primary/20 rounded-t-sm relative group"
                  style={{ height: `${height}%` }}
                >
                  <div
                    className="absolute bottom-0 w-full bg-primary rounded-t-sm transition-all"
                    style={{ height: '100%' }}
                  ></div>
                  <div className="opacity-0 group-hover:opacity-100 absolute -top-8 left-1/2 -translate-x-1/2 bg-surface-container px-2 py-1 rounded text-[10px] font-bold whitespace-nowrap transition-opacity">
                    {point.score}
                  </div>
                </div>
              );
            })}
          </div>
          <div className="flex justify-between mt-2 text-[9px] text-on-surface-variant font-medium">
            <span>{trendData[trendData.length - 14]?.date}</span>
            <span>{trendData[trendData.length - 1]?.date}</span>
          </div>
        </div>
      </GlassCard>

      {/* Category Breakdown */}
      <div>
        <h3 className="font-headline text-xl font-bold mb-4">Category Breakdown</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {categories.map((category) => {
            const categoryData = scoreBreakdown[category.key as keyof typeof scoreBreakdown] as { score: number; weight: number };
            const percentage = (categoryData.score / 200) * 100;

            return (
              <div
                key={category.key}
                className="bg-surface-container rounded-xl p-6 hover:bg-surface-container-high transition-colors"
              >
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-3">
                    <div className={cn("w-10 h-10 rounded-lg flex items-center justify-center", category.bgColor)}>
                      <category.icon className={cn("w-5 h-5", category.color)} />
                    </div>
                    <div>
                      <h4 className="font-bold">{category.name}</h4>
                      <p className="text-xs text-on-surface-variant">{categoryData.weight}% weight</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className={cn("text-2xl font-black font-headline", category.color)}>{categoryData.score}</p>
                    <p className="text-xs text-on-surface-variant">/200</p>
                  </div>
                </div>
                <div className="relative h-2 w-full bg-surface-container-highest rounded-full overflow-hidden">
                  <div
                    className={cn("absolute top-0 left-0 h-full rounded-full transition-all duration-1000", category.color.replace('text-', 'bg-'))}
                    style={{ width: `${percentage}%` }}
                  ></div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Score Changes Explainer */}
      <div>
        <h3 className="font-headline text-xl font-bold mb-4">What's Affecting Your Score</h3>
        {scoreChanges.length === 0 ? (
          <GlassCard className="p-8 text-center">
            <p className="text-on-surface-variant">Great job! No major issues detected.</p>
          </GlassCard>
        ) : (
          <div className="space-y-3">
            {scoreChanges.map((change) => {
              const categoryData = categories.find(c => c.key === change.category);
              const Icon = categoryData?.icon || AlertCircle;
              const isNegative = change.change < 0;

              return (
                <div
                  key={change.id}
                  className="bg-surface-container rounded-lg p-5 flex items-start gap-4"
                >
                  <div className={cn(
                    "w-10 h-10 rounded-lg flex items-center justify-center flex-shrink-0",
                    isNegative ? "bg-tertiary/10" : "bg-secondary/10"
                  )}>
                    <Icon className={cn("w-5 h-5", isNegative ? "text-tertiary" : "text-secondary")} />
                  </div>
                  <div className="flex-grow">
                    <div className="flex items-start justify-between mb-1">
                      <h4 className="font-bold text-sm">{change.reason}</h4>
                      <span className={cn(
                        "text-lg font-black font-headline flex items-center gap-1",
                        isNegative ? "text-tertiary" : "text-secondary"
                      )}>
                        {isNegative ? <TrendingDown className="w-4 h-4" /> : <TrendingUp className="w-4 h-4" />}
                        {change.change > 0 ? '+' : ''}{change.change}
                      </span>
                    </div>
                    <p className="text-sm text-on-surface-variant leading-relaxed">{change.details}</p>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
