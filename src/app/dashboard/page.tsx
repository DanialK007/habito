"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/context/AuthContext";
import { Habit } from "@/types/habit";
import {
  getHabits as getHybridHabits,
  toggleHabitCompletion as toggleHybridCompletion,
} from "@/lib/habitsHybrid";
import { getHabitStats } from "@/lib/habitAnalytics";
import { Button } from "@/components/ui/button";
import {
  Flame,
  Target,
  TrendingUp,
  Plus,
  Check,
  Circle,
  ChevronDown,
  ChevronUp,
} from "lucide-react";
import StreakHeatmap from "@/components/StreakHeatmap";

export default function Dashboard() {
  const { user, loading, isFirebaseUser } = useAuth();
  const router = useRouter();
  const [habits, setHabits] = useState<Habit[]>([]);
  const [loadingHabits, setLoadingHabits] = useState(true);
  const [expandedHabit, setExpandedHabit] = useState<string | null>(null);

  useEffect(() => {
    // Allow access even without authentication for offline support
    if (!loading) {
      fetchHabits();
    }
  }, [loading]);

  const fetchHabits = async () => {
    try {
      const userId = isFirebaseUser && user ? (user as any).uid : undefined;
      const userHabits = await getHybridHabits(userId);
      // Filter out any undefined/null habits
      setHabits(userHabits.filter((habit) => habit && habit.id));
    } catch (error) {
      console.error("Error fetching habits:", error);
    } finally {
      setLoadingHabits(false);
    }
  };

  const getTodayCompletion = () => {
    const today = new Date();
    const completedToday = habits.filter(
      (habit) =>
        habit &&
        habit.completedDates &&
        habit.completedDates.some(
          (d) => new Date(d).toDateString() === today.toDateString(),
        ),
    );
    return {
      completed: completedToday.length,
      total: habits.length,
      rate:
        habits.length > 0
          ? Math.round((completedToday.length / habits.length) * 100)
          : 0,
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
    return Math.max(
      ...habits.map((habit) => getHabitStats(habit).longestStreak),
    );
  };

  const getTodayHabits = () => {
    const today = new Date();
    return habits.filter((habit) => {
      if (!habit || !habit.completedDates) return true; // If no habit or no completedDates, show as incomplete
      const isCompleted = habit.completedDates.some(
        (d) => new Date(d).toDateString() === today.toDateString(),
      );
      return true; // Show all habits, not just incomplete ones
    });
  };

  const handleToggleCompletion = async (habit: Habit) => {
    try {
      const today = new Date();
      const userId = isFirebaseUser && user ? (user as any).uid : undefined;
      const updatedHabit = await toggleHybridCompletion(
        habit.id,
        today,
        userId,
      );
      console.log("Updated habit:", updatedHabit);
      console.log("Current habits:", habits);
      setHabits(habits.map((h) => (h.id === habit.id ? updatedHabit : h)));
    } catch (error) {
      console.error("Error toggling habit completion:", error);
    }
  };

  const isCompletedToday = (habit: Habit) => {
    const today = new Date();
    return (
      habit &&
      habit.completedDates &&
      habit.completedDates.some(
        (d) => new Date(d).toDateString() === today.toDateString(),
      )
    );
  };

  if (loading || loadingHabits) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-400"></div>
      </div>
    );
  }

  const todayCompletion = getTodayCompletion();
  const totalStreaks = getTotalStreaks();
  const longestStreak = getLongestStreak();
  const todayHabits = getTodayHabits();
  const allCompletedToday =
    todayCompletion.completed === todayCompletion.total &&
    todayCompletion.total > 0;

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 md:px-8 py-8">
      {/* Page Header */}
      <div className="mb-6 sm:mb-8">
        <div className="flex items-center gap-2 text-gray-500 text-xs sm:text-sm mb-2">
          <Flame className="w-3 h-3 sm:w-4 sm:h-4" />
          <span>Dashboard</span>
        </div>
        <h1 className="text-2xl sm:text-3xl md:text-4xl font-bold text-gray-900 mb-2">
          {allCompletedToday
            ? "🎉 Amazing work!"
            : "Let's build great habits!"}
        </h1>
        <p className="text-sm sm:text-base text-gray-500">
          {new Date().toLocaleDateString("en-US", {
            weekday: "long",
            month: "long",
            day: "numeric",
          })}
        </p>
      </div>

      {/* Stats Grid - Move to top */}
      <div className="grid grid-cols-3 gap-3 sm:gap-4 mb-6">
        <div className="bg-gray-50 border border-gray-200 rounded-2xl p-3 sm:p-4">
          <div className="flex items-center justify-between mb-2">
            <div className="w-8 h-8 sm:w-10 sm:h-10 bg-orange-100 rounded-2xl flex items-center justify-center">
              <Flame className="w-4 h-4 sm:w-5 sm:h-5 text-orange-600" />
            </div>
            <span className="text-lg sm:text-2xl font-bold text-gray-900">
              {totalStreaks}
            </span>
          </div>
          <p className="text-xs sm:text-sm text-gray-500">Current streaks</p>
        </div>

        <div className="bg-gray-50 border border-gray-200 rounded-2xl p-3 sm:p-4">
          <div className="flex items-center justify-between mb-2">
            <div className="w-8 h-8 sm:w-10 sm:h-10 bg-blue-100 rounded-2xl flex items-center justify-center">
              <TrendingUp className="w-4 h-4 sm:w-5 sm:h-5 text-blue-600" />
            </div>
            <span className="text-lg sm:text-2xl font-bold text-gray-900">
              {longestStreak}
            </span>
          </div>
          <p className="text-xs sm:text-sm text-gray-500">Longest streak</p>
        </div>

        <div className="bg-gray-50 border border-gray-200 rounded-2xl p-3 sm:p-4">
          <div className="flex items-center justify-between mb-2">
            <div className="w-8 h-8 sm:w-10 sm:h-10 bg-gray-900/10 rounded-2xl flex items-center justify-center">
              <Target className="w-4 h-4 sm:w-5 sm:h-5 text-gray-900" />
            </div>
            <span className="text-lg sm:text-2xl font-bold text-gray-900">
              {habits.length}
            </span>
          </div>
          <p className="text-xs sm:text-sm text-gray-500">Total habits</p>
        </div>
      </div>

      {/* Main Progress Section */}
      {habits.length > 0 ? (
        <div className="bg-white border border-gray-200 rounded-3xl p-4 sm:p-6 mb-6">
          <div className="flex items-center justify-between gap-4">
            <div className="flex-1">
              <h2 className="text-xl sm:text-2xl font-bold text-gray-900 mb-1">
                {allCompletedToday
                  ? "All done for today! 🎉"
                  : `${todayCompletion.completed} of ${todayCompletion.total} habits`}
              </h2>
              <p className="text-sm text-gray-500">
                {allCompletedToday
                  ? "You're crushing it!"
                  : "Keep up the great work!"}
              </p>
            </div>

            <div className="flex-shrink-0">
              <div
                className={`w-12 h-12 sm:w-14 sm:h-14 rounded-full flex items-center justify-center transition-all ${allCompletedToday ? "bg-orange-500 shadow-lg shadow-orange-500/20" : "bg-gray-600 border border-gray-200"}`}
              >
                <Check className="w-6 h-6 sm:w-7 sm:h-7 text-white" />
              </div>
            </div>
          </div>

          {/* Progress Bar */}
          <div className="mt-4">
            <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
              <div
                className="h-full bg-gray-900 transition-all duration-500 rounded-full"
                style={{ width: `${todayCompletion.rate}%` }}
              />
            </div>
            <div className="flex justify-between mt-2 text-xs sm:text-sm text-gray-500">
              <span>{todayCompletion.rate}% complete</span>
              <span>
                {todayCompletion.completed}/{todayCompletion.total}
              </span>
            </div>
          </div>
        </div>
      ) : (
        <div className="bg-white border border-gray-200 rounded-3xl p-6 sm:p-8 mb-6 text-center">
          <div className="flex flex-col items-center justify-center gap-4">
            <div className="w-16 h-16 rounded-full bg-gray-50 flex items-center justify-center">
              <Plus className="w-8 h-8 text-gray-400" />
            </div>
            <div>
              <h2 className="text-xl sm:text-2xl font-bold text-gray-900 mb-1">
                No habits yet
              </h2>
              <p className="text-sm text-gray-500">
                Create your first habit to start building your streak!
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Today's Habits with Quick Actions */}
      {habits.length > 0 && (
        <div className="bg-white border border-gray-200 rounded-3xl p-4 sm:p-6 mb-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg sm:text-xl font-semibold text-gray-900">
              Today's Habits
            </h2>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => router.push("/habits")}
              className="text-gray-500 hover:text-gray-900 rounded-xl"
            >
              View all
            </Button>
          </div>

          <div className="space-y-2 sm:space-y-3">
            {habits
              .filter((habit) => habit && habit.id)
              .map((habit) => {
                const stats = getHabitStats(habit);
                const completed = isCompletedToday(habit);
                const isExpanded = expandedHabit === habit.id;

                return (
                  <div
                    key={habit.id}
                    className="border border-gray-200 rounded-2xl overflow-hidden hover:border-gray-300 transition-colors"
                  >
                    <div className="flex items-center gap-3 p-3 sm:p-4 bg-gray-50">
                      {/* Check Button */}
                      <button
                        onClick={() => handleToggleCompletion(habit)}
                        className={`flex-shrink-0 w-10 h-10 sm:w-12 sm:h-12 rounded-full flex items-center justify-center transition-all ${
                          completed
                            ? "bg-gray-900 shadow-lg shadow-gray-900/20"
                            : "bg-white border-2 border-gray-200 hover:border-gray-400"
                        }`}
                      >
                        {completed ? (
                          <Check className="w-5 h-5 sm:w-6 sm:h-6 text-white" />
                        ) : (
                          <Circle className="w-5 h-5 sm:w-6 sm:h-6 text-gray-400" />
                        )}
                      </button>

                      {/* Habit Info */}
                      <div className="flex-1 min-w-0">
                        <h3
                          className={`text-base sm:text-lg font-medium ${completed ? "line-through text-gray-400" : "text-gray-900"}`}
                        >
                          {habit.title}
                        </h3>
                        <div className="flex items-center gap-2 mt-1">
                          <div
                            className={`flex items-center gap-1 text-xs ${completed ? "text-orange-500 font-semibold" : "text-gray-400"}`}
                          >
                            <Flame
                              className={`w-3 h-3 ${completed ? "fill-orange-500 text-orange-500" : ""}`}
                            />
                            <span>{stats.currentStreak} day streak</span>
                          </div>
                        </div>
                      </div>

                      {/* Expand Button */}
                      <button
                        onClick={() =>
                          setExpandedHabit(isExpanded ? null : habit.id)
                        }
                        className="flex-shrink-0 p-2 hover:bg-white rounded-xl transition-colors"
                      >
                        {isExpanded ? (
                          <ChevronUp className="w-4 h-4 text-gray-400" />
                        ) : (
                          <ChevronDown className="w-4 h-4 text-gray-400" />
                        )}
                      </button>
                    </div>

                    {/* Expanded Heatmap */}
                    {isExpanded && (
                      <div className="border-t border-gray-200 p-3 sm:p-4 bg-white">
                        <h4 className="text-xs font-medium text-gray-500 mb-3 uppercase tracking-wide">
                          Last 120 Days
                        </h4>
                        <StreakHeatmap habit={habit} days={120} />
                      </div>
                    )}
                  </div>
                );
              })}
          </div>
        </div>
      )}

      {/* Quick Actions */}
      {habits.length > 0 && (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4 mb-4">
          <Button
            onClick={() => router.push("/habits")}
            className="h-12 text-base rounded-full"
          >
            <Plus className="w-5 h-5 mr-2" />
            Add New Habit
          </Button>
          <Button
            variant="outline"
            onClick={() => router.push("/habits")}
            className="h-12 text-base rounded-full"
          >
            <Target className="w-5 h-5 mr-2" />
            View All Habits
          </Button>
        </div>
      )}

      {/* Empty State */}
      {habits.length === 0 && (
        <div className="text-center py-12 sm:py-16 bg-white border border-gray-200 rounded-3xl mb-4">
          <div className="inline-flex items-center justify-center w-14 h-14 sm:w-16 sm:h-16 bg-gray-50 rounded-full mb-4">
            <Target className="w-7 h-7 sm:w-8 sm:h-8 text-gray-400" />
          </div>
          <h3 className="text-lg sm:text-xl font-semibold text-gray-900 mb-2">
            Start your journey today
          </h3>
          <p className="text-sm text-gray-500 mb-6">
            Build better habits, one day at a time.
          </p>
          <Button
            onClick={() => router.push("/habits")}
            size="lg"
          >
            <Plus className="w-5 h-5 mr-2" />
            Create Your First Habit
          </Button>
        </div>
      )}
    </div>
  );
}