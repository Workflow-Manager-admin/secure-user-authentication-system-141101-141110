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

  // Initialise session and subscribe to changes
  useEffect(() => {
    const initSession = async () => {
      const { data } = await supabase.auth.getSession();
      setSession(data.session);
      setLoading(false);
    };

    initSession();

    const { data: authListener } = supabase.auth.onAuthStateChange(async (event, newSession) => {
      setSession(newSession);
      
      // If user just signed in and has metadata but no user record, create one
      if (event === 'SIGNED_IN' && newSession?.user) {
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

    return () => authListener.subscription.unsubscribe();
  }, []);

  /**
   * PUBLIC_INTERFACE
   * Sign up user with email, password, and user metadata.
   * Ensures the email confirmation link from Supabase redirects user to /reset-pw.
   */
  const { getURL } = require('../utils/getURL'); // Dynamic site URL utility

  const signUp = useCallback(async ({ email, password, firstName, lastName, profession }) => {
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
   * Ensures password reset email redirect always points to deployed /reset-pw route.
   */
  const resetPassword = useCallback(async email => {
    const { getURL } = require('../utils/getURL');
    const siteUrl = getURL().replace(/\/$/, '');
    // Reset password emails should redirect to /reset-pw on this deploy
    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${siteUrl}/reset-pw`
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
