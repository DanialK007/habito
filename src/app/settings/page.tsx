'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import Sidebar from '@/components/Sidebar';
import { Settings } from 'lucide-react';

export default function SettingsPage() {
  const { user, loading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!loading && !user) {
      router.push('/');
    }
  }, [user, loading, router]);

  if (loading) {
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
          <div className="mb-6 sm:mb-8">
            <div className="flex items-center gap-2 text-stone-400 text-xs sm:text-sm mb-2">
              <Settings className="w-3 h-3 sm:w-4 sm:h-4" />
              <span>Settings</span>
            </div>
            <h1 className="text-2xl sm:text-3xl md:text-4xl font-bold text-stone-900 mb-2">
              Settings
            </h1>
            <p className="text-sm sm:text-base text-stone-600">
              Manage your account and preferences
            </p>
          </div>

          <div className="bg-white border border-stone-200 rounded-sm p-4 sm:p-6">
            <h2 className="text-base sm:text-lg font-semibold text-stone-900 mb-4">Account Information</h2>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-stone-700 mb-1">Email</label>
                <p className="text-sm sm:text-base text-stone-600">{user?.email}</p>
              </div>
              <div>
                <label className="block text-sm font-medium text-stone-700 mb-1">Display Name</label>
                <p className="text-sm sm:text-base text-stone-600">{user?.displayName || 'Not set'}</p>
              </div>
            </div>
          </div>

          <div className="bg-white border border-stone-200 rounded-sm p-4 sm:p-6 mt-4">
            <h2 className="text-base sm:text-lg font-semibold text-stone-900 mb-4">Preferences</h2>
            <p className="text-sm sm:text-base text-stone-500">More settings coming soon...</p>
          </div>
        </div>
      </main>
    </div>
  );
}
