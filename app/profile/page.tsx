"use client";

import React, { useState, useEffect } from 'react';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import UserStatus from '@/components/UserStatus';
import { userDb } from '@/lib/db';
import { User } from '@/lib/types';

export default function ProfilePage() {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // In a real app, you would get the user ID from authentication
    const userId = '1'; // For demo purposes, we're using the first user
    const userData = userDb.getUserById(userId);
    setUser(userData || null);
    setLoading(false);
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen flex flex-col bg-background">
        <Header />
        <main className="flex-1 container max-w-7xl mx-auto px-4 py-8">
          <div className="flex items-center justify-center h-[60vh]">
            <div className="text-center">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div>
              <p className="mt-4 text-muted-foreground">Loading profile...</p>
            </div>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  if (!user) {
    return (
      <div className="min-h-screen flex flex-col bg-background">
        <Header />
        <main className="flex-1 container max-w-7xl mx-auto px-4 py-8">
          <div className="flex items-center justify-center h-[60vh]">
            <div className="text-center">
              <h2 className="text-2xl font-bold text-foreground">User not found</h2>
              <p className="mt-2 text-muted-foreground">Please check your login status.</p>
            </div>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col bg-background">
      <Header />
      <main className="flex-1 container max-w-7xl mx-auto px-4 py-8">
        <div className="mb-8">
          <h1 className="text-center font-medium py-2 text-sm">
            Profile | User Information
          </h1>
          <p className="text-muted-foreground text-center">
            View your profile and DUPR rating
          </p>
        </div>

        <UserStatus user={user} />
      </main>
      <Footer />
    </div>
  );
} 