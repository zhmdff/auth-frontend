"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/context/authContext";
import { Input } from "@/components/ui/Input";
import { Button } from "@/components/ui/Button";
import { motion } from "framer-motion";
import { UserPlus } from "lucide-react";
import Link from "next/link";
import { toast } from "sonner";

export default function RegisterPage() {
  const [formData, setFormData] = useState({
    identifier: "",
    fullName: "",
    password: "",
    confirmPassword: "",
  });
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();
  const { setAccessToken, setUser } = useAuth();

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    if (formData.password !== formData.confirmPassword) {
      toast.error("Passwords do not match");
      return;
    }

    setIsLoading(true);

    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_AUTH_URL}/register`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({
          identifier: formData.identifier,
          fullName: formData.fullName,
          password: formData.password,
          role: "User",
          adminLevel: 0
        }),
      });

      const data = await res.json();

      if (data.success) {
        setAccessToken(data.accessToken);
        setUser(data.user);
        toast.success("Account created!", {
          description: "Welcome to our platform.",
        });
        router.push("/");
      } else {
        toast.error("Registration failed", {
          description: data.errorMessage || "Please check your details",
        });
      }
    } catch (err) {
      toast.error("Connection error");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen w-full flex items-center justify-center bg-gradient-mesh p-4">
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.4 }}
        className="w-full max-w-lg"
      >
        <div className="glass rounded-3xl p-8 space-y-8 auth-card-hover">
          <div className="text-center space-y-2">
            <h1 className="text-3xl font-bold tracking-tight text-gradient">Create Account</h1>
            <p className="text-foreground/50">Join our community and start your journey</p>
          </div>

          <form onSubmit={handleRegister} className="grid grid-cols-1 md:grid-cols-2 gap-5">
            <div className="md:col-span-2">
              <Input
                label="Identifier (Email or Username)"
                placeholder="johndoe"
                required
                value={formData.identifier}
                onChange={(e) => setFormData({ ...formData, identifier: e.target.value })}
              />
            </div>
            <div className="md:col-span-2">
              <Input
                label="Full Name (Optional)"
                placeholder="John Doe"
                value={formData.fullName}
                onChange={(e) => setFormData({ ...formData, fullName: e.target.value })}
              />
            </div>
            <Input
              label="Password"
              type="password"
              placeholder="••••••••"
              required
              value={formData.password}
              onChange={(e) => setFormData({ ...formData, password: e.target.value })}
            />
            <Input
              label="Confirm Password"
              type="password"
              placeholder="••••••••"
              required
              value={formData.confirmPassword}
              onChange={(e) => setFormData({ ...formData, confirmPassword: e.target.value })}
            />

            <Button type="submit" className="md:col-span-2 py-6 mt-4" isLoading={isLoading}>
              <UserPlus className="w-4 h-4 mr-2" />
              Create Account
            </Button>
          </form>

          <p className="text-center text-sm text-foreground/50">
            Already have an account?{" "}
            <Link href="/login" className="text-primary hover:underline font-medium">
              Sign in instead
            </Link>
          </p>
        </div>
      </motion.div>
    </div>
  );
}
