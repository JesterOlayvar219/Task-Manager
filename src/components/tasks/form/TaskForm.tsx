import React, { useState } from 'react';
import { Calendar } from 'lucide-react';
import { useTaskForm } from '../../../hooks/useTaskForm';
import { AssigneeSearch } from './AssigneeSearch';
import { TaskFormErrors } from './TaskFormErrors';
import { FileUpload } from './FileUpload';
import { useTaskFiles } from '../../../hooks/useTaskFiles';
import { cn } from '../../../lib/utils';
import type { Task } from '../../../types/task';

interface TaskFormProps {
  onSubmit: (task: Omit<Task, 'id' | 'createdAt'>) => Promise<void>;
  channels: { id: string; name: string }[];
  initialData?: Task;
}

export function TaskForm({ onSubmit, channels, initialData }: TaskFormProps) {
  const [selectedFiles, setSelectedFiles] = useState<File[]>([]);
  const [submitting, setSubmitting] = useState(false);
  const { uploading, uploadFiles } = useTaskFiles();
  const { formData, errors, updateField, handleSubmit } = useTaskForm({ 
    onSubmit: async (data) => {
      setSubmitting(true);
      try {
        let fileAttachments = [];
        if (selectedFiles.length > 0) {
          fileAttachments = await uploadFiles(crypto.randomUUID(), selectedFiles);
        }

        await onSubmit({
          ...data,
          files: fileAttachments
        });
      } finally {
        setSubmitting(false);
      }
    },
    initialData 
  });

  const handleFilesSelected = (files: File[]) => {
    setSelectedFiles(prev => [...prev, ...files]);
  };

  const handleRemoveFile = (index: number) => {
    setSelectedFiles(prev => prev.filter((_, i) => i !== index));
  };

  return (
    <form onSubmit={handleSubmit} className="p-4 space-y-4">
      {/* Title */}
      <div>
        <label className="block text-sm font-medium text-gray-200 mb-1">
          Title <span className="text-red-400">*</span>
        </label>
        <input
          type="text"
          value={formData.title}
          onChange={(e) => updateField('title', e.target.value)}
          required
          placeholder="Enter task title"
          className="w-full px-3 py-2 bg-[#1E1E1E] border border-[#2F2F2F] rounded-lg text-white placeholder-gray-400 focus:outline-none focus:border-[#10A37F]"
        />
      </div>

      {/* Description */}
      <div>
        <label className="block text-sm font-medium text-gray-200 mb-1">
          Description <span className="text-red-400">*</span>
        </label>
        <textarea
          value={formData.description}
          onChange={(e) => updateField('description', e.target.value)}
          required
          rows={3}
          placeholder="Enter task description"
          className="w-full px-3 py-2 bg-[#1E1E1E] border border-[#2F2F2F] rounded-lg text-white placeholder-gray-400 focus:outline-none focus:border-[#10A37F] resize-none"
        />
      </div>

      {/* Channel */}
      <div>
        <label className="block text-sm font-medium text-gray-200 mb-1">
          Channel
        </label>
        <select
          value={formData.channelId}
          onChange={(e) => updateField('channelId', e.target.value)}
          className="w-full px-3 py-2 bg-[#1E1E1E] border border-[#2F2F2F] rounded-lg text-white focus:outline-none focus:border-[#10A37F]"
        >
          <option value="">Personal Task</option>
          {channels.map((channel) => (
            <option key={channel.id} value={channel.id}>
              {channel.name}
            </option>
          ))}
        </select>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {/* Due Date */}
        <div>
          <label className="block text-sm font-medium text-gray-200 mb-1">
            Due Date <span className="text-red-400">*</span>
          </label>
          <div className="relative">
            <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={16} />
            <input
              type="date"
              value={formData.dueDate}
              onChange={(e) => updateField('dueDate', e.target.value)}
              required
              className={cn(
                "w-full pl-10 pr-4 py-2 bg-[#1E1E1E] border border-[#2F2F2F] rounded-lg",
                "text-white focus:outline-none focus:border-[#10A37F]",
                "[color-scheme:dark]"
              )}
            />
          </div>
        </div>

        {/* Assignee */}
        <div>
          <label className="block text-sm font-medium text-gray-200 mb-1">
            Assignee <span className="text-red-400">*</span>
          </label>
          <AssigneeSearch
            value={formData.assignee}
            onChange={(username) => updateField('assignee', username)}
            required
          />
        </div>
      </div>

      {/* File Upload */}
      <FileUpload
        onFilesSelected={handleFilesSelected}
        selectedFiles={selectedFiles}
        onRemoveFile={handleRemoveFile}
      />

      {/* Error Messages */}
      <TaskFormErrors errors={errors} />

      {/* Submit Button */}
      <div className="flex justify-end">
        <button
          type="submit"
          disabled={submitting || uploading}
          className={cn(
            "px-4 py-2 bg-[#10A37F] hover:bg-[#15b892] text-white rounded-lg transition-colors",
            "disabled:opacity-50 disabled:cursor-not-allowed"
          )}
        >
          {submitting || uploading ? 'Saving...' : (initialData ? 'Update Task' : 'Create Task')}
        </button>
      </div>
    </form>
  );
}