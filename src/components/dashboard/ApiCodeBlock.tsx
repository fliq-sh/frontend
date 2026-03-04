"use client";

import { useState } from "react";

type Lang = "curl" | "TypeScript" | "Go" | "Python";
const LANGS: Lang[] = ["curl", "TypeScript", "Go", "Python"];

export interface ApiSnippets {
  curl: string;
  TypeScript: string;
  Go: string;
  Python: string;
}

export function ApiCodeBlock({ snippets }: { snippets: ApiSnippets }) {
  const [active, setActive] = useState<Lang>("curl");

  return (
    <div className="rounded-lg border border-white/10 bg-black/40 overflow-hidden min-w-0">
      <div className="flex border-b border-white/10 bg-white/[0.02]">
        {LANGS.map((lang) => (
          <button
            key={lang}
            onClick={() => setActive(lang)}
            className={`px-3 py-2 text-xs font-medium transition-colors ${
              active === lang
                ? "text-white border-b-2 border-indigo-500"
                : "text-white/40 hover:text-white/60"
            }`}
          >
            {lang}
          </button>
        ))}
      </div>
      <pre className="p-4 text-xs text-white/70 font-mono leading-relaxed overflow-x-auto whitespace-pre">
        {snippets[active]}
      </pre>
    </div>
  );
}

export const JOB_SNIPPETS: ApiSnippets = {
  curl: `curl -X POST https://api.fliq.dev/jobs \\
  -H "Authorization: Bearer <your-token>" \\
  -H "Content-Type: application/json" \\
  -d '{
    "url": "https://yourapp.com/webhook",
    "http_method": "POST",
    "scheduled_at": "2026-04-01T09:00:00Z",
    "max_retries": 3
  }'`,

  TypeScript: `const res = await fetch("https://api.fliq.dev/jobs", {
  method: "POST",
  headers: {
    "Authorization": "Bearer <your-token>",
    "Content-Type": "application/json",
  },
  body: JSON.stringify({
    url: "https://yourapp.com/webhook",
    http_method: "POST",
    scheduled_at: "2026-04-01T09:00:00Z",
    max_retries: 3,
  }),
});
const job = await res.json();
console.log(job.id); // job created ✓`,

  Go: `body, _ := json.Marshal(map[string]any{
  "url":          "https://yourapp.com/webhook",
  "http_method":  "POST",
  "scheduled_at": "2026-04-01T09:00:00Z",
  "max_retries":  3,
})
req, _ := http.NewRequest("POST",
  "https://api.fliq.dev/jobs",
  bytes.NewBuffer(body))
req.Header.Set("Authorization", "Bearer <your-token>")
req.Header.Set("Content-Type", "application/json")

resp, _ := (&http.Client{}).Do(req)`,

  Python: `import httpx

res = httpx.post(
    "https://api.fliq.dev/jobs",
    headers={"Authorization": "Bearer <your-token>"},
    json={
        "url": "https://yourapp.com/webhook",
        "http_method": "POST",
        "scheduled_at": "2026-04-01T09:00:00Z",
        "max_retries": 3,
    },
)
job = res.json()
print(job["id"])  # job created ✓`,
};

export const SCHEDULE_SNIPPETS: ApiSnippets = {
  curl: `curl -X POST https://api.fliq.dev/schedules \\
  -H "Authorization: Bearer <your-token>" \\
  -H "Content-Type: application/json" \\
  -d '{
    "name": "Daily sync",
    "cron": "0 9 * * *",
    "url": "https://yourapp.com/webhook",
    "http_method": "POST",
    "max_retries": 3
  }'`,

  TypeScript: `const res = await fetch("https://api.fliq.dev/schedules", {
  method: "POST",
  headers: {
    "Authorization": "Bearer <your-token>",
    "Content-Type": "application/json",
  },
  body: JSON.stringify({
    name: "Daily sync",
    cron: "0 9 * * *",
    url: "https://yourapp.com/webhook",
    http_method: "POST",
    max_retries: 3,
  }),
});
const schedule = await res.json();
console.log(schedule.id); // schedule created ✓`,

  Go: `body, _ := json.Marshal(map[string]any{
  "name":        "Daily sync",
  "cron":        "0 9 * * *",
  "url":         "https://yourapp.com/webhook",
  "http_method": "POST",
  "max_retries": 3,
})
req, _ := http.NewRequest("POST",
  "https://api.fliq.dev/schedules",
  bytes.NewBuffer(body))
req.Header.Set("Authorization", "Bearer <your-token>")
req.Header.Set("Content-Type", "application/json")

resp, _ := (&http.Client{}).Do(req)`,

  Python: `import httpx

res = httpx.post(
    "https://api.fliq.dev/schedules",
    headers={"Authorization": "Bearer <your-token>"},
    json={
        "name": "Daily sync",
        "cron": "0 9 * * *",
        "url": "https://yourapp.com/webhook",
        "http_method": "POST",
        "max_retries": 3,
    },
)
schedule = res.json()
print(schedule["id"])  # schedule created ✓`,
};
