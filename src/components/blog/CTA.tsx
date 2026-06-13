import Link from "next/link";
import { ArrowRight } from "lucide-react";

export default function CTA({
  text = "",
  href = "#",
}: {
  text?: string;
  href?: string;
}) {
  // Defensive defaults: under next-mdx-remote v6 an expression-valued prop
  // (`href={"/x"}`) arrives as `undefined`, so `href.startsWith` would crash the
  // prerender and fail the whole deploy. Use quoted string attrs in MDX.
  const isExternal = href.startsWith("http");
  const className =
    "my-6 flex items-center justify-center gap-2 rounded-xl bg-white px-6 py-4 text-center font-semibold text-[#09090b] transition-opacity hover:opacity-90";

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
