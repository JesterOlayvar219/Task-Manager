import { supabase } from '../client';

export const TYPING_TIMEOUT = 2000; // 2 seconds

export async function updateTypingStatus(channelId: string, username: string): Promise<void> {
  if (!channelId?.trim() || !username?.trim()) {
    console.warn('Invalid typing status update params:', { channelId, username });
    return;
  }

  try {
    const { error } = await supabase
      .from('typing_status')
      .upsert(
        {
          channel_id: channelId,
          username,
          updated_at: new Date().toISOString()
        },
        { onConflict: 'channel_id,username' }
      );

    if (error) {
      console.error('Error updating typing status:', error);
    }
  } catch (err) {
    console.error('Failed to update typing status:', err);
  }
}

export async function clearTypingStatus(channelId: string, username: string): Promise<void> {
  if (!channelId?.trim() || !username?.trim()) {
    console.warn('Invalid clear typing status params:', { channelId, username });
    return;
  }

  try {
    const { error } = await supabase
      .from('typing_status')
      .delete()
      .match({ 
        channel_id: channelId,
        username 
      });

    if (error) {
      console.error('Error clearing typing status:', error);
    }
  } catch (err) {
    console.error('Failed to clear typing status:', err);
  }
}