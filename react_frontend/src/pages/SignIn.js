import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';

export default function SignIn() {
  const { signIn } = useAuth();
  const navigate = useNavigate();
  const [form, setForm] = useState({ email: '', password: '' });
  const [submitting, setSubmitting] = useState(false);

  const handleChange = e =>
    setForm({ ...form, [e.target.name]: e.target.value });

  const handleSubmit = async e => {
    e.preventDefault();
    setSubmitting(true);
    try {
      await signIn(form);
      navigate('/dashboard', { replace: true });
    } catch (error) {
      // Error is already handled by AuthContext with toast
    } finally {
      setSubmitting(false);
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
            <h1 className="text-3xl font-bold text-white">Welcome Back</h1>
            <p className="text-zinc-400">Sign in to your account</p>
          </div>
          
          <div className="space-y-4">
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-zinc-300 mb-2">
                Email Address
              </label>
              <input
                id="email"
                className="w-full px-4 py-3 rounded-lg bg-zinc-800/50 border border-zinc-700 text-white placeholder-zinc-500 focus:outline-none focus:ring-2 focus:ring-accent focus:border-transparent transition-all duration-200"
                required
                type="email"
                name="email"
                placeholder="Enter your email"
                value={form.email}
                onChange={handleChange}
              />
            </div>
            
            <div>
              <label htmlFor="password" className="block text-sm font-medium text-zinc-300 mb-2">
                Password
              </label>
              <input
                id="password"
                className="w-full px-4 py-3 rounded-lg bg-zinc-800/50 border border-zinc-700 text-white placeholder-zinc-500 focus:outline-none focus:ring-2 focus:ring-accent focus:border-transparent transition-all duration-200"
                required
                type="password"
                name="password"
                placeholder="Enter your password"
                value={form.password}
                onChange={handleChange}
              />
            </div>
          </div>

          <button
            className="w-full bg-accent hover:bg-accent/90 text-white font-medium py-3 px-4 rounded-lg transition-all duration-200 transform hover:scale-[1.02] disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none"
            disabled={submitting}
            type="submit"
          >
            {submitting ? (
              <div className="flex items-center justify-center space-x-2">
                <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                <span>Signing in...</span>
              </div>
            ) : (
              'Sign In'
            )}
          </button>

          <div className="flex items-center justify-between text-sm">
            <Link 
              to="/forgot-password" 
              className="text-accent hover:text-accent/80 transition-colors duration-200"
            >
              Forgot password?
            </Link>
            <Link 
              to="/signup" 
              className="text-accent hover:text-accent/80 transition-colors duration-200"
            >
              Create account
            </Link>
          </div>
        </form>
      </div>
    </div>
  );
}
