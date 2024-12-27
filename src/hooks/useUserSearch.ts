import { useState, useCallback, useMemo } from 'react';
import { useUsers } from './useUsers';
import { filterUsers } from '../components/tasks/form/search/UserSearchFilter';

export function useUserSearch() {
  const [search, setSearch] = useState('');
  const [isOpen, setIsOpen] = useState(false);
  const { users, loading, error } = useUsers();

  const filteredUsers = useMemo(() => 
    filterUsers(users || [], search),
    [users, search]
  );

  const handleSearchChange = useCallback((value: string) => {
    setSearch(value);
    setIsOpen(true);
  }, []);

  const handleSelect = useCallback((username: string) => {
    setSearch(username);
    setIsOpen(false);
  }, []);

  return {
    search,
    isOpen,
    filteredUsers,
    loading,
    error,
    setIsOpen,
    handleSearchChange,
    handleSelect
  };
}