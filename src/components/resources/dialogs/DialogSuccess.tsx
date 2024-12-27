import React from 'react';

interface DialogSuccessProps {
  message: string;
}

export function DialogSuccess({ message }: DialogSuccessProps) {
  return (
    <div className="p-6 flex items-center justify-center">
      <div className="text-emerald-400 text-lg font-medium">{message}</div>
    </div>
  );
}