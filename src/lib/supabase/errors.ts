import type { AuthError } from '@supabase/supabase-js';

const ERROR_MESSAGES: Record<string, string> = {
  'auth/invalid-email': 'Invalid email address',
  'auth/user-disabled': 'This account has been disabled',
  'auth/user-not-found': 'No user found with this email address',
  'auth/wrong-password': 'Invalid password',
  'auth/email-already-in-use': 'Email address is already in use',
  'auth/weak-password': 'Password should be at least 6 characters',
  'auth/invalid-credential': 'Invalid login credentials',
  'auth/operation-not-allowed': 'Operation not allowed',
  'auth/popup-closed-by-user': 'Authentication popup was closed',
};

export function handleSupabaseError(error: AuthError | Error | unknown): string {
  if (!error) return 'An unknown error occurred';

  // Handle Supabase auth errors
  if ('code' in (error as AuthError)) {
    const code = (error as AuthError).code;
    return ERROR_MESSAGES[code] || (error as AuthError).message;
  }

  // Handle other errors
  if (error instanceof Error) {
    return error.message;
  }

  return 'An unexpected error occurred';
}