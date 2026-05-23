'use client';

// ===========================================
// AUTHENTICATION STATE MANAGEMENT
// Simple client-side auth state with SWR
// ===========================================

import useSWR from 'swr';
import type { User } from './types';

const AUTH_KEY = 'velocity_auth';

// Get stored auth state
function getStoredAuth(): User | null {
  if (typeof window === 'undefined') return null;
  const stored = localStorage.getItem(AUTH_KEY);
  if (stored) {
    const user = JSON.parse(stored);
    // Also set user_id for tracking
    localStorage.setItem('user_id', user.id);
    return user;
  }
  return null;
}

// Save auth state
function saveAuth(user: User | null): void {
  if (typeof window === 'undefined') return;
  if (user) {
    localStorage.setItem(AUTH_KEY, JSON.stringify(user));
    localStorage.setItem('user_id', user.id);
  } else {
    localStorage.removeItem(AUTH_KEY);
    localStorage.removeItem('user_id');
  }
}

// SWR fetcher
const authFetcher = () => getStoredAuth();

// ===========================================
// AUTH HOOK
// ===========================================
export function useAuth() {
  const { data: user, mutate } = useSWR<User | null>('auth', authFetcher, {
    fallbackData: null,
    revalidateOnFocus: false,
  });

  // Login
  const login = async (email: string, password: string): Promise<{ success: boolean; error?: string }> => {
    try {
      const response = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      });

      const data = await response.json();

      if (data.success && data.user) {
        saveAuth(data.user);
        mutate(data.user);
        return { success: true };
      }

      return { success: false, error: data.error || 'Login failed' };
    } catch {
      return { success: false, error: 'Network error' };
    }
  };

  // Register
  const register = async (
    email: string,
    password: string,
    name: string
  ): Promise<{ success: boolean; error?: string }> => {
    try {
      const response = await fetch('/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password, name }),
      });

      const data = await response.json();

      if (data.success && data.user) {
        saveAuth(data.user);
        mutate(data.user);
        return { success: true };
      }

      return { success: false, error: data.error || 'Registration failed' };
    } catch {
      return { success: false, error: 'Network error' };
    }
  };

  // Logout
  const logout = () => {
    saveAuth(null);
    mutate(null);
  };

  return {
    user,
    isAuthenticated: !!user,
    isAdmin: user?.role === 'admin',
    login,
    register,
    logout,
  };
}
