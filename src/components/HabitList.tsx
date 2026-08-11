"use client";

import { useState } from "react";
import { Habit } from "@/types/habit";
import { getHabitStats, getCompletionData } from "@/lib/habitAnalytics";
import { toggleHabitCompletion as toggleHybridCompletion, softDeleteHabit as softDeleteHybridHabit, toggleFavorite as toggleHybridFavorite } from "@/lib/habitsHybrid";
import {
  Flame,
  Trash2,
  Calendar,
  Check,
  Circle,
  ChevronDown,
  ChevronUp,
  ChevronLeft,
  ChevronRight,
  Heart,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import StreakHeatmap from "@/components/StreakHeatmap";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

interface HabitListProps {
  habits: Habit[];
  onHabitDeleted: (habitId: string) => void;
  onHabitUpdated: (habit: Habit) => void;
  onFavoriteToggled?: (habitId: string, isFavorite: boolean) => void;
  userId?: string;
}

export default function HabitList({
  habits,
  onHabitDeleted,
  onHabitUpdated,
  onFavoriteToggled,
  userId,
}: HabitListProps) {
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [expandedHabits, setExpandedHabits] = useState<Record<string, boolean>>(
    {},
  );
  const [calendarMonths, setCalendarMonths] = useState<Record<string, Date>>(
    {},
  );
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [habitToDelete, setHabitToDelete] = useState<Habit | null>(null);
  const [favoritingId, setFavoritingId] = useState<string | null>(null);

  const toggleHabitExpansion = (habitId: string) => {
    setExpandedHabits((prev) => ({
      ...prev,
      [habitId]: !prev[habitId],
    }));
  };

  const handleToggleCompletion = async (habit: Habit) => {
    try {
      const today = new Date();
      await toggleHybridCompletion(habit.id, today, userId);

      const isCompleted = habit.completedDates.some(
        (d) => new Date(d).toDateString() === today.toDateString(),
      );
      const updatedCompletedDates = isCompleted
        ? habit.completedDates.filter(
            (d) => new Date(d).toDateString() !== today.toDateString(),
          )
        : [...habit.completedDates, today];

      onHabitUpdated({ ...habit, completedDates: updatedCompletedDates });
    } catch (error) {
      console.error("Error toggling habit completion:", error);
    }
  };

  const handleDeleteClick = (habit: Habit) => {
    setHabitToDelete(habit);
    setDeleteDialogOpen(true);
  };

  const confirmDelete = async () => {
    if (!habitToDelete) return;
    
    setDeletingId(habitToDelete.id);
    try {
      await softDeleteHybridHabit(habitToDelete.id, userId);
      // Call the parent to refresh the habit list
      onHabitDeleted(habitToDelete.id);
      setDeleteDialogOpen(false);
      setHabitToDelete(null);
    } catch (error) {
      console.error("Error deleting habit:", error);
    } finally {
      setDeletingId(null);
    }
  };

  const cancelDelete = () => {
    setDeleteDialogOpen(false);
    setHabitToDelete(null);
  };

  const handleToggleFavorite = async (habit: Habit) => {
    setFavoritingId(habit.id);
    try {
      const newFavoriteStatus = !habit.favorite;
      await toggleHybridFavorite(habit.id, newFavoriteStatus, userId);
      onHabitUpdated({ ...habit, favorite: newFavoriteStatus });
      if (onFavoriteToggled) {
        onFavoriteToggled(habit.id, newFavoriteStatus);
      }
    } catch (error) {
      console.error('Error toggling favorite:', error);
    } finally {
      setFavoritingId(null);
    }
  };

  const isCompletedToday = (habit: Habit) => {
    const today = new Date();
    return habit.completedDates.some(
      (d) => new Date(d).toDateString() === today.toDateString(),
    );
  };

  return (
    <>
    <div className="space-y-2">
      {habits.map((habit) => {
        const stats = getHabitStats(habit);
        const completedToday = isCompletedToday(habit);
        const isExpanded = expandedHabits[habit.id];
        const currentMonth = calendarMonths[habit.id] || new Date();

        const getIntensity = (completed: boolean) => {
          if (!completed) return "bg-stone-100 hover:bg-stone-200";
          return "bg-green-500 hover:bg-green-600";
        };

        const shouldTrackDate = (date: Date) => {
          const startDate = new Date(habit.startDate);
          startDate.setHours(0, 0, 0, 0);
          const checkDate = new Date(date);
          checkDate.setHours(0, 0, 0, 0);
          
          // Check if date is before start date
          if (checkDate < startDate) return false;
          
          // Check frequency
          const dayOfWeek = checkDate.getDay();
          
          switch (habit.frequency) {
            case 'daily':
              return true;
            case 'weekly':
              return true;
            case 'custom':
              return habit.customDays?.includes(dayOfWeek) || false;
            default:
              return true;
          }
        };

        const isDateCompleted = (date: Date) => {
          const dateStr = date.toDateString();
          return habit.completedDates.some(
            d => new Date(d).toDateString() === dateStr
          );
        };

        const generateCalendarGrid = () => {
          const monthStart = new Date(
            currentMonth.getFullYear(),
            currentMonth.getMonth(),
            1,
          );
          const monthEnd = new Date(
            currentMonth.getFullYear(),
            currentMonth.getMonth() + 1,
            0,
          );
          const today = new Date();

          const days: Array<{ date: Date; completed: boolean; shouldTrack: boolean } | null> = [];

          // Empty spaces before month starts
          for (let i = 0; i < monthStart.getDay(); i++) {
            days.push(null);
          }

          // Days of month
          for (let i = 1; i <= monthEnd.getDate(); i++) {
            const date = new Date(
              currentMonth.getFullYear(),
              currentMonth.getMonth(),
              i,
            );
            const shouldTrack = shouldTrackDate(date);
            const completed = shouldTrack && isDateCompleted(date);
            
            days.push({
              date,
              completed,
              shouldTrack
            });
          }

          // Empty spaces after month ends
          while (days.length % 7 !== 0) {
            days.push(null);
          }

          return days;
        };

        return (
          <div
            key={habit.id}
            className="bg-white border border-stone-200 rounded-2xl  overflow-hidden"
          >
            {/* Main habit row */}
            <div className="flex items-center gap-2 sm:gap-3 px-3 sm:px-4 py-3 hover:bg-stone-50">
              {/* Expand button */}
              <button
                onClick={() => toggleHabitExpansion(habit.id)}
                className="flex-shrink-0 p-1 hover:bg-stone-200 rounded-2xl"
              >
                {isExpanded ? (
                  <ChevronUp className="w-4 h-4 text-stone-400" />
                ) : (
                  <ChevronDown className="w-4 h-4 text-stone-400" />
                )}
              </button>

              {/* Checkbox */}
              <button
                onClick={() => handleToggleCompletion(habit)}
                className="flex-shrink-0 w-5 h-5 rounded border border-stone-300 hover:border-stone-400 flex items-center justify-center transition-colors"
              >
                {completedToday ? (
                  <Check className="w-3.5 h-3.5 text-stone-700" />
                ) : (
                  <Circle className="w-3.5 h-3.5 text-transparent" />
                )}
              </button>

              {/* Habit Info */}
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  <span
                    className={`text-sm font-medium ${completedToday ? "line-through text-stone-400" : "text-stone-700"}`}
                  >
                    {habit.title}
                  </span>
                  {habit.description && (
                    <span className="text-xs text-stone-400 truncate hidden sm:inline">
                      {habit.description}
                    </span>
                  )}
                </div>

                {/* Meta info */}
                <div className="flex items-center gap-3 sm:gap-4 mt-1">
                  <div className={`flex items-center gap-1 text-xs ${completedToday ? 'text-red-400 font-bold' : 'text-stone-400'}`}>
                    <Flame className={`w-3 h-3 ${completedToday ? 'fill-red-400 text-red-400' : ''}`} />
                    <span className="hidden sm:inline">
                      {stats.currentStreak} day streak
                    </span>
                    <span className="sm:hidden">{stats.currentStreak}</span>
                  </div>
                  <div className="flex items-center gap-1 text-xs text-stone-400">
                    <Calendar className="w-3 h-3" />
                    <span className="hidden sm:inline">
                      {stats.completionRate}% this week
                    </span>
                    <span className="sm:hidden">{stats.completionRate}%</span>
                  </div>
                </div>
              </div>

              {/* Actions */}
              <div className="flex items-center gap-1">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => handleToggleFavorite(habit)}
                  disabled={favoritingId === habit.id}
                  className={`h-7 w-7 p-0 ${habit.favorite ? 'text-red-500 hover:text-red-600' : 'text-stone-400 hover:text-red-500'}`}
                >
                  <Heart className={`w-4 h-4 ${habit.favorite ? 'fill-red-500' : ''}`} />
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => handleDeleteClick(habit)}
                  disabled={deletingId === habit.id}
                  className="h-7 w-7 p-0 text-stone-400 hover:text-red-500"
                >
                  <Trash2 className="w-4 h-4" />
                </Button>
              </div>
            </div>

            {/* Calendar Section */}
            {isExpanded && (
              <div className="border-t border-stone-200 p-3 sm:p-4 bg-stone-50">
                <h4 className="text-xs font-medium text-stone-500 mb-3 uppercase tracking-wide">
                  Contribution Activity
                </h4>
                <StreakHeatmap habit={habit} days={90} />
              </div>
            )}
          </div>
        );
      })}
    </div>

    {/* Delete Confirmation Dialog */}
    <Dialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Move to Trash</DialogTitle>
          <DialogDescription>
            Are you sure you want to move "{habitToDelete?.title}" to the trash? You can restore it later from the trash page.
          </DialogDescription>
        </DialogHeader>
        <DialogFooter>
          <Button variant="ghost" onClick={cancelDelete}>
            Cancel
          </Button>
          <Button 
            variant="destructive" 
            onClick={confirmDelete}
            disabled={deletingId !== null}
          >
            {deletingId ? "Moving..." : "Move to Trash"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  </>
  );
}
