"use client";

import { useState, useEffect } from "react";
import { useParams } from "next/navigation";
import { differenceInSeconds, format } from "date-fns";
import { useApi, createJobsApi, Job, JobAttempt } from "@/lib/api";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { ArrowLeft, ChevronDown, Copy, Check } from "lucide-react";
import Link from "next/link";

function tryPrettyJson(value: string): string {
  try {
    return JSON.stringify(JSON.parse(value), null, 2);
  } catch {
    return value;
  }
}

function CollapsibleSection({
  title,
  defaultOpen = false,
  children,
}: {
  title: string;
  defaultOpen?: boolean;
  children: React.ReactNode;
}) {
  const [open, setOpen] = useState(defaultOpen);
  return (
    <div className="border border-foreground/10 rounded-md overflow-hidden">
      <button
        type="button"
        className="w-full flex items-center justify-between px-3 py-2 text-xs font-medium text-foreground/68 hover:text-foreground/80 hover:bg-foreground/[0.03] transition-colors"
        onClick={() => setOpen((v) => !v)}
      >
        <span>{title}</span>
        <ChevronDown className={`h-3.5 w-3.5 transition-transform ${open ? "rotate-180" : ""}`} />
      </button>
      {open && (
        <div className="border-t border-foreground/10 bg-foreground/[0.02] px-3 py-2.5 max-h-80 overflow-y-auto">
          {children}
        </div>
      )}
    </div>
  );
}

function CopyLinkButton() {
  const [copied, setCopied] = useState(false);

  function handleCopy() {
    navigator.clipboard.writeText(window.location.href);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }

  return (
    <Button
      size="sm"
      variant="ghost"
      className="text-foreground/60 hover:text-foreground/80 gap-1.5"
      onClick={handleCopy}
    >
      {copied ? <Check className="h-3.5 w-3.5" /> : <Copy className="h-3.5 w-3.5" />}
      {copied ? "Copied" : "Copy link"}
    </Button>
  );
}

