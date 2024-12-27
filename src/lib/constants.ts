import { Code2, DollarSign, MessageSquare, MessagesSquare, Paintbrush, Pencil } from 'lucide-react';

export const BOARD_COLUMNS = [
  { status: 'not-started', title: 'Not Started' },
  { status: 'in-progress', title: 'In Progress' },
  { status: 'completed', title: 'Completed' },
] as const;

export const CHANNELS = [
  { id: 'resources', name: 'Resources Chat', icon: MessagesSquare },
  { id: 'development', name: 'Development Chat', icon: Code2 },
  { id: 'copywriting', name: 'Copywriting Chat', icon: Pencil },
  { id: 'media', name: 'Media Buying Chat', icon: DollarSign },
  { id: 'creatives', name: 'Creatives Chat', icon: Paintbrush },
  { id: 'sales', name: 'Sales Chat', icon: MessageSquare },
] as const;