export type View = 'activity' | 'channel' | 'personal';

export type Command = {
  id: string;
  label: string;
  description: string;
  action: () => void;
};