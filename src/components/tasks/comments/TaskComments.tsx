import React, { useState } from 'react';
import { useTaskComments } from '../../../hooks/useTaskComments';
import { CommentList } from './CommentList';
import { CommentInput } from './CommentInput';

interface TaskCommentsProps {
  taskId: string;
}

export function TaskComments({ taskId }: TaskCommentsProps) {
  const { comments, loading, error, addComment } = useTaskComments(taskId);
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async (content: string) => {
    try {
      setSubmitting(true);
      await addComment(content);
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return <div className="text-sm text-gray-400 max-w-[600px]">Loading comments...</div>;
  }

  if (error) {
    return <div className="text-sm text-red-400 max-w-[600px]">{error}</div>;
  }

  return (
    <div className="space-y-4">
      <CommentList comments={comments} />
      <CommentInput onSubmit={handleSubmit} disabled={submitting} />
    </div>
  );
}