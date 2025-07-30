import React from 'react';

/**
 * PUBLIC_INTERFACE
 * Displays a minimal loading screen centred on the viewport.
 */
export default function LoadingScreen() {
  return (
    <div className="flex items-center justify-center min-h-screen bg-black text-white">
      <span className="animate-pulse text-secondary">Loading…</span>
    </div>
  );
}
