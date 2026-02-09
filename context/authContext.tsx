"use client";
import { createContext, useContext, useState, useEffect } from "react";
import type { User, AuthContextType } from "@/types/auth";

const AuthContext = createContext<AuthContextType>({
  accessToken: null,
  setAccessToken: () => {},
  user: null,
  setUser: () => {},
  checkAuth: async () => false,
  logout: async () => {},
});

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const [accessToken, setAccessToken] = useState<string | null>(null);
  const [user, setUser] = useState<User | null>(null);
  const [isLoaded, setIsLoaded] = useState(false);

  useEffect(() => {
    const init = async () => {
      // Always try to refresh token on load/refresh
      await checkAuth();
      setIsLoaded(true);
    };
    init();
  }, []);

  const checkAuth = async (): Promise<boolean> => {
    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/auth/refresh`, {
        method: "POST",
        credentials: "include",
      });

      if (!res.ok) return false;

      const data = await res.json();
      if (data.accessToken) {
        handleSetToken(data.accessToken);
        return true;
      }
      return false;
    } catch {
      return false;
    }
  };

  const handleSetToken = (token: string | null) => {
    setAccessToken(token);
    if (token) {
      fetchUserData(token);
    } else {
      setUser(null);
    }
  };

  const fetchUserData = async (token: string): Promise<boolean> => {
    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/auth/dashboard`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (res.ok) {
        const data = await res.json();
        setUser({ email: data.email, fullName: data.fullName });
        return true;
      }
      return false;
    } catch {
      return false;
    }
  };

  const logout = async () => {
    try {
      // Call backend logout
      await fetch(`${process.env.NEXT_PUBLIC_API_URL}/auth/logout`, {
        method: "POST",
        credentials: "include",
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
      });
    } catch (err) {
      console.error("Logout failed:", err);
    } finally {
      handleSetToken(null);
      setUser(null);
    }
  };

  if (!isLoaded) return null;

  return <AuthContext.Provider value={{ accessToken, setAccessToken: handleSetToken, user, setUser, checkAuth, logout }}>{children}</AuthContext.Provider>;
};

export const useAuth = () => useContext(AuthContext);
