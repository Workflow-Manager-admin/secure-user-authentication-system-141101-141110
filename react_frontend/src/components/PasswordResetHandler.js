import React, { useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { supabase } from '../supabaseClient';
import LoadingScreen from './LoadingScreen';

/**
 * PUBLIC_INTERFACE
 * Component to handle password reset redirects from email links
 * This component processes the auth tokens and ensures proper routing
 * with enhanced detection and flow protection
 */
export default function PasswordResetHandler() {
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    const handlePasswordResetRedirect = async () => {
      console.log('🔄 PasswordResetHandler: Processing redirect...');
      console.log('Current URL:', window.location.href);
      console.log('Referrer:', document.referrer);
      
      try {
        // Set multiple markers immediately for maximum reliability
        const RESET_FLOW_KEY = 'password_reset_flow';
        localStorage.setItem(RESET_FLOW_KEY, 'true');
        sessionStorage.setItem('password_reset_attempt', 'true');
        localStorage.setItem('password_reset_timestamp', Date.now().toString());
        
        console.log('✅ Set all password reset flow markers');
        
        // Check if we have auth tokens in the URL hash
        const hashParams = new URLSearchParams(window.location.hash.substring(1));
        const accessToken = hashParams.get('access_token');
        const refreshToken = hashParams.get('refresh_token');
        const type = hashParams.get('type');
        
        // Also check URL search params as fallback
        const urlParams = new URLSearchParams(window.location.search);
        const urlType = urlParams.get('type');
        const urlAccessToken = urlParams.get('access_token');
        
        const finalType = type || urlType;
        const finalAccessToken = accessToken || urlAccessToken;
        const finalRefreshToken = refreshToken || urlParams.get('refresh_token');
        
        console.log('🔍 URL parameters:', {
          type: finalType,
          hasAccessToken: !!finalAccessToken,
          hasRefreshToken: !!finalRefreshToken,
          hashParams: Object.fromEntries(hashParams),
          urlParams: Object.fromEntries(urlParams)
        });

        if (finalType === 'recovery' && finalAccessToken) {
          console.log('🔑 Processing password recovery with tokens...');
          
          // Set the session using the tokens from the URL
          const { error } = await supabase.auth.setSession({
            access_token: finalAccessToken,
            refresh_token: finalRefreshToken
          });
          
          if (error) {
            console.error('❌ Error setting session:', error);
            // Don't clear markers on session error - still try to proceed to reset page
            console.log('⚠️ Session error, but proceeding to reset page anyway');
            navigate('/reset-password', { replace: true });
            return;
          }
          
          console.log('✅ Session set successfully, redirecting to reset password page');
          
          // Clear the hash/params to clean up the URL and redirect to reset password page
          window.history.replaceState(null, '', window.location.pathname);
          
          // Increased delay to ensure auth state change is processed
          setTimeout(() => {
            navigate('/reset-password', { replace: true });
          }, 200);
          
        } else if (finalType === 'recovery' || finalAccessToken || finalRefreshToken) {
          // Any recovery indicators - redirect to reset password page
          console.log('🔍 Recovery indicators detected, redirecting to reset password page');
          navigate('/reset-password', { replace: true });
          
        } else if (window.location.href.includes('reset') || 
                   window.location.href.includes('recovery') ||
                   document.referrer.includes('supabase') ||
                   document.referrer.includes('mail')) {
          // URL contains reset/recovery terms or came from email - likely a password reset link
          console.log('📧 Reset/recovery terms or email referrer detected, assuming password reset flow');
          navigate('/reset-password', { replace: true });
          
        } else {
          // Not clearly a password reset link, but be cautious
          console.log('⚠️ Unclear if password reset, checking session...');
          
          // Check if user is already authenticated
          const { data: session } = await supabase.auth.getSession();
          
          if (session?.session?.user) {
            // If user is authenticated and we're not sure about reset flow, 
            // check if they might still be in a reset flow
            if (localStorage.getItem(RESET_FLOW_KEY) === 'true' ||
                sessionStorage.getItem('password_reset_attempt') === 'true') {
              console.log('🔄 User authenticated but has reset markers, going to reset page');
              navigate('/reset-password', { replace: true });
            } else {
              console.log('👤 User already authenticated, redirecting to dashboard');
              localStorage.removeItem(RESET_FLOW_KEY);
              sessionStorage.removeItem('password_reset_attempt');
              localStorage.removeItem('password_reset_timestamp');
              navigate('/dashboard', { replace: true });
            }
          } else {
            console.log('🚫 No valid session, redirecting to login');
            localStorage.removeItem(RESET_FLOW_KEY);
            sessionStorage.removeItem('password_reset_attempt');
            localStorage.removeItem('password_reset_timestamp');
            navigate('/login', { replace: true });
          }
        }
        
      } catch (error) {
        console.error('❌ Error handling password reset redirect:', error);
        // On error, still try to proceed to reset page if any reset indicators present
        if (window.location.href.includes('recovery') || 
            window.location.href.includes('reset') || 
            window.location.href.includes('access_token') ||
            document.referrer.includes('supabase') ||
            document.referrer.includes('mail')) {
          console.log('⚠️ Error occurred but reset indicators present, proceeding to reset page');
          navigate('/reset-password', { replace: true });
        } else {
          console.log('❌ Error with no clear reset indicators, going to forgot password');
          localStorage.removeItem('password_reset_flow');
          sessionStorage.removeItem('password_reset_attempt');
          localStorage.removeItem('password_reset_timestamp');
          navigate('/forgot-password?error=processing_failed');
        }
      }
    };

    handlePasswordResetRedirect();
  }, [navigate, location]);

  return <LoadingScreen />;
}
