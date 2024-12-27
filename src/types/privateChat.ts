export interface PrivateChat {
  id: string;
  name: string;
  creator_id: string;
  is_hidden: boolean;
  created_at: string;
}

export interface PrivateChatMember {
  id: string;
  private_chat_id: string;
  user_id: string;
  joined_at: string;
}