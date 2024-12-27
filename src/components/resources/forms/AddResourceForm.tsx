import React from 'react';
import type { Resource } from '../../../types/resource';

interface AddResourceFormProps {
  formData: Omit<Resource, 'id' | 'createdAt'>;
  onSubmit: (e: React.FormEvent<HTMLFormElement>) => void;
  updateField: (field: string, value: string) => void;
}

export function AddResourceForm({ formData, onSubmit, updateField }: AddResourceFormProps) {
  return (
    <form onSubmit={onSubmit} className="p-6 space-y-6">
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
          onChange={(e) => updateField('name', e.target.value)}
        />
      </div>

      <div className="space-y-2">
        <label className="block text-sm font-medium text-gray-200">URL</label>
        <input
          type="url"
          placeholder="Enter URL (optional)"
          className="w-full px-3 py-2 bg-[#1E1E1E] border border-[#2F2F2F] rounded-lg text-white placeholder-gray-400 focus:outline-none focus:border-[#10A37F]"
          value={formData.url}
          onChange={(e) => updateField('url', e.target.value)}
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
            onChange={(e) => updateField('username', e.target.value)}
          />
        </div>

        <div className="space-y-2">
          <label className="block text-sm font-medium text-gray-200">Password</label>
          <input
            type="password"
            placeholder="Enter password"
            className="w-full px-3 py-2 bg-[#1E1E1E] border border-[#2F2F2F] rounded-lg text-white placeholder-gray-400 focus:outline-none focus:border-[#10A37F]"
            value={formData.password}
            onChange={(e) => updateField('password', e.target.value)}
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
          onChange={(e) => updateField('accessUsers', e.target.value)}
        />
      </div>

      <div className="space-y-2">
        <label className="block text-sm font-medium text-gray-200">Notes</label>
        <textarea
          placeholder="Add any additional notes here"
          rows={4}
          className="w-full px-3 py-2 bg-[#1E1E1E] border border-[#2F2F2F] rounded-lg text-white placeholder-gray-400 focus:outline-none focus:border-[#10A37F] resize-none"
          value={formData.notes}
          onChange={(e) => updateField('notes', e.target.value)}
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
  );
}