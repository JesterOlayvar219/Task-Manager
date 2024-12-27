import React, { useState } from 'react';
import { Dialog } from '../common/Dialog';
import { SignInForm } from './SignInForm';
import { SignUpForm } from './SignUpForm';
import { ForgotPasswordForm } from './ForgotPasswordForm';

interface AuthDialogProps {
  isOpen: boolean;
  onClose: () => void;
}

type View = 'sign-in' | 'sign-up' | 'forgot-password';

export function AuthDialog({ isOpen, onClose }: AuthDialogProps) {
  const [view, setView] = useState<View>('sign-in');

  const handleSuccess = () => {
    onClose();
    setView('sign-in');
  };

  return (
    <Dialog
      isOpen={isOpen}
      onClose={onClose}
      title={
        view === 'sign-in' ? 'Sign In' :
        view === 'sign-up' ? 'Create Account' :
        'Reset Password'
      }
      className="max-w-md"
    >
      <div className="p-6">
        {view === 'sign-in' && (
          <>
            <SignInForm
              onSuccess={handleSuccess}
              onForgotPassword={() => setView('forgot-password')}
            />
            <p className="text-center mt-6 text-gray-400">
              Don't have an account?{' '}
              <button
                onClick={() => setView('sign-up')}
                className="text-[#10A37F] hover:text-[#15b892] transition-colors"
              >
                Sign up
              </button>
            </p>
          </>
        )}

        {view === 'sign-up' && (
          <>
            <SignUpForm onSuccess={handleSuccess} />
            <p className="text-center mt-6 text-gray-400">
              Already have an account?{' '}
              <button
                onClick={() => setView('sign-in')}
                className="text-[#10A37F] hover:text-[#15b892] transition-colors"
              >
                Sign in
              </button>
            </p>
          </>
        )}

        {view === 'forgot-password' && (
          <ForgotPasswordForm
            onSuccess={() => setView('sign-in')}
            onCancel={() => setView('sign-in')}
          />
        )}
      </div>
    </Dialog>
  );
}