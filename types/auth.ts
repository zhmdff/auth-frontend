export interface User {
  id: number;
  email?: string;
  username?: string;
  fullName?: string;
  role: string;
  adminLevel: number;
  isActive: boolean;
  createdAt: string;
  lastLoginAt?: string;
}

export interface AuthResult {
  success: boolean;
  accessToken?: string;
  refreshToken?: string;
  errorMessage?: string;
  user?: User;
}

export type AuthContextType = {
  accessToken: string | null;
  setAccessToken: (token: string | null) => void;
  user: User | null;
  setUser: (user: User | null) => void;
  isLoading: boolean;
  checkAuth: () => Promise<boolean>;
  logout: () => Promise<void>;
};

export interface LoginRequest {
  identifier: string; // Backend uses Identifier (email or username)
  password: string;
}

export interface RegisterRequest {
  identifier: string;
  password: string;
  fullName?: string;
  role?: string;
  adminLevel?: number;
}
