import { createClient } from '@supabase/supabase-js';

const supabaseUrl = "https://ljngzojvyjagzzolwmfw.supabase.co";
const supabaseAnonKey = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imxqbmd6b2p2eWphZ3p6b2x3bWZ3Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDMzNDA2NTcsImV4cCI6MjA1ODkxNjY1N30.XrxNo2sfKC3JuyKzHcDTFO8SbI_wwV_wffEF4qPZMdE";


if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error('Missing Supabase environment variables');
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey);