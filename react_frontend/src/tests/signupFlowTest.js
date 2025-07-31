import { supabase } from '../supabaseClient';
import { createUser, userExists, getUserById } from '../utils/userUtils';
import { toast } from 'react-hot-toast';

/**
 * PUBLIC_INTERFACE
 * Test script to verify the signup flow and users table population
 * This script tests the complete signup process and verifies database integration
 */

// Test configuration
const TEST_CONFIG = {
  testEmail: `test-user-${Date.now()}@example.com`,
  testPassword: 'TestPassword123!',
  testFirstName: 'Test',
  testLastName: 'User',
  testProfession: 'IT Professional'
};

/**
 * Test Results Interface
 */
class TestResults {
  constructor() {
    this.results = [];
    this.failures = [];
    this.success = true;
  }

  addResult(testName, passed, message, data = null) {
    const result = {
      test: testName,
      passed,
      message,
      data,
      timestamp: new Date().toISOString()
    };
    
    this.results.push(result);
    
    if (!passed) {
      this.success = false;
      this.failures.push(result);
    }
    
    console.log(`${passed ? '✅' : '❌'} ${testName}: ${message}`);
    if (data) {
      console.log('   Data:', data);
    }
  }

  getSummary() {
    const passed = this.results.filter(r => r.passed).length;
    const failed = this.results.length - passed;
    
    return {
      totalTests: this.results.length,
      passed,
      failed,
      success: this.success,
      results: this.results,
      failures: this.failures
    };
  }
}

/**
 * Test 1: Verify Supabase connection
 */
async function testSupabaseConnection(testResults) {
  try {
    const { data, error } = await supabase.auth.getSession();
    
    if (error) {
      testResults.addResult('Supabase Connection', false, `Connection failed: ${error.message}`, error);
      return false;
    }
    
    testResults.addResult('Supabase Connection', true, 'Successfully connected to Supabase');
    return true;
  } catch (error) {
    testResults.addResult('Supabase Connection', false, `Connection error: ${error.message}`, error);
    return false;
  }
}

/**
 * Test 2: Verify users table exists and is accessible
 */
async function testUsersTableAccess(testResults) {
  try {
    const { data, error } = await supabase
      .from('users')
      .select('id')
      .limit(1);
    
    if (error) {
      testResults.addResult('Users Table Access', false, `Table access failed: ${error.message}`, error);
      return false;
    }
    
    testResults.addResult('Users Table Access', true, 'Users table is accessible');
    return true;
  } catch (error) {
    testResults.addResult('Users Table Access', false, `Table access error: ${error.message}`, error);
    return false;
  }
}

/**
 * Test 3: Test user creation utility function
 */
async function testUserCreationUtility(testResults) {
  try {
    // Create a test user record (this will be cleaned up later)
    const testUserData = {
      id: `test-${Date.now()}`,
      email: TEST_CONFIG.testEmail,
      first_name: TEST_CONFIG.testFirstName,
      last_name: TEST_CONFIG.testLastName,
      profession: TEST_CONFIG.testProfession
    };
    
    const { data, error } = await createUser(testUserData);
    
    if (error) {
      testResults.addResult('User Creation Utility', false, `User creation failed: ${error.message}`, error);
      return { success: false, userId: null };
    }
    
    if (!data || !data.id) {
      testResults.addResult('User Creation Utility', false, 'User creation returned no data');
      return { success: false, userId: null };
    }
    
    testResults.addResult('User Creation Utility', true, 'User creation utility works correctly', data);
    return { success: true, userId: data.id };
    
  } catch (error) {
    testResults.addResult('User Creation Utility', false, `User creation error: ${error.message}`, error);
    return { success: false, userId: null };
  }
}

/**
 * Test 4: Test user existence check
 */
async function testUserExistenceCheck(testResults, userId) {
  try {
    const { exists, error } = await userExists(userId);
    
    if (error) {
      testResults.addResult('User Existence Check', false, `Existence check failed: ${error.message}`, error);
      return false;
    }
    
    if (!exists) {
      testResults.addResult('User Existence Check', false, 'User should exist but was not found');
      return false;
    }
    
    testResults.addResult('User Existence Check', true, 'User existence check works correctly');
    return true;
    
  } catch (error) {
    testResults.addResult('User Existence Check', false, `Existence check error: ${error.message}`, error);
    return false;
  }
}

/**
 * Test 5: Test user retrieval
 */
