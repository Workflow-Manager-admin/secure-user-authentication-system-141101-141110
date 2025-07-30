import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';

export default function ForgotPassword() {
  const { resetPassword } = useAuth();
  const [email, setEmail] = useState('');
  const [sending, setSending] = useState(false);

  const handleSubmit = async e => {
    e.preventDefault();
    setSending(true);
    try {
      await resetPassword(email);
    } catch (error) {
      // Error is already handled by AuthContext with toast
    } finally {
      setSending(false);
    }
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-black text-white p-4">
      <div className="w-full max-w-md">
        <form
          onSubmit={handleSubmit}
          className="bg-zinc-900/80 backdrop-blur-sm p-8 rounded-xl shadow-2xl border border-zinc-800 space-y-6"
        >
          <div className="text-center space-y-2">
            <h1 className="text-3xl font-bold text-white">Reset Password</h1>
            <p className="text-zinc-400">Enter your email to receive a reset link</p>
          </div>
          
          <div>
            <label htmlFor="email" className="block text-sm font-medium text-zinc-300 mb-2">
              Email Address
            </label>
            <input
              id="email"
              className="w-full px-4 py-3 rounded-lg bg-zinc-800/50 border border-zinc-700 text-white placeholder-zinc-500 focus:outline-none focus:ring-2 focus:ring-accent focus:border-transparent transition-all duration-200"
              required
              type="email"
              placeholder="Enter your email"
              value={email}
              onChange={e => setEmail(e.target.value)}
            />
          </div>

          <button
            className="w-full bg-accent hover:bg-accent/90 text-white font-medium py-3 px-4 rounded-lg transition-all duration-200 transform hover:scale-[1.02] disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none"
            disabled={sending}
            type="submit"
          >
            {sending ? (
              <div className="flex items-center justify-center space-x-2">
                <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                <span>Sending...</span>
              </div>
            ) : (
              'Send Reset Link'
            )}
          </button>

          <div className="text-center">
            <Link 
              to="/login" 
              className="text-accent hover:text-accent/80 transition-colors duration-200 text-sm"
            >
              ← Back to sign in
            </Link>
          </div>
        </form>
      </div>
    </div>
  );
}
