import { useState, useEffect, useCallback } from 'react';
import { doc, onSnapshot } from 'firebase/firestore';
import { db } from '../lib/firebase/config';
import { COLLECTIONS } from '../lib/firebase/config/collections';
import {
  createUserProfile,
  updateUserProfile,
  getUserProfile,
} from '../lib/firebase/services/profile';
import type { UserProfile, UserRole } from '../types/user';

export function useFirebaseProfile(userId: string) {
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Subscribe to profile changes
  useEffect(() => {
    const unsubscribe = onSnapshot(
      doc(db, COLLECTIONS.USERS, userId),
      (doc) => {
        if (doc.exists()) {
          setProfile({
            id: doc.id,
            ...doc.data(),
          } as UserProfile);
        } else {
          setProfile(null);
        }
        setLoading(false);
      },
      (err) => {
        console.error('Error fetching profile:', err);
        setError('Failed to fetch profile');
        setLoading(false);
      }
    );

    return () => unsubscribe();
  }, [userId]);

  const createProfile = useCallback(async (
    username: string,
    role: UserRole,
    profileImage?: File
  ) => {
    try {
      setError(null);
      const newProfile = await createUserProfile(
        userId,
        { username, role },
        profileImage
      );
      return newProfile;
    } catch (err) {
      setError('Failed to create profile');
      throw err;
    }
  }, [userId]);

  const updateProfile = useCallback(async (
    updates: Partial<UserProfile>,
    profileImage?: File
  ) => {
    try {
      setError(null);
      await updateUserProfile(userId, updates, profileImage);
    } catch (err) {
      setError('Failed to update profile');
      throw err;
    }
  }, [userId]);

  return {
    profile,
    loading,
    error,
    createProfile,
    updateProfile,
  };
}