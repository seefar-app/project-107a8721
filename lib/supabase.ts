import 'react-native-url-polyfill/auto';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://bmpstecvpfxwickjaudj.supabase.co';
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImJtcHN0ZWN2cGZ4d2lja2phdWRqIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzY1MzM3NDAsImV4cCI6MjA5MjEwOTc0MH0.WmGUJCtIElbbu8JmwrqW1FA8DesAkKLVdHtEgc2mgUw';

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    storage: AsyncStorage,
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: false,
  },
});
