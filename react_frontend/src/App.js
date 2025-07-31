import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { useAuth } from './contexts/AuthContext';
import ProtectedRoute from './components/ProtectedRoute';
import LoadingScreen from './components/LoadingScreen';

// Pages
import SignIn from './pages/SignIn';
import SignUp from './pages/SignUp';
import ForgotPassword from './pages/ForgotPassword';
import ResetPassword from './pages/ResetPassword';
import Dashboard from './pages/Dashboard';
import TestPage from './pages/TestPage';
import PasswordResetHandler from './components/PasswordResetHandler';

/**
 * PUBLIC_INTERFACE
 * Root application component. Sets up client-side routing, route guards and
 * redirect logic based on Supabase authentication status.
 */
export default function App() {
  const { user, loading } = useAuth();

  // While AuthContext initialises, keep UI minimal
  if (loading) {
    return <LoadingScreen />;
  }

  return (
    <Router>
      <Routes>
        {/* home → redirect to dashboard (if logged in) or login */}
        <Route
          path="/"
          element={<Navigate to={user ? '/dashboard' : '/login'} replace />}
        />

        {/* Auth pages – block when already authenticated (except during password reset) */}
        <Route
          path="/login"
          element={user && !window.location.hash.includes('type=recovery') ? <Navigate to="/dashboard" replace /> : <SignIn />}
        />
        <Route
          path="/signup"
          element={user && !window.location.hash.includes('type=recovery') ? <Navigate to="/dashboard" replace /> : <SignUp />}
        />
        <Route
          path="/forgot-password"
          element={user && !window.location.hash.includes('type=recovery') ? <Navigate to="/dashboard" replace /> : <ForgotPassword />}
        />
        
        {/* Auth callback handler for email links */}
        <Route path="/auth/callback" element={<PasswordResetHandler />} />
        
        {/* Reset password routes - NO auth guards, let component handle validation */}
        <Route path="/reset-password" element={<ResetPassword />} />
        <Route path="/reset-pw" element={<ResetPassword />} />

        {/* Test page for signup flow testing */}
        <Route path="/test" element={<TestPage />} />

        {/* Protected dashboard */}
        <Route element={<ProtectedRoute />}>
          <Route path="/dashboard" element={<Dashboard />} />
        </Route>

        {/* Catch-all → home (from where we redirect) */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </Router>
  );
}
