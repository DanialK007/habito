'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import { Button } from '@/components/ui/button';
import { Flame, Target, TrendingUp, Check, Calendar, Shield, Zap } from 'lucide-react';

export default function Home() {
  const { user, loading, signInWithGoogle } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (user && !loading) {
      router.push('/dashboard');
    }
  }, [user, loading, router]);

  const handleSignIn = async () => {
    try {
      await signInWithGoogle();
    } catch (error) {
      console.error('Failed to sign in:', error);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-stone-50">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-stone-400"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-stone-50">
      {/* Navigation */}
      <nav className="border-b border-stone-200 bg-white">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 md:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center gap-2">
              <img 
                src="/logo.png" 
                alt="Habito" 
                className="w-8 h-8 rounded-2xl object-cover"
              />
              <span className="text-xl font-semibold text-stone-900">Habito</span>
            </div>
            <Button 
              onClick={handleSignIn}
              variant="ghost"
              className="text-stone-600 hover:text-stone-900"
            >
              Sign In
            </Button>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="py-20 sm:py-32">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 md:px-8">
          <div className="text-center max-w-3xl mx-auto">
            <h1 className="text-4xl sm:text-5xl md:text-6xl font-bold text-stone-900 mb-6">
              Build better habits,
              <span className="text-stone-400"> one day at a time</span>
            </h1>
            <p className="text-lg sm:text-xl text-stone-600 mb-8">
              A simple, elegant habit tracker designed to help you stay consistent and achieve your goals. Track progress, build streaks, and transform your daily routine.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button 
                onClick={handleSignIn}
                size="lg"
                className="h-12 text-base"
              >
                <svg className="w-5 h-5 mr-2" viewBox="0 0 24 24">
                  <path
                    fill="currentColor"
                    d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                  />
                  <path
                    fill="currentColor"
                    d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                  />
                  <path
                    fill="currentColor"
                    d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                  />
                  <path
                    fill="currentColor"
                    d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                  />
                </svg>
                Start with Google
              </Button>
              <Button 
                variant="outline"
                size="lg"
                className="h-12 text-base"
                onClick={() => router.push('/dashboard')}
              >
                Try Demo
              </Button>
            </div>
            <p className="text-sm text-stone-400 mt-4">
              Free to use • No credit card required
            </p>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20 bg-white">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 md:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl sm:text-4xl font-bold text-stone-900 mb-4">
              Everything you need to build lasting habits
            </h2>
            <p className="text-lg text-stone-600 max-w-2xl mx-auto">
              Simple tools designed to help you stay consistent and motivated on your journey.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="bg-stone-50 border border-stone-200 rounded-2xl p-6">
              <div className="w-12 h-12 bg-orange-100 rounded-2xl flex items-center justify-center mb-4">
                <Flame className="w-6 h-6 text-orange-600" />
              </div>
              <h3 className="text-lg font-semibold text-stone-900 mb-2">
                Track Streaks
              </h3>
              <p className="text-stone-600">
                Build momentum with streak tracking. Visual indicators show your consistency and motivate you to keep going.
              </p>
            </div>

            <div className="bg-stone-50 border border-stone-200 rounded-2xl p-6">
              <div className="w-12 h-12 bg-green-100 rounded-2xl flex items-center justify-center mb-4">
                <Calendar className="w-6 h-6 text-green-600" />
              </div>
              <h3 className="text-lg font-semibold text-stone-900 mb-2">
                Calendar View
              </h3>
              <p className="text-stone-600">
                See your progress at a glance with an intuitive calendar view. Track completions and identify patterns in your routine.
              </p>
            </div>

            <div className="bg-stone-50 border border-stone-200 rounded-2xl p-6">
              <div className="w-12 h-12 bg-blue-100 rounded-2xl flex items-center justify-center mb-4">
                <TrendingUp className="w-6 h-6 text-blue-600" />
              </div>
              <h3 className="text-lg font-semibold text-stone-900 mb-2">
                Analytics Dashboard
              </h3>
              <p className="text-stone-600">
                Get insights into your habit performance with completion rates, streaks, and progress analytics.
              </p>
            </div>

            <div className="bg-stone-50 border border-stone-200 rounded-2xl p-6">
              <div className="w-12 h-12 bg-purple-100 rounded-2xl flex items-center justify-center mb-4">
                <Zap className="w-6 h-6 text-purple-600" />
              </div>
              <h3 className="text-lg font-semibold text-stone-900 mb-2">
                Custom Schedules
              </h3>
              <p className="text-stone-600">
                Set daily, weekly, or custom schedules that fit your lifestyle. Track habits on specific days that work for you.
              </p>
            </div>

            <div className="bg-stone-50 border border-stone-200 rounded-2xl p-6">
              <div className="w-12 h-12 bg-stone-100 rounded-2xl flex items-center justify-center mb-4">
                <Shield className="w-6 h-6 text-stone-600" />
              </div>
              <h3 className="text-lg font-semibold text-stone-900 mb-2">
                Safe & Private
              </h3>
              <p className="text-stone-600">
                Your data is securely stored and protected. Focus on your habits without worrying about privacy.
              </p>
            </div>

            <div className="bg-stone-50 border border-stone-200 rounded-2xl p-6">
              <div className="w-12 h-12 bg-red-100 rounded-2xl flex items-center justify-center mb-4">
                <Check className="w-6 h-6 text-red-600" />
              </div>
              <h3 className="text-lg font-semibold text-stone-900 mb-2">
                Simple & Clean
              </h3>
              <p className="text-stone-600">
                No clutter, no complexity. Just a clean, focused interface designed to help you build habits, not distract you.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section className="py-20 bg-stone-50">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 md:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl sm:text-4xl font-bold text-stone-900 mb-4">
              How it works
            </h2>
            <p className="text-lg text-stone-600 max-w-2xl mx-auto">
              Get started in minutes and begin building better habits today.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="text-center">
              <div className="w-16 h-16 bg-stone-900 rounded-full flex items-center justify-center mx-auto mb-4 text-white text-2xl font-bold">
                1
              </div>
              <h3 className="text-lg font-semibold text-stone-900 mb-2">
                Create Habits
              </h3>
              <p className="text-stone-600">
                Add the habits you want to build with custom names, descriptions, and schedules.
              </p>
            </div>

            <div className="text-center">
              <div className="w-16 h-16 bg-stone-900 rounded-full flex items-center justify-center mx-auto mb-4 text-white text-2xl font-bold">
                2
              </div>
              <h3 className="text-lg font-semibold text-stone-900 mb-2">
                Track Daily
              </h3>
              <p className="text-stone-600">
                Mark your habits as complete each day. Watch your streaks grow and progress accumulate.
              </p>
            </div>

            <div className="text-center">
              <div className="w-16 h-16 bg-stone-900 rounded-full flex items-center justify-center mx-auto mb-4 text-white text-2xl font-bold">
                3
              </div>
              <h3 className="text-lg font-semibold text-stone-900 mb-2">
                Build Momentum
              </h3>
              <p className="text-stone-600">
                Review your progress, identify patterns, and stay motivated with analytics and insights.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-stone-900">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 md:px-8 text-center">
          <h2 className="text-3xl sm:text-4xl font-bold text-white mb-4">
            Ready to build better habits?
          </h2>
          <p className="text-lg text-stone-300 mb-8">
            Join thousands of people who are transforming their daily routines with Habito.
          </p>
          <Button 
            onClick={handleSignIn}
            size="lg"
            className="h-12 text-base bg-white text-stone-900 hover:bg-stone-100"
          >
            <svg className="w-5 h-5 mr-2" viewBox="0 0 24 24">
              <path
                fill="currentColor"
                d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
              />
              <path
                fill="currentColor"
                d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
              />
              <path
                fill="currentColor"
                d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
              />
              <path
                fill="currentColor"
                d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
              />
            </svg>
            Get Started Free
          </Button>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-stone-50 border-t border-stone-200 py-8">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 md:px-8">
          <div className="flex flex-col sm:flex-row justify-between items-center gap-4">
            <div className="flex items-center gap-2">
              <div className="w-6 h-6 bg-stone-900 rounded-2xl flex items-center justify-center">
                <Target className="w-4 h-4 text-white" />
              </div>
              <span className="text-sm font-medium text-stone-900">Habito</span>
            </div>
            <p className="text-sm text-stone-400">
              © 2024 Habito. Built with simplicity in mind.
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}
