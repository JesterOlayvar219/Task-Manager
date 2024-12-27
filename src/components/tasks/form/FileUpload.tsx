import React, { useRef, useState } from 'react';
import { Upload, X } from 'lucide-react';
import { cn } from '../../../lib/utils';

interface FileUploadProps {
  onFilesSelected: (files: File[]) => void;
  selectedFiles: File[];
  onRemoveFile: (index: number) => void;
}

export function FileUpload({ onFilesSelected, selectedFiles, onRemoveFile }: FileUploadProps) {
  const [dragActive, setDragActive] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      onFilesSelected(Array.from(e.dataTransfer.files));
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      onFilesSelected(Array.from(e.target.files));
    }
  };

  return (
    <div className="space-y-2">
      <label className="block text-sm font-medium text-gray-200">
        Attachments
      </label>
      
      <div
        onDragEnter={handleDrag}
        onDragLeave={handleDrag}
        onDragOver={handleDrag}
        onDrop={handleDrop}
        className={cn(
          "w-full px-4 py-8 border-2 border-dashed rounded-lg transition-colors",
          "hover:border-gray-500",
          dragActive ? "border-[#10A37F] bg-[#10A37F]/5" : "border-gray-600"
        )}
      >
        <input
          ref={inputRef}
          type="file"
          multiple
          onChange={handleChange}
          className="hidden"
          accept=".pdf,.doc,.docx,.xls,.xlsx,.mp3,.mp4,.wav,.avi,.mov"
        />
        
        <div className="flex flex-col items-center gap-2 text-gray-400">
          <Upload size={24} />
          <button
            type="button"
            onClick={() => inputRef.current?.click()}
            className="text-[#10A37F] hover:text-[#15b892] transition-colors"
          >
            Click to upload
          </button>
          <span className="text-sm">or drag and drop files here</span>
          <span className="text-xs text-gray-500">
            Supported: PDF, Word, Excel, MP3, MP4, WAV, AVI, MOV
          </span>
        </div>
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
                onClick={() => onRemoveFile(index)}
                className="p-1 text-gray-400 hover:text-red-400 transition-colors"
              >
                <X size={16} />
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}