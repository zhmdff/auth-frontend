"use client";
import { createContext, useContext, useState, useEffect } from "react";

type User = {
  email: string;
  fullName: string;
} | null;

type AuthContextType = {
  accessToken: string | null;
  setAccessToken: (token: string | null) => void;
  user: User;
  setUser: (user: User) => void;
  checkAuth: () => Promise<boolean>;
};

const AuthContext = createContext<AuthContextType>({
  accessToken: null,
  setAccessToken: () => {},
  user: null,
  setUser: () => {},
  checkAuth: async () => false,
});

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const [accessToken, setAccessToken] = useState<string | null>(null);
  const [user, setUser] = useState<User>(null);
  const [isLoaded, setIsLoaded] = useState(false);

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

  useEffect(() => {
    const stored = sessionStorage.getItem("accessToken");
    if (stored) {
      setAccessToken(stored);
    } else {
      checkAuth();
    }
    setIsLoaded(true);
  }, []);

  const handleSetToken = (token: string | null) => {
    setAccessToken(token);
    if (token) {
      sessionStorage.setItem("accessToken", token);
    } else {
      sessionStorage.removeItem("accessToken");
    }
  };

  if (!isLoaded) return null;

  return (
    <AuthContext.Provider value={{ accessToken, setAccessToken: handleSetToken, user, setUser, checkAuth }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);