// Hybrid habits service - tries Firebase first, falls back to local storage

import { Habit } from '@/types/habit';
import { getUserHabits as getFirebaseHabits } from '@/lib/firebase/habits';
import { getLocalHabits, getLocalHabitById, createLocalHabit, updateLocalHabit, toggleLocalHabitCompletion, softDeleteLocalHabit, restoreLocalHabit, permanentlyDeleteLocalHabit, toggleLocalHabitFavorite, getLocalDeletedHabits, getLocalFavoriteHabits } from '@/lib/habitsLocal';
import { localStorageService } from './localStorage';

// Sync Firebase habits to local storage
const syncFirebaseToLocal = async (firebaseHabits: Habit[]): Promise<void> => {
  try {
    await localStorageService.init();
    
    for (const firebaseHabit of firebaseHabits) {
      if (!firebaseHabit || !firebaseHabit.id) continue; // Skip invalid habits
      
      // Convert to local storage format - handle both Date and string formats
      const startDate = firebaseHabit.startDate instanceof Date 
        ? firebaseHabit.startDate.toISOString() 
        : firebaseHabit.startDate;
      
      const createdAt = firebaseHabit.createdAt instanceof Date 
        ? firebaseHabit.createdAt.toISOString() 
        : firebaseHabit.createdAt;
      
      const completedDates = firebaseHabit.completedDates.map((d: Date | string) => 
        d instanceof Date ? d.toISOString() : d
      );
      
      const localHabit = {
        ...firebaseHabit,
        startDate,
        createdAt,
        completedDates,
        updatedAt: new Date().toISOString(),
      };
      
      await localStorageService.saveHabit(localHabit);
    }
  } catch (error) {
    console.error('Error syncing Firebase habits to local storage:', error);
  }
};

// Get habits - tries Firebase first, falls back to local storage
export const getHabits = async (userId?: string): Promise<Habit[]> => {
  try {
    // First try Firebase if userId is available
    if (userId) {
      try {
        const firebaseHabits = await getFirebaseHabits(userId);
        // Sync to local storage for offline use
        await syncFirebaseToLocal(firebaseHabits);
        // Filter and normalize habits
        return firebaseHabits.filter(habit => habit && habit.id && !habit.deleted).map(habit => ({
          ...habit,
          // Ensure completedDates is always an array
          completedDates: habit.completedDates || [],
          // Ensure title field exists
          title: habit.title || 'Habit',
        }));
      } catch (firebaseError) {
        console.log('Firebase not available, falling back to local storage');
      }
    }
    
    // Fall back to local storage
    const localHabits = await getLocalHabits();
    return localHabits.filter(habit => habit && habit.id && !habit.deleted).map(habit => ({
      ...habit,
      completedDates: habit.completedDates || [],
      title: habit.title || 'Habit',
    }));
  } catch (error) {
    console.error('Error getting habits:', error);
    return [];
  }
};

// Create habit - tries Firebase first, falls back to local storage
export const createHabit = async (habitData: any, userId?: string): Promise<Habit> => {
  try {
    if (userId) {
      try {
        // Try Firebase first
        const { createHabit: createFirebaseHabit } = await import('@/lib/firebase/habits');
        const firebaseHabit = await createFirebaseHabit(userId, habitData);
        // Also save to local storage for offline access
        await createLocalHabit(habitData);
        return firebaseHabit;
      } catch (firebaseError) {
        console.log('Firebase not available, using local storage');
      }
    }
    
    // Fall back to local storage
    return await createLocalHabit(habitData);
  } catch (error) {
    console.error('Error creating habit:', error);
    return await createLocalHabit(habitData);
  }
};

// Toggle habit completion - tries Firebase first, falls back to local storage
export const toggleHabitCompletion = async (habitId: string, date: Date, userId?: string): Promise<Habit> => {
  console.log('Toggle completion called for habit:', habitId, 'userId:', userId);
  try {
    if (userId) {
      try {
        // Try Firebase first
        const { toggleHabitCompletion: toggleFirebaseCompletion } = await import('@/lib/firebase/habits');
        console.log('Attempting Firebase toggle');
        await toggleFirebaseCompletion(habitId, date);
        console.log('Firebase toggle successful');
        // Also update local storage
        await toggleLocalHabitCompletion(habitId, date.toISOString().split('T')[0]);
        console.log('Local storage toggle successful');
        // Fetch the updated habit from local storage
        const updatedHabit = await getLocalHabitById(habitId);
        if (updatedHabit) return updatedHabit;
      } catch (firebaseError) {
        console.log('Firebase not available, using local storage:', firebaseError);
      }
    } else {
      console.log('No userId provided, using local storage directly');
    }
    
    // Fall back to local storage
    console.log('Attempting local storage toggle');
    return await toggleLocalHabitCompletion(habitId, date.toISOString().split('T')[0]);
  } catch (error) {
    console.error('Error toggling habit completion:', error);
    // Final fallback to local storage
    return await toggleLocalHabitCompletion(habitId, date.toISOString().split('T')[0]);
  }
};

