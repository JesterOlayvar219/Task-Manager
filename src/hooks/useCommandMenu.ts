import { useState, useCallback } from 'react';
import { getCommand, getAllCommands, parseCommand } from '../lib/commands';
import { useAuthContext } from '../contexts/AuthContext';
import type { CommandResult } from '../types/command';

export function useCommandMenu() {
  const [isOpen, setIsOpen] = useState(false);
  const [result, setResult] = useState<CommandResult | null>(null);
  const { user } = useAuthContext();

  const handleCommand = useCallback(async (input: string) => {
    if (!user || !input?.trim()) return;

    try {
      const { command: commandName } = parseCommand(input);
      const command = getCommand(commandName);

      if (!command) {
        setResult({
          type: 'error',
          data: [],
          message: `Unknown command: ${commandName}. Type /help for available commands.`
        });
        return;
      }

      const result = await command.execute(user.id);
      setResult(result);
    } catch (error) {
      console.error('Error executing command:', error);
      setResult({
        type: 'error',
        data: [],
        message: 'Error executing command'
      });
    }
  }, [user]);

  const handleInput = useCallback((value: string) => {
    if (value?.startsWith('/')) {
      setIsOpen(true);
      setResult(null);
    } else {
      setIsOpen(false);
      setResult(null);
    }
  }, []);

  return {
    isOpen,
    commands: getAllCommands(),
    result,
    handleCommand,
    handleInput,
    closeMenu: () => setIsOpen(false)
  };
}