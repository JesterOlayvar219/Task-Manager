import { useState, useCallback } from 'react';
import type { Message } from '../../types/message';

interface MessageDeliveryState {
  [messageId: string]: 'sending' | 'sent' | 'error';
}

export function useMessageDelivery() {
  const [deliveryStatus, setDeliveryStatus] = useState<MessageDeliveryState>({});

  const updateStatus = useCallback((messageId: string, status: 'sending' | 'sent' | 'error') => {
    setDeliveryStatus(prev => ({
      ...prev,
      [messageId]: status
    }));
  }, []);

  const trackMessage = useCallback(async (message: Message, sendFn: () => Promise<void>) => {
    updateStatus(message.id, 'sending');
    try {
      await sendFn();
      updateStatus(message.id, 'sent');
    } catch (err) {
      updateStatus(message.id, 'error');
      throw err;
    }
  }, [updateStatus]);

  return {
    deliveryStatus,
    trackMessage
  };
}