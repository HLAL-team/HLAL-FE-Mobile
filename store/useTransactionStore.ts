import { create } from 'zustand';
import { apiRequest, ApiResponse } from './apiUtils';
import { TRANSACTION_API, TOP_UP_TRANSFER_API } from '@/constants/api';
import { useAuthStore } from './useAuthStore';

// Define transaction data structure
interface Transaction {
  transactionId: number;
  sender: string;
  recipient: string;
  amount: number;
  transactionType: string;
  transactionDateFormatted: string;
  description?: string;
}

interface TopUpMethod {
  id: number;
  name: string;
}

interface TransferValidationResult {
  valid: boolean;
  message: string;
  accountName?: string;
}

interface TransactionParams {
  page?: number;
  size?: number;
  sortBy?: string;
  order?: string;
  search?: string;
}

interface TransferPayload {
  recipientAccountNumber: string;
  amount: number;
  notes?: string;
}

interface TopUpPayload {
  sourceId: string;
  amount: number;
  notes?: string;
}

// Define the transaction state and actions
interface TransactionState {
  // Transaction lists
  recentTransactions: Transaction[];
  allTransactions: Transaction[];
  
  // Top-up methods
  topUpMethods: TopUpMethod[];
  
  // Loading states
  loadingTransactions: boolean;
  validatingAccount: boolean;
  processingTransfer: boolean;
  processingTopUp: boolean;
  loadingTopUpMethods: boolean;
  
  // Results
  validationResult: TransferValidationResult | null;
  error: string | null;
  
  // Actions
  fetchRecentTransactions: () => Promise<void>;
  fetchAllTransactions: (params?: TransactionParams) => Promise<Transaction[]>;
  validateAccount: (accountNumber: string) => Promise<TransferValidationResult>;
  transferFunds: (payload: TransferPayload) => Promise<Transaction | null>;
  fetchTopUpMethods: () => Promise<TopUpMethod[]>;
  topUp: (payload: TopUpPayload) => Promise<Transaction | null>;
  clearError: () => void;
  clearValidation: () => void;
}

