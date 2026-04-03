import { UserProfile } from '../types';
import { analyzeHealthWithAI, simulateWhatIfWithAI, generateBioTwinAnalysisWithAI } from './openrouterApi';

export interface HealthMetrics {
  sleep: {
    averageHours: number;
    consistency: number; // 0-100
    quality: number; // 0-100
    bedtimeBefore11PM: number; // percentage
  };
  activity: {
    dailySteps: number;
    exerciseMinutes: number;
    sedentaryHours: number;
  };
  diet: {
    calories: number;
    proteinGrams: number;
    waterLiters: number;
    healthyMealsPercentage: number; // 0-100
  };
  stress: {
    level: number; // 0-100
    screenTimeHours: number;
    meditationMinutes: number;
  };
  habits: {
    smokingFrequency: number; // 0-10
    alcoholUnitsPerWeek: number;
    socialConnectionHours: number;
  };
}

// Research-backed personalized targets
export interface PersonalizedTargets {
  steps: number;
  sleep: number;
  calories: number;
  exercise: number;
}

// Disease-specific weights
export interface DiseaseWeights {
  activity: number;
  sleep: number;
  nutrition: number;
}

export interface HealthScoreBreakdown {
  total: number; // 0-1000
  sleep: { score: number; weight: number };
  activity: { score: number; weight: number };
  diet: { score: number; weight: number };
  stress: { score: number; weight: number };
  habits: { score: number; weight: number };
  personalizationNote?: string;
}

// ==================== RESEARCH-BACKED PERSONALIZATION ====================

/**
 * Get personalized targets based on disease profile
 * Uses AI-generated recommendations
 */
export function getPersonalizedTargets(profile: UserProfile): PersonalizedTargets {
  const disease = profile.disease || 'none';

  // These are fallback defaults - actual targets come from AI analysis
  if (disease === 'diabetes') {
    return {
      steps: 7000,
      sleep: 8,
      calories: 2000,
      exercise: 45,
    };
  }

  if (disease === 'obesity') {
    return {
      steps: 11000,
      sleep: 8,
      calories: 1800,
      exercise: 60,
    };
  }

  if (disease === 'hypertension') {
    return {
      steps: 10000,
      sleep: 7,
      calories: 2000,
      exercise: 30,
    };
  }

  return {
    steps: 9000,
    sleep: 7.5,
    calories: 2000,
    exercise: 30,
  };
}

/**
 * Get disease-specific weights for scoring
 * Higher weight = more important to score
 */
export function getPersonalizedWeights(profile: UserProfile): DiseaseWeights {
  const disease = profile.disease || 'none';

  if (disease === 'diabetes') {
    return {
      activity: 0.25,     // Moderate (consistency matters)
      sleep: 0.25,        // Blood sugar regulation
      nutrition: 0.5,     // CRITICAL - diet controls glucose
    };
  }

  if (disease === 'obesity') {
    return {
      activity: 0.4,      // CRITICAL - calories burned
      sleep: 0.2,         // Lower but still important
      nutrition: 0.4,     // CRITICAL - calorie intake
    };
  }

  if (disease === 'hypertension') {
    return {
      activity: 0.35,
      sleep: 0.35,        // Sleep controls BP
      nutrition: 0.3,     // Sodium/diet matters
    };
  }

  // Balanced healthy
  return {
    activity: 0.33,
    sleep: 0.33,
    nutrition: 0.34,
  };
}

export interface ScoreChange {
  id: string;
  category: 'sleep' | 'activity' | 'diet' | 'stress' | 'habits';
  change: number; // positive or negative
  reason: string;
  timestamp: Date;
  details: string;
}

/**
 * Calculate personalized health score based on disease profile
 * Uses research-backed targets and weighted aggregation
 */
