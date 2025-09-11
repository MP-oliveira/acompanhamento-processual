// Supabase Configuration for Backend
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.SUPABASE_URL || 'https://hdjqsxwkmsyhiczmhwca.supabase.co';
const supabaseKey = process.env.SUPABASE_SERVICE_KEY || process.env.SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImhkanFzeHdrbXN5aGljem1od2NhIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTc2MTU2NjEsImV4cCI6MjA3MzE5MTY2MX0.FPPnKj7ZHJW2Bn7hI7KaNJlK7VDeuHDDfUJy2f9UxNo';

export const supabase = createClient(supabaseUrl, supabaseKey);

export default supabase;
