import { useState, useEffect } from 'react';
import { useHealth } from '../context/HealthContext';
import { WhatIfSimulator } from './WhatIfSimulator';
import { BioDigitalTwin } from './BioDigitalTwin';
import { GlassCard } from './GlassCard';
import { TrendingDown, AlertTriangle, Play, Brain, Sparkles, User2, Heart } from 'lucide-react';
import { cn } from '@/src/lib/utils';
import { getRiskStatus, getRiskColor } from '../lib/healthEngine';

export function EngineScreen() {
  const { risks, user, metrics } = useHealth();
  const [activeTab, setActiveTab] = useState<'overview' | 'simulator' | 'twin'>('overview');

  // Real data: actual user metrics
  const displayMetrics = {
    steps: metrics.activity.dailySteps,
    sleep: metrics.sleep.averageHours,
    calories: metrics.diet.calories,
    exerciseMinutes: metrics.activity.exerciseMinutes,
  };

  return (
    <div className="space-y-12 pb-32">
      <section className="space-y-2">
        <h1 className="font-headline text-4xl md:text-5xl font-extrabold tracking-tighter text-on-surface">Risk Engine</h1>
        <p className="text-on-surface-variant max-w-md font-light leading-relaxed">
          Predictive biological modeling based on your current physiological trajectory.
        </p>
      </section>

      {/* Tab Navigation */}
      <div className="flex gap-2 bg-surface-container p-1 rounded-xl overflow-x-auto">
        <button
          onClick={() => setActiveTab('overview')}
          className={cn(
            "flex-1 px-4 py-3 rounded-lg font-bold text-sm transition-all whitespace-nowrap",
            activeTab === 'overview'
              ? "bg-primary text-on-primary shadow-lg"
              : "text-on-surface-variant hover:text-on-surface"
          )}
        >
          Overview
        </button>
        <button
          onClick={() => setActiveTab('simulator')}
          className={cn(
            "flex-1 px-4 py-3 rounded-lg font-bold text-sm transition-all flex items-center justify-center gap-2 whitespace-nowrap",
            activeTab === 'simulator'
              ? "bg-primary text-on-primary shadow-lg"
              : "text-on-surface-variant hover:text-on-surface"
          )}
        >
          <Sparkles className="w-4 h-4" />
          What-If Mode
        </button>
        <button
          onClick={() => setActiveTab('twin')}
          className={cn(
            "flex-1 px-4 py-3 rounded-lg font-bold text-sm transition-all flex items-center justify-center gap-2 whitespace-nowrap",
            activeTab === 'twin'
              ? "bg-primary text-on-primary shadow-lg"
              : "text-on-surface-variant hover:text-on-surface"
          )}
        >
          <User2 className="w-4 h-4" />
          Bio-Twin
        </button>
      </div>

      {/* Personalization Info - Show REAL metrics */}
      <div className="bg-surface-container-high p-4 rounded-xl border border-surface-container-highest space-y-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Heart className="w-5 h-5 text-secondary" />
            <p className="text-xs font-bold text-on-surface-variant uppercase tracking-widest">Your Actual Metrics</p>
          </div>
        </div>
        <div className="grid grid-cols-4 gap-2 text-center">
          <div className="bg-surface-container p-2 rounded-lg">
            <p className="text-[10px] text-on-surface-variant font-semibold">Steps</p>
            <p className="text-sm font-bold text-on-surface">{displayMetrics.steps.toLocaleString()}</p>
          </div>
          <div className="bg-surface-container p-2 rounded-lg">
            <p className="text-[10px] text-on-surface-variant font-semibold">Sleep</p>
            <p className="text-sm font-bold text-on-surface">{displayMetrics.sleep}h</p>
          </div>
          <div className="bg-surface-container p-2 rounded-lg">
            <p className="text-[10px] text-on-surface-variant font-semibold">Calories</p>
            <p className="text-sm font-bold text-on-surface">{displayMetrics.calories}</p>
          </div>
          <div className="bg-surface-container p-2 rounded-lg">
            <p className="text-[10px] text-on-surface-variant font-semibold">Exercise</p>
            <p className="text-sm font-bold text-on-surface">{displayMetrics.exerciseMinutes}min</p>
          </div>
        </div>
      </div>

      {activeTab === 'overview' ? (
        <>
          {/* Risk Gauges - Real risks from actual metrics */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {[
              { id: '1', name: 'Obesity', percentage: risks.obesity, color: 'secondary' },
              { id: '2', name: 'Diabetes', percentage: risks.diabetes, color: 'tertiary' },
              { id: '3', name: 'Stress', percentage: risks.stressBurnout, color: 'secondary' },
            ].map((risk) => (
              <div
                key={risk.id}
                className="bg-surface-container p-8 rounded-xl flex flex-col items-center justify-center space-y-6 text-center border border-white/5 transition-transform hover:scale-[1.02] duration-500"
              >
                <div className="relative w-40 h-40 flex items-center justify-center">
                  <svg className="w-full h-full -rotate-90" viewBox="0 0 100 100">
                    <circle className="text-surface-container-highest" cx="50" cy="50" fill="none" r="45" stroke="currentColor" strokeWidth="8"></circle>
                    <circle
                      className={cn(
                        risk.color === 'secondary' ? "text-secondary" : "text-tertiary",
                        "transition-all duration-1000"
                      )}
                      cx="50" cy="50" fill="none" r="45" stroke="currentColor"
                      strokeDasharray="283"
                      strokeDashoffset={283 - (283 * risk.percentage) / 100}
                      strokeLinecap="round"
                      strokeWidth="8"
                    ></circle>
                  </svg>
                  <div className="absolute flex flex-col items-center">
                    <span className={cn("font-headline text-3xl font-bold", risk.color === 'tertiary' && "text-tertiary")}>
                      {risk.percentage}%
                    </span>
                    <span className={cn("text-[10px] uppercase tracking-widest font-semibold", risk.color === 'tertiary' ? "text-tertiary" : "text-on-surface-variant")}>
                      {getRiskStatus(risk.percentage)}
                    </span>
                  </div>
                </div>
                <div>
                  <h3 className="font-headline text-lg font-bold text-on-surface">{risk.name}</h3>
                  <p className="text-sm text-on-surface-variant mt-1">Based on your metrics</p>
                </div>
              </div>
            ))}
          </div>

          {/* Simulation CTA Section */}
          <section className="relative group cursor-pointer" onClick={() => setActiveTab('simulator')}>
            <div className="absolute -inset-1 bg-gradient-to-r from-primary to-secondary rounded-xl blur opacity-10 group-hover:opacity-25 transition duration-1000"></div>
            <div className="relative bg-surface-container p-10 rounded-xl flex flex-col md:flex-row items-center justify-between gap-8 border border-white/5 overflow-hidden">
              <div className="space-y-4 text-center md:text-left z-10">
                <h2 className="font-headline text-2xl font-bold text-on-surface">What-if Simulation</h2>
                <p className="text-on-surface-variant max-w-sm">
                  Project how changes in sleep, diet, and activity will impact your future risk profiles across 10 years.
                </p>
                <button className="mt-4 px-8 py-4 bg-gradient-to-br from-primary to-primary-container text-on-primary rounded-full font-bold tracking-tight active:scale-95 transition-all shadow-xl shadow-primary/20 flex items-center gap-2">
                  <Play className="w-4 h-4 fill-current" />
                  Start Projection
                </button>
              </div>
              <div className="relative w-full md:w-72 h-48 bg-surface-container-low rounded-lg overflow-hidden flex items-center justify-center">
                <img
                  className="absolute inset-0 w-full h-full object-cover opacity-40"
                  src="https://picsum.photos/seed/data/400/300"
                  alt="Data visualization"
                  referrerPolicy="no-referrer"
                />
                <div className="z-10 flex gap-2 items-end">
                  <div className="w-1.5 h-12 bg-secondary rounded-full animate-pulse"></div>
                  <div className="w-1.5 h-16 bg-primary rounded-full animate-pulse delay-75"></div>
                  <div className="w-1.5 h-20 bg-secondary rounded-full animate-pulse delay-150"></div>
                  <div className="w-1.5 h-14 bg-tertiary rounded-full animate-pulse delay-300"></div>
                  <div className="w-1.5 h-10 bg-primary rounded-full animate-pulse delay-500"></div>
                </div>
              </div>
            </div>
          </section>

          {/* Insights Summary - Real risk insights */}
          {(risks.obesity > 30 || risks.diabetes > 30 || risks.stressBurnout > 30 || risks.sleepDisorder > 25 || risks.cardiovascularDisease > 30) && (
            <section className="space-y-4">
              <div className="flex items-center gap-2">
                <Brain className="w-5 h-5 text-secondary" />
                <h3 className="font-headline font-bold text-sm uppercase tracking-widest text-on-surface-variant">Health Insights</h3>
              </div>
              <div className="space-y-4">
                {risks.obesity > 30 && (
                  <div className="bg-surface-container p-6 rounded-lg flex items-center justify-between transition-colors hover:bg-surface-container-high">
                    <div className="flex items-center gap-4">
                      <div className="w-10 h-10 rounded-full bg-secondary/10 flex items-center justify-center">
                        <TrendingDown className="w-5 h-5 text-secondary" />
                      </div>
                      <div>
                        <p className="font-medium text-on-surface">Obesity Risk: {risks.obesity}%</p>
                        <p className="text-xs text-on-surface-variant">Current steps: {displayMetrics.steps} | Exercise: {displayMetrics.exerciseMinutes}min</p>
                      </div>
                    </div>
                  </div>
                )}

                {risks.stressBurnout > 30 && (
                  <div className="bg-surface-container p-6 rounded-lg flex items-center justify-between transition-colors hover:bg-surface-container-high">
                    <div className="flex items-center gap-4">
                      <div className="w-10 h-10 rounded-full bg-tertiary/10 flex items-center justify-center">
                        <AlertTriangle className="w-5 h-5 text-tertiary" />
                      </div>
                      <div>
                        <p className="font-medium text-on-surface">Stress Risk: {risks.stressBurnout}%</p>
                        <p className="text-xs text-on-surface-variant">Stress level: {metrics.stress.level}/100</p>
                      </div>
                    </div>
                  </div>
                )}

                {risks.sleepDisorder > 25 && (
                  <div className="bg-surface-container p-6 rounded-lg flex items-center justify-between transition-colors hover:bg-surface-container-high">
                    <div className="flex items-center gap-4">
                      <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
                        <AlertTriangle className="w-5 h-5 text-primary" />
                      </div>
                      <div>
                        <p className="font-medium text-on-surface">Sleep Risk: {risks.sleepDisorder}%</p>
                        <p className="text-xs text-on-surface-variant">Sleep consistency: {metrics.sleep.consistency}%</p>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </section>
          )}
        </>
      ) : activeTab === 'simulator' ? (
        <WhatIfSimulator />
      ) : (
        <BioDigitalTwin />
      )}
    </div>
  );
}
