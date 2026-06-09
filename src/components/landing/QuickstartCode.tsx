"use client";

import { useState } from "react";

const tabs = ["HTTP", "Node.js", "Python", "curl"] as const;
type Tab = (typeof tabs)[number];

interface QuickstartCodeProps {
  /** Pre-rendered HTML per tab (from Shiki on the server). */
  highlighted: Record<Tab, string>;
  /** Raw text per tab (for clipboard copy). */
  raw: Record<Tab, string>;
}

export default function QuickstartCode({ highlighted, raw }: QuickstartCodeProps) {
  const [activeTab, setActiveTab] = useState<Tab>("HTTP");

  return (
    <div className="rounded-2xl border border-white/10 bg-black/60 overflow-hidden">
      {/* Tab bar */}
      <div className="flex border-b border-white/10 bg-white/[0.02]">
        {tabs.map((tab) => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={`px-4 py-2.5 text-xs font-medium transition-colors ${
              activeTab === tab
                ? "text-white border-b-2 border-white"
                : "text-white/40 hover:text-white/60"
            }`}
          >
            {tab}
          </button>
        ))}
      </div>

      {/* Code — pre-highlighted HTML from Shiki */}
      {tabs.map((tab) => (
        <div
          key={tab}
          className={`text-xs font-mono leading-relaxed overflow-x-auto [&_pre]:p-6 [&_pre]:m-0 [&_pre]:bg-transparent ${
            activeTab === tab ? "" : "hidden"
          }`}
          dangerouslySetInnerHTML={{ __html: highlighted[tab] }}
        />
      ))}
    </div>
  );
}
