"use client";
import { useEffect, useState, useRef } from "react";
import { useAuth } from "@/context/authContext";
import { useRouter } from "next/navigation";
import { apiFetch } from "@/lib/apiFetch";

export default function Dashboard() {
  const { accessToken, setAccessToken, user, setUser, logout } = useAuth();
  const [tokenExpiry, setTokenExpiry] = useState<number | null>(null);
  const [logs, setLogs] = useState<string[]>([]);
  const [countdown, setCountdown] = useState<number>(15 * 60);
  const [notification, setNotification] = useState<string>("");
  const [loading, setLoading] = useState(false);
  const router = useRouter();
  const hasFetched = useRef(false);

  const addLog = (message: string) => {
    const timestamp = new Date().toLocaleTimeString();
    setLogs((prev) => [...prev, `[${timestamp}] ${message}`]);
  };

  const showNotification = (message: string) => {
    setNotification(message);
    setTimeout(() => setNotification(""), 3000);
  };

  const handleLogout = () => {
    addLog("Logging out...");
    sessionStorage.removeItem("tokenExpiry");
    logout();
    addLog("✓ Logged out successfully");
    router.push("/login");
  };

  const fetchData = async (isManual = false) => {
    if (loading && !isManual) return;

    setLoading(true);
    try {
      addLog(`${isManual ? "Manual" : "Auto"} fetch initiated`);

      const userData = await apiFetch("/auth/dashboard", {
        token: accessToken,
        onTokenRefresh: (newToken) => {
          const expiry = Date.now() + 15 * 60 * 1000;
          setAccessToken(newToken);
          sessionStorage.setItem("tokenExpiry", expiry.toString());
          setTokenExpiry(expiry);
          addLog("✓ Token auto-refreshed");
          addLog(`New token: ${newToken.slice(0, 30)}...`);
          showNotification("Token refreshed!");
        },
        onAuthFail: () => {
          addLog("⚠ Auth failed. Logging out...");
          showNotification("Session expired");
          handleLogout();
        },
      });

      setUser(userData);
      addLog("✓ Dashboard data loaded");
      if (isManual) showNotification("Data refreshed!");
    } catch (error) {
      const message = error instanceof Error ? error.message : "Unknown error";
      addLog(`✗ Error: ${message}`);
      showNotification("Error loading data");
    } finally {
      setLoading(false);
    }
  };

  const handleRefreshToken = async () => {
    setLoading(true);
    try {
      addLog("🔄 Manual token refresh initiated...");

      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/auth/refresh`, {
        method: "POST",
        credentials: "include",
      });

      if (!res.ok) {
        addLog("✗ Token refresh failed");
        showNotification("Refresh failed");
        handleLogout();
        return;
      }

      const data = await res.json();
      if (data.accessToken) {
        const expiry = Date.now() + 15 * 60 * 1000;
        setAccessToken(data.accessToken);
        sessionStorage.setItem("tokenExpiry", expiry.toString());
        setTokenExpiry(expiry);
        addLog("✓ Token manually refreshed");
        addLog(`New token: ${data.accessToken.slice(0, 30)}...`);
        showNotification("Token refreshed successfully!");
      }
    } catch (error) {
      const message = error instanceof Error ? error.message : "Unknown error";
      addLog(`✗ Refresh error: ${message}`);
      showNotification("Refresh failed");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (!accessToken && !user) {
      addLog("⚠ No authentication. Redirecting to login...");
      router.push("/login");
      return;
    }

    if (!user && !hasFetched.current) {
      hasFetched.current = true;
      addLog("📡 Fetching user data...");
      fetchData();
    } else if (user) {
      addLog("✓ User already loaded from context");
    }
  }, []);

  useEffect(() => {
    const stored = sessionStorage.getItem("tokenExpiry");
    if (stored) {
      setTokenExpiry(parseInt(stored));
      addLog(`Token expiry loaded: ${new Date(parseInt(stored)).toLocaleTimeString()}`);
    } else if (accessToken) {
      const expiry = Date.now() + 15 * 60 * 1000;
      sessionStorage.setItem("tokenExpiry", expiry.toString());
      setTokenExpiry(expiry);
      addLog(`Token expiry set: ${new Date(expiry).toLocaleTimeString()}`);
    }
  }, [accessToken]);

  useEffect(() => {
    if (!tokenExpiry) return;

    const updateCountdown = () => {
      const remaining = Math.max(0, Math.floor((tokenExpiry - Date.now()) / 1000));
      setCountdown(remaining);

      if (remaining <= 0) {
        addLog("⚠ Token expired. Clearing session...");
        sessionStorage.removeItem("tokenExpiry");
        setAccessToken(null);
        setTokenExpiry(null);
        hasFetched.current = false;
      }
    };

    updateCountdown();
    const timer = setInterval(updateCountdown, 1000);
    return () => clearInterval(timer);
  }, [tokenExpiry, setAccessToken]);

  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="h-12 w-12 animate-spin rounded-full border-4 border-blue-500 border-t-transparent mx-auto mb-4" />
          <p className="text-gray-600">Loading dashboard...</p>
        </div>
      </div>
    );
  }

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, "0")}`;
  };

  return (
    <div className="p-5 font-mono max-w-4xl mx-auto">
      {notification && <div className="fixed top-5 right-5 px-5 py-2.5 bg-green-500 text-white rounded shadow-lg z-50 animate-fade-in">{notification}</div>}

      <div className="bg-white rounded-lg shadow-md p-6 mb-5">
        <h1 className="text-2xl font-bold mb-2">Welcome, {user.fullName}</h1>
        <p className="text-gray-600">Email: {user.email}</p>
      </div>

      <div className="bg-white rounded-lg shadow-md p-6 mb-5">
        <h3 className="text-lg font-bold mb-4">Token Information</h3>
        <div className="space-y-2 mb-4">
          <div className="flex items-center gap-2">
            <span className="font-semibold">Status:</span>
            <span className={accessToken ? "text-green-600" : "text-red-600"}>{accessToken ? "✓ Active" : "✗ Missing"}</span>
          </div>
          <div className="flex flex-col gap-1">
            <span className="font-semibold">Token:</span>
            <span className="text-xs bg-gray-100 px-2 py-1 rounded font-mono break-all">{accessToken ? accessToken : "None"}</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="font-semibold">Expires in:</span>
            <span className={`font-mono ${countdown < 60 ? "text-red-600 font-bold" : "text-gray-700"}`}>{formatTime(countdown)}</span>
          </div>
          {tokenExpiry && (
            <div className="flex items-center gap-2">
              <span className="font-semibold">Expires at:</span>
              <span className="text-sm text-gray-600">{new Date(tokenExpiry).toLocaleTimeString()}</span>
            </div>
          )}
        </div>

        <div className="flex gap-3 flex-wrap">
          <button onClick={() => fetchData(true)} disabled={loading} className="px-5 py-2.5 bg-blue-500 text-white rounded hover:bg-blue-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors">
            {loading ? "Loading..." : "Refresh Data"}
          </button>

          <button onClick={handleRefreshToken} disabled={loading} className="px-5 py-2.5 bg-green-500 text-white rounded hover:bg-green-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors">
            {loading ? "Loading..." : "Refresh Token"}
          </button>

          <button onClick={handleLogout} className="px-5 py-2.5 bg-red-500 text-white rounded hover:bg-red-600 transition-colors">
            Logout
          </button>
        </div>
      </div>

      <div className="bg-black text-green-400 rounded-lg shadow-md p-6">
        <h3 className="text-lg font-bold mb-3">Activity Logs</h3>
        <div className="max-h-[400px] overflow-auto space-y-1">
          {logs.length === 0 ? (
            <p className="text-gray-500 text-sm">No logs yet...</p>
          ) : (
            logs.map((log, i) => (
              <div key={i} className="text-xs font-mono">
                {log}
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}
