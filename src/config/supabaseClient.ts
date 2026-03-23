import { createClient } from '@supabase/supabase-js';

// @ts-ignore
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || 'https://placeholder.supabase.co';
// @ts-ignore
const supabaseKey = import.meta.env.VITE_SUPABASE_ANON_KEY || 'placeholder-key';

if (!supabaseUrl || !supabaseKey) {
    console.warn('⚠️  Supabase URL and Anon Key are missing in .env. Storage features will fail.');
}

export const supabase = createClient(supabaseUrl, supabaseKey);
