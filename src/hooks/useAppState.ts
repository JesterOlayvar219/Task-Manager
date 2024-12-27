import { useState } from 'react';
import type { View } from '../types/view';

export function useAppState() {
  const [view, setView] = useState<View>('activity');
  const [activeChannel, setActiveChannel] = useState('resources');

  const handleChannelSelect = (channelId: string) => {
    setView('channel');
    setActiveChannel(channelId);
  };

  const handleActivitySelect = () => {
    setView('activity');
    setActiveChannel('');
  };

  const handlePersonalSelect = () => {
    setView('personal');
    setActiveChannel('');
  };

  return {
    view,
    activeChannel,
    handleChannelSelect,
    handleActivitySelect,
    handlePersonalSelect,
  };
}