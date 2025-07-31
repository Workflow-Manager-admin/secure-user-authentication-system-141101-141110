import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

/**
 * PUBLIC_INTERFACE
 * Displays a loading screen with timeout and recovery mechanism.
 * Prevents infinite loading states by providing escape routes.
 */
export default function LoadingScreen({ timeout = 15000, showRecovery = true }) {
  const [showTimeout, setShowTimeout] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    if (!showRecovery) return;
    
    const timeoutId = setTimeout(() => {
      console.warn('⚠️ LoadingScreen timeout reached');
      setShowTimeout(true);
    }, timeout);

    return () => clearTimeout(timeoutId);
  }, [timeout, showRecovery]);

  const handleRecovery = () => {
    console.log('🔄 User initiated recovery from loading screen');
    // Clear any stuck auth state
    localStorage.removeItem('password_reset_flow');
    sessionStorage.removeItem('password_reset_attempt');
    // Navigate to a safe route
    navigate('/login', { replace: true });
  };

  if (showTimeout) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen bg-black text-white p-4">
        <div className="text-center space-y-4">
          <div className="text-2xl">⏳</div>
          <h2 className="text-xl font-semibold">Taking longer than expected...</h2>
          <p className="text-zinc-400 max-w-md">
            The application seems to be stuck. You can try refreshing or return to the login page.
          </p>
          <div className="flex gap-4 justify-center pt-4">
            <button
              onClick={() => window.location.reload()}
              className="px-4 py-2 bg-zinc-700 hover:bg-zinc-600 text-white rounded-lg transition-colors"
            >
              Refresh Page
            </button>
            <button
              onClick={handleRecovery}
              className="px-4 py-2 bg-accent hover:bg-accent/90 text-white rounded-lg transition-colors"
            >
              Go to Login
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex items-center justify-center min-h-screen bg-black text-white">
      <div className="text-center">
        <div className="w-8 h-8 border-2 border-white/30 border-t-white rounded-full animate-spin mx-auto mb-4"></div>
        <span className="animate-pulse text-secondary">Loading…</span>
      </div>
    </div>
  );
}
