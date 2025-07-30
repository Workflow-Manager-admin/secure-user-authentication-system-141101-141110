import React, { useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { supabase } from '../supabaseClient'
import LoadingScreen from './LoadingScreen'

/**
 * PUBLIC_INTERFACE
 * Component that handles authentication callbacks from email links
 * Processes the authentication session and redirects appropriately
 */
export default function AuthCallback() {
  const navigate = useNavigate()

  useEffect(() => {
    const handleAuthCallback = async () => {
      try {
        // Get session from URL (for email confirmation, password reset, etc.)
        const { data, error } = await supabase.auth.getSession()

        if (error) {
          console.error('Auth callback error:', error)
          navigate('/login?error=callback_failed')
          return
        }

        if (data.session) {
          // Redirect to dashboard on successful authentication
          navigate('/dashboard')
        } else {
          // No session found, redirect to login
          navigate('/login')
        }
      } catch (err) {
        console.error('Auth callback processing error:', err)
        navigate('/login?error=callback_error')
      }
    }

    handleAuthCallback()
  }, [navigate])

  return <LoadingScreen />
}
