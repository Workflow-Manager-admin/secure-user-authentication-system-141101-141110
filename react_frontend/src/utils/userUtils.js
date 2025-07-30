import { supabase } from '../supabaseClient';

/**
 * PUBLIC_INTERFACE
 * Utility functions for managing user records in the dedicated users table in Supabase
 */

/**
 * Create a new user record in the users table
 * @param {Object} userData - User data
 * @param {string} userData.id - User ID from Supabase Auth
 * @param {string} userData.email - User email
 * @param {string} userData.first_name - User's first name
 * @param {string} userData.last_name - User's last name
 * @param {string} userData.profession - User's profession
 * @returns {Promise<{data: Object|null, error: Error|null}>}
 */
export const createUser = async (userData) => {
  try {
    // PRECONDITION: The 'users' table must exist in Supabase with the following structure:
    // - id (uuid, primary key, matches auth.users.id)
    // - email (text, not null)
    // - first_name (text)
    // - last_name (text) 
    // - profession (text)
    // - created_at (timestamp with time zone, default: now())
    // - updated_at (timestamp with time zone, default: now())
    
    const { data, error } = await supabase
      .from('users')
      .insert([{
        id: userData.id,
        email: userData.email,
        first_name: userData.first_name,
        last_name: userData.last_name,
        profession: userData.profession
      }])
      .select()
      .single();

    return { data, error };
  } catch (error) {
    return { data: null, error };
  }
};

/**
 * Get user record by user ID
 * @param {string} userId - User ID to fetch user record for
 * @returns {Promise<{data: Object|null, error: Error|null}>}
 */
export const getUserById = async (userId) => {
  try {
    const { data, error } = await supabase
      .from('users')
      .select('*')
      .eq('id', userId)
      .single();

    return { data, error };
  } catch (error) {
    return { data: null, error };
  }
};

/**
 * Get the current authenticated user's record from the users table
 * @returns {Promise<{data: Object|null, error: Error|null}>}
 */
export const getCurrentUser = async () => {
  try {
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    
    if (authError || !user) {
      return { data: null, error: authError || new Error('No authenticated user') };
    }

    const { data, error } = await supabase
      .from('users')
      .select('*')
      .eq('id', user.id)
      .single();

    return { data, error };
  } catch (error) {
    return { data: null, error };
  }
};

/**
 * Update user record
 * @param {string} userId - User ID
 * @param {Object} updates - User data updates
 * @returns {Promise<{data: Object|null, error: Error|null}>}
 */
export const updateUser = async (userId, updates) => {
  try {
    const { data, error } = await supabase
      .from('users')
      .update({
        ...updates,
        updated_at: new Date().toISOString()
      })
      .eq('id', userId)
      .select()
      .single();

    return { data, error };
  } catch (error) {
    return { data: null, error };
  }
};

/**
 * Update the current authenticated user's record
 * @param {Object} updates - User data updates
 * @returns {Promise<{data: Object|null, error: Error|null}>}
 */
export const updateCurrentUser = async (updates) => {
  try {
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    
    if (authError || !user) {
      return { data: null, error: authError || new Error('No authenticated user') };
    }

    return await updateUser(user.id, updates);
  } catch (error) {
    return { data: null, error };
  }
};

/**
 * Delete user record
 * @param {string} userId - User ID
 * @returns {Promise<{data: Object|null, error: Error|null}>}
 */
export const deleteUser = async (userId) => {
  try {
    const { data, error } = await supabase
      .from('users')
      .delete()
      .eq('id', userId)
      .select()
      .single();

    return { data, error };
  } catch (error) {
    return { data: null, error };
  }
};

/**
 * Check if user record exists in the users table
 * @param {string} userId - User ID to check
 * @returns {Promise<{exists: boolean, error: Error|null}>}
 */
export const userExists = async (userId) => {
  try {
    const { data, error } = await supabase
      .from('users')
      .select('id')
      .eq('id', userId)
      .single();

    if (error && error.code === 'PGRST116') {
      // No rows returned - user doesn't exist
      return { exists: false, error: null };
    }

    if (error) {
      return { exists: false, error };
    }

    return { exists: !!data, error: null };
  } catch (error) {
    return { exists: false, error };
  }
};
