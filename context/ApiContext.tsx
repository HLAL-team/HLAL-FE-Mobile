import React, { createContext, useContext, useState } from "react";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { 
  TRANSACTION_API, 
  PROFILE_API, 
  FAV_API, 
  TOP_UP_TRANSFER_API,
  EDIT_PROFILE_API
} from "@/constants/api";

// Define types
interface TransactionPayload {
  recipientAccountNumber: string;
  recipientName: string;
  amount: number;
  notes: string;
}

interface TopUpPayload {
  sourceId: string;
  amount: number;
  notes: string;
}

interface ValidationResult {
  valid: boolean;
  message: string;
  accountName?: string;
}

interface ApiContextType {
  // Loading states
  loadingProfile: boolean;
  loadingBalance: boolean;
  loadingTransactions: boolean;
  loadingFavorites: boolean;
  isValidating: boolean;

  // Transaction APIs
  validateAccount: (accountNumber: string) => Promise<ValidationResult>;
  transferFunds: (payload: TransactionPayload) => Promise<any>;
  topUp: (payload: TopUpPayload) => Promise<any>;
  getTransactions: (params?: any) => Promise<any>;
  getTopupMethods: () => Promise<any[]>;
  
  // Profile APIs
  getUserProfile: () => Promise<any>;
  updateUserProfile: (data: FormData) => Promise<any>;
  
  // Favorites APIs
  getFavorites: () => Promise<any[]>;
  addToFavorites: (accountNumber: number) => Promise<any>;
  removeFromFavorites: (favoriteId: number) => Promise<any>;
  
  // Error handling
  apiError: string | null;
  clearApiError: () => void;
}

const ApiContext = createContext<ApiContextType | undefined>(undefined);

export const ApiProvider = ({ children }: { children: React.ReactNode }) => {
  // Loading states
  const [loadingProfile, setLoadingProfile] = useState(false);
  const [loadingBalance, setLoadingBalance] = useState(false);
  const [loadingTransactions, setLoadingTransactions] = useState(false);
  const [loadingFavorites, setLoadingFavorites] = useState(false);
  const [isValidating, setIsValidating] = useState(false);
  const [apiError, setApiError] = useState<string | null>(null);

  // Helper function to get auth token
  const getAuthToken = async () => {
    const token = await AsyncStorage.getItem("authToken");
    if (!token) {
      throw new Error("Authentication required. Please log in.");
    }
    return token;
  };

  // Helper function for API calls
  const apiCall = async (url: string, options: RequestInit = {}) => {
    try {
      const token = await getAuthToken();
      
      const headers = {
        ...(options.headers || {}),
        Authorization: `Bearer ${token}`,
        ...(options.method !== 'GET' && options.body instanceof FormData 
          ? {} 
          : { 'Content-Type': 'application/json' })
      };

      const response = await fetch(url, {
        ...options,
        headers
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.message || `API error: ${response.status}`);
      }

      // Check if there's content to parse
      const contentType = response.headers.get('content-type');
      if (contentType && contentType.includes('application/json')) {
        const text = await response.text();
        return text ? JSON.parse(text) : {};
      }
      
      return {};
    } catch (error) {
      setApiError(error instanceof Error ? error.message : 'An unknown error occurred');
      throw error;
    }
  };

  // Transaction APIs
  const validateAccount = async (accountNumber: string): Promise<ValidationResult> => {
    setIsValidating(true);
    try {
      if (!accountNumber || accountNumber.length < 10) {
        return {
          valid: false,
          message: 'Please enter a valid account number'
        };
      }

      const response = await apiCall(`${TRANSACTION_API}/checking`, {
        method: 'POST',
        body: JSON.stringify({
          recipientAccountNumber: parseInt(accountNumber, 10)
        })
      });

      if (response.status && response.data.status === 'Success') {
        return {
          valid: true,
          message: 'Account found',
          accountName: response.data.recipientName
        };
      } else {
        return {
          valid: false,
          message: response.data?.message || 'Account not found'
        };
      }
    } finally {
      setIsValidating(false);
    }
  };

  const transferFunds = async (payload: TransactionPayload) => {
    return apiCall(TOP_UP_TRANSFER_API, {
      method: 'POST',
      body: JSON.stringify({
        ...payload,
        transactionType: 'Transfer'
      })
    });
  };

  const topUp = async (payload: TopUpPayload) => {
    return apiCall(TOP_UP_TRANSFER_API, {
      method: 'POST',
      body: JSON.stringify({
        recipientAccountNumber: null,
        recipientName: null,
        amount: payload.amount,
        notes: payload.notes,
        transactionType: 'Top Up',
        sourceId: payload.sourceId
      })
    });
  };

  const getTransactions = async (params = {}) => {
    setLoadingTransactions(true);
    try {
      // Build query string from params
      const queryParams = new URLSearchParams();
      Object.entries(params).forEach(([key, value]) => {
        if (value !== undefined && value !== null) {
          queryParams.append(key, value.toString());
        }
      });

      const queryString = queryParams.toString() ? `?${queryParams.toString()}` : '';
      const result = await apiCall(`${TRANSACTION_API}${queryString}`);
      return result.data || [];
    } finally {
      setLoadingTransactions(false);
    }
  };

  const getTopupMethods = async () => {
    try {
      const result = await apiCall(`${TRANSACTION_API}/topupmethod`);
      return result.data || [];
    } catch (error) {
      console.error('Failed to fetch top-up methods:', error);
      return [];
    }
  };

  // Profile APIs
  const getUserProfile = async () => {
    setLoadingProfile(true);
    setLoadingBalance(true);
    try {
      const result = await apiCall(PROFILE_API);
      return result;
    } finally {
      setLoadingProfile(false);
      setLoadingBalance(false);
    }
  };

  const updateUserProfile = async (formData: FormData) => {
    return apiCall(EDIT_PROFILE_API, {
      method: 'POST',
      body: formData
    });
  };

  // Favorites APIs
  const getFavorites = async () => {
    setLoadingFavorites(true);
    try {
      const result = await apiCall(FAV_API);
      return result.data || [];
    } finally {
      setLoadingFavorites(false);
    }
  };

  const addToFavorites = async (accountNumber: number) => {
    return apiCall(FAV_API, {
      method: 'POST',
      body: JSON.stringify({
        favoriteAccountNumber: accountNumber
      })
    });
  };

  const removeFromFavorites = async (favoriteId: number) => {
    return apiCall(`${FAV_API}/${favoriteId}`, {
      method: 'DELETE'
    });
  };

  const clearApiError = () => setApiError(null);

  const value = {
    // Loading states
    loadingProfile,
    loadingBalance,
    loadingTransactions,
    loadingFavorites,
    isValidating,
    
    // Transaction APIs
    validateAccount,
    transferFunds,
    topUp,
    getTransactions,
    getTopupMethods,
    
    // Profile APIs
    getUserProfile,
    updateUserProfile,
    
    // Favorites APIs
    getFavorites,
    addToFavorites,
    removeFromFavorites,
    
    // Error handling
    apiError,
    clearApiError
  };

  return (
    <ApiContext.Provider value={value}>
      {children}
    </ApiContext.Provider>
  );
};

export const useApi = () => {
  const context = useContext(ApiContext);
  if (!context) {
    throw new Error("useApi must be used within an ApiProvider");
  }
  return context;
};