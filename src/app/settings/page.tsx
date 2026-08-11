'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import { Settings, Trash2, User, Shield, Info, LogOut, Moon, Sun, Bell, Palette } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useTheme } from 'next-themes';

export default function SettingsPage() {
  const { user, loading, isFirebaseUser, signOut } = useAuth();
  const router = useRouter();
  const { theme, setTheme } = useTheme();
  const [habitsCount, setHabitsCount] = useState(0);
  const [deletedCount, setDeletedCount] = useState(0);

  useEffect(() => {
    // Allow access for both authenticated and local users
    if (!loading) {
      // User is set (either Firebase or local), allow access
      fetchStats();
    }
  }, [loading]);

  const fetchStats = async () => {
    try {
      const { getHabits } = await import('@/lib/habitsHybrid');
      const { getDeletedHabits } = await import('@/lib/habitsHybrid');
      const userId = isFirebaseUser && user ? (user as any).uid : undefined;
      
      const habits = await getHabits(userId);
      const deleted = await getDeletedHabits(userId);
      
      setHabitsCount(habits.length);
      setDeletedCount(deleted.length);
    } catch (error) {
      console.error('Error fetching stats:', error);
    }
  };

  const handleSignOut = async () => {
    try {
      await signOut();
      router.push('/');
    } catch (error) {
      console.error('Error signing out:', error);
    }
  };

  const handleClearData = async () => {
    if (confirm('Are you sure you want to clear all local data? This action cannot be undone.')) {
      try {
        const { localStorageService } = await import('@/lib/localStorage');
        await localStorageService.clearAllData();
        alert('Local data cleared successfully');
        fetchStats();
      } catch (error) {
        console.error('Error clearing data:', error);
        alert('Failed to clear data');
      }
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-neutral-400"></div>
      </div>
    );
  }

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 md:px-8 py-8">
      {/* Page Header */}
      <div className="mb-6 sm:mb-8">
        <div className="flex items-center gap-2 text-gray-500 text-xs sm:text-sm mb-2">
          <Settings className="w-3 h-3 sm:w-4 sm:h-4" />
          <span>Settings</span>
        </div>
        <h1 className="text-2xl sm:text-3xl md:text-4xl font-bold text-gray-900 mb-2">
          Settings
        </h1>
        <p className="text-sm sm:text-base text-gray-500">
          Manage your account and preferences
        </p>
      </div>

      {/* Account Section */}
      <div className="bg-white border border-neutral-200 rounded-3xl p-4 sm:p-6 mb-4">
        <div className="flex items-center gap-3 mb-4">
          <div className="w-10 h-10 bg-neutral-100 rounded-full flex items-center justify-center">
            <User className="w-5 h-5 text-gray-600" />
          </div>
          <h2 className="text-lg sm:text-xl font-semibold text-gray-900">Account</h2>
        </div>
        
        <div className="space-y-4">
          <div className="flex items-center justify-between py-3 border-b border-neutral-100">
            <div>
              <p className="text-sm font-medium text-gray-900">Account Type</p>
              <p className="text-xs text-gray-500">
                {isFirebaseUser ? 'Google Account' : 'Local Account (Offline)'}
              </p>
            </div>
            <div className="w-8 h-8 bg-neutral-100 rounded-full flex items-center justify-center">
              {isFirebaseUser ? (
                <Shield className="w-4 h-4 text-blue-600" />
              ) : (
                <Shield className="w-4 h-4 text-gray-500" />
              )}
            </div>
          </div>

          {isFirebaseUser && user && (
            <>
              <div className="flex items-center justify-between py-3 border-b border-neutral-100">
                <div>
                  <p className="text-sm font-medium text-gray-900">Email</p>
                  <p className="text-xs text-gray-500">{(user as any).email}</p>
                </div>
              </div>
              <div className="flex items-center justify-between py-3">
                <div>
                  <p className="text-sm font-medium text-gray-900">Display Name</p>
                  <p className="text-xs text-gray-500">{(user as any).displayName || 'Not set'}</p>
                </div>
              </div>
            </>
          )}

          <div className="pt-4">
            <Button
              variant="outline"
              onClick={handleSignOut}
              className="w-full sm:w-auto"
            >
              <LogOut className="w-4 h-4 mr-2" />
              Sign Out
            </Button>
          </div>
        </div>
      </div>

      {/* Habits Management Section */}
      <div className="bg-white border border-neutral-200 rounded-3xl p-4 sm:p-6 mb-4">
        <div className="flex items-center gap-3 mb-4">
          <div className="w-10 h-10 bg-orange-100 rounded-full flex items-center justify-center">
            <Trash2 className="w-5 h-5 text-orange-600" />
          </div>
          <h2 className="text-lg sm:text-xl font-semibold text-gray-900">Habits Management</h2>
        </div>
        
        <div className="space-y-3">
          <div className="flex items-center justify-between py-3 border-b border-neutral-100">
            <div>
              <p className="text-sm font-medium text-gray-900">Active Habits</p>
              <p className="text-xs text-gray-500">Habits you're currently tracking</p>
            </div>
            <span className="text-2xl font-bold text-gray-900">{habitsCount}</span>
          </div>

          <div className="flex items-center justify-between py-3">
            <div>
              <p className="text-sm font-medium text-gray-900">Trash</p>
              <p className="text-xs text-gray-500">Deleted habits (30 days retention)</p>
            </div>
            <div className="flex items-center gap-3">
              <span className="text-2xl font-bold text-gray-900">{deletedCount}</span>
              <Button
                variant="outline"
                size="sm"
                onClick={() => router.push('/trash')}
                className="rounded-xl"
              >
                <Trash2 className="w-4 h-4 mr-1" />
                View Trash
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* Preferences Section */}
      <div className="bg-white border border-neutral-200 rounded-3xl p-4 sm:p-6 mb-4">
        <div className="flex items-center gap-3 mb-4">
          <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
            <Palette className="w-5 h-5 text-blue-600" />
          </div>
          <h2 className="text-lg sm:text-xl font-semibold text-gray-900">Preferences</h2>
        </div>
        
        <div className="space-y-4">
          <div className="flex items-center justify-between py-3 border-b border-neutral-100">
            <div>
              <p className="text-sm font-medium text-gray-900">Theme</p>
              <p className="text-xs text-gray-500">Choose your preferred theme</p>
            </div>
            <div className="flex items-center gap-2">
              <Button
                variant={theme === 'light' ? 'default' : 'outline'}
                size="sm"
                onClick={() => setTheme('light')}
                className="rounded-xl"
              >
                <Sun className="w-4 h-4 mr-1" />
                Light
              </Button>
              <Button
                variant={theme === 'dark' ? 'default' : 'outline'}
                size="sm"
                onClick={() => setTheme('dark')}
                className="rounded-xl"
              >
                <Moon className="w-4 h-4 mr-1" />
                Dark
              </Button>
            </div>
          </div>

          <div className="flex items-center justify-between py-3">
            <div>
              <p className="text-sm font-medium text-gray-900">Notifications</p>
              <p className="text-xs text-gray-500">Habit reminders (coming soon)</p>
            </div>
            <Button
              variant="outline"
              size="sm"
              disabled
              className="rounded-xl"
            >
              <Bell className="w-4 h-4 mr-1" />
              Configure
            </Button>
          </div>
        </div>
      </div>

      {/* Data Management Section */}
      <div className="bg-white border border-neutral-200 rounded-3xl p-4 sm:p-6 mb-4">
        <div className="flex items-center gap-3 mb-4">
          <div className="w-10 h-10 bg-red-100 rounded-full flex items-center justify-center">
            <Shield className="w-5 h-5 text-red-600" />
          </div>
          <h2 className="text-lg sm:text-xl font-semibold text-gray-900">Data Management</h2>
        </div>
        
        <div className="space-y-4">
          <div className="flex items-center justify-between py-3 border-b border-neutral-100">
            <div>
              <p className="text-sm font-medium text-gray-900">Clear Local Data</p>
              <p className="text-xs text-gray-500">Remove all offline data from this device</p>
            </div>
            <Button
              variant="outline"
              size="sm"
              onClick={handleClearData}
              className="rounded-xl text-red-600 hover:text-red-700 hover:bg-red-50"
            >
              Clear Data
            </Button>
          </div>

          <div className="flex items-center justify-between py-3">
            <div>
              <p className="text-sm font-medium text-gray-900">Export Data</p>
              <p className="text-xs text-gray-500">Download your habit data (coming soon)</p>
            </div>
            <Button
              variant="outline"
              size="sm"
              disabled
              className="rounded-xl"
            >
              Export
            </Button>
          </div>
        </div>
      </div>

      {/* About Section */}
      <div className="bg-white border border-neutral-200 rounded-3xl p-4 sm:p-6">
        <div className="flex items-center gap-3 mb-4">
          <div className="w-10 h-10 bg-neutral-100 rounded-full flex items-center justify-center">
            <Info className="w-5 h-5 text-gray-600" />
          </div>
          <h2 className="text-lg sm:text-xl font-semibold text-gray-900">About</h2>
        </div>
        
        <div className="space-y-3">
          <div className="flex items-center justify-between py-3 border-b border-neutral-100">
            <div>
              <p className="text-sm font-medium text-gray-900">Version</p>
              <p className="text-xs text-gray-500">Current app version</p>
            </div>
            <span className="text-sm font-semibold text-gray-900">1.3.0</span>
          </div>

          <div className="flex items-center justify-between py-3">
            <div>
              <p className="text-sm font-medium text-gray-900">Habito</p>
              <p className="text-xs text-gray-500">Build better habits, one day at a time</p>
            </div>
            <span className="text-sm text-gray-500">© 2026</span>
          </div>
        </div>
      </div>
    </div>
  );
}