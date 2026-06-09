import Link from "next/link";
import { Zap } from "lucide-react";

export default function Newsletter() {
  return (
    <div className="my-12 rounded-xl border border-white/15 bg-white/5 p-8 text-center">
      <Zap className="mx-auto h-8 w-8 text-white/70 mb-4" />
      <h3 className="text-xl font-semibold text-white mb-2">Stay in the loop</h3>
      <p className="text-sm text-white/60 mb-6 max-w-md mx-auto">
        Get tutorials, product updates, and tips on serverless infrastructure — delivered to your inbox.
      </p>
      <Link
        href="/sign-up"
        className="inline-flex items-center gap-2 rounded-lg bg-white px-6 py-2.5 text-sm font-semibold text-[#09090b] transition-opacity hover:opacity-90"
      >
        Sign up for free
      </Link>
    </div>
  );
}
