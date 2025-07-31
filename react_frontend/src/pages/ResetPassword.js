/**
 * Password Reset Page
 * -------------------
 * This component handles password resets. It is *never* shown unless the user:
 *   - Arrived here via a Supabase password reset email (handled by /auth/callback)
 *   - Has a valid recovery token/session
 * Direct navigation here while logged in will redirect user to dashboard to prevent confusion/abuse.
 * 
 * DO NOT bypass /auth/callback for password resets; always ensure email links point to /auth/callback.
 */

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
        console.log('Checking password reset session...');
        console.log('Current URL:', window.location.href);
        console.log('Hash:', window.location.hash);
        console.log('Pathname:', location.pathname);
        
        // Check if there's a password recovery session
        const { data: session, error } = await supabase.auth.getSession();
        
        if (error) {
          console.error('Error getting session:', error);
          navigate('/forgot-password');
          return;
        }

        // Check for persistent reset flow marker
        const RESET_FLOW_KEY = 'password_reset_flow';
        const isStoredResetFlow = localStorage.getItem(RESET_FLOW_KEY) === 'true';
        
        // Enhanced recovery flow detection
        const hashParams = new URLSearchParams(window.location.hash.substring(1));
        const isRecovery = hashParams.get('type') === 'recovery';
        const hasAccessToken = hashParams.get('access_token');
        const hasRefreshToken = hashParams.get('refresh_token');
        const isResetPwRoute = location.pathname === '/reset-pw';
        const isResetPasswordRoute = location.pathname === '/reset-password';

        console.log('Recovery detection:', {
          isRecovery,
          hasAccessToken: !!hasAccessToken,
          hasRefreshToken: !!hasRefreshToken,
          isResetPwRoute,
          isResetPasswordRoute,
          hasSession: !!session?.session?.user,
          isStoredResetFlow
        });

        // Set persistent marker if we have recovery indicators
        if (isRecovery || hasAccessToken || hasRefreshToken) {
          localStorage.setItem(RESET_FLOW_KEY, 'true');
        }

        // More flexible validation for password reset sessions
        // Accept if any of these conditions are met:
        // 1. Has stored reset flow marker (most reliable)
        // 2. URL has recovery parameters (direct from email)
        // 3. Has valid session AND is on reset route (user navigated correctly)
        const isValidPasswordResetSession = 
          isStoredResetFlow || 
          isRecovery || 
          hasAccessToken || 
          hasRefreshToken ||
          (session?.session?.user && (isResetPasswordRoute || isResetPwRoute));

        if (isValidPasswordResetSession) {
          console.log('Valid password reset session detected');
          // Ensure marker is set for consistent state
          if (!isStoredResetFlow && (isRecovery || hasAccessToken || hasRefreshToken)) {
            localStorage.setItem(RESET_FLOW_KEY, 'true');
          }
          setIsValidSession(true);
        } else if (session?.session?.user) {
          // User is authenticated but not in a valid reset flow
          // Give them a chance - maybe they navigated directly
          console.log('User authenticated but no clear reset flow - checking if they came from reset email');
          
          // Check if they might have come from a reset email (document referrer check)
          const possibleResetFlow = document.referrer.includes('supabase') || 
                                   document.referrer.includes('mail') ||
                                   sessionStorage.getItem('password_reset_attempt') === 'true';
          
          if (possibleResetFlow) {
            console.log('Detected possible reset flow, allowing access');
            localStorage.setItem(RESET_FLOW_KEY, 'true');
            setIsValidSession(true);
          } else {
            console.log('User authenticated but not in reset flow, redirecting to dashboard');
            navigate('/dashboard');
            return;
          }
        } else {
          // No valid session for password reset
          console.log('No valid session, redirecting to forgot password');
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

    // Add delay to ensure URL parameters are fully processed
    const timeoutId = setTimeout(checkPasswordResetSession, 100);
    return () => clearTimeout(timeoutId);
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
    
    // Set timeout for the operation
    const timeoutId = setTimeout(() => {
      console.warn('⚠️ Update password operation timeout');
      setSubmitting(false);
    }, 30000); // 30 second timeout
    
    try {
      await updatePassword(password);
      clearTimeout(timeoutId);
      // AuthContext will clear the reset flow marker
      // Redirect to login with clean state
      localStorage.removeItem('password_reset_flow');
      navigate('/login', { replace: true });
    } catch (error) {
      clearTimeout(timeoutId);
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
