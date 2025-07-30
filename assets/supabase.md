# Supabase Configuration for Secure User Authentication System

## Required Database Tables

### Users Table
The application requires a `users` table to store user account details upon successful signup. This table must be created in Supabase with the following structure:

```sql
-- Create users table
CREATE TABLE users (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email TEXT NOT NULL,
  first_name TEXT,
  last_name TEXT,
  profession TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable Row Level Security
ALTER TABLE users ENABLE ROW LEVEL SECURITY;

-- Create policies for users table
-- Users can only read and update their own records
CREATE POLICY "Users can view own record" ON users
  FOR SELECT USING (auth.uid() = id);

CREATE POLICY "Users can update own record" ON users
  FOR UPDATE USING (auth.uid() = id);

-- Only authenticated users can insert (handled by application logic)
CREATE POLICY "Users can insert own record" ON users
  FOR INSERT WITH CHECK (auth.uid() = id);

-- Create trigger to automatically update updated_at timestamp
CREATE OR REPLACE FUNCTION update_users_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_users_updated_at_trigger
  BEFORE UPDATE ON users
  FOR EACH ROW
  EXECUTE FUNCTION update_users_updated_at();
```

## Environment Variables Required

The React application requires the following environment variables to be set:

- `REACT_APP_SUPABASE_URL`: Your Supabase project URL
- `REACT_APP_SUPABASE_KEY`: Your Supabase anonymous/public key
- `REACT_APP_SITE_URL`: The base URL of your application (used for email redirects)

## Authentication Configuration

### Email Authentication
The application uses Supabase Auth with email/password authentication. Ensure that:

1. Email authentication is enabled in your Supabase project
2. Email confirmation is configured (optional but recommended)
3. Email templates are customized as needed

### Email Redirects
The application handles the following email redirect flows:
- Email confirmation after signup
- Password reset emails redirect to `/reset-password`

Make sure your site URL is configured in Supabase Auth settings to match your `REACT_APP_SITE_URL`.

## Security Considerations

1. **Row Level Security (RLS)**: The users table has RLS enabled with policies that ensure users can only access their own records.

2. **Data Validation**: The application validates user input on the frontend, but server-side validation should also be implemented through database constraints and policies.

3. **Environment Variables**: All sensitive configuration is handled through environment variables and should never be hardcoded.

## Integration Notes

- The application stores user details in the `users` table immediately after successful Supabase Auth signup
- User records include: id (from auth.users), email, first_name, last_name, profession, and timestamps
- The system gracefully handles cases where user record creation fails but authentication succeeds
- Profile management is handled through the users table, not a separate profiles table

## Migration from Existing Profiles Table

If you have an existing `profiles` table, you may need to:

1. Create the new `users` table as specified above
2. Migrate existing data from `profiles` to `users` table
3. Update any existing database triggers or functions
4. Test the new table structure with your application

The application has been updated to use the `users` table exclusively for storing user account details.
