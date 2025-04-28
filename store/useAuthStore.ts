import { create } from 'zustand';
import { apiRequest } from './apiUtils';
import { PROFILE_API, EDIT_PROFILE_API, LOGIN_API, REGISTER_API } from '@/constants/api';
import AsyncStorage from '@react-native-async-storage/async-storage';

// Define the user profile structure
interface UserProfile {
  id?: number;
  username: string;
  fullname: string;
  email: string;
  phoneNumber: string;
  balance: number;
  avatarUrl?: string;
}

// Define payload types for register and login
interface RegisterPayload {
  fullname: string;
  email: string;
  username: string;
  password: string;
  phoneNumber: string;
}

interface LoginPayload {
  username: string;
  password: string;
}

// Define the auth state and actions
interface AuthState {
  // State
  user: UserProfile | null;
  loading: boolean;
  error: string | null;
  initialized: boolean;
  isAuthenticated: boolean;

  // Actions
  initialize: () => Promise<void>;
  login: (payload: LoginPayload) => Promise<boolean>;
  register: (payload: RegisterPayload) => Promise<boolean>;
  logout: () => Promise<void>;
  fetchUserProfile: () => Promise<void>;
  updateUserProfile: (data: FormData) => Promise<boolean>;
  clearError: () => void;
}

// Create the store
export const useAuthStore = create<AuthState>((set, get) => ({
  user: null,
  loading: false,
  error: null,
  initialized: false,
  isAuthenticated: false,

  // Check if user is authenticated on app start
  initialize: async () => {
    try {
      set({ loading: true });
      const token = await AsyncStorage.getItem('authToken');
      
      if (token) {
        await get().fetchUserProfile();
        set({ isAuthenticated: true });
      }
    } catch (error) {
      console.error('Failed to initialize auth store:', error);
      set({ error: 'Failed to initialize authentication' });
    } finally {
      set({ loading: false, initialized: true });
    }
  },

  // Handle user login
  login: async (payload) => {
    try {
      set({ loading: true, error: null });
      
      const response = await apiRequest<{ token: string }>(LOGIN_API, {
        method: 'POST',
        body: JSON.stringify(payload)
      });
      
      if (response && response.token) {
        await AsyncStorage.setItem('authToken', response.token);
        await get().fetchUserProfile();
        set({ isAuthenticated: true });
        return true;
      }
      
      throw new Error('Invalid login response');
    } catch (error) {
      set({ error: error instanceof Error ? error.message : 'Login failed' });
      return false;
    } finally {
      set({ loading: false });
    }
  },

  // Handle user registration
  register: async (payload) => {
    try {
      set({ loading: true, error: null });
      
      await apiRequest(REGISTER_API, {
        method: 'POST',
        body: JSON.stringify(payload)
      });
      
      return true;
    } catch (error) {
      set({ error: error instanceof Error ? error.message : 'Registration failed' });
      return false;
    } finally {
      set({ loading: false });
    }
  },

  // Handle user logout
  logout: async () => {
    await AsyncStorage.removeItem('authToken');
    set({ user: null, isAuthenticated: false });
  },

  // Fetch user profile information
  fetchUserProfile: async () => {
    try {
      set({ loading: true, error: null });
      
      const response = await apiRequest<UserProfile>(PROFILE_API);
      set({ user: response });
      
    } catch (error) {
      set({ error: error instanceof Error ? error.message : 'Failed to fetch profile' });
    } finally {
      set({ loading: false });
    }
  },

  // Update user profile information
  updateUserProfile: async (data) => {
    try {
      set({ loading: true, error: null });
      
      const response = await apiRequest<UserProfile>(EDIT_PROFILE_API, {
        method: 'POST',
        body: data
      });
      
      set({ user: response });
      return true;
    } catch (error) {
      set({ error: error instanceof Error ? error.message : 'Failed to update profile' });
      return false;
    } finally {
      set({ loading: false });
    }
  },

  // Clear any error messages
  clearError: () => set({ error: null }),
}));