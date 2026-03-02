import Link from "next/link";

export default function Footer() {
  return (
    <footer className="border-t border-white/10 py-12 px-4">
      <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-6">
        <div>
          <span className="font-semibold">Fliq</span>
          <p className="mt-1 text-xs text-white/40">
            © {new Date().getFullYear()} Fliq. All rights reserved.
          </p>
        </div>
        <nav className="flex items-center gap-6 text-sm text-white/60">
          <Link href="#features" className="hover:text-white transition-colors">
            Docs
          </Link>
          <Link href="/pricing" className="hover:text-white transition-colors">
            Pricing
          </Link>
          <Link href="#" className="hover:text-white transition-colors">
            Privacy
          </Link>
          <Link href="#" className="hover:text-white transition-colors">
            Terms
          </Link>
        </nav>
      </div>
    </footer>
  );
}
