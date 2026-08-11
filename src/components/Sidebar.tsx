'use client';

import { useState } from 'react';
import { usePathname } from 'next/navigation';
import { 
  Home, 
  Calendar, 
  Settings, 
  LogOut, 
  ChevronRight, 
  ChevronDown,
  Plus,
  Search,
  Star,
  Trash2
} from 'lucide-react';
import { useAuth } from '@/context/AuthContext';
import Link from 'next/link';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';

export default function Sidebar() {
  const { user, signOut, isFirebaseUser } = useAuth();
  const pathname = usePathname();
  const [expandedSections, setExpandedSections] = useState<Record<string, boolean>>({
    habits: true,
  });
  const [logoutDialogOpen, setLogoutDialogOpen] = useState(false);
  const [isSigningOut, setIsSigningOut] = useState(false);

  const toggleSection = (section: string) => {
    setExpandedSections(prev => ({
      ...prev,
      [section]: !prev[section]
    }));
  };

  const handleSignOutClick = () => {
    setLogoutDialogOpen(true);
  };

  const confirmSignOut = async () => {
    setIsSigningOut(true);
    try {
      await signOut();
      window.location.href = '/';
    } catch (error) {
      console.error('Error signing out:', error);
      setIsSigningOut(false);
    }
  };

  const cancelSignOut = () => {
    setLogoutDialogOpen(false);
  };

  const isActive = (path: string) => pathname === path;

  return (
    <div className='h-screen p-2 hidden md:block md:sticky md:top-0 md:z-50'>
      <aside className="h-full bg-linear-to-br to-orange-50 border border-neutral-200 rounded-3xl flex flex-col w-60">
        {/* Workspace Header */}
        <div className="p-4 border-b border-neutral-200">
          <Link href="/dashboard" className="flex items-center gap-2 px-2 py-1.5 hover:bg-neutral-50 rounded-full cursor-pointer transition-colors">
            <img 
              src="/logo.png" 
              alt="Habito" 
              className="w-8 h-8 rounded-full object-cover"
            />
            <span className="text-sm font-semibold text-gray-900">Habito</span>
          </Link>
        </div>

        {/* Search */}
        <div className="p-3">
          <button className="w-full flex items-center gap-2 px-4 py-2 text-gray-500 hover:bg-neutral-50 rounded-full text-sm transition-colors border border-transparent hover:border-neutral-200">
            <Search className="w-4 h-4" />
            <span>Search</span>
          </button>
        </div>

        {/* Navigation */}
        <div className="flex-1 overflow-y-auto px-3">
          <nav className="space-y-1">
            <Link 
              href="/dashboard"
              className={`w-full flex items-center gap-2 px-4 py-2 rounded-full text-sm transition-colors border border-transparent ${
                isActive('/dashboard') ? 'bg-neutral-100 text-orange-500 font-semibold' : 'text-gray-900 hover:bg-neutral-50 hover:border-neutral-200'
              }`}
            >
              <Home className="w-4 h-4" />
              <span>Home</span>
            </Link>

            {/* Habits Section */}
            <div>
              <button
                onClick={() => toggleSection('habits')}
                className="w-full flex items-center justify-between px-4 py-2 text-gray-900 hover:bg-neutral-50 rounded-full text-sm transition-colors border border-transparent hover:border-neutral-200"
              >
                <div className="flex items-center gap-2">
                  {expandedSections.habits ? (
                    <ChevronDown className="w-4 h-4" />
                  ) : (
                    <ChevronRight className="w-4 h-4" />
                  )}
                  <span>Habits</span>
                </div>
                <Plus className="w-4 h-4 text-gray-500" />
              </button>

              {expandedSections.habits && (
                <div className="ml-4 mt-1 space-y-0.5">
                  <Link 
                    href="/habits"
                    className={`w-full flex items-center gap-2 px-4 py-2 rounded-full text-sm transition-colors border border-transparent ${
                      isActive('/habits') ? 'bg-neutral-100 text-orange-500 font-semibold' : 'text-gray-500 hover:bg-neutral-50 hover:border-neutral-200'
                    }`}
                  >
                    <Calendar className="w-4 h-4" />
                    <span>All Habits</span>
                  </Link>
                  <Link 
                    href="/favorites"
                    className={`w-full flex items-center gap-2 px-4 py-2 rounded-full text-sm transition-colors border border-transparent ${
                      isActive('/favorites') ? 'bg-neutral-100 text-orange-500 font-semibold' : 'text-gray-500 hover:bg-neutral-50 hover:border-neutral-200'
                    }`}
                  >
                    <Star className="w-4 h-4" />
                    <span>Favorites</span>
                  </Link>
                  <Link 
                    href="/trash"
                    className={`w-full flex items-center gap-2 px-4 py-2 rounded-full text-sm transition-colors border border-transparent ${
                      isActive('/trash') ? 'bg-neutral-100 text-orange-500 font-semibold' : 'text-gray-500 hover:bg-neutral-50 hover:border-neutral-200'
                    }`}
                  >
                    <Trash2 className="w-4 h-4" />
                    <span>Trash</span>
                  </Link>
                </div>
              )}
            </div>

            <Link 
              href="/settings"
              className={`w-full flex items-center gap-2 px-4 py-2 rounded-full text-sm transition-colors border border-transparent ${
                isActive('/settings') ? 'bg-neutral-100 text-orange-500 font-semibold' : 'text-gray-900 hover:bg-neutral-50 hover:border-neutral-200'
              }`}
            >
              <Settings className="w-4 h-4" />
              <span>Settings</span>
            </Link>
          </nav>
        </div>

        {/* User Section */}
        <div className="p-3 border-t border-neutral-200">
          <div className="flex items-center gap-2 px-2 py-2">
            {(user as any)?.photoURL && (
              <img
                src={(user as any).photoURL}
                alt="User avatar"
                className="w-8 h-8 rounded-full object-cover"
              />
            )}
            <span className="text-sm text-gray-800 truncate flex-1 font-medium">
              {(user as any)?.displayName || 'User'}
            </span>
            <button
              onClick={handleSignOutClick}
              className="p-2 hover:bg-neutral-100 rounded-lg transition-colors"
              title={isFirebaseUser ? "Sign out" : "Reset data"}
            >
              <LogOut className="w-4 h-4 text-gray-400" />
            </button>
          </div>
        </div>
      </aside>

      {/* Logout Confirmation Dialog */}
      <Dialog open={logoutDialogOpen} onOpenChange={setLogoutDialogOpen}>
        <DialogContent className="rounded-2xl bg-neutral-50 min-w-72">
          <DialogHeader>
            <DialogTitle className="text-gray-800">{isFirebaseUser ? 'Sign Out' : 'Reset Data'}</DialogTitle>
            <DialogDescription className="text-gray-500">
              {isFirebaseUser 
                ? 'Are you sure you want to sign out?' 
                : 'This will clear all your local data. This action cannot be undone.'}
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="ghost" onClick={cancelSignOut} className="rounded-2xl bg-neutral-200 hover:bg-neutral-300 text-gray-600 hover:text-gray-800">
              Cancel
            </Button>
            <Button 
              variant="destructive" 
              onClick={confirmSignOut}
              disabled={isSigningOut}
              className="rounded-2xl bg-red-500 hover:bg-red-600 text-white"
            >
              {isSigningOut ? "Signing out..." : (isFirebaseUser ? "Sign Out" : "Reset Data")}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}