export function calculateHealthScore(metrics: HealthMetrics, profile?: UserProfile): {
  breakdown: HealthScoreBreakdown;
  changes: ScoreChange[];
} {
  const hasAnyData =
    metrics.sleep.averageHours !== 0 ||
    metrics.sleep.consistency !== 0 ||
    metrics.sleep.quality !== 0 ||
    metrics.activity.dailySteps !== 0 ||
    metrics.activity.exerciseMinutes !== 0 ||
    metrics.diet.calories !== 0 ||
    metrics.diet.proteinGrams !== 0 ||
    metrics.diet.waterLiters !== 0 ||
    metrics.stress.level !== 0 ||
    metrics.stress.screenTimeHours !== 0 ||
    metrics.habits.smokingFrequency !== 0 ||
    metrics.habits.alcoholUnitsPerWeek !== 0;

  if (!hasAnyData) {
    const breakdown: HealthScoreBreakdown = {
      total: 0,
      sleep: { score: 0, weight: 20 },
      activity: { score: 0, weight: 20 },
      diet: { score: 0, weight: 20 },
      stress: { score: 0, weight: 20 },
      habits: { score: 0, weight: 20 },
    };
    return { breakdown, changes: [] };
  }

  // Get personalized targets and weights
  const targets = profile ? getPersonalizedTargets(profile) : getPersonalizedTargets({ id: '', name: '', email: '', level: 0, xp: 0, maxXp: 0, streak: 0, avatar: '', vitalityScore: 0 });
  const weights = profile ? getPersonalizedWeights(profile) : getPersonalizedWeights({ id: '', name: '', email: '', level: 0, xp: 0, maxXp: 0, streak: 0, avatar: '', vitalityScore: 0 });

  // Activity Score: normalized to target steps
  const activityRatio = metrics.activity.dailySteps / targets.steps;
  const activityScore = Math.min(100, activityRatio >= 1 ? 100 : activityRatio * 100);

  // Sleep Score: perfect = 7-9 hours, penalized for deviation
  const sleepDeviation = Math.abs(metrics.sleep.averageHours - targets.sleep);
  const sleepScore = Math.max(0, 100 - sleepDeviation * 15);

  // Nutrition Score: based on calorie target tolerance
  const nutritionDeviation = Math.abs(metrics.diet.calories - targets.calories);
  const nutritionScore = Math.max(0, 100 - (nutritionDeviation / targets.calories) * 100);

  // Disease-specific penalties
  let diseasePenalty = 0;
  let personalizationNote = '';

  if (profile?.disease === 'diabetes' && metrics.diet.calories > targets.calories * 1.1) {
    diseasePenalty += 15;
    personalizationNote = 'High calorie intake - critical for glucose control';
  }

  if (profile?.disease === 'obesity' && metrics.activity.dailySteps < targets.steps * 0.8) {
    diseasePenalty += 10;
  }

  // Weighted combination
  const combinedScore = Math.max(0,
    weights.activity * activityScore +
    weights.sleep * sleepScore +
    weights.nutrition * nutritionScore -
    diseasePenalty
  );

  const totalScore = Math.round(combinedScore);

  // Calculate breakdown for display
  const breakdown: HealthScoreBreakdown = {
    total: totalScore,
    sleep: { score: Math.round(sleepScore), weight: Math.round(weights.sleep * 100) },
    activity: { score: Math.round(activityScore), weight: Math.round(weights.activity * 100) },
    diet: { score: Math.round(nutritionScore), weight: Math.round(weights.nutrition * 100) },
    stress: { score: 0, weight: 0 },
    habits: { score: 0, weight: 0 },
    personalizationNote: personalizationNote || `Personalized for: ${profile?.disease || 'General Health'}`,
  };

  const changes: ScoreChange[] = [];

  if (metrics.activity.dailySteps < targets.steps * 0.8) {
    changes.push({
      id: 'low-steps-personalized',
      category: 'activity',
      change: -Math.round((targets.steps - metrics.activity.dailySteps) / 200),
      reason: `Below personalized target (${targets.steps} steps)`,
      timestamp: new Date(),
      details: `You need ${targets.steps - metrics.activity.dailySteps} more steps to reach your personalized goal.`,
    });
  }

  if (metrics.sleep.averageHours < targets.sleep - 1) {
    changes.push({
      id: 'insufficient-sleep',
      category: 'sleep',
      change: -Math.round((targets.sleep - metrics.sleep.averageHours) * 10),
      reason: 'Sleep below target',
      timestamp: new Date(),
      details: `Target: ${targets.sleep}h, Current: ${metrics.sleep.averageHours}h. Sleep quality is critical for your health profile.`,
    });
  }

  return { breakdown, changes };
}

