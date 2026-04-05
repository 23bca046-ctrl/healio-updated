import React, { useState } from 'react';
import { AlertCircle, Mail, Lock } from 'lucide-react';
import { cn } from '../lib/utils';

interface AuthProps {
  isDarkMode?: boolean;
  onAuthSuccess?: (user: { email: string }) => void;
}

export default function Auth({ isDarkMode = false, onAuthSuccess }: AuthProps) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isSignUp, setIsSignUp] = useState(false);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError(null);
    setIsLoading(true);

    try {
      // Validation
      if (!email || !password) {
        throw new Error('Please fill in all fields');
      }

      if (password.length < 6) {
        throw new Error('Password must be at least 6 characters');
      }

      if (!email.includes('@')) {
        throw new Error('Please enter a valid email address');
      }

      // Here you would call Firebase authentication
      // const result = await signInWithEmailAndPassword(auth, email, password);
      
      console.log(`${isSignUp ? 'Signing up' : 'Signing in'} as:`, email);
      
      // Mock success
      onAuthSuccess?.({ email });
      
      // Reset form
      setEmail('');
      setPassword('');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Authentication failed');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div
      className={cn(
        'min-h-screen flex items-center justify-center p-4',
        isDarkMode ? 'bg-slate-950' : 'bg-slate-50'
      )}
    >
      <div
        className={cn(
          'w-full max-w-md rounded-2xl p-8 shadow-xl',
          isDarkMode ? 'bg-slate-900' : 'bg-white'
        )}
      >
        {/* Header */}
        <div className="mb-8">
          <h1
            className={cn(
              'text-3xl font-bold mb-2',
              isDarkMode ? 'text-white' : 'text-slate-900'
            )}
          >
            {isSignUp ? 'Create Account' : 'Sign In'}
          </h1>
          <p
            className={cn(
              'text-sm',
              isDarkMode ? 'text-slate-400' : 'text-slate-600'
            )}
          >
            {isSignUp
              ? 'Get started with Healio today'
              : 'Welcome back to Healio'}
          </p>
        </div>

        {/* Error Message */}
        {error && (
          <div
            className={cn(
              'flex gap-3 p-4 rounded-lg mb-6 border',
              'bg-red-50/10 border-red-500/30 text-red-600'
            )}
          >
            <AlertCircle size={20} className="flex-shrink-0 mt-0.5" />
            <p className="text-sm font-medium">{error}</p>
          </div>
        )}

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Email Input */}
          <div>
            <label
              className={cn(
                'block text-sm font-semibold mb-2',
                isDarkMode ? 'text-slate-300' : 'text-slate-700'
              )}
            >
              Email Address
            </label>
            <div className="relative">
              <Mail
                size={18}
                className={cn(
                  'absolute left-3 top-3',
                  isDarkMode ? 'text-slate-500' : 'text-slate-400'
                )}
              />
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className={cn(
                  'w-full pl-10 pr-4 py-2.5 rounded-lg border transition-colors focus:outline-none focus:ring-2',
                  isDarkMode
                    ? 'bg-slate-800 border-slate-700 text-white focus:border-emerald-500 focus:ring-emerald-500/30'
                    : 'bg-white border-slate-300 text-slate-900 focus:border-emerald-500 focus:ring-emerald-500/30'
                )}
                placeholder="you@example.com"
                disabled={isLoading}
              />
            </div>
          </div>

          {/* Password Input */}
          <div>
            <label
              className={cn(
                'block text-sm font-semibold mb-2',
                isDarkMode ? 'text-slate-300' : 'text-slate-700'
              )}
            >
              Password
            </label>
            <div className="relative">
              <Lock
                size={18}
                className={cn(
                  'absolute left-3 top-3',
                  isDarkMode ? 'text-slate-500' : 'text-slate-400'
                )}
              />
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className={cn(
                  'w-full pl-10 pr-4 py-2.5 rounded-lg border transition-colors focus:outline-none focus:ring-2',
                  isDarkMode
                    ? 'bg-slate-800 border-slate-700 text-white focus:border-emerald-500 focus:ring-emerald-500/30'
                    : 'bg-white border-slate-300 text-slate-900 focus:border-emerald-500 focus:ring-emerald-500/30'
                )}
                placeholder="••••••••"
                disabled={isLoading}
              />
            </div>
          </div>

          {/* Submit Button */}
          <button
            type="submit"
            disabled={isLoading}
            className={cn(
              'w-full py-3 rounded-lg font-semibold transition-all mt-6',
              isLoading
                ? 'opacity-50 cursor-not-allowed'
                : 'hover:shadow-lg active:scale-95 hover:bg-emerald-700',
              'bg-emerald-600 text-white'
            )}
          >
            {isLoading ? (
              <span className="flex items-center justify-center gap-2">
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                Processing...
              </span>
            ) : isSignUp ? (
              'Create Account'
            ) : (
              'Sign In'
            )}
          </button>
        </form>

        {/* Toggle Auth Mode */}
        <div className="mt-6 text-center border-t border-slate-700 pt-6">
          <p
            className={cn(
              'text-sm',
              isDarkMode ? 'text-slate-400' : 'text-slate-600'
            )}
          >
            {isSignUp ? "Already have an account? " : "Don't have an account? "}
            <button
              onClick={() => {
                setIsSignUp(!isSignUp);
                setError(null);
              }}
              className="font-semibold text-emerald-500 hover:text-emerald-400 transition-colors"
            >
              {isSignUp ? 'Sign In' : 'Sign Up'}
            </button>
          </p>
        </div>
      </div>
    </div>
  );
}
