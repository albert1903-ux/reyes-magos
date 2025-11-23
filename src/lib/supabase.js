import { createClient } from '@supabase/supabase-js'

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL
const supabaseKey = import.meta.env.VITE_SUPABASE_KEY

console.log('Supabase URL:', supabaseUrl);
console.log('Supabase Key:', supabaseKey ? 'Set' : 'Not Set');

if (!supabaseUrl || !supabaseKey) {
    console.error('Supabase credentials missing!');
}

export const supabase = createClient(supabaseUrl, supabaseKey)
