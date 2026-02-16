"use client";
import { createContext, useContext, useState, useEffect } from "react";
import type { User, AuthContextType, AuthResult } from "@/types/auth";
import { apiFetch } from "@/lib/apiFetch";

const AuthContext = createContext<AuthContextType>({
  accessToken: null,
  setAccessToken: () => {},
  user: null,
  setUser: () => {},
  isLoading: true,
  checkAuth: async () => false,
  logout: async () => {},
});

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const [accessToken, setAccessToken] = useState<string | null>(null);
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const init = async () => {
      await checkAuth();
      setIsLoading(false);
    };
    init();
  }, []);

  const checkAuth = async (): Promise<boolean> => {
    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_AUTH_URL}/refresh`, {
        method: "POST",
        credentials: "include",
      });

      if (!res.ok) {
        handleSetToken(null, null);
        return false;
      }

      const data: AuthResult = await res.json();
      if (data.success && data.accessToken && data.user) {
        handleSetToken(data.accessToken, data.user);
        return true;
      }
      
      handleSetToken(null, null);
      return false;
    } catch {
      handleSetToken(null, null);
      return false;
    }
  };

  const handleSetToken = (token: string | null, userData: User | null) => {
    setAccessToken(token);
    setUser(userData);
  };

  const logout = async () => {
    try {
      await fetch(`${process.env.NEXT_PUBLIC_AUTH_URL}/logout`, {
        method: "POST",
        credentials: "include",
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
      });
    } catch (err) {
      console.error("Logout failed:", err);
    } finally {
      handleSetToken(null, null);
    }
  };

  return (
    <AuthContext.Provider 
      value={{ 
        accessToken, 
        setAccessToken: (token) => handleSetToken(token, user), 
        user, 
        setUser, 
        isLoading,
        checkAuth, 
        logout 
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
