import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase/client';
import { useAuthContext } from '../contexts/AuthContext';
import { useUsername } from './useUsername';
import { useTaskNotifications } from './useTaskNotifications';
import type { TaskComment } from '../types/comment';

export function useTaskComments(taskId: string) {
  const [comments, setComments] = useState<TaskComment[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { user } = useAuthContext();
  const { username } = useUsername(user?.id);
  const { notifyTaskCommentAdded } = useTaskNotifications();

  useEffect(() => {
    if (!user || !taskId) return;

    const loadComments = async () => {
      try {
        setLoading(true);
        const { data, error: err } = await supabase
          .from('task_comment_details')
          .select('*')
          .eq('task_id', taskId)
          .order('created_at', { ascending: true });

        if (err) throw err;
        setComments(data || []);
      } catch (err) {
        console.error('Error loading comments:', err);
        setError('Failed to load comments');
      } finally {
        setLoading(false);
      }
    };

    loadComments();

    // Subscribe to new comments
    const channel = supabase
      .channel(`task_comments:${taskId}`)
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'task_comments',
          filter: `task_id=eq.${taskId}`
        },
        () => loadComments()
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [taskId, user]);

  const addComment = async (content: string) => {
    if (!user || !username) throw new Error('Must be logged in to comment');
    if (!content.trim()) throw new Error('Comment cannot be empty');

    try {
      // Get task details for notification
      const { data: taskData } = await supabase
        .from('tasks')
        .select('*')
        .eq('id', taskId)
        .single();

      if (!taskData) {
        throw new Error('Task not found');
      }

      // Add comment
      const { data: comment, error } = await supabase
        .from('task_comments')
        .insert({
          task_id: taskId,
          author: username,
          content: content.trim()
        })
        .select()
        .single();

      if (error) throw error;

      // Send notification based on commenter's role
      if (comment) {
        await notifyTaskCommentAdded(
          taskData,
          comment.content,
          username,
          username === taskData.created_by ? taskData.assignee : taskData.created_by
        );
      }
    } catch (err) {
      console.error('Error adding comment:', err);
      throw err;
    }
  };

  return {
    comments,
    loading,
    error,
    addComment
  };
}