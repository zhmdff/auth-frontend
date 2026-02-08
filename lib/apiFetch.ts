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
    const refreshRes = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/auth/refresh`, {
      method: "POST",
      credentials: "include",
    });

    if (refreshRes.ok) {
      const { accessToken } = await refreshRes.json();
      onTokenRefresh(accessToken);

      headers["Authorization"] = `Bearer ${accessToken}`;
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
  }

  if (!res.ok) throw new Error(await res.text());
  return res.json();
}
