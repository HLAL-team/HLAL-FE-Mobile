import { create } from 'zustand';
import { apiRequest, ApiResponse } from './apiUtils';
import { FAV_API } from '@/constants/api';

// Define favorite account structure
interface FavoriteAccount {
  favoriteId: number;
  favoriteAccountNumber: string;
  favoriteAccountName: string;
}

// Define the favorites state and actions
interface FavoriteState {
  favorites: FavoriteAccount[];
  loading: boolean;
  error: string | null;
  
  fetchFavorites: () => Promise<void>;
  addToFavorites: (accountNumber: string, accountName?: string) => Promise<boolean>;
  removeFromFavorites: (favoriteId: number) => Promise<boolean>;
  clearError: () => void;
}

// Create the favorites store
export const useFavoriteStore = create<FavoriteState>((set, get) => ({
  favorites: [],
  loading: false,
  error: null,
  
  // Fetch all favorite accounts
  fetchFavorites: async () => {
    try {
      set({ loading: true, error: null });
      
      const response = await apiRequest<ApiResponse<FavoriteAccount[]>>(FAV_API);
      set({ favorites: response.data || [] });
    } catch (error) {
      set({ error: error instanceof Error ? error.message : 'Failed to fetch favorites' });
    } finally {
      set({ loading: false });
    }
  },
  
  // Add an account to favorites
  addToFavorites: async (accountNumber, accountName) => {
    try {
      set({ loading: true, error: null });
      
      const parsedAccountNumber = parseInt(accountNumber, 10);
      if (isNaN(parsedAccountNumber)) {
        throw new Error('Invalid account number format');
      }
      
      await apiRequest<ApiResponse<any>>(FAV_API, {
        method: 'POST',
        body: JSON.stringify({ 
          favoriteAccountNumber: parsedAccountNumber,
          favoriteAccountName: accountName // Only if API accepts this field
        })
      });
      
      // Refresh favorites list
      await get().fetchFavorites();
      return true;
    } catch (error) {
      set({ error: error instanceof Error ? error.message : 'Failed to add favorite' });
      return false;
    } finally {
      set({ loading: false });
    }
  },
  
  // Remove an account from favorites
  removeFromFavorites: async (favoriteId) => {
    try {
      set({ loading: true, error: null });
      
      await apiRequest(`${FAV_API}/${favoriteId}`, {
        method: 'DELETE'
      });
      
      // Update local state by filtering out the removed favorite
      set(state => ({
        favorites: state.favorites.filter(fav => fav.favoriteId !== favoriteId)
      }));
      
      return true;
    } catch (error) {
      set({ error: error instanceof Error ? error.message : 'Failed to remove favorite' });
      return false;
    } finally {
      set({ loading: false });
    }
  },
  
  // Clear error message
  clearError: () => set({ error: null })
}));