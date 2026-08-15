import { createClient } from '@supabase/supabase-js';

const supabaseUrl = "https://qfbjkbhwhjorylcqtohm.supabase.co";
const supabaseAnonKey = "sb_publishable_N0opm5k0X3ZMJ-UGlCo6nA_BOwn3q4Z";


if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error('Missing Supabase environment variables');
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey);