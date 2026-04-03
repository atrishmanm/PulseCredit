import { useState, useEffect } from 'react';
import { useHealth } from '../context/HealthContext';
import { GlassCard } from './GlassCard';
import { Play, RotateCcw, TrendingUp, TrendingDown, Sliders, ChevronDown } from 'lucide-react';
import { cn } from '../lib/utils';
import { HealthMetrics } from '../lib/healthEngine';
import { simulateWhatIfWithAI, SimulationAnalysis } from '../lib/openrouterApi';

export function WhatIfSimulator() {
  const { metrics, risks, user } = useHealth();
  const [timeframe, setTimeframe] = useState(3); // months
  const [adjustments, setAdjustments] = useState<Partial<HealthMetrics>>({});
  const [simulatedRisks, setSimulatedRisks] = useState<{
    obesity: number;
    diabetes: number;
    cardiovascularDisease: number;
    stressBurnout: number;
    sleepDisorder: number;
  } | null>(null);
  const [aiAnalysis, setAiAnalysis] = useState<SimulationAnalysis | null>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [showReasoning, setShowReasoning] = useState(true);

  const simulations = [
    {
      name: 'Add 30min Exercise Daily',
      adjustment: {
        activity: {
          ...metrics.activity,
          exerciseMinutes: metrics.activity.exerciseMinutes + 30,
          dailySteps: metrics.activity.dailySteps + 3000,
        },
      },
    },
    {
      name: 'Fix Sleep Schedule',
      adjustment: {
        sleep: {
          averageHours: 8,
          consistency: 90,
          quality: 85,
          bedtimeBefore11PM: 85,
        },
      },
    },
    {
      name: 'Improve Diet Quality',
      adjustment: {
        diet: {
          ...metrics.diet,
          healthyMealsPercentage: 85,
          waterLiters: 2.5,
        },
      },
    },
    {
      name: 'Reduce Screen Time',
      adjustment: {
        stress: {
          ...metrics.stress,
          screenTimeHours: 3,
          level: Math.max(0, metrics.stress.level - 20),
        },
      },
    },
    {
      name: 'Do Nothing (Current Trajectory)',
      adjustment: {},
    },
  ];

  const runSimulation = async (adjustment: Partial<HealthMetrics>) => {
    setAdjustments(adjustment);
    setSimulatedRisks(null);
    setAiAnalysis(null);
    setIsAnalyzing(true);
    setShowReasoning(true);

    try {
      // Always get AI analysis with complete risk projections
      const projectedMetrics = {
        sleep: { ...metrics.sleep, ...adjustment.sleep },
        activity: { ...metrics.activity, ...adjustment.activity },
        diet: { ...metrics.diet, ...adjustment.diet },
        stress: { ...metrics.stress, ...adjustment.stress },
        habits: metrics.habits,
      };

      console.log('Running simulation with:', { disease: user.disease, timeframe });

      const analysis = await simulateWhatIfWithAI({
        disease: user.disease || 'general health',
        currentMetrics: {
          sleep: metrics.sleep,
          activity: metrics.activity,
          diet: metrics.diet,
          stress: metrics.stress,
          habits: metrics.habits,
        },
        projectedMetrics,
        timeframeMonths: timeframe,
      });

      console.log('AI Analysis received:', analysis);

      // Use AI-projected risks if available
      if (analysis.projectedRisks) {
        console.log('Setting projected risks:', analysis.projectedRisks);
        setSimulatedRisks(analysis.projectedRisks);
      } else {
        console.warn('No projectedRisks in analysis response');
      }
      setAiAnalysis(analysis);
    } catch (error) {
      console.error('Simulation error:', error);
    } finally {
      setIsAnalyzing(false);
    }
  };

  const reset = () => {
    setAdjustments({});
    setSimulatedRisks(null);
    setAiAnalysis(null);
    setShowReasoning(true);
  };

  const getRiskChange = (current: number, simulated: number) => {
    const change = simulated - current;
    return {
      value: Math.abs(Math.round(change)),
      isIncrease: change > 0,
      significant: Math.abs(change) > 5,
    };
  };

  const riskCategories = [
    { key: 'obesity' as const, name: 'Obesity', color: 'text-blue-400' },
    { key: 'diabetes' as const, name: 'Diabetes', color: 'text-purple-400' },
    { key: 'cardiovascularDisease' as const, name: 'Cardiovascular', color: 'text-pink-400' },
    { key: 'stressBurnout' as const, name: 'Burnout', color: 'text-orange-400' },
    { key: 'sleepDisorder' as const, name: 'Sleep Disorder', color: 'text-cyan-400' },
  ];

  return (
    <div className="space-y-8 relative">
      {/* Floating Loading Overlay */}
      {isAnalyzing && (
        <div className="fixed inset-0 flex items-center justify-center z-50 pointer-events-none">
          {/* Translucent background */}
          <div className="absolute inset-0 bg-background/40 backdrop-blur-sm pointer-events-none" />

          {/* Glass card loading indicator */}
          <div className="relative bg-surface-container/60 backdrop-blur-xl border border-primary/30 rounded-2xl px-8 py-6 shadow-2xl shadow-primary/20 flex flex-col items-center gap-4 animate-in fade-in duration-300">
            {/* Animated spinner */}
            <div className="relative w-16 h-16">
              {/* Outer ring */}
              <div className="absolute inset-0 rounded-full border-4 border-primary/20" />
              {/* Spinning ring */}
              <div className="absolute inset-0 rounded-full border-4 border-transparent border-t-primary border-r-secondary animate-spin" />
              {/* Inner pulse */}
              <div className="absolute inset-2 rounded-full border-2 border-primary/30 animate-pulse" />
            </div>

            {/* Loading text */}
            <div className="text-center">
              <p className="font-bold text-on-surface text-sm mb-1">Analyzing Your Scenario</p>
              <p className="text-xs text-on-surface-variant">Using AI to project your health trajectory...</p>
            </div>

            {/* Progress indicator */}
            <div className="w-32 h-1 bg-surface-container-high rounded-full overflow-hidden">
              <div className="h-full bg-gradient-to-r from-primary to-secondary animate-pulse" />
            </div>
          </div>
        </div>
      )}

      {/* Header */}
      <div className="text-center space-y-2">
        <h2 className="text-3xl font-black font-headline">What-If Simulator</h2>
        <p className="text-on-surface-variant">
          See how lifestyle changes affect your health risks over time
        </p>
      </div>

      {/* Timeframe Selector */}
      <GlassCard className="p-6">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <Sliders className="w-4 h-4 text-primary" />
            <span className="font-bold">Projection Timeframe</span>
          </div>
          <span className="text-primary font-black text-xl">{timeframe} Months</span>
        </div>
        <input
          type="range"
          min="1"
          max="12"
          value={timeframe}
          onChange={(e) => setTimeframe(Number(e.target.value))}
          className="w-full h-2 bg-surface-container-highest rounded-lg appearance-none cursor-pointer accent-primary"
        />
        <div className="flex justify-between text-xs text-on-surface-variant mt-2">
          <span>1 month</span>
          <span>12 months</span>
        </div>
      </GlassCard>

      {/* Simulation Presets */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {simulations.map((sim, index) => (
          <button
            key={index}
            onClick={() => runSimulation(sim.adjustment)}
            disabled={isAnalyzing}
            className={cn(
              "bg-surface-container p-6 rounded-xl text-left transition-all hover:bg-surface-container-high active:scale-95 border-2 disabled:opacity-50 disabled:cursor-not-allowed",
              JSON.stringify(adjustments) === JSON.stringify(sim.adjustment)
                ? "border-primary"
                : "border-transparent"
            )}
          >
            <div className="flex items-center justify-between mb-2">
              <h3 className="font-bold">{sim.name}</h3>
              <Play className="w-4 h-4 text-primary" />
            </div>
            <p className="text-xs text-on-surface-variant">
              {index === 4
                ? "Continue with current habits"
                : "See the impact of this change"}
            </p>
          </button>
        ))}
      </div>

      {/* Results with AI Reasoning */}
      {simulatedRisks && (
        <div className="space-y-6 animate-in fade-in duration-500">
          {/* AI Analysis Section - Show First */}
          {aiAnalysis && (
            <div className="space-y-4">
              <button
                onClick={() => setShowReasoning(!showReasoning)}
                className="w-full flex items-center justify-between p-4 bg-gradient-to-r from-primary/10 to-secondary/10 rounded-xl border-2 border-primary/20 hover:border-primary/40 transition-all"
              >
                <div className="flex items-center gap-3">
                  <span className="text-lg">🧠</span>
                  <div className="text-left">
                    <p className="font-bold text-sm text-on-surface">AI Analysis: Why These Results</p>
                    <p className="text-xs text-on-surface-variant">{aiAnalysis.impactSummary}</p>
                  </div>
                </div>
                <ChevronDown className={cn("w-4 h-4 text-primary transition-transform", showReasoning && "rotate-180")} />
              </button>

              {showReasoning && (
                <GlassCard className="p-6 space-y-4 bg-primary/5">
                  <div>
                    <p className="font-bold text-sm text-on-surface mb-3">Step-by-Step Analysis:</p>
                    <div className="space-y-2">
                      {aiAnalysis.reasoningSteps.map((step, idx) => (
                        <div key={idx} className="flex gap-3">
                          <div className="w-6 h-6 rounded-full bg-primary/20 text-primary text-xs font-bold flex items-center justify-center flex-shrink-0">
                            {idx + 1}
                          </div>
                          <p className="text-sm text-on-surface-variant pt-0.5">{step}</p>
                        </div>
                      ))}
                    </div>
                  </div>

                  {aiAnalysis.keyFactors.length > 0 && (
                    <div>
                      <p className="font-bold text-sm text-on-surface mb-2">Key Health Factors:</p>
                      <div className="space-y-2">
                        {aiAnalysis.keyFactors.map((factor, idx) => (
                          <div key={idx} className="bg-surface-container p-3 rounded-lg">
                            <p className="text-sm font-medium text-on-surface">{factor.factor}</p>
                            <p className="text-xs text-on-surface-variant mt-1">{factor.impact}</p>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </GlassCard>
              )}
            </div>
          )}

          {/* Results Header */}
          <div className="flex items-center justify-between">
            <h3 className="text-xl font-black font-headline">Projected Results ({timeframe}mo)</h3>
            <button
              onClick={reset}
              className="flex items-center gap-2 text-sm font-bold text-on-surface-variant hover:text-primary transition-colors"
            >
              <RotateCcw className="w-4 h-4" />
              Reset
            </button>
          </div>

          <div className="grid grid-cols-1 gap-4">
            {riskCategories.map((category) => {
              const currentRisk = risks[category.key];
              const projectedRisk = simulatedRisks[category.key];
              const change = getRiskChange(currentRisk, projectedRisk);

              return (
                <div
                  key={category.key}
                  className="bg-surface-container rounded-xl p-6"
                >
                  <div className="flex items-center justify-between mb-4">
                    <h4 className="font-bold">{category.name} Risk</h4>
                    {change.significant && (
                      <div className={cn(
                        "flex items-center gap-1 text-sm font-bold",
                        change.isIncrease ? "text-tertiary" : "text-secondary"
                      )}>
                        {change.isIncrease ? (
                          <TrendingUp className="w-4 h-4" />
                        ) : (
                          <TrendingDown className="w-4 h-4" />
                        )}
                        {change.isIncrease ? '+' : '-'}{change.value}%
                      </div>
                    )}
                  </div>

                  <div className="space-y-2">
                    {/* Current */}
                    <div className="flex items-center gap-3">
                      <span className="text-xs text-on-surface-variant w-20">Current</span>
                      <div className="flex-grow h-3 bg-surface-container-highest rounded-full overflow-hidden">
                        <div
                          className="h-full bg-on-surface-variant/30 rounded-full transition-all duration-1000"
                          style={{ width: `${currentRisk}%` }}
                        ></div>
                      </div>
                      <span className="text-xs font-bold w-12 text-right">{currentRisk}%</span>
                    </div>

                    {/* Projected */}
                    <div className="flex items-center gap-3">
                      <span className="text-xs text-on-surface-variant w-20">In {timeframe}mo</span>
                      <div className="flex-grow h-3 bg-surface-container-highest rounded-full overflow-hidden">
                        <div
                          className={cn(
                            "h-full rounded-full transition-all duration-1000",
                            projectedRisk < currentRisk ? "bg-secondary" : "bg-tertiary"
                          )}
                          style={{ width: `${projectedRisk}%` }}
                        ></div>
                      </div>
                      <span className={cn(
                        "text-xs font-bold w-12 text-right",
                        projectedRisk < currentRisk ? "text-secondary" : "text-tertiary"
                      )}>
                        {projectedRisk}%
                      </span>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Summary */}
          <GlassCard className="p-8 bg-primary/5 border-2 border-primary/20">
            <h4 className="font-bold mb-3">Impact Summary</h4>
            <p className="text-sm text-on-surface-variant leading-relaxed">
              {simulatedRisks.obesity < risks.obesity ||
              simulatedRisks.diabetes < risks.diabetes ||
              simulatedRisks.stressBurnout < risks.stressBurnout ? (
                <>
                  This lifestyle change shows <span className="text-secondary font-bold">positive impact</span> on your health trajectory.
                  Maintaining these habits could significantly reduce your long-term health risks.
                </>
              ) : (
                <>
                  Current trajectory shows <span className="text-tertiary font-bold">increasing risks</span> over time.
                  Consider making positive changes to improve your future health outcomes.
                </>
              )}
            </p>
          </GlassCard>
        </div>
      )}
    </div>
  );
}
