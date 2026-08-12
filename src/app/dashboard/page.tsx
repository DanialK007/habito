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
import { Flame, Target, TrendingUp, Plus, Check, Circle } from "lucide-react";
import StreakHeatmap from "@/components/StreakHeatmap";

const getTailwindColorClass = (color: string) => {
  const colorMap: Record<string, string> = {
    orange: "bg-orange-500",
    blue: "bg-blue-500",
    green: "bg-green-500",
    purple: "bg-purple-500",
    red: "bg-red-500",
    yellow: "bg-yellow-500",
    pink: "bg-pink-500",
    cyan: "bg-cyan-500",
    indigo: "bg-indigo-500",
    gray: "bg-gray-500",
  };
  return colorMap[color] || colorMap.orange;
};

const getTailwindTextColorClass = (color: string) => {
  const colorMap: Record<string, string> = {
    orange: "text-orange-500",
    blue: "text-blue-500",
    green: "text-green-500",
    purple: "text-purple-500",
    red: "text-red-500",
    yellow: "text-yellow-500",
    pink: "text-pink-500",
    cyan: "text-cyan-500",
    indigo: "text-indigo-500",
    gray: "text-gray-500",
  };
  return colorMap[color] || colorMap.orange;
};

const getTailwindShadowClass = (color: string) => {
  const colorMap: Record<string, string> = {
    orange: "shadow-orange-500/20 border-orange-500/50",
    blue: "shadow-blue-500/20 border-blue-500/50",
    green: "shadow-green-500/20 border-green-500/50",
    purple: "shadow-purple-500/20 border-purple-500/50",
    red: "shadow-red-500/20 border-red-500/50",
    yellow: "shadow-yellow-500/20 border-yellow-500/50",
    pink: "shadow-pink-500/20 border-pink-500/50",
    cyan: "shadow-cyan-500/20 border-cyan-500/50",
    indigo: "shadow-indigo-500/20 border-indigo-500/50",
    gray: "shadow-gray-500/20 border-gray-500/50",
  };
  return colorMap[color] || colorMap.orange;
};

const getTailwindFadeColorClass = (color: string) => {
  const colorMap: Record<string, string> = {
    orange: "bg-orange-50",
    blue: "bg-blue-50",
    green: "bg-green-50",
    purple: "bg-purple-50",
    red: "bg-red-50",
    yellow: "bg-yellow-50",
    pink: "bg-pink-50",
    cyan: "bg-cyan-50",
    indigo: "bg-indigo-50",
    gray: "bg-gray-50",
  };
  return colorMap[color] || colorMap.orange;
};

