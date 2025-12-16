"use client";
import { useEffect, useState } from "react";
import { useAuth } from "@/context/authContext";
import { useRouter } from "next/navigation";

export default function Dashboard() {
  const { accessToken, setAccessToken } = useAuth();
  const [user, setUser] = useState<{ email: string; fullName: string } | null>(null);
  const router = useRouter();

  useEffect(() => {
    const fetchData = async () => {
      let token = accessToken;
      console.log('Access token before fetch:', accessToken);
      if (!token) {
        const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/auth/refresh`, {
          method: "POST",
          credentials: "include",
        });

        if (!res.ok) {
          router.push("/login");
          return;
        }

        const data = await res.json();
        token = data.accessToken;
        if (data.accessToken) setAccessToken(data.accessToken);
        console.log("Token refreshed");
      }

      const dashboardRes = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/auth/dashboard`, {
        headers: { Authorization: `Bearer ${token}` },
        credentials: "include",
      });

      if (!dashboardRes.ok) return router.push("/login");
      const userData = await dashboardRes.json();
      setUser(userData);
    };

    fetchData();
  }, [accessToken, router, setAccessToken]);

  // if (!user) { router.push("/login"); return null; }
  if (!user) return <div>Loading...</div>;

  return (
    <div>
      <h1>Welcome, {user.fullName}</h1>
      <p>Email: {user.email}</p>
    </div>
  );
}
