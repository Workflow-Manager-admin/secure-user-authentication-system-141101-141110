/**
 * PUBLIC_INTERFACE
 * Debug utility for testing password reset flow
 */

import { supabase } from '../supabaseClient';
import { getURL } from './getURL';

/**
 * Debug function to test password reset email generation
 * @param {string} email - Email to send reset link to
 */
export const debugPasswordReset = async (email) => {
  const siteUrl = getURL().replace(/\/$/, '');
  
  console.group('🔍 Password Reset Debug');
  console.log('Site URL:', siteUrl);
  console.log('Callback URL will be:', `${siteUrl}/auth/callback`);
  console.log('Final destination:', `${siteUrl}/reset-password`);
  console.log('Target email:', email);
  
  try {
    const { data, error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${siteUrl}/auth/callback`
    });
    
    if (error) {
      console.error('❌ Password reset failed:', error);
      return { success: false, error };
    }
    
    console.log('✅ Password reset email sent successfully');
    console.log('📧 Check your email for the reset link');
    console.log('🔗 The link will redirect via:', `${siteUrl}/auth/callback`);
    console.log('🎯 Final destination:', `${siteUrl}/reset-password`);
    
    return { success: true, data };
  } catch (err) {
    console.error('❌ Password reset error:', err);
    return { success: false, error: err };
  } finally {
    console.groupEnd();
  }
};

/**
 * Debug function to check current session and URL parameters
 */
export const debugCurrentSession = async () => {
  console.group('🔍 Session Debug');
  console.log('Current URL:', window.location.href);
  console.log('Pathname:', window.location.pathname);
  console.log('Hash:', window.location.hash);
  console.log('Search:', window.location.search);
  
  const hashParams = new URLSearchParams(window.location.hash.substring(1));
  console.log('Hash parameters:', Object.fromEntries(hashParams));
  
  try {
    const { data: session, error } = await supabase.auth.getSession();
    
    if (error) {
      console.error('❌ Session error:', error);
    } else {
      console.log('Session data:', session);
      console.log('User:', session.session?.user?.email || 'Not authenticated');
      console.log('Access token present:', !!session.session?.access_token);
    }
  } catch (err) {
    console.error('❌ Session check error:', err);
  } finally {
    console.groupEnd();
  }
};

/**
 * Test the complete password reset flow
 */
export const testPasswordResetFlow = async (email) => {
  console.group('🧪 Password Reset Flow Test');
  
  // Step 1: Send reset email
  console.log('Step 1: Sending password reset email...');
  const resetResult = await debugPasswordReset(email);
  
  if (!resetResult.success) {
    console.error('❌ Failed at step 1');
    console.groupEnd();
    return false;
  }
  
  // Step 2: Instructions for manual testing
  console.log('\n📋 Manual Testing Steps:');
  console.log('1. Check your email for the password reset link');
  console.log('2. Click the link in the email');
  console.log('3. Verify you land on the reset password page (not dashboard)');
  console.log('4. Try entering a new password');
  console.log('5. Verify successful password update');
  
  // Step 3: Show debugging helpers
  console.log('\n🛠️ Available Debug Functions:');
  console.log('- debugCurrentSession() - Check current session state');
  console.log('- debugPasswordReset(email) - Send another reset email');
  
  console.groupEnd();
  return true;
};

// Make functions available globally for console debugging
if (typeof window !== 'undefined') {
  window.debugPasswordReset = debugPasswordReset;
  window.debugCurrentSession = debugCurrentSession;
  window.testPasswordResetFlow = testPasswordResetFlow;
}

export default {
  debugPasswordReset,
  debugCurrentSession,
  testPasswordResetFlow
};
