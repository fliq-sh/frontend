import { Metadata } from "next";
import {
  DocH1, DocLead, DocH2, DocH3, DocP, DocUL, DocLI, DocCode, DocPre, DocCallout, DocNextPrev,
} from "../DocsPage";

export const metadata: Metadata = { title: "API Reference" };

export default function ApiReference() {
  return (
    <article>
      <DocH1>API Reference</DocH1>
      <DocLead>
        The Fliq API is a REST API. All requests are over HTTPS. Request and response
        bodies are JSON.
      </DocLead>

      <DocH2>Base URL</DocH2>
      <DocPre>{`https://api.fliq.dev/v1`}</DocPre>

      <DocH2>Authentication</DocH2>
      <DocP>
        Pass your API token in the <DocCode>Authorization</DocCode> header as a Bearer token.
        Generate tokens in <strong>Settings → API Tokens</strong>.
      </DocP>
      <DocPre label="Header">{`Authorization: Bearer fliq_sk_your_token`}</DocPre>
      <DocCallout type="warning">
        Never expose your token in client-side code or commit it to source control.
      </DocCallout>

      {/* ── Jobs ── */}
      <DocH2>Jobs</DocH2>

      <DocH3>Create a job</DocH3>
      <DocPre label="Request">{`POST /v1/jobs

{
  "url":             string,   // required
  "http_method":     string,   // optional — default "POST"
  "scheduled_at":    string,   // required — ISO 8601 UTC
  "headers":         object,   // optional
  "body":            string,   // optional
  "max_retries":     number,   // optional — default 0
  "idempotency_key": string    // optional
}`}</DocPre>
      <DocPre label="Response — 201 Created">{`{
  "id":           "job_01hx...",
  "url":          "https://yourapp.com/api/charge",
  "http_method":  "POST",
  "scheduled_at": "2026-04-01T09:00:00Z",
  "max_retries":  3,
  "status":       "scheduled",
  "created_at":   "2026-03-10T14:22:01Z"
}`}</DocPre>

      <DocH3>Get a job</DocH3>
      <DocPre label="Request">{`GET /v1/jobs/{job_id}`}</DocPre>
      <DocP>Returns the job object with current status and execution count.</DocP>

      <DocH3>List jobs</DocH3>
      <DocPre label="Request">{`GET /v1/jobs?status=scheduled&limit=50&cursor=...`}</DocPre>
      <DocUL>
        <DocLI><DocCode>status</DocCode> — filter by <DocCode>scheduled</DocCode> | <DocCode>success</DocCode> | <DocCode>failed</DocCode> | <DocCode>cancelled</DocCode></DocLI>
        <DocLI><DocCode>limit</DocCode> — max results per page (default 20, max 100)</DocLI>
        <DocLI><DocCode>cursor</DocCode> — pagination cursor from previous response</DocLI>
      </DocUL>

      <DocH3>Cancel a job</DocH3>
      <DocPre label="Request">{`DELETE /v1/jobs/{job_id}`}</DocPre>
      <DocP>
        Cancels a job that has not yet fired. Returns <DocCode>404</DocCode> if the job
        doesn&apos;t exist or <DocCode>409</DocCode> if it has already executed.
      </DocP>

      {/* ── Schedules ── */}
      <DocH2>Schedules</DocH2>

      <DocH3>Create a schedule</DocH3>
      <DocPre label="Request">{`POST /v1/schedules

{
  "url":          string,   // required
  "http_method":  string,   // optional — default "POST"
  "cron":         string,   // required — 5-part cron expression (UTC)
  "headers":      object,   // optional
  "body":         string,   // optional
  "max_retries":  number    // optional — default 0
}`}</DocPre>
      <DocPre label="Response — 201 Created">{`{
  "id":          "sched_01hx...",
  "url":         "https://yourapp.com/api/digest",
  "cron":        "0 8 * * 1-5",
  "status":      "active",
  "created_at":  "2026-03-10T14:22:01Z",
  "next_run_at": "2026-03-11T08:00:00Z"
}`}</DocPre>

      <DocH3>List schedules</DocH3>
      <DocPre label="Request">{`GET /v1/schedules?limit=50&cursor=...`}</DocPre>

      <DocH3>Delete a schedule</DocH3>
      <DocPre label="Request">{`DELETE /v1/schedules/{schedule_id}`}</DocPre>
      <DocP>
        Stops all future executions immediately. Already-queued executions for the current
        interval may still fire.
      </DocP>

      {/* ── Executions ── */}
      <DocH2>Executions</DocH2>

      <DocH3>List executions for a job</DocH3>
      <DocPre label="Request">{`GET /v1/jobs/{job_id}/executions`}</DocPre>
      <DocPre label="Response">{`{
  "executions": [
    {
      "id":           "exec_01hx...",
      "attempt_num":  1,
      "status":       "success",
      "status_code":  200,
      "duration_ms":  143,
      "executed_at":  "2026-04-01T09:00:00Z"
    }
  ]
}`}</DocPre>

      {/* ── Errors ── */}
      <DocH2>Errors</DocH2>
      <DocP>
        All error responses follow the same shape:
      </DocP>
      <DocPre>{`{
  "error": {
    "code":    "invalid_scheduled_at",
    "message": "scheduled_at must be in the future"
  }
}`}</DocPre>

      <DocUL>
        <DocLI><DocCode>400</DocCode> — invalid request body or parameters</DocLI>
        <DocLI><DocCode>401</DocCode> — missing or invalid API token</DocLI>
        <DocLI><DocCode>403</DocCode> — action not allowed on this resource</DocLI>
        <DocLI><DocCode>404</DocCode> — resource not found</DocLI>
        <DocLI><DocCode>409</DocCode> — conflict (e.g. cancelling an already-executed job)</DocLI>
        <DocLI><DocCode>429</DocCode> — daily execution limit reached (free tier)</DocLI>
        <DocLI><DocCode>500</DocCode> — something went wrong on our end</DocLI>
      </DocUL>

      <DocNextPrev prev={{ label: "Retries & Billing", href: "/docs/retries" }} />
    </article>
  );
}