// Risk prediction algorithms
export interface RiskPrediction {
  obesity: number; // 0-100
  diabetes: number;
  cardiovascularDisease: number;
  stressBurnout: number;
  sleepDisorder: number;
}

export interface AIRiskAnalysis {
  diseaseRisk: number;
  otherRisks: Array<{ name: string; percentage: number }>;
  reasoning: string;
  diseaseSpecificInsights: string[];
  recommendedTargets: {
    steps: number;
    sleepHours: number;
    calorieTarget: number;
    exerciseMinutes: number;
  };
  targetExplanations: {
    steps: string;
    sleep: string;
    calories: string;
    exercise: string;
  };
}

/**
 * AI-powered health risk analysis using OpenRouter
 * Returns disease-specific risks with explanations
 */
export async function predictHealthRisksWithAI(
  metrics: HealthMetrics,
  disease: string
): Promise<AIRiskAnalysis> {
  if (!disease || disease === 'none') {
    return {
      diseaseRisk: 0,
      otherRisks: [],
      reasoning: 'No specific disease selected',
      diseaseSpecificInsights: [],
      recommendedTargets: { steps: 9000, sleepHours: 7.5, calorieTarget: 2000, exerciseMinutes: 30 },
      targetExplanations: {
        steps: 'Standard recommendation',
        sleep: 'Standard recommendation',
        calories: 'Standard recommendation',
        exercise: 'Standard recommendation',
      },
    };
  }

  return analyzeHealthWithAI({
    disease,
    metrics: {
      sleep: {
        averageHours: metrics.sleep.averageHours,
        consistency: metrics.sleep.consistency,
        quality: metrics.sleep.quality,
      },
      activity: {
        dailySteps: metrics.activity.dailySteps,
        exerciseMinutes: metrics.activity.exerciseMinutes,
        sedentaryHours: metrics.activity.sedentaryHours,
      },
      diet: {
        calories: metrics.diet.calories,
        proteinGrams: metrics.diet.proteinGrams,
        healthyMealsPercentage: metrics.diet.healthyMealsPercentage,
      },
      stress: {
        level: metrics.stress.level,
        screenTimeHours: metrics.stress.screenTimeHours,
      },
      habits: {
        smokingFrequency: metrics.habits.smokingFrequency,
        alcoholUnitsPerWeek: metrics.habits.alcoholUnitsPerWeek,
      },
    },
  });
}

/**
 * AI-powered what-if simulation with step-by-step reasoning
 */