// Create the transaction store
export const useTransactionStore = create<TransactionState>((set, get) => ({
  recentTransactions: [],
  allTransactions: [],
  topUpMethods: [],
  loadingTransactions: false,
  validatingAccount: false,
  processingTransfer: false,
  processingTopUp: false,
  loadingTopUpMethods: false,
  validationResult: null,
  error: null,

  // Fetch recent transactions for the home page
  fetchRecentTransactions: async () => {
    try {
      set({ loadingTransactions: true, error: null });
      
      const response = await apiRequest<ApiResponse<Transaction[]>>(
        `${TRANSACTION_API}?sortBy=transactionDate&order=desc&size=3`
      );
      
      set({ recentTransactions: response.data || [] });
    } catch (error) {
      set({ error: error instanceof Error ? error.message : 'Failed to fetch transactions' });
    } finally {
      set({ loadingTransactions: false });
    }
  },

  // Fetch all transactions with filtering options
  fetchAllTransactions: async (params = {}) => {
    try {
      set({ loadingTransactions: true, error: null });
      
      // Build query string
      const queryParams = new URLSearchParams();
      Object.entries(params).forEach(([key, value]) => {
        if (value !== undefined && value !== null) {
          queryParams.append(key, value.toString());
        }
      });
      
      const queryString = queryParams.toString() ? `?${queryParams.toString()}` : '';
      
      const response = await apiRequest<ApiResponse<Transaction[]>>(
        `${TRANSACTION_API}${queryString}`
      );
      
      const transactions = response.data || [];
      set({ allTransactions: transactions });
      return transactions;
    } catch (error) {
      set({ error: error instanceof Error ? error.message : 'Failed to fetch transactions' });
      return [];
    } finally {
      set({ loadingTransactions: false });
    }
  },

  // Validate account before transfer
  validateAccount: async (accountNumber: string) => {
    try {
      set({ validatingAccount: true, error: null, validationResult: null });
      
      if (!accountNumber || accountNumber.length < 10) {
        const result = { valid: false, message: 'Please enter a valid account number' };
        set({ validationResult: result });
        return result;
      }

      const parsedAccountNumber = parseInt(accountNumber, 10);
      if (isNaN(parsedAccountNumber)) {
        const result = { valid: false, message: 'Invalid account number format' };
        set({ validationResult: result });
        return result;
      }
      
      const response = await apiRequest<ApiResponse<{
        status: string;
        recipientName?: string;
        message?: string;
      }>>(
        `${TRANSACTION_API}/checking`,
        {
          method: 'POST',
          body: JSON.stringify({ recipientAccountNumber: parsedAccountNumber })
        }
      );
      
      let result: TransferValidationResult;
      
      if (response.status && response.data?.status === 'Success' && response.data?.recipientName) {
        result = {
          valid: true,
          message: 'Account found',
          accountName: response.data.recipientName
        };
      } else {
        result = {
          valid: false,
          message: response.data?.message || 'Account not found'
        };
      }
      
      set({ validationResult: result });
      return result;
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Error checking account';
      const result = { valid: false, message: errorMessage };
      set({ error: errorMessage, validationResult: result });
      return result;
    } finally {
      set({ validatingAccount: false });
    }
  },

  // Process a transfer
  transferFunds: async ({ recipientAccountNumber, amount, notes = 'Transfer' }) => {
    try {
      set({ processingTransfer: true, error: null });
      
      // Get validation result or validate the account
      let currentValidation = get().validationResult;
      if (!currentValidation || !currentValidation.valid) {
        currentValidation = await get().validateAccount(recipientAccountNumber);
      }
      
      if (!currentValidation.valid) {
        throw new Error('Invalid recipient account');
      }
      
      const payload = {
        recipientAccountNumber: parseInt(recipientAccountNumber, 10),
        transactionTypeId: 2, // Fixed value for transfer
        topUpMethodId: null, // Not applicable for transfer
        amount: Number(amount),
        description: notes,
      };
      
      const response = await apiRequest<ApiResponse<Transaction>>(
        TOP_UP_TRANSFER_API,
        {
          method: 'POST',
          body: JSON.stringify(payload)
        }
      );
      
      // Refresh user balance after successful transfer
      await useAuthStore.getState().fetchUserProfile();
      
      // Also update the recent transactions
      await get().fetchRecentTransactions();
      
      return response.data || null;
    } catch (error) {
      set({ error: error instanceof Error ? error.message : 'Transfer failed' });
      return null;
    } finally {
      set({ processingTransfer: false });
    }
  },

  // Fetch available top-up methods
  fetchTopUpMethods: async () => {
    try {
      set({ loadingTopUpMethods: true, error: null });
      
      const response = await apiRequest<ApiResponse<TopUpMethod[]>>(
        `${TRANSACTION_API}/topupmethod`
      );
      
      const methods = response.data || [];
      set({ topUpMethods: methods });
      return methods;
    } catch (error) {
      set({ error: error instanceof Error ? error.message : 'Failed to fetch top-up methods' });
      return [];
    } finally {
      set({ loadingTopUpMethods: false });
    }
  },

  // Process a top-up
  topUp: async ({ sourceId, amount, notes = 'Top Up' }) => {
    try {
      set({ processingTopUp: true, error: null });
      
      const payload = {
        recipientWalletId: null,
        transactionTypeId: 1, // Fixed value for top-up
        topUpMethodId: parseInt(sourceId, 10),
        amount: Number(amount),
        description: notes,
      };
      
      const response = await apiRequest<ApiResponse<Transaction>>(
        TOP_UP_TRANSFER_API,
        {
          method: 'POST',
          body: JSON.stringify(payload)
        }
      );
      
      // Refresh user balance after successful top-up
      await useAuthStore.getState().fetchUserProfile();
      
      // Also update the recent transactions
      await get().fetchRecentTransactions();
      
      return response.data || null;
    } catch (error) {
      set({ error: error instanceof Error ? error.message : 'Top up failed' });
      return null;
    } finally {
      set({ processingTopUp: false });
    }
  },

  // Clear error message
  clearError: () => set({ error: null }),
  
  // Clear validation result
  clearValidation: () => set({ validationResult: null }),
}));