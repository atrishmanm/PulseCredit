export type Screen = 'home' | 'engine' | 'scanner' | 'vault' | 'profile' | 'lifetime';

export interface UserProfile {
  id: string;
  name: string;
  email: string;
  level: number;
  xp: number;
  maxXp: number;
  streak: number;
  avatar: string;
  vitalityScore: number;
  disease?: string;
  bmi?: number;
}

export interface Quest {
  id: string;
  title: string;
  description: string;
  progress: number;
  target: number;
  unit: string;
  xpReward: number;
  type: 'daily' | 'active' | 'locked';
  icon: string;
  color: 'primary' | 'secondary' | 'tertiary';
}

export interface Insight {
  id: string;
  title: string;
  description: string;
  type: 'pattern' | 'warning' | 'positive';
  icon: string;
  color: 'primary' | 'secondary' | 'tertiary';
}

export interface FoodLog {
  id: string;
  name: string;
  time: string;
  calories: number;
  impact: number;
  image: string;
}

export interface RiskFactor {
  id: string;
  name: string;
  percentage: number;
  status: 'low' | 'moderate' | 'high' | 'stable' | 'critical';
  description: string;
  color: 'primary' | 'secondary' | 'tertiary' | 'error';
}

export interface LifetimeScoreData {
  lifetimeScore: number;
  dailyScores: { date: string; score: number }[];
  insight: string;
  milestone?: string;
  percentile: number;
}

export interface Notification {
  id: string;
  message: string;
  type: 'positive' | 'warning' | 'neutral';
  timestamp: number;
  read: boolean;
}

// ============ HEALTH DATA TYPES ============

export interface HealthLog {
  date: string; // ISO date: YYYY-MM-DD
  steps: number;
  sleepHours: number;
  caloriesBurned: number;
  heartRate?: number;
  activityMinutes?: number;
  source: 'auto' | 'manual' | 'wearable';
  syncSource?: string; // e.g., "health-connect-android", "healthkit-ios"
  timestamp: number;
  syncedAt?: number;
  manualNotes?: string;
}

export interface HealthSettings {
  dailyStepGoal: number;
  dailySleepGoal: number;
  dailyCalorieGoal: number;
  ageInYears: number;
  weightInKg: number;
  heightInCm: number;
  gender: 'M' | 'F' | 'Other';
  timezone: string;
  lastUpdated: number;
}

export interface DailyHealthSummary {
  date: string;
  dailyScore: number; // 0-100
  steps: number;
  sleepHours: number;
  caloriesBurned: number;
  goalsMetCount: number; // How many goals were met
  goalsTotal: number; // Total goals (steps, sleep, calories)
}
