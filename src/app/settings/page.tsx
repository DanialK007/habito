'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import { Settings } from 'lucide-react';

export default function SettingsPage() {
  const { user, loading, isFirebaseUser } = useAuth();
  const router = useRouter();

  useEffect(() => {
    // Allow access for both authenticated and local users
    if (!loading) {
      // User is set (either Firebase or local), allow access
    }
  }, [loading]);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-50">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-400"></div>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-50">
        <div className="text-center">
          <p className="text-gray-600">Loading account information...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
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

      <div className="bg-white border border-gray-200 rounded-sm p-4 sm:p-6">
        <h2 className="text-base sm:text-lg font-semibold text-gray-900 mb-4">Account Information</h2>
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Account Type</label>
            <p className="text-sm sm:text-base text-gray-600">
              {isFirebaseUser ? 'Google Account' : 'Local Account (Offline)'}
            </p>
          </div>
          {isFirebaseUser && user && (
            <>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
                <p className="text-sm sm:text-base text-gray-600">{(user as any).email}</p>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Display Name</label>
                <p className="text-sm sm:text-base text-gray-600">{(user as any).displayName || 'Not set'}</p>
              </div>
            </>
          )}
        </div>
      </div>

      <div className="bg-white border border-gray-200 rounded-sm p-4 sm:p-6 mt-4">
        <h2 className="text-base sm:text-lg font-semibold text-gray-900 mb-4">Preferences</h2>
        <p className="text-sm sm:text-base text-gray-500">More settings coming soon...</p>
      </div>
    </div>
  );
}