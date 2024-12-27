import { taskCommands } from './task-commands';
import { messageCommands } from './message-commands';
import { userCommands } from './user-commands';
import type { Command } from '../../types/command';

const commands: Record<string, Command> = {
  ...taskCommands,
  ...messageCommands,
  ...userCommands,
};

export function getCommand(name: string | undefined): Command | undefined {
  if (!name) return undefined;
  return commands[name.toLowerCase()];
}

export function getAllCommands(): Command[] {
  return Object.values(commands);
}

export function parseCommand(input: string): { command: string; args: string[] } {
  if (!input?.trim()) {
    return { command: '', args: [] };
  }
  const parts = input.slice(1).split(' '); // Remove leading slash
  return {
    command: parts[0].toLowerCase(),
    args: parts.slice(1)
  };
}