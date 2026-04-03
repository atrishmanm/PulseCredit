import { useHealth } from '../context/HealthContext';
import { GlassCard } from './GlassCard';
import { Trophy, TrendingUp, TrendingDown, Users, Crown, Medal, Award } from 'lucide-react';
import { cn } from '../lib/utils';

interface LeaderboardEntry {
  id: string;
  name: string;
  avatar: string;
  score: number;
  level: number;
  streak: number;
  trend: number; // weekly change
  rank: number;
}

export function HealthLeaderboard() {
  const { lifetimeScore, user } = useHealth();

  const getRankIcon = (rank: number) => {
    switch (rank) {
      case 1:
        return <Crown className="w-6 h-6 text-yellow-400 fill-yellow-400" />;
      case 2:
        return <Trophy className="w-6 h-6 text-gray-400 fill-gray-400" />;
      case 3:
        return <Medal className="w-6 h-6 text-orange-400 fill-orange-400" />;
      default:
        return <span className="font-bold text-on-surface-variant">#{rank}</span>;
    }
  };

  const userEntry: LeaderboardEntry = {
    id: user.id,
    name: 'You',
    avatar: user.avatar,
    score: Math.round(lifetimeScore),
    level: user.level,
    streak: user.streak,
    trend: 18,
    rank: 0,
  };

  const initialLeaderboard: LeaderboardEntry[] = [
    { id: '1', name: 'Sarah Chen', avatar: 'https://picsum.photos/seed/sarah/200/200', score: 912, level: 48, streak: 21, trend: 12, rank: 0 },
    userEntry,
    { id: '3', name: 'Marcus Johnson', avatar: 'https://picsum.photos/seed/marcus/200/200', score: 834, level: 41, streak: 9, trend: -5, rank: 0 },
    { id: '4', name: 'Elena Rodriguez', avatar: 'https://picsum.photos/seed/elena/200/200', score: 801, level: 39, streak: 15, trend: 22, rank: 0 },
    { id: '5', name: 'David Kim', avatar: 'https://picsum.photos/seed/david/200/200', score: 789, level: 38, streak: 7, trend: -8, rank: 0 }
  ];

  const leaderboard = initialLeaderboard
    .sort((a, b) => b.score - a.score)
    .map((entry, index) => ({ ...entry, rank: index + 1 }));

  // Find your actual rank in the sorted leaderboard
  const yourRankEntry = leaderboard.find(entry => entry.id === user.id);

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="text-center space-y-2">
        <div className="flex items-center justify-center gap-2 mb-2">
          <Users className="w-6 h-6 text-primary" />
          <h2 className="text-3xl font-black font-headline">Health Leaderboard</h2>
        </div>
        <p className="text-on-surface-variant">
          Compete with friends on health goals and habits
        </p>
      </div>

      {/* Your Rank Card */}
      {yourRankEntry && (
        <GlassCard className="p-8 bg-gradient-to-br from-primary/10 to-secondary/10 border-2 border-primary/30">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="relative">
                <div className="w-16 h-16 rounded-full border-4 border-primary p-1">
                  <img
                    src={yourRankEntry.avatar}
                    alt="You"
                    className="w-full h-full rounded-full object-cover"
                    referrerPolicy="no-referrer"
                  />
                </div>
                <div className="absolute -bottom-1 -right-1 bg-primary text-on-primary w-8 h-8 rounded-full flex items-center justify-center border-2 border-background">
                  <Medal className="w-4 h-4 fill-current" />
                </div>
              </div>
              <div>
                <h3 className="font-black text-xl">Your Rank: #{yourRankEntry.rank}</h3>
                <p className="text-on-surface-variant text-sm">Level {yourRankEntry.level} • {yourRankEntry.streak}-day streak</p>
              </div>
            </div>
            <div className="text-right">
              <p className="text-4xl font-black font-headline text-primary">{yourRankEntry.score}</p>
              <div className="flex items-center justify-end gap-1 text-secondary mt-1">
                <TrendingUp className="w-4 h-4" />
                <span className="text-sm font-bold">+{yourRankEntry.trend} this week</span>
              </div>
            </div>
          </div>
        </GlassCard>
      )}

      {/* Leaderboard List */}
      <div className="space-y-3">
        {leaderboard.map((entry, index) => {
          const isYou = entry.name === 'You';

          return (
            <div
              key={entry.id}
              className={cn(
                "bg-surface-container rounded-xl p-6 transition-all hover:bg-surface-container-high",
                isYou && "ring-2 ring-primary/30 bg-surface-container-high"
              )}
            >
              <div className="flex items-center gap-4">
                {/* Rank */}
                <div className="w-12 flex items-center justify-center flex-shrink-0">
                  {getRankIcon(entry.rank)}
                </div>

                {/* Avatar */}
                <div className="w-12 h-12 rounded-full overflow-hidden border-2 border-outline-variant flex-shrink-0">
                  <img
                    src={entry.avatar}
                    alt={entry.name}
                    className="w-full h-full object-cover"
                    referrerPolicy="no-referrer"
                  />
                </div>

                {/* Info */}
                <div className="flex-grow">
                  <div className="flex items-center gap-2">
                    <h4 className="font-bold">{entry.name}</h4>
                    {isYou && (
                      <span className="text-xs bg-primary/20 text-primary px-2 py-0.5 rounded-full font-bold">
                        YOU
                      </span>
                    )}
                  </div>
                  <p className="text-xs text-on-surface-variant">
                    Level {entry.level} • {entry.streak} day streak 🔥
                  </p>
                </div>

                {/* Score & Trend */}
                <div className="text-right flex-shrink-0">
                  <p className={cn(
                    "text-2xl font-black font-headline",
                    entry.rank <= 3 && "text-primary"
                  )}>
                    {entry.score}
                  </p>
                  <div className={cn(
                    "flex items-center justify-end gap-1 text-xs font-bold mt-1",
                    entry.trend > 0 ? "text-secondary" : "text-tertiary"
                  )}>
                    {entry.trend > 0 ? (
                      <TrendingUp className="w-3 h-3" />
                    ) : (
                      <TrendingDown className="w-3 h-3" />
                    )}
                    {entry.trend > 0 ? '+' : ''}{entry.trend}
                  </div>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Challenge Card */}
      <GlassCard className="p-8 bg-gradient-to-br from-secondary/10 to-tertiary/10">
        <div className="flex items-start gap-4">
          <div className="w-12 h-12 rounded-full bg-secondary/20 flex items-center justify-center flex-shrink-0">
            <Trophy className="w-6 h-6 text-secondary" />
          </div>
          <div>
            <h4 className="font-bold text-lg mb-1">Weekly Challenge</h4>
            <p className="text-sm text-on-surface-variant leading-relaxed mb-4">
              Gain 50 more points to overtake Sarah Chen and claim the #1 spot!
            </p>
            <button className="bg-primary text-on-primary px-6 py-2 rounded-full text-sm font-bold hover:bg-primary-dim transition-colors">
              Accept Challenge
            </button>
          </div>
        </div>
      </GlassCard>
    </div>
  );
}

