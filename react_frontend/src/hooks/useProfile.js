import { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { getCurrentUser, updateCurrentUser } from '../utils/userUtils';
import { toast } from 'react-hot-toast';

/**
 * PUBLIC_INTERFACE
 * Custom hook for managing user profile data
 */
export const useProfile = () => {
  const { user } = useAuth();
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Fetch profile data when user changes
  useEffect(() => {
    let mounted = true;

    const fetchProfile = async () => {
      if (!user) {
        setProfile(null);
        setLoading(false);
        return;
      }

      setLoading(true);
      setError(null);

      try {
        const { data, error: userError } = await getCurrentUser();
        
        if (!mounted) return;

        if (userError) {
          setError(userError);
          toast.error(`Failed to load profile: ${userError.message}`);
        } else {
          setProfile(data);
        }
      } catch (err) {
        if (!mounted) return;
        setError(err);
        toast.error('Failed to load profile');
      } finally {
        if (mounted) {
          setLoading(false);
        }
      }
    };

    fetchProfile();

    return () => {
      mounted = false;
    };
  }, [user]);

  /**
   * Update profile data
   * @param {Object} updates - Profile updates
   * @returns {Promise<boolean>} - Success status
   */
  const updateProfile = async (updates) => {
    if (!user) {
      toast.error('No authenticated user');
      return false;
    }

    try {
      const { data, error: updateError } = await updateCurrentUser(updates);
      
      if (updateError) {
        toast.error(`Failed to update profile: ${updateError.message}`);
        return false;
      }

      setProfile(data);
      toast.success('Profile updated successfully');
      return true;
    } catch (err) {
      toast.error('Failed to update profile');
      return false;
    }
  };

  /**
   * Refresh profile data
   */
  const refreshProfile = async () => {
    if (!user) return;

    setLoading(true);
    try {
      const { data, error: userError } = await getCurrentUser();
      
      if (userError) {
        setError(userError);
        toast.error(`Failed to refresh profile: ${userError.message}`);
      } else {
        setProfile(data);
        setError(null);
      }
    } catch (err) {
      setError(err);
      toast.error('Failed to refresh profile');
    } finally {
      setLoading(false);
    }
  };

  return {
    profile,
    loading,
    error,
    updateProfile,
    refreshProfile
  };
};

export default useProfile;
