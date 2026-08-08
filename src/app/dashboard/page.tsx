'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import { Habit } from '@/types/habit';
import { getUserHabits } from '@/lib/firebase/habits';
import { getHabitStats } from '@/lib/habitAnalytics';
import Sidebar from '@/components/Sidebar';
import { Button } from '@/components/ui/button';
import { Flame, Target, TrendingUp, Plus, Check } from 'lucide-react';

export default function Dashboard() {
  const { user, loading } = useAuth();
  const router = useRouter();
  const [habits, setHabits] = useState<Habit[]>([]);
  const [loadingHabits, setLoadingHabits] = useState(true);

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
    }).slice(0, 3);
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

  return (
    <div className="flex min-h-screen bg-stone-50">
      <Sidebar />
      
      <main className="flex-1 pt-16 lg:pt-0">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          {/* Welcome Section */}
          <div className="mb-8">
            <h1 className="text-3xl sm:text-4xl font-bold text-stone-900 mb-2">
              Welcome back
            </h1>
            <p className="text-stone-600">
              {new Date().toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' })}
            </p>
          </div>

          {/* Stats Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-8">
            <div className="bg-white border border-stone-200 rounded-lg p-6">
              <div className="flex items-center justify-between mb-2">
                <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center">
                  <Check className="w-5 h-5 text-green-600" />
                </div>
                <span className="text-2xl font-bold text-stone-900">
                  {todayCompletion.rate}%
                </span>
              </div>
              <p className="text-sm text-stone-600">Today's completion</p>
              <p className="text-xs text-stone-400 mt-1">
                {todayCompletion.completed} of {todayCompletion.total} habits
              </p>
            </div>

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
          </div>

          {/* Today's Habits */}
          <div className="bg-white border border-stone-200 rounded-lg p-6 mb-8">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-semibold text-stone-900">
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

            {todayHabits.length === 0 && habits.length > 0 ? (
              <div className="text-center py-8">
                <div className="inline-flex items-center justify-center w-12 h-12 bg-green-100 rounded-full mb-3">
                  <Check className="w-6 h-6 text-green-600" />
                </div>
                <p className="text-stone-600 font-medium mb-1">All caught up!</p>
                <p className="text-sm text-stone-400">You've completed all your habits for today</p>
              </div>
            ) : habits.length === 0 ? (
              <div className="text-center py-8">
                <div className="inline-flex items-center justify-center w-12 h-12 bg-stone-100 rounded-full mb-3">
                  <Target className="w-6 h-6 text-stone-400" />
                </div>
                <p className="text-stone-600 font-medium mb-1">No habits yet</p>
                <p className="text-sm text-stone-400 mb-4">Start building better habits today</p>
                <Button onClick={() => router.push('/habits')} size="sm">
                  <Plus className="w-4 h-4 mr-2" />
                  Add your first habit
                </Button>
              </div>
            ) : (
              <div className="space-y-3">
                {todayHabits.map(habit => {
                  const stats = getHabitStats(habit);
                  return (
                    <div 
                      key={habit.id}
                      className="flex items-center justify-between p-3 bg-stone-50 rounded-lg hover:bg-stone-100 transition-colors cursor-pointer"
                      onClick={() => router.push('/habits')}
                    >
                      <div className="flex-1">
                        <h3 className="text-sm font-medium text-stone-900">{habit.title}</h3>
                        <p className="text-xs text-stone-400 mt-1">
                          {stats.currentStreak} day streak
                        </p>
                      </div>
                      <div className="w-6 h-6 rounded-full border-2 border-stone-300 flex items-center justify-center">
                        <div className="w-3 h-3 rounded-full bg-stone-200" />
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          {/* Quick Actions */}
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
        </div>
      </main>
    </div>
  );
}
