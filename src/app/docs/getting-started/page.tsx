import { Metadata } from "next";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  DocH1, DocLead, DocH2, DocH3, DocP, DocUL, DocLI, DocCode, DocPre, DocCallout, DocNextPrev,
} from "../DocsPage";

export const metadata: Metadata = { title: "Quickstart" };

export default function GettingStarted() {
  return (
    <article>
      <DocH1>Quickstart</DocH1>
      <DocLead>
        Schedule your first HTTP job in under 5 minutes. No SDK, no config files —
        just a single API call.
      </DocLead>

      <DocH2>1. Create an account</DocH2>
      <DocP>
        Sign up at <DocCode>fliq.dev/sign-up</DocCode>. The free tier gives you 5,000 executions
        per day — no credit card required.
      </DocP>

      <DocH2>2. Get your API token</DocH2>
      <DocP>
        In the dashboard, go to <strong>Settings → API Tokens</strong> and create a new token.
        Tokens look like <DocCode>fliq_sk_...</DocCode>. Store it somewhere safe — it won&apos;t
        be shown again.
      </DocP>
      <DocCallout type="warning">
        Treat your API token like a password. Never commit it to source control or expose it
        client-side.
      </DocCallout>

      <DocH2>3. Schedule a job</DocH2>
      <DocP>
        POST to <DocCode>/v1/jobs</DocCode> with a URL and a fire time. All timestamps are
        ISO 8601 in UTC.
      </DocP>

      <Tabs defaultValue="curl" className="my-5">
        <TabsList className="bg-white/5 border border-white/10">
          <TabsTrigger value="curl">curl</TabsTrigger>
          <TabsTrigger value="http">HTTP</TabsTrigger>
          <TabsTrigger value="node">Node.js</TabsTrigger>
        </TabsList>
        <TabsContent value="curl">
          <DocPre>{`curl -X POST https://api.fliq.dev/v1/jobs \\
  -H "Authorization: Bearer fliq_sk_your_token" \\
  -H "Content-Type: application/json" \\
  -d '{
    "url": "https://yourapp.com/api/send-invoice",
    "http_method": "POST",
    "scheduled_at": "2026-04-01T09:00:00Z",
    "max_retries": 3
  }'`}</DocPre>
        </TabsContent>
        <TabsContent value="http">
          <DocPre>{`POST https://api.fliq.dev/v1/jobs
Authorization: Bearer fliq_sk_your_token
Content-Type: application/json

{
  "url": "https://yourapp.com/api/send-invoice",
  "http_method": "POST",
  "scheduled_at": "2026-04-01T09:00:00Z",
  "max_retries": 3
}`}</DocPre>
        </TabsContent>
        <TabsContent value="node">
          <DocPre>{`const res = await fetch("https://api.fliq.dev/v1/jobs", {
  method: "POST",
  headers: {
    "Authorization": "Bearer fliq_sk_your_token",
    "Content-Type": "application/json",
  },
  body: JSON.stringify({
    url: "https://yourapp.com/api/send-invoice",
    http_method: "POST",
    scheduled_at: "2026-04-01T09:00:00Z",
    max_retries: 3,
  }),
});

const job = await res.json();
console.log(job.id); // save this if you want to cancel later`}</DocPre>
        </TabsContent>
      </Tabs>

      <DocP>
        A successful response returns <DocCode>201 Created</DocCode> with a job object including
        an <DocCode>id</DocCode> you can use to check status or cancel.
      </DocP>

      <DocH2>4. Verify in the dashboard</DocH2>
      <DocP>
        Open the dashboard and navigate to <strong>Jobs</strong>. Your job will appear with
        status <DocCode>scheduled</DocCode>. Once it fires, the status updates to{" "}
        <DocCode>success</DocCode> or <DocCode>failed</DocCode>, and the execution log shows
        the HTTP response.
      </DocP>

      <DocH2>5. Cancel a job (optional)</DocH2>
      <DocP>
        If the fire time hasn&apos;t passed yet, you can cancel by sending a DELETE request.
      </DocP>
      <DocPre label="curl">{`curl -X DELETE https://api.fliq.dev/v1/jobs/{job_id} \\
  -H "Authorization: Bearer fliq_sk_your_token"`}</DocPre>

      <DocH2>Next steps</DocH2>
      <DocUL>
        <DocLI>
          Set up a <strong>recurring schedule</strong> with a cron expression — see{" "}
          <DocCode>Jobs &amp; Schedules</DocCode>.
        </DocLI>
        <DocLI>
          Understand how retries affect your billing — see{" "}
          <DocCode>Retries &amp; Billing</DocCode>.
        </DocLI>
        <DocLI>
          See all available fields and endpoints in the <DocCode>API Reference</DocCode>.
        </DocLI>
      </DocUL>

      <DocNextPrev
        prev={{ label: "What is Fliq?", href: "/docs" }}
        next={{ label: "Jobs & Schedules", href: "/docs/jobs-and-schedules" }}
      />
    </article>
  );
}
