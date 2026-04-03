import { LifetimeScoreData, Notification } from '../types';

const INERTIA_FACTOR = 0.95; // 95% old score influence
const DAILY_FACTOR = 0.05; // 5% new daily score influence

/**
 * Calculate lifetime score with exponential moving average
 * Formula: (0.95 * old_score) + (0.05 * daily_score)
 */
export function calculateLifetimeScore(
  previousLifetimeScore: number,
  dailyScore: number
): number {
  if (previousLifetimeScore === 0) {
    // First day - use daily score as baseline
    return dailyScore;
  }

  const newScore = INERTIA_FACTOR * previousLifetimeScore + DAILY_FACTOR * dailyScore;
  return Math.round(newScore);
}

/**
 * Calculate daily average from historical scores
 */
export function calculateDailyAverage(scores: number[]): number {
  if (scores.length === 0) return 0;
  const sum = scores.reduce((a, b) => a + b, 0);
  return Math.round(sum / scores.length);
}

/**
 * Calculate level and current XP from lifetime score
 * Levels scale exponentially: Level 1 = 0-100, Level 2 = 100-300, etc.
 */
export function calculateLevelFromScore(lifetimeScore: number): { level: number; xp: number; maxXp: number } {
  const levels = [
    { minScore: 0, maxScore: 100, xpNeeded: 100 },
    { minScore: 100, maxScore: 300, xpNeeded: 200 },
    { minScore: 300, maxScore: 600, xpNeeded: 300 },
    { minScore: 600, maxScore: 900, xpNeeded: 400 },
    { minScore: 900, maxScore: Infinity, xpNeeded: 500 },
  ];

  // Find current level
  let currentLevel = 1;
  let totalXpEarned = 0;
  let levelStartScore = 0;

  for (const level of levels) {
    if (lifetimeScore >= level.minScore && lifetimeScore < level.maxScore) {
      const scoreInLevel = lifetimeScore - level.minScore;
      const xpProgress = (scoreInLevel / (level.maxScore - level.minScore)) * level.xpNeeded;
      return {
        level: currentLevel,
        xp: Math.round(xpProgress),
        maxXp: level.xpNeeded,
      };
    }
    totalXpEarned += level.xpNeeded;
    currentLevel++;
    levelStartScore = level.maxScore;
  }

  // Beyond last level
  return {
    level: currentLevel,
    xp: Math.round((lifetimeScore - levelStartScore) * 0.5),
    maxXp: 500,
  };
}

/**
 * Determine trend direction
 */
export function calculateTrend(
  scores: { date: string; score: number }[]
): 'up' | 'down' | 'stable' {
  if (scores.length < 2) return 'stable';

  const firstHalf = scores.slice(0, Math.floor(scores.length / 2));
  const secondHalf = scores.slice(Math.floor(scores.length / 2));

  const firstAvg = calculateDailyAverage(firstHalf.map(s => s.score));
  const secondAvg = calculateDailyAverage(secondHalf.map(s => s.score));

  const change = secondAvg - firstAvg;

  if (Math.abs(change) < 20) return 'stable'; // Within 20 points = stable
  return change > 0 ? 'up' : 'down';
}

/**
 * Generate notification based on score change
 */
export function generateNotification(
  oldScore: number,
  newScore: number,
  userId: string
): Notification | null {
  const change = newScore - oldScore;

  if (change >= 20) {
    return {
      id: `notif_${userId}_${Date.now()}`,
      message: `🎉 Great job! Your health improved by +${change} points!`,
      type: 'positive',
      timestamp: Date.now(),
      read: false,
    };
  }

  if (change >= 5) {
    return {
      id: `notif_${userId}_${Date.now()}`,
      message: `👍 Nice! You're getting healthier (+${change} points)`,
      type: 'positive',
      timestamp: Date.now(),
      read: false,
    };
  }

  if (change <= -10) {
    return {
      id: `notif_${userId}_${Date.now()}`,
      message: `⚠️ Your health score dropped (${change} points). Time to refocus!`,
      type: 'warning',
      timestamp: Date.now(),
      read: false,
    };
  }

  return null;
}

/**
 * Check for milestone achievements
 */
export function checkMilestone(score: number): string | null {
  const milestones = [
    { threshold: 900, label: 'Elite Health! 🏆' },
    { threshold: 800, label: 'Excellent Health! ⭐' },
    { threshold: 700, label: 'Good Health! 💪' },
    { threshold: 600, label: 'Decent Health 👍' },
  ];

  for (const milestone of milestones) {
    if (score >= milestone.threshold) {
      return milestone.label;
    }
  }

  return null;
}

/**
 * Calculate percentile rank (mock - can be replaced with real calculation)
 */
export function calculatePercentile(score: number): number {
  // Mock percentile calculation
  // In production, compare against all users' scores
  const normalizedScore = Math.max(0, Math.min(1000, score));
  return Math.round((normalizedScore / 1000) * 100);
}

/**
 * Generate insight based on lifetime score and trend
 */
export function generateInsight(
  lifetimeScore: number,
  trend: 'up' | 'down' | 'stable'
): string {
  if (trend === 'up') {
    if (lifetimeScore > 800) {
      return 'Your health is improving steadily and you are in excellent condition! Keep it up 📈';
    }
    return 'Great progress! Your health is moving in the right direction 📈';
  }

  if (trend === 'down') {
    if (lifetimeScore < 600) {
      return 'Your health is declining. Consider reviewing your daily routine ⚠️';
    }
    return 'Your health is declining slowly. Time to refocus on your goals 📉';
  }

  if (lifetimeScore > 800) {
    return 'You are maintaining excellent health! Consistency is key 💪';
  }

  if (lifetimeScore < 600) {
    return 'Your health needs attention. Start with small improvements today 🎯';
  }

  return 'Your health is stable. Keep working on your daily goals 👍';
}

/**
 * Get weekly summary
 */
export function getWeeklySummary(scores: { date: string; score: number }[]): {
  weeklyChange: number;
  bestDay: number;
  worstDay: number;
  avgWeekly: number;
} {
  if (scores.length === 0) {
    return { weeklyChange: 0, bestDay: 0, worstDay: 0, avgWeekly: 0 };
  }

  const weekScores = scores.slice(-7);
  const firstScore = weekScores[0]?.score || 0;
  const lastScore = weekScores[weekScores.length - 1]?.score || 0;

  return {
    weeklyChange: lastScore - firstScore,
    bestDay: Math.max(...weekScores.map(s => s.score)),
    worstDay: Math.min(...weekScores.map(s => s.score)),
    avgWeekly: calculateDailyAverage(weekScores.map(s => s.score)),
  };
}