export default function Dashboard() {
  const { user, loading, isFirebaseUser } = useAuth();
  const router = useRouter();
  const [habits, setHabits] = useState<Habit[]>([]);
  const [loadingHabits, setLoadingHabits] = useState(true);

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
      console.log(
        "Toggling completion for habit:",
        habit.id,
        "userId:",
        userId,
      );
      await toggleHybridCompletion(habit.id, today, userId);
      console.log("Toggle successful, refreshing habits from database");
      // Refresh habits from database instead of updating local array
      fetchHabits();
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
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-neutral-400"></div>
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
    <div className="max-w-5xl mx-auto px-4 sm:px-6 md:px-8 py-8">
      {/* Page Header */}
      <div className="mb-6 sm:mb-8">
        <div className="flex items-center gap-2 text-gray-500 text-xs sm:text-sm mb-2">
          <Flame className="w-3 h-3 sm:w-4 sm:h-4" />
          <span>Dashboard</span>
        </div>
        <h1 className="text-2xl sm:text-3xl md:text-4xl font-bold text-gray-900 mb-2">
          {allCompletedToday ? "🎉 Amazing work!" : "Let's build great habits!"}
        </h1>
        <p className="text-sm sm:text-base text-gray-500">
          {new Date().toLocaleDateString("en-US", {
            weekday: "long",
            month: "long",
            day: "numeric",
          })}
        </p>
      </div>

      {/* Main Progress Section */}
      {habits.length > 0 ? (
        <div className="bg-white border border-neutral-200 rounded-3xl p-4 sm:p-6 mb-6">
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
                className={`w-12 h-12 sm:w-14 sm:h-14 rounded-full flex items-center justify-center transition-all ${
                  allCompletedToday 
                    ? "bg-orange-500 shadow-lg shadow-orange-500/20" 
                    : "bg-neutral-600 border border-neutral-200"
                }`}
              >
                <Check className="w-6 h-6 sm:w-7 sm:h-7 text-white" />
              </div>
            </div>
          </div>

          {/* Progress Bar */}
          <div className="mt-4">
            <div className="h-2 bg-neutral-100 rounded-full overflow-hidden">
              <div
                className={`h-full transition-all duration-500 rounded-full ${allCompletedToday ? "bg-orange-500" : "bg-neutral-900"}`}
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
        <div className="bg-white border border-neutral-200 rounded-3xl p-6 sm:p-8 mb-6 text-center">
          <div className="flex flex-col items-center justify-center gap-4">
            <div className="w-16 h-16 rounded-full bg-neutral-50 flex items-center justify-center">
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
        <div className="md:bg-white md:border md:border-neutral-200 rounded-3xl mt-4 md:mt-0 md:p-6 mb-6">
          <div className="flex items-center justify-between mb-2">
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

          <div className="grid lg:grid-cols-2 gap-4">
            {habits
              .filter((habit) => habit && habit.id)
              .map((habit) => {
                const stats = getHabitStats(habit);
                const completed = isCompletedToday(habit);
                const bgColorClass = getTailwindColorClass(
                  habit.color || "orange",
                );
                const textColorClass = getTailwindTextColorClass(
                  habit.color || "orange",
                );
                const shadowClass = getTailwindShadowClass(
                  habit.color || "orange",
                );
                const fadeColorClass = getTailwindFadeColorClass(
                  habit.color || "orange",
                );

                return (
                  <div
                    key={habit.id}
                    className={`flex items-center justify-between bg-white shadow-md ${shadowClass} border rounded-3xl overflow-hidden`}
                  >
                    <div className="p-3 sm:p-4 grow flex flex-col text-center relative gap-5">
                      <div className="flex items-center justify-center">
                        {/* Check Button */}
                        <button
                          onClick={() => handleToggleCompletion(habit)}
                          className={`size-16 rounded-full flex items-center justify-center transition-all ${
                            completed
                              ? `${bgColorClass} shadow-lg ${shadowClass}`
                              : "bg-white border-2 border-neutral-200 hover:border-neutral-400"
                          }`}
                        >
                          {completed ? (
                            <Check className="size-8 text-white" />
                          ) : (
                            <Circle className="size-8 text-gray-400" />
                          )}
                        </button>
                      </div>

                      <div className="flex items-center justify-center">
                        {/* Habit Info */}
                        <div className="max-w-16 flex items-center justify-center flex-col">
                          <h3
                            className={`text-base sm:text-lg truncate ${
                              completed
                                ? "line-through text-gray-400"
                                : `${textColorClass} font-semibold`
                            }`}
                          >
                            {habit.title}
                          </h3>
                          <div className="flex items-center gap-2 mt-1">
                            <div
                              className={`flex items-center gap-1 truncate text-xs ${completed ? `font-semibold ${textColorClass}` : "text-gray-400"}`}
                            >
                              <Flame
                                className={`w-3 h-3 ${completed ? "fill-current" : ""}`}
                              />
                              <span>{stats.currentStreak} day streak</span>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Always Show Heatmap */}
                    <div className="p-3 sm:p-3 w-fit">
                      <h4 className="text-xs font-medium text-gray-500 mb-3 uppercase tracking-wide">
                        Last 90 Days
                      </h4>
                      <StreakHeatmap habit={habit} days={90} />
                    </div>
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

      {/* Stats Grid - Move to top */}
      <div className="grid grid-cols-3 gap-3 sm:gap-4 mt-6">
        <div className="bg-white border border-neutral-200 rounded-2xl p-3 sm:p-4">
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

        <div className="bg-white border border-neutral-200 rounded-2xl p-3 sm:p-4">
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

        <div className="bg-white border border-neutral-200 rounded-2xl p-3 sm:p-4">
          <div className="flex items-center justify-between mb-2">
            <div className="w-8 h-8 sm:w-10 sm:h-10 bg-neutral-900/10 rounded-2xl flex items-center justify-center">
              <Target className="w-4 h-4 sm:w-5 sm:h-5 text-gray-900" />
            </div>
            <span className="text-lg sm:text-2xl font-bold text-gray-900">
              {habits.length}
            </span>
          </div>
          <p className="text-xs sm:text-sm text-gray-500">Total habits</p>
        </div>
      </div>

      {/* Empty State */}
      {habits.length === 0 && (
        <div className="text-center py-12 sm:py-16 bg-white border border-neutral-200 rounded-3xl mt-6">
          <div className="inline-flex items-center justify-center w-14 h-14 sm:w-16 sm:h-16 bg-neutral-50 rounded-full mb-4">
            <Target className="w-7 h-7 sm:w-8 sm:h-8 text-gray-400" />
          </div>
          <h3 className="text-lg sm:text-xl font-semibold text-gray-900 mb-2">
            Start your journey today
          </h3>
          <p className="text-sm text-gray-500 mb-6">
            Build better habits, one day at a time.
          </p>
          <Button onClick={() => router.push("/habits")} size="lg">
            <Plus className="w-5 h-5 mr-2" />
            Create Your First Habit
          </Button>
        </div>
      )}
    </div>
  );
}
