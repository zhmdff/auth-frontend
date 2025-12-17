"use client";
import { createContext, useContext, useState, useEffect } from "react";

type AuthContextType = {
  accessToken: string | null;
  setAccessToken: (token: string | null) => void;
};

const AuthContext = createContext<AuthContextType>({
  accessToken: null,
  setAccessToken: () => {},
});

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const [accessToken, setAccessToken] = useState<string | null>(null);
  const [isLoaded, setIsLoaded] = useState(false);

  useEffect(() => {
    const stored = sessionStorage.getItem("accessToken");
    if (stored) setAccessToken(stored);
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
    <AuthContext.Provider value={{ accessToken, setAccessToken: handleSetToken }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);