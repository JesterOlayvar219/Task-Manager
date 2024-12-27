import React, { useEffect } from 'react';
import { ChannelMessageList } from '../chat/ChannelMessageList';
import { ChannelChatInput } from '../chat/ChannelChatInput';
import { Alert } from '../../common/Alert';
import { usePrivateChat } from '../../../hooks/usePrivateChat';
import { useMessageReadStatus } from '../../../hooks/useMessageReadStatus';
import { useAuthContext } from '../../../contexts/AuthContext';
import { useUsername } from '../../../hooks/useUsername';

interface PrivateChatProps {
  chatId: string;
  chatName: string;
}

export function PrivateChat({ chatId, chatName }: PrivateChatProps) {
  const { user } = useAuthContext();
  const { username } = useUsername(user?.id);
  const { messages, loading, error, sendMessage } = usePrivateChat(chatId);
  const { markAsRead } = useMessageReadStatus();

  // Mark messages as read when entering chat
  useEffect(() => {
    if (chatId) {
      markAsRead(chatId).catch(console.error);
    }
  }, [chatId, markAsRead]);

  if (!user) return null;

  return (
    <div className="h-full flex flex-col">
      <div className="flex-shrink-0 p-4 border-b border-gray-700">
        <h2 className="text-lg font-semibold">{chatName}</h2>
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
              channelId={chatId}
              username={username}
            />
          </div>

          <div className="flex-shrink-0 mt-auto">
            <ChannelChatInput 
              channelId={chatId}
              username={username}
              onSendMessage={sendMessage}
            />
          </div>
        </>
      )}
    </div>
  );
}