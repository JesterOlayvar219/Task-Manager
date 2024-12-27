import React from 'react';
import { ChannelMessageList } from './ChannelMessageList';
import { ChannelChatInput } from './ChannelChatInput';
import { Alert } from '../../common/Alert';
import { useAuthContext } from '../../../contexts/AuthContext';
import { useUsername } from '../../../hooks/useUsername';
import type { Message } from '../../../types/message';

interface ChannelChatProps {
  channelId: string;
  channelName: string;
  messages: Message[];
  loading: boolean;
  error: string | null;
  isConnected: boolean;
  onSendMessage: (content: string) => Promise<void>;
}

export function ChannelChat({ 
  channelId, 
  channelName, 
  messages,
  loading,
  error,
  isConnected,
  onSendMessage 
}: ChannelChatProps) {
  const { user } = useAuthContext();
  const { username } = useUsername(user?.id);

  if (!user) return null;

  return (
    <div className="h-full flex flex-col">
      <div className="flex-shrink-0 p-4 border-b border-gray-700">
        <h2 className="text-lg font-semibold">{channelName}</h2>
      </div>

      {error && (
        <Alert type="error" message={error} className="m-4" />
      )}

      {loading ? (
        <div className="flex-1 flex items-center justify-center">
          <div className="animate-spin rounded-full h-8 w-8 border-4 border-[#10A37F] border-t-transparent" />
        </div>
      ) : (
        <>
          <div className="flex-1 overflow-hidden">
            <ChannelMessageList 
              messages={messages}
              currentUser={user.id}
              channelId={channelId}
              username={username}
            />
          </div>

          <div className="flex-shrink-0 mt-auto">
            <ChannelChatInput 
              channelId={channelId}
              username={username}
              onSendMessage={onSendMessage}
              disabled={!isConnected}
            />
          </div>
        </>
      )}
    </div>
  );
}