import React, { useState } from 'react';
import { Mail, Lock, User } from 'lucide-react';
import { signUp } from '../../lib/supabase/auth';
import { handleSupabaseError } from '../../lib/supabase/errors';
import { cn } from '../../lib/utils';
import type { UserRole } from '../../types/user';

interface SignUpFormProps {
  onSuccess: () => void;
}

const ROLES: Array<{ value: UserRole; label: string }> = [
  { value: 'developer', label: 'Developer' },
  { value: 'designer', label: 'Designer' },
  { value: 'researcher', label: 'Researcher' },
  { value: 'media_buyer', label: 'Media Buyer' },
  { value: 'copywriter', label: 'Copywriter' },
  { value: 'sales', label: 'Sales' },
  { value: 'accounting', label: 'Accounting' },
];

export function SignUpForm({ onSuccess }: SignUpFormProps) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [username, setUsername] = useState('');
  const [role, setRole] = useState<UserRole>('developer');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim() || !password.trim() || !username.trim() || loading) return;

    try {
      setLoading(true);
      setError('');
      await signUp(email, password, username, role);
      onSuccess();
    } catch (err) {
      setError(handleSupabaseError(err));
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <label className="block text-sm font-medium text-gray-200 mb-1">
          Email Address
        </label>
        <div className="relative">
          <Mail className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            className="w-full pl-10 pr-4 py-2 bg-[#1E1E1E] border border-[#2F2F2F] rounded-lg text-white placeholder-gray-400 focus:outline-none focus:border-[#10A37F]"
            placeholder="Enter your email"
          />
        </div>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-200 mb-1">
          Username
        </label>
        <div className="relative">
          <User className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
          <input
            type="text"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            required
            className="w-full pl-10 pr-4 py-2 bg-[#1E1E1E] border border-[#2F2F2F] rounded-lg text-white placeholder-gray-400 focus:outline-none focus:border-[#10A37F]"
            placeholder="Choose a username"
          />
        </div>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-200 mb-1">
          Password
        </label>
        <div className="relative">
          <Lock className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            className="w-full pl-10 pr-4 py-2 bg-[#1E1E1E] border border-[#2F2F2F] rounded-lg text-white placeholder-gray-400 focus:outline-none focus:border-[#10A37F]"
            placeholder="Choose a password"
          />
        </div>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-200 mb-1">
          Role
        </label>
        <select
          value={role}
          onChange={(e) => setRole(e.target.value as UserRole)}
          required
          className="w-full px-3 py-2 bg-[#1E1E1E] border border-[#2F2F2F] rounded-lg text-white focus:outline-none focus:border-[#10A37F]"
        >
          {ROLES.map(({ value, label }) => (
            <option key={value} value={value}>{label}</option>
          ))}
        </select>
      </div>

      {error && (
        <p className="text-sm text-red-400">{error}</p>
      )}

      <button
        type="submit"
        disabled={loading}
        className={cn(
          "w-full px-4 py-2 bg-[#10A37F] hover:bg-[#15b892] text-white rounded-lg transition-colors",
          "disabled:opacity-50 disabled:cursor-not-allowed"
        )}
      >
        {loading ? 'Creating Account...' : 'Create Account'}
      </button>
    </form>
  );
}