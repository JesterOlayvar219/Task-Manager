export interface Message {
  id: string;
  content: string;
  sender: string;
  chat_id: string;
  chat_type: 'channel' | 'private';
  is_read: boolean;
  created_at: string;
}

export interface ChatUser {
  id: string;
  username: string;
  role: string;
  avatar?: string;
  status: 'online' | 'offline' | 'away';
}