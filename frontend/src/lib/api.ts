// API configuration
const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:4243/api';

/** Dispatched on same window after token is cleared (401/403 or explicit sign-out). */
export const AUTH_SESSION_ENDED_EVENT = 'filmmood:auth-session-ended';

export function clearAuthSession() {
  localStorage.removeItem('auth_token');
  if (typeof window !== 'undefined') {
    window.dispatchEvent(new CustomEvent(AUTH_SESSION_ENDED_EVENT));
  }
}

export interface ApiResponse<T> {
  data?: T;
  error?: string;
  status?: number;
}

// Helper function for API calls
async function apiCall<T>(
  endpoint: string,
  options: RequestInit = {}
): Promise<ApiResponse<T>> {
  try {
    // Snapshot token at request start so a late 401 (e.g. stale /auth/me) cannot
    // wipe a newer token set by a concurrent successful sign-in.
    const tokenAtRequest = localStorage.getItem('auth_token');
    const skipAuthHeader =
      endpoint.startsWith('/auth/signin') || endpoint.startsWith('/auth/signup');

    const headers: HeadersInit = {
      'Content-Type': 'application/json',
      ...options.headers,
    };

    // Never attach stale Authorization header to sign-in/sign-up requests.
    // These endpoints should rely only on the credentials in the body.
    if (tokenAtRequest && !skipAuthHeader) {
      headers['Authorization'] = `Bearer ${tokenAtRequest}`;
    }

    const url = `${API_BASE_URL}${endpoint}`;
    
    const response = await fetch(url, {
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
      if (response.status === 401 || response.status === 403) {
        // For sign-in/sign-up, don't clear auth session based on bad credentials.
        if (!skipAuthHeader) {
          const current = localStorage.getItem('auth_token');
          if (tokenAtRequest && current === tokenAtRequest) {
            clearAuthSession();
          }
        }
      }
      return { 
        error: data.error || `Server error: ${response.status} ${response.statusText}`,
        status: response.status 
      };
    }

    return { data };
  } catch (error) {
    console.error('API call error:', error, 'URL:', `${API_BASE_URL}${endpoint}`);
    return { error: 'Network error. Please try again.' };
  }
}

export default apiCall;

