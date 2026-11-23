import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || 'https://iynwnntruwtdozsgjjbc.supabase.co';
const supabaseKey = import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY || 'sb_publishable_HgSOlMPOKzRnk1nZUKaWpw_g50MCGxC';

export const supabase = createClient(supabaseUrl, supabaseKey);
