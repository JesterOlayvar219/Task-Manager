import React, { useState } from 'react';
import { ChevronDown, ChevronUp, Pencil, Trash2, MessageSquare } from 'lucide-react';
import { TaskStatusBadge } from './TaskStatusBadge';
import { TaskStatusButtons } from './TaskStatusButtons';
import { TaskFiles } from './TaskFiles';
import { TaskComments } from './comments/TaskComments';
import { TaskUpdateSection } from './updates/TaskUpdateSection';
import { TaskMetaInfo } from './TaskMetaInfo';
import { DeleteTaskDialog } from './DeleteTaskDialog';
import { cn } from '../../lib/utils';
import { useTaskFiles } from '../../hooks/useTaskFiles';
import type { Task } from '../../types/task';

interface TaskCardProps {
  task: Task;
  onEdit: (task: Task) => void;
  onDelete: (taskId: string) => void;
  onStatusChange: (taskId: string, status: Task['status']) => void;
  disabled?: boolean;
}

export function TaskCard({ task, onEdit, onDelete, onStatusChange, disabled }: TaskCardProps) {
  const [isExpanded, setIsExpanded] = useState(false);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const { uploadFiles } = useTaskFiles();

  const handleStatusChange = async (newStatus: Task['status']) => {
    if (disabled || newStatus === task.status) return;
    await onStatusChange(task.id, newStatus);
  };

  const handleDelete = async () => {
    try {
      await onDelete(task.id);
      setShowDeleteDialog(false);
    } catch (error) {
      console.error('Error deleting task:', error);
    }
  };

  const handleUpdateFiles = async (files: File[]) => {
    try {
      const uploadedFiles = await uploadFiles(task.id, files);
      return uploadedFiles;
    } catch (error) {
      console.error('Error uploading files:', error);
      throw error;
    }
  };

  return (
    <>
      <div className={cn(
        "bg-[#1E1F22] rounded-lg overflow-hidden transition-all duration-200",
        "hover:shadow-lg hover:shadow-black/10",
        "border border-gray-800/50 hover:border-gray-700/50"
      )}>
        {/* Header Section */}
        <div className="p-4 space-y-4">
          {/* Title and Status */}
          <div className="flex items-start justify-between gap-4">
            <div className="flex-1 min-w-0">
              <h3 className="text-base font-semibold text-gray-100 mb-2">
                {task.title}
              </h3>
              <p className={cn(
                "text-sm text-gray-300 leading-relaxed",
                isExpanded ? "line-clamp-none" : "line-clamp-2"
              )}>
                {task.description}
              </p>
            </div>
            <TaskStatusBadge status={task.status} />
          </div>

          {/* Meta Information */}
          <TaskMetaInfo task={task} />

          {/* Status Buttons */}
          <TaskStatusButtons
            currentStatus={task.status}
            onStatusChange={handleStatusChange}
            disabled={disabled}
          />
        </div>

        {/* Expanded Content */}
        {isExpanded && (
          <div className="px-4 pb-4 border-t border-gray-800 pt-4 space-y-6">
            {/* Description */}
            <div className="space-y-4">
              <p className="text-sm text-gray-300 whitespace-pre-wrap break-words leading-relaxed">
                {task.description}
              </p>
              {task.files && task.files.length > 0 && (
                <TaskFiles files={task.files} />
              )}
            </div>

            {/* Updates Section */}
            <TaskUpdateSection
              task={task}
              onUpdateFiles={handleUpdateFiles}
              disabled={disabled}
            />

            {/* Comments Section */}
            <div className="space-y-3">
              <div className="flex items-center gap-2 text-sm text-gray-300">
                <MessageSquare size={14} className="text-gray-400" />
                <h4 className="font-medium">Comments</h4>
              </div>
              <TaskComments taskId={task.id} />
            </div>
          </div>
        )}

        {/* Footer */}
        <div className="flex items-center justify-between px-4 py-2 bg-[#2B2D31] border-t border-gray-800">
          <button
            onClick={() => setIsExpanded(!isExpanded)}
            className="flex items-center gap-1.5 text-xs text-gray-400 hover:text-white transition-colors"
          >
            {isExpanded ? (
              <>
                <ChevronUp size={14} />
                <span>Show less</span>
              </>
            ) : (
              <>
                <ChevronDown size={14} />
                <span>Show more</span>
              </>
            )}
          </button>

          <div className="flex items-center gap-1">
            <button
              onClick={() => onEdit(task)}
              className="p-1.5 text-gray-400 hover:text-white hover:bg-gray-700/50 rounded transition-colors"
              title="Edit task"
            >
              <Pencil size={14} />
            </button>
            <button
              onClick={() => setShowDeleteDialog(true)}
              className="p-1.5 text-gray-400 hover:text-red-400 hover:bg-gray-700/50 rounded transition-colors"
              title="Delete task"
            >
              <Trash2 size={14} />
            </button>
          </div>
        </div>
      </div>

      <DeleteTaskDialog
        isOpen={showDeleteDialog}
        onClose={() => setShowDeleteDialog(false)}
        onConfirm={handleDelete}
        taskTitle={task.title}
      />
    </>
  );
}