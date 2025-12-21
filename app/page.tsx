"use client";
import { useEffect, useState } from "react";
import { useAuth } from "@/context/authContext";
import { useRouter } from "next/navigation";

export default function Dashboard() {
  const { accessToken, setAccessToken, user, setUser } = useAuth();
  const [logs, setLogs] = useState<string[]>([]);
  const [countdown, setCountdown] = useState<number | null>(null);
  const [notification, setNotification] = useState<string>("");
  const router = useRouter();

  useEffect(() => {
    const initAuth = async () => {
      if (!accessToken) {
        addLog("No access token. Checking for refresh token...");
        const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/auth/refresh`, {
          method: "POST",
          credentials: "include",
        });

        if (!res.ok) {
          addLog("No valid session. Redirecting to login.");
          router.push("/login");
          return;
        }

        const data = await res.json();
        if (data.accessToken) {
          setAccessToken(data.accessToken);
          setCountdown(15 * 60);
          addLog("✓ Token restored from refresh token");
        }
      }

      fetchData();
    };

    initAuth();
  }, []);

  const handleLogout = async () => {
    addLog("Logging out...");

    await fetch(`${process.env.NEXT_PUBLIC_API_URL}/auth/logout`, {
      method: "POST",
      credentials: "include",
    });

    setAccessToken("");
    setUser(null);
    addLog("✓ Logged out successfully");
    router.push("/login");
  };

  const addLog = (message: string) => {
    const timestamp = new Date().toLocaleTimeString();
    setLogs((prev) => [...prev, `[${timestamp}] ${message}`]);
  };

  const showNotification = (message: string) => {
    setNotification(message);
    setTimeout(() => setNotification(""), 3000);
  };

  const fetchData = async (isManual = false) => {
    let token = accessToken;
    addLog(`${isManual ? "Manual" : "Auto"} fetch initiated. Access token: ${token ? "Present" : "Missing"}`);

    if (!token || token === "") {
      addLog("No access token found. Attempting to refresh...");
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/auth/refresh`, {
        method: "POST",
        credentials: "include",
      });

      if (!res.ok) {
        addLog("Refresh failed. Redirecting to login.");
        showNotification("Session expired. Please login again.");
        router.push("/login");
        return;
      }

      const data = await res.json();
      token = data.accessToken;

      if (data.accessToken) {
        setAccessToken(data.accessToken);
        setCountdown(15 * 60);
        addLog("✓ Token refreshed successfully");
        showNotification("New token acquired!");
      }
    } else {
      addLog(`Using existing token: ${token.slice(0, 20)}...`);
      if (countdown === null) {
        setCountdown(15 * 60);
      }
    }

    addLog("Fetching dashboard data...");
    const dashboardRes = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/auth/dashboard`, {
      headers: { Authorization: `Bearer ${token}` },
      credentials: "include",
    });

    if (!dashboardRes.ok) {
      if (dashboardRes.status === 401) {
        addLog("⚠ 401 Unauthorized. Auto-refreshing token...");
        showNotification("Token expired. Auto-refreshing...");
        setAccessToken("");
        return;
      }
      addLog("Dashboard fetch failed. Redirecting to login.");
      return router.push("/login");
    }

    const userData = await dashboardRes.json();
    setUser(userData);
    console.log("Dashboard data:", userData);
    addLog("✓ Dashboard data loaded successfully");
    if (isManual) showNotification("Data refreshed!");
  };

  useEffect(() => {
    fetchData();
  }, []);

  useEffect(() => {
    if (countdown === null || countdown <= 0) return;

    const timer = setInterval(() => {
      setCountdown((prev) => {
        if (prev === null || prev <= 1) {
          addLog("⚠ Token countdown expired");
          return null;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [countdown]);

  if (!user) return <div className="p-5">Loading...</div>;

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, "0")}`;
  };

  return (
    <div className="p-5 font-mono">
      {notification && <div className="fixed top-5 right-5 px-5 py-2.5 bg-green-500 text-white rounded z-50">{notification}</div>}

      <h1 className="text-2xl font-bold mb-2">Welcome, {user.fullName}</h1>
      <p className="mb-5">Email: {user.email}</p>

      <div className="my-5 p-4 bg-gray-100 rounded">
        <h3 className="text-lg font-bold mb-2">Token Info</h3>
        <p>Status: {accessToken ? "✓ Active" : "✗ Missing"}</p>
        <p>Token: {accessToken ? `${accessToken.slice(0, 20)}...` : "None"}</p>
        <p>Countdown: {countdown !== null ? formatTime(countdown) : "Not set"}</p>
        <button onClick={() => fetchData(true)} className="mt-3 px-5 py-2.5 bg-blue-500 text-white rounded hover:bg-blue-600 cursor-pointer">
          Manual Refresh
        </button>
        <button onClick={handleLogout} className="mt-3 ml-3 px-5 py-2.5 bg-red-500 text-white rounded hover:bg-red-600 cursor-pointer">
          Logout
        </button>
      </div>

      <div className="my-5 p-4 bg-black text-green-400 rounded max-h-[300px] overflow-auto">
        <h3 className="text-lg font-bold mb-2">Logs</h3>
        {logs.map((log, i) => (
          <div key={i} className="text-xs mb-1">
            {log}
          </div>
        ))}
      </div>
    </div>
  );
}
