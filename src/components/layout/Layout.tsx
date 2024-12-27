import React, { useState } from 'react';
import { Sidebar } from './Sidebar';
import { ChannelLayout } from '../channels/ChannelLayout';
import { ActivityBoard } from '../activity/ActivityBoard';
import { PersonalChat } from '../personal/PersonalChat';
import { ResourcesChannel } from '../resources/ResourcesChannel';
import { PrivateChat } from '../personal/chat/PrivateChat';
import { TaskDialog } from '../tasks/TaskDialog';
import { useAppState } from '../../hooks/useAppState';
import { usePrivateChats } from '../../hooks/usePrivateChats';
import { useTasks } from '../../hooks/useTasks';
import { CHANNELS } from '../../lib/constants';

export function Layout() {
  const [isTaskDialogOpen, setIsTaskDialogOpen] = useState(false);
  const { addTask } = useTasks();
  const {
    view,
    activeChannel,
    handleChannelSelect,
    handleActivitySelect,
    handlePersonalSelect,
  } = useAppState();

  const { chats } = usePrivateChats();
  const activeChat = chats.find(chat => chat.id === activeChannel);

  const handleTaskSubmit = async (taskData: any) => {
    try {
      await addTask(taskData);
      setIsTaskDialogOpen(false);
    } catch (error) {
      console.error('Error creating task:', error);
    }
  };

  return (
    <div className="flex h-screen overflow-hidden">
      <Sidebar
        activeChannel={view === 'channel' ? activeChannel : null}
        onChannelSelect={handleChannelSelect}
        onActivitySelect={handleActivitySelect}
        onPersonalSelect={handlePersonalSelect}
        onNewTask={() => setIsTaskDialogOpen(true)}
      />
      <main className="flex-1 min-w-0 bg-[#313338] text-gray-100">
        {view === 'activity' ? (
          <ActivityBoard />
        ) : view === 'personal' ? (
          <PersonalChat />
        ) : activeChannel === 'resources' ? (
          <ResourcesChannel />
        ) : activeChat ? (
          <PrivateChat 
            chatId={activeChat.id}
            chatName={activeChat.name}
          />
        ) : (
          <ChannelLayout 
            channelId={activeChannel}
            channelName={CHANNELS.find(c => c.id === activeChannel)?.name || 'Channel'}
          />
        )}
      </main>

      <TaskDialog
        isOpen={isTaskDialogOpen}
        onClose={() => setIsTaskDialogOpen(false)}
        onSubmit={handleTaskSubmit}
        channels={CHANNELS}
      />
    </div>
  );
}