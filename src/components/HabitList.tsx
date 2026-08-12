"use client";

import { useState } from "react";
import { Habit, HabitFormData } from "@/types/habit";
import { getHabitStats, getCompletionData } from "@/lib/habitAnalytics";
import { toggleHabitCompletion as toggleHybridCompletion, softDeleteHabit as softDeleteHybridHabit, toggleFavorite as toggleHybridFavorite, updateHabit as updateHybridHabit } from "@/lib/habitsHybrid";
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
  Edit2,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import StreakHeatmap from "@/components/StreakHeatmap";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

const DAYS_OF_WEEK = [
  { value: 0, label: 'Sun' },
  { value: 1, label: 'Mon' },
  { value: 2, label: 'Tue' },
  { value: 3, label: 'Wed' },
  { value: 4, label: 'Thu' },
  { value: 5, label: 'Fri' },
  { value: 6, label: 'Sat' },
];

const COLOR_OPTIONS = [
  { value: 'orange', class: 'bg-orange-500' },
  { value: 'blue', class: 'bg-blue-500' },
  { value: 'green', class: 'bg-green-500' },
  { value: 'purple', class: 'bg-purple-500' },
  { value: 'red', class: 'bg-red-500' },
  { value: 'yellow', class: 'bg-yellow-500' },
  { value: 'pink', class: 'bg-pink-500' },
  { value: 'cyan', class: 'bg-cyan-500' },
  { value: 'indigo', class: 'bg-indigo-500' },
  { value: 'gray', class: 'bg-gray-500' },
];

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
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [habitToEdit, setHabitToEdit] = useState<Habit | null>(null);
  const [editFormData, setEditFormData] = useState<Partial<HabitFormData>>({});

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
      console.log('Starting delete for habit:', habitToDelete.id, 'userId:', userId);
      await softDeleteHybridHabit(habitToDelete.id, userId);
      console.log('Delete successful, calling parent to refresh');
      // Call the parent to refresh the habit list from database
      onHabitDeleted(habitToDelete.id);
      setDeleteDialogOpen(false);
      setHabitToDelete(null);
    } catch (error) {
      console.error("Error deleting habit:", error);
      // Keep dialog open to allow retry
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

  const handleEditClick = (habit: Habit) => {
    setHabitToEdit(habit);
    setEditFormData({
      title: habit.title,
      description: habit.description,
      frequency: habit.frequency,
      customDays: habit.customDays,
      startDate: habit.startDate,
      color: habit.color || 'orange',
    });
    setEditDialogOpen(true);
  };

  const cancelEdit = () => {
    setEditDialogOpen(false);
    setHabitToEdit(null);
    setEditFormData({});
  };

  const toggleEditDay = (day: number) => {
    setEditFormData(prev => ({
      ...prev,
      customDays: prev.customDays?.includes(day)
        ? prev.customDays.filter(d => d !== day)
        : [...(prev.customDays || []), day],
    }));
  };

  const handleSaveEdit = async () => {
    if (!habitToEdit) return;
    
    try {
      await updateHybridHabit(habitToEdit.id, editFormData as HabitFormData, userId);
      onHabitUpdated({ ...habitToEdit, ...editFormData });
      setEditDialogOpen(false);
      setHabitToEdit(null);
      setEditFormData({});
    } catch (error) {
      console.error('Error updating habit:', error);
      // Keep dialog open to allow retry
    }
  };

  const getHabitColor = (habit: Habit) => {
    return habit.color || 'orange';
  };

  const getTailwindColorClass = (color: string, type: 'bg' | 'text' | 'fill' | 'border') => {
    const colorMap: Record<string, string> = {
      orange: type === 'bg' ? 'bg-orange-500' : type === 'text' ? 'text-orange-500' : type === 'fill' ? 'fill-orange-500' : 'border-orange-500',
      blue: type === 'bg' ? 'bg-blue-500' : type === 'text' ? 'text-blue-500' : type === 'fill' ? 'fill-blue-500' : 'border-blue-500',
      green: type === 'bg' ? 'bg-green-500' : type === 'text' ? 'text-green-500' : type === 'fill' ? 'fill-green-500' : 'border-green-500',
      purple: type === 'bg' ? 'bg-purple-500' : type === 'text' ? 'text-purple-500' : type === 'fill' ? 'fill-purple-500' : 'border-purple-500',
      red: type === 'bg' ? 'bg-red-500' : type === 'text' ? 'text-red-500' : type === 'fill' ? 'fill-red-500' : 'border-red-500',
      yellow: type === 'bg' ? 'bg-yellow-500' : type === 'text' ? 'text-yellow-500' : type === 'fill' ? 'fill-yellow-500' : 'border-yellow-500',
      pink: type === 'bg' ? 'bg-pink-500' : type === 'text' ? 'text-pink-500' : type === 'fill' ? 'fill-pink-500' : 'border-pink-500',
      cyan: type === 'bg' ? 'bg-cyan-500' : type === 'text' ? 'text-cyan-500' : type === 'fill' ? 'fill-cyan-500' : 'border-cyan-500',
      indigo: type === 'bg' ? 'bg-indigo-500' : type === 'text' ? 'text-indigo-500' : type === 'fill' ? 'fill-indigo-500' : 'border-indigo-500',
      gray: type === 'bg' ? 'bg-gray-500' : type === 'text' ? 'text-gray-500' : type === 'fill' ? 'fill-gray-500' : 'border-gray-500',
    };
    return colorMap[color] || colorMap.orange;
  };

  const isCompletedToday = (habit: Habit) => {
    const today = new Date();
    return habit.completedDates.some(
      (d) => new Date(d).toDateString() === today.toDateString(),
    );
  };

  return (
    <>
    <div className="grid gap-2 xl:grid-cols-2">
      {habits.map((habit) => {
        const stats = getHabitStats(habit);
        const completedToday = isCompletedToday(habit);
        const isExpanded = expandedHabits[habit.id];
        const currentMonth = calendarMonths[habit.id] || new Date();
        const habitColor = getHabitColor(habit);
        const bgColorClass = getTailwindColorClass(habitColor, 'bg');
        const textColorClass = getTailwindColorClass(habitColor, 'text');
        const fillColorClass = getTailwindColorClass(habitColor, 'fill');
        const borderColorClass = getTailwindColorClass(habitColor, 'border');

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
            className="bg-white border border-stone-200 rounded-2xl overflow-hidden"
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
                className={`flex-shrink-0 size-8 rounded-full border flex items-center justify-center transition-colors ${
                  completedToday 
                    ? `${bgColorClass} border-transparent`
                    : 'border-stone-300 hover:border-stone-400 bg-white'
                }`}
              >
                {completedToday ? (
                  <Check className="size-4 text-white" />
                ) : (
                  <Circle className="size-4 text-transparent" />
                )}
              </button>

              {/* Habit Info */}
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  <span
                    className={`text-sm font-medium truncate ${completedToday ? "line-through text-stone-400" : `${textColorClass} font-semibold`}`}
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
                  <div 
                    className={`flex items-center gap-1 text-xs ${completedToday ? 'font-bold' : 'text-stone-400'} ${completedToday ? textColorClass : ''}`}
                  >
                    <Flame 
                      className={`w-3 h-3 ${completedToday ? fillColorClass : ''}`} 
                    />
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
                  onClick={() => handleEditClick(habit)}
                  className="h-7 w-7 p-0 text-stone-400 hover:text-stone-600"
                >
                  <Edit2 className="w-4 h-4" />
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

    {/* Edit Dialog */}
    <Dialog open={editDialogOpen} onOpenChange={setEditDialogOpen}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Edit Habit</DialogTitle>
          <DialogDescription>
            Update your habit settings
          </DialogDescription>
        </DialogHeader>
        <div className="grid gap-3 sm:gap-4 py-4">
          <div className="grid gap-2">
            <Label htmlFor="edit-title">Habit Title *</Label>
            <Input
              id="edit-title"
              value={editFormData.title || ''}
              onChange={(e) => setEditFormData({ ...editFormData, title: e.target.value })}
              placeholder="e.g., Morning Exercise"
            />
          </div>

          <div className="grid gap-2">
            <Label htmlFor="edit-description">Description (optional)</Label>
            <Input
              id="edit-description"
              value={editFormData.description || ''}
              onChange={(e) => setEditFormData({ ...editFormData, description: e.target.value })}
              placeholder="Add some details about your habit"
            />
          </div>

          <div className="grid gap-2">
            <Label htmlFor="edit-frequency">Frequency</Label>
            <Select
              value={editFormData.frequency}
              onValueChange={(value) => setEditFormData({ ...editFormData, frequency: value as any })}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select frequency" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="daily">Daily</SelectItem>
                <SelectItem value="weekly">Weekly</SelectItem>
                <SelectItem value="custom">Custom Days</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {editFormData.frequency === 'custom' && (
            <div className="grid gap-2">
              <Label>Select Days</Label>
              <div className="flex gap-1 sm:gap-2 flex-wrap">
                {DAYS_OF_WEEK.map((day) => (
                  <Button
                    key={day.value}
                    type="button"
                    variant={editFormData.customDays?.includes(day.value) ? 'default' : 'outline'}
                    size="sm"
                    onClick={() => toggleEditDay(day.value)}
                    className="flex-1 text-xs sm:text-sm"
                  >
                    {day.label}
                  </Button>
                ))}
              </div>
            </div>
          )}

          <div className="grid gap-2">
            <Label htmlFor="edit-startDate">Start Date</Label>
            <Input
              id="edit-startDate"
              type="date"
              value={editFormData.startDate ? editFormData.startDate.toISOString().split('T')[0] : ''}
              onChange={(e) => setEditFormData({ ...editFormData, startDate: new Date(e.target.value) })}
            />
          </div>

          <div className="grid gap-2">
            <Label htmlFor="edit-color">Theme Color</Label>
            <div className="flex gap-2 flex-wrap">
              {COLOR_OPTIONS.map((color) => (
                <button
                  key={color.value}
                  type="button"
                  onClick={() => setEditFormData({ ...editFormData, color: color.value })}
                  className={`w-8 h-8 rounded-full border-2 transition-all ${
                    editFormData.color === color.value 
                      ? 'border-gray-900 scale-110' 
                      : 'border-gray-200 hover:border-gray-300'
                  } ${color.class}`}
                  title={color.value.charAt(0).toUpperCase() + color.value.slice(1)}
                />
              ))}
            </div>
          </div>
        </div>
        <DialogFooter className="flex-col sm:flex-row gap-2">
          <Button variant="outline" onClick={cancelEdit} className="w-full sm:w-auto rounded-full me-auto">
            Cancel
          </Button>
          <Button onClick={handleSaveEdit} className="w-full sm:w-auto rounded-full">
            Save Changes
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  </>
  );
}
