export interface Command {
  name: string;
  description: string;
  execute: (userId: string) => Promise<CommandResult>;
}

export type CommandResultType = 'tasks' | 'messages' | 'users' | 'error';

export interface CommandResult {
  type: CommandResultType;
  data: any[];
  message?: string;
}