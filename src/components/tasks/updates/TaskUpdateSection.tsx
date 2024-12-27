import React, { useState } from 'react';
import { Paperclip, X } from 'lucide-react';
import { cn } from '../../../lib/utils';
import { useTaskFiles } from '../../../hooks/useTaskFiles';
import type { Task } from '../../../types/task';

interface TaskUpdateSectionProps {
  task: Task;
  onUpdateFiles: (files: File[]) => Promise<void>;
  disabled?: boolean;
}

export function TaskUpdateSection({ task, onUpdateFiles, disabled }: TaskUpdateSectionProps) {
  const [selectedFiles, setSelectedFiles] = useState<File[]>([]);
  const [uploading, setUploading] = useState(false);
  const fileInputRef = React.useRef<HTMLInputElement>(null);

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files?.length) {
      setSelectedFiles(Array.from(e.target.files));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedFiles.length || disabled || uploading) return;

    try {
      setUploading(true);
      await onUpdateFiles(selectedFiles);
      setSelectedFiles([]);
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    } finally {
      setUploading(false);
    }
  };

  const removeFile = (index: number) => {
    setSelectedFiles(prev => prev.filter((_, i) => i !== index));
  };

  return (
    <div className="space-y-4">
      <h4 className="text-sm font-medium text-gray-200">Updates</h4>
      
      <form onSubmit={handleSubmit} className="space-y-3">
        <div className="relative">
          <input
            ref={fileInputRef}
            type="file"
            multiple
            onChange={handleFileSelect}
            className="hidden"
            disabled={disabled || uploading}
            accept=".pdf,.doc,.docx,.xls,.xlsx,.mp3,.mp4,.wav,.avi,.mov"
          />
          
          <button
            type="button"
            onClick={() => fileInputRef.current?.click()}
            disabled={disabled || uploading}
            className={cn(
              "w-full px-4 py-3 border-2 border-dashed rounded-lg",
              "text-sm text-gray-400 hover:text-gray-300 transition-colors",
              "hover:border-gray-600",
              "focus:outline-none focus:border-[#10A37F]",
              (disabled || uploading) && "opacity-50 cursor-not-allowed"
            )}
          >
            <div className="flex flex-col items-center gap-2">
              <Paperclip className="h-5 w-5" />
              <span>Attach files</span>
              <span className="text-xs text-gray-500">
                PDF, Word, Excel, Audio, Video (max 100MB)
              </span>
            </div>
          </button>
        </div>

        {selectedFiles.length > 0 && (
          <div className="space-y-2">
            {selectedFiles.map((file, index) => (
              <div
                key={`${file.name}-${index}`}
                className="flex items-center justify-between px-3 py-2 bg-gray-800/30 rounded-lg"
              >
                <span className="text-sm text-gray-300 truncate">{file.name}</span>
                <button
                  type="button"
                  onClick={() => removeFile(index)}
                  className="p-1 text-gray-400 hover:text-red-400 transition-colors"
                >
                  <X size={14} />
                </button>
              </div>
            ))}

            <button
              type="submit"
              disabled={disabled || uploading}
              className={cn(
                "w-full px-4 py-2 bg-[#10A37F] hover:bg-[#15b892]",
                "text-white text-sm font-medium rounded-lg transition-colors",
                "disabled:opacity-50 disabled:cursor-not-allowed"
              )}
            >
              {uploading ? 'Uploading...' : 'Upload Files'}
            </button>
          </div>
        )}
      </form>
    </div>
  );
}