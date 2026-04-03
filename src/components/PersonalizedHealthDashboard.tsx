import { useState, useEffect } from 'react';
import { useHealth } from '../context/HealthContext';
import { useAuth } from '../context/AuthContext';
import { calculatePersonalizedHealthScore } from '../lib/personalizedScoring';
import { Activity, Droplet, Moon, Heart, ArrowUp, TrendingUp } from 'lucide-react';
import { cn } from '@/src/lib/utils';

interface HealthScoreState {
  totalScore: number;
  activityScore: number;
  sleepScore: number;
  nutritionScore: number;
  personalization: string;
  recommendation: string;
}

export function PersonalizedHealthDashboard() {
  const { user, metrics } = useHealth();
  const [scoreData, setScoreData] = useState<HealthScoreState>({
    totalScore: 0,
    activityScore: 0,
    sleepScore: 0,
    nutritionScore: 0,
    personalization: '',
    recommendation: '',
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Calculate personalized score based on user's disease profile
    const result = calculatePersonalizedHealthScore(user, metrics);
    setScoreData(result);
    setLoading(false);
  }, [user, metrics]);

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="animate-pulse">Calculating your personalized health score...</div>
      </div>
    );
  }

  const getScoreColor = (score: number) => {
    if (score >= 80) return 'text-green-500';
    if (score >= 60) return 'text-blue-500';
    if (score >= 40) return 'text-yellow-500';
    return 'text-red-500';
  };

  const getScoreBgGradient = (score: number) => {
    if (score >= 80) return 'from-green-500/20 to-green-500/5';
    if (score >= 60) return 'from-blue-500/20 to-blue-500/5';
    if (score >= 40) return 'from-yellow-500/20 to-yellow-500/5';
    return 'from-red-500/20 to-red-500/5';
  };

  return (
    <div className="space-y-6 pb-32">
      {/* Header */}
      <section className="space-y-2">
        <h1 className="font-headline text-4xl md:text-5xl font-extrabold tracking-tighter text-on-surface">
          Your Health Profile
        </h1>
        <p className="text-on-surface-variant max-w-md font-light leading-relaxed">
          {scoreData.personalization}
        </p>
      </section>

      {/* Main Health Score Circle */}
      <div
        className={cn(
          'relative rounded-2xl p-8 md:p-12 gradient-border overflow-hidden',
          `bg-gradient-to-br ${getScoreBgGradient(scoreData.totalScore)}`
        )}
      >
        <div className="absolute inset-0 backdrop-blur-sm pointer-events-none" />
        <div className="relative z-10 flex flex-col items-center justify-center space-y-4">
          <div className="relative w-56 h-56 flex items-center justify-center">
            <svg className="w-full h-full -rotate-90" viewBox="0 0 100 100">
              {/* Background circle */}
              <circle
                className="text-surface-container-highest"
                cx="50"
                cy="50"
                fill="none"
                r="45"
                stroke="currentColor"
                strokeWidth="6"
              />
              {/* Progress circle */}
              <circle
                className={cn('transition-all duration-1000', getScoreColor(scoreData.totalScore))}
                cx="50"
                cy="50"
                fill="none"
                r="45"
                stroke="currentColor"
                strokeDasharray="283"
                strokeDashoffset={283 - (283 * scoreData.totalScore) / 100}
                strokeLinecap="round"
                strokeWidth="6"
              />
            </svg>
            <div className="absolute flex flex-col items-center -space-y-1">
              <span className={cn('font-headline text-7xl font-extrabold', getScoreColor(scoreData.totalScore))}>
                {scoreData.totalScore}
              </span>
              <span className="text-on-surface-variant text-xs font-bold uppercase tracking-widest">Score</span>
            </div>
          </div>

          <div className="text-center space-y-2 max-w-md">
            <h2 className="font-headline text-2xl font-bold text-on-surface">
              {scoreData.totalScore >= 80
                ? '🌟 Excellent'
                : scoreData.totalScore >= 60
                  ? '✨ Good'
                  : scoreData.totalScore >= 40
                    ? '⚠️ Fair'
                    : '🔴 Needs Work'}
            </h2>
            <p className="text-on-surface-variant text-sm leading-relaxed">{scoreData.recommendation}</p>
          </div>
        </div>
      </div>

      {/* Component Scores */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* Activity */}
        <div className="bg-surface-container rounded-xl p-6 space-y-4 border border-white/5">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-secondary/20 flex items-center justify-center">
              <Activity className="w-5 h-5 text-secondary" />
            </div>
            <h3 className="font-bold text-on-surface">Activity</h3>
          </div>

          <div className="space-y-2">
            <div className="flex justify-between items-center">
              <span className="text-sm text-on-surface-variant">Today</span>
              <span className="font-bold text-secondary">{metrics.activity.dailySteps} steps</span>
            </div>
            <div className="w-full bg-surface-container-high rounded-full h-2">
              <div
                className="bg-gradient-to-r from-secondary to-secondary-container h-2 rounded-full transition-all duration-500"
                style={{ width: `${Math.min((scoreData.activityScore / 100) * 100, 100)}%` }}
              />
            </div>
          </div>

          <div className="text-center">
            <span className={cn('font-headline text-3xl font-bold', getScoreColor(scoreData.activityScore))}>
              {scoreData.activityScore}
            </span>
            <p className="text-xs text-on-surface-variant mt-1">out of 100</p>
          </div>
        </div>

        {/* Sleep */}
        <div className="bg-surface-container rounded-xl p-6 space-y-4 border border-white/5">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-primary/20 flex items-center justify-center">
              <Moon className="w-5 h-5 text-primary" />
            </div>
            <h3 className="font-bold text-on-surface">Sleep</h3>
          </div>

          <div className="space-y-2">
            <div className="flex justify-between items-center">
              <span className="text-sm text-on-surface-variant">Last Night</span>
              <span className="font-bold text-primary">{metrics.sleep.averageHours.toFixed(1)} hrs</span>
            </div>
            <div className="w-full bg-surface-container-high rounded-full h-2">
              <div
                className="bg-gradient-to-r from-primary to-primary-container h-2 rounded-full transition-all duration-500"
                style={{ width: `${Math.min((scoreData.sleepScore / 100) * 100, 100)}%` }}
              />
            </div>
          </div>

          <div className="text-center">
            <span className={cn('font-headline text-3xl font-bold', getScoreColor(scoreData.sleepScore))}>
              {scoreData.sleepScore}
            </span>
            <p className="text-xs text-on-surface-variant mt-1">out of 100</p>
          </div>
        </div>

        {/* Nutrition */}
        <div className="bg-surface-container rounded-xl p-6 space-y-4 border border-white/5">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-tertiary/20 flex items-center justify-center">
              <Droplet className="w-5 h-5 text-tertiary" />
            </div>
            <h3 className="font-bold text-on-surface">Nutrition</h3>
          </div>

          <div className="space-y-2">
            <div className="flex justify-between items-center">
              <span className="text-sm text-on-surface-variant">Today</span>
              <span className="font-bold text-tertiary">{metrics.diet.calories} cal</span>
            </div>
            <div className="w-full bg-surface-container-high rounded-full h-2">
              <div
                className="bg-gradient-to-r from-tertiary to-tertiary-container h-2 rounded-full transition-all duration-500"
                style={{ width: `${Math.min((scoreData.nutritionScore / 100) * 100, 100)}%` }}
              />
            </div>
          </div>

          <div className="text-center">
            <span className={cn('font-headline text-3xl font-bold', getScoreColor(scoreData.nutritionScore))}>
              {scoreData.nutritionScore}
            </span>
            <p className="text-xs text-on-surface-variant mt-1">out of 100</p>
          </div>
        </div>
      </div>

      {/* Personalized Insights */}
      <div className="bg-surface-container rounded-xl p-6 space-y-4 border border-white/5">
        <div className="flex items-center gap-2">
          <Heart className="w-5 h-5 text-secondary" />
          <h3 className="font-bold text-on-surface">Disease-Specific Insights</h3>
        </div>

        <div className="space-y-3">
          {user.disease && user.disease !== 'none' ? (
            <>
              <p className="text-sm text-on-surface">
                Your health score is personalized for <strong>{user.disease.toUpperCase()}</strong> management.
              </p>

              {user.disease === 'diabetes' && (
                <div className="p-3 bg-primary/10 rounded-lg text-sm text-on-surface">
                  <p className="font-semibold mb-1">Focus Areas:</p>
                  <ul className="list-disc list-inside space-y-1 text-on-surface-variant">
                    <li>Maintain consistent daily activity (7,000+ steps recommended)</li>
                    <li>Track meal quality for blood sugar stability</li>
                    <li>Regular sleep patterns support glucose regulation</li>
                  </ul>
                </div>
              )}

              {user.disease === 'obesity' && (
                <div className="p-3 bg-secondary/10 rounded-lg text-sm text-on-surface">
                  <p className="font-semibold mb-1">Focus Areas:</p>
                  <ul className="list-disc list-inside space-y-1 text-on-surface-variant">
                    <li>Increase activity to 11,000+ steps for weight management</li>
                    <li>Monitor calorie intake for healthy deficit</li>
                    <li>Track progress for sustainable improvement</li>
                  </ul>
                </div>
              )}

              {user.disease === 'hypertension' && (
                <div className="p-3 bg-tertiary/10 rounded-lg text-sm text-on-surface">
                  <p className="font-semibold mb-1">Focus Areas:</p>
                  <ul className="list-disc list-inside space-y-1 text-on-surface-variant">
                    <li>Maintain consistent 7+ hours sleep nightly</li>
                    <li>Manage stress with relaxation techniques</li>
                    <li>Regular moderate activity reduces blood pressure</li>
                  </ul>
                </div>
              )}
            </>
          ) : (
            <p className="text-sm text-on-surface-variant">
              Set your health profile to get personalized recommendations.
            </p>
          )}
        </div>
      </div>

      {/* ResearchBacked Note */}
      <div className="bg-surface-container-low rounded-xl p-4 border border-white/5">
        <p className="text-xs text-on-surface-variant space-y-1">
          <span className="block font-semibold text-on-surface">🧬 Research-Backed Scoring</span>
          <span className="block">
            Based on Physiopedia and Sage Journals (2006) studies. Personalized targets and weights adjust for your health profile.
          </span>
        </p>
      </div>
    </div>
  );
}
