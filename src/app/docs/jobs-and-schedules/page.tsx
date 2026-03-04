import { Metadata } from "next";
import {
  DocH1, DocLead, DocH2, DocH3, DocP, DocUL, DocLI, DocCode, DocPre, DocCallout, DocNextPrev,
} from "../DocsPage";

export const metadata: Metadata = { title: "Jobs & Schedules" };

export default function JobsAndSchedules() {
  return (
    <article>
      <DocH1>Jobs &amp; Schedules</DocH1>
      <DocLead>
        Fliq has two primitives: <strong>Jobs</strong> for one-time executions and{" "}
        <strong>Schedules</strong> for recurring ones. The API shape is nearly identical.
      </DocLead>

      <DocH2>Jobs — one-time executions</DocH2>
      <DocP>
        A job fires exactly once at the time you specify. Use jobs when a specific event in
        your system triggers a future action: charge a card on a start date, send a follow-up
        email 48 hours after signup, expire a trial.
      </DocP>

      <DocH3>Fields</DocH3>
      <DocPre label="POST /v1/jobs">{`{
  "url":           string,   // required — the endpoint Fliq will call
  "http_method":   string,   // optional — GET | POST | PUT | PATCH | DELETE (default: POST)
  "scheduled_at":  string,   // required — ISO 8601 UTC timestamp
  "headers":       object,   // optional — forwarded verbatim to your endpoint
  "body":          string,   // optional — raw string body
  "max_retries":   number,   // optional — 0–3 on Free, 0–10 on Growth (default: 0)
  "idempotency_key": string  // optional — prevents duplicate jobs on retry of this API call
}`}</DocPre>

      <DocCallout type="info">
        <DocCode>scheduled_at</DocCode> must be in the future. Minimum lead time is a few
        seconds to allow for propagation.
      </DocCallout>

      <DocH3>Job lifecycle</DocH3>
      <DocUL>
        <DocLI><DocCode>scheduled</DocCode> — waiting to fire</DocLI>
        <DocLI><DocCode>running</DocCode> — HTTP request in flight</DocLI>
        <DocLI><DocCode>success</DocCode> — endpoint returned 2xx</DocLI>
        <DocLI><DocCode>failed</DocCode> — all retries exhausted without a 2xx</DocLI>
        <DocLI><DocCode>cancelled</DocCode> — cancelled before firing</DocLI>
      </DocUL>

      <DocH2>Schedules — recurring executions</DocH2>
      <DocP>
        A schedule creates a new execution at each interval defined by a cron expression.
        It runs indefinitely until you delete it.
      </DocP>

      <DocH3>Fields</DocH3>
      <DocPre label="POST /v1/schedules">{`{
  "url":          string,   // required
  "http_method":  string,   // optional (default: POST)
  "cron":         string,   // required — 5-part cron expression (UTC)
  "headers":      object,   // optional
  "body":         string,   // optional
  "max_retries":  number    // optional
}`}</DocPre>

      <DocH3>Cron syntax</DocH3>
      <DocP>
        Fliq uses standard 5-part cron expressions. All times are UTC.
      </DocP>
      <DocPre>{`┌─ minute (0–59)
│  ┌─ hour (0–23)
│  │  ┌─ day of month (1–31)
│  │  │  ┌─ month (1–12)
│  │  │  │  ┌─ day of week (0–7, 0 and 7 = Sunday)
│  │  │  │  │
*  *  *  *  *`}</DocPre>

      <DocH3>Common expressions</DocH3>
      <DocPre>{`0 9 * * 1-5     Every weekday at 9 AM UTC
*/15 * * * *    Every 15 minutes
0 0 1 * *       First day of every month at midnight
0 8 * * 1       Every Monday at 8 AM UTC`}</DocPre>

      <DocH2>Idempotency</DocH2>
      <DocP>
        If your server retries the API call before receiving a response, you could end up
        with duplicate jobs. Pass an <DocCode>idempotency_key</DocCode> (any unique string —
        a UUID works) to guarantee the job is only created once, even if the request is
        sent multiple times.
      </DocP>

      <DocNextPrev
        prev={{ label: "Quickstart", href: "/docs/getting-started" }}
        next={{ label: "Retries & Billing", href: "/docs/retries" }}
      />
    </article>
  );
}
