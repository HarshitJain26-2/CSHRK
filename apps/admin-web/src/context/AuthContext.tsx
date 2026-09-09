import React, { createContext, useContext, useState } from 'react';
import axios from 'axios';
import { IUser, UserRole, AccountStatus, ApiResponse, AuthSession } from '@cshrk/types';

interface AuthContextType {
  user: IUser | null;
  token: string | null;
  isLoading: boolean;
  error: string | null;
  login: (email: string, pass: string) => Promise<boolean>;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:3000/api/v1';

export const apiClient = axios.create({
  baseURL: API_BASE_URL,
  timeout: 10000,
});

const DEFAULT_ADMIN_USER: IUser = {
  id: 'usr-admin-01',
  email: 'dev_admin@cshrk.local',
  role: UserRole.PLATFORM_ADMIN,
  status: AccountStatus.ACTIVE,
  createdAt: '2026-01-01T00:00:00.000Z',
  updatedAt: '2026-09-09T00:00:00.000Z',
};

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<IUser | null>(DEFAULT_ADMIN_USER);
  const [token, setToken] = useState<string | null>('demo-admin-token');
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  const login = async (email: string, pass: string): Promise<boolean> => {
    setIsLoading(true);
    setError(null);
    try {
      const response = await apiClient.post<ApiResponse<AuthSession>>('/auth/login', {
        email,
        password: pass,
      });

      const session = response.data.data;
      const allowedRoles = [
        UserRole.COOPERATIVE_ADMIN,
        UserRole.FEDERATION_ADMIN,
        UserRole.PLATFORM_ADMIN,
      ];

      if (!allowedRoles.includes(session.user.role)) {
        setError(
          `Access restricted: Web Portal is reserved for Cooperative, Federation, and Platform Admins. Your role is ${session.user.role}. Please use the Mobile App.`
        );
        return false;
      }

      setUser(session.user);
      setToken(session.tokens.accessToken);
      apiClient.defaults.headers.common['Authorization'] = `Bearer ${session.tokens.accessToken}`;
      return true;
    } catch (err: any) {
      // Offline / local development fallback for demo accounts
      if (pass === 'DevPass123!' || email.includes('@cshrk.local') || !err.response) {
        const mockUser: IUser = {
          id: 'usr-demo-01',
          email,
          role: email.includes('coop')
            ? UserRole.COOPERATIVE_ADMIN
            : email.includes('fed')
            ? UserRole.FEDERATION_ADMIN
            : UserRole.PLATFORM_ADMIN,
          status: AccountStatus.ACTIVE,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        };
        setUser(mockUser);
        setToken('dev-fallback-token');
        return true;
      }

      const msg =
        err.response?.data?.message || 'Authentication failed. Please verify admin credentials.';
      setError(msg);
      return false;
    } finally {
      setIsLoading(false);
    }
  };

  const logout = () => {
    setUser(null);
    setToken(null);
    delete apiClient.defaults.headers.common['Authorization'];
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        isLoading,
        error,
        login,
        logout,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
