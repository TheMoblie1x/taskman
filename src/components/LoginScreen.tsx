import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { GoogleIcon } from './GoogleIcon';

export const LoginScreen: React.FC = () => {
  const { signIn } = useApp();
  const [signingIn, setSigningIn] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSignIn = async () => {
    setError(null);
    setSigningIn(true);
    try {
      await signIn();
    } catch {
      setError('Sign-in failed. Please try again.');
    } finally {
      setSigningIn(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-50 dark:bg-slate-950 p-4">
      <div className="w-full max-w-sm bg-white dark:bg-slate-900 rounded-2xl shadow-xl border border-slate-200 dark:border-slate-800 p-8 text-center">
        <div className="w-12 h-12 rounded-xl bg-blue-600 text-white flex items-center justify-center font-bold mx-auto mb-4 shadow-2xs">
          <GoogleIcon name="view_kanban" size={24} />
        </div>
        <h1 className="text-lg font-bold text-slate-900 dark:text-white mb-1">FlowKanban</h1>
        <p className="text-xs text-slate-500 dark:text-slate-400 mb-6 leading-relaxed">
          Sign in with your Google account to access your workspaces and collaborate with your team.
        </p>

        <button
          onClick={handleSignIn}
          disabled={signingIn}
          className="w-full flex items-center justify-center gap-2 px-4 py-2.5 bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-700 rounded-lg font-semibold text-sm text-slate-700 dark:text-slate-200 transition-colors disabled:opacity-60"
        >
          {signingIn ? (
            <GoogleIcon name="progress_activity" size={16} className="animate-spin" />
          ) : (
            <svg width="16" height="16" viewBox="0 0 48 48" aria-hidden="true">
              <path fill="#FFC107" d="M43.6 20.5H42V20H24v8h11.3c-1.6 4.7-6.1 8-11.3 8-6.6 0-12-5.4-12-12s5.4-12 12-12c3.1 0 5.8 1.1 8 3l6-6C34.6 5.1 29.6 3 24 3 12.4 3 3 12.4 3 24s9.4 21 21 21 21-9.4 21-21c0-1.4-.1-2.8-.4-4.5z" />
              <path fill="#FF3D00" d="M6.3 14.7l6.6 4.8C14.6 15.1 18.9 12 24 12c3.1 0 5.8 1.1 8 3l6-6C34.6 5.1 29.6 3 24 3 16.3 3 9.6 7.3 6.3 14.7z" />
              <path fill="#4CAF50" d="M24 45c5.5 0 10.4-1.9 14.2-5.1l-6.5-5.5C29.6 36 26.9 37 24 37c-5.2 0-9.6-3.3-11.3-8l-6.6 5.1C9.5 40.6 16.2 45 24 45z" />
              <path fill="#1976D2" d="M43.6 20.5H42V20H24v8h11.3c-.8 2.3-2.2 4.2-4.1 5.6l6.5 5.5C41.5 36.6 45 30.9 45 24c0-1.4-.1-2.8-.4-3.5z" />
            </svg>
          )}
          {signingIn ? 'Signing in…' : 'Sign in with Google'}
        </button>

        {error && <p className="mt-3 text-[11px] text-rose-600">{error}</p>}

        <p className="mt-6 text-[10px] text-slate-400 leading-relaxed">
          Your workspaces are shared with the teammates you invite by email — everyone signs in
          with their own account.
        </p>
      </div>
    </div>
  );
};
