import { createContext, useContext, useState, useEffect, ReactNode } from 'react';

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
    // Load user from localStorage on mount
    const savedUser = localStorage.getItem('mock_user');
    if (savedUser) {
      setUser(JSON.parse(savedUser));
    }
    setIsLoading(false);
  }, []);

  const signIn = async (email: string, password: string): Promise<{ error?: string }> => {
    // Mock sign in - check if user exists in localStorage
    const users = JSON.parse(localStorage.getItem('mock_users') || '[]');
    const existingUser = users.find((u: any) => u.email === email);
    
    if (!existingUser) {
      return { error: 'İstifadəçi tapılmadı' };
    }
    
    if (existingUser.password !== password) {
      return { error: 'Şifrə yanlışdır' };
    }

    const userData: User = {
      id: existingUser.id,
      email: existingUser.email,
      name: existingUser.name,
      avatar: existingUser.avatar
    };

    setUser(userData);
    localStorage.setItem('mock_user', JSON.stringify(userData));
    return {};
  };

  const signUp = async (email: string, password: string, name: string): Promise<{ error?: string }> => {
    // Mock sign up - save to localStorage
    const users = JSON.parse(localStorage.getItem('mock_users') || '[]');
    
    if (users.find((u: any) => u.email === email)) {
      return { error: 'Bu email artıq qeydiyyatdan keçib' };
    }

    const newUser = {
      id: crypto.randomUUID(),
      email,
      password,
      name,
      avatar: undefined
    };

    users.push(newUser);
    localStorage.setItem('mock_users', JSON.stringify(users));

    const userData: User = {
      id: newUser.id,
      email: newUser.email,
      name: newUser.name
    };

    setUser(userData);
    localStorage.setItem('mock_user', JSON.stringify(userData));
    return {};
  };

  const signOut = () => {
    setUser(null);
    localStorage.removeItem('mock_user');
  };

  return (
    <AuthContext.Provider value={{ user, isLoading, signIn, signUp, signOut }}>
      {children}
    </AuthContext.Provider>
  );
};
