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
import { useAuth } from './AuthContext';
import { getFoodLogsForDate, calculateDailyNutrition } from '../lib/dataService';
import { calculateLifetimeScore } from '../lib/lifetimeScoring';
import {
  getLifetimeScore,
  updateLifetimeScore as saveLifetimeScoreToFirebase,
  saveDailyScore,
  getLast30DaysScores,
} from '../lib/lifetimeScoreService';

interface HealthContextType {
  user: UserProfile;
  updateUser: (updates: Partial<UserProfile>) => void;
  metrics: HealthMetrics;
  updateMetrics: (updates: Partial<HealthMetrics>) => void;
  scoreBreakdown: HealthScoreBreakdown;
  scoreChanges: ScoreChange[];
  risks: RiskPrediction;
  simulateRisks: (changes: Partial<HealthMetrics>, monthsAhead: number) => RiskPrediction;
  trendData: { date: string; score: number }[];
  lifetimeScore: number;
  updateLifetimeScore: () => void;
}

const HealthContext = createContext<HealthContextType | undefined>(undefined);

const INITIAL_USER: UserProfile = {
  id: 'user_1',
  name: 'User',
  email: '',
  avatar: 'https://picsum.photos/seed/atrish/200/200',
  level: 1,
  xp: 0,
  maxXp: 1000,
  streak: 0,
  vitalityScore: 0,
};

// Initial metrics should be ZERO for new users (no mock data)
const INITIAL_METRICS: HealthMetrics = {
  sleep: {
    averageHours: 0,
    consistency: 0,
    quality: 0,
    bedtimeBefore11PM: 0,
  },
  activity: {
    dailySteps: 0,
    exerciseMinutes: 0,
    sedentaryHours: 0,
  },
  diet: {
    calories: 0,
    proteinGrams: 0,
    waterLiters: 0,
    healthyMealsPercentage: 0,
  },
  stress: {
    level: 0,
    screenTimeHours: 0,
    meditationMinutes: 0,
  },
  habits: {
    smokingFrequency: 0,
    alcoholUnitsPerWeek: 0,
    socialConnectionHours: 0,
  },
};


export function HealthProvider({ children }: { children: ReactNode }) {
  const { user: authUser, userData } = useAuth();
  const [user, setUser] = useState<UserProfile>(INITIAL_USER);
  const [metrics, setMetrics] = useState<HealthMetrics>(INITIAL_METRICS);
  const [scoreBreakdown, setScoreBreakdown] = useState<HealthScoreBreakdown>({
    total: 0,
    sleep: { score: 0, weight: 20 },
    activity: { score: 0, weight: 20 },
    diet: { score: 0, weight: 20 },
    stress: { score: 0, weight: 20 },
    habits: { score: 0, weight: 20 },
  });
  const [scoreChanges, setScoreChanges] = useState<ScoreChange[]>([]);
  const [risks, setRisks] = useState<RiskPrediction>({
    obesity: 0,
    diabetes: 0,
    cardiovascularDisease: 0,
    stressBurnout: 0,
    sleepDisorder: 0,
  });
  const [trendData, setTrendData] = useState<{ date: string; score: number }[]>([]);
  const [lifetimeScore, setLifetimeScore] = useState<number>(700); // Will be loaded from Firebase

  // Load real data from Firebase when user logs in
  useEffect(() => {
    if (authUser && userData) {
      // Update user profile with Firebase data
      setUser(prev => ({
        ...prev,
        id: authUser.uid,
        name: userData.email?.split('@')[0] || 'User',
        email: userData.email || '',
        disease: userData.disease || 'none',
        level: prev.level,
        xp: prev.xp,
        maxXp: prev.maxXp,
      }));

      // Load lifetime score from Firebase
      getLifetimeScore(authUser.uid)
        .then(score => setLifetimeScore(score))
        .catch(err => console.error('Error loading lifetime score:', err));

      // Load last 30 days of scores from Firebase
      getLast30DaysScores(authUser.uid)
        .then(scores => setTrendData(scores))
        .catch(err => console.error('Error loading trend data:', err));

      // Load today's food logs for real nutrition data
      const loadTodaysFoodData = async () => {
        try {
          const today = new Date();
          const logs = await getFoodLogsForDate(authUser.uid, today);

          if (logs.length > 0) {
            const nutrition = calculateDailyNutrition(logs);
            // Update diet metrics with real food data
            setMetrics(prev => ({
              ...prev,
              diet: {
                ...prev.diet,
                calories: nutrition.totalCalories,
                proteinGrams: nutrition.totalProtein,
              }
            }));
          } else {
            // No food logged yet, reset to 0
            setMetrics(prev => ({
              ...prev,
              diet: {
                ...prev.diet,
                calories: 0,
                proteinGrams: 0,
              }
            }));
          }
        } catch (error) {
          console.error('Error loading food data:', error);
        }
      };

      loadTodaysFoodData();
    }
  }, [authUser, userData]);

  // Recalculate everything when metrics change
  useEffect(() => {
    const { breakdown, changes } = calculateHealthScore(metrics, user);
    setScoreBreakdown(breakdown);
    setScoreChanges(changes);

    const newRisks = predictHealthRisks(metrics);
    setRisks(newRisks);

    setUser(prev => ({ ...prev, vitalityScore: breakdown.total }));

    // Save daily score to Firebase if user is logged in
    if (authUser) {
      saveDailyScore(authUser.uid, breakdown.total)
        .catch(err => console.error('Error saving daily score:', err));
    }
  }, [metrics, authUser]);

  const updateUser = (updates: Partial<UserProfile>) => {
    setUser(prev => ({ ...prev, ...updates }));
  };

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

  const updateLifetimeScore = () => {
    const newLifetimeScore = calculateLifetimeScore(lifetimeScore, scoreBreakdown.total);
    setLifetimeScore(newLifetimeScore);

    // Save to Firebase
    if (authUser) {
      saveLifetimeScoreToFirebase(authUser.uid, newLifetimeScore)
        .catch(err => console.error('Error updating lifetime score in Firebase:', err));
    }
  };

  return (
    <HealthContext.Provider
      value={{
        user,
        updateUser,
        metrics,
        updateMetrics,
        scoreBreakdown,
        scoreChanges,
        risks,
        simulateRisks,
        trendData,
        lifetimeScore,
        updateLifetimeScore,
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
