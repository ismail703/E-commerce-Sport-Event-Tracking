// ===========================================
// REGISTER API ENDPOINT
// Simple user registration for demo purposes
// ===========================================

import { NextResponse } from 'next/server';
import { users } from '@/lib/data';

export async function POST(request: Request) {
  try {
    const { email, password, name } = await request.json();

    // Validate input
    if (!email || !password || !name) {
      return NextResponse.json(
        { success: false, error: 'All fields are required' },
        { status: 400 }
      );
    }

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return NextResponse.json(
        { success: false, error: 'Invalid email format' },
        { status: 400 }
      );
    }

    // Check password length
    if (password.length < 6) {
      return NextResponse.json(
        { success: false, error: 'Password must be at least 6 characters' },
        { status: 400 }
      );
    }

    // Check if user already exists
    const existingUser = users.find(
      (u) => u.email.toLowerCase() === email.toLowerCase()
    );

    if (existingUser) {
      return NextResponse.json(
        { success: false, error: 'Email already registered' },
        { status: 409 }
      );
    }

    // Create new user (in-memory for demo)
    const newUser = {
      id: `user-${Date.now()}`,
      email,
      name,
      role: 'user' as const,
    };

    // Add to users array (note: this won't persist across server restarts)
    users.push(newUser);

    return NextResponse.json({
      success: true,
      user: newUser,
    });
  } catch (error) {
    console.error('[Register API] Error:', error);
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    );
  }
}
