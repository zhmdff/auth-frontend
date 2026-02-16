import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

type FetchOptions = {
  method?: "GET" | "POST" | "PUT" | "DELETE";
  body?: any;
  token?: string | null;
  onTokenRefresh?: (token: string) => void;
  onAuthFail?: () => void;
};

export async function apiFetch(endpoint: string, options: FetchOptions = {}) {
  const { method = "GET", body, token, onTokenRefresh, onAuthFail } = options;

  const headers: HeadersInit = {
    "Content-Type": "application/json",
  };

  if (token) {
    headers["Authorization"] = `Bearer ${token}`;
  }

  const config: RequestInit = {
    method,
    headers,
    credentials: "include",
  };

  if (body && method !== "GET") {
    config.body = JSON.stringify(body);
  }

  const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}${endpoint}`, config);

  if (res.status === 401 && token && onTokenRefresh) {
    // Attempt to refresh
    try {
      const refreshRes = await fetch(`${process.env.NEXT_PUBLIC_AUTH_URL}/refresh`, {
        method: "POST",
        credentials: "include",
      });

      if (refreshRes.ok) {
        const data = await refreshRes.json();
        const nextToken = data.accessToken;
        onTokenRefresh(nextToken);

        headers["Authorization"] = `Bearer ${nextToken}`;
        const retryRes = await fetch(`${process.env.NEXT_PUBLIC_API_URL}${endpoint}`, {
          ...config,
          headers,
        });

        if (!retryRes.ok) throw new Error(await retryRes.text());
        return retryRes.json();
      } else {
        onAuthFail?.();
        throw new Error("Session expired");
      }
    } catch (err) {
      onAuthFail?.();
      throw err;
    }
  }

  if (!res.ok) {
    const errorText = await res.text();
    let errorMessage = "An error occurred";
    try {
      const errorJson = JSON.parse(errorText);
      errorMessage = errorJson.message || errorJson || errorMessage;
    } catch {
      errorMessage = errorText || errorMessage;
    }
    throw new Error(errorMessage);
  }

  return res.json();
}
