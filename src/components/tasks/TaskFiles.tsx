import React from 'react';
import { FileText, Download, File } from 'lucide-react';
import { cn } from '../../lib/utils';
import type { TaskFile } from '../../types/task';

interface TaskFilesProps {
  files: TaskFile[];
  className?: string;
}

export function TaskFiles({ files, className }: TaskFilesProps) {
  if (!files?.length) return null;

  return (
    <div className={cn("space-y-2", className)}>
      <h4 className="text-sm font-medium text-gray-200">Attachments</h4>
      <div className="space-y-2">
        {files.map((file, index) => (
          <a
            key={`${file.name}-${index}`}
            href={file.url}
            target="_blank"
            rel="noopener noreferrer"
            className={cn(
              "flex items-center justify-between p-2",
              "bg-gray-800/30 rounded-lg",
              "text-sm text-gray-400 hover:text-white",
              "hover:bg-gray-700/50 transition-colors group"
            )}
          >
            <div className="flex items-center gap-2 min-w-0">
              <FileText size={14} className="shrink-0" />
              <span className="truncate">{file.name}</span>
            </div>
            <Download 
              size={14} 
              className="shrink-0 opacity-0 group-hover:opacity-100 transition-opacity" 
            />
          </a>
        ))}
      </div>
    </div>
  );
}