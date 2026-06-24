import { createClient } from '@supabase/supabase-js';

// Bu dəyişənlər gələcəkdə .env faylından təhlükəsiz şəkildə oxunacaq
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

export const supabase = createClient(supabaseUrl, supabaseAnonKey);