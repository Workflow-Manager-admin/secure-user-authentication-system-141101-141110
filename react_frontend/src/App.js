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
 * redirect logic based on Supabase authentication status with enhanced
 * password reset flow protection.
 */
export default function App() {
  const { user, loading, isInPasswordResetFlow } = useAuth();

  // While AuthContext initialises, keep UI minimal with timeout
  if (loading) {
    return <LoadingScreen timeout={12000} />;
  }

  // Enhanced password reset flow detection for routing decisions
  const isPasswordResetFlow = isInPasswordResetFlow();
  
  // Additional checks for password reset URL patterns - be VERY aggressive
  const hasResetUrlPattern = window.location.href.includes('type=recovery') ||
                            window.location.href.includes('access_token') ||
                            window.location.href.includes('refresh_token') ||
                            window.location.pathname.includes('reset') ||
                            window.location.pathname.includes('callback') ||
                            window.location.search.includes('recovery') ||
                            window.location.hash.includes('recovery');

  // Combined check - if ANY indication of password reset flow, respect it ABSOLUTELY
  const isInResetFlow = isPasswordResetFlow || hasResetUrlPattern;

  // Log routing decisions for debugging
  if (isInResetFlow) {
    console.log('🔒 PASSWORD RESET FLOW DETECTED - Protecting from redirects:', {
      isPasswordResetFlow,
      hasResetUrlPattern,
      currentPath: window.location.pathname,
      currentUrl: window.location.href,
      user: !!user
    });
  }

  return (
    <Router>
      <Routes>
        {/* home → redirect to dashboard (if logged in) or login, but ALWAYS respect password reset flows */}
        <Route
          path="/"
          element={
            user && !isInResetFlow ? 
              <Navigate to="/dashboard" replace /> : 
              <Navigate to="/login" replace />
          }
        />

        {/* Auth pages – block when already authenticated (EXCEPT during ANY password reset indication) */}
        <Route
          path="/login"
          element={user && !isInResetFlow ? <Navigate to="/dashboard" replace /> : <SignIn />}
        />
        <Route
          path="/signup"
          element={user && !isInResetFlow ? <Navigate to="/dashboard" replace /> : <SignUp />}
        />
        <Route
          path="/forgot-password"
          element={user && !isInResetFlow ? <Navigate to="/dashboard" replace /> : <ForgotPassword />}
        />
        
        {/* Auth callback handler for email links - NEVER redirect away from this */}
        <Route path="/auth/callback" element={<PasswordResetHandler />} />
        
        {/* Reset password routes - ABSOLUTELY NO auth guards, always allow access */}
        <Route path="/reset-password" element={<ResetPassword />} />
        <Route path="/reset-pw" element={<ResetPassword />} />

        {/* Test page for signup flow testing */}
        <Route path="/test" element={<TestPage />} />

        {/* Protected dashboard - but respect password reset flows */}
        <Route element={<ProtectedRoute />}>
          <Route 
            path="/dashboard" 
            element={
              isInResetFlow ? 
                <Navigate to="/reset-password" replace /> : 
                <Dashboard />
            } 
          />
        </Route>

        {/* Catch-all → home (from where we redirect), but respect reset flows */}
        <Route 
          path="*" 
          element={
            isInResetFlow ? 
              <Navigate to="/reset-password" replace /> : 
              <Navigate to="/" replace />
          } 
        />
      </Routes>
    </Router>
  );
}
