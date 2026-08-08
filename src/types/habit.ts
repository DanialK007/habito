export interface Habit {
  id: string;
  userId: string;
  title: string;
  description?: string;
  frequency: 'daily' | 'weekly' | 'custom';
  customDays?: number[]; // 0-6 (Sunday-Saturday) for custom frequency
  startDate: Date;
  createdAt: Date;
  completedDates: Date[];
  color?: string;
  icon?: string;
  deleted?: boolean; // Soft delete flag for trash
  deletedAt?: Date; // When it was moved to trash
}

export interface HabitFormData {
  title: string;
  description?: string;
  frequency: 'daily' | 'weekly' | 'custom';
  customDays?: number[];
  startDate: Date;
  color?: string;
  icon?: string;
}

export interface HabitStats {
  currentStreak: number;
  longestStreak: number;
  completionRate: number;
  totalCompletions: number;
  totalPossible: number;
}
