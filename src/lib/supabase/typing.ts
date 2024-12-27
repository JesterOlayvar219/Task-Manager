import { supabase } from './client';

export async function updateTypingStatus(channelId: string, username: string) {
  if (!channelId || !username) return;

  try {
    await supabase
      .from('typing_status')
      .upsert(
        {
          channel_id: channelId,
          username,
          updated_at: new Date().toISOString()
        },
        { onConflict: 'channel_id,username' }
      );
  } catch (err) {
    console.error('Error updating typing status:', err);
  }
}

export async function clearTypingStatus(channelId: string, username: string) {
  if (!channelId || !username) return;

  try {
    await supabase
      .from('typing_status')
      .delete()
      .match({ channel_id: channelId, username });
  } catch (err) {
    console.error('Error clearing typing status:', err);
  }
}