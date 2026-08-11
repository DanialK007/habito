'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import { Habit } from '@/types/habit';
import { getHabits as getHybridHabits } from '@/lib/habitsHybrid';
import HabitList from '@/components/HabitList';
import AddHabitDialog from '@/components/AddHabitDialog';
import HabitAnalytics from '@/components/HabitAnalytics';
import { Button } from '@/components/ui/button';
import { Plus, Calendar } from 'lucide-react';

export default function HabitsPage() {
  const { user, loading, isFirebaseUser } = useAuth();
  const router = useRouter();
  const [habits, setHabits] = useState<Habit[]>([]);
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
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
      console.log('Fetching habits with userId:', userId);
      const userHabits = await getHybridHabits(userId);
      console.log('Fetched habits:', userHabits);
      setHabits(userHabits);
    } catch (error) {
      console.error('Error fetching habits:', error);
    } finally {
      setLoadingHabits(false);
    }
  };

  const handleHabitAdded = (newHabit: Habit) => {
    setHabits([newHabit, ...habits]);
  };

  const handleHabitDeleted = (habitId: string) => {
    console.log('handleHabitDeleted called for habit:', habitId);
    // Refresh the habits list from database instead of filtering local array
    fetchHabits();
  };

  const handleHabitUpdated = (updatedHabit: Habit) => {
    setHabits(habits.map(h => h.id === updatedHabit.id ? updatedHabit : h));
  };

  const handleFavoriteToggled = (habitId: string, isFavorite: boolean) => {
    // If a habit is unfavorited and we're on the habits page, keep it in the list
    // If a habit is favorited, also keep it in the list
    // The habits page shows all habits regardless of favorite status
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
          <Calendar className="w-3 h-3 sm:w-4 sm:h-4" />
          <span>Habits</span>
        </div>
        <h1 className="text-2xl sm:text-3xl md:text-4xl font-bold text-gray-900 mb-2">
          All Habits
        </h1>
        <p className="text-sm sm:text-base text-gray-500">
          Track your progress and build better habits
        </p>
      </div>

      {habits.length === 0 ? (
        <div className="text-center py-12 sm:py-16 border-2 border-dashed border-gray-300 rounded-2xl bg-gray-50">
          <div className="inline-flex items-center justify-center w-12 h-12 bg-gray-200 rounded-2xl mb-4">
            <Plus className="w-6 h-6 text-gray-400" />
          </div>
          <h3 className="text-base sm:text-lg font-medium text-gray-800 mb-2">
            No habits yet
          </h3>
          <p className="text-sm sm:text-base text-gray-500 mb-6">
            Start building better habits by creating your first one
          </p>
          <Button onClick={() => setIsAddDialogOpen(true)} className="w-full sm:w-auto">
            <Plus className="w-4 h-4 mr-2" />
            Add Your First Habit
          </Button>
        </div>
      ) : (
        <>
          <HabitAnalytics habits={habits} />
          
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
            <h2 className="text-xl sm:text-2xl font-semibold text-gray-800">
              Active Habits
            </h2>
            <Button onClick={() => setIsAddDialogOpen(true)} className="w-full sm:w-auto rounded-full">
              <Plus className="w-4 h-4 mr-2" />
              Add Habit
            </Button>
          </div>

          <HabitList
            habits={habits}
            onHabitDeleted={handleHabitDeleted}
            onHabitUpdated={handleHabitUpdated}
            onFavoriteToggled={handleFavoriteToggled}
            userId={isFirebaseUser && user ? (user as any).uid : undefined}
          />
        </>
      )}

      <AddHabitDialog
        open={isAddDialogOpen}
        onOpenChange={setIsAddDialogOpen}
        onHabitAdded={handleHabitAdded}
        userId={isFirebaseUser && user ? (user as any).uid : undefined}
      />
    </div>
  );
}