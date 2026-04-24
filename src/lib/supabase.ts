import { createClient } from '@supabase/supabase-js';

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://azrthnztbdenebqygcmp.supabase.co';
const SUPABASE_KEY = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImF6cnRobnp0YmRlbmVicXlnY21wIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzUxNDYyNjksImV4cCI6MjA5MDcyMjI2OX0.OlY83Zi-9k3rFnlPQyzMiB27nnmgAgETK1jy3tDo0mA';

export const supabase = createClient(SUPABASE_URL, SUPABASE_KEY);
