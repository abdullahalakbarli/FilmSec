import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import apiCall from '@/lib/api';

interface User {
  id: string;
  email: string;
  name: string;
  avatar?: string;
}

interface AuthContextType {
  user: User | null;
  isLoading: boolean;
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

  useEffect(() => {
    // Load user from token on mount
    const token = localStorage.getItem('auth_token');
    if (token) {
      // Verify token and get user
      apiCall<{ user: User }>('/auth/me')
        .then((response) => {
          if (response.data?.user) {
            setUser(response.data.user);
          } else {
            // Invalid token, remove it
            localStorage.removeItem('auth_token');
          }
        })
        .catch(() => {
          localStorage.removeItem('auth_token');
        })
        .finally(() => {
          setIsLoading(false);
        });
    } else {
      setIsLoading(false);
    }
  }, []);

  const signIn = async (email: string, password: string): Promise<{ error?: string }> => {
    const response = await apiCall<{ token: string; user: User }>('/auth/signin', {
      method: 'POST',
      body: JSON.stringify({ email, password }),
    });

    if (response.error) {
      return { error: response.error };
    }

    if (response.data?.token && response.data?.user) {
      localStorage.setItem('auth_token', response.data.token);
      setUser(response.data.user);
      return {};
    }

    return { error: 'Giriş zamanı xəta baş verdi' };
  };

  const signUp = async (email: string, password: string, name: string): Promise<{ error?: string }> => {
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
  };

  const signOut = () => {
    setUser(null);
    localStorage.removeItem('auth_token');
  };

  return (
    <AuthContext.Provider value={{ user, isLoading, signIn, signUp, signOut }}>
      {children}
    </AuthContext.Provider>
  );
};
