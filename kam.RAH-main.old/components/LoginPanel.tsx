import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { ApiError } from '../lib/apiClient';

export const LoginPanel: React.FC = () => {
  const { login, register } = useAuth();
  const [mode, setMode] = useState<'login' | 'register'>('login');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [status, setStatus] = useState<{ message: string; level: 'error' | 'info' } | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    setIsSubmitting(true);
    setStatus(null);
    try {
      if (mode === 'login') {
        await login(email, password);
      } else {
        await register(name, email, password);
      }
    } catch (error) {
      let message = 'Unable to authenticate.';
      if (error instanceof ApiError) {
        message = error.message;
      } else if (error instanceof Error) {
        message = error.message;
      }
      setStatus({ message, level: 'error' });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="h-screen w-screen bg-black flex flex-col items-center justify-center px-4">
      <div className="max-w-md w-full bg-black/70 border-2 border-[var(--color-neon-purple)] rounded-xl p-8 shadow-2xl">
        <h1 className="text-3xl font-orbitron text-center text-glow-cyan mb-6">Kam.RAH Access</h1>
        <p className="text-gray-400 text-sm text-center mb-8">
          Authenticate with your operator credentials to take command of the cybernetic grid.
        </p>
        <form className="space-y-4" onSubmit={handleSubmit}>
          {mode === 'register' && (
            <div>
              <label className="block text-xs font-semibold text-gray-400 uppercase mb-2">Codename</label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full bg-black/60 border border-[var(--color-neon-cyan)]/30 rounded-md px-3 py-2 text-white focus:outline-none focus:ring-2 focus:ring-[var(--color-neon-cyan)]"
                placeholder="Operator"
                required
              />
            </div>
          )}
          <div>
            <label className="block text-xs font-semibold text-gray-400 uppercase mb-2">Email</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full bg-black/60 border border-[var(--color-neon-cyan)]/30 rounded-md px-3 py-2 text-white focus:outline-none focus:ring-2 focus:ring-[var(--color-neon-cyan)]"
              placeholder="you@kamrah.ai"
              required
            />
          </div>
          <div>
            <label className="block text-xs font-semibold text-gray-400 uppercase mb-2">Password</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full bg-black/60 border border-[var(--color-neon-cyan)]/30 rounded-md px-3 py-2 text-white focus:outline-none focus:ring-2 focus:ring-[var(--color-neon-cyan)]"
              placeholder="••••••••"
              required
              minLength={6}
            />
          </div>
          {status && (
            <p className={`text-sm ${status.level === 'error' ? 'text-red-400' : 'text-[var(--color-neon-cyan)]'}`}>
              {status.message}
            </p>
          )}
          <button
            type="submit"
            disabled={isSubmitting}
            className="w-full py-3 rounded-md font-semibold bg-[var(--color-neon-cyan)] text-black hover:bg-[var(--color-neon-cyan)]/80 transition-colors disabled:opacity-50"
          >
            {isSubmitting ? 'Authorizing...' : mode === 'login' ? 'Enter Command Center' : 'Create Operator'}
          </button>
        </form>
        <p className="text-center text-sm text-gray-400 mt-6">
          {mode === 'login' ? 'Need an access key?' : 'Already have clearance?'}{' '}
          <button
            className="text-[var(--color-neon-cyan)] underline"
            onClick={() => setMode((prev) => (prev === 'login' ? 'register' : 'login'))}
          >
            {mode === 'login' ? 'Register a new operator' : 'Log in'}
          </button>
        </p>
      </div>
    </div>
  );
};
