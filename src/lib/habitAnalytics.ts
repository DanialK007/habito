import { Habit, HabitStats } from '@/types/habit';

// Helper function to check if a date should be counted for a habit
const shouldCountDate = (habit: Habit, date: Date): boolean => {
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
      // For weekly, you could define specific days or assume all days
      return true;
    case 'custom':
      return habit.customDays?.includes(dayOfWeek) || false;
    default:
      return true;
  }
};

// Calculate streak for a habit
export const calculateStreak = (habit: Habit): { current: number; longest: number } => {
  const completedDates = habit.completedDates
    .map(d => new Date(d))
    .sort((a, b) => a.getTime() - b.getTime());
  
  if (completedDates.length === 0) {
    return { current: 0, longest: 0 };
  }
  
  let currentStreak = 0;
  let longestStreak = 0;
  let tempStreak = 0;
  
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  
  // Calculate current streak by checking backwards from today
  let checkDate = new Date(today);
  let streakBroken = false;
  
  // First check if today is completed - if not, start from yesterday
  const todayCompleted = completedDates.some(
    d => d.toDateString() === today.toDateString()
  );
  
  if (!todayCompleted && shouldCountDate(habit, today)) {
    // Today should be tracked but isn't completed, so streak is 0
    // But we still want to show streak from previous consecutive days for display
    // Start checking from yesterday
    checkDate.setDate(checkDate.getDate() - 1);
  }
  
  while (!streakBroken) {
    if (shouldCountDate(habit, checkDate)) {
      const isCompleted = completedDates.some(
        d => d.toDateString() === checkDate.toDateString()
      );
      
      if (isCompleted) {
        currentStreak++;
      } else {
        streakBroken = true;
      }
    }
    
    // Move to previous day
    checkDate.setDate(checkDate.getDate() - 1);
    
    // Safety check to prevent infinite loop
    const startDate = new Date(habit.startDate);
    startDate.setHours(0, 0, 0, 0);
    if (checkDate < startDate) {
      streakBroken = true;
    }
  }
  
  // Calculate longest streak
  let consecutiveDays = 0;
  let lastDate: Date | null = null;
  
  for (let i = 0; i < completedDates.length; i++) {
    const date = new Date(completedDates[i]);
    date.setHours(0, 0, 0, 0);
    
    if (!shouldCountDate(habit, date)) continue;
    
    if (lastDate === null) {
      consecutiveDays = 1;
    } else {
      const daysDiff = Math.floor((date.getTime() - lastDate.getTime()) / (1000 * 60 * 60 * 24));
      
      // Check if this completion is consecutive with the last one
      // For daily habits, consecutive means 1 day apart
      // For custom habits, we need to check if there are no missed scheduled days in between
      if (daysDiff === 1 && habit.frequency === 'daily') {
        consecutiveDays++;
      } else if (daysDiff > 1) {
        // Check if there are any missed scheduled days between the dates
        let hasMissedDays = false;
        let checkDay = new Date(lastDate);
        checkDay.setDate(checkDay.getDate() + 1);
        
        while (checkDay < date) {
          if (shouldCountDate(habit, checkDay)) {
            const isCompleted = completedDates.some(
              d => d.toDateString() === checkDay.toDateString()
            );
            if (!isCompleted) {
              hasMissedDays = true;
              break;
            }
          }
          checkDay.setDate(checkDay.getDate() + 1);
        }
        
        if (hasMissedDays) {
          consecutiveDays = 1;
        } else {
          consecutiveDays++;
        }
      } else {
        consecutiveDays = 1;
      }
    }
    
    longestStreak = Math.max(longestStreak, consecutiveDays);
    lastDate = date;
  }
  
  return { current: currentStreak, longest: longestStreak };
};

// Calculate completion rate for a time period
export const calculateCompletionRate = (habit: Habit, days: number = 7): number => {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  
  let possibleDays = 0;
  let completedDays = 0;
  
  for (let i = 0; i < days; i++) {
    const checkDate = new Date(today);
    checkDate.setDate(today.getDate() - i);
    
    if (shouldCountDate(habit, checkDate)) {
      possibleDays++;
      
      const isCompleted = habit.completedDates.some(
        d => new Date(d).toDateString() === checkDate.toDateString()
      );
      
      if (isCompleted) {
        completedDays++;
      }
    }
  }
  
  return possibleDays > 0 ? Math.round((completedDays / possibleDays) * 100) : 0;
};

// Get comprehensive stats for a habit
export const getHabitStats = (habit: Habit): HabitStats => {
  const { current: currentStreak, longest: longestStreak } = calculateStreak(habit);
  const completionRate = calculateCompletionRate(habit, 7);
  
  // Calculate total completions and possible days
  const today = new Date();
  const startDate = new Date(habit.startDate);
  const daysSinceStart = Math.floor((today.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24));
  
  let totalPossible = 0;
  for (let i = 0; i <= daysSinceStart; i++) {
    const checkDate = new Date(startDate);
    checkDate.setDate(startDate.getDate() + i);
    if (shouldCountDate(habit, checkDate)) {
      totalPossible++;
    }
  }
  
  return {
    currentStreak,
    longestStreak,
    completionRate,
    totalCompletions: habit.completedDates.length,
    totalPossible,
  };
};

// Get completion data for calendar/heatmap
export const getCompletionData = (habit: Habit, days: number = 365): Array<{ date: Date; completed: boolean }> => {
  const today = new Date();
  const data: Array<{ date: Date; completed: boolean }> = [];
  
  for (let i = 0; i < days; i++) {
    const checkDate = new Date(today);
    checkDate.setDate(today.getDate() - i);
    
    if (shouldCountDate(habit, checkDate)) {
      const isCompleted = habit.completedDates.some(
        d => new Date(d).toDateString() === checkDate.toDateString()
      );
      
      data.push({ date: checkDate, completed: isCompleted });
    }
  }
  
  return data.reverse();
};
