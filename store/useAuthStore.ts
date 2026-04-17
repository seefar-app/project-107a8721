import { create } from 'zustand';
import { User, TierName } from '@/types';
import { supabase } from '@/lib/supabase';

interface AuthState {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  authError: string | null;
  
  login: (email: string, password: string) => Promise<boolean>;
  signup: (data: SignupData) => Promise<boolean>;
  logout: () => Promise<void>;
  initializeAuth: () => Promise<void>;
  updateUser: (updates: Partial<User>) => Promise<void>;
  clearError: () => void;
}

interface SignupData {
  phoneNumber: string;
  email: string;
  name: string;
  password: string;
}

interface DatabaseUser {
  id: string;
  phoneNumber: string | null;
  email: string;
  name: string | null;
  avatar: string | null;
  totalPoints: number;
  currentTier: string;
  createdAt: string;
  favoriteItems: string[];
  updated_at: string;
}

function mapDatabaseUserToUser(dbUser: DatabaseUser): User {
  return {
    id: dbUser.id,
    phoneNumber: dbUser.phoneNumber || '',
    email: dbUser.email,
    name: dbUser.name || '',
    avatar: dbUser.avatar || '',
    totalPoints: dbUser.totalPoints || 0,
    currentTier: (dbUser.currentTier || 'bronze') as TierName,
    createdAt: new Date(dbUser.createdAt),
    favoriteItems: dbUser.favoriteItems || [],
  };
}

