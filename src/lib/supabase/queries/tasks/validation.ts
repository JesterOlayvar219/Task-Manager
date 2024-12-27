import { supabase } from '../../client';

export async function validateTaskAssignment(assigneeUsername: string, creatorId: string) {
  try {
    // Get creator's username
    const { data: creatorData, error: creatorError } = await supabase
      .from('users')
      .select('username')
      .eq('id', creatorId)
      .single();

    if (creatorError || !creatorData?.username) {
      throw new Error('Creator profile not found');
    }

    // Validate assignee exists by username
    const { data: assigneeData, error: assigneeError } = await supabase
      .from('users')
      .select('username')
      .eq('username', assigneeUsername)
      .single();

    if (assigneeError || !assigneeData) {
      console.error('Assignee validation failed:', { assigneeUsername, error: assigneeError });
      throw new Error('Invalid assignee: User does not exist');
    }

    return {
      creatorUsername: creatorData.username,
      assigneeUsername: assigneeData.username
    };
  } catch (err) {
    console.error('Error validating task assignment:', err);
    throw err;
  }
}