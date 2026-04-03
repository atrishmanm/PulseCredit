import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { UserProfile } from '../types';
import {
  HealthMetrics,
  HealthScoreBreakdown,
  ScoreChange,
  RiskPrediction,
  calculateHealthScore,
  predictHealthRisks,
  simulateFutureRisks
} from '../lib/healthEngine';

interface HealthContextType {
  metrics: HealthMetrics;
  updateMetrics: (updates: Partial<HealthMetrics>) => void;
  scoreBreakdown: HealthScoreBreakdown;
  scoreChanges: ScoreChange[];
  risks: RiskPrediction;
  simulateRisks: (changes: Partial<HealthMetrics>, monthsAhead: number) => RiskPrediction;
  trendData: { date: string; score: number }[];
}

const HealthContext = createContext<HealthContextType | undefined>(undefined);

// Mock initial data for demo
const INITIAL_METRICS: HealthMetrics = {
  sleep: {
    averageHours: 6.5,
    consistency: 65, // Poor consistency
    quality: 72,
    bedtimeBefore11PM: 40, // Only 40% nights before 11
  },
  activity: {
    dailySteps: 4200,
    exerciseMinutes: 20,
    sedentaryHours: 9,
  },
  diet: {
    calories: 2100,
    proteinGrams: 55,
    waterLiters: 1.8,
    healthyMealsPercentage: 60,
  },
  stress: {
    level: 68,
    screenTimeHours: 7, // High screen time
    meditationMinutes: 0,
  },
  habits: {
    smokingFrequency: 0,
    alcoholUnitsPerWeek: 5,
    socialConnectionHours: 2.5,
  },
};

// Generate mock trend data for the last 30 days
const generateTrendData = (currentScore: number): { date: string; score: number }[] => {
  const data = [];
  const today = new Date();

  for (let i = 29; i >= 0; i--) {
    const date = new Date(today);
    date.setDate(date.getDate() - i);

    // Generate realistic fluctuation (+/- 50 points from current)
    const variation = Math.sin(i / 5) * 30 + (Math.random() - 0.5) * 40;
    const score = Math.max(600, Math.min(900, currentScore + variation - (i * 2))); // Slight upward trend

    data.push({
      date: date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
      score: Math.round(score),
    });
  }

  return data;
};

export function HealthProvider({ children }: { children: ReactNode }) {
  const [metrics, setMetrics] = useState<HealthMetrics>(INITIAL_METRICS);
  const [scoreBreakdown, setScoreBreakdown] = useState<HealthScoreBreakdown>({
    total: 842,
    sleep: { score: 0, weight: 20 },
    activity: { score: 0, weight: 20 },
    diet: { score: 0, weight: 20 },
    stress: { score: 0, weight: 20 },
    habits: { score: 0, weight: 20 },
  });
  const [scoreChanges, setScoreChanges] = useState<ScoreChange[]>([]);
  const [risks, setRisks] = useState<RiskPrediction>({
    obesity: 22,
    diabetes: 48,
    cardiovascularDisease: 35,
    stressBurnout: 62,
    sleepDisorder: 58,
  });
  const [trendData, setTrendData] = useState<{ date: string; score: number }[]>([]);

  // Recalculate everything when metrics change
  useEffect(() => {
    const { breakdown, changes } = calculateHealthScore(metrics);
    setScoreBreakdown(breakdown);
    setScoreChanges(changes);

    const newRisks = predictHealthRisks(metrics);
    setRisks(newRisks);

    setTrendData(generateTrendData(breakdown.total));
  }, [metrics]);

  const updateMetrics = (updates: Partial<HealthMetrics>) => {
    setMetrics(prev => ({
      sleep: { ...prev.sleep, ...updates.sleep },
      activity: { ...prev.activity, ...updates.activity },
      diet: { ...prev.diet, ...updates.diet },
      stress: { ...prev.stress, ...updates.stress },
      habits: { ...prev.habits, ...updates.habits },
    }));
  };

  const simulateRisks = (changes: Partial<HealthMetrics>, monthsAhead: number): RiskPrediction => {
    return simulateFutureRisks(metrics, changes, monthsAhead);
  };

  return (
    <HealthContext.Provider
      value={{
        metrics,
        updateMetrics,
        scoreBreakdown,
        scoreChanges,
        risks,
        simulateRisks,
        trendData,
      }}
    >
      {children}
    </HealthContext.Provider>
  );
}

export function useHealth() {
  const context = useContext(HealthContext);
  if (context === undefined) {
    throw new Error('useHealth must be used within a HealthProvider');
  }
  return context;
}

