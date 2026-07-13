'use client';

import {
  createContext,
  useContext,
  useState,
  useEffect,
  useCallback,
  type ReactNode,
} from 'react';
import axios from 'axios';
import { useRouter } from 'next/navigation';

interface User {
  _id: string;
  name: string;
  email: string;
  role: string;
  avatar?: string;
  phone?: string;
  address?: {
    street: string;
    city: string;
    state: string;
    zip: string;
    country: string;
  };
}

interface AuthContextType {
  user: User | null;
  loading: boolean;
  error: string | null;
  login: (email: string, password: string) => Promise<void>;
  register: (name: string, email: string, password: string) => Promise<void>;
  logout: () => void;
  updateProfile: (data: Partial<User>) => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api';

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();

  const clearError = useCallback(() => setError(null), []);

  useEffect(() => {
    const token = localStorage.getItem('zaam_token');
    if (!token) {
      setLoading(false);
      return;
    }

    const loadUser = async () => {
      try {
        const res = await axios.get(`${API_URL}/auth/me`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        setUser(res.data.user || res.data);
      } catch {
        localStorage.removeItem('zaam_token');
        setUser(null);
      } finally {
        setLoading(false);
      }
    };

    loadUser();
  }, []);

  const login = useCallback(
    async (email: string, password: string) => {
      setLoading(true);
      setError(null);
      try {
        const res = await axios.post(`${API_URL}/auth/login`, {
          email,
          password,
        });
        const { token, user: userData } = res.data;
        localStorage.setItem('zaam_token', token);
        setUser(userData);
        clearError();
        router.push('/');
      } catch (err: unknown) {
        if (axios.isAxiosError(err)) {
          setError(
            err.response?.data?.message || 'Login failed. Please try again.'
          );
        } else {
          setError('Login failed. Please try again.');
        }
        throw err;
      } finally {
        setLoading(false);
      }
    },
    [clearError, router]
  );

  const register = useCallback(
    async (name: string, email: string, password: string) => {
      setLoading(true);
      setError(null);
      try {
        const res = await axios.post(`${API_URL}/auth/register`, {
          name,
          email,
          password,
        });
        const { token, user: userData } = res.data;
        localStorage.setItem('zaam_token', token);
        setUser(userData);
        clearError();
        router.push('/');
      } catch (err: unknown) {
        if (axios.isAxiosError(err)) {
          setError(
            err.response?.data?.message || 'Registration failed. Please try again.'
          );
        } else {
          setError('Registration failed. Please try again.');
        }
        throw err;
      } finally {
        setLoading(false);
      }
    },
    [clearError, router]
  );

  const logout = useCallback(() => {
    localStorage.removeItem('zaam_token');
    setUser(null);
    setError(null);
    router.push('/');
  }, [router]);

  const updateProfile = useCallback(async (data: Partial<User>) => {
    setLoading(true);
    setError(null);
    try {
      const token = localStorage.getItem('zaam_token');
      const res = await axios.put(`${API_URL}/auth/profile`, data, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setUser(res.data.user || res.data);
    } catch (err: unknown) {
      if (axios.isAxiosError(err)) {
        setError(
          err.response?.data?.message || 'Profile update failed.'
        );
      } else {
        setError('Profile update failed.');
      }
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  return (
    <AuthContext.Provider
      value={{ user, loading, error, login, register, logout, updateProfile }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
