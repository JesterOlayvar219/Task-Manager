import React from 'react';
import { AlertCircle } from 'lucide-react';

interface ErrorMessageProps {
  message: string;
}

export function ErrorMessage({ message }: ErrorMessageProps) {
  return (
    <div className="h-full flex items-center justify-center">
      <div className="flex items-center gap-2 text-red-400">
        <AlertCircle size={20} />
        <span>{message}</span>
      </div>
    </div>
  );
}