export const useAuthStore = create<AuthState>((set, get) => ({
  user: null,
  isAuthenticated: false,
  isLoading: true,
  authError: null,

  login: async (email: string, password: string) => {
    set({ isLoading: true, authError: null });
    
    try {
      if (!email || !password) {
        set({ authError: 'Please fill in all required fields.', isLoading: false });
        return false;
      }

      const { data: authData, error: authError } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (authError) {
        let friendlyMessage = 'Login failed. Please try again.';
        if (authError.message.includes('Invalid login credentials')) {
          friendlyMessage = 'Incorrect email or password. Please try again.';
        } else if (authError.message.includes('Email not confirmed')) {
          friendlyMessage = 'Please confirm your email before logging in.';
        }
        set({ authError: friendlyMessage, isLoading: false });
        return false;
      }

      if (!authData.user) {
        set({ authError: 'Login failed. Please try again.', isLoading: false });
        return false;
      }

      const { data: profile, error: profileError } = await supabase
        .from('users')
        .select('*')
        .eq('id', authData.user.id)
        .single();

      if (profileError || !profile) {
        set({ authError: 'Failed to load user profile. Please try again.', isLoading: false });
        return false;
      }

      const user = mapDatabaseUserToUser(profile);
      set({ user, isAuthenticated: true, isLoading: false, authError: null });
      return true;
    } catch (error) {
      set({ authError: 'Login failed. Please try again.', isLoading: false });
      return false;
    }
  },

  signup: async (data: SignupData) => {
    set({ isLoading: true, authError: null });
    
    try {
      if (!data.email || !data.password || !data.name || !data.phoneNumber) {
        set({ authError: 'Please fill in all required fields.', isLoading: false });
        return false;
      }

      if (!data.email.includes('@')) {
        set({ authError: 'Please enter a valid email address.', isLoading: false });
        return false;
      }

      if (data.name.length < 2) {
        set({ authError: 'Please enter your full name.', isLoading: false });
        return false;
      }

      if (data.password.length < 6) {
        set({ authError: 'Password must be at least 6 characters.', isLoading: false });
        return false;
      }

      const { data: authData, error: signupError } = await supabase.auth.signUp({
        email: data.email,
        password: data.password,
        options: {
          data: {
            phoneNumber: data.phoneNumber,
            name: data.name,
            totalPoints: 50,
            currentTier: 'bronze',
            favoriteItems: [],
          },
        },
      });

      if (signupError) {
        let friendlyMessage = 'Signup failed. Please try again.';
        if (signupError.message.includes('already registered')) {
          friendlyMessage = 'An account with this email already exists.';
        } else if (signupError.message.includes('Password')) {
          friendlyMessage = 'Password does not meet requirements.';
        }
        set({ authError: friendlyMessage, isLoading: false });
        return false;
      }

      if (!authData.user) {
        set({ authError: 'Signup failed. Please try again.', isLoading: false });
        return false;
      }

      const { data: profile, error: profileError } = await supabase
        .from('users')
        .select('*')
        .eq('id', authData.user.id)
        .single();

      if (profileError || !profile) {
        set({ authError: 'Failed to create user profile. Please try again.', isLoading: false });
        return false;
      }

      const user = mapDatabaseUserToUser(profile);
      set({ user, isAuthenticated: true, isLoading: false, authError: null });
      return true;
    } catch (error) {
      set({ authError: 'Signup failed. Please try again.', isLoading: false });
      return false;
    }
  },

  logout: async () => {
    set({ isLoading: true, authError: null });
    
    try {
      await supabase.auth.signOut();
      set({ 
        user: null, 
        isAuthenticated: false, 
        isLoading: false,
        authError: null,
      });
    } catch (error) {
      set({ 
        authError: 'Logout failed. Please try again.', 
        isLoading: false 
      });
    }
  },

  initializeAuth: async () => {
    set({ isLoading: true });
    
    try {
      const { data: sessionData, error: sessionError } = await supabase.auth.getSession();

      if (sessionError || !sessionData.session) {
        set({ isLoading: false, isAuthenticated: false, user: null });
        return;
      }

      const userId = sessionData.session.user.id;
      const { data: profile, error: profileError } = await supabase
        .from('users')
        .select('*')
        .eq('id', userId)
        .single();

      if (profileError || !profile) {
        set({ isLoading: false, isAuthenticated: false, user: null });
        return;
      }

      const user = mapDatabaseUserToUser(profile);
      set({ user, isAuthenticated: true, isLoading: false });

      // Set up auth state listener
      const { data: authListener } = supabase.auth.onAuthStateChange(async (event, session) => {
        if (event === 'SIGNED_OUT' || !session) {
          set({ user: null, isAuthenticated: false });
        } else if (event === 'SIGNED_IN' && session.user) {
          const { data: updatedProfile } = await supabase
            .from('users')
            .select('*')
            .eq('id', session.user.id)
            .single();

          if (updatedProfile) {
            const updatedUser = mapDatabaseUserToUser(updatedProfile);
            set({ user: updatedUser, isAuthenticated: true });
          }
        }
      });

      return () => {
        authListener?.subscription.unsubscribe();
      };
    } catch (error) {
      set({ isLoading: false, isAuthenticated: false, user: null });
    }
  },

  updateUser: async (updates: Partial<User>) => {
    const { user } = get();
    if (!user) return;

    try {
      const updateData: Partial<DatabaseUser> = {};
      
      if (updates.name !== undefined) updateData.name = updates.name;
      if (updates.phoneNumber !== undefined) updateData.phoneNumber = updates.phoneNumber;
      if (updates.avatar !== undefined) updateData.avatar = updates.avatar;
      if (updates.favoriteItems !== undefined) updateData.favoriteItems = updates.favoriteItems;

      const { data: updatedProfile, error } = await supabase
        .from('users')
        .update(updateData)
        .eq('id', user.id)
        .select()
        .single();

      if (error) {
        set({ authError: 'Failed to update profile. Please try again.' });
        return;
      }

      if (updatedProfile) {
        const updatedUser = mapDatabaseUserToUser(updatedProfile);
        set({ user: updatedUser, authError: null });
      }
    } catch (error) {
      set({ authError: 'Failed to update profile. Please try again.' });
    }
  },

  clearError: () => {
    set({ authError: null });
  },
}));