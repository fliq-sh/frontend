"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";

// This route was previously used for the magic-link token exchange flow.
// Auth is now handled entirely by Clerk; redirect to the dashboard.
export default function AuthCallbackPage() {
  const router = useRouter();
  useEffect(() => {
    router.replace("/app");
  }, [router]);

  return (
    <div className="min-h-screen bg-[#09090b] text-white flex items-center justify-center px-4">
      <div className="text-center">
        <div className="h-5 w-5 rounded-full border-2 border-white/20 border-t-white animate-spin mx-auto mb-4" />
        <p className="text-sm text-white/60">Redirecting…</p>
      </div>
    </div>
  );
}
