import React, { createContext, useContext, useEffect, useState, useCallback } from 'react';
import { supabase } from '../supabaseClient';
import { toast } from 'react-hot-toast';

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

  // Initialise session and subscribe to changes
  useEffect(() => {
    const initSession = async () => {
      const { data } = await supabase.auth.getSession();
      setSession(data.session);
      setLoading(false);
    };

    initSession();

    const { data: authListener } = supabase.auth.onAuthStateChange((_event, newSession) => {
      setSession(newSession);
    });

    return () => authListener.subscription.unsubscribe();
  }, []);

  /**
   * PUBLIC_INTERFACE
   * Sign up user with email and password.
   */
  const signUp = useCallback(async ({ email, password }) => {
    const { error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        emailRedirectTo: `${window.location.origin}`
      }
    });

    if (error) {
      toast.error(`Sign up failed: ${error.message}`);
      throw error;
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
   */
  const signOut = useCallback(async () => {
    const { error } = await supabase.auth.signOut();
    if (error) {
      toast.error(`Sign out failed: ${error.message}`);
      throw error;
    }
    toast.success('Successfully logged out!');
  }, []);

  /**
   * PUBLIC_INTERFACE
   * Send password reset email.
   */
  const resetPassword = useCallback(async email => {
    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${window.location.origin}/reset-password`
    });
    if (error) {
      toast.error(`Password reset failed: ${error.message}`);
      throw error;
    }
    toast.success('Password reset email sent! Check your inbox.');
  }, []);

  /**
   * PUBLIC_INTERFACE
   * Update user's password after redirect.
   */
  const updatePassword = useCallback(async newPassword => {
    const { error } = await supabase.auth.updateUser({ password: newPassword });
    if (error) {
      toast.error(`Password update failed: ${error.message}`);
      throw error;
    }
    toast.success('Password updated successfully!');
  }, []);

  const value = {
    session,
    user: session?.user ?? null,
    loading,
    signUp,
    signIn,
    signOut,
    resetPassword,
    updatePassword
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
