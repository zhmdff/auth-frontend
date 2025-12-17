"use client";
import { useEffect } from "react";
import { useRouter } from "next/navigation";

export default function Home() {
  const router = useRouter();

  router.push("/dashboard");

  return (
   <div className="fixed inset-0 flex items-center justify-center bg-white">
     <div className="h-8 w-8 animate-spin rounded-full border-2 border-gray-300 border-t-gray-900" />
   </div>
 );
}