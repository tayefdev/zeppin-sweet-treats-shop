// This file is automatically generated. Do not edit it directly.
import { createClient } from '@supabase/supabase-js';
import type { Database } from './types';

const SUPABASE_URL = "https://fmgtcqfnqdeizsuugyjl.supabase.co";
const SUPABASE_PUBLISHABLE_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImZtZ3RjcWZucWRlaXpzdXVneWpsIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTE1ODI3NjMsImV4cCI6MjA2NzE1ODc2M30.p9v4leT25JrGE6d63i8D0-J6yVTMV90A8NK7xJyWEvM";

// Import the supabase client like this:
// import { supabase } from "@/integrations/supabase/client";

export const supabase = createClient<Database>(SUPABASE_URL, SUPABASE_PUBLISHABLE_KEY, {
  auth: {
    storage: localStorage,
    persistSession: true,
    autoRefreshToken: true,
  }
});