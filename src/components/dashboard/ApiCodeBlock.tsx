"use client";

import { useState } from "react";
import { Check, Copy } from "lucide-react";

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
  const [copied, setCopied] = useState(false);

  function handleCopy() {
    navigator.clipboard.writeText(snippets[active]);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }

  return (
    <div className="rounded-xl border border-black/10 bg-[#1b120b] overflow-hidden min-w-0">
      <div className="flex items-center border-b border-white/10 bg-white/[0.03]">
        <div className="flex flex-1">
          {LANGS.map((lang) => (
            <button
              key={lang}
              onClick={() => setActive(lang)}
              className={`px-3 py-2 text-xs font-medium transition-colors ${
                active === lang
                  ? "text-white border-b-2 border-[#ff7a1a]"
                  : "text-white/40 hover:text-white/60"
              }`}
            >
              {lang}
            </button>
          ))}
        </div>
        <button
          onClick={handleCopy}
          className="flex items-center gap-1.5 px-3 py-2 text-xs text-white/40 hover:text-white/70 transition-colors"
        >
          {copied ? (
            <>
              <Check className="h-3.5 w-3.5 text-green-400" />
              <span className="text-green-400">Copied</span>
            </>
          ) : (
            <>
              <Copy className="h-3.5 w-3.5" />
              <span className="hidden sm:inline">Copy</span>
            </>
          )}
        </button>
      </div>
      <pre className="p-4 text-xs text-white/70 font-mono leading-relaxed overflow-x-auto whitespace-pre">
        {snippets[active]}
      </pre>
    </div>
  );
}

export const JOB_SNIPPETS: ApiSnippets = {
  curl: `curl -X POST https://api.fliq.sh/jobs \\
  -H "Authorization: Bearer <your-token>" \\
  -H "Content-Type: application/json" \\
  -d '{
    "url": "https://yourapp.com/webhook",
    "http_method": "POST",
    "scheduled_at": "2026-04-01T09:00:00Z",
    "max_retries": 3
  }'`,

  TypeScript: `const res = await fetch("https://api.fliq.sh/jobs", {
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
  "https://api.fliq.sh/jobs",
  bytes.NewBuffer(body))
req.Header.Set("Authorization", "Bearer <your-token>")
req.Header.Set("Content-Type", "application/json")

resp, _ := (&http.Client{}).Do(req)`,

  Python: `import httpx

res = httpx.post(
    "https://api.fliq.sh/jobs",
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
  curl: `curl -X POST https://api.fliq.sh/schedules \\
  -H "Authorization: Bearer <your-token>" \\
  -H "Content-Type: application/json" \\
  -d '{
    "name": "Daily sync",
    "cron": "0 9 * * *",
    "url": "https://yourapp.com/webhook",
    "http_method": "POST",
    "max_retries": 3
  }'`,

  TypeScript: `const res = await fetch("https://api.fliq.sh/schedules", {
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
  "https://api.fliq.sh/schedules",
  bytes.NewBuffer(body))
req.Header.Set("Authorization", "Bearer <your-token>")
req.Header.Set("Content-Type", "application/json")

resp, _ := (&http.Client{}).Do(req)`,

  Python: `import httpx

res = httpx.post(
    "https://api.fliq.sh/schedules",
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

export const BUFFER_SNIPPETS: ApiSnippets = {
  curl: `# 1. Create a rate-limited buffer
curl -X POST https://api.fliq.sh/buffers \\
  -H "Authorization: Bearer <your-token>" \\
  -H "Content-Type: application/json" \\
  -d '{
    "name": "Stripe API",
    "url": "https://api.stripe.com/v1/charges",
    "method": "POST",
    "rate_limit": 25
  }'

# 2. Push items — Fliq releases them at rate_limit/sec
curl -X POST https://api.fliq.sh/buffers/<buffer-id>/items \\
  -H "Authorization: Bearer <your-token>" \\
  -d '{"amount": 1000, "currency": "usd"}'`,

  TypeScript: `// 1. Create a rate-limited buffer
const buffer = await fetch("https://api.fliq.sh/buffers", {
  method: "POST",
  headers: {
    "Authorization": "Bearer <your-token>",
    "Content-Type": "application/json",
  },
  body: JSON.stringify({
    name: "Stripe API",
    url: "https://api.stripe.com/v1/charges",
    method: "POST",
    rate_limit: 25, // requests per second
  }),
}).then((r) => r.json());

// 2. Push items — released at rate_limit/sec with 429 retries
await fetch(\`https://api.fliq.sh/buffers/\${buffer.id}/items\`, {
  method: "POST",
  headers: { "Authorization": "Bearer <your-token>" },
  body: JSON.stringify({ amount: 1000, currency: "usd" }),
});`,

  Go: `// 1. Create a rate-limited buffer
body, _ := json.Marshal(map[string]any{
  "name":       "Stripe API",
  "url":        "https://api.stripe.com/v1/charges",
  "method":     "POST",
  "rate_limit": 25,
})
req, _ := http.NewRequest("POST",
  "https://api.fliq.sh/buffers",
  bytes.NewBuffer(body))
req.Header.Set("Authorization", "Bearer <your-token>")
req.Header.Set("Content-Type", "application/json")
resp, _ := (&http.Client{}).Do(req)
// 2. POST items to /buffers/<id>/items to enqueue them.`,

  Python: `import httpx

# 1. Create a rate-limited buffer
buffer = httpx.post(
    "https://api.fliq.sh/buffers",
    headers={"Authorization": "Bearer <your-token>"},
    json={
        "name": "Stripe API",
        "url": "https://api.stripe.com/v1/charges",
        "method": "POST",
        "rate_limit": 25,  # requests per second
    },
).json()

# 2. Push items — released at rate_limit/sec
httpx.post(
    f"https://api.fliq.sh/buffers/{buffer['id']}/items",
    headers={"Authorization": "Bearer <your-token>"},
    json={"amount": 1000, "currency": "usd"},
)`,
};
