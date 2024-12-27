import React from 'react';
import { ChatTextArea } from './ChatTextArea';
import { SendButton } from './SendButton';
import { useChatInput } from '../../../hooks/useChatInput';

interface ChatInputFormProps {
  onSendMessage: (message: string) => void;
  onCommandTrigger: () => void;
  onCommandClose: () => void;
}

export function ChatInputForm({ onSendMessage, onCommandTrigger, onCommandClose }: ChatInputFormProps) {
  const {
    message,
    handleSubmit,
    handleChange,
    handleKeyDown,
    inputRef,
  } = useChatInput({ onSendMessage, onCommandTrigger, onCommandClose });

  return (
    <form onSubmit={handleSubmit} className="p-4 border-t border-gray-700">
      <div className="flex items-end gap-2">
        <ChatTextArea
          ref={inputRef}
          value={message}
          onChange={handleChange}
          onKeyDown={handleKeyDown}
        />
        <SendButton disabled={!message.trim()} />
      </div>
    </form>
  );
}