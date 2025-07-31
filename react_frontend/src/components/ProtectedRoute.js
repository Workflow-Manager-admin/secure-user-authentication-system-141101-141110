import React, { useState, useEffect } from 'react';
import { Navigate, Outlet } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import LoadingScreen from './LoadingScreen';

/**
 * PUBLIC_INTERFACE
 * Route component that guards access to authenticated users only.
 * Renders an <Outlet /> when authorised, or navigates to /login otherwise.
 * Includes timeout handling to prevent infinite loading states.
 */
export default function ProtectedRoute() {
  const { user, loading } = useAuth();
  const [timeoutReached, setTimeoutReached] = useState(false);

  useEffect(() => {
    if (!loading) return;
    
    const timeoutId = setTimeout(() => {
      console.warn('⚠️ ProtectedRoute loading timeout reached');
      setTimeoutReached(true);
    }, 10000); // 10 second timeout

    return () => clearTimeout(timeoutId);
  }, [loading]);

  // If timeout reached and still loading, assume not authenticated
  if (loading && !timeoutReached) {
    return <LoadingScreen timeout={10000} />;
  }
  
  if (timeoutReached && loading) {
    console.warn('⚠️ ProtectedRoute timeout - redirecting to login');
    return <Navigate to="/login" replace />;
  }
  
  if (!user) {
    return <Navigate to="/login" replace />;
  }
  
  return <Outlet />;
}
