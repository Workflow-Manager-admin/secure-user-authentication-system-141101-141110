import React, { useState } from 'react';
import { runSignupFlowTests, validateSignupIntegration } from '../tests/signupFlowTest';

/**
 * PUBLIC_INTERFACE
 * Test Runner component for manually testing signup flow and database integration
 * This component provides a UI interface to run tests and view results
 */
export default function TestRunner() {
  const [testResults, setTestResults] = useState(null);
  const [isRunning, setIsRunning] = useState(false);
  const [validationResult, setValidationResult] = useState(null);

  const runFullTests = async () => {
    setIsRunning(true);
    setTestResults(null);
    
    try {
      const results = await runSignupFlowTests();
      setTestResults(results);
    } catch (error) {
      setTestResults({
        success: false,
        error: error.message,
        totalTests: 0,
        passed: 0,
        failed: 1
      });
    } finally {
      setIsRunning(false);
    }
  };

  const runQuickValidation = async () => {
    setIsRunning(true);
    setValidationResult(null);
    
    try {
      const result = await validateSignupIntegration();
      setValidationResult(result);
    } catch (error) {
      setValidationResult({
        success: false,
        error: error.message
      });
    } finally {
      setIsRunning(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto p-6 bg-zinc-900/80 rounded-xl shadow-2xl border border-zinc-800">
      <div className="space-y-6">
        {/* Header */}
        <div className="text-center space-y-2">
          <h2 className="text-2xl font-bold text-white">Signup Flow Test Runner</h2>
          <p className="text-zinc-400">
            Test the signup functionality and verify users table integration
          </p>
        </div>

        {/* Test Actions */}
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <button
            onClick={runQuickValidation}
            disabled={isRunning}
            className="bg-blue-600 hover:bg-blue-700 disabled:bg-blue-900 disabled:cursor-not-allowed text-white font-medium py-3 px-6 rounded-lg transition-all duration-200 transform hover:scale-[1.02] disabled:transform-none"
          >
            {isRunning ? (
              <div className="flex items-center space-x-2">
                <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                <span>Running...</span>
              </div>
            ) : (
              'Quick Validation'
            )}
          </button>

          <button
            onClick={runFullTests}
            disabled={isRunning}
            className="bg-accent hover:bg-accent/90 disabled:bg-accent/50 disabled:cursor-not-allowed text-white font-medium py-3 px-6 rounded-lg transition-all duration-200 transform hover:scale-[1.02] disabled:transform-none"
          >
            {isRunning ? (
              <div className="flex items-center space-x-2">
                <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                <span>Running...</span>
              </div>
            ) : (
              'Run Full Tests'
            )}
          </button>
        </div>

        {/* Quick Validation Results */}
        {validationResult && (
          <div className={`p-4 rounded-lg border ${
            validationResult.success 
              ? 'bg-green-900/20 border-green-700 text-green-100' 
              : 'bg-red-900/20 border-red-700 text-red-100'
          }`}>
            <h3 className="font-semibold mb-2">
              {validationResult.success ? '✅ Validation Passed' : '❌ Validation Failed'}
            </h3>
            <p>{validationResult.message || validationResult.issue}</p>
            {validationResult.error && (
              <p className="mt-2 text-sm opacity-80">Error: {validationResult.error}</p>
            )}
          </div>
        )}

        {/* Full Test Results */}
        {testResults && (
          <div className="space-y-4">
            <div className={`p-4 rounded-lg border ${
              testResults.success 
                ? 'bg-green-900/20 border-green-700' 
                : 'bg-red-900/20 border-red-700'
            }`}>
              <h3 className="text-lg font-semibold text-white mb-2">
                {testResults.success ? '✅ All Tests Passed' : '❌ Some Tests Failed'}
              </h3>
              <div className="text-sm space-y-1">
                <p className="text-zinc-300">Total Tests: {testResults.totalTests}</p>
                <p className="text-green-400">Passed: {testResults.passed}</p>
                <p className="text-red-400">Failed: {testResults.failed}</p>
              </div>
            </div>

            {/* Individual Test Results */}
            {testResults.results && (
              <div className="space-y-2">
                <h4 className="text-lg font-semibold text-white">Test Details:</h4>
                <div className="space-y-2 max-h-96 overflow-y-auto">
                  {testResults.results.map((result, index) => (
                    <div
                      key={index}
                      className={`p-3 rounded border ${
                        result.passed
                          ? 'bg-green-900/10 border-green-800 text-green-100'
                          : 'bg-red-900/10 border-red-800 text-red-100'
                      }`}
                    >
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <h5 className="font-medium">
                            {result.passed ? '✅' : '❌'} {result.test}
                          </h5>
                          <p className="text-sm mt-1 opacity-90">{result.message}</p>
                          {result.data && (
                            <details className="mt-2">
                              <summary className="text-xs cursor-pointer opacity-70 hover:opacity-100">
                                View Data
                              </summary>
                              <pre className="text-xs mt-1 p-2 bg-black/20 rounded overflow-x-auto">
                                {JSON.stringify(result.data, null, 2)}
                              </pre>
                            </details>
                          )}
                        </div>
                        <span className="text-xs opacity-70 ml-4">
                          {new Date(result.timestamp).toLocaleTimeString()}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Failed Tests Summary */}
            {testResults.failures && testResults.failures.length > 0 && (
              <div className="p-4 rounded-lg border border-red-700 bg-red-900/20">
                <h4 className="text-lg font-semibold text-red-100 mb-2">Failed Tests Summary:</h4>
                <ul className="space-y-1 text-sm text-red-200">
                  {testResults.failures.map((failure, index) => (
                    <li key={index}>• {failure.test}: {failure.message}</li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        )}

        {/* Instructions */}
        <div className="p-4 rounded-lg border border-zinc-700 bg-zinc-800/50">
          <h4 className="font-semibold text-white mb-2">Instructions:</h4>
          <ul className="text-sm text-zinc-300 space-y-1">
            <li>• <strong>Quick Validation:</strong> Checks if the basic setup is working</li>
            <li>• <strong>Run Full Tests:</strong> Tests the complete signup flow and database integration</li>
            <li>• Tests will create temporary users and clean them up automatically</li>
            <li>• Check browser console for detailed logs during test execution</li>
            <li>• Ensure you have a stable internet connection for Supabase tests</li>
          </ul>
        </div>
      </div>
    </div>
  );
}
