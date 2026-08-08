"use client";

import { useState } from "react";
import { Habit } from "@/types/habit";
import { getHabitStats, getCompletionData } from "@/lib/habitAnalytics";
import { toggleHabitCompletion, softDeleteHabit } from "@/lib/firebase/habits";
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
} from "lucide-react";
import { Button } from "@/components/ui/button";
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
}

export default function HabitList({
  habits,
  onHabitDeleted,
  onHabitUpdated,
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

  const toggleHabitExpansion = (habitId: string) => {
    setExpandedHabits((prev) => ({
      ...prev,
      [habitId]: !prev[habitId],
    }));
  };

  const handleToggleCompletion = async (habit: Habit) => {
    try {
      const today = new Date();
      await toggleHabitCompletion(habit.id, today);

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
      await softDeleteHabit(habitToDelete.id);
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
            className="bg-white border border-stone-200 rounded-sm overflow-hidden"
          >
            {/* Main habit row */}
            <div className="flex items-center gap-2 sm:gap-3 px-3 sm:px-4 py-3 hover:bg-stone-50">
              {/* Expand button */}
              <button
                onClick={() => toggleHabitExpansion(habit.id)}
                className="flex-shrink-0 p-1 hover:bg-stone-200 rounded"
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
                  <div className="flex items-center gap-1 text-xs text-stone-400">
                    <Flame className="w-3 h-3" />
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
                <div className="max-w-44">
                  {/* Month Header */}
                  <div className="flex items-center justify-between mb-4">
                    <button
                      onClick={() =>
                        setCalendarMonths((prev) => ({
                          ...prev,
                          [habit.id]: new Date(
                            currentMonth.getFullYear(),
                            currentMonth.getMonth() - 1,
                            1,
                          ),
                        }))
                      }
                      className="p-1 hover:bg-stone-200 rounded"
                    >
                      <ChevronLeft className="w-4 h-4 text-stone-400" />
                    </button>
                    <span className="text-sm font-medium text-stone-700">
                      {currentMonth.toLocaleString("default", {
                        month: "long",
                        year: "numeric",
                      })}
                    </span>
                    <button
                      onClick={() =>
                        setCalendarMonths((prev) => ({
                          ...prev,
                          [habit.id]: new Date(
                            currentMonth.getFullYear(),
                            currentMonth.getMonth() + 1,
                            1,
                          ),
                        }))
                      }
                      className="p-1 hover:bg-stone-200 rounded"
                    >
                      <ChevronRight className="w-4 h-4 text-stone-400" />
                    </button>
                  </div>

                  {/* Weekday headers */}
                  <div className="grid grid-cols-7 gap-1 mb-2">
                    {["S", "M", "T", "W", "T", "F", "S"].map((day, index) => (
                      <div
                        key={index}
                        className="text-xs text-center text-stone-400 font-medium"
                      >
                        {day}
                      </div>
                    ))}
                  </div>

                  {/* Calendar grid */}
                  <div className="grid grid-cols-7 gap-1">
                    {generateCalendarGrid().map((day, index) => {
                      if (!day) {
                        return <div key={index} className="aspect-square" />;
                      }

                      const today = new Date();
                      const isToday =
                        day.date.toDateString() === today.toDateString();
                      const isCompleted = day.completed;
                      const shouldTrack = day.shouldTrack;

                      // Don't track days before start date or not in custom schedule
                      if (!shouldTrack) {
                        return (
                          <div
                            key={index}
                            className="aspect-square rounded-sm flex items-center justify-center text-xs font-medium text-stone-300"
                          >
                            {day.date.getDate()}
                          </div>
                        );
                      }

                      return (
                        <div
                          key={index}
                          className={`
                            aspect-square rounded-sm flex items-center justify-center text-xs font-medium cursor-pointer transition-all
                            ${isToday ? "ring-2 ring-blue-500 ring-offset-1" : ""}
                            ${isCompleted ? getIntensity(true) : getIntensity(false)}
                            ${isCompleted ? "text-white" : "text-stone-600"}
                          `}
                          title={day.date.toLocaleDateString()}
                        >
                          {day.date.getDate()}
                        </div>
                      );
                    })}
                  </div>
                </div>
                {/* Legend */}
                <div className="flex items-center justify-start gap-4 mt-4 text-xs text-stone-400">
                  <div className="flex items-center gap-1">
                    <div className="w-4 h-4 rounded-sm bg-stone-100" />
                    <span>Not completed</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <div className="w-4 h-4 rounded-sm bg-green-500" />
                    <span>Completed</span>
                  </div>
                </div>
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
