import { create } from 'zustand';
import { User, TierName } from '@/types';

// React Native compatible UUID generator
function generateUUID(): string {
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
    const r = Math.random() * 16 | 0;
    const v = c === 'x' ? r : (r & 0x3 | 0x8);
    return v.toString(16);
  });
}

interface AuthState {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  authError: string | null;
  
  login: (phoneNumber: string, pin: string) => Promise<boolean>;
  signup: (data: SignupData) => Promise<boolean>;
  logout: () => void;
  initializeAuth: () => Promise<void>;
  updateUser: (updates: Partial<User>) => void;
  clearError: () => void;
}

interface SignupData {
  phoneNumber: string;
  email: string;
  name: string;
  pin: string;
}

const mockUser: User = {
  id: generateUUID(),
  phoneNumber: '+1 (555) 123-4567',
  email: 'sarah.johnson@email.com',
  name: 'Sarah Johnson',
  avatar: 'https://randomuser.me/api/portraits/women/44.jpg',
  totalPoints: 1847,
  currentTier: 'gold' as TierName,
  createdAt: new Date('2023-06-15'),
  favoriteItems: ['Caramel Macchiato', 'Blueberry Muffin', 'Cold Brew'],
};

export const useAuthStore = create<AuthState>((set, get) => ({
  user: null,
  isAuthenticated: false,
  isLoading: true,
  authError: null,

  login: async (phoneNumber: string, pin: string) => {
    set({ isLoading: true, authError: null });
    
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      // Mock validation
      if (pin.length !== 4) {
        set({ authError: 'PIN must be 4 digits', isLoading: false });
        return false;
      }
      
      if (phoneNumber.replace(/\D/g, '').length < 10) {
        set({ authError: 'Please enter a valid phone number', isLoading: false });
        return false;
      }

      // Simulate wrong PIN for demo (PIN: 1234 works)
      if (pin !== '1234') {
        set({ authError: 'Invalid PIN. Try 1234 for demo.', isLoading: false });
        return false;
      }
      
      set({ 
        user: mockUser, 
        isAuthenticated: true, 
        isLoading: false,
        authError: null,
      });
      return true;
    } catch (error) {
      set({ 
        authError: 'Login failed. Please try again.', 
        isLoading: false 
      });
      return false;
    }
  },

  signup: async (data: SignupData) => {
    set({ isLoading: true, authError: null });
    
    try {
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      if (data.pin.length !== 4) {
        set({ authError: 'PIN must be 4 digits', isLoading: false });
        return false;
      }
      
      if (!data.email.includes('@')) {
        set({ authError: 'Please enter a valid email address', isLoading: false });
        return false;
      }
      
      if (data.name.length < 2) {
        set({ authError: 'Please enter your full name', isLoading: false });
        return false;
      }

      const newUser: User = {
        id: generateUUID(),
        phoneNumber: data.phoneNumber,
        email: data.email,
        name: data.name,
        avatar: `https://ui-avatars.com/api/?name=${encodeURIComponent(data.name)}&background=2563eb&color=fff&size=200`,
        totalPoints: 50, // Welcome bonus
        currentTier: 'bronze',
        createdAt: new Date(),
        favoriteItems: [],
        pin: data.pin,
      };
      
      set({ 
        user: newUser, 
        isAuthenticated: true, 
        isLoading: false,
        authError: null,
      });
      return true;
    } catch (error) {
      set({ 
        authError: 'Signup failed. Please try again.', 
        isLoading: false 
      });
      return false;
    }
  },

  logout: () => {
    set({ 
      user: null, 
      isAuthenticated: false, 
      isLoading: false,
      authError: null,
    });
  },

  initializeAuth: async () => {
    set({ isLoading: true });
    
    try {
      // Simulate checking stored credentials
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // For demo, start logged out
      set({ isLoading: false, isAuthenticated: false });
    } catch (error) {
      set({ isLoading: false, isAuthenticated: false });
    }
  },

  updateUser: (updates: Partial<User>) => {
    const { user } = get();
    if (user) {
      set({ user: { ...user, ...updates } });
    }
  },

  clearError: () => {
    set({ authError: null });
  },
}));