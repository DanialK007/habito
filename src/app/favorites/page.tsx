'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import { Habit } from '@/types/habit';
import { getFavoriteHabits as getHybridFavoriteHabits } from '@/lib/habitsHybrid';
import HabitList from '@/components/HabitList';
import { Star } from 'lucide-react';

export default function FavoritesPage() {
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
      const favoriteHabits = await getHybridFavoriteHabits(userId);
      setHabits(favoriteHabits);
    } catch (error) {
      console.error('Error fetching favorite habits:', error);
    } finally {
      setLoadingHabits(false);
    }
  };

  const handleHabitDeleted = (habitId: string) => {
    setHabits(habits.filter(h => h.id !== habitId));
  };

  const handleHabitUpdated = (updatedHabit: Habit) => {
    setHabits(habits.map(h => h.id === updatedHabit.id ? updatedHabit : h));
  };

  const handleFavoriteToggled = (habitId: string, isFavorite: boolean) => {
    // If a habit is unfavorited, remove it from the favorites list
    if (!isFavorite) {
      setHabits(habits.filter(h => h.id !== habitId));
    }
  };

  if (loading || loadingHabits) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-400"></div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 md:px-8 py-8">
      {/* Page Header */}
      <div className="mb-6 sm:mb-8">
        <div className="flex items-center gap-2 text-gray-500 text-xs sm:text-sm mb-2">
          <Star className="w-3 h-3 sm:w-4 sm:h-4" />
          <span>Favorites</span>
        </div>
        <h1 className="text-2xl sm:text-3xl md:text-4xl font-bold text-gray-900 mb-2">
          Favorite Habits
        </h1>
        <p className="text-sm sm:text-base text-gray-500">
          Your most important habits
        </p>
      </div>

      {habits.length === 0 ? (
        <div className="text-center py-12 sm:py-16">
          <div className="inline-flex items-center justify-center w-12 h-12 bg-gray-100 rounded-full mb-4">
            <Star className="w-6 h-6 text-gray-400" />
          </div>
          <h3 className="text-base sm:text-lg font-medium text-gray-800 mb-2">
            No favorites yet
          </h3>
          <p className="text-sm sm:text-base text-gray-500">
            Star habits to add them to your favorites
          </p>
        </div>
      ) : (
        <HabitList
          habits={habits}
          onHabitDeleted={handleHabitDeleted}
          onHabitUpdated={handleHabitUpdated}
          onFavoriteToggled={handleFavoriteToggled}
        />
      )}
    </div>
  );
}