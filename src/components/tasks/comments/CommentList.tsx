import React from 'react';
import { formatTime } from '../../../lib/utils/date';
import type { TaskComment } from '../../../types/comment';

interface CommentListProps {
  comments: TaskComment[];
}

export function CommentList({ comments }: CommentListProps) {
  if (!comments.length) {
    return (
      <div className="text-sm text-gray-400 text-center py-2">
        No comments yet. Start the conversation!
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {comments.map((comment) => (
        <div key={comment.id} className="bg-gray-800/30 rounded-lg p-3">
          <div className="flex items-center justify-between gap-2 mb-1">
            <span className="text-sm font-medium text-gray-200">
              {comment.author}
            </span>
            <span className="text-xs text-gray-400">
              {formatTime(comment.createdAt)}
            </span>
          </div>
          <p className="text-sm text-gray-300 whitespace-pre-wrap break-words">
            {comment.content}
          </p>
        </div>
      ))}
    </div>
  );
}