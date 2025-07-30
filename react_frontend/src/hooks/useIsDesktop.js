import { useState, useEffect } from 'react';

/**
 * PUBLIC_INTERFACE
 * Hook to determine if the current viewport width is considered "desktop".
 *
 * @param {number} minWidth - Minimum width (in pixels) to be treated as desktop. Default is 1024px.
 * @returns {boolean} - `true` if viewport width is >= minWidth, otherwise `false`.
 */
export default function useIsDesktop(minWidth = 1024) {
  const getCurrent = () => window.innerWidth >= minWidth;

  const [isDesktop, setIsDesktop] = useState(getCurrent);

  useEffect(() => {
    // Handler that updates state on resize
    const handleResize = () => setIsDesktop(getCurrent());

    // Initialise and subscribe
    handleResize();
    window.addEventListener('resize', handleResize);

    // Cleanup listener
    return () => window.removeEventListener('resize', handleResize);
  }, [minWidth]);

  return isDesktop;
}
