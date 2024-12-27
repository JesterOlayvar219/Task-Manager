import React from 'react';
import { AlertCircle, CheckCircle, Info } from 'lucide-react';
import { cn } from '../../lib/utils';

interface AlertProps {
  type: 'error' | 'success' | 'info';
  message: string;
  className?: string;
}

export function Alert({ type, message, className }: AlertProps) {
  const icons = {
    error: AlertCircle,
    success: CheckCircle,
    info: Info
  };

  const styles = {
    error: 'bg-red-500/10 text-red-400 border-red-500/20',
    success: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20',
    info: 'bg-blue-500/10 text-blue-400 border-blue-500/20'
  };

  const Icon = icons[type];

  return (
    <div className={cn(
      'flex items-center gap-2 px-4 py-2 rounded-lg border',
      styles[type],
      className
    )}>
      <Icon size={16} />
      <span>{message}</span>
    </div>
  );
}