import React, { useRef } from 'react';
import { UserSearchResults } from './UserSearchResults';
import { useUserSearchContext } from './UserSearchContext';
import { useClickOutside } from '../../../../hooks/useClickOutside';

interface UserSearchDropdownProps {
  selectedValue: string;
  onSelect: (username: string) => void;
}

export function UserSearchDropdown({ selectedValue, onSelect }: UserSearchDropdownProps) {
  const dropdownRef = useRef<HTMLDivElement>(null);
  const { isOpen, filteredUsers, loading, setIsOpen } = useUserSearchContext();

  useClickOutside(dropdownRef, () => setIsOpen(false));

  if (!isOpen) return null;

  return (
    <div 
      ref={dropdownRef}
      className="absolute z-50 w-full mt-1 bg-[#2D2D2D] border border-gray-700 rounded-lg shadow-lg max-h-60 overflow-y-auto"
    >
      <UserSearchResults
        users={filteredUsers}
        selectedValue={selectedValue}
        loading={loading}
        onSelect={onSelect}
      />
    </div>
  );
}