import React, { useState } from 'react';
import { X } from 'lucide-react';
import type { Resource } from '../../types/resource';

interface AddResourceDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (resource: Omit<Resource, 'id' | 'createdAt'>) => void;
}

const initialFormData = {
  name: '',
  url: '',
  username: '',
  password: '',
  accessUsers: [] as string[],
  notes: '',
};

export function AddResourceDialog({ isOpen, onClose, onSubmit }: AddResourceDialogProps) {
  const [formData, setFormData] = useState(initialFormData);
  const [showSuccess, setShowSuccess] = useState(false);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    onSubmit({
      ...formData,
      accessUsers: formData.accessUsers.length ? formData.accessUsers : ['Everyone'],
    });
    
    setShowSuccess(true);
    
    setTimeout(() => {
      setShowSuccess(false);
      onClose();
      setFormData(initialFormData);
    }, 2000);
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
      <div className="bg-[#2D2D2D] rounded-lg shadow-xl w-full max-w-2xl mx-4">
        <div className="flex items-center justify-between p-6 border-b border-gray-700">
          <h2 className="text-xl font-semibold text-white">Add Resource</h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-white transition-colors"
          >
            <X size={20} />
          </button>
        </div>

        {showSuccess ? (
          <div className="p-6 flex items-center justify-center">
            <div className="text-emerald-400 text-lg font-medium">Resource Added!</div>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="p-6 space-y-6">
            <div className="space-y-2">
              <label className="block text-sm font-medium text-gray-200">
                Resource Name <span className="text-red-400">*</span>
              </label>
              <input
                type="text"
                required
                placeholder="Enter resource name"
                className="w-full px-3 py-2 bg-[#1E1E1E] border border-[#2F2F2F] rounded-lg text-white placeholder-gray-400 focus:outline-none focus:border-[#10A37F]"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              />
            </div>

            <div className="space-y-2">
              <label className="block text-sm font-medium text-gray-200">URL</label>
              <input
                type="url"
                placeholder="Enter URL (optional)"
                className="w-full px-3 py-2 bg-[#1E1E1E] border border-[#2F2F2F] rounded-lg text-white placeholder-gray-400 focus:outline-none focus:border-[#10A37F]"
                value={formData.url}
                onChange={(e) => setFormData({ ...formData, url: e.target.value })}
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <label className="block text-sm font-medium text-gray-200">Username</label>
                <input
                  type="text"
                  placeholder="Enter username"
                  className="w-full px-3 py-2 bg-[#1E1E1E] border border-[#2F2F2F] rounded-lg text-white placeholder-gray-400 focus:outline-none focus:border-[#10A37F]"
                  value={formData.username}
                  onChange={(e) => setFormData({ ...formData, username: e.target.value })}
                />
              </div>

              <div className="space-y-2">
                <label className="block text-sm font-medium text-gray-200">Password</label>
                <input
                  type="password"
                  placeholder="Enter password"
                  className="w-full px-3 py-2 bg-[#1E1E1E] border border-[#2F2F2F] rounded-lg text-white placeholder-gray-400 focus:outline-none focus:border-[#10A37F]"
                  value={formData.password}
                  onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                />
              </div>
            </div>

            <div className="space-y-2">
              <label className="block text-sm font-medium text-gray-200">Who Has Access?</label>
              <input
                type="text"
                placeholder="Type usernames (comma-separated)"
                className="w-full px-3 py-2 bg-[#1E1E1E] border border-[#2F2F2F] rounded-lg text-white placeholder-gray-400 focus:outline-none focus:border-[#10A37F]"
                value={formData.accessUsers.join(', ')}
                onChange={(e) => setFormData({
                  ...formData,
                  accessUsers: e.target.value.split(',').map(u => u.trim()).filter(Boolean)
                })}
              />
            </div>

            <div className="space-y-2">
              <label className="block text-sm font-medium text-gray-200">Notes</label>
              <textarea
                placeholder="Add any additional notes here"
                rows={4}
                className="w-full px-3 py-2 bg-[#1E1E1E] border border-[#2F2F2F] rounded-lg text-white placeholder-gray-400 focus:outline-none focus:border-[#10A37F] resize-none"
                value={formData.notes}
                onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
              />
            </div>

            <div className="flex justify-end pt-4">
              <button
                type="submit"
                className="px-6 py-2 bg-[#10A37F] hover:bg-[#15b892] text-white rounded-lg transition-colors"
              >
                Save Resource
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}