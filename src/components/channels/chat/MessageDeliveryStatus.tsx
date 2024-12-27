import React from 'react';
import { Check, Clock, AlertCircle } from 'lucide-react';
import { cn } from '../../../lib/utils';

interface MessageDeliveryStatusProps {
  status: 'sending' | 'sent' | 'error';
  className?: string;
}

export function MessageDeliveryStatus({ status, className }: MessageDeliveryStatusProps) {
  const icons = {
    sending: <Clock size={14} className="text-gray-400" />,
    sent: <Check size={14} className="text-emerald-400" />,
    error: <AlertCircle size={14} className="text-red-400" />
  };

  const labels = {
    sending: 'Sending...',
    sent: 'Sent',
    error: 'Failed to send'
  };

  return (
    <div className={cn("flex items-center gap-1 text-xs", className)}>
      {icons[status]}
      <span>{labels[status]}</span>
    </div>
  );
}