import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { AuthProvider } from "@/context/authContext";
import { Toaster } from "sonner";

const inter = Inter({
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Secure Auth | zhmdff.auth",
  description: "Production-ready authentication powered by zhmdff.auth",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className="dark">
      <body className={`${inter.className} antialiased`}>
        <AuthProvider>
          {children}
          <Toaster position="top-right" richColors theme="dark" closeButton />
        </AuthProvider>
      </body>
    </html>
  );
}