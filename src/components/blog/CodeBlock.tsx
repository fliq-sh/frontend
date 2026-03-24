"use client";

import { useState, ReactNode } from "react";
import { Copy, Check } from "lucide-react";

function extractText(node: ReactNode): string {
  if (typeof node === "string") return node;
  if (typeof node === "number") return String(node);
  if (!node) return "";
  if (Array.isArray(node)) return node.map(extractText).join("");
  if (typeof node === "object" && node !== null && "props" in node) {
    const el = node as { props: { children?: ReactNode } };
    return extractText(el.props.children);
  }
  return "";
}

export default function CodeBlock({
  children,
  language,
}: {
  children: ReactNode;
  language?: string;
}) {
  const [copied, setCopied] = useState(false);

  const copy = () => {
    navigator.clipboard.writeText(extractText(children));
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="group relative rounded-xl border border-white/10 bg-black/60 overflow-hidden my-6">
      <div className="flex items-center justify-between px-4 py-2 border-b border-white/10 bg-white/[0.02]">
        <span className="text-xs text-white/30 font-mono">{language ?? ""}</span>
        <button
          onClick={copy}
          className="flex items-center gap-1.5 text-xs text-white/30 hover:text-white/60 transition-colors"
          aria-label="Copy code"
        >
          {copied ? (
            <Check className="h-3.5 w-3.5 text-green-400" />
          ) : (
            <Copy className="h-3.5 w-3.5" />
          )}
          {copied ? "Copied" : "Copy"}
        </button>
      </div>
      <div className="overflow-x-auto text-sm [&_pre]:p-4 [&_pre]:m-0 [&_pre]:bg-transparent">
        {children}
      </div>
    </div>
  );
}