export async function simulateFutureRisksWithAI(
  currentMetrics: HealthMetrics,
  projectedMetrics: HealthMetrics,
  disease: string,
  monthsAhead: number
) {
  if (!disease || disease === 'none') {
    return {
      projectedRisk: 0,
      riskChange: 0,
      reasoningSteps: [],
      impactSummary: 'No disease selected',
      keyFactors: [],
    };
  }

  return simulateWhatIfWithAI({
    disease,
    currentMetrics: {
      sleep: {
        averageHours: currentMetrics.sleep.averageHours,
        consistency: currentMetrics.sleep.consistency,
        quality: currentMetrics.sleep.quality,
      },
      activity: {
        dailySteps: currentMetrics.activity.dailySteps,
        exerciseMinutes: currentMetrics.activity.exerciseMinutes,
        sedentaryHours: currentMetrics.activity.sedentaryHours,
      },
      diet: {
        calories: currentMetrics.diet.calories,
        proteinGrams: currentMetrics.diet.proteinGrams,
        healthyMealsPercentage: currentMetrics.diet.healthyMealsPercentage,
      },
      stress: {
        level: currentMetrics.stress.level,
        screenTimeHours: currentMetrics.stress.screenTimeHours,
      },
      habits: {
        smokingFrequency: currentMetrics.habits.smokingFrequency,
        alcoholUnitsPerWeek: currentMetrics.habits.alcoholUnitsPerWeek,
      },
    },
    projectedMetrics: {
      sleep: {
        averageHours: projectedMetrics.sleep.averageHours,
        consistency: projectedMetrics.sleep.consistency,
        quality: projectedMetrics.sleep.quality,
      },
      activity: {
        dailySteps: projectedMetrics.activity.dailySteps,
        exerciseMinutes: projectedMetrics.activity.exerciseMinutes,
        sedentaryHours: projectedMetrics.activity.sedentaryHours,
      },
      diet: {
        calories: projectedMetrics.diet.calories,
        proteinGrams: projectedMetrics.diet.proteinGrams,
        healthyMealsPercentage: projectedMetrics.diet.healthyMealsPercentage,
      },
      stress: {
        level: projectedMetrics.stress.level,
        screenTimeHours: projectedMetrics.stress.screenTimeHours,
      },
      habits: {
        smokingFrequency: projectedMetrics.habits.smokingFrequency,
        alcoholUnitsPerWeek: projectedMetrics.habits.alcoholUnitsPerWeek,
      },
    },
    timeframeMonths: monthsAhead,
  });
}

/**
 * AI-powered bio-twin analysis
 */
export async function generateBioTwinAnalysis(
  disease: string,
  riskFactors: { obesity: number; diabetes: number; cardiovascular: number; stress: number; sleep: number }
) {
  if (!disease || disease === 'none') {
    return {
      bodyPartAnalyses: [],
    };
  }

  return generateBioTwinAnalysisWithAI(disease, riskFactors);
}

