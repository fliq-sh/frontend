"use client";

import Link from "next/link";
import { SignedIn, SignedOut, UserButton } from "@clerk/nextjs";
import { Button } from "@/components/ui/button";

export default function Navbar() {
  return (
    <header className="fixed top-0 inset-x-0 z-50 border-b border-white/10 bg-[#09090b]/80 backdrop-blur-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-14 flex items-center justify-between">
        <Link href="/" className="text-lg font-semibold tracking-tight">
          Fliq
        </Link>

        <nav className="hidden md:flex items-center gap-6 text-sm text-white/60">
          <Link href="#features" className="hover:text-white transition-colors">
            Docs
          </Link>
          <Link href="/pricing" className="hover:text-white transition-colors">
            Pricing
          </Link>
        </nav>

        <div className="flex items-center gap-3">
          <SignedOut>
            <Button variant="ghost" size="sm" asChild>
              <Link href="/sign-in">Sign In</Link>
            </Button>
            <Button size="sm" asChild>
              <Link href="/sign-up">Start Building</Link>
            </Button>
          </SignedOut>
          <SignedIn>
            <Button variant="ghost" size="sm" asChild>
              <Link href="/app">Dashboard</Link>
            </Button>
            <UserButton afterSignOutUrl="/" />
          </SignedIn>
        </div>
      </div>
    </header>
  );
}
