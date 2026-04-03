import { Metadata } from "next";
import {
  DocH1, DocLead, DocH2, DocH3, DocP, DocUL, DocLI, DocCode, DocPre, DocCallout, DocNextPrev,
} from "../DocsPage";

export const metadata: Metadata = { title: "Buffers" };

export default async function Buffers() {
  return (
    <article>
      <DocH1>Buffers</DocH1>
      <DocLead>
        A <strong>Buffer</strong> is a rate-limited HTTP request queue. Define a target
        endpoint once, push items into the buffer, and Fliq drains them at your configured
        rate — no infrastructure to manage.
      </DocLead>

      <DocH2>When to use buffers</DocH2>
      <DocP>
        Use buffers when you need to send many requests to the same endpoint without
        overwhelming it. Common use cases:
      </DocP>
      <DocUL>
        <DocLI>Draining a webhook backlog to a third-party API with rate limits</DocLI>
        <DocLI>Fanning out notifications to a single downstream service</DocLI>
        <DocLI>Batch-processing event payloads at a controlled pace</DocLI>
      </DocUL>

      <DocCallout type="info">
        Jobs and schedules are for <em>time-based</em> execution. Buffers are
        for <em>throughput-controlled</em> execution — items are processed as fast as the
        rate limit allows, not at a specific time.
      </DocCallout>

      <DocH2>Creating a buffer</DocH2>
      <DocP>
        A buffer stores the target URL, HTTP method, default headers, and rate limit.
        Every item pushed into the buffer inherits this configuration.
      </DocP>

      <DocH3>Fields</DocH3>
      <DocPre label="POST /buffers" lang="json">{`{
  "name":            string,   // required — unique per user (max 256 chars)
  "url":             string,   // required — the endpoint Fliq will call
  "method":          string,   // optional — GET | POST | PUT | PATCH | DELETE (default: POST)
  "headers":         object,   // optional — default headers for all items
  "timeout_seconds": number,   // optional — 1–3600 (default: 30)
  "rate_limit":      number,   // optional — items per drain cycle, 1–1000 (default: 10)
  "max_retries":     number,   // optional — 0–20 (default: 3)
  "backoff":         string,   // optional — "exponential" | "linear" (default: "exponential")
  "webhook_url":     string,   // optional — notified on item completion/failure
  "webhook_headers": object    // optional — headers for webhook calls
}`}</DocPre>

      <DocH3>Example</DocH3>
      <DocPre label="cURL" lang="bash">{`curl -X POST https://api.fliq.sh/buffers \\
  -H "Authorization: Bearer fliq_sk_..." \\
  -H "Content-Type: application/json" \\
  -d '{
    "name": "stripe-webhooks",
    "url": "https://api.example.com/webhooks/stripe",
    "method": "POST",
    "headers": { "Authorization": "Bearer sk_live_..." },
    "rate_limit": 5,
    "max_retries": 3,
    "backoff": "exponential"
  }'`}</DocPre>

      <DocH2>Pushing items</DocH2>
      <DocP>
        Each item represents a single HTTP request to be sent. Items inherit the
        buffer&apos;s URL, method, and headers — you only need to provide the body and any
        header overrides.
      </DocP>

      <DocH3>Fields</DocH3>
      <DocPre label="POST /buffers/:id/items" lang="json">{`{
  "body":    string,   // optional — request body
  "headers": object    // optional — merged with buffer defaults (item wins on conflict)
}`}</DocPre>

      <DocH3>Example</DocH3>
      <DocPre label="cURL" lang="bash">{`curl -X POST https://api.fliq.sh/buffers/BUFFER_ID/items \\
  -H "Authorization: Bearer fliq_sk_..." \\
  -H "Content-Type: application/json" \\
  -d '{
    "body": "{\\"event\\": \\"payment.completed\\", \\"amount\\": 4999}",
    "headers": { "X-Idempotency-Key": "pay_abc123" }
  }'`}</DocPre>

      <DocH2>How draining works</DocH2>
      <DocP>
        Fliq&apos;s scheduler polls for active buffers every second. On each cycle it
        claims up to <DocCode>rate_limit</DocCode> pending items per buffer and executes
        them sequentially. This guarantees your target endpoint never receives more
        than <DocCode>rate_limit</DocCode> requests per second.
      </DocP>

      <DocH3>Item lifecycle</DocH3>
      <DocUL>
        <DocLI><DocCode>pending</DocCode> — queued, waiting to be claimed</DocLI>
        <DocLI><DocCode>running</DocCode> — HTTP request in flight</DocLI>
        <DocLI><DocCode>completed</DocCode> — endpoint returned 2xx</DocLI>
        <DocLI><DocCode>failed</DocCode> — all retries exhausted without a 2xx</DocLI>
      </DocUL>

      <DocH3>Rate limit handling (429)</DocH3>
      <DocP>
        If the target endpoint returns <DocCode>429 Too Many Requests</DocCode>, Fliq
        reschedules the item using the <DocCode>Retry-After</DocCode> header (default: 60
        seconds). This does <strong>not</strong> count as a retry attempt — the item keeps
        its full retry budget.
      </DocP>

      <DocH3>Retries and backoff</DocH3>
      <DocP>
        Non-2xx responses (other than 429) consume a retry. The delay before the next
        attempt depends on the backoff strategy:
      </DocP>
      <DocUL>
        <DocLI>
          <strong>Exponential</strong> (default)
          — <DocCode>30s &times; 2^attempt</DocCode>, capped at 1 hour, with &plusmn;25% jitter
        </DocLI>
        <DocLI>
          <strong>Linear</strong>
          — <DocCode>30s &times; (attempt + 1)</DocCode>
        </DocLI>
      </DocUL>

      <DocH2>Pause and resume</DocH2>
      <DocP>
        You can pause a buffer to temporarily stop draining without losing queued items.
        New items can still be pushed while paused — they will be processed when you resume.
      </DocP>
      <DocPre label="Pause / Resume" lang="bash">{`# Pause
curl -X POST https://api.fliq.sh/buffers/BUFFER_ID/pause \\
  -H "Authorization: Bearer fliq_sk_..."

# Resume
curl -X POST https://api.fliq.sh/buffers/BUFFER_ID/resume \\
  -H "Authorization: Bearer fliq_sk_..."`}</DocPre>

      <DocH2>Monitoring items</DocH2>
      <DocP>
        List items to check their status, or fetch a single item for details including
        the HTTP status code and any error message.
      </DocP>
      <DocPre label="List items" lang="bash">{`# List all items (supports ?status=pending&limit=20&cursor=...)
curl https://api.fliq.sh/buffers/BUFFER_ID/items \\
  -H "Authorization: Bearer fliq_sk_..."

# Get a single item
curl https://api.fliq.sh/buffers/BUFFER_ID/items/ITEM_ID \\
  -H "Authorization: Bearer fliq_sk_..."`}</DocPre>

      <DocH2>Crash recovery</DocH2>
      <DocP>
        If a worker crashes mid-execution, the item&apos;s heartbeat stops updating. A
        background reaper detects stale items within 30 seconds and either reschedules
        them (if retries remain) or marks them as failed. No manual intervention needed.
      </DocP>

      <DocCallout type="info">
        Deleting a buffer removes all its items. This action cannot be undone.
      </DocCallout>

      <DocNextPrev
        prev={{ label: "Retries & Billing", href: "/docs/retries" }}
        next={{ label: "Webhook Signing", href: "/docs/signing" }}
      />
    </article>
  );
}
