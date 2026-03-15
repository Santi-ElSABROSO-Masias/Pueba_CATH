import { createClient } from '@supabase/supabase-js';

const supabaseUrl = (import.meta as any).env.VITE_SUPABASE_URL || 'https://placeholder.supabase.co';
const supabaseKey = (import.meta as any).env.VITE_SUPABASE_ANON_KEY || 'placeholder-key';

if (!supabaseUrl || !supabaseKey) {
    console.warn('⚠️  Supabase URL and Anon Key are missing in .env. Storage features will fail.');
}

export const supabase = createClient(supabaseUrl, supabaseKey);
