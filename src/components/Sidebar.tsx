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
  Trash2,
  Menu,
  X
} from 'lucide-react';
import { useAuth } from '@/context/AuthContext';
import Link from 'next/link';

export default function Sidebar() {
  const { user, signOut } = useAuth();
  const pathname = usePathname();
  const [expandedSections, setExpandedSections] = useState<Record<string, boolean>>({
    habits: true,
  });
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const toggleSection = (section: string) => {
    setExpandedSections(prev => ({
      ...prev,
      [section]: !prev[section]
    }));
  };

  const handleSignOut = async () => {
    try {
      await signOut();
      window.location.href = '/';
    } catch (error) {
      console.error('Error signing out:', error);
    }
  };

  const isActive = (path: string) => pathname === path;

  return (
    <>
      {/* Mobile menu button */}
      <button
        onClick={() => setIsMobileMenuOpen(true)}
        className="lg:hidden fixed top-4 left-4 z-50 p-2 bg-white border border-stone-200 rounded-lg shadow-sm"
      >
        <Menu className="w-5 h-5 text-stone-700" />
      </button>

      {/* Mobile overlay */}
      {isMobileMenuOpen && (
        <div
          className="lg:hidden fixed inset-0 bg-black/50 z-40"
          onClick={() => setIsMobileMenuOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside className={`
        fixed lg:static left-0 top-0 h-screen bg-stone-50 border-r border-stone-200 
        flex flex-col z-50 transition-transform duration-300 ease-in-out
        ${isMobileMenuOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}
        w-60
      `}>
        {/* Mobile close button */}
        <button
          onClick={() => setIsMobileMenuOpen(false)}
          className="lg:hidden absolute top-4 right-4 p-2 hover:bg-stone-200 rounded"
        >
          <X className="w-5 h-5 text-stone-500" />
        </button>

        {/* Workspace Header */}
        <div className="p-3 border-b border-stone-200">
          <Link href="/dashboard" className="flex items-center gap-2 px-2 py-1.5 hover:bg-stone-200 rounded cursor-pointer">
            <div className="w-6 h-6 bg-blue-500 rounded flex items-center justify-center text-white text-xs font-semibold">
              H
            </div>
            <span className="text-sm font-medium text-stone-800">Habito</span>
          </Link>
        </div>

        {/* Search */}
        <div className="p-2">
          <button className="w-full flex items-center gap-2 px-2 py-1.5 text-stone-500 hover:bg-stone-200 rounded text-sm">
            <Search className="w-4 h-4" />
            <span>Search</span>
          </button>
        </div>

        {/* Navigation */}
        <div className="flex-1 overflow-y-auto px-2">
          <nav className="space-y-1">
            <Link 
              href="/dashboard"
              onClick={() => setIsMobileMenuOpen(false)}
              className={`w-full flex items-center gap-2 px-2 py-1.5 rounded text-sm ${
                isActive('/dashboard') ? 'bg-stone-200 text-stone-900' : 'text-stone-700 hover:bg-stone-200'
              }`}
            >
              <Home className="w-4 h-4" />
              <span>Home</span>
            </Link>

            {/* Habits Section */}
            <div>
              <button
                onClick={() => toggleSection('habits')}
                className="w-full flex items-center justify-between px-2 py-1.5 text-stone-700 hover:bg-stone-200 rounded text-sm"
              >
                <div className="flex items-center gap-2">
                  {expandedSections.habits ? (
                    <ChevronDown className="w-4 h-4" />
                  ) : (
                    <ChevronRight className="w-4 h-4" />
                  )}
                  <span>Habits</span>
                </div>
                <Plus className="w-4 h-4 text-stone-400" />
              </button>

              {expandedSections.habits && (
                <div className="ml-4 mt-1 space-y-0.5">
                  <Link 
                    href="/habits"
                    onClick={() => setIsMobileMenuOpen(false)}
                    className={`w-full flex items-center gap-2 px-2 py-1.5 rounded text-sm ${
                      isActive('/habits') ? 'bg-stone-200 text-stone-900' : 'text-stone-600 hover:bg-stone-200'
                    }`}
                  >
                    <Calendar className="w-4 h-4" />
                    <span>All Habits</span>
                  </Link>
                  <Link 
                    href="/favorites"
                    onClick={() => setIsMobileMenuOpen(false)}
                    className={`w-full flex items-center gap-2 px-2 py-1.5 rounded text-sm ${
                      isActive('/favorites') ? 'bg-stone-200 text-stone-900' : 'text-stone-600 hover:bg-stone-200'
                    }`}
                  >
                    <Star className="w-4 h-4" />
                    <span>Favorites</span>
                  </Link>
                  <Link 
                    href="/trash"
                    onClick={() => setIsMobileMenuOpen(false)}
                    className={`w-full flex items-center gap-2 px-2 py-1.5 rounded text-sm ${
                      isActive('/trash') ? 'bg-stone-200 text-stone-900' : 'text-stone-600 hover:bg-stone-200'
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
              onClick={() => setIsMobileMenuOpen(false)}
              className={`w-full flex items-center gap-2 px-2 py-1.5 rounded text-sm ${
                isActive('/settings') ? 'bg-stone-200 text-stone-900' : 'text-stone-700 hover:bg-stone-200'
              }`}
            >
              <Settings className="w-4 h-4" />
              <span>Settings</span>
            </Link>
          </nav>
        </div>

        {/* User Section */}
        <div className="p-2 border-t border-stone-200">
          <div className="flex items-center gap-2 px-2 py-1.5">
            {user?.photoURL && (
              <img
                src={user.photoURL}
                alt="User avatar"
                className="w-6 h-6 rounded-full"
              />
            )}
            <span className="text-sm text-stone-700 truncate flex-1">
              {user?.displayName || 'User'}
            </span>
            <button
              onClick={handleSignOut}
              className="p-1 hover:bg-stone-200 rounded"
              title="Sign out"
            >
              <LogOut className="w-4 h-4 text-stone-500" />
            </button>
          </div>
        </div>
      </aside>
    </>
  );
}
