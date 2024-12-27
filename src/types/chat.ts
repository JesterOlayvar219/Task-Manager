export interface ChatMessage {
  id: string;
  content: string;
  timestamp: string;
  type: 'command' | 'message';
}