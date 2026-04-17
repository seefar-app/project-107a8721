import 'react-native-url-polyfill/auto';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://qpjxcuymamhqxpbgpryd.supabase.co';
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InFwanhjdXltYW1ocXhwYmdwcnlkIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzY0NTM4ODAsImV4cCI6MjA5MjAyOTg4MH0.yvgdC97uU9_OznjRHKnMre8krTsB4LPJV9zXdE79qGo';

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    storage: AsyncStorage,
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: false,
  },
});
