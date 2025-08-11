// src/lib/supa.js
import { createClient } from '@supabase/supabase-js';

const url = process.env.REACT_APP_SUPABASE_URL;
const key = process.env.REACT_APP_SUPABASE_ANON_KEY;

// Safe for browser: anon key only
export const supa = createClient(url, key);
