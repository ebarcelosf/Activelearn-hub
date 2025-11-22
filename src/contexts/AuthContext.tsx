import React, { createContext, useContext, ReactNode } from 'react';
import { useAuth as useAuthHook, AuthUser, LoginCredentials, RegisterCredentials, UpdatePasswordData } from '@/hooks/useAuth';

interface AuthContextType {
  user: AuthUser | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  error: string | null;
  login: (credentials: LoginCredentials) => Promise<boolean>;
  register: (credentials: RegisterCredentials) => Promise<boolean>;
  logout: () => void;
  updateProfile: (updates: { name?: string }) => Promise<boolean>;
  updatePassword: (data: UpdatePasswordData) => Promise<boolean>;
  resetPassword: (email: string) => Promise<boolean>;
  deleteAccount: (password: string) => Promise<boolean>;
  updateSettings: (settings: any) => Promise<boolean>;
  clearError: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

interface AuthProviderProps {
  children: ReactNode;
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const auth = useAuthHook();

  return (
    <AuthContext.Provider value={auth}>
      {children}
    </AuthContext.Provider>
  );
};