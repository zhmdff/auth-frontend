// login.ts
import { useAuth } from "../context/authContext";
import { LoginContext } from "@/lib/loginContext";

const login = async (email: string, password: string) => {
  const { setAccessToken } = useAuth();
  const data = await LoginContext(email, password);
  setAccessToken(data.accessToken); // store in memory
};
