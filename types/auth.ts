export type User = {
  email: string;
  fullName: string;
} | null;

export type AuthContextType = {
  accessToken: string | null;
  setAccessToken: (token: string | null) => void;
  user: User | null;
  setUser: (user: User | null) => void;
  checkAuth: () => Promise<boolean>;
  logout: () => void;
};

export interface AuthResponse {
  accessToken: string;
}

export interface LoginRequest {
  email: string;
  password: string;
}

export interface RegisterRequest {
  fullName: string;
  email: string;
  password: string;
}
