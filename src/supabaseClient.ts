// supabaseClient.ts
import { createClient } from '@supabase/supabase-js';

// Access environment variables
const apiUrl: string | undefined = process.env.REACT_APP_API_URL;
const supabaseKey: string | undefined = process.env.REACT_APP_API_KEY;

// Check if environment variables exist
if (!apiUrl || !supabaseKey) {
  throw new Error("Missing environment variables. Check .env configuration.");
}

// Create the Supabase client
export const supabase = createClient(apiUrl, supabaseKey);




