import { supabase } from '../supabaseClient'
import { getURL } from './getURL'
import { toast } from 'react-hot-toast'

/**
 * PUBLIC_INTERFACE
 * Authentication utility functions with proper redirect URL handling
 */

/**
 * Sign up user with email and password
 * @param {string} email - User email
 * @param {string} password - User password
 * @param {Object} metadata - Additional user metadata
 * @returns {Promise<{data: Object|null, error: Error|null}>}
 */
export const signUp = async (email, password, metadata = {}) => {
  const siteUrl = getURL().replace(/\/$/, '');
  // After verification, redirect new user to /login per requirements
  const { data, error } = await supabase.auth.signUp({
    email,
    password,
    options: {
      emailRedirectTo: `${siteUrl}/login`,
      data: metadata
    }
  })
  return { data, error }
}

/**
 * Sign in user with email and password
 * @param {string} email - User email
 * @param {string} password - User password
 * @returns {Promise<{data: Object|null, error: Error|null}>}
 */
export const signIn = async (email, password) => {
  const { data, error } = await supabase.auth.signInWithPassword({
    email,
    password
  })
  return { data, error }
}

/**
 * Send password reset email
 * @param {string} email - User email
 * @returns {Promise<{data: Object|null, error: Error|null}>}
 */
export const resetPassword = async (email) => {
  const siteUrl = getURL().replace(/\/$/, '');
  const { data, error } = await supabase.auth.resetPasswordForEmail(email, {
    redirectTo: `${siteUrl}/reset-pw`
  })
  return { data, error }
}

/**
 * Sign in with magic link
 * @param {string} email - User email
 * @returns {Promise<{data: Object|null, error: Error|null}>}
 */
export const signInWithMagicLink = async (email) => {
  const siteUrl = getURL().replace(/\/$/, '');
  const { data, error } = await supabase.auth.signInWithOtp({
    email,
    options: {
      emailRedirectTo: `${siteUrl}/login`
    }
  })
  return { data, error }
}

/**
 * Sign in with OAuth provider
 * @param {string} provider - OAuth provider (google, github, etc.)
 * @returns {Promise<{data: Object|null, error: Error|null}>}
 */
export const signInWithOAuth = async (provider) => {
  const siteUrl = getURL().replace(/\/$/, '');
  const { data, error } = await supabase.auth.signInWithOAuth({
    provider,
    options: {
      redirectTo: `${siteUrl}/login`
    }
  })
  return { data, error }
}

/**
 * Sign out current user
 * @returns {Promise<{error: Error|null}>}
 */
export const signOut = async () => {
  const { error } = await supabase.auth.signOut()
  return { error }
}

/**
 * Update user password
 * @param {string} newPassword - New password
 * @returns {Promise<{data: Object|null, error: Error|null}>}
 */
export const updatePassword = async (newPassword) => {
  const { data, error } = await supabase.auth.updateUser({
    password: newPassword
  })
  return { data, error }
}

/**
 * Handle authentication errors with appropriate user feedback
 * @param {Error} error - Authentication error
 * @param {Object} router - Router object for navigation
 */
export const handleAuthError = (error, router) => {
  console.error('Authentication error:', error)

  if (error.message.includes('redirect')) {
    // Redirect URL not in allowlist
    toast.error('Authentication redirect error. Please contact support.')
    router.push('/login?error=redirect')
  } else if (error.message.includes('email')) {
    // Email confirmation issues
    toast.error('Email confirmation issue. Please check your email.')
    router.push('/login?error=email')
  } else if (error.message.includes('Invalid login credentials')) {
    toast.error('Invalid email or password. Please try again.')
  } else if (error.message.includes('Email not confirmed')) {
    toast.error('Please confirm your email address before signing in.')
  } else {
    // Generic auth error
    toast.error(`Authentication error: ${error.message}`)
  }
}

/**
 * Get the current authenticated user
 * @returns {Promise<{data: Object|null, error: Error|null}>}
 */
export const getCurrentUser = async () => {
  const { data, error } = await supabase.auth.getUser()
  return { data: data.user, error }
}

/**
 * Get current session
 * @returns {Promise<{data: Object|null, error: Error|null}>}
 */
export const getCurrentSession = async () => {
  const { data, error } = await supabase.auth.getSession()
  return { data: data.session, error }
}
