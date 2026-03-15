import { createContext, useContext, useState, useEffect, ReactNode, useCallback } from 'react';
import { useAuth as useClerkAuth, useUser } from '@clerk/clerk-react';
import { Preferences } from '@capacitor/preferences';
import type { UserResource } from '@clerk/types';

// User type for our app
interface User {
  id: string;
  email: string;
  name: string | null;
  imageUrl?: string;
}

export interface AuthContextType {
  user: User | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  isSignedIn: boolean;
  clerkUser: UserResource | null | undefined;
  getToken: () => Promise<string | null>;
  setUser: (user: User | null) => void;
  logout: () => Promise<void>;
  syncUserWithBackend: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

const USER_KEY = 'auth_user';
const TOKEN_KEY = 'clerk_token';

export function AuthProvider({ children }: { children: ReactNode }) {
  const { isLoaded, isSignedIn, getToken: getClerkToken } = useClerkAuth();
  const { user: clerkUser } = useUser();
  
  const [user, setUserState] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [token, setToken] = useState<string | null>(null);

  // Load cached user on mount
  useEffect(() => {
    loadCachedUser();
  }, []);

  // Sync with Clerk when auth state changes
  useEffect(() => {
    if (!isLoaded) return;

    if (isSignedIn && clerkUser) {
      const userData: User = {
        id: clerkUser.id,
        email: clerkUser.primaryEmailAddress?.emailAddress || '',
        name: clerkUser.fullName || clerkUser.firstName || null,
        imageUrl: clerkUser.imageUrl,
      };
      saveUser(userData);
      
      // Get and cache the token
      refreshToken();
    } else if (!isSignedIn) {
      clearUser();
    }
    
    setIsLoading(false);
  }, [isLoaded, isSignedIn, clerkUser]);

  const loadCachedUser = async () => {
    try {
      const [{ value: userData }, { value: cachedToken }] = await Promise.all([
        Preferences.get({ key: USER_KEY }),
        Preferences.get({ key: TOKEN_KEY }),
      ]);
      
      if (userData) {
        setUserState(JSON.parse(userData));
      }
      if (cachedToken) {
        setToken(cachedToken);
      }
    } catch (error) {
      console.error('Auth init error:', error);
    }
  };

  const saveUser = async (userData: User | null) => {
    if (userData) {
      await Preferences.set({ key: USER_KEY, value: JSON.stringify(userData) });
    } else {
      await Preferences.remove({ key: USER_KEY });
    }
    setUserState(userData);
  };

  const clearUser = async () => {
    await Promise.all([
      Preferences.remove({ key: USER_KEY }),
      Preferences.remove({ key: TOKEN_KEY }),
    ]);
    setUserState(null);
    setToken(null);
  };

  const refreshToken = async () => {
    try {
      const newToken = await getClerkToken();
      if (newToken) {
        await Preferences.set({ key: TOKEN_KEY, value: newToken });
        setToken(newToken);
      }
      return newToken;
    } catch (error) {
      console.error('Token refresh error:', error);
      return null;
    }
  };

  const getToken = useCallback(async (): Promise<string | null> => {
    // Always try to get fresh token from Clerk first
    try {
      const freshToken = await getClerkToken();
      if (freshToken) {
        await Preferences.set({ key: TOKEN_KEY, value: freshToken });
        setToken(freshToken);
        return freshToken;
      }
    } catch (error) {
      console.warn('Could not get fresh token, using cached:', error);
    }
    
    // Fallback to cached token
    return token;
  }, [getClerkToken, token]);

  const setUser = async (userData: User | null) => {
    await saveUser(userData);
  };

  const logout = async () => {
    await clearUser();
  };

  // Sync user with backend (create/update user record)
  const syncUserWithBackend = async () => {
    if (!isSignedIn || !clerkUser) return;

    try {
      const authToken = await getToken();
      if (!authToken) {
        console.error('No auth token available');
        return;
      }

      const response = await fetch('/api/user/sync', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${authToken}`,
        },
        body: JSON.stringify({
          clerkId: clerkUser.id,
          email: clerkUser.primaryEmailAddress?.emailAddress,
          name: clerkUser.fullName || clerkUser.firstName,
        }),
      });

      if (!response.ok) {
        throw new Error(`Sync failed: ${response.status}`);
      }

      console.log('User synced with backend');
    } catch (error) {
      console.error('Failed to sync user with backend:', error);
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        isLoading: isLoading || !isLoaded,
        isAuthenticated: !!user && isSignedIn === true,
        isSignedIn: isSignedIn === true,
        clerkUser,
        getToken,
        setUser,
        logout,
        syncUserWithBackend,
      }}
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
