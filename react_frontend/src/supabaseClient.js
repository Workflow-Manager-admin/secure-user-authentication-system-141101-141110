import { createClient } from "@supabase/supabase-js";

// PUBLIC_INTERFACE
const supabaseUrl = process.env.REACT_APP_SUPABASE_URL;
const supabaseKey = process.env.REACT_APP_SUPABASE_KEY;

if (!supabaseUrl || !supabaseKey) {
  // eslint-disable-next-line no-console
  console.warn(
    "Supabase URL or Key is missing. Ensure REACT_APP_SUPABASE_URL and REACT_APP_SUPABASE_KEY are set in your environment."
  );
}

// PUBLIC_INTERFACE
export const supabase = createClient(supabaseUrl, supabaseKey);
