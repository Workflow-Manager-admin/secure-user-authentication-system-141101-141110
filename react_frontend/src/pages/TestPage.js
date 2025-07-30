import React from 'react';
import { Link } from 'react-router-dom';
import TestRunner from '../components/TestRunner';

/**
 * PUBLIC_INTERFACE
 * Test page for running signup flow tests
 * This page provides access to test runners for verifying signup functionality
 */
export default function TestPage() {
  return (
    <div className="min-h-screen bg-black text-white">
      {/* Header */}
      <header className="border-b border-zinc-800 bg-zinc-900/50 backdrop-blur-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <h1 className="text-xl font-semibold text-white">Test Page</h1>
            <Link
              to="/"
              className="bg-zinc-800 hover:bg-zinc-700 text-white px-4 py-2 rounded-lg transition-all duration-200 transform hover:scale-105 border border-zinc-700"
            >
              Back to App
            </Link>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="space-y-8">
          {/* Page Header */}
          <div className="text-center space-y-4">
            <h2 className="text-4xl font-bold text-white">Signup Flow Testing</h2>
            <p className="text-xl text-zinc-400 max-w-3xl mx-auto">
              This page provides tools to test the signup functionality and verify that 
              user registrations properly populate the Supabase users table.
            </p>
          </div>

          {/* Test Runner Component */}
          <TestRunner />

          {/* Additional Information */}
          <div className="max-w-4xl mx-auto space-y-6">
            <div className="p-6 rounded-xl bg-zinc-900/80 border border-zinc-800">
              <h3 className="text-xl font-semibold text-white mb-4">What These Tests Verify:</h3>
              <div className="grid md:grid-cols-2 gap-6">
                <div>
                  <h4 className="font-medium text-zinc-200 mb-2">Database Integration:</h4>
                  <ul className="text-sm text-zinc-400 space-y-1">
                    <li>• Supabase connection is working</li>
                    <li>• Users table exists and is accessible</li>
                    <li>• User record creation functions work</li>
                    <li>• User record retrieval functions work</li>
                  </ul>
                </div>
                <div>
                  <h4 className="font-medium text-zinc-200 mb-2">Signup Flow:</h4>
                  <ul className="text-sm text-zinc-400 space-y-1">
                    <li>• Supabase Auth signup works</li>
                    <li>• User records are created in users table</li>
                    <li>• All user data is stored correctly</li>
                    <li>• Data integrity is maintained</li>
                  </ul>
                </div>
              </div>
            </div>

            <div className="p-6 rounded-xl bg-blue-900/20 border border-blue-800">
              <h3 className="text-xl font-semibold text-blue-100 mb-4">Manual Testing Instructions:</h3>
              <div className="text-sm text-blue-200 space-y-3">
                <p><strong>To manually test the signup flow:</strong></p>
                <ol className="space-y-2 ml-4">
                  <li>1. Go to the <Link to="/signup" className="text-accent hover:underline">signup page</Link></li>
                  <li>2. Fill out the form with test data (use a real email for verification)</li>
                  <li>3. Submit the form and check for success message</li>
                  <li>4. Check your email for confirmation link</li>
                  <li>5. Use the test runner above to verify the user was created in the database</li>
                  <li>6. Complete email verification and sign in</li>
                  <li>7. Verify that dashboard shows user information correctly</li>
                </ol>
              </div>
            </div>

            <div className="p-6 rounded-xl bg-amber-900/20 border border-amber-800">
              <h3 className="text-xl font-semibold text-amber-100 mb-4">Expected Results:</h3>
              <div className="text-sm text-amber-200 space-y-2">
                <p><strong>✅ Success Indicators:</strong></p>
                <ul className="space-y-1 ml-4">
                  <li>• All tests pass in the test runner</li>
                  <li>• Signup creates both auth user and users table record</li>
                  <li>• User data (id, email, first_name, last_name, profession, created_at) appears in users table</li>
                  <li>• Dashboard displays user information from users table</li>
                  <li>• No errors in browser console during signup process</li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
