import React, { useState, useRef } from 'react';
import { X, Upload, User } from 'lucide-react';
import { cn } from '../../lib/utils';
import { validateImageFile } from '../../lib/utils/validation';
import type { UserRole } from '../../types/user';

interface ProfileSetupDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (username: string, role: UserRole, profileImage?: File) => Promise<void>;
  initialData?: {
    username: string;
    role: UserRole;
    profileImage?: string;
  };
}

const ROLES: Array<{ value: UserRole; label: string }> = [
  { value: 'admin', label: 'Administrator' },
  { value: 'developer', label: 'Developer' },
  { value: 'researcher', label: 'Research Department' },
  { value: 'media_buyer', label: 'Media Buyer' },
  { value: 'copywriter', label: 'Copywriter' },
  { value: 'designer', label: 'Creative Designer' },
  { value: 'sales', label: 'Sales Department' },
  { value: 'accounting', label: 'Accounting' },
];

export function ProfileSetupDialog({
  isOpen,
  onClose,
  onSubmit,
  initialData,
}: ProfileSetupDialogProps) {
  const [username, setUsername] = useState(initialData?.username || '');
  const [role, setRole] = useState<UserRole>(initialData?.role || 'developer');
  const [profileImage, setProfileImage] = useState<File>();
  const [previewUrl, setPreviewUrl] = useState<string>(initialData?.profileImage || '');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  if (!isOpen) return null;

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const validation = validateImageFile(file);
      if (!validation.valid) {
        setError(validation.error || 'Invalid file');
        return;
      }

      setProfileImage(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setPreviewUrl(reader.result as string);
        setError('');
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!username.trim()) {
      setError('Username is required');
      return;
    }

    try {
      setLoading(true);
      setError('');
      await onSubmit(username, role, profileImage);
      onClose();
    } catch (err) {
      setError('Failed to save profile');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
      <div className="bg-[#2D2D2D] rounded-lg shadow-xl w-full max-w-md mx-4">
        <div className="flex items-center justify-between p-6 border-b border-gray-700">
          <h2 className="text-xl font-semibold text-white">
            {initialData ? 'Edit Profile' : 'Profile Setup'}
          </h2>
          {initialData && (
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-white transition-colors"
            >
              <X size={20} />
            </button>
          )}
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          <div className="flex flex-col items-center gap-4">
            <div className="relative">
              {previewUrl ? (
                <img
                  src={previewUrl}
                  alt="Profile"
                  className="w-24 h-24 rounded-full object-cover"
                />
              ) : (
                <div className="w-24 h-24 rounded-full bg-gray-700 flex items-center justify-center">
                  <User size={32} className="text-gray-400" />
                </div>
              )}
              <label className="absolute bottom-0 right-0 p-1 bg-[#10A37F] rounded-full cursor-pointer">
                <Upload size={16} className="text-white" />
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*"
                  onChange={handleImageUpload}
                  className="hidden"
                />
              </label>
            </div>
            <p className="text-sm text-gray-400">
              Upload a profile picture (max 5MB)
            </p>
          </div>

          <div className="space-y-2">
            <label className="block text-sm font-medium text-gray-200">
              Username <span className="text-red-400">*</span>
            </label>
            <input
              type="text"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              disabled={loading}
              placeholder="Enter your username"
              className={cn(
                "w-full px-3 py-2 bg-[#1E1E1E] border border-[#2F2F2F] rounded-lg",
                "text-white placeholder-gray-400 focus:outline-none focus:border-[#10A37F]",
                "disabled:opacity-50 disabled:cursor-not-allowed"
              )}
            />
          </div>

          <div className="space-y-2">
            <label className="block text-sm font-medium text-gray-200">
              Role <span className="text-red-400">*</span>
            </label>
            <select
              value={role}
              onChange={(e) => setRole(e.target.value as UserRole)}
              disabled={loading}
              className={cn(
                "w-full px-3 py-2 bg-[#1E1E1E] border border-[#2F2F2F] rounded-lg",
                "text-white focus:outline-none focus:border-[#10A37F]",
                "disabled:opacity-50 disabled:cursor-not-allowed"
              )}
            >
              {ROLES.map(({ value, label }) => (
                <option key={value} value={value}>{label}</option>
              ))}
            </select>
          </div>

          {error && (
            <p className="text-sm text-red-400">{error}</p>
          )}

          <div className="flex justify-end pt-4">
            <button
              type="submit"
              disabled={loading}
              className={cn(
                "px-6 py-2 bg-[#10A37F] hover:bg-[#15b892] text-white rounded-lg transition-colors",
                "disabled:opacity-50 disabled:cursor-not-allowed"
              )}
            >
              {loading ? 'Saving...' : 'Save Profile'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}