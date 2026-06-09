import { highlight } from "@/lib/highlight";
import QuickstartCode from "./QuickstartCode";

const snippets = {
  HTTP: {
    code: `POST https://api.fliq.sh/jobs
Authorization: Bearer <your-token>
Content-Type: application/json

{
  "url": "https://yourapp.com/api/charge",
  "http_method": "POST",
  "scheduled_at": "2026-04-01T00:00:00Z",
  "max_retries": 3
}`,
    lang: "http" as const,
  },
  "Node.js": {
    code: `const res = await fetch("https://api.fliq.sh/jobs", {
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
console.log(job.id); // job created`,
    lang: "javascript" as const,
  },
  Python: {
    code: `import httpx

res = httpx.post(
    "https://api.fliq.sh/jobs",
    headers={"Authorization": "Bearer <your-token>"},
    json={
        "url": "https://yourapp.com/api/charge",
        "http_method": "POST",
        "scheduled_at": "2026-04-01T00:00:00Z",
        "max_retries": 3,
    },
)
job = res.json()
print(job["id"])  # job created`,
    lang: "python" as const,
  },
  curl: {
    code: `curl -X POST https://api.fliq.sh/jobs \\
  -H "Authorization: Bearer <your-token>" \\
  -H "Content-Type: application/json" \\
  -d '{
    "url": "https://yourapp.com/api/charge",
    "http_method": "POST",
    "scheduled_at": "2026-04-01T00:00:00Z",
    "max_retries": 3
  }'`,
    lang: "bash" as const,
  },
};

export default async function Quickstart() {
  const [httpHtml, nodeHtml, pythonHtml, curlHtml] = await Promise.all([
    highlight(snippets.HTTP.code, snippets.HTTP.lang),
    highlight(snippets["Node.js"].code, snippets["Node.js"].lang),
    highlight(snippets.Python.code, snippets.Python.lang),
    highlight(snippets.curl.code, snippets.curl.lang),
  ]);

  const highlighted = {
    HTTP: httpHtml,
    "Node.js": nodeHtml,
    Python: pythonHtml,
    curl: curlHtml,
  };

  const raw = {
    HTTP: snippets.HTTP.code,
    "Node.js": snippets["Node.js"].code,
    Python: snippets.Python.code,
    curl: snippets.curl.code,
  };

  return (
    <section className="section-tight px-4 border-t border-white/10">
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
          <QuickstartCode highlighted={highlighted} raw={raw} />
        </div>
      </div>
    </section>
  );
}