export default function AttemptDetailPage() {
  const params = useParams<{ jobId: string; attemptId: string }>();
  const { apiFetch } = useApi();
  const api = createJobsApi(apiFetch);

  const [job, setJob] = useState<Job | null>(null);
  const [attempt, setAttempt] = useState<JobAttempt | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function load() {
      setLoading(true);
      try {
        const [jobData, attempts] = await Promise.all([
          api.get(params.jobId),
          api.listAttempts(params.jobId),
        ]);
        setJob(jobData);
        const found = attempts?.find((a) => a.id === params.attemptId);
        if (!found) {
          setError("Attempt not found");
        } else {
          setAttempt(found);
        }
      } catch (err) {
        setError(err instanceof Error ? err.message : "Failed to load attempt");
      } finally {
        setLoading(false);
      }
    }
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [params.jobId, params.attemptId]);

  if (loading) {
    return (
      <div className="max-w-2xl mx-auto flex flex-col gap-8">
        <Skeleton className="h-6 w-48" />
        <Skeleton className="h-40 w-full" />
        <Skeleton className="h-32 w-full" />
      </div>
    );
  }

  if (error || !job || !attempt) {
    return (
      <div className="max-w-2xl mx-auto flex flex-col gap-4">
        <Link href="/app/jobs" className="text-sm text-foreground/60 hover:text-foreground/75 flex items-center gap-1">
          <ArrowLeft className="h-3.5 w-3.5" />
          Back to Jobs
        </Link>
        <div className="rounded-md border border-red-500/30 bg-red-500/10 px-4 py-3 text-sm text-red-400">
          {error ?? "Not found"}
        </div>
      </div>
    );
  }

  const duration = attempt.completed_at
    ? `${differenceInSeconds(new Date(attempt.completed_at), new Date(attempt.started_at))}s`
    : "in progress";

  const isSuccess = !!attempt.status_code && attempt.status_code >= 200 && attempt.status_code < 300;
  const statusColorClass = isSuccess
    ? "border-green-500/40 bg-green-500/10 text-green-400"
    : "border-red-500/40 bg-red-500/10 text-red-400";

  const prettyBody = job.body ? tryPrettyJson(job.body) : null;
  const prettyHeaders = job.headers ? JSON.stringify(job.headers, null, 2) : null;

  return (
    <div className="max-w-2xl mx-auto flex flex-col gap-8">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Link href="/app/jobs" className="text-foreground/60 hover:text-foreground/75 transition-colors">
            <ArrowLeft className="h-4 w-4" />
          </Link>
          <h1 className="text-lg font-semibold">
            Attempt <span className="font-mono text-foreground/68">#{attempt.attempt_num}</span>
          </h1>
        </div>
        <CopyLinkButton />
      </div>

      {/* Request */}
      <section className="rounded-lg border border-foreground/10 bg-foreground/[0.02] p-5 flex flex-col gap-3">
        <p className="text-[11px] font-medium uppercase tracking-wider text-foreground/50">Request</p>
        <div className="flex items-center gap-2">
          <span className="text-[10px] font-mono font-bold text-foreground/85 bg-foreground/10 border border-foreground/20 rounded px-1.5 py-0.5">
            {job.method}
          </span>
          <span className="text-sm font-mono text-foreground/80 break-all">{job.url}</span>
        </div>

        {prettyHeaders && (
          <CollapsibleSection title="Headers">
            <pre className="text-[11px] font-mono text-foreground/75 whitespace-pre-wrap break-all leading-relaxed">
              {prettyHeaders}
            </pre>
          </CollapsibleSection>
        )}

        {prettyBody && (
          <CollapsibleSection title="Body">
            <pre className="text-[11px] font-mono text-foreground/75 whitespace-pre-wrap break-all leading-relaxed">
              {prettyBody}
            </pre>
          </CollapsibleSection>
        )}
      </section>

      {/* Response */}
      <section className="rounded-lg border border-foreground/10 bg-foreground/[0.02] p-5 flex flex-col gap-3">
        <p className="text-[11px] font-medium uppercase tracking-wider text-foreground/50">Response</p>
        <div className="flex items-center gap-3">
          {attempt.status_code ? (
            <span className={`inline-flex items-center rounded border px-2 py-0.5 text-sm font-medium font-mono ${statusColorClass}`}>
              {attempt.status_code}
            </span>
          ) : (
            <span className="text-sm text-foreground/50">No response</span>
          )}
          <span className="text-sm text-foreground/68">{duration}</span>
        </div>
        {attempt.error && (
          <div className="rounded-md border border-red-500/20 bg-red-500/[0.07] px-3 py-2.5">
            <p className="text-sm font-mono text-red-400 break-all">{attempt.error}</p>
          </div>
        )}
      </section>

      {/* Timing */}
      <section className="rounded-lg border border-foreground/10 bg-foreground/[0.02] p-5 flex flex-col gap-3">
        <p className="text-[11px] font-medium uppercase tracking-wider text-foreground/50">Timing</p>
        <div className="grid grid-cols-2 gap-x-6 gap-y-3">
          <div>
            <p className="text-[10px] text-foreground/50 uppercase tracking-wider mb-1">Started</p>
            <p className="text-sm font-mono text-foreground/75">
              {format(new Date(attempt.started_at), "MMM d, yyyy HH:mm:ss")}
            </p>
          </div>
          <div>
            <p className="text-[10px] text-foreground/50 uppercase tracking-wider mb-1">Completed</p>
            <p className="text-sm font-mono text-foreground/75">
              {attempt.completed_at
                ? format(new Date(attempt.completed_at), "MMM d, yyyy HH:mm:ss")
                : "—"}
            </p>
          </div>
        </div>
      </section>

      {/* Metadata */}
      <section className="rounded-lg border border-foreground/10 bg-foreground/[0.02] p-5 flex flex-col gap-3">
        <p className="text-[11px] font-medium uppercase tracking-wider text-foreground/50">Metadata</p>
        <div className="grid grid-cols-2 gap-x-6 gap-y-3">
          <div>
            <p className="text-[10px] text-foreground/50 uppercase tracking-wider mb-1">Attempt #</p>
            <p className="text-sm font-mono text-foreground/75">{attempt.attempt_num}</p>
          </div>
          <div>
            <p className="text-[10px] text-foreground/50 uppercase tracking-wider mb-1">Worker ID</p>
            <p className="text-sm font-mono text-foreground/75 truncate" title={attempt.worker_id}>
              {attempt.worker_id}
            </p>
          </div>
          <div>
            <p className="text-[10px] text-foreground/50 uppercase tracking-wider mb-1">Attempt ID</p>
            <p className="text-sm font-mono text-foreground/60 break-all">{attempt.id}</p>
          </div>
          <div>
            <p className="text-[10px] text-foreground/50 uppercase tracking-wider mb-1">Job ID</p>
            <p className="text-sm font-mono text-foreground/60 break-all">{job.id}</p>
          </div>
        </div>
      </section>
    </div>
  );
}
