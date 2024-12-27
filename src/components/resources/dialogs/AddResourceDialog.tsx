import React, { useState } from 'react';
import { X } from 'lucide-react';
import { ResourceForm } from '../forms/ResourceForm';
import { ResourceAccessControl } from '../forms/ResourceAccessControl';
import type { Resource } from '../../../types/resource';

interface AddResourceDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (resource: Omit<Resource, 'id' | 'createdAt'>) => Promise<void>;
}

export function AddResourceDialog({ isOpen, onClose, onSubmit }: AddResourceDialogProps) {
  const [formData, setFormData] = useState({
    name: '',
    url: '',
    username: '',
    password: '',
    notes: '',
    accessUsers: [] as string[]
  });
  const [isPublic, setIsPublic] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name.trim() || submitting) return;

    try {
      setSubmitting(true);
      await onSubmit({
        ...formData,
        accessUsers: isPublic ? ['Everyone'] : formData.accessUsers
      });
      
      setShowSuccess(true);
      setTimeout(() => {
        setShowSuccess(false);
        handleClose();
      }, 2000);
    } catch (error) {
      console.error('Error submitting resource:', error);
    } finally {
      setSubmitting(false);
    }
  };

  const handleClose = () => {
    setFormData({
      name: '',
      url: '',
      username: '',
      password: '',
      notes: '',
      accessUsers: []
    });
    setIsPublic(false);
    onClose();
  };

  const updateField = (field: string, value: string | string[]) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
      <div className="bg-[#2D2D2D] rounded-lg shadow-xl w-full max-w-2xl mx-4 max-h-[90vh] flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-700">
          <h2 className="text-xl font-semibold text-white">
            {showSuccess ? 'Success!' : 'Add Resource'}
          </h2>
          <button
            onClick={handleClose}
            className="text-gray-400 hover:text-white transition-colors"
          >
            <X size={20} />
          </button>
        </div>

        {/* Content */}
        {showSuccess ? (
          <div className="p-6 text-center">
            <p className="text-emerald-400 text-lg">Resource added successfully!</p>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto">
            <div className="p-6 space-y-6">
              {/* Resource Details */}
              <ResourceForm
                formData={formData}
                updateField={updateField}
              />

              {/* Access Control */}
              <ResourceAccessControl
                selectedUsers={formData.accessUsers}
                onChange={(users) => updateField('accessUsers', users)}
                isPublic={isPublic}
                onPublicChange={setIsPublic}
              />

              {/* Submit Button */}
              <div className="flex justify-end pt-4">
                <button
                  type="submit"
                  disabled={!formData.name.trim() || submitting}
                  className="px-6 py-2 bg-[#10A37F] hover:bg-[#15b892] text-white rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {submitting ? 'Adding...' : 'Add Resource'}
                </button>
              </div>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}