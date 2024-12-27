import React from 'react';
import { cn } from '../../lib/utils';

interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  required?: boolean;
}

export function Input({ 
  label, 
  error, 
  required, 
  className,
  ...props 
}: InputProps) {
  return (
    <div className="space-y-2">
      {label && (
        <label className="block text-sm font-medium text-gray-200">
          {label} {required && <span className="text-red-400">*</span>}
        </label>
      )}
      <input
        className={cn(
          "w-full px-3 py-2 bg-[#1E1E1E] border border-[#2F2F2F] rounded-lg",
          "text-white placeholder-gray-400 focus:outline-none focus:border-[#10A37F]",
          error && "border-red-500",
          className
        )}
        {...props}
      />
      {error && (
        <p className="text-sm text-red-400">{error}</p>
      )}
    </div>
  );
}