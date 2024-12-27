import React from 'react';
import { Search } from 'lucide-react';
import { cn } from '../../../../lib/utils';

interface UserSearchInputProps {
  value: string;
  onChange: (value: string) => void;
  onFocus: () => void;
  required?: boolean;
  placeholder?: string;
}

export function UserSearchInput({ 
  value, 
  onChange, 
  onFocus,
  required,
  placeholder = "Search users..." 
}: UserSearchInputProps) {
  return (
    <div className="relative">
      <input
        type="text"
        required={required}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        onFocus={onFocus}
        className={cn(
          "w-full px-3 py-2 pl-9 bg-[#1E1E1E] border border-[#2F2F2F] rounded-lg",
          "text-white placeholder-gray-400 focus:outline-none focus:border-[#10A37F]"
        )}
        placeholder={placeholder}
      />
      <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={16} />
    </div>
  );
}