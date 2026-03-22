import { Metadata } from "next";
import {
  DocH1, DocLead, DocH2, DocH3, DocP, DocUL, DocLI, DocCode, DocCallout, DocNextPrev,
} from "./DocsPage";

export const metadata: Metadata = { title: "What is Fliq?" };

export default function DocsIndex() {
  return (
    <article>
      <DocH1>What is Fliq?</DocH1>
      <DocLead>
        Fliq is a serverless HTTP workflow platform. You give it a URL and a time — it fires the request,
        retries on failure, and keeps a full execution history.
      </DocLead>

      <DocH2>The problem it solves</DocH2>
      <DocP>
        Most backend applications eventually need to do something at a specific time: send a
        reminder 24 hours after signup, charge a card on a contract start date, sync data every
        hour. The usual answers — cron jobs, worker queues, background threads — all require
        infrastructure to run, monitor, and recover from failures.
      </DocP>
      <DocP>
        Fliq replaces that entire layer with a single API call. You POST a job, we handle
        delivery, retries, and logging.
      </DocP>

      <DocH2>Core concepts</DocH2>

      <DocH3>Job</DocH3>
      <DocP>
        A one-time HTTP request fired at a specific moment. You provide a <DocCode>url</DocCode>,
        an optional <DocCode>http_method</DocCode>, a <DocCode>scheduled_at</DocCode> timestamp,
        and optionally headers, a body, and a retry limit.
      </DocP>

      <DocH3>Schedule</DocH3>
      <DocP>
        A recurring rule that creates a new job execution at each interval. Schedules use standard
        5-part cron expressions (<DocCode>0 9 * * 1-5</DocCode> = 9 AM every weekday).
      </DocP>

      <DocH3>Execution</DocH3>
      <DocP>
        Each HTTP attempt — the original fire or a retry — is one execution. Executions are
        logged with the HTTP status code, response time, and any error. Every execution counts
        toward your billing usage.
      </DocP>

      <DocH2>How Fliq executes your jobs</DocH2>
      <DocUL>
        <DocLI>
          At the scheduled time, Fliq dispatches the HTTP request from the edge region
          geographically closest to your endpoint.
        </DocLI>
        <DocLI>
          If your endpoint returns a non-2xx status or times out, Fliq retries automatically
          with exponential backoff up to your configured <DocCode>max_retries</DocCode> limit.
        </DocLI>
        <DocLI>
          Every attempt is recorded — status code, duration, error — and available via the
          dashboard and API for up to 7 days (free) or 1 year (Growth).
        </DocLI>
      </DocUL>

      <DocCallout type="info">
        Fliq calls <em>your</em> existing HTTP endpoints. No SDK to install, no agent to deploy.
        If it accepts a POST today, it works with Fliq today.
      </DocCallout>

      <DocH2>What Fliq is not</DocH2>
      <DocUL>
        <DocLI>
          <strong>Not a message queue.</strong> Fliq fires HTTP requests on a schedule — it
          doesn&apos;t buffer or fan out messages to multiple consumers.
        </DocLI>
        <DocLI>
          <strong>Not a workflow engine.</strong> Jobs are independent; there&apos;s no
          built-in DAG or step sequencing.
        </DocLI>
        <DocLI>
          <strong>Not a monitoring service.</strong> Execution logs are for your records;
          Fliq doesn&apos;t alert on failures (yet).
        </DocLI>
      </DocUL>

      <DocNextPrev next={{ label: "Quickstart", href: "/docs/getting-started" }} />
    </article>
  );
}
