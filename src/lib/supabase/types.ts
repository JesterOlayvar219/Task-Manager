export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export interface Database {
  public: {
    Tables: {
      users: {
        Row: {
          id: string
          username: string
          role: string
          profile_image: string | null
          created_at: string
          last_active: string
        }
        Insert: {
          id: string
          username: string
          role: string
          profile_image?: string | null
          created_at?: string
          last_active?: string
        }
        Update: {
          id?: string
          username?: string
          role?: string
          profile_image?: string | null
          created_at?: string
          last_active?: string
        }
      }
      tasks: {
        Row: {
          id: string
          title: string
          description: string
          created_by: string
          assignee: string
          due_date: string
          status: string
          channel_id: string
          created_at: string
          files: Json[] | null
        }
        Insert: {
          id?: string
          title: string
          description: string
          created_by: string
          assignee: string
          due_date: string
          status: string
          channel_id: string
          created_at?: string
          files?: Json[] | null
        }
        Update: {
          id?: string
          title?: string
          description?: string
          created_by?: string
          assignee?: string
          due_date?: string
          status?: string
          channel_id?: string
          created_at?: string
          files?: Json[] | null
        }
      }
      messages: {
        Row: {
          id: string
          content: string
          sender: string
          recipient: string
          timestamp: string
          read: boolean
          type: string
          channel_id: string | null
          participants: string[] | null
        }
        Insert: {
          id?: string
          content: string
          sender: string
          recipient: string
          timestamp?: string
          read?: boolean
          type: string
          channel_id?: string | null
          participants?: string[] | null
        }
        Update: {
          id?: string
          content?: string
          sender?: string
          recipient?: string
          timestamp?: string
          read?: boolean
          type?: string
          channel_id?: string | null
          participants?: string[] | null
        }
      }
      resources: {
        Row: {
          id: string
          name: string
          url: string | null
          username: string | null
          password: string | null
          access_users: string[]
          notes: string | null
          created_at: string
        }
        Insert: {
          id?: string
          name: string
          url?: string | null
          username?: string | null
          password?: string | null
          access_users: string[]
          notes?: string | null
          created_at?: string
        }
        Update: {
          id?: string
          name?: string
          url?: string | null
          username?: string | null
          password?: string | null
          access_users?: string[]
          notes?: string | null
          created_at?: string
        }
      }
      notifications: {
        Row: {
          id: string
          type: string
          message: string
          recipient: string
          timestamp: string
          read: boolean
        }
        Insert: {
          id?: string
          type: string
          message: string
          recipient: string
          timestamp?: string
          read?: boolean
        }
        Update: {
          id?: string
          type?: string
          message?: string
          recipient?: string
          timestamp?: string
          read?: boolean
        }
      }
    }
  }
}