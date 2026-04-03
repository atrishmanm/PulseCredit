import { useState } from 'react';
import { Quest, Insight } from '@/src/types';
import { GlassCard } from './GlassCard';
import { HealthLeaderboard } from './HealthLeaderboard';
import { PersonalizedHealthDashboard } from './PersonalizedHealthDashboard';
import { Trophy, Moon, Droplets, Footprints, AlertTriangle, TrendingUp, Brain, Users, Apple, Heart } from 'lucide-react';
import { cn } from '@/src/lib/utils';
import { useHealth } from '../context/HealthContext';

interface HomeScreenProps {}

export function HomeScreen({}: HomeScreenProps) {
  const [activeTab, setActiveTab] = useState<'quests' | 'health' | 'leaderboard'>('quests');
  const { scoreBreakdown, metrics, user } = useHealth();

  const quests: Quest[] = [
    {
      id: '1',
      title: 'Walk 5k Steps',
      description: `${metrics.activity.dailySteps.toLocaleString()} / 5,000`,
      progress: Math.min(100, Math.round((metrics.activity.dailySteps / 5000) * 100)),
      target: 5000,
      unit: 'steps',
      xpReward: 500,
      type: 'daily',
      icon: 'Footprints',
      color: 'primary'
    },
    {
      id: '2',
      title: 'Healthy Calories',
      description: `${metrics.diet.calories} / 2500 kcal`,
      progress: Math.min(100, Math.round((metrics.diet.calories / 2500) * 100)),
      target: 2500,
      unit: 'kcal',
      xpReward: 300,
      type: 'daily',
      icon: 'Apple',
      color: 'secondary'
    },
    {
      id: '3',
      title: 'Hydrate 2.5L',
      description: `${metrics.diet.waterLiters}L / 2.5L`,
      progress: Math.min(100, Math.round((metrics.diet.waterLiters / 2.5) * 100)),
      target: 2.5,
      unit: 'L',
      xpReward: 200,
      type: 'daily',
      icon: 'Droplets',
      color: 'secondary'
    }
  ];

  const insights: Insight[] = [];

  // Only show insights if user has actually logged some data
  const hasAnyData = metrics.stress.screenTimeHours > 0 ||
                     metrics.activity.dailySteps > 0 ||
                     metrics.diet.calories > 0 ||
                     metrics.sleep.averageHours > 0;

  if (!hasAnyData) {
    // No insights for new users with no data
  } else {
    if (metrics.stress.screenTimeHours > 4) {
      insights.push({
        id: '1',
        title: 'High Screen Time Detected.',
        description: `Your screen time is currently ${metrics.stress.screenTimeHours}h. This directly impacts your focus and sleep quality.`,
        type: 'pattern',
        icon: 'AlertTriangle',
        color: 'tertiary'
      });
    }

    if (metrics.activity.dailySteps > 0 && metrics.activity.dailySteps < 5000) {
      insights.push({
        id: '2',
        title: 'Activity dropping.',
        description: `You only have ${metrics.activity.dailySteps} steps today. Consider a short walk to improve cardiovascular health.`,
        type: 'pattern',
        icon: 'AlertTriangle',
        color: 'primary'
      });
    }
  }

  return (
    <div className="space-y-12 pb-32">
      {/* Level & XP Section */}
      <section>
        <div className="flex justify-between items-end mb-4">
          <div>
            <h2 className="font-headline text-4xl font-extrabold tracking-tight text-white mb-1">Level {user.level}</h2>
            <p className="text-on-surface-variant font-medium uppercase tracking-wider text-[10px]">Elite Navigator</p>
          </div>
          <div className="text-right">
            <span className="text-primary font-headline text-xl font-bold">{(user.xp / 1000).toFixed(1)}k</span>
            <span className="text-on-surface-variant text-sm tracking-tight"> / {(user.maxXp / 1000).toFixed(0)}k XP</span>
          </div>
        </div>
        <div className="relative h-3 w-full bg-surface-container rounded-full overflow-hidden">
          <div
            className="absolute top-0 left-0 h-full bg-gradient-to-r from-primary to-primary-container rounded-full transition-all duration-1000"
            style={{ width: `${(user.xp / user.maxXp) * 100}%` }}
          >
            <div className="absolute top-0 right-0 w-8 h-full bg-white/20 blur-sm"></div>
          </div>
        </div>
        <div className="mt-4 flex gap-2">
          <div className="bg-surface-container-low px-4 py-2 rounded-xl border border-outline-variant/10 flex items-center gap-2">
            <Trophy className="w-4 h-4 text-secondary" />
            <span className="text-xs font-semibold">{user.maxXp - user.xp} XP to next tier</span>
          </div>
        </div>
      </section>

      {/* Tab Navigation */}
      <div className="flex gap-2 bg-surface-container p-1 rounded-xl overflow-x-auto">
        <button
          onClick={() => setActiveTab('quests')}
          className={cn(
            "flex-1 px-4 py-3 rounded-lg font-bold text-sm transition-all whitespace-nowrap",
            activeTab === 'quests'
              ? "bg-primary text-on-primary shadow-lg"
              : "text-on-surface-variant hover:text-on-surface"
          )}
        >
          Daily Quests
        </button>
        <button
          onClick={() => setActiveTab('health')}
          className={cn(
            "flex-1 px-4 py-3 rounded-lg font-bold text-sm transition-all flex items-center justify-center gap-2 whitespace-nowrap",
            activeTab === 'health'
              ? "bg-primary text-on-primary shadow-lg"
              : "text-on-surface-variant hover:text-on-surface"
          )}
        >
          <Heart className="w-4 h-4" />
          Health Score
        </button>
        <button
          onClick={() => setActiveTab('leaderboard')}
          className={cn(
            "flex-1 px-4 py-3 rounded-lg font-bold text-sm transition-all flex items-center justify-center gap-2 whitespace-nowrap",
            activeTab === 'leaderboard'
              ? "bg-primary text-on-primary shadow-lg"
              : "text-on-surface-variant hover:text-on-surface"
          )}
        >
          <Users className="w-4 h-4" />
          Leaderboard
        </button>
      </div>

      {activeTab === 'quests' ? (
        <>
          {/* Daily Quests */}
          <section>
            <div className="flex items-center justify-between mb-6">
              <h3 className="font-headline text-lg font-bold tracking-tight">Active Quests</h3>
              <span className="text-secondary font-headline text-xs font-bold uppercase tracking-widest">Resetting in 4h</span>
            </div>
            <div className="grid grid-cols-1 gap-4">
              {quests.map((quest) => (
                <div
                  key={quest.id}
                  className={cn(
                    "bg-surface-container p-5 rounded-xl flex items-center justify-between transition-all hover:bg-surface-container-high active:scale-[0.98] cursor-pointer",
                    quest.progress === 100 && "bg-surface-container-low opacity-60 border border-secondary/20"
                  )}
                >
                  <div className="flex items-center gap-4">
                    <div className={cn(
                      "w-12 h-12 rounded-2xl flex items-center justify-center",
                      quest.color === 'primary' ? "bg-primary/10 text-primary" : "bg-secondary/10 text-secondary"
                    )}>
                      {quest.icon === 'Footprints' && <Footprints className="w-6 h-6" />}
                      {quest.icon === 'Moon' && <Moon className="w-6 h-6" />}
                      {quest.icon === 'Droplets' && <Droplets className="w-6 h-6" />}
                    </div>
                    <div>
                      <p className={cn("font-headline font-bold text-white text-sm", quest.progress === 100 && "line-through")}>
                        {quest.title}
                      </p>
                      <p className={cn("text-xs", quest.progress === 100 ? "text-secondary font-medium" : "text-on-surface-variant")}>
                        {quest.description}
                      </p>
                    </div>
                  </div>

                  {quest.progress === 100 ? (
                    <div className="h-10 w-10 flex items-center justify-center bg-secondary rounded-full">
                      <Trophy className="w-5 h-5 text-on-secondary-container" />
                    </div>
                  ) : (
                    <div className="relative h-10 w-10">
                      <svg className="h-full w-full" viewBox="0 0 36 36">
                        <circle className="stroke-surface-container-highest" cx="18" cy="18" fill="none" r="16" strokeWidth="3"></circle>
                        <circle
                          className={cn("stroke-primary transition-all duration-1000")}
                          cx="18" cy="18" fill="none" r="16" strokeWidth="3"
                          strokeDasharray={`${quest.progress}, 100`}
                          strokeLinecap="round"
                        ></circle>
                      </svg>
                      <span className="absolute inset-0 flex items-center justify-center text-[10px] font-bold text-primary">
                        {quest.progress}%
                      </span>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </section>

          {/* Behavioral Insights */}
          <section>
            <h3 className="font-headline text-lg font-bold tracking-tight mb-6">Behavioral Insights</h3>
            <div className="grid grid-cols-12 gap-4">
              {insights.length === 0 ? (
                <div className="col-span-12 bg-surface-container-low rounded-xl p-8 text-center border border-outline-variant/10">
                  <Brain className="w-12 h-12 text-on-surface-variant/30 mx-auto mb-3" />
                  <p className="text-on-surface-variant font-medium mb-2">No patterns detected yet</p>
                  <p className="text-xs text-on-surface-variant/70">Start logging your health data to get personalized insights:</p>
                  <div className="mt-4 space-y-2 text-xs text-on-surface-variant/70">
                    <p>📷 Scanner → Upload food photo</p>
                    <p>➕ Profile → UPDATE → Add manual data</p>
                    <p>✅ After 3+ days → Insights appear</p>
                  </div>
                </div>
              ) : (
                insights.map((insight) => (
                  <div key={insight.id} className="col-span-12 bg-surface-container-low rounded-xl p-6 relative overflow-hidden group">
                    <div className="relative z-10">
                      <div className="flex items-center gap-2 mb-4">
                        <AlertTriangle className="w-4 h-4 text-tertiary" />
                        <span className="text-tertiary text-xs font-bold uppercase tracking-widest">Active Pattern</span>
                      </div>
                      <h4 className="font-headline text-xl font-bold text-white mb-2 leading-tight max-w-[80%]">
                        {insight.title}
                      </h4>
                      <p className="text-on-surface-variant text-sm leading-relaxed mb-6">
                        {insight.description}
                      </p>
                      <button className="bg-surface-container-highest px-6 py-2 rounded-full text-xs font-bold text-primary hover:bg-surface-bright transition-colors">
                        Adjust Routine
                      </button>
                    </div>
                    <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-tertiary/20 to-transparent blur-3xl rounded-full"></div>
                  </div>
                ))
              )}

              <div className="col-span-6 bg-surface-container rounded-xl p-5 border border-white/5">
                <TrendingUp className="w-6 h-6 text-secondary mb-3" />
                <p className="text-xs text-on-surface-variant mb-1 font-medium">Health Score</p>
                <p className="text-white font-headline text-2xl font-bold">{scoreBreakdown.total}</p>
                <p className="text-[10px] text-on-surface-variant mt-2 leading-tight">Current vitality</p>
              </div>

              <div className="col-span-6 bg-surface-container rounded-xl p-5 border border-white/5">
                <Brain className="w-6 h-6 text-primary mb-3" />
                <p className="text-xs text-on-surface-variant mb-1 font-medium">Activity Duration</p>
                <p className="text-white font-headline text-2xl font-bold">{Math.round(metrics.activity.exerciseMinutes / 60 * 10) / 10}h</p>
                <p className="text-[10px] text-on-surface-variant mt-2 leading-tight">Peak performance hours</p>
              </div>
            </div>
          </section>
        </>
      ) : activeTab === 'health' ? (
        <PersonalizedHealthDashboard />
      ) : (
        <HealthLeaderboard />
      )}
    </div>
  );
}
