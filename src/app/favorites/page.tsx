'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import { Habit } from '@/types/habit';
import { getUserHabits } from '@/lib/firebase/habits';
import Sidebar from '@/components/Sidebar';
import HabitList from '@/components/HabitList';
import { Star } from 'lucide-react';

export default function FavoritesPage() {
  const { user, loading } = useAuth();
  const router = useRouter();
  const [habits, setHabits] = useState<Habit[]>([]);
  const [loadingHabits, setLoadingHabits] = useState(true);

  useEffect(() => {
    if (!loading && !user) {
      router.push('/');
    }
  }, [user, loading, router]);

  useEffect(() => {
    const fetchHabits = async () => {
      if (user) {
        try {
          const userHabits = await getUserHabits(user.uid);
          // Filter for favorites (we'd need to add a favorite field to the habit schema)
          setHabits(userHabits);
        } catch (error) {
          console.error('Error fetching habits:', error);
        } finally {
          setLoadingHabits(false);
        }
      }
    };

    fetchHabits();
  }, [user]);

  const handleHabitDeleted = (habitId: string) => {
    setHabits(habits.filter(h => h.id !== habitId));
  };

  const handleHabitUpdated = (updatedHabit: Habit) => {
    setHabits(habits.map(h => h.id === updatedHabit.id ? updatedHabit : h));
  };

  if (loading || loadingHabits) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-stone-50">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-stone-400"></div>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen bg-stone-50">
      <Sidebar />
      
      <main className="flex-1  pt-16 lg:pt-0">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          {/* Page Header */}
          <div className="mb-6 sm:mb-8">
            <div className="flex items-center gap-2 text-stone-400 text-xs sm:text-sm mb-2">
              <Star className="w-3 h-3 sm:w-4 sm:h-4" />
              <span>Favorites</span>
            </div>
            <h1 className="text-2xl sm:text-3xl md:text-4xl font-bold text-stone-900 mb-2">
              Favorite Habits
            </h1>
            <p className="text-sm sm:text-base text-stone-600">
              Your most important habits
            </p>
          </div>

          {habits.length === 0 ? (
            <div className="text-center py-12 sm:py-16">
              <div className="inline-flex items-center justify-center w-12 h-12 bg-stone-100 rounded-full mb-4">
                <Star className="w-6 h-6 text-stone-400" />
              </div>
              <h3 className="text-base sm:text-lg font-medium text-stone-900 mb-2">
                No favorites yet
              </h3>
              <p className="text-sm sm:text-base text-stone-500">
                Star habits to add them to your favorites
              </p>
            </div>
          ) : (
            <HabitList
              habits={habits}
              onHabitDeleted={handleHabitDeleted}
              onHabitUpdated={handleHabitUpdated}
            />
          )}
        </div>
      </main>
    </div>
  );
}
