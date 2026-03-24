import Link from "next/link";
import { Zap } from "lucide-react";

export default function Newsletter() {
  return (
    <div className="my-12 rounded-xl border border-indigo-500/20 bg-indigo-500/5 p-8 text-center">
      <Zap className="mx-auto h-8 w-8 text-indigo-400 mb-4" />
      <h3 className="text-xl font-semibold text-white mb-2">Stay in the loop</h3>
      <p className="text-sm text-white/60 mb-6 max-w-md mx-auto">
        Get tutorials, product updates, and tips on serverless infrastructure — delivered to your inbox.
      </p>
      <Link
        href="/sign-up"
        className="inline-flex items-center gap-2 rounded-lg bg-indigo-600 px-6 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-indigo-500"
      >
        Sign up for free
      </Link>
    </div>
  );
}
