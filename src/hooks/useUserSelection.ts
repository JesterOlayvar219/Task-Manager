import { useState, useCallback } from 'react';
import { useUsers } from './useUsers';
import type { UserProfile } from '../types/user';

export function useUserSelection() {
  const [selectedUser, setSelectedUser] = useState<UserProfile | null>(null);
  const { users, loading, error } = useUsers();

  const handleUserSelect = useCallback((username: string) => {
    const user = users.find(u => u.username === username);
    setSelectedUser(user || null);
  }, [users]);

  return {
    selectedUser,
    users,
    loading,
    error,
    handleUserSelect
  };
}