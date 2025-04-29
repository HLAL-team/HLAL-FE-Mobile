import AsyncStorage from '@react-native-async-storage/async-storage';

// Define the common response structure
export type ApiResponse<T = any> = {
  status: boolean;
  message?: string;
  data?: T;
};

// Helper function to get the authentication token
export const getAuthToken = async (): Promise<string | null> => {
  return AsyncStorage.getItem('authToken');
};

// Reusable function for making API requests
export const apiRequest = async <T>(
  url: string, 
  options: RequestInit = {}
): Promise<T> => {
  try {
    const token = await getAuthToken();
    
    // Prepare request headers
    const headers: HeadersInit = {
      ...(options.body instanceof FormData 
        ? {} 
        : { 'Content-Type': 'application/json' }),
      ...options.headers,
    };
    
    // Add auth token if available
    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }
    
    // Make the fetch request
    const response = await fetch(url, {
      ...options,
      headers
    });
    
    // Handle error responses
    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.message || `API error: ${response.status}`);
    }
    
    // Parse JSON response if available
    const contentType = response.headers.get('content-type');
    if (contentType && contentType.includes('application/json')) {
      const text = await response.text();
      return text ? JSON.parse(text) : {} as T;
    }
    
    return {} as T;
  } catch (error) {
    console.error('API request failed:', error);
    throw error;
  }
};