import { supabase } from '../supabaseClient';

/**
 * PUBLIC_INTERFACE
 * Utility functions for managing user profiles in Supabase
 */

/**
 * Get the current user's profile from the profiles table
 * @returns {Promise<{data: Object|null, error: Error|null}>}
 */
export const getUserProfile = async () => {
  try {
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    
    if (authError || !user) {
      return { data: null, error: authError || new Error('No authenticated user') };
    }

    const { data, error } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', user.id)
      .single();

    return { data, error };
  } catch (error) {
    return { data: null, error };
  }
};

/**
 * Update the current user's profile
 * @param {Object} updates - Profile updates
 * @returns {Promise<{data: Object|null, error: Error|null}>}
 */
export const updateUserProfile = async (updates) => {
  try {
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    
    if (authError || !user) {
      return { data: null, error: authError || new Error('No authenticated user') };
    }

    const { data, error } = await supabase
      .from('profiles')
      .update(updates)
      .eq('id', user.id)
      .select()
      .single();

    return { data, error };
  } catch (error) {
    return { data: null, error };
  }
};

/**
 * Get user profile by user ID (admin function)
 * @param {string} userId - User ID to fetch profile for
 * @returns {Promise<{data: Object|null, error: Error|null}>}
 */
export const getProfileById = async (userId) => {
  try {
    const { data, error } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', userId)
      .single();

    return { data, error };
  } catch (error) {
    return { data: null, error };
  }
};

/**
 * Delete the current user's profile
 * @returns {Promise<{data: Object|null, error: Error|null}>}
 */
export const deleteUserProfile = async () => {
  try {
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    
    if (authError || !user) {
      return { data: null, error: authError || new Error('No authenticated user') };
    }

    const { data, error } = await supabase
      .from('profiles')
      .delete()
      .eq('id', user.id)
      .select()
      .single();

    return { data, error };
  } catch (error) {
    return { data: null, error };
  }
};