export function predictHealthRisks(metrics: HealthMetrics): RiskPrediction {
  // Check if user has ANY data - if all metrics are 0, return 0 risks
  const hasAnyData =
    metrics.sleep.averageHours !== 0 ||
    metrics.sleep.consistency !== 0 ||
    metrics.sleep.quality !== 0 ||
    metrics.activity.dailySteps !== 0 ||
    metrics.activity.exerciseMinutes !== 0 ||
    metrics.diet.calories !== 0 ||
    metrics.diet.proteinGrams !== 0 ||
    metrics.diet.waterLiters !== 0 ||
    metrics.stress.level !== 0 ||
    metrics.stress.screenTimeHours !== 0 ||
    metrics.habits.smokingFrequency !== 0 ||
    metrics.habits.alcoholUnitsPerWeek !== 0;

  if (!hasAnyData) {
    return {
      obesity: 0,
      diabetes: 0,
      cardiovascularDisease: 0,
      stressBurnout: 0,
      sleepDisorder: 0,
    };
  }

  // Obesity risk
  const obesityRisk = Math.min(100, (
    (metrics.activity.dailySteps < 5000 ? 30 : Math.max(0, 30 - (metrics.activity.dailySteps / 500))) +
    (metrics.diet.calories > 2500 ? (metrics.diet.calories - 2500) / 50 : 0) +
    (metrics.activity.sedentaryHours > 8 ? (metrics.activity.sedentaryHours - 8) * 3 : 0) +
    (metrics.activity.exerciseMinutes < 30 ? (30 - metrics.activity.exerciseMinutes) * 0.5 : 0)
  ));

  // Diabetes risk
  const diabetesRisk = Math.min(100, (
    (obesityRisk * 0.4) +
    (metrics.diet.healthyMealsPercentage < 60 ? (60 - metrics.diet.healthyMealsPercentage) * 0.5 : 0) +
    (metrics.sleep.averageHours < 7 ? (7 - metrics.sleep.averageHours) * 8 : 0) +
    (metrics.stress.level * 0.3)
  ));

  // Cardiovascular disease risk
  const cardiovascularRisk = Math.min(100, (
    (metrics.activity.exerciseMinutes < 150 / 7 ? (150 / 7 - metrics.activity.exerciseMinutes) * 1.5 : 0) +
    (metrics.stress.level * 0.4) +
    (metrics.habits.smokingFrequency * 5) +
    (metrics.diet.healthyMealsPercentage < 70 ? (70 - metrics.diet.healthyMealsPercentage) * 0.4 : 0)
  ));

  // Stress burnout risk
  const burnoutRisk = Math.min(100, (
    (metrics.stress.level * 0.6) +
    (metrics.stress.screenTimeHours > 5 ? (metrics.stress.screenTimeHours - 5) * 5 : 0) +
    (metrics.sleep.quality < 70 ? (70 - metrics.sleep.quality) * 0.4 : 0) +
    (metrics.stress.meditationMinutes === 0 ? 15 : Math.max(0, 15 - metrics.stress.meditationMinutes))
  ));

  // Sleep disorder risk
  const sleepDisorderRisk = Math.min(100, (
    (metrics.sleep.consistency < 70 ? (70 - metrics.sleep.consistency) * 0.8 : 0) +
    (metrics.sleep.quality < 60 ? (60 - metrics.sleep.quality) * 0.6 : 0) +
    (metrics.stress.screenTimeHours > 3 ? (metrics.stress.screenTimeHours - 3) * 4 : 0) +
    (metrics.sleep.averageHours < 7 ? (7 - metrics.sleep.averageHours) * 10 : 0)
  ));

  return {
    obesity: Math.round(obesityRisk),
    diabetes: Math.round(diabetesRisk),
    cardiovascularDisease: Math.round(cardiovascularRisk),
    stressBurnout: Math.round(burnoutRisk),
    sleepDisorder: Math.round(sleepDisorderRisk),
  };
}

// Future simulation
export function simulateFutureRisks(
  currentMetrics: HealthMetrics,
  simulatedChanges: Partial<HealthMetrics>,
  monthsAhead: number
): RiskPrediction {
  const futureMetrics: HealthMetrics = {
    sleep: { ...currentMetrics.sleep, ...simulatedChanges.sleep },
    activity: { ...currentMetrics.activity, ...simulatedChanges.activity },
    diet: { ...currentMetrics.diet, ...simulatedChanges.diet },
    stress: { ...currentMetrics.stress, ...simulatedChanges.stress },
    habits: { ...currentMetrics.habits, ...simulatedChanges.habits },
  };

  const baseRisks = predictHealthRisks(futureMetrics);

  // Apply time multiplier (risks compound over time if habits don't change)
  const timeMultiplier = 1 + (monthsAhead / 12) * 0.3;

  return {
    obesity: Math.min(100, Math.round(baseRisks.obesity * timeMultiplier)),
    diabetes: Math.min(100, Math.round(baseRisks.diabetes * timeMultiplier)),
    cardiovascularDisease: Math.min(100, Math.round(baseRisks.cardiovascularDisease * timeMultiplier)),
    stressBurnout: Math.min(100, Math.round(baseRisks.stressBurnout * timeMultiplier)),
    sleepDisorder: Math.min(100, Math.round(baseRisks.sleepDisorder * timeMultiplier)),
  };
}

// Get risk status label
export function getRiskStatus(percentage: number): 'low' | 'moderate' | 'high' | 'critical' {
  if (percentage < 25) return 'low';
  if (percentage < 50) return 'moderate';
  if (percentage < 75) return 'high';
  return 'critical';
}

// Get risk color
export function getRiskColor(percentage: number): string {
  if (percentage < 25) return 'text-secondary';
  if (percentage < 50) return 'text-primary';
  if (percentage < 75) return 'text-tertiary';
  return 'text-error';
}
