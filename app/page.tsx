"use client";

import { useAuth } from "@/context/authContext";
import { Button } from "@/components/ui/Button";
import { motion, AnimatePresence } from "framer-motion";
import { ShieldCheck, LogOut, User, Key, Activity, Calendar, Zap, Shield, Lock } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { toast } from "sonner";

export default function Home() {
  const { user, accessToken, logout, isLoading } = useAuth();
  const router = useRouter();

  const handleLogout = async () => {
    await logout();
    toast.success("Successfully logged out");
    router.push("/login");
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-mesh">
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
        >
          <Zap className="w-10 h-10 text-primary" />
        </motion.div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-mesh">
      {/* Navigation */}
      <nav className="glass sticky top-0 z-50 px-6 py-4 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="bg-primary p-2 rounded-lg">
            <ShieldCheck className="w-5 h-5 text-primary-foreground" />
          </div>
          <span className="font-bold text-xl tracking-tight hidden md:block">Zhmdff.Auth</span>
        </div>

        <div className="flex items-center gap-4">
          {user ? (
            <>
              <div className="hidden sm:flex items-center gap-2 px-3 py-1.5 glass rounded-full text-sm">
                <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
                <span className="font-medium">{user.fullName || user.username || user.email}</span>
              </div>
              <Button variant="ghost" className="h-10 w-10 p-0 rounded-full" onClick={handleLogout}>
                <LogOut className="w-5 h-5 text-red-400" />
              </Button>
            </>
          ) : (
            <div className="flex gap-2">
              <Link href="/login">
                <Button variant="ghost">Sign In</Button>
              </Link>
              <Link href="/register">
                <Button>Get Started</Button>
              </Link>
            </div>
          )}
        </div>
      </nav>

      <main className="max-w-7xl mx-auto px-6 py-12 space-y-12">
        <AnimatePresence mode="wait">
          {user ? (
            <motion.div
              key="authenticated"
              initial={{ opacity: 0, scale: 0.98 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.98 }}
              className="grid grid-cols-1 lg:grid-cols-3 gap-8"
            >
              {/* Profile Card */}
              <div className="lg:col-span-1 space-y-6">
                <div className="glass rounded-3xl p-8 space-y-6">
                  <div className="flex flex-col items-center text-center space-y-4">
                    <div className="w-24 h-24 rounded-full bg-gradient-to-tr from-primary to-accent p-1">
                      <div className="w-full h-full rounded-full bg-background flex items-center justify-center">
                        <User className="w-12 h-12 text-foreground/50" />
                      </div>
                    </div>
                    <div>
                      <h2 className="text-2xl font-bold">{user.fullName || 'Anonymous User'}</h2>
                      <p className="text-foreground/50">{user.email || user.username}</p>
                    </div>
                    <div className="flex gap-2">
                      <span className="px-3 py-1 rounded-full bg-primary/10 text-primary text-xs font-bold uppercase tracking-wider">
                        {user.role}
                      </span>
                      {user.adminLevel > 0 && (
                        <span className="px-3 py-1 rounded-full bg-accent/10 text-accent text-xs font-bold uppercase tracking-wider">
                          Level {user.adminLevel}
                        </span>
                      )}
                    </div>
                  </div>

                  <div className="pt-6 border-t border-glass-border space-y-4">
                    <div className="flex items-center justify-between text-sm">
                      <div className="flex items-center gap-2 text-foreground/50">
                        <Calendar className="w-4 h-4" />
                        <span>Member Since</span>
                      </div>
                      <span className="font-medium text-foreground/80">
                        {new Date(user.createdAt).toLocaleDateString()}
                      </span>
                    </div>
                    <div className="flex items-center justify-between text-sm">
                      <div className="flex items-center gap-2 text-foreground/50">
                        <Activity className="w-4 h-4" />
                        <span>Status</span>
                      </div>
                      <span className="text-green-400 font-medium">Active</span>
                    </div>
                  </div>
                </div>

                <div className="glass rounded-3xl p-6 space-y-4">
                  <h3 className="font-bold flex items-center gap-2">
                    <Shield className="w-4 h-4 text-primary" />
                    Session Details
                  </h3>
                  <div className="bg-background/20 rounded-xl p-4 font-mono text-[10px] break-all text-foreground/40 border border-glass-border overflow-hidden">
                    <span className="block text-primary/60 mb-2 font-bold">ACCESS_TOKEN:</span>
                    {accessToken?.substring(0, 100)}...
                  </div>
                </div>
              </div>

              {/* Security Tools */}
              <div className="lg:col-span-2 space-y-8">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <ToolCard 
                    icon={<Key className="w-6 h-6" />}
                    title="API Security"
                    description="Your session is protected with rotating JWT and HTTP-only refresh tokens."
                  />
                  <ToolCard 
                    icon={<Lock className="w-6 h-6" />}
                    title="Audit Logging"
                    description="All authentication events are tracked for your security in the backend."
                  />
                </div>

                <div className="glass rounded-3xl p-8 space-y-6">
                  <h2 className="text-2xl font-bold text-gradient">System Overview</h2>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    <StatCard label="Auth Strategy" value="BCrypt" />
                    <StatCard label="Token Format" value="JWT" />
                    <StatCard label="Policies" value="Active" />
                    <StatCard label="Protection" value="Standard" />
                  </div>
                  <div className="p-8 border-2 border-dashed border-glass-border rounded-2xl flex flex-col items-center justify-center text-center space-y-4">
                    <div className="bg-glass-white p-4 rounded-full">
                      <Activity className="w-8 h-8 text-primary/40" />
                    </div>
                    <div className="max-w-md">
                      <h4 className="font-bold">No Recent Incidents</h4>
                      <p className="text-sm text-foreground/50">Everything is running smoothly. Your account is secured by Zhmdff logic.</p>
                    </div>
                  </div>
                </div>
              </div>
            </motion.div>
          ) : (
            <motion.div
              key="guest"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="flex flex-col items-center justify-center py-20 text-center space-y-8"
            >
              <div className="space-y-4 max-w-2xl">
                <h1 className="text-5xl md:text-7xl font-extrabold tracking-tight">
                  Secure Your App with <span className="text-gradient">Confidence</span>
                </h1>
                <p className="text-xl text-foreground/50 leading-relaxed">
                  The ultimate production-ready authentication library for ASP.NET Core and Next.js. 
                  Modular, secure, and beautiful by default.
                </p>
              </div>

              <div className="flex flex-col sm:flex-row gap-4">
                <Link href="/register">
                  <Button className="h-14 px-10 text-lg rounded-2xl">Create Free Account</Button>
                </Link>
                <Link href="/login">
                  <Button variant="outline" className="h-14 px-10 text-lg rounded-2xl">Sign In Now</Button>
                </Link>
              </div>

              <div className="pt-20 grid grid-cols-1 md:grid-cols-3 gap-8 w-full max-w-5xl">
                <FeatureCard 
                  title="JWT Auth" 
                  desc="Short-lived access tokens for secure API communication."
                />
                <FeatureCard 
                  title="Refresh Tokens" 
                  desc="HttpOnly cookies for seamless session persistence."
                />
                <FeatureCard 
                  title="Role Based" 
                  desc="Advanced policy-based authorization out of the box."
                />
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </main>
    </div>
  );
}

function ToolCard({ icon, title, description }: { icon: React.ReactNode, title: string, description: string }) {
  return (
    <div className="glass rounded-2xl p-6 space-y-4 auth-card-hover group">
      <div className="bg-primary/10 w-12 h-12 rounded-xl flex items-center justify-center text-primary group-hover:bg-primary group-hover:text-primary-foreground transition-colors duration-300">
        {icon}
      </div>
      <h3 className="text-lg font-bold">{title}</h3>
      <p className="text-sm text-foreground/50 leading-relaxed">{description}</p>
    </div>
  );
}

function StatCard({ label, value }: { label: string, value: string }) {
  return (
    <div className="glass rounded-xl p-4 flex flex-col items-center justify-center text-center">
      <span className="text-[10px] uppercase tracking-wider text-foreground/30 font-bold">{label}</span>
      <span className="font-bold text-primary">{value}</span>
    </div>
  );
}

function FeatureCard({ title, desc }: { title: string, desc: string }) {
  return (
    <div className="glass rounded-3xl p-8 space-y-3 text-left auth-card-hover border-b-4 border-b-primary/20">
      <h3 className="text-xl font-bold">{title}</h3>
      <p className="text-sm text-foreground/50">{desc}</p>
    </div>
  );
}
