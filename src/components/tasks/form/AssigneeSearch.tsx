import React from 'react';
import { UserSearchProvider } from './search/UserSearchContext';
import { UserSearchInput } from './search/UserSearchInput';
import { UserSearchDropdown } from './search/UserSearchDropdown';
import { useUserSearchContext } from './search/UserSearchContext';

interface AssigneeSearchProps {
  value: string;
  onChange: (username: string) => void;
  required?: boolean;
}

function AssigneeSearchInner({ value, onChange, required }: AssigneeSearchProps) {
  const { handleSearchChange, handleSelect, search, setIsOpen } = useUserSearchContext();

  const handleChange = (newValue: string) => {
    handleSearchChange(newValue);
    if (!newValue) {
      onChange(''); // Clear selection if input is empty
    }
  };

  const handleSelectUser = (username: string) => {
    handleSelect(username);
    onChange(username);
  };

  return (
    <div className="relative">
      <UserSearchInput
        value={search}
        onChange={handleChange}
        onFocus={() => setIsOpen(true)}
        required={required}
        placeholder="Search users by name or role..."
      />
      <UserSearchDropdown
        selectedValue={value}
        onSelect={handleSelectUser}
      />
    </div>
  );
}

export function AssigneeSearch(props: AssigneeSearchProps) {
  return (
    <UserSearchProvider>
      <AssigneeSearchInner {...props} />
    </UserSearchProvider>
  );
}