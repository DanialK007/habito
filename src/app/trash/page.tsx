'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import { Habit } from '@/types/habit';
import { getDeletedHabits, restoreHabit, deleteHabit } from '@/lib/firebase/habits';
import Sidebar from '@/components/Sidebar';
import { Trash2, RotateCcw, Trash } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';

export default function TrashPage() {
  const { user, loading } = useAuth();
  const router = useRouter();
  const [habits, setHabits] = useState<Habit[]>([]);
  const [loadingHabits, setLoadingHabits] = useState(true);
  const [restoringId, setRestoringId] = useState<string | null>(null);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [habitToDelete, setHabitToDelete] = useState<Habit | null>(null);

  useEffect(() => {
    if (!loading && !user) {
      router.push('/');
    }
  }, [user, loading, router]);

  useEffect(() => {
    const fetchHabits = async () => {
      if (user) {
        try {
          const deletedHabits = await getDeletedHabits(user.uid);
          setHabits(deletedHabits);
        } catch (error) {
          console.error('Error fetching habits:', error);
        } finally {
          setLoadingHabits(false);
        }
      }
    };

    fetchHabits();
  }, [user]);

  const handleRestore = async (habitId: string) => {
    setRestoringId(habitId);
    try {
      await restoreHabit(habitId);
      setHabits(habits.filter(h => h.id !== habitId));
    } catch (error) {
      console.error('Error restoring habit:', error);
    } finally {
      setRestoringId(null);
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
      await deleteHabit(habitToDelete.id);
      setHabits(habits.filter(h => h.id !== habitToDelete.id));
      setDeleteDialogOpen(false);
      setHabitToDelete(null);
    } catch (error) {
      console.error('Error permanently deleting habit:', error);
    } finally {
      setDeletingId(null);
    }
  };

  const cancelDelete = () => {
    setDeleteDialogOpen(false);
    setHabitToDelete(null);
  };

  if (loading || loadingHabits) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-stone-50">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-stone-400"></div>
      </div>
    );
  }

  return (
    <>
    <div className="flex min-h-screen bg-stone-50">
      <Sidebar />
      
      <main className="flex-1  pt-16 lg:pt-0">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="mb-6 sm:mb-8">
            <div className="flex items-center gap-2 text-stone-400 text-xs sm:text-sm mb-2">
              <Trash2 className="w-3 h-3 sm:w-4 sm:h-4" />
              <span>Trash</span>
            </div>
            <h1 className="text-2xl sm:text-3xl md:text-4xl font-bold text-stone-900 mb-2">
              Trash
            </h1>
            <p className="text-sm sm:text-base text-stone-600">
              Deleted habits are stored here for 30 days
            </p>
          </div>

          {habits.length === 0 ? (
            <div className="text-center py-12 sm:py-16">
              <div className="inline-flex items-center justify-center w-12 h-12 bg-stone-100 rounded-full mb-4">
                <Trash2 className="w-6 h-6 text-stone-400" />
              </div>
              <h3 className="text-base sm:text-lg font-medium text-stone-900 mb-2">
                Trash is empty
              </h3>
              <p className="text-sm sm:text-base text-stone-500">
                Deleted habits will appear here
              </p>
            </div>
          ) : (
            <div className="space-y-2">
              {habits.map((habit) => (
                <div
                  key={habit.id}
                  className="bg-white border border-stone-200 rounded-sm p-4 flex items-center justify-between"
                >
                  <div className="flex-1 min-w-0">
                    <h3 className="text-sm font-medium text-stone-700 mb-1">
                      {habit.title}
                    </h3>
                    {habit.description && (
                      <p className="text-xs text-stone-500 truncate">
                        {habit.description}
                      </p>
                    )}
                    <p className="text-xs text-stone-400 mt-1">
                      Deleted {habit.deletedAt ? new Date(habit.deletedAt).toLocaleDateString() : 'recently'}
                    </p>
                  </div>
                  <div className="flex items-center gap-2 ml-4">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleRestore(habit.id)}
                      disabled={restoringId === habit.id}
                      className="h-8 px-3 text-stone-600 hover:text-stone-900"
                    >
                      <RotateCcw className="w-4 h-4 mr-1" />
                      {restoringId === habit.id ? 'Restoring...' : 'Restore'}
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleDeleteClick(habit)}
                      disabled={deletingId === habit.id}
                      className="h-8 px-3 text-red-500 hover:text-red-700"
                    >
                      <Trash className="w-4 h-4 mr-1" />
                      {deletingId === habit.id ? 'Deleting...' : 'Delete'}
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </main>
    </div>

    {/* Delete Confirmation Dialog */}
    <Dialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Permanently Delete</DialogTitle>
          <DialogDescription>
            Are you sure you want to permanently delete "{habitToDelete?.title}"? This action cannot be undone.
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
            {deletingId ? "Deleting..." : "Delete Permanently"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
    </>
  );
}
