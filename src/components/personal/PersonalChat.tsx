import React, { useState } from 'react';
import { ChatInput } from './chat/ChatInput';
import { MessageList } from './chat/MessageList';
import { MyTasks } from './tasks/MyTasks';
import { usePersonalChat } from '../../hooks/usePersonalChat';
import { useAuthContext } from '../../contexts/AuthContext';
import { cn } from '../../lib/utils';

export function PersonalChat() {
  const [showTasks, setShowTasks] = useState(true);
  const [isTasksExpanded, setIsTasksExpanded] = useState(false);
  const { user } = useAuthContext();
  const { messages, loading, error, sendMessage } = usePersonalChat();

  if (!user) return null;

  if (loading) {
    return (
      <div className="flex-1 flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-4 border-[#10A37F] border-t-transparent" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex-1 flex items-center justify-center text-red-400">
        {error}
      </div>
    );
  }

  return (
    <div className="flex h-full">
      {/* Chat Section */}
      <div className={cn(
        "flex-1 flex flex-col min-w-0",
        isTasksExpanded && "hidden md:flex"
      )}>
        {/* Header */}
        <div className="flex-shrink-0 p-4 border-b border-gray-700 flex items-center justify-between">
          <div>
            <h2 className="text-lg font-semibold">Personal Notes</h2>
            <p className="text-sm text-gray-400">Keep track of your thoughts and reminders</p>
          </div>
          <button
            onClick={() => setShowTasks(!showTasks)}
            className="px-3 py-1 text-sm text-gray-400 hover:text-white hover:bg-gray-700/50 rounded-lg transition-colors"
          >
            {showTasks ? 'Hide Tasks' : 'Show Tasks'}
          </button>
        </div>

        {/* Messages */}
        <div className="flex-1 overflow-hidden">
          <MessageList 
            messages={messages}
            currentUser={user.id}
          />
        </div>

        {/* Input */}
        <div className="flex-shrink-0 mt-auto border-t border-gray-700">
          <ChatInput onSendMessage={sendMessage} />
        </div>
      </div>

      {/* Tasks Panel */}
      {showTasks && (
        <div className={cn(
          "border-l border-gray-700 bg-[#2D2D2D] transition-all duration-300 ease-in-out",
          isTasksExpanded ? "w-full md:w-[600px]" : "w-96"
        )}>
          <MyTasks 
            isExpanded={isTasksExpanded}
            onToggleExpand={() => setIsTasksExpanded(!isTasksExpanded)}
          />
        </div>
      )}
    </div>
  );
}