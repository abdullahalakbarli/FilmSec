import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import apiCall, { clearAuthSession, AUTH_SESSION_ENDED_EVENT } from '@/lib/api';

interface User {
  id: string;
  email: string;
  name: string;
  avatar?: string;
  role?: string;
}

interface AuthContextType {
  user: User | null;
  isLoading: boolean;
  isAdmin: boolean;
  signIn: (email: string, password: string) => Promise<{ error?: string }>;
  signUp: (email: string, password: string, name: string) => Promise<{ error?: string }>;
  signOut: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

interface AuthProviderProps {
  children: ReactNode;
}

export const AuthProvider = ({ children }: AuthProviderProps) => {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Check if current user is admin
  const isAdmin = user?.role === 'admin';

  // Load user from token on mount
  useEffect(() => {
    const token = localStorage.getItem('auth_token');
    if (token) {
      // Verify token is valid by calling /auth/me
      apiCall<{ user: User }>('/auth/me')
        .then((response) => {
          if (response.data?.user) {
            setUser(response.data.user);
          } else {
            // Token invalid, clear it and reset user
            console.log('Token invalid, clearing auth state');
            localStorage.removeItem('auth_token');
            setUser(null);
          }
        })
        .catch(() => {
          // Error verifying token, clear it and reset user
          console.log('Auth verification error, clearing auth state');
          localStorage.removeItem('auth_token');
          setUser(null);
        })
        .finally(() => {
          setIsLoading(false);
        });
    } else {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    const onSessionEnded = () => setUser(null);
    const onStorage = (e: StorageEvent) => {
      if (e.key === 'auth_token' && e.newValue === null) {
        setUser(null);
      }
    };
    window.addEventListener(AUTH_SESSION_ENDED_EVENT, onSessionEnded);
    window.addEventListener('storage', onStorage);
    return () => {
      window.removeEventListener(AUTH_SESSION_ENDED_EVENT, onSessionEnded);
      window.removeEventListener('storage', onStorage);
    };
  }, []);

  const signIn = async (email: string, password: string): Promise<{ error?: string }> => {
    try {
      console.log('Signing in with:', email);
      const response = await apiCall<{ token: string; user: User }>('/auth/signin', {
        method: 'POST',
        body: JSON.stringify({ email, password }),
      });

      console.log('Sign in response:', response);

      if (response.error) {
        console.log('Sign in error:', response.error);
        return { error: response.error };
      }

      if (response.data?.token && response.data?.user) {
        console.log('Sign in success, setting user:', response.data.user);
        localStorage.setItem('auth_token', response.data.token);
        setUser(response.data.user);
        return {};
      }

      console.log('Sign in failed: missing token or user');
      return { error: 'Giriş zamanı xəta baş verdi' };
    } catch (error) {
      console.error('Sign in error:', error);
      return { error: 'Giriş zamanı xəta baş verdi' };
    }
  };

  const signUp = async (email: string, password: string, name: string): Promise<{ error?: string }> => {
    try {
      const response = await apiCall<{ token: string; user: User }>('/auth/signup', {
        method: 'POST',
        body: JSON.stringify({ email, password, name }),
      });

      if (response.error) {
        return { error: response.error };
      }

      if (response.data?.token && response.data?.user) {
        localStorage.setItem('auth_token', response.data.token);
        setUser(response.data.user);
        return {};
      }

      return { error: 'Qeydiyyat zamanı xəta baş verdi' };
    } catch (error) {
      console.error('Sign up error:', error);
      return { error: 'Qeydiyyat zamanı xəta baş verdi' };
    }
  };

  const signOut = () => {
    clearAuthSession();
  };

  return (
    <AuthContext.Provider value={{ user, isLoading, isAdmin, signIn, signUp, signOut }}>
      {isLoading ? null : children}
    </AuthContext.Provider>
  );
};
