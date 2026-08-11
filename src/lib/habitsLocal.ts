// Local habits service - works completely offline using IndexedDB

import { localStorageService } from './localStorage';
import { Habit } from '@/types/habit';

// Generate a unique ID
const generateId = (): string => {
  return `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
};

// Get all habits for the current user (local only)
export const getLocalHabits = async (): Promise<Habit[]> => {
  try {
    await localStorageService.init();
    const habits = await localStorageService.getHabits();
    // Convert any string dates to Date objects for consistency
    return habits.map(habit => ({
      ...habit,
      startDate: typeof habit.startDate === 'string' ? new Date(habit.startDate) : habit.startDate,
      createdAt: typeof habit.createdAt === 'string' ? new Date(habit.createdAt) : habit.createdAt,
      completedDates: habit.completedDates.map((d: string | Date) => typeof d === 'string' ? new Date(d) : d),
    }));
  } catch (error) {
    console.error('Error getting local habits:', error);
    return [];
  }
};

// Get a specific habit by ID
export const getLocalHabitById = async (id: string): Promise<Habit | null> => {
  try {
    await localStorageService.init();
    const habit = await localStorageService.getHabitById(id);
    if (!habit) return null;
    
    // Convert string dates to Date objects
    return {
      ...habit,
      startDate: typeof habit.startDate === 'string' ? new Date(habit.startDate) : habit.startDate,
      createdAt: typeof habit.createdAt === 'string' ? new Date(habit.createdAt) : habit.createdAt,
      completedDates: habit.completedDates.map((d: string | Date) => typeof d === 'string' ? new Date(d) : d),
    };
  } catch (error) {
    console.error('Error getting local habit:', error);
    return null;
  }
};

// Create a new habit
export const createLocalHabit = async (habitData: Omit<Habit, 'id' | 'completedDates' | 'createdAt'>): Promise<Habit> => {
  try {
    await localStorageService.init();
    
    const newHabit: Habit = {
      ...habitData,
      id: generateId(),
      completedDates: [],
      deleted: false,
      createdAt: new Date(),
    };

    // Convert to storage format
    const storageHabit = {
      ...newHabit,
      startDate: (newHabit.startDate as Date).toISOString(),
      createdAt: (newHabit.createdAt as Date).toISOString(),
      completedDates: (newHabit.completedDates as Date[]).map(d => d.toISOString()),
    };

    await localStorageService.saveHabit(storageHabit);
    return newHabit;
  } catch (error) {
    console.error('Error creating local habit:', error);
    throw error;
  }
};

// Update an existing habit
export const updateLocalHabit = async (id: string, updates: Partial<Habit>): Promise<Habit> => {
  try {
    await localStorageService.init();
    
    const existingHabit = await localStorageService.getHabitById(id);
    if (!existingHabit) {
      throw new Error('Habit not found');
    }

    const updatedHabit: Habit = {
      ...existingHabit,
      ...updates,
      id, // Ensure ID is preserved
    };

    // Convert to storage format
    const storageHabit = {
      ...updatedHabit,
      startDate: (updatedHabit.startDate as Date).toISOString(),
      createdAt: (updatedHabit.createdAt as Date).toISOString(),
      completedDates: (updatedHabit.completedDates as Date[]).map(d => d.toISOString()),
    };

    await localStorageService.saveHabit(storageHabit);
    return updatedHabit;
  } catch (error) {
    console.error('Error updating local habit:', error);
    throw error;
  }
};

// Toggle habit completion for a specific date
export const toggleLocalHabitCompletion = async (id: string, date: string): Promise<Habit> => {
  try {
    await localStorageService.init();
    
    const habit = await localStorageService.getHabitById(id);
    if (!habit) {
      throw new Error('Habit not found');
    }

    const dateIndex = habit.completedDates.indexOf(date);
    let updatedCompletedDates: string[];

    if (dateIndex > -1) {
      // Remove date (uncomplete)
      updatedCompletedDates = habit.completedDates.filter((d: string) => d !== date);
    } else {
      // Add date (complete)
      updatedCompletedDates = [...habit.completedDates, date];
    }

    const updatedHabit = {
      ...habit,
      completedDates: updatedCompletedDates,
    };

    await localStorageService.saveHabit(updatedHabit);
    
    // Convert back to app format
    return {
      ...updatedHabit,
      startDate: new Date(updatedHabit.startDate),
      createdAt: new Date(updatedHabit.createdAt),
      completedDates: updatedHabit.completedDates.map((d: string) => new Date(d)),
    };
  } catch (error) {
    console.error('Error toggling habit completion:', error);
    throw error;
  }
};

// Soft delete a habit (move to trash)
export const softDeleteLocalHabit = async (id: string): Promise<void> => {
  try {
    await localStorageService.init();
    await localStorageService.deleteHabit(id);
  } catch (error) {
    console.error('Error soft deleting local habit:', error);
    throw error;
  }
};

// Restore a habit from trash
export const restoreLocalHabit = async (id: string): Promise<void> => {
  try {
    await localStorageService.init();
    await localStorageService.restoreHabit(id);
  } catch (error) {
    console.error('Error restoring local habit:', error);
    throw error;
  }
};

// Permanently delete a habit
export const permanentlyDeleteLocalHabit = async (id: string): Promise<void> => {
  try {
    await localStorageService.init();
    await localStorageService.permanentlyDeleteHabit(id);
  } catch (error) {
    console.error('Error permanently deleting local habit:', error);
    throw error;
  }
};

// Get deleted habits (trash)
export const getLocalDeletedHabits = async (): Promise<Habit[]> => {
  try {
    await localStorageService.init();
    const habits = await localStorageService.getDeletedHabits();
    // Convert to app format
    return habits.map(habit => ({
      ...habit,
      startDate: new Date(habit.startDate),
      createdAt: new Date(habit.createdAt),
      completedDates: habit.completedDates.map((d: string) => new Date(d)),
    }));
  } catch (error) {
    console.error('Error getting deleted habits:', error);
    return [];
  }
};

// Toggle favorite status
export const toggleLocalHabitFavorite = async (id: string): Promise<Habit> => {
  try {
    await localStorageService.init();
    
    const habit = await localStorageService.getHabitById(id);
    if (!habit) {
      throw new Error('Habit not found');
    }

    const updatedHabit = {
      ...habit,
      favorite: !habit.favorite,
    };

    await localStorageService.saveHabit(updatedHabit);
    
    // Convert back to app format
    return {
      ...updatedHabit,
      startDate: new Date(updatedHabit.startDate),
      createdAt: new Date(updatedHabit.createdAt),
      completedDates: updatedHabit.completedDates.map((d: string) => new Date(d)),
    };
  } catch (error) {
    console.error('Error toggling habit favorite:', error);
    throw error;
  }
};

// Get favorite habits
export const getLocalFavoriteHabits = async (): Promise<Habit[]> => {
  try {
    const habits = await getLocalHabits();
    return habits.filter(habit => habit.favorite);
  } catch (error) {
    console.error('Error getting favorite habits:', error);
    return [];
  }
};