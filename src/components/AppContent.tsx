import React from 'react';
import { useAuthContext } from '../contexts/AuthContext';
import { useProfile } from '../hooks/useProfile';
import { AuthDialog } from './auth/AuthDialog';
import { Layout } from './layout/Layout';

export function AppContent() {
  const { user, loading: authLoading } = useAuthContext();
  const { profile, loading: profileLoading } = useProfile(user?.id);

  // Show loading state while auth is initializing
  if (authLoading) {
    return (
      <div className="fixed inset-0 bg-[#313338] flex items-center justify-center">
        <div className="space-y-4 text-center">
          <div className="inline-block animate-spin rounded-full h-8 w-8 border-4 border-[#10A37F] border-t-transparent" />
          <p className="text-gray-400">Loading...</p>
        </div>
      </div>
    );
  }

  // Show auth dialog if not logged in
  if (!user) {
    return <AuthDialog isOpen={true} onClose={() => {}} />;
  }

  // Show loading state while profile is loading
  if (profileLoading) {
    return (
      <div className="fixed inset-0 bg-[#313338] flex items-center justify-center">
        <div className="space-y-4 text-center">
          <div className="inline-block animate-spin rounded-full h-8 w-8 border-4 border-[#10A37F] border-t-transparent" />
          <p className="text-gray-400">Loading profile...</p>
        </div>
      </div>
    );
  }

  // Show layout once everything is loaded
  return <Layout />;
}