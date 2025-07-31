import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { supabase } from '../supabaseClient';
import LoadingScreen from '../components/LoadingScreen';

export default function ResetPassword() {
  const { updatePassword } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [password, setPassword] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [isValidSession, setIsValidSession] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const checkPasswordResetSession = async () => {
      try {
        // Check if there's a password recovery session
        const { data: session, error } = await supabase.auth.getSession();
        
        if (error) {
          console.error('Error getting session:', error);
          navigate('/forgot-password');
          return;
        }

        // Check if this is a valid password reset session
        if (session?.session?.user) {
          // Check URL hash for recovery type
          const hashParams = new URLSearchParams(window.location.hash.substring(1));
          const isRecovery = hashParams.get('type') === 'recovery';
          
          if (isRecovery || location.pathname === '/reset-pw') {
            setIsValidSession(true);
          } else {
            // If user is already authenticated but not in recovery mode, redirect to dashboard
            navigate('/dashboard');
            return;
          }
        } else {
          // No valid session for password reset
          navigate('/forgot-password');
          return;
        }
      } catch (error) {
        console.error('Error checking password reset session:', error);
        navigate('/forgot-password');
      } finally {
        setLoading(false);
      }
    };

    checkPasswordResetSession();
  }, [navigate, location]);

  if (loading) {
    return <LoadingScreen />;
  }

  if (!isValidSession) {
    return <LoadingScreen />;
  }

  const handleSubmit = async e => {
    e.preventDefault();
    setSubmitting(true);
    try {
      await updatePassword(password);
      // After successful password update, redirect to login
      navigate('/login', { replace: true });
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
            <h1 className="text-3xl font-bold text-white">New Password</h1>
            <p className="text-zinc-400">Choose a secure password</p>
          </div>
          
          <div>
            <label htmlFor="password" className="block text-sm font-medium text-zinc-300 mb-2">
              New Password
            </label>
            <input
              id="password"
              className="w-full px-4 py-3 rounded-lg bg-zinc-800/50 border border-zinc-700 text-white placeholder-zinc-500 focus:outline-none focus:ring-2 focus:ring-accent focus:border-transparent transition-all duration-200"
              required
              type="password"
              placeholder="Enter your new password"
              value={password}
              onChange={e => setPassword(e.target.value)}
            />
          </div>

          <button
            className="w-full bg-accent hover:bg-accent/90 text-white font-medium py-3 px-4 rounded-lg transition-all duration-200 transform hover:scale-[1.02] disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none"
            disabled={submitting}
            type="submit"
          >
            {submitting ? (
              <div className="flex items-center justify-center space-x-2">
                <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                <span>Updating...</span>
              </div>
            ) : (
              'Update Password'
            )}
          </button>
        </form>
      </div>
    </div>
  );
}
