import React, { createContext, useContext } from 'react';
import { useFirebaseProfile } from '../../hooks/useFirebaseProfile';
import type { UserProfile } from '../../types/user';

interface ProfileContextType {
  profile: UserProfile | null;
  loading: boolean;
  error: string | null;
  createProfile: ReturnType<typeof useFirebaseProfile>['createProfile'];
  updateProfile: ReturnType<typeof useFirebaseProfile>['updateProfile'];
}

const ProfileContext = createContext<ProfileContextType | undefined>(undefined);

export function ProfileProvider({ 
  userId,
  children 
}: { 
  userId: string;
  children: React.ReactNode;
}) {
  const profileState = useFirebaseProfile(userId);

  return (
    <ProfileContext.Provider value={profileState}>
      {children}
    </ProfileContext.Provider>
  );
}

export function useProfile() {
  const context = useContext(ProfileContext);
  if (context === undefined) {
    throw new Error('useProfile must be used within a ProfileProvider');
  }
  return context;
}