// Soft delete habit - tries Firebase first, falls back to local storage
export const softDeleteHabit = async (habitId: string, userId?: string): Promise<void> => {
  console.log('Soft delete called for habit:', habitId, 'userId:', userId);
  try {
    if (userId) {
      try {
        // Try Firebase first
        const { softDeleteHabit: softDeleteFirebaseHabit } = await import('@/lib/firebase/habits');
        console.log('Attempting Firebase soft delete');
        await softDeleteFirebaseHabit(habitId);
        console.log('Firebase soft delete successful');
        // Also update local storage after Firebase succeeds
        await softDeleteLocalHabit(habitId);
        console.log('Local storage soft delete successful');
        return;
      } catch (firebaseError) {
        console.log('Firebase not available, using local storage only:', firebaseError);
      }
    } else {
      console.log('No userId provided, using local storage directly');
    }
    
    // Fall back to local storage only
    console.log('Attempting local storage soft delete');
    await softDeleteLocalHabit(habitId);
    console.log('Local storage soft delete successful');
  } catch (error) {
    console.error('Error soft deleting habit:', error);
    // Try local storage as final fallback
    try {
      console.log('Attempting local storage fallback');
      await softDeleteLocalHabit(habitId);
      console.log('Local storage fallback successful');
    } catch (localError) {
      console.error('Local storage fallback also failed:', localError);
    }
  }
};

// Restore habit - tries Firebase first, falls back to local storage
export const restoreHabit = async (habitId: string, userId?: string): Promise<void> => {
  try {
    if (userId) {
      try {
        // Try Firebase first
        const { restoreHabit: restoreFirebaseHabit } = await import('@/lib/firebase/habits');
        await restoreFirebaseHabit(habitId);
        // Also update local storage
        await restoreLocalHabit(habitId);
        return;
      } catch (firebaseError) {
        console.log('Firebase not available, using local storage');
      }
    }
    
    // Fall back to local storage
    await restoreLocalHabit(habitId);
  } catch (error) {
    console.error('Error restoring habit:', error);
    await restoreLocalHabit(habitId);
  }
};

// Permanently delete habit - tries Firebase first, falls back to local storage
export const deleteHabit = async (habitId: string, userId?: string): Promise<void> => {
  try {
    if (userId) {
      try {
        // Try Firebase first
        const { deleteHabit: deleteFirebaseHabit } = await import('@/lib/firebase/habits');
        await deleteFirebaseHabit(habitId);
        // Also update local storage
        await permanentlyDeleteLocalHabit(habitId);
        return;
      } catch (firebaseError) {
        console.log('Firebase not available, using local storage');
      }
    }
    
    // Fall back to local storage
    await permanentlyDeleteLocalHabit(habitId);
  } catch (error) {
    console.error('Error permanently deleting habit:', error);
    await permanentlyDeleteLocalHabit(habitId);
  }
};

// Toggle favorite - tries Firebase first, falls back to local storage
export const toggleFavorite = async (habitId: string, isFavorite: boolean, userId?: string): Promise<void> => {
  try {
    if (userId) {
      try {
        // Try Firebase first
        const { toggleFavorite: toggleFirebaseFavorite } = await import('@/lib/firebase/habits');
        await toggleFirebaseFavorite(habitId, isFavorite);
        // Also update local storage
        await toggleLocalHabitFavorite(habitId);
        return;
      } catch (firebaseError) {
        console.log('Firebase not available, using local storage');
      }
    }
    
    // Fall back to local storage
    await toggleLocalHabitFavorite(habitId);
  } catch (error) {
    console.error('Error toggling favorite:', error);
    await toggleLocalHabitFavorite(habitId);
  }
};

// Get deleted habits - tries Firebase first, falls back to local storage
export const getDeletedHabits = async (userId?: string): Promise<Habit[]> => {
  try {
    if (userId) {
      try {
        // Try Firebase first
        const { getDeletedHabits: getFirebaseDeletedHabits } = await import('@/lib/firebase/habits');
        const firebaseDeleted = await getFirebaseDeletedHabits(userId);
        console.log('Firebase deleted habits:', firebaseDeleted);
        // Sync to local storage
        await syncFirebaseToLocal(firebaseDeleted);
        // Filter and normalize habits
        return firebaseDeleted.filter(habit => habit && habit.id && habit.deleted).map(habit => ({
          ...habit,
          completedDates: habit.completedDates || [],
          title: habit.title || 'Habit',
        }));
      } catch (firebaseError) {
        console.log('Firebase not available, using local storage');
      }
    }
    
    // Fall back to local storage
    const localDeleted = await getLocalDeletedHabits();
    console.log('Local deleted habits:', localDeleted);
    return localDeleted.filter(habit => habit && habit.id && habit.deleted).map(habit => ({
      ...habit,
      completedDates: habit.completedDates || [],
      title: habit.title || 'Habit',
    }));
  } catch (error) {
    console.error('Error getting deleted habits:', error);
    return [];
  }
};

// Get favorite habits - tries Firebase first, falls back to local storage
export const getFavoriteHabits = async (userId?: string): Promise<Habit[]> => {
  try {
    if (userId) {
      try {
        // Try Firebase first
        const { getFavoriteHabits: getFirebaseFavoriteHabits } = await import('@/lib/firebase/habits');
        const firebaseFavorites = await getFirebaseFavoriteHabits(userId);
        // Filter and normalize habits
        return firebaseFavorites.filter(habit => habit && habit.id && !habit.deleted).map(habit => ({
          ...habit,
          completedDates: habit.completedDates || [],
          title: habit.title || 'Habit',
        }));
      } catch (firebaseError) {
        console.log('Firebase not available, using local storage');
      }
    }
    
    // Fall back to local storage
    const localFavorites = await getLocalFavoriteHabits();
    return localFavorites.filter(habit => habit && habit.id && !habit.deleted).map(habit => ({
      ...habit,
      completedDates: habit.completedDates || [],
      title: habit.title || 'Habit',
    }));
  } catch (error) {
    console.error('Error getting favorite habits:', error);
    return [];
  }
};