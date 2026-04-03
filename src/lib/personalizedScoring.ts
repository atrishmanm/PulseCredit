import { UserProfile } from '../types';
import { HealthMetrics, getPersonalizedTargets, getPersonalizedWeights } from './healthEngine';

/**
 * RESEARCH-BACKED PERSONALIZED SCORING SYSTEM
 * - Disease-specific targets (Physiopedia, Sage Journals)
 * - Dynamic weights based on disease profile
 * - Trend bonus for improvement
 * - Disease-specific penalties
 */

/**
 * Calculate activity score against disease-specific targets
 * Research: Physiopedia, Sage Journals (2006)
 */
export function calculateActivityScore(
  dailySteps: number,
  targetSteps: number
): number {
  const ratio = dailySteps / targetSteps;

  if (ratio >= 1) {
    return 100;
  }

  return Math.max(0, ratio * 100);
}

/**
 * Calculate sleep score
 */
export function calculateSleepScore(
  averageHours: number,
  targetHours: number
): number {
  const deviation = Math.abs(averageHours - targetHours);

  // Each hour off = 15 points penalty
  return Math.max(0, 100 - deviation * 15);
}

/**
 * Calculate nutrition score
 */
export function calculateNutritionScore(
  currentCalories: number,
  targetCalories: number
): number {
  const deviation = Math.abs(currentCalories - targetCalories);

  return Math.max(0, 100 - (deviation / targetCalories) * 100);
}

/**
 * Calculate disease-specific penalties
 */
export function calculateDiseasePenalty(
  profile: UserProfile,
  metrics: HealthMetrics
): number {
  let penalty = 0;
  const disease = profile.disease || 'none';

  if (disease === 'diabetes') {
    if (metrics.diet.healthyMealsPercentage < 60) penalty += 15;
    if (metrics.activity.dailySteps < 5000) penalty += 10;
  }

  if (disease === 'obesity') {
    if (metrics.diet.calories > 2200) penalty += 15;
    if (metrics.activity.dailySteps < 8000) penalty += 10;
  }

  if (disease === 'hypertension') {
    if (metrics.stress.level > 70) penalty += 15;
    if (metrics.sleep.averageHours < 7) penalty += 10;
  }

  return penalty;
}

/**
 * Calculate trend bonus based on historical data
 */
export function calculateTrendBonus(
  currentMetrics: HealthMetrics,
  previousAverageMetrics: HealthMetrics | null
): number {
  if (!previousAverageMetrics) return 0;

  let bonus = 0;

  // Improved steps
  if (currentMetrics.activity.dailySteps > previousAverageMetrics.activity.dailySteps * 1.05) {
    bonus += 5;
  }

  // Improved sleep consistency
  if (currentMetrics.sleep.consistency > previousAverageMetrics.sleep.consistency) {
    bonus += 3;
  }

  // Better nutrition
  if (currentMetrics.diet.healthyMealsPercentage >
      previousAverageMetrics.diet.healthyMealsPercentage * 1.1) {
    bonus += 5;
  }

  // Reduced stress
  if (currentMetrics.stress.level < previousAverageMetrics.stress.level * 0.9) {
    bonus += 3;
  }

  return bonus;
}

/**
 * MAIN: Research-backed health score (0-100)
 * Combines personalized targets, weights, penalties, and trends
 */
export function calculatePersonalizedHealthScore(
  profile: UserProfile,
  metrics: HealthMetrics,
  previousMetrics: HealthMetrics | null = null
): {
  totalScore: number;
  activityScore: number;
  sleepScore: number;
  nutritionScore: number;
  personalization: string;
  recommendation: string;
} {
  // Check if user has data
  const hasAnyData =
    metrics.activity.dailySteps !== 0 ||
    metrics.sleep.averageHours !== 0 ||
    metrics.diet.calories !== 0;

  if (!hasAnyData) {
    return {
      totalScore: 0,
      activityScore: 0,
      sleepScore: 0,
      nutritionScore: 0,
      personalization: 'Start logging your health data',
      recommendation: 'No data recorded yet',
    };
  }

  // Get personalized parameters based on disease
  const targets = getPersonalizedTargets(profile);
  const weights = getPersonalizedWeights(profile);

  // Calculate component scores (0-100)
  const activityScore = calculateActivityScore(
    metrics.activity.dailySteps,
    targets.steps
  );

  const sleepScore = calculateSleepScore(
    metrics.sleep.averageHours,
    targets.sleep
  );

  const nutritionScore = calculateNutritionScore(
    metrics.diet.calories,
    targets.calories
  );

  // Weighted score (0-100)
  const baseScore =
    (activityScore * weights.activity) +
    (sleepScore * weights.sleep) +
    (nutritionScore * weights.nutrition);

  // Apply disease penalty
  const penalty = calculateDiseasePenalty(profile, metrics);
  const penalizedScore = Math.max(0, baseScore - penalty);

  // Apply trend bonus
  const bonus = calculateTrendBonus(metrics, previousMetrics);
  const finalScore = Math.min(100, penalizedScore + bonus);

  // Determine personalization message
  const disease = profile.disease || 'none';
  let personalization = '';
  let recommendation = '';

  if (disease === 'diabetes') {
    personalization = '🩺 Diabetes Profile - Consistency & Diet Focus';
    if (nutritionScore < 50) {
      recommendation = 'Improve meal quality - focus on whole foods & stable glucose';
    } else if (activityScore < 50) {
      recommendation = 'Daily walking helps blood sugar regulation';
    } else {
      recommendation = 'Great balance! Maintain consistent routine';
    }
  } else if (disease === 'obesity') {
    personalization = '🏋️ Obesity Profile - Activity & Calorie Focus';
    if (activityScore < 50) {
      recommendation = `Aim for ${targets.steps}-${targets.steps + 1000} steps daily`;
    } else if (nutritionScore < 50) {
      recommendation = `Aim for ~${targets.calories} calories to create healthy deficit`;
    } else {
      recommendation = 'Excellent progress! Consistent effort = results';
    }
  } else if (disease === 'hypertension') {
    personalization = '💓 Hypertension Profile - Sleep & Stress Focus';
    if (sleepScore < 50) {
      recommendation = 'Consistent sleep schedule helps regulate blood pressure';
    } else if (metrics.stress.level > 70) {
      recommendation = 'Reduce screen time & practice relaxation techniques';
    } else {
      recommendation = 'Good BP management! Maintain balanced routine';
    }
  } else {
    personalization = '✨ Healthy Baseline - Balanced Approach';
    if (finalScore < 50) {
      recommendation = 'Increase daily activity and consistency';
    } else {
      recommendation = `Keep up the good work! Maintain your healthy habits`;
    }
  }

  return {
    totalScore: Math.round(finalScore),
    activityScore: Math.round(activityScore),
    sleepScore: Math.round(sleepScore),
    nutritionScore: Math.round(nutritionScore),
    personalization,
    recommendation,
  };
}
