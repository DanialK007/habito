'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import { Habit } from '@/types/habit';
import { getUserHabits, toggleHabitCompletion } from '@/lib/firebase/habits';
import { getHabitStats } from '@/lib/habitAnalytics';
import Sidebar from '@/components/Sidebar';
import { Button } from '@/components/ui/button';
import { Flame, Target, TrendingUp, Plus, Check, Circle, ChevronDown, ChevronUp } from 'lucide-react';
import StreakHeatmap from '@/components/StreakHeatmap';

export default function Dashboard() {
  const { user, loading } = useAuth();
  const router = useRouter();
  const [habits, setHabits] = useState<Habit[]>([]);
  const [loadingHabits, setLoadingHabits] = useState(true);
  const [expandedHabit, setExpandedHabit] = useState<string | null>(null);

  useEffect(() => {
    if (!loading && !user) {
      router.push('/');
    }
  }, [user, loading, router]);

  useEffect(() => {
    const fetchHabits = async () => {
      if (user) {
        try {
          const userHabits = await getUserHabits(user.uid);
          setHabits(userHabits);
        } catch (error) {
          console.error('Error fetching habits:', error);
        } finally {
          setLoadingHabits(false);
        }
      }
    };

    fetchHabits();
  }, [user]);

  const getTodayCompletion = () => {
    const today = new Date();
    const completedToday = habits.filter(habit => 
      habit.completedDates.some(d => new Date(d).toDateString() === today.toDateString())
    );
    return {
      completed: completedToday.length,
      total: habits.length,
      rate: habits.length > 0 ? Math.round((completedToday.length / habits.length) * 100) : 0
    };
  };

  const getTotalStreaks = () => {
    return habits.reduce((total, habit) => {
      const stats = getHabitStats(habit);
      return total + stats.currentStreak;
    }, 0);
  };

  const getLongestStreak = () => {
    if (habits.length === 0) return 0;
    return Math.max(...habits.map(habit => getHabitStats(habit).longestStreak));
  };

  const getTodayHabits = () => {
    const today = new Date();
    return habits.filter(habit => {
      const isCompleted = habit.completedDates.some(d => new Date(d).toDateString() === today.toDateString());
      return !isCompleted;
    });
  };

  const handleToggleCompletion = async (habit: Habit) => {
    try {
      const today = new Date();
      await toggleHabitCompletion(habit.id, today);
      
      const isCompleted = habit.completedDates.some(
        d => new Date(d).toDateString() === today.toDateString()
      );
      const updatedCompletedDates = isCompleted
        ? habit.completedDates.filter(d => new Date(d).toDateString() !== today.toDateString())
        : [...habit.completedDates, today];
      
      setHabits(habits.map(h => h.id === habit.id ? { ...habit, completedDates: updatedCompletedDates } : h));
    } catch (error) {
      console.error('Error toggling habit completion:', error);
    }
  };

  const isCompletedToday = (habit: Habit) => {
    const today = new Date();
    return habit.completedDates.some(
      d => new Date(d).toDateString() === today.toDateString()
    );
  };

  if (loading || loadingHabits) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-stone-50">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-stone-400"></div>
      </div>
    );
  }

  const todayCompletion = getTodayCompletion();
  const totalStreaks = getTotalStreaks();
  const longestStreak = getLongestStreak();
  const todayHabits = getTodayHabits();
  const allCompletedToday = todayCompletion.completed === todayCompletion.total && todayCompletion.total > 0;

  return (
    <div className="flex min-h-screen bg-stone-50">
      <Sidebar />
      
      <main className="flex-1 pt-16 lg:pt-0">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          {/* Welcome Section */}
          <div className="mb-8">
            <h1 className="text-3xl sm:text-4xl font-bold text-stone-900 mb-2">
              {allCompletedToday ? "🎉 Amazing work!" : "Let's build great habits!"}
            </h1>
            <p className="text-stone-600">
              {new Date().toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' })}
            </p>
          </div>

          {/* Main Progress Section */}
          <div className="bg-white border border-stone-200 rounded-lg p-6 sm:p-8 mb-8">
            <div className="flex flex-col sm:flex-row items-center justify-between gap-6">
              <div className="flex-1">
                <h2 className="text-2xl sm:text-3xl font-bold text-stone-900 mb-2">
                  {allCompletedToday ? "All done for today!" : `${todayCompletion.completed} of ${todayCompletion.total} habits completed`}
                </h2>
                <p className="text-stone-600">
                  {allCompletedToday 
                    ? "You're crushing it! Keep up the amazing work tomorrow." 
                    : "You're making progress. Complete the rest to build your streak!"}
                </p>
              </div>
              
              <div className="flex-shrink-0">
                <div className={`w-16 h-16 sm:w-20 sm:h-20 rounded-full flex items-center justify-center ${allCompletedToday ? 'bg-green-500' : 'bg-stone-200'} transition-all`}>
                  <Check className="w-8 h-8 sm:w-10 sm:h-10 text-white" />
                </div>
              </div>
            </div>

            {/* Progress Bar */}
            <div className="mt-6">
              <div className="h-3 bg-stone-200 rounded-full overflow-hidden">
                <div 
                  className="h-full bg-green-500 transition-all duration-500"
                  style={{ width: `${todayCompletion.rate}%` }}
                />
              </div>
              <div className="flex justify-between mt-2 text-sm text-stone-500">
                <span>{todayCompletion.rate}% complete</span>
                <span>{todayCompletion.completed}/{todayCompletion.total} habits</span>
              </div>
            </div>
          </div>

          {/* Today's Habits with Quick Actions */}
          {habits.length > 0 && (
            <div className="bg-white border border-stone-200 rounded-lg p-6 mb-8">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-semibold text-stone-900">
                  Today's Habits
                </h2>
                <Button 
                  variant="ghost" 
                  size="sm" 
                  onClick={() => router.push('/habits')}
                  className="text-stone-600"
                >
                  View all
                </Button>
              </div>

              <div className="space-y-3">
                {habits.map(habit => {
                  const stats = getHabitStats(habit);
                  const completed = isCompletedToday(habit);
                  const isExpanded = expandedHabit === habit.id;
                  
                  return (
                    <div 
                      key={habit.id}
                      className="border border-stone-200 rounded-lg overflow-hidden"
                    >
                      <div className="flex items-center gap-3 p-4 bg-stone-50 hover:bg-stone-100 transition-colors">
                        {/* Big Check Button */}
                        <button
                          onClick={() => handleToggleCompletion(habit)}
                          className={`flex-shrink-0 w-10 h-10 sm:w-12 sm:h-12 rounded-full flex items-center justify-center transition-all ${
                            completed 
                              ? 'bg-green-500 hover:bg-green-600' 
                              : 'bg-white border-2 border-stone-300 hover:border-green-500'
                          }`}
                        >
                          {completed ? (
                            <Check className="w-5 h-5 sm:w-6 sm:h-6 text-white" />
                          ) : (
                            <Circle className="w-5 h-5 sm:w-6 sm:h-6 text-stone-300" />
                          )}
                        </button>

                        {/* Habit Info */}
                        <div className="flex-1 min-w-0">
                          <h3 className={`text-base sm:text-lg font-medium ${completed ? 'line-through text-stone-400' : 'text-stone-900'}`}>
                            {habit.title}
                          </h3>
                          <div className="flex items-center gap-3 mt-1">
                            <div className={`flex items-center gap-1 text-xs ${completed ? 'text-red-600 font-bold' : 'text-stone-400'}`}>
                              <Flame className={`w-3 h-3 ${completed ? 'fill-red-600 text-red-600' : ''}`} />
                              <span>{stats.currentStreak} day streak</span>
                            </div>
                          </div>
                        </div>

                        {/* Expand Button */}
                        <button
                          onClick={() => setExpandedHabit(isExpanded ? null : habit.id)}
                          className="flex-shrink-0 p-2 hover:bg-stone-200 rounded"
                        >
                          {isExpanded ? (
                            <ChevronUp className="w-4 h-4 text-stone-400" />
                          ) : (
                            <ChevronDown className="w-4 h-4 text-stone-400" />
                          )}
                        </button>
                      </div>

                      {/* Expanded Heatmap */}
                      {isExpanded && (
                        <div className="border-t border-stone-200 p-4 bg-white">
                          <h4 className="text-xs font-medium text-stone-500 mb-3 uppercase tracking-wide">
                            Last 90 Days
                          </h4>
                          <StreakHeatmap habit={habit} days={90} />
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* Stats Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-8">
            <div className="bg-white border border-stone-200 rounded-lg p-6">
              <div className="flex items-center justify-between mb-2">
                <div className="w-10 h-10 bg-orange-100 rounded-lg flex items-center justify-center">
                  <Flame className="w-5 h-5 text-orange-600" />
                </div>
                <span className="text-2xl font-bold text-stone-900">
                  {totalStreaks}
                </span>
              </div>
              <p className="text-sm text-stone-600">Current streaks</p>
              <p className="text-xs text-stone-400 mt-1">
                Across all habits
              </p>
            </div>

            <div className="bg-white border border-stone-200 rounded-lg p-6">
              <div className="flex items-center justify-between mb-2">
                <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                  <TrendingUp className="w-5 h-5 text-blue-600" />
                </div>
                <span className="text-2xl font-bold text-stone-900">
                  {longestStreak}
                </span>
              </div>
              <p className="text-sm text-stone-600">Longest streak</p>
              <p className="text-xs text-stone-400 mt-1">
                Best performance
              </p>
            </div>

            <div className="bg-white border border-stone-200 rounded-lg p-6">
              <div className="flex items-center justify-between mb-2">
                <div className="w-10 h-10 bg-purple-100 rounded-lg flex items-center justify-center">
                  <Target className="w-5 h-5 text-purple-600" />
                </div>
                <span className="text-2xl font-bold text-stone-900">
                  {habits.length}
                </span>
              </div>
              <p className="text-sm text-stone-600">Total habits</p>
              <p className="text-xs text-stone-400 mt-1">
                Being tracked
              </p>
            </div>
          </div>

          {/* Empty State */}
          {habits.length === 0 && (
            <div className="text-center py-12 sm:py-16 bg-white border border-stone-200 rounded-lg">
              <div className="inline-flex items-center justify-center w-16 h-16 bg-stone-100 rounded-full mb-4">
                <Target className="w-8 h-8 text-stone-400" />
              </div>
              <h3 className="text-xl font-semibold text-stone-900 mb-2">
                Start your journey today
              </h3>
              <p className="text-stone-600 mb-6">
                Build better habits, one day at a time. Your future self will thank you!
              </p>
              <Button onClick={() => router.push('/habits')} size="lg">
                <Plus className="w-5 h-5 mr-2" />
                Create Your First Habit
              </Button>
            </div>
          )}

          {/* Quick Actions */}
          {habits.length > 0 && (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <Button 
                onClick={() => router.push('/habits')}
                className="h-12 text-base"
              >
                <Plus className="w-5 h-5 mr-2" />
                Add New Habit
              </Button>
              <Button 
                variant="outline"
                onClick={() => router.push('/habits')}
                className="h-12 text-base"
              >
                <Target className="w-5 h-5 mr-2" />
                View All Habits
              </Button>
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
