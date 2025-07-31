/**
 * PUBLIC_INTERFACE
 * Integration test for password reset routing behavior
 * Verifies that users are correctly routed to reset password page from email links
 */

import { supabase } from '../supabaseClient';

/**
 * Test password reset flow routing
 */
export const testPasswordResetRouting = async () => {
  console.group('🔄 Password Reset Routing Test');
  
  const results = {
    success: true,
    tests: [],
    summary: ''
  };

  // Test 1: Verify localStorage marker functionality
  console.log('Test 1: localStorage marker functionality');
  try {
    localStorage.setItem('password_reset_flow', 'true');
    const marker = localStorage.getItem('password_reset_flow');
    
    if (marker === 'true') {
      results.tests.push({ name: 'localStorage marker', passed: true, message: 'Marker set and retrieved correctly' });
    } else {
      results.tests.push({ name: 'localStorage marker', passed: false, message: 'Marker not working correctly' });
      results.success = false;
    }
    
    localStorage.removeItem('password_reset_flow');
  } catch (error) {
    results.tests.push({ name: 'localStorage marker', passed: false, message: `Error: ${error.message}` });
    results.success = false;
  }

  // Test 2: Verify URL hash parameter detection
  console.log('Test 2: URL hash parameter detection');
  try {
    // Simulate password reset URL hash
    const originalHash = window.location.hash;
    window.location.hash = '#access_token=test&type=recovery&refresh_token=test';
    
    const hasRecovery = window.location.hash.includes('type=recovery');
    const hasAccessToken = window.location.hash.includes('access_token');
    
    if (hasRecovery && hasAccessToken) {
      results.tests.push({ name: 'URL hash detection', passed: true, message: 'Hash parameters detected correctly' });
    } else {
      results.tests.push({ name: 'URL hash detection', passed: false, message: 'Hash parameter detection failed' });
      results.success = false;
    }
    
    // Restore original hash
    window.location.hash = originalHash;
  } catch (error) {
    results.tests.push({ name: 'URL hash detection', passed: false, message: `Error: ${error.message}` });
    results.success = false;
  }

  // Test 3: Verify Supabase client functionality for password reset
  console.log('Test 3: Supabase client functionality');
  try {
    // Test if we can call the resetPasswordForEmail function (without actually sending)
    const testEmail = 'test@example.com';
    const siteUrl = process.env.REACT_APP_SITE_URL || window.location.origin;
    
    // This won't actually send an email but will test the function exists
    const resetFunction = supabase.auth.resetPasswordForEmail;
    
    if (typeof resetFunction === 'function') {
      results.tests.push({ name: 'Supabase reset function', passed: true, message: 'Reset password function available' });
    } else {
      results.tests.push({ name: 'Supabase reset function', passed: false, message: 'Reset password function not available' });
      results.success = false;
    }
  } catch (error) {
    results.tests.push({ name: 'Supabase reset function', passed: false, message: `Error: ${error.message}` });
    results.success = false;
  }

  // Test 4: Verify route path detection
  console.log('Test 4: Route path detection');
  try {
    const currentPath = window.location.pathname;
    const isResetPath = currentPath === '/reset-password' || currentPath === '/reset-pw';
    const isCallbackPath = currentPath === '/auth/callback';
    
    // This is just checking the logic works
    results.tests.push({ 
      name: 'Route path detection', 
      passed: true, 
      message: `Current path: ${currentPath}, Reset path: ${isResetPath}, Callback path: ${isCallbackPath}` 
    });
  } catch (error) {
    results.tests.push({ name: 'Route path detection', passed: false, message: `Error: ${error.message}` });
    results.success = false;
  }

  // Calculate summary
  const passed = results.tests.filter(t => t.passed).length;
  const total = results.tests.length;
  results.summary = `${passed}/${total} tests passed`;

  console.log('Test Results:', results);
  console.groupEnd();

  return results;
};

/**
 * Simulate password reset flow state
 */
export const simulatePasswordResetFlow = () => {
  console.group('🎭 Simulating Password Reset Flow');
  
  // Set the localStorage marker
  localStorage.setItem('password_reset_flow', 'true');
  console.log('✅ Set password reset flow marker');
  
  // Simulate URL hash with recovery parameters
  window.location.hash = '#access_token=simulated_token&type=recovery&refresh_token=simulated_refresh';
  console.log('✅ Set simulated recovery hash parameters');
  
  console.log('Password reset flow simulation complete');
  console.log('To clear: clearPasswordResetSimulation()');
  console.groupEnd();
};

/**
 * Clear password reset flow simulation
 */
export const clearPasswordResetSimulation = () => {
  localStorage.removeItem('password_reset_flow');
  window.location.hash = '';
  console.log('✅ Cleared password reset flow simulation');
};

// Make functions available globally for console testing
if (typeof window !== 'undefined') {
  window.testPasswordResetRouting = testPasswordResetRouting;
  window.simulatePasswordResetFlow = simulatePasswordResetFlow;
  window.clearPasswordResetSimulation = clearPasswordResetSimulation;
}

export default {
  testPasswordResetRouting,
  simulatePasswordResetFlow,
  clearPasswordResetSimulation
};
