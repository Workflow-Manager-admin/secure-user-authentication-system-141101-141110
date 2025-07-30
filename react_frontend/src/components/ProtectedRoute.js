import React from 'react';
import { Navigate, Outlet } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import LoadingScreen from './LoadingScreen';

/**
 * PUBLIC_INTERFACE
 * Route component that guards access to authenticated users only.
 * Renders an <Outlet /> when authorised, or navigates to /login otherwise.
 */
export default function ProtectedRoute() {
  const { user, loading } = useAuth();

  if (loading) {
    return <LoadingScreen />;
  }
  if (!user) {
    return <Navigate to="/login" replace />;
  }
  return <Outlet />;
}
