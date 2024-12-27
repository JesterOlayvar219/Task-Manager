import React from 'react';
import { cn } from '../../../lib/utils';

interface ResourceFormData {
  name: string;
  url?: string;
  username?: string;
  password?: string;
  notes?: string;
}

interface ResourceFormProps {
  formData: ResourceFormData;
  updateField: (field: keyof ResourceFormData, value: string) => void;
}

function FormInput({
  label,
  name,
  value,
  onChange,
  type = 'text',
  required = false,
  placeholder,
}: {
  label: string;
  name: string;
  value: string;
  onChange: (value: string) => void;
  type?: string;
  required?: boolean;
  placeholder?: string;
}) {
  return (
    <div className="space-y-2">
      <label className="block text-sm font-medium text-gray-200">
        {label} {required && <span className="text-red-400">*</span>}
      </label>
      <input
        type={type}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        required={required}
        className={cn(
          "w-full px-3 py-2 bg-[#1E1E1E] border border-[#2F2F2F] rounded-lg",
          "text-white placeholder-gray-400",
          "focus:outline-none focus:border-[#10A37F]",
          "transition-colors duration-200"
        )}
        placeholder={placeholder}
      />
    </div>
  );
}

export function ResourceForm({ formData, updateField }: ResourceFormProps) {
  return (
    <div className="space-y-6">
      <FormInput
        label="Resource Name"
        name="name"
        value={formData.name}
        onChange={(value) => updateField('name', value)}
        required
        placeholder="Enter resource name"
      />

      <FormInput
        label="URL"
        name="url"
        value={formData.url || ''}
        onChange={(value) => updateField('url', value)}
        type="url"
        placeholder="Enter URL (optional)"
      />

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <FormInput
          label="Username"
          name="username"
          value={formData.username || ''}
          onChange={(value) => updateField('username', value)}
          placeholder="Enter username"
        />

        <FormInput
          label="Password"
          name="password"
          value={formData.password || ''}
          onChange={(value) => updateField('password', value)}
          type="password"
          placeholder="Enter password"
        />
      </div>

      <div className="space-y-2">
        <label className="block text-sm font-medium text-gray-200">
          Notes
        </label>
        <textarea
          value={formData.notes || ''}
          onChange={(e) => updateField('notes', e.target.value)}
          className={cn(
            "w-full px-3 py-2 bg-[#1E1E1E] border border-[#2F2F2F] rounded-lg",
            "text-white placeholder-gray-400",
            "focus:outline-none focus:border-[#10A37F]",
            "resize-none min-h-[100px]",
            "transition-colors duration-200"
          )}
          placeholder="Add any additional notes here"
        />
      </div>
    </div>
  );
}