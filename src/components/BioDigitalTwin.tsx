import { useState } from 'react';
import { useHealth } from '../context/HealthContext';
import { GlassCard } from './GlassCard';
import { Activity, Heart, Brain, Footprints, Moon, Apple } from 'lucide-react';
import { cn } from '../lib/utils';

interface BodyPart {
  id: string;
  name: string;
  risk: number;
  top: string;
  left: string;
  description: string;
}

export function BioDigitalTwin() {
  const { risks, metrics } = useHealth();
  const [selectedPart, setSelectedPart] = useState<BodyPart | null>(null);
  const [timeSlider, setTimeSlider] = useState(0); // 0 = now, 5 = 5 years

  // Map health risks to body parts
  const bodyParts: BodyPart[] = [
    {
      id: 'brain',
      name: 'Mental Health',
      risk: risks.stressBurnout,
      top: '15%',
      left: '50%',
      description: `Stress level at ${metrics.stress.level}%. Screen time: ${metrics.stress.screenTimeHours}h/day.`,
    },
    {
      id: 'heart',
      name: 'Cardiovascular',
      risk: risks.cardiovascularDisease,
      top: '35%',
      left: '45%',
      description: `Based on activity (${metrics.activity.exerciseMinutes}min/day) and diet quality.`,
    },
    {
      id: 'metabolism',
      name: 'Metabolic Health',
      risk: risks.diabetes,
      top: '50%',
      left: '50%',
      description: `Diabetes risk ${risks.diabetes}%. Sleep quality: ${metrics.sleep.quality}%.`,
    },
    {
      id: 'body',
      name: 'Body Composition',
      risk: risks.obesity,
      top: '60%',
      left: '50%',
      description: `${metrics.activity.dailySteps} steps/day. Sedentary: ${metrics.activity.sedentaryHours}h.`,
    },
    {
      id: 'sleep',
      name: 'Sleep System',
      risk: risks.sleepDisorder,
      top: '15%',
      left: '75%',
      description: `Avg ${metrics.sleep.averageHours}h/night. Consistency: ${metrics.sleep.consistency}%.`,
    },
  ];

  // Calculate projected risk based on time slider
  const getProjectedRisk = (currentRisk: number) => {
    if (timeSlider === 0) return currentRisk;
    // Risk increases over time if habits don't change
    return Math.min(100, Math.round(currentRisk + timeSlider * 3));
  };

  const getRiskColor = (risk: number) => {
    if (risk < 25) return 'bg-green-500';
    if (risk < 50) return 'bg-yellow-500';
    if (risk < 75) return 'bg-orange-500';
    return 'bg-red-500';
  };

  const getRiskGlow = (risk: number) => {
    if (risk < 25) return 'shadow-green-500/50';
    if (risk < 50) return 'shadow-yellow-500/50';
    if (risk < 75) return 'shadow-orange-500/50';
    return 'shadow-red-500/50';
  };

  const getBodyColor = () => {
    const avgRisk = (risks.obesity + risks.diabetes + risks.cardiovascularDisease + risks.stressBurnout + risks.sleepDisorder) / 5;
    const projectedRisk = getProjectedRisk(avgRisk);

    if (projectedRisk < 30) return 'from-green-500/20 to-blue-500/20';
    if (projectedRisk < 60) return 'from-yellow-500/20 to-orange-500/20';
    return 'from-orange-500/20 to-red-500/20';
  };

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="text-center space-y-2">
        <h2 className="text-3xl font-black font-headline">Bio-Digital Twin</h2>
        <p className="text-on-surface-variant">
          Visual representation of your health across body systems
        </p>
      </div>

      {/* Time Travel Slider */}
      <GlassCard className="p-6">
        <div className="flex items-center justify-between mb-4">
          <span className="font-bold">Time Travel Projection</span>
          <span className="text-primary font-black text-xl">
            {timeSlider === 0 ? 'Today' : `+${timeSlider} Years`}
          </span>
        </div>
        <input
          type="range"
          min="0"
          max="5"
          step="1"
          value={timeSlider}
          onChange={(e) => setTimeSlider(Number(e.target.value))}
          className="w-full h-2 bg-surface-container-highest rounded-lg appearance-none cursor-pointer accent-primary"
        />
        <div className="flex justify-between text-xs text-on-surface-variant mt-2">
          <span>Today</span>
          <span>1 year</span>
          <span>2 years</span>
          <span>3 years</span>
          <span>4 years</span>
          <span>5 years</span>
        </div>
        {timeSlider > 0 && (
          <div className="mt-4 p-4 bg-tertiary/10 rounded-lg border border-tertiary/20">
            <p className="text-xs text-on-surface-variant">
              <strong className="text-tertiary">Projection:</strong> If current habits continue,
              health risks may increase over {timeSlider} year{timeSlider > 1 ? 's' : ''}.
            </p>
          </div>
        )}
      </GlassCard>

      {/* Human Body Visualization */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Left: Body Visual */}
        <div className="relative aspect-[9/16] max-h-[600px] mx-auto w-full max-w-sm">
          <GlassCard className="absolute inset-0 overflow-hidden">
            {/* Human silhouette */}
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="relative w-full h-full">
                {/* Body outline */}
                <svg
                  viewBox="0 0 200 400"
                  className="w-full h-full"
                  style={{ filter: 'drop-shadow(0 0 20px rgba(99, 102, 241, 0.3))' }}
                >
                  {/* Head */}
                  <ellipse cx="100" cy="40" rx="30" ry="35" className={cn("fill-current transition-all duration-1000", timeSlider > 2 ? "text-surface-container" : "text-surface-container-high")} />

                  {/* Torso */}
                  <rect x="70" y="75" width="60" height="120" rx="15" className={cn("fill-current transition-all duration-1000", timeSlider > 2 ? "text-surface-container" : "text-surface-container-high")} />

                  {/* Arms */}
                  <rect x="30" y="80" width="35" height="100" rx="15" className="fill-current text-surface-container-high" />
                  <rect x="135" y="80" width="35" height="100" rx="15" className="fill-current text-surface-container-high" />

                  {/* Legs */}
                  <rect x="75" y="195" width="20" height="150" rx="10" className="fill-current text-surface-container-high" />
                  <rect x="105" y="195" width="20" height="150" rx="10" className="fill-current text-surface-container-high" />

                  {/* Gradient overlay */}
                  <defs>
                    <linearGradient id="healthGradient" x1="0%" y1="0%" x2="0%" y2="100%">
                      <stop offset="0%" className="stop-primary" stopOpacity="0.1" />
                      <stop offset="100%" className="stop-secondary" stopOpacity="0.1" />
                    </linearGradient>
                  </defs>
                  <rect x="0" y="0" width="200" height="400" fill="url(#healthGradient)" />
                </svg>

                {/* Risk Hotspots */}
                {bodyParts.map((part) => {
                  const projectedRisk = getProjectedRisk(part.risk);
                  return (
                    <button
                      key={part.id}
                      onClick={() => setSelectedPart(part)}
                      className={cn(
                        "absolute w-8 h-8 rounded-full -translate-x-1/2 -translate-y-1/2 transition-all duration-500 cursor-pointer",
                        getRiskColor(projectedRisk),
                        getRiskGlow(projectedRisk),
                        "hover:scale-150 shadow-xl",
                        selectedPart?.id === part.id && "scale-150 ring-4 ring-white/50"
                      )}
                      style={{
                        top: part.top,
                        left: part.left,
                        animation: `pulse ${2 + projectedRisk / 50}s ease-in-out infinite`,
                      }}
                    >
                      <div className="absolute inset-0 rounded-full bg-white/30 animate-ping"></div>
                    </button>
                  );
                })}
              </div>
            </div>
          </GlassCard>
        </div>

        {/* Right: Details */}
        <div className="space-y-4">
          {selectedPart ? (
            <GlassCard className="p-6 border-2 border-primary/30">
              <h3 className="text-xl font-black font-headline mb-2">{selectedPart.name}</h3>
              <div className="flex items-center gap-2 mb-4">
                <div className={cn("w-3 h-3 rounded-full", getRiskColor(getProjectedRisk(selectedPart.risk)))}></div>
                <span className="text-sm font-bold">
                  {getProjectedRisk(selectedPart.risk)}% Risk
                  {timeSlider > 0 && ` (in ${timeSlider} year${timeSlider > 1 ? 's' : ''})`}
                </span>
              </div>
              <p className="text-sm text-on-surface-variant leading-relaxed mb-4">
                {selectedPart.description}
              </p>
              {timeSlider > 0 && getProjectedRisk(selectedPart.risk) > selectedPart.risk && (
                <div className="p-3 bg-tertiary/10 rounded-lg border border-tertiary/20">
                  <p className="text-xs text-tertiary">
                    Risk increased by {getProjectedRisk(selectedPart.risk) - selectedPart.risk}% due to current trajectory.
                  </p>
                </div>
              )}
            </GlassCard>
          ) : (
            <GlassCard className="p-8 text-center">
              <p className="text-on-surface-variant">Click on a hotspot to see details</p>
            </GlassCard>
          )}

          {/* All Risks Overview */}
          <div className="space-y-3">
            {bodyParts.map((part) => {
              const projectedRisk = getProjectedRisk(part.risk);
              return (
                <button
                  key={part.id}
                  onClick={() => setSelectedPart(part)}
                  className={cn(
                    "w-full bg-surface-container rounded-lg p-4 text-left transition-all hover:bg-surface-container-high",
                    selectedPart?.id === part.id && "bg-surface-container-high ring-2 ring-primary/30"
                  )}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className={cn("w-3 h-3 rounded-full", getRiskColor(projectedRisk))}></div>
                      <span className="font-bold text-sm">{part.name}</span>
                    </div>
                    <span className="text-sm font-bold">{projectedRisk}%</span>
                  </div>
                </button>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}
