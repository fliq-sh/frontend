"use client";

import Link from "next/link";
import { useState } from "react";
import { SignedIn, SignedOut, UserButton } from "@clerk/nextjs";
import { Button } from "@/components/ui/button";
import FliqIcon from "@/components/ui/FliqIcon";
import { Menu, X } from "lucide-react";

const companyLinks = [
  { label: "About", href: "/about", description: "Who we are and why we built Fliq" },
  { label: "Blog", href: "/blog", description: "Writing on reliability, scheduling, and engineering" },
  { label: "Changelog", href: "/changelog", description: "What shipped recently" },
];

export default function Navbar() {
  const [companyOpen, setCompanyOpen] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);

  return (
    <header className="fixed top-0 inset-x-0 z-50 border-b border-white/10 bg-[#09090b]/80 backdrop-blur-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-14 flex items-center justify-between">

        {/* Left — logo */}
        <Link href="/" className="flex items-center gap-2">
          <FliqIcon size={28} />
          <span className="text-base font-semibold tracking-tight">Fliq</span>
        </Link>

        {/* Center — nav (desktop only) */}
        <nav className="hidden md:flex items-center justify-center gap-6 text-sm text-white/60">
          <Link href="/docs" className="hover:text-white transition-colors">
            Docs
          </Link>
          <Link href="/pricing" className="hover:text-white transition-colors">
            Pricing
          </Link>

          {/* Company dropdown */}
          <div
            className="relative"
            onMouseEnter={() => setCompanyOpen(true)}
            onMouseLeave={() => setCompanyOpen(false)}
          >
            <button className="flex items-center gap-1 hover:text-white transition-colors">
              Company
              <svg
                className={`w-3 h-3 transition-transform duration-150 ${companyOpen ? "rotate-180" : ""}`}
                fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}
              >
                <path strokeLinecap="round" strokeLinejoin="round" d="m19 9-7 7-7-7" />
              </svg>
            </button>

            {companyOpen && (
              <div className="absolute top-full left-1/2 -translate-x-1/2 pt-3">
                <div className="w-56 rounded-xl border border-white/10 bg-[#09090b]/95 backdrop-blur-md shadow-xl overflow-hidden">
                  {companyLinks.map((item) => (
                    <Link
                      key={item.href}
                      href={item.href}
                      className="flex flex-col gap-0.5 px-4 py-3 hover:bg-white/5 transition-colors"
                    >
                      <span className="text-sm text-white/80 font-medium">{item.label}</span>
                      <span className="text-xs text-white/40">{item.description}</span>
                    </Link>
                  ))}
                </div>
              </div>
            )}
          </div>
        </nav>

        {/* Right — auth + mobile toggle */}
        <div className="flex items-center gap-3">
          {/* Desktop auth buttons */}
          <div className="hidden md:flex items-center gap-3">
            <SignedOut>
              <Button variant="ghost" size="sm" asChild>
                <Link href="/sign-in">Sign in</Link>
              </Button>
              <Button size="sm" asChild>
                <Link href="/sign-up">Start building</Link>
              </Button>
            </SignedOut>
            <SignedIn>
              <Button variant="ghost" size="sm" asChild>
                <Link href="/app">Dashboard</Link>
              </Button>
              <UserButton afterSignOutUrl="/" />
            </SignedIn>
          </div>

          {/* Mobile: signed-in avatar (always visible) */}
          <div className="md:hidden">
            <SignedIn>
              <UserButton afterSignOutUrl="/" />
            </SignedIn>
          </div>

          {/* Mobile hamburger */}
          <button
            className="md:hidden p-1.5 rounded-md text-white/60 hover:text-white hover:bg-white/5 transition-colors"
            onClick={() => setMobileOpen((v) => !v)}
            aria-label="Toggle menu"
          >
            {mobileOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </button>
        </div>

      </div>

      {/* Mobile menu panel */}
      {mobileOpen && (
        <div className="md:hidden border-t border-white/10 bg-[#09090b]/95 backdrop-blur-md">
          <nav className="flex flex-col px-4 py-3 gap-1">
            <Link
              href="/docs"
              className="px-3 py-2.5 rounded-md text-sm text-white/70 hover:text-white hover:bg-white/5 transition-colors"
              onClick={() => setMobileOpen(false)}
            >
              Docs
            </Link>
            <Link
              href="/pricing"
              className="px-3 py-2.5 rounded-md text-sm text-white/70 hover:text-white hover:bg-white/5 transition-colors"
              onClick={() => setMobileOpen(false)}
            >
              Pricing
            </Link>

            {/* Company section */}
            <div className="px-3 pt-3 pb-1">
              <p className="text-xs text-white/30 uppercase tracking-wider">Company</p>
            </div>
            {companyLinks.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className="px-3 py-2.5 rounded-md text-sm text-white/70 hover:text-white hover:bg-white/5 transition-colors"
                onClick={() => setMobileOpen(false)}
              >
                {item.label}
              </Link>
            ))}
          </nav>

          {/* Mobile auth buttons */}
          <SignedOut>
            <div className="flex items-center gap-3 px-4 py-3 border-t border-white/10">
              <Button variant="ghost" size="sm" className="flex-1" asChild>
                <Link href="/sign-in" onClick={() => setMobileOpen(false)}>Sign in</Link>
              </Button>
              <Button size="sm" className="flex-1" asChild>
                <Link href="/sign-up" onClick={() => setMobileOpen(false)}>Start building</Link>
              </Button>
            </div>
          </SignedOut>
          <SignedIn>
            <div className="flex items-center gap-3 px-4 py-3 border-t border-white/10">
              <Button size="sm" className="flex-1" asChild>
                <Link href="/app" onClick={() => setMobileOpen(false)}>Dashboard</Link>
              </Button>
            </div>
          </SignedIn>
        </div>
      )}
    </header>
  );
}
