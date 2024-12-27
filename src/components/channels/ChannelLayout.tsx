import React from 'react';
import { ChannelChat } from './ChannelChat';
import { useChannelMessages } from '../../hooks/useChannelMessages';

interface ChannelLayoutProps {
  channelId: string;
  channelName: string;
}

export function ChannelLayout({ channelId, channelName }: ChannelLayoutProps) {
  const { messages, loading, error, sendMessage } = useChannelMessages(channelId);

  return (
    <div className="h-full">
      <ChannelChat
        channelId={channelId}
        channelName={channelName}
        messages={messages}
        loading={loading}
        error={error}
        onSendMessage={sendMessage}
      />
    </div>
  );
}