async function testUserRetrieval(testResults, userId) {
  try {
    const { data, error } = await getUserById(userId);
    
    if (error) {
      testResults.addResult('User Retrieval', false, `User retrieval failed: ${error.message}`, error);
      return false;
    }
    
    if (!data) {
      testResults.addResult('User Retrieval', false, 'User retrieval returned no data');
      return false;
    }
    
    // Verify the retrieved data matches what we expect
    const expectedFields = ['id', 'email', 'first_name', 'last_name', 'profession', 'created_at'];
    const missingFields = expectedFields.filter(field => !(field in data));
    
    if (missingFields.length > 0) {
      testResults.addResult('User Retrieval', false, `Missing expected fields: ${missingFields.join(', ')}`, data);
      return false;
    }
    
    testResults.addResult('User Retrieval', true, 'User retrieval works correctly', data);
    return true;
    
  } catch (error) {
    testResults.addResult('User Retrieval', false, `User retrieval error: ${error.message}`, error);
    return false;
  }
}

/**
 * Test 6: Simulate complete signup flow
 */
async function testCompleteSignupFlow(testResults) {
  try {
    console.log('\n🔄 Testing complete signup flow...');
    
    // Step 1: Attempt Supabase Auth signup
    // Use updated deployed domain and required /login endpoint for confirmation
    const { data: signUpData, error: signUpError } = await supabase.auth.signUp({
      email: TEST_CONFIG.testEmail,
      password: TEST_CONFIG.testPassword,
      options: {
        emailRedirectTo: `https://project-2025-07-30-084829-3.kavia.app/login`,
        data: {
          first_name: TEST_CONFIG.testFirstName,
          last_name: TEST_CONFIG.testLastName,
          profession: TEST_CONFIG.testProfession,
          full_name: `${TEST_CONFIG.testFirstName} ${TEST_CONFIG.testLastName}`
        }
      }
    });
    
    if (signUpError) {
      testResults.addResult('Signup Flow - Auth', false, `Auth signup failed: ${signUpError.message}`, signUpError);
      return { success: false, authUserId: null };
    }
    
    if (!signUpData.user) {
      testResults.addResult('Signup Flow - Auth', false, 'Auth signup returned no user data');
      return { success: false, authUserId: null };
    }
    
    testResults.addResult('Signup Flow - Auth', true, 'Supabase Auth signup successful', {
      userId: signUpData.user.id,
      email: signUpData.user.email
    });
    
    const authUserId = signUpData.user.id;
    
    // Step 2: Create user record in users table
    const { data: userData, error: userError } = await createUser({
      id: authUserId,
      email: TEST_CONFIG.testEmail,
      first_name: TEST_CONFIG.testFirstName,
      last_name: TEST_CONFIG.testLastName,
      profession: TEST_CONFIG.testProfession
    });
    
    if (userError) {
      testResults.addResult('Signup Flow - User Record', false, `User record creation failed: ${userError.message}`, userError);
      return { success: false, authUserId };
    }
    
    testResults.addResult('Signup Flow - User Record', true, 'User record created successfully', userData);
    
    // Step 3: Verify user record exists and contains correct data
    const { data: retrievedUser, error: retrievalError } = await getUserById(authUserId);
    
    if (retrievalError) {
      testResults.addResult('Signup Flow - Verification', false, `User record verification failed: ${retrievalError.message}`, retrievalError);
      return { success: false, authUserId };
    }
    
    // Verify all expected data is present
    const verificationChecks = [
      { field: 'id', expected: authUserId, actual: retrievedUser.id },
      { field: 'email', expected: TEST_CONFIG.testEmail, actual: retrievedUser.email },
      { field: 'first_name', expected: TEST_CONFIG.testFirstName, actual: retrievedUser.first_name },
      { field: 'last_name', expected: TEST_CONFIG.testLastName, actual: retrievedUser.last_name },
      { field: 'profession', expected: TEST_CONFIG.testProfession, actual: retrievedUser.profession }
    ];
    
    const failedChecks = verificationChecks.filter(check => check.expected !== check.actual);
    
    if (failedChecks.length > 0) {
      testResults.addResult('Signup Flow - Verification', false, 'User data verification failed', {
        expected: verificationChecks,
        failed: failedChecks,
        retrieved: retrievedUser
      });
      return { success: false, authUserId };
    }
    
    testResults.addResult('Signup Flow - Verification', true, 'Complete signup flow verified successfully', retrievedUser);
    
    return { success: true, authUserId };
    
  } catch (error) {
    testResults.addResult('Signup Flow - Error', false, `Signup flow error: ${error.message}`, error);
    return { success: false, authUserId: null };
  }
}

/**
 * Cleanup function to remove test data
 */
