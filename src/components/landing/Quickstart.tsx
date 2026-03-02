"use client";

import { useState } from "react";

const tabs = ["HTTP", "Node.js", "Python", "curl"] as const;
type Tab = typeof tabs[number];

const snippets: Record<Tab, string> = {
  HTTP: `POST https://api.fliq.dev/jobs
Authorization: Bearer <your-token>
Content-Type: application/json

{
  "url": "https://yourapp.com/api/charge",
  "http_method": "POST",
  "scheduled_at": "2026-04-01T00:00:00Z",
  "max_retries": 3
}`,
  "Node.js": `const res = await fetch("https://api.fliq.dev/jobs", {
  method: "POST",
  headers: {
    "Authorization": "Bearer <your-token>",
    "Content-Type": "application/json",
  },
  body: JSON.stringify({
    url: "https://yourapp.com/api/charge",
    http_method: "POST",
    scheduled_at: "2026-04-01T00:00:00Z",
    max_retries: 3,
  }),
});
const job = await res.json();
console.log(job.id); // job created ✓`,
  Python: `import httpx

res = httpx.post(
    "https://api.fliq.dev/jobs",
    headers={"Authorization": "Bearer <your-token>"},
    json={
        "url": "https://yourapp.com/api/charge",
        "http_method": "POST",
        "scheduled_at": "2026-04-01T00:00:00Z",
        "max_retries": 3,
    },
)
job = res.json()
print(job["id"])  # job created ✓`,
  curl: `curl -X POST https://api.fliq.dev/jobs \\
  -H "Authorization: Bearer <your-token>" \\
  -H "Content-Type: application/json" \\
  -d '{
    "url": "https://yourapp.com/api/charge",
    "http_method": "POST",
    "scheduled_at": "2026-04-01T00:00:00Z",
    "max_retries": 3
  }'`,
};

export default function Quickstart() {
  const [activeTab, setActiveTab] = useState<Tab>("HTTP");

  return (
    <section className="py-24 px-4 border-t border-white/10">
      <div className="max-w-7xl mx-auto">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-start">
          {/* Left: copy */}
          <div className="lg:pt-8">
            <p className="text-xs text-white/40 uppercase tracking-widest mb-4">
              Quickstart
            </p>
            <h2 className="text-3xl font-bold tracking-tight mb-4">
              From idea to scheduled in 30 seconds
            </h2>
            <p className="text-white/60 leading-relaxed mb-6">
              That&apos;s it. No queue to manage, no worker to scale, no
              infrastructure to babysit.
            </p>
            <ul className="space-y-2 text-sm text-white/60">
              <li className="flex gap-2">
                <span className="text-green-400">✓</span> Works with any HTTP
                endpoint
              </li>
              <li className="flex gap-2">
                <span className="text-green-400">✓</span> JSON response with job
                ID instantly
              </li>
              <li className="flex gap-2">
                <span className="text-green-400">✓</span> Cancel or update
                anytime before fire time
              </li>
            </ul>
          </div>

          {/* Right: terminal card */}
          <div className="rounded-2xl border border-white/10 bg-black/60 overflow-hidden">
            {/* Tab bar */}
            <div className="flex border-b border-white/10 bg-white/[0.02]">
              {tabs.map((tab) => (
                <button
                  key={tab}
                  onClick={() => setActiveTab(tab)}
                  className={`px-4 py-2.5 text-xs font-medium transition-colors ${
                    activeTab === tab
                      ? "text-white border-b-2 border-indigo-500"
                      : "text-white/40 hover:text-white/60"
                  }`}
                >
                  {tab}
                </button>
              ))}
            </div>

            {/* Code */}
            <pre className="p-6 text-xs text-white/70 font-mono leading-relaxed overflow-x-auto whitespace-pre">
              {snippets[activeTab]}
            </pre>
          </div>
        </div>
      </div>
    </section>
  );
}
