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

        {/* Auth pages – block when already authenticated */}
        <Route
          path="/login"
          element={user ? <Navigate to="/dashboard" replace /> : <SignIn />}
        />
        <Route
          path="/signup"
          element={user ? <Navigate to="/dashboard" replace /> : <SignUp />}
        />
        <Route
          path="/forgot-password"
          element={user ? <Navigate to="/dashboard" replace /> : <ForgotPassword />}
        />
        {/* Reset password is triggered via Supabase email link and does NOT guard */}
        <Route path="/reset-password" element={<ResetPassword />} />
        {/* NEW: Route to support /reset-pw for email links */}
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
