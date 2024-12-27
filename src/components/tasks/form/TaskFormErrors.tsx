import React from 'react';

interface TaskFormErrorsProps {
  errors: Record<string, string>;
}

export function TaskFormErrors({ errors }: TaskFormErrorsProps) {
  if (!Object.keys(errors).length) return null;

  return (
    <div className="space-y-1 text-sm text-red-400">
      {Object.entries(errors).map(([field, message]) => (
        <p key={field}>{message}</p>
      ))}
    </div>
  );
}