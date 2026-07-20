'use client';

import {
  createContext,
  useContext,
  useCallback,
  type ReactNode,
} from 'react';
import { useSession, signIn as nextAuthSignIn, signOut as nextAuthSignOut } from 'next-auth/react';
import axios from 'axios';
import { useRouter } from 'next/navigation';

interface User {
  _id: string;
  name: string;
  email: string;
  role: string;
  avatar?: string;
  phone?: string;
  addresses?: {
    street: string;
    city: string;
    state: string;
    zip: string;
    country: string;
    isDefault: boolean;
  }[];
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

export function AuthProvider({ children }: { children: ReactNode }) {
  const { data: session, status } = useSession();
  const router = useRouter();

  const user: User | null = session?.user
    ? {
        _id: session.user.id,
        name: session.user.name || '',
        email: session.user.email || '',
        role: session.user.role || 'customer',
        avatar: session.user.image || undefined,
      }
    : null;

  const loading = status === 'loading';

  const login = useCallback(
    async (email: string, password: string) => {
      const result = await nextAuthSignIn('credentials', {
        email,
        password,
        redirect: false,
      });

      if (result?.error) {
        const message =
          result.error === 'CredentialsSignin'
            ? 'Invalid email or password.'
            : 'Login failed. Please try again.';
        throw new Error(message);
      }

      router.refresh();
    },
    [router]
  );

  const register = useCallback(
    async (name: string, email: string, password: string) => {
      await axios.post('/api/auth/register', { name, email, password });

      const result = await nextAuthSignIn('credentials', {
        email,
        password,
        redirect: false,
      });

      if (result?.error) {
        throw new Error(
          'Account created but login failed. Please try signing in.'
        );
      }

      router.refresh();
      router.push('/');
    },
    [router]
  );

  const logout = useCallback(async () => {
    await nextAuthSignOut({ redirect: false });
    router.refresh();
    router.push('/');
  }, [router]);

  const updateProfile = useCallback(async (data: Partial<User>) => {
    await axios.put('/api/users', data);
    router.refresh();
  }, [router]);

  return (
    <AuthContext.Provider
      value={{ user, loading, error: null, login, register, logout, updateProfile }}
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