async function cleanupTestData(testResults, userIds) {
  console.log('\n🧹 Cleaning up test data...');
  
  for (const userId of userIds.filter(id => id)) {
    try {
      // Delete from users table
      const { error: userDeleteError } = await supabase
        .from('users')
        .delete()
        .eq('id', userId);
      
      if (userDeleteError) {
        console.warn(`Failed to delete user record ${userId}:`, userDeleteError);
      } else {
        console.log(`✅ Deleted user record: ${userId}`);
      }
      
      // Delete from auth.users (if possible - this might require service role)
      const { error: authDeleteError } = await supabase.auth.admin.deleteUser(userId);
      
      if (authDeleteError) {
        console.warn(`Failed to delete auth user ${userId}:`, authDeleteError);
      } else {
        console.log(`✅ Deleted auth user: ${userId}`);
      }
      
    } catch (error) {
      console.warn(`Cleanup error for user ${userId}:`, error);
    }
  }
}

/**
 * Main test runner
 */
export async function runSignupFlowTests() {
  console.log('🚀 Starting Signup Flow Integration Tests\n');
  console.log('Test Configuration:', TEST_CONFIG);
  console.log('\n' + '='.repeat(50) + '\n');
  
  const testResults = new TestResults();
  const userIdsToCleanup = [];
  
  try {
    // Test 1: Supabase Connection
    const connectionSuccess = await testSupabaseConnection(testResults);
    if (!connectionSuccess) {
      console.log('\n❌ Cannot proceed without Supabase connection');
      return testResults.getSummary();
    }
    
    // Test 2: Users Table Access
    const tableAccessSuccess = await testUsersTableAccess(testResults);
    if (!tableAccessSuccess) {
      console.log('\n❌ Cannot proceed without users table access');
      return testResults.getSummary();
    }
    
    // Test 3: User Creation Utility
    const { success: creationSuccess, userId: testUserId } = await testUserCreationUtility(testResults);
    if (testUserId) {
      userIdsToCleanup.push(testUserId);
    }
    
    if (creationSuccess && testUserId) {
      // Test 4: User Existence Check
      await testUserExistenceCheck(testResults, testUserId);
      
      // Test 5: User Retrieval
      await testUserRetrieval(testResults, testUserId);
    }
    
    // Test 6: Complete Signup Flow
    const { success: signupSuccess, authUserId } = await testCompleteSignupFlow(testResults);
    if (authUserId) {
      userIdsToCleanup.push(authUserId);
    }
    
  } catch (error) {
    testResults.addResult('Test Runner', false, `Test runner error: ${error.message}`, error);
  } finally {
    // Cleanup test data
    if (userIdsToCleanup.length > 0) {
      await cleanupTestData(testResults, userIdsToCleanup);
    }
  }
  
  // Print final results
  const summary = testResults.getSummary();
  
  console.log('\n' + '='.repeat(50));
  console.log('📊 TEST RESULTS SUMMARY');
  console.log('='.repeat(50));
  console.log(`Total Tests: ${summary.totalTests}`);
  console.log(`Passed: ${summary.passed}`);
  console.log(`Failed: ${summary.failed}`);
  console.log(`Overall Success: ${summary.success ? '✅ PASS' : '❌ FAIL'}`);
  
  if (summary.failures.length > 0) {
    console.log('\n❌ FAILED TESTS:');
    summary.failures.forEach(failure => {
      console.log(`   • ${failure.test}: ${failure.message}`);
    });
  }
  
  console.log('\n' + '='.repeat(50));
  
  return summary;
}

/**
 * Quick validation function to check if signup creates users table entries
 */
export async function validateSignupIntegration() {
  console.log('🔍 Quick Signup Integration Validation\n');
  
  try {
    // Check if users table exists and is accessible
    const { data, error } = await supabase
      .from('users')
      .select('count(*)')
      .limit(1);
    
    if (error) {
      console.log('❌ Users table is not accessible:', error.message);
      return {
        success: false,
        issue: 'Users table not accessible',
        error: error.message
      };
    }
    
    console.log('✅ Users table is accessible');
    
    // Check if userUtils functions are working
    try {
      const testUserId = 'test-validation-' + Date.now();
      const { exists } = await userExists(testUserId);
      
      if (exists) {
        console.log('⚠️  Test user unexpectedly exists');
      } else {
        console.log('✅ User existence check is working');
      }
      
    } catch (utilError) {
      console.log('❌ User utility functions have issues:', utilError.message);
      return {
        success: false,
        issue: 'User utility functions not working',
        error: utilError.message
      };
    }
    
    console.log('✅ Signup integration appears to be properly configured');
    console.log('\nTo fully test, run: runSignupFlowTests()');
    
    return {
      success: true,
      message: 'Signup integration is properly configured'
    };
    
  } catch (error) {
    console.log('❌ Validation failed:', error.message);
    return {
      success: false,
      issue: 'Validation error',
      error: error.message
    };
  }
}

// Export for console usage
window.runSignupFlowTests = runSignupFlowTests;
window.validateSignupIntegration = validateSignupIntegration;

export default {
  runSignupFlowTests,
  validateSignupIntegration
};
