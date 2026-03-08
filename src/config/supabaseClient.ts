import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.SUPABASE_URL || '';
const supabaseKey = process.env.SUPABASE_ANON_KEY || '';

if (!supabaseUrl || !supabaseKey) {
    console.warn('⚠️  Supabase URL and Anon Key are missing in .env. Storage features will fail.');
}

export const supabase = createClient(supabaseUrl, supabaseKey);
