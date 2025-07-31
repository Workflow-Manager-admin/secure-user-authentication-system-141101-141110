import React, { useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { supabase } from '../supabaseClient';
import LoadingScreen from './LoadingScreen';

/**
 * PUBLIC_INTERFACE
 * Component to handle password reset redirects from email links
 * This component processes the auth tokens and ensures proper routing
 */
export default function PasswordResetHandler() {
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    const handlePasswordResetRedirect = async () => {
      console.log('PasswordResetHandler: Processing redirect...');
      console.log('Current URL:', window.location.href);
      
      try {
        // Set password reset flow marker immediately
        const RESET_FLOW_KEY = 'password_reset_flow';
        localStorage.setItem(RESET_FLOW_KEY, 'true');
        
        // Check if we have auth tokens in the URL hash
        const hashParams = new URLSearchParams(window.location.hash.substring(1));
        const accessToken = hashParams.get('access_token');
        const refreshToken = hashParams.get('refresh_token');
        const type = hashParams.get('type');
        
        console.log('URL parameters:', {
          type,
          hasAccessToken: !!accessToken,
          hasRefreshToken: !!refreshToken
        });

        if (type === 'recovery' && accessToken) {
          console.log('Processing password recovery...');
          
          // Set the session using the tokens from the URL
          const { error } = await supabase.auth.setSession({
            access_token: accessToken,
            refresh_token: refreshToken
          });
          
          if (error) {
            console.error('Error setting session:', error);
            localStorage.removeItem(RESET_FLOW_KEY); // Clear marker on error
            navigate('/forgot-password?error=invalid_link');
            return;
          }
          
          console.log('Session set successfully, redirecting to reset password page');
          
          // Clear the hash to clean up the URL and redirect to reset password page
          window.history.replaceState(null, '', window.location.pathname);
          
          // Small delay to ensure auth state change is processed
          setTimeout(() => {
            navigate('/reset-password', { replace: true });
          }, 100);
          
        } else if (type === 'recovery') {
          // Recovery type but no access token - redirect to reset password anyway
          console.log('Recovery type detected, redirecting to reset password page');
          navigate('/reset-password', { replace: true });
          
        } else {
          // Not a password reset link, clear the marker and handle normally
          localStorage.removeItem(RESET_FLOW_KEY);
          
          // Check if user is already authenticated
          const { data: session } = await supabase.auth.getSession();
          
          if (session?.session?.user) {
            console.log('User already authenticated, redirecting to dashboard');
            navigate('/dashboard', { replace: true });
          } else {
            console.log('No valid session, redirecting to login');
            navigate('/login', { replace: true });
          }
        }
        
      } catch (error) {
        console.error('Error handling password reset redirect:', error);
        localStorage.removeItem('password_reset_flow'); // Clear marker on error
        navigate('/forgot-password?error=processing_failed');
      }
    };

    handlePasswordResetRedirect();
  }, [navigate, location]);

  return <LoadingScreen />;
}
