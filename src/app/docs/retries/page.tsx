import { Metadata } from "next";
import {
  DocH1, DocLead, DocH2, DocH3, DocP, DocUL, DocLI, DocCode, DocPre, DocCallout, DocNextPrev,
} from "../DocsPage";

export const metadata: Metadata = { title: "Retries & Billing" };

export default function RetriesAndBilling() {
  return (
    <article>
      <DocH1>Retries &amp; Billing</DocH1>
      <DocLead>
        Fliq retries failed jobs automatically. Each attempt — original or retry — counts
        as one execution toward your billing usage.
      </DocLead>

      <DocH2>How retries work</DocH2>
      <DocP>
        When a job execution fails (non-2xx response, timeout, or connection error), Fliq
        schedules a retry with exponential backoff. The retry delay roughly doubles after
        each attempt.
      </DocP>
      <DocPre>{`Attempt 1  — fires at scheduled_at
Attempt 2  — ~30s after attempt 1 fails
Attempt 3  — ~60s after attempt 2 fails
Attempt 4  — ~120s after attempt 3 fails
...`}</DocPre>

      <DocH3>What triggers a retry</DocH3>
      <DocUL>
        <DocLI>Your endpoint returns a non-2xx HTTP status (4xx and 5xx)</DocLI>
        <DocLI>The connection times out (30s limit per attempt)</DocLI>
        <DocLI>A network-level error prevents delivery</DocLI>
      </DocUL>

      <DocCallout type="info">
        A 2xx response from your endpoint always stops retries, regardless of the
        response body.
      </DocCallout>

      <DocH3>Configuring max retries</DocH3>
      <DocP>
        Set <DocCode>max_retries</DocCode> on a job or schedule. If not set, the default
        is <DocCode>0</DocCode> (no retries — fail on first unsuccessful attempt).
      </DocP>
      <DocPre>{`Free plan:    0 – 3 retries per job
Growth plan:  0 – 10 retries per job
Enterprise:   custom limit`}</DocPre>

      <DocH2>Billing</DocH2>
      <DocP>
        Every execution attempt is one billable execution — including retries.
        If a job fires and retries 3 times before succeeding, that&apos;s
        4 executions billed.
      </DocP>

      <DocH3>Example</DocH3>
      <DocPre>{`Job: max_retries = 3

Attempt 1 → 503 Service Unavailable  → 1 execution billed
Attempt 2 → 503 Service Unavailable  → 1 execution billed
Attempt 3 → 200 OK                   → 1 execution billed

Total: 3 executions`}</DocPre>

      <DocH3>Pricing</DocH3>
      <DocUL>
        <DocLI>
          <strong>Beta (free):</strong> 100,000 credits per day. Resets at midnight UTC.
          When the limit is hit, new job creation is rejected and pending jobs fail until reset.
        </DocLI>
        <DocLI>
          <strong>Growth:</strong> Coming soon. $1 per 100,000 executions with no daily cap.
        </DocLI>
        <DocLI>
          <strong>Enterprise:</strong> Coming soon. Custom pricing.
        </DocLI>
      </DocUL>

      <DocCallout type="warning">
        On the free tier, once your daily execution limit is reached, Fliq will{" "}
        <strong>reject new job and schedule creation requests</strong> and{" "}
        <strong>fail any pending executions</strong> until midnight UTC reset.
        Plan your retry limits accordingly.
      </DocCallout>

      <DocH2>Designing for retries</DocH2>
      <DocP>
        Since your endpoint may be called multiple times, make it idempotent where possible —
        i.e. calling it twice with the same input should produce the same result without
        side effects. A good pattern is to include the Fliq job ID in your request body or
        headers and deduplicate on your side.
      </DocP>

      <DocNextPrev
        prev={{ label: "Jobs & Schedules", href: "/docs/jobs-and-schedules" }}
        next={{ label: "API Reference", href: "/docs/api-reference" }}
      />
    </article>
  );
}
