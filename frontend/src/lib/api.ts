// API configuration
const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:4243/api';

export interface ApiResponse<T> {
  data?: T;
  error?: string;
}

// Helper function for API calls
async function apiCall<T>(
  endpoint: string,
  options: RequestInit = {}
): Promise<ApiResponse<T>> {
  try {
    const token = localStorage.getItem('auth_token');
    
    const headers: HeadersInit = {
      'Content-Type': 'application/json',
      ...options.headers,
    };

    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }

    const response = await fetch(`${API_BASE_URL}${endpoint}`, {
      ...options,
      headers,
    });

    let data;
    try {
      const text = await response.text();
      data = text ? JSON.parse(text) : {};
    } catch (parseError) {
      console.error('JSON parse error:', parseError);
      return { error: 'Invalid response from server' };
    }

    if (!response.ok) {
      // If 401/403, token might be invalid - remove it
      if (response.status === 401 || response.status === 403) {
        localStorage.removeItem('auth_token');
        // Don't return error for auth failures in some cases, let the calling code handle it
      }
      return { error: data.error || `Server error: ${response.status} ${response.statusText}` };
    }

    return { data };
  } catch (error) {
    console.error('API call error:', error);
    return { error: 'Network error. Please try again.' };
  }
}

export default apiCall;

