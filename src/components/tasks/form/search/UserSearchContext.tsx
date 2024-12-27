import React, { createContext, useContext } from 'react';
import { useUserSearch } from '../../../../hooks/useUserSearch';
import type { UserProfile } from '../../../../types/user';

interface UserSearchContextType {
  search: string;
  isOpen: boolean;
  filteredUsers: UserProfile[];
  loading: boolean;
  setIsOpen: (open: boolean) => void;
  handleSearchChange: (value: string) => void;
  handleSelect: (username: string) => void;
}

const UserSearchContext = createContext<UserSearchContextType | undefined>(undefined);

export function UserSearchProvider({ children }: { children: React.ReactNode }) {
  const searchState = useUserSearch();
  return (
    <UserSearchContext.Provider value={searchState}>
      {children}
    </UserSearchContext.Provider>
  );
}

export function useUserSearchContext() {
  const context = useContext(UserSearchContext);
  if (!context) {
    throw new Error('useUserSearchContext must be used within UserSearchProvider');
  }
  return context;
}