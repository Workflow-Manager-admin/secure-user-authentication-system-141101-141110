import React, { createContext, useContext, useEffect, useState, useCallback } from 'react';
import { supabase } from '../supabaseClient';
import { toast } from 'react-hot-toast';
import { createUser, userExists } from '../utils/userUtils';

/**
 * Context holding authentication state and actions.
 */
const AuthContext = createContext();

/**
 * PUBLIC_INTERFACE
 * AuthProvider wraps the application and supplies authentication state & helpers.
 */
export const AuthProvider = ({ children }) => {
  const [session, setSession] = useState(null);
  const [loading, setLoading] = useState(true);

  // Initialise session and subscribe to changes with timeout and error handling
  useEffect(() => {
    let isMounted = true;
    let timeoutId;
    
    const initSession = async () => {
      try {
        // Set a timeout to prevent infinite loading
        timeoutId = setTimeout(() => {
          if (isMounted) {
            console.warn('⚠️ Auth initialization timeout, setting loading to false');
            setLoading(false);
          }
        }, 10000); // 10 second timeout
        
        const { data, error } = await supabase.auth.getSession();
        
        if (timeoutId) {
          clearTimeout(timeoutId);
        }
        
        if (isMounted) {
          if (error) {
            console.error('❌ Error getting session:', error);
            setSession(null);
          } else {
            setSession(data.session);
          }
          setLoading(false);
        }
      } catch (error) {
        console.error('❌ Critical error during auth initialization:', error);
        if (isMounted) {
          setSession(null);
          setLoading(false);
        }
      }
    };

    initSession();

    const { data: authListener } = supabase.auth.onAuthStateChange(async (event, newSession) => {
      console.log('Auth state change:', event, 'Path:', window.location.pathname, 'Hash:', window.location.hash);
      
      if (!isMounted) return;
      
      setSession(newSession);
      
      // Ensure loading is always false after auth state changes
      if (loading) {
        setLoading(false);
      }
      
      // Enhanced password reset flow detection with persistent marker
      const RESET_FLOW_KEY = 'password_reset_flow';
      const isStoredResetFlow = localStorage.getItem(RESET_FLOW_KEY) === 'true';
      const isRecoveryHash = window.location.hash.includes('type=recovery');
      const hasAccessToken = window.location.hash.includes('access_token');
      const hasRefreshToken = window.location.hash.includes('refresh_token');
      const isCallbackPath = window.location.pathname === '/auth/callback';
      const isResetPath = window.location.pathname === '/reset-password' || window.location.pathname === '/reset-pw';
      
      const isPasswordResetFlow = isStoredResetFlow ||
                                 isResetPath ||
                                 isCallbackPath ||
                                 isRecoveryHash ||
                                 hasAccessToken ||
                                 hasRefreshToken ||
                                 (event === 'PASSWORD_RECOVERY' || event === 'TOKEN_REFRESHED') ||
                                 document.referrer.includes('supabase');
      
      // Set persistent marker for password reset flows
      if (isRecoveryHash || hasAccessToken || hasRefreshToken || event === 'PASSWORD_RECOVERY') {
        localStorage.setItem(RESET_FLOW_KEY, 'true');
        sessionStorage.setItem('password_reset_attempt', 'true');
        localStorage.setItem('password_reset_timestamp', Date.now().toString());
        console.log('Password reset flow marker set');
      }
      
      // Clear marker when user completes normal sign in (not during password reset)
      if (event === 'SIGNED_IN' && !isPasswordResetFlow) {
        localStorage.removeItem(RESET_FLOW_KEY);
        sessionStorage.removeItem('password_reset_attempt');
        localStorage.removeItem('password_reset_timestamp');
        console.log('Password reset flow marker cleared for normal sign in');
      }
      
      // Clear markers on sign out to ensure clean state
      if (event === 'SIGNED_OUT') {
        localStorage.removeItem(RESET_FLOW_KEY);
        sessionStorage.removeItem('password_reset_attempt');
        localStorage.removeItem('password_reset_timestamp');
        console.log('Password reset flow markers cleared on sign out');
      }
      
      console.log('Is password reset flow:', isPasswordResetFlow, 'Stored:', isStoredResetFlow, 'Event:', event);
      
      // If user just signed in and has metadata but no user record, create one
      // Skip automatic redirects during password reset flow
      if (event === 'SIGNED_IN' && newSession?.user && !isPasswordResetFlow) {
        const user = newSession.user;
        
        // Check if user record exists in users table
        try {
          const { exists, error: checkError } = await userExists(user.id);
          
          // If no user record exists and user has metadata, create user record
          if (!exists && !checkError && user.user_metadata) {
            const metadata = user.user_metadata;
            
            if (metadata.first_name && metadata.last_name) {
              try {
                await createUser({
                  id: user.id,
                  email: user.email,
                  first_name: metadata.first_name,
                  last_name: metadata.last_name,
                  profession: metadata.profession || ''
                });
              } catch (createError) {
                console.warn('Failed to create user record on sign in:', createError);
              }
            }
          }
        } catch (error) {
          console.warn('Error checking/creating user record on sign in:', error);
        }
      }
    });

    return () => {
      isMounted = false;
      if (timeoutId) {
        clearTimeout(timeoutId);
      }
      authListener.subscription.unsubscribe();
    };
  }, []); // loading is intentionally excluded as it's managed internally

  /**
   * PUBLIC_INTERFACE
   * Sign up user with email, password, and user metadata.
   * Ensures the email confirmation link from Supabase redirects user to /login.
   */
  const signUp = useCallback(async ({ email, password, firstName, lastName, profession }) => {
    const { getURL } = require('../utils/getURL');
    const siteUrl = getURL().replace(/\/$/, '');
    // For signup and email verification, after user confirms email, redirect to /login per requirements
    const { data: signUpData, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        emailRedirectTo: `${siteUrl}/login`,
        data: {
          first_name: firstName,
          last_name: lastName,
          profession: profession,
          full_name: `${firstName} ${lastName}`
        }
      }
    });

    if (error) {
      toast.error(`Sign up failed: ${error.message}`);
      throw error;
    }

    // If user was created successfully, also create their record in users table
    if (signUpData.user) {
      try {
        const { error: userError } = await createUser({
          id: signUpData.user.id,
          email: email,
          first_name: firstName,
          last_name: lastName,
          profession: profession
        });

        if (userError) {
          // Log the error but don't fail the signup process
          // The user record creation is important but shouldn't block authentication
          console.warn('User record creation failed during signup:', userError);
          toast.error('Account created but user details storage failed. Please contact support.');
        } else {
          console.log('User record successfully created in users table');
        }
      } catch (userCreationError) {
        // Log the error but don't fail the signup process
        console.warn('User record creation failed during signup:', userCreationError);
        toast.error('Account created but user details storage failed. Please contact support.');
      }
    }

    toast.success('Check your email for the confirmation link!');
  }, []);

  /**
   * PUBLIC_INTERFACE
   * Sign in user with email & password.
   */
  const signIn = useCallback(async ({ email, password }) => {
    const { error } = await supabase.auth.signInWithPassword({ email, password });
    if (error) {
      toast.error(`Sign in failed: ${error.message}`);
      throw error;
    }
    toast.success('Welcome back! Successfully logged in.');
  }, []);

  /**
   * PUBLIC_INTERFACE
   * Sign out currently logged in user.
   * Clears session state immediately to prevent navigation delays.
   */
  const signOut = useCallback(async () => {
    try {
      // Clear session state immediately to prevent race conditions with navigation
      setSession(null);
      
      // Clear any password reset flow markers since user is signing out
      localStorage.removeItem('password_reset_flow');
      sessionStorage.removeItem('password_reset_attempt');
      localStorage.removeItem('password_reset_timestamp');
      
      // Call Supabase signOut
      const { error } = await supabase.auth.signOut();
      
      if (error) {
        // If signOut fails, we need to restore the session
        // The auth state change listener will handle this automatically
        console.error('Sign out error:', error);
        toast.error(`Sign out failed: ${error.message}`);
        throw error;
      }
      
      toast.success('Successfully logged out!');
    } catch (error) {
      // Re-throw error for component error handling
      throw error;
    }
  }, []);

  /**
   * PUBLIC_INTERFACE
   * Send password reset email.
   * Ensures password reset email redirect always points to the callback handler.
   */
  const resetPassword = useCallback(async email => {
    const { getURL } = require('../utils/getURL');
    const siteUrl = getURL().replace(/\/$/, '');
    // Use callback URL for better redirect handling of password reset emails
    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${siteUrl}/auth/callback`
    });
    if (error) {
      toast.error(`Password reset failed: ${error.message}`);
      throw error;
    }
    localStorage.setItem('password_reset_flow', 'true');
    sessionStorage.setItem('password_reset_attempt', 'true');
    localStorage.setItem('password_reset_timestamp', Date.now().toString());
    toast.success('Password reset email sent! Check your inbox.');
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []); // getURL is dynamically imported, dependency not needed

  /**
   * PUBLIC_INTERFACE
   * Update user's password after redirect.
   */
  const updatePassword = useCallback(async newPassword => {
    try {
      const { error } = await supabase.auth.updateUser({ password: newPassword });
      if (error) {
        toast.error(`Password update failed: ${error.message}`);
        throw error;
      }
      // Clear password reset flow marker on successful update
      localStorage.removeItem('password_reset_flow');
      sessionStorage.removeItem('password_reset_attempt');
      localStorage.removeItem('password_reset_timestamp');
      toast.success('Password updated successfully!');
    } catch (error) {
      toast.error(`Password update failed: ${error.message}`);
      throw error;
    }
  }, []);

  /**
   * PUBLIC_INTERFACE
   * Check if user is currently in a password reset flow
   * This function provides comprehensive detection to ensure users coming from
   * password reset emails are NEVER redirected away from the reset flow
   */
  const isInPasswordResetFlow = useCallback(() => {
    const RESET_FLOW_KEY = 'password_reset_flow';
    const isStoredResetFlow = localStorage.getItem(RESET_FLOW_KEY) === 'true';
    const isRecoveryHash = window.location.hash.includes('type=recovery');
    const hasAccessToken = window.location.hash.includes('access_token');
    const hasRefreshToken = window.location.hash.includes('refresh_token');
    const isCallbackPath = window.location.pathname === '/auth/callback';
    const isResetPath = window.location.pathname === '/reset-password' || window.location.pathname === '/reset-pw';
    
    // Additional checks for more comprehensive detection
    const hasResetTokenInUrl = window.location.href.includes('access_token') || window.location.href.includes('refresh_token');
    const isFromEmailProvider = document.referrer.includes('supabase') || 
                               document.referrer.includes('mail') || 
                               document.referrer.includes('gmail') ||
                               document.referrer.includes('outlook') ||
                               document.referrer.includes('yahoo');
    const hasSessionStorageMarker = sessionStorage.getItem('password_reset_attempt') === 'true';
    
    // Check URL search params as well (backup detection)
    const urlParams = new URLSearchParams(window.location.search);
    const hasResetParam = urlParams.get('type') === 'recovery' || urlParams.get('reset') === 'true';
    
    // Check if reset attempt was recent (within last 10 minutes)
    const recentResetAttempt = localStorage.getItem('password_reset_timestamp') && 
                              (Date.now() - parseInt(localStorage.getItem('password_reset_timestamp'))) < 10 * 60 * 1000;
    
    const isInResetFlow = isStoredResetFlow || 
                         isRecoveryHash || 
                         hasAccessToken || 
                         hasRefreshToken || 
                         isCallbackPath || 
                         isResetPath ||
                         hasResetTokenInUrl ||
                         isFromEmailProvider ||
                         hasSessionStorageMarker ||
                         hasResetParam ||
                         recentResetAttempt;
    
    // Log for debugging purposes
    if (isInResetFlow) {
      console.log('Password reset flow detected:', {
        isStoredResetFlow,
        isRecoveryHash,
        hasAccessToken,
        hasRefreshToken,
        isCallbackPath,
        isResetPath,
        hasResetTokenInUrl,
        isFromEmailProvider,
        hasSessionStorageMarker,
        hasResetParam,
        recentResetAttempt,
        currentUrl: window.location.href,
        referrer: document.referrer
      });
    }
    
    return isInResetFlow;
  }, []);

  const value = {
    session,
    user: session?.user ?? null,
    loading,
    signUp,
    signIn,
    signOut,
    resetPassword,
    updatePassword,
    isInPasswordResetFlow
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

/**
 * PUBLIC_INTERFACE
 * Hook for accessing authentication context.
 */
export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
