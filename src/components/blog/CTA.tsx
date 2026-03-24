import Link from "next/link";
import { ArrowRight } from "lucide-react";

export default function CTA({ text, href }: { text: string; href: string }) {
  const isExternal = href.startsWith("http");
  const className =
    "my-6 flex items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-indigo-600 to-indigo-500 px-6 py-4 text-center font-semibold text-white transition-opacity hover:opacity-90";

  if (isExternal) {
    return (
      <a href={href} target="_blank" rel="noopener noreferrer" className={className}>
        {text}
        <ArrowRight className="h-4 w-4" />
      </a>
    );
  }

  return (
    <Link href={href} className={className}>
      {text}
      <ArrowRight className="h-4 w-4" />
    </Link>
  );
}
