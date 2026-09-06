import React, { createContext, useContext, useState } from 'react';
import { IUser, UserRole, ApiResponse, AuthSession } from '@cshrk/types';
import { apiClient, setAuthToken } from '../services/api';

interface AuthContextType {
  user: IUser | null;
  token: string | null;
  isLoading: boolean;
  error: string | null;
  login: (email: string, pass: string) => Promise<boolean>;
  register: (fullName: string, email: string, pass: string) => Promise<boolean>;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<IUser | null>(null);
  const [token, setToken] = useState<string | null>(null);
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

      if (session.user.role !== UserRole.CUSTOMER) {
        setError(`Access restricted: Customer app requires CUSTOMER role. Current role: ${session.user.role}`);
        return false;
      }

      setUser(session.user);
      setToken(session.tokens.accessToken);
      setAuthToken(session.tokens.accessToken);
      return true;
    } catch (err: any) {
      const message =
        err.response?.data?.message || 'Login failed. Please check your credentials.';
      setError(message);
      return false;
    } finally {
      setIsLoading(false);
    }
  };

  const register = async (
    fullName: string,
    email: string,
    pass: string,
  ): Promise<boolean> => {
    setIsLoading(true);
    setError(null);
    try {
      const response = await apiClient.post<ApiResponse<AuthSession>>('/auth/register', {
        fullName,
        email,
        password: pass,
        role: UserRole.CUSTOMER,
      });

      const session = response.data.data;
      setUser(session.user);
      setToken(session.tokens.accessToken);
      setAuthToken(session.tokens.accessToken);
      return true;
    } catch (err: any) {
      const message =
        err.response?.data?.message || 'Registration failed. Please try again.';
      setError(message);
      return false;
    } finally {
      setIsLoading(false);
    }
  };

  const logout = () => {
    setUser(null);
    setToken(null);
    setAuthToken(null);
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        isLoading,
        error,
        login,
        register,
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
