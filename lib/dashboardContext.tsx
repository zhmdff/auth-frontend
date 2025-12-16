import { useAuth } from "@/context/authContext";

export async function getDashboardContext() {
  const { accessToken } = useAuth();
  const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/auth/dashboard`, {
    headers: { Authorization: `Bearer ${accessToken}` },
  });
  return res.json();
}
