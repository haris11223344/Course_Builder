import React, { createContext, useContext, useEffect, useState, useCallback } from "react";
import { User } from "@/types";
import { api } from "@/lib/api";

interface AuthContextType {
  user: User | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  login: (data: any) => Promise<User>;
  register: (data: any) => Promise<User>;
  loginWithGoogle: (data?: any) => Promise<User>;
  logout: () => Promise<void>;
  updateUser: (updated: Partial<User>) => void;
  refetchUser: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const fetchCurrentUser = useCallback(async () => {
    try {
      const response = await api.get<User>("/users/me");
      setUser(response.data);
    } catch {
      setUser(null);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchCurrentUser();
  }, [fetchCurrentUser]);

  const login = async (credentials: { email: string; password: string }): Promise<User> => {
    const response = await api.post("/auth/login", credentials);
    if (response.data.access_token) {
      localStorage.setItem("cf_token", response.data.access_token);
    }
    if (response.data.refresh_token) {
      localStorage.setItem("cf_refresh_token", response.data.refresh_token);
    }
    const loggedUser = response.data.user;
    setUser(loggedUser);
    return loggedUser;
  };

  const register = async (credentials: { email: string; password: string; full_name?: string }): Promise<User> => {
    const response = await api.post("/auth/register", credentials);
    if (response.data.access_token) {
      localStorage.setItem("cf_token", response.data.access_token);
    }
    if (response.data.refresh_token) {
      localStorage.setItem("cf_refresh_token", response.data.refresh_token);
    }
    const registeredUser = response.data.user;
    setUser(registeredUser);
    return registeredUser;
  };

  const loginWithGoogle = async (data?: any): Promise<User> => {
    const response = await api.post("/auth/google", data || {});
    if (response.data.access_token) {
      localStorage.setItem("cf_token", response.data.access_token);
    }
    if (response.data.refresh_token) {
      localStorage.setItem("cf_refresh_token", response.data.refresh_token);
    }
    const loggedUser = response.data.user;
    setUser(loggedUser);
    return loggedUser;
  };

  const logout = async () => {
    try {
      await api.post("/auth/logout");
    } catch {
      // Ignore network errors on logout
    } finally {
      localStorage.removeItem("cf_token");
      localStorage.removeItem("cf_refresh_token");
      setUser(null);
      window.location.href = "/auth/login";
    }
  };

  const updateUser = (updated: Partial<User>) => {
    if (user) {
      setUser({ ...user, ...updated });
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        isLoading,
        isAuthenticated: !!user,
        login,
        register,
        loginWithGoogle,
        logout,
        updateUser,
        refetchUser: fetchCurrentUser,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};
