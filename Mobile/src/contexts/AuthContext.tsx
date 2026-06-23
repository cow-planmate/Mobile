import React, { createContext, useContext, useEffect } from 'react';
import { useAuthStore, User } from '../store/useAuthStore';

interface AuthContextType {
  user: User | null;
  isLoading: boolean;
  needsThemeSelection: boolean;
  setNeedsThemeSelection: (val: boolean) => void;
  login: (email: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
  oauthLogin: (code: string) => Promise<void>;
  oauthComplete: (data: {
    provider: string;
    providerId: string;
    email: string;
    age: number;
    gender: number;
  }) => Promise<void>;
}

export const AuthContext = createContext<AuthContextType>({} as AuthContextType);

export const useAuth = () => {
  const user = useAuthStore((state) => state.user);
  const isLoading = useAuthStore((state) => state.isLoading);
  const needsThemeSelection = useAuthStore((state) => state.needsThemeSelection);
  const setNeedsThemeSelection = useAuthStore((state) => state.setNeedsThemeSelection);
  const login = useAuthStore((state) => state.login);
  const logout = useAuthStore((state) => state.logout);
  const oauthLogin = useAuthStore((state) => state.oauthLogin);
  const oauthComplete = useAuthStore((state) => state.oauthComplete);

  return {
    user,
    isLoading,
    needsThemeSelection,
    setNeedsThemeSelection,
    login,
    logout,
    oauthLogin,
    oauthComplete,
  };
};

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const initialize = useAuthStore((state) => state.initialize);

  useEffect(() => {
    void initialize();
  }, [initialize]);

  const user = useAuthStore((state) => state.user);
  const isLoading = useAuthStore((state) => state.isLoading);
  const needsThemeSelection = useAuthStore((state) => state.needsThemeSelection);
  const setNeedsThemeSelection = useAuthStore((state) => state.setNeedsThemeSelection);
  const login = useAuthStore((state) => state.login);
  const logout = useAuthStore((state) => state.logout);
  const oauthLogin = useAuthStore((state) => state.oauthLogin);
  const oauthComplete = useAuthStore((state) => state.oauthComplete);

  return (
    <AuthContext.Provider
      value={{
        user,
        isLoading,
        needsThemeSelection,
        setNeedsThemeSelection,
        login,
        logout,
        oauthLogin,
        oauthComplete,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};
