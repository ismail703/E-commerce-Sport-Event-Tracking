'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Header } from '@/components/header';
import { Footer } from '@/components/footer';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useAuth } from '@/lib/auth-store';
import { useTracking } from '@/hooks/use-tracking';
import { Loader2, AlertCircle } from 'lucide-react';

type AuthMode = 'login' | 'register';

export default function AuthPage() {
  const router = useRouter();
  const { isAuthenticated, login, register } = useAuth();
  const { trackPageView, trackClick, trackLogin } = useTracking();

  // Form state
  const [mode, setMode] = useState<AuthMode>('login');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  // Track page view
  useEffect(() => {
    trackPageView('/auth', document.referrer);
  }, [trackPageView]);

  // Redirect if already authenticated
  useEffect(() => {
    if (isAuthenticated) {
      router.push('/');
    }
  }, [isAuthenticated, router]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    trackClick(`${mode}_submit`, '/auth');

    try {
      let result;

      if (mode === 'login') {
        result = await login(email, password);
        if (result.success) {
          trackLogin('/auth');
        }
      } else {
        result = await register(email, password, name);
        if (result.success) {
          trackLogin('/auth');
        }
      }

      if (!result.success) {
        setError(result.error || 'An error occurred');
      }
    } catch {
      setError('An unexpected error occurred');
    } finally {
      setLoading(false);
    }
  };

  const switchMode = () => {
    setMode(mode === 'login' ? 'register' : 'login');
    setError('');
    trackClick(`switch_to_${mode === 'login' ? 'register' : 'login'}`, '/auth');
  };

  return (
    <div className="flex min-h-screen flex-col">
      <Header />
      <main className="flex flex-1 items-center justify-center py-12">
        <div className="mx-auto w-full max-w-md px-4">
          <div className="rounded-lg border border-border bg-card p-8">
            <div className="text-center">
              <h1 className="text-2xl font-bold">
                {mode === 'login' ? 'Welcome Back' : 'Create Account'}
              </h1>
              <p className="mt-2 text-sm text-muted-foreground">
                {mode === 'login'
                  ? 'Sign in to your Velocity account'
                  : 'Join Velocity and start shopping'}
              </p>
            </div>

            {/* Error Message */}
            {error && (
              <div className="mt-6 flex items-center gap-2 rounded-md bg-destructive/10 p-3 text-sm text-destructive">
                <AlertCircle className="h-4 w-4 shrink-0" />
                {error}
              </div>
            )}

            {/* Demo Credentials */}
            {mode === 'login' && (
              <div className="mt-6 rounded-md border border-border bg-secondary/50 p-3">
                <p className="text-xs font-medium text-muted-foreground">Demo Credentials</p>
                <p className="mt-1 text-xs text-muted-foreground">
                  Admin: admin@velocity.com / password123
                </p>
                <p className="text-xs text-muted-foreground">
                  User: demo@velocity.com / password123
                </p>
              </div>
            )}

            {/* Form */}
            <form onSubmit={handleSubmit} className="mt-6 space-y-4">
              {mode === 'register' && (
                <div>
                  <label
                    htmlFor="name"
                    className="block text-sm font-medium text-muted-foreground"
                  >
                    Name
                  </label>
                  <Input
                    id="name"
                    type="text"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    required
                    className="mt-1"
                    placeholder="Your name"
                    autoComplete="name"
                  />
                </div>
              )}

              <div>
                <label
                  htmlFor="email"
                  className="block text-sm font-medium text-muted-foreground"
                >
                  Email
                </label>
                <Input
                  id="email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  className="mt-1"
                  placeholder="your@email.com"
                  autoComplete="email"
                />
              </div>

              <div>
                <label
                  htmlFor="password"
                  className="block text-sm font-medium text-muted-foreground"
                >
                  Password
                </label>
                <Input
                  id="password"
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  className="mt-1"
                  placeholder="••••••••"
                  autoComplete={mode === 'login' ? 'current-password' : 'new-password'}
                  minLength={6}
                />
              </div>

              <Button type="submit" className="w-full" disabled={loading}>
                {loading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    {mode === 'login' ? 'Signing in...' : 'Creating account...'}
                  </>
                ) : mode === 'login' ? (
                  'Sign In'
                ) : (
                  'Create Account'
                )}
              </Button>
            </form>

            {/* Switch Mode */}
            <div className="mt-6 text-center text-sm">
              <span className="text-muted-foreground">
                {mode === 'login' ? "Don't have an account?" : 'Already have an account?'}
              </span>{' '}
              <button
                type="button"
                onClick={switchMode}
                className="font-medium text-primary hover:text-primary/80"
              >
                {mode === 'login' ? 'Sign up' : 'Sign in'}
              </button>
            </div>

            {/* Continue as Guest */}
            <div className="mt-4 text-center">
              <Link
                href="/products"
                className="text-sm text-muted-foreground hover:text-foreground transition-colors"
                onClick={() => trackClick('continue_as_guest', '/auth')}
              >
                Continue as Guest
              </Link>
            </div>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
}
