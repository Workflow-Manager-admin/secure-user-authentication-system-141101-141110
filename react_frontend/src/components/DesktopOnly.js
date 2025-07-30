import React from 'react';
import useIsDesktop from '../hooks/useIsDesktop';

/**
 * PUBLIC_INTERFACE
 * Component that blocks access on devices with viewport width less than 1024px.
 * Renders its children only when `useIsDesktop` returns `true`.
 */
export default function DesktopOnly({ children }) {
  const isDesktop = useIsDesktop();

  if (!isDesktop) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen bg-black text-white p-6">
        <h1 className="text-3xl font-bold text-accent mb-4">Desktop Required</h1>
        <p className="text-center text-secondary max-w-md">
          This application is optimised for desktop use. Please switch to a device with a screen
          width of at least <span className="font-semibold">1024&nbsp;pixels</span>.
        </p>
      </div>
    );
  }

  return children;
}
