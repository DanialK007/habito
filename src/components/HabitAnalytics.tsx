'use client';

import { Habit } from '@/types/habit';
import { getHabitStats } from '@/lib/habitAnalytics';
import { Flame, Target, TrendingUp } from 'lucide-react';

interface HabitAnalyticsProps {
  habits: Habit[];
}

export default function HabitAnalytics({ habits }: HabitAnalyticsProps) {
  const totalStats = habits.reduce(
    (acc, habit) => {
      const stats = getHabitStats(habit);
      return {
        currentStreak: acc.currentStreak + stats.currentStreak,
        longestStreak: acc.longestStreak + stats.longestStreak,
        completionRate: acc.completionRate + stats.completionRate,
        totalCompletions: acc.totalCompletions + stats.totalCompletions,
      };
    },
    { currentStreak: 0, longestStreak: 0, completionRate: 0, totalCompletions: 0 }
  );

  const averageCompletionRate = habits.length > 0 
    ? Math.round(totalStats.completionRate / habits.length) 
    : 0;

  return (
    <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 sm:gap-4 mb-6 sm:mb-8">
      <div className="bg-white p-3 sm:p-4 rounded border border-stone-200">
        <div className="flex items-center gap-2 mb-2">
          <Flame className="w-4 h-4 text-orange-500" />
          <span className="text-xs font-medium text-stone-500 uppercase tracking-wide">Current Streak</span>
        </div>
        <div className="text-xl sm:text-2xl font-semibold text-stone-900">{totalStats.currentStreak}</div>
        <p className="text-xs text-stone-400">Total active streak days</p>
      </div>

      <div className="bg-white p-3 sm:p-4 rounded border border-stone-200">
        <div className="flex items-center gap-2 mb-2">
          <Target className="w-4 h-4 text-green-500" />
          <span className="text-xs font-medium text-stone-500 uppercase tracking-wide">Completion Rate</span>
        </div>
        <div className="text-xl sm:text-2xl font-semibold text-stone-900">{averageCompletionRate}%</div>
        <p className="text-xs text-stone-400">Average this week</p>
      </div>

      <div className="bg-white p-3 sm:p-4 rounded border border-stone-200">
        <div className="flex items-center gap-2 mb-2">
          <TrendingUp className="w-4 h-4 text-blue-500" />
          <span className="text-xs font-medium text-stone-500 uppercase tracking-wide">Total Completions</span>
        </div>
        <div className="text-xl sm:text-2xl font-semibold text-stone-900">{totalStats.totalCompletions}</div>
        <p className="text-xs text-stone-400">All time completions</p>
      </div>
    </div>
  );
}
