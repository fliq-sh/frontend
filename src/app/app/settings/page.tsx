"use client";

import { useCallback, useEffect, useState } from "react";
import { UserProfile } from "@clerk/nextjs";
import { KeyRound, ShieldCheck, Bell } from "lucide-react";
import {
  useApi,
  createTokensApi,
  createSigningApi,
  createAlertsApi,
  APIToken,
  CreateTokenResponse,
  SigningSecretResponse,
  AlertChannel,
  AlertChannelType,
} from "@/lib/api";
import { Button } from "@/components/ui/button";
import {
  PageHeader,
  SectionCard,
  CopyButton,
  RelativeTime,
  Empty,
  Field,
  TextInput,
  Select,
  FormError,
} from "@/components/dashboard/ui";

// ─── New-token inline form ─────────────────────────────────────────────────

function NewTokenForm({ onCreated }: { onCreated: (res: CreateTokenResponse) => void }) {
  const { apiFetch } = useApi();
  const [name, setName] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!name.trim()) return;
    setLoading(true);
    setError(null);
    try {
      const res = await createTokensApi(apiFetch).create(name.trim());
      setName("");
      onCreated(res);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to create token");
    } finally {
      setLoading(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-2">
      <div className="flex flex-col gap-2 sm:flex-row">
        <TextInput
          required
          maxLength={256}
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="Token name (e.g. production server)"
          className="flex-1"
        />
        <Button type="submit" size="sm" disabled={loading || !name.trim()}>
          {loading ? "Creating…" : "Create token"}
        </Button>
      </div>
      <FormError message={error} />
    </form>
  );
}

// ─── One-time raw-token reveal ─────────────────────────────────────────────

function NewTokenBanner({ token, onDismiss }: { token: CreateTokenResponse; onDismiss: () => void }) {
  return (
    <div className="flex flex-col gap-3 rounded-lg border border-amber-500/30 bg-amber-500/[0.07] p-4">
      <div className="flex items-start justify-between gap-2">
        <div>
          <p className="text-sm font-medium text-amber-200">Copy your token now — it won&apos;t be shown again</p>
          <p className="mt-0.5 text-xs text-foreground/68">
            <span className="font-medium text-foreground/80">{token.name}</span> · {token.prefix}…
          </p>
        </div>
        <Button size="sm" variant="ghost" className="shrink-0 text-foreground/60 hover:text-foreground/80" onClick={onDismiss}>
          Dismiss
        </Button>
      </div>
      <div className="flex items-center gap-2">
        <code className="flex-1 break-all rounded border border-foreground/10 bg-foreground/5 px-3 py-2 font-mono text-xs text-foreground/85">
          {token.token}
        </code>
        <CopyButton value={token.token} label="Copy" variant="outline" className="shrink-0 border-foreground/10" />
      </div>
    </div>
  );
}

function TokenRow({ token, onRevoked }: { token: APIToken; onRevoked: () => void }) {
  const { apiFetch } = useApi();
  const [revoking, setRevoking] = useState(false);

  async function handleRevoke() {
    setRevoking(true);
    try {
      await createTokensApi(apiFetch).revoke(token.id);
      onRevoked();
    } catch {
      setRevoking(false);
    }
  }

  return (
    <div className="flex items-center justify-between gap-4 py-3">
      <div className="min-w-0">
        <p className="truncate text-sm font-medium">{token.name}</p>
        <p className="mt-0.5 font-mono text-xs text-foreground/60">
          {token.prefix}… ·{" "}
          {token.last_used_at ? (
            <>last used <RelativeTime date={token.last_used_at} /></>
          ) : (
            "never used"
          )}{" "}
          · created <RelativeTime date={token.created_at} />
        </p>
      </div>
      <Button size="sm" variant="ghost" className="shrink-0 text-red-400 hover:text-red-300" disabled={revoking} onClick={handleRevoke}>
        {revoking ? "Revoking…" : "Revoke"}
      </Button>
    </div>
  );
}

function APITokensCard() {
  const { apiFetch } = useApi();
  const [tokens, setTokens] = useState<APIToken[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [newToken, setNewToken] = useState<CreateTokenResponse | null>(null);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      setTokens((await createTokensApi(apiFetch).list()) ?? []);
    } catch {
      // empty state covers failure
    } finally {
      setLoading(false);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  return (
    <SectionCard
      title="API tokens"
      description="Long-lived credentials for scripts and server integrations."
      action={
        !showForm ? (
          <Button size="sm" onClick={() => setShowForm(true)}>New token</Button>
        ) : undefined
      }
    >
      <div className="flex flex-col gap-4">
        {newToken && <NewTokenBanner token={newToken} onDismiss={() => setNewToken(null)} />}

        {showForm && (
          <div className="flex flex-col gap-2 rounded-lg border border-foreground/10 bg-foreground/[0.02] p-3">
            <NewTokenForm
              onCreated={(res) => {
                setNewToken(res);
                setShowForm(false);
                load();
              }}
            />
            <button className="text-left text-xs text-foreground/50 hover:text-foreground/68" onClick={() => setShowForm(false)}>
              Cancel
            </button>
          </div>
        )}

        {loading ? (
          <p className="py-2 text-sm text-foreground/50">Loading…</p>
        ) : tokens.length === 0 ? (
          <Empty icon={KeyRound} title="No tokens yet" description="Create one to call the Fliq API from your code." />
        ) : (
          <div className="divide-y divide-foreground/5">
            {tokens.map((tok) => (
              <TokenRow key={tok.id} token={tok} onRevoked={load} />
            ))}
          </div>
        )}
      </div>
    </SectionCard>
  );
}

function SigningSecretCard() {
  const { apiFetch } = useApi();
  const [secret, setSecret] = useState<SigningSecretResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [rotating, setRotating] = useState(false);
  const [revealed, setRevealed] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      setSecret(await createSigningApi(apiFetch).get());
    } catch {
      // no secret yet
    } finally {
      setLoading(false);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  async function handleRotate() {
    setRotating(true);
    setError(null);
    try {
      const res = await createSigningApi(apiFetch).rotate();
      setSecret(res);
      setRevealed(true);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to rotate secret");
    } finally {
      setRotating(false);
    }
  }

  return (
    <SectionCard
      title="Webhook signing secret"
      description="Verify that requests to your endpoints are genuinely from Fliq."
    >
      {loading ? (
        <p className="py-2 text-sm text-foreground/50">Loading…</p>
      ) : secret ? (
        <div className="flex flex-col gap-3">
          <div className="flex items-center gap-2">
            <code className="flex-1 break-all rounded border border-foreground/10 bg-foreground/5 px-3 py-2 font-mono text-xs text-foreground/85">
              {revealed ? secret.secret : "whsec_••••••••••••••••••••••••••••••••"}
            </code>
            <Button size="sm" variant="outline" className="shrink-0 border-foreground/10" onClick={() => setRevealed((v) => !v)}>
              {revealed ? "Hide" : "Reveal"}
            </Button>
            {revealed && <CopyButton value={secret.secret} variant="outline" className="shrink-0 border-foreground/10" />}
          </div>
          <div className="flex items-center justify-between">
            <p className="text-xs text-foreground/58">
              Created <RelativeTime date={secret.created_at} />
            </p>
            <Button size="sm" variant="ghost" className="text-red-400 hover:text-red-300" disabled={rotating} onClick={handleRotate}>
              {rotating ? "Rotating…" : "Rotate secret"}
            </Button>
          </div>
          <FormError message={error} />
        </div>
      ) : (
        <Empty icon={ShieldCheck} title="No signing secret yet" description="One is created automatically with your first webhook." />
      )}
    </SectionCard>
  );
}

// ─── Alert channels ────────────────────────────────────────────────────────

function NewAlertForm({ onCreated }: { onCreated: () => void }) {
  const { apiFetch } = useApi();
  const [type, setType] = useState<AlertChannelType>("webhook");
  const [target, setTarget] = useState("");
  const [name, setName] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError(null);
    try {
      await createAlertsApi(apiFetch).create({ type, target: target.trim(), name: name.trim() || undefined });
      setTarget("");
      setName("");
      onCreated();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to add channel");
    } finally {
      setLoading(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-3 rounded-lg border border-foreground/10 bg-foreground/[0.02] p-3">
      <div className="grid gap-3 sm:grid-cols-2">
        <Field label="Type">
          <Select value={type} onChange={(e) => setType(e.target.value as AlertChannelType)}>
            <option value="webhook">Webhook</option>
            <option value="slack">Slack</option>
          </Select>
        </Field>
        <Field label="Name" hint="Optional label">
          <TextInput value={name} maxLength={256} onChange={(e) => setName(e.target.value)} placeholder="On-call webhook" />
        </Field>
      </div>
      <Field
        label={type === "slack" ? "Slack incoming-webhook URL" : "Webhook URL"}
        hint={type === "slack" ? "Receives a Slack message on permanent failure" : "Receives a JSON failure payload"}
      >
        <TextInput
          required
          type="url"
          value={target}
          maxLength={2048}
          onChange={(e) => setTarget(e.target.value)}
          placeholder="https://hooks.slack.com/services/…"
        />
      </Field>
      <FormError message={error} />
      <Button type="submit" size="sm" disabled={loading || !target.trim()} className="w-fit">
        {loading ? "Adding…" : "Add channel"}
      </Button>
    </form>
  );
}

function AlertRow({ channel, onChanged }: { channel: AlertChannel; onChanged: () => void }) {
  const { apiFetch } = useApi();
  const [busy, setBusy] = useState(false);

  async function run(fn: () => Promise<unknown>) {
    setBusy(true);
    try {
      await fn();
      onChanged();
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="flex items-center justify-between gap-4 py-3">
      <div className="min-w-0">
        <p className="flex items-center gap-2 text-sm font-medium">
          <span className="truncate">{channel.name || (channel.type === "slack" ? "Slack" : "Webhook")}</span>
          <span className="rounded border border-foreground/15 px-1.5 py-0.5 text-[10px] uppercase tracking-wide text-foreground/60">
            {channel.type}
          </span>
          {!channel.enabled && <span className="text-[11px] text-foreground/50">disabled</span>}
        </p>
        <p className="mt-0.5 truncate font-mono text-xs text-foreground/60">{channel.target}</p>
      </div>
      <div className="flex shrink-0 items-center gap-1">
        <Button
          size="sm"
          variant="ghost"
          disabled={busy}
          className="text-foreground/70 hover:text-foreground"
          onClick={() => run(() => createAlertsApi(apiFetch).setEnabled(channel.id, !channel.enabled))}
        >
          {channel.enabled ? "Disable" : "Enable"}
        </Button>
        <Button
          size="sm"
          variant="ghost"
          disabled={busy}
          className="text-red-400 hover:text-red-300"
          onClick={() => run(() => createAlertsApi(apiFetch).delete(channel.id))}
        >
          Remove
        </Button>
      </div>
    </div>
  );
}

function AlertChannelsCard() {
  const { apiFetch } = useApi();
  const [channels, setChannels] = useState<AlertChannel[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      setChannels((await createAlertsApi(apiFetch).list()).channels ?? []);
    } catch {
      // empty state covers failure
    } finally {
      setLoading(false);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  return (
    <SectionCard
      title="Failure alerts"
      description="Get notified when a job or buffer item exhausts its retries — your endpoint is down and Fliq has given up. Retries don't alert; only permanent failures do."
      action={!showForm ? <Button size="sm" onClick={() => setShowForm(true)}>Add channel</Button> : undefined}
    >
      <div className="flex flex-col gap-4">
        {showForm && (
          <div className="flex flex-col gap-2">
            <NewAlertForm
              onCreated={() => {
                setShowForm(false);
                load();
              }}
            />
            <button className="text-left text-xs text-foreground/50 hover:text-foreground/68" onClick={() => setShowForm(false)}>
              Cancel
            </button>
          </div>
        )}

        {loading ? (
          <p className="py-2 text-sm text-foreground/50">Loading…</p>
        ) : channels.length === 0 ? (
          <Empty icon={Bell} title="No alert channels yet" description="Add a Slack or webhook channel to hear about permanent failures." />
        ) : (
          <div className="divide-y divide-foreground/5">
            {channels.map((ch) => (
              <AlertRow key={ch.id} channel={ch} onChanged={load} />
            ))}
          </div>
        )}
      </div>
    </SectionCard>
  );
}

export default function SettingsPage() {
  return (
    <div className="flex flex-col gap-8 sm:gap-10">
      <PageHeader title="Settings" description="API access, webhook signing, alerts, and your account." />
      <APITokensCard />
      <SigningSecretCard />
      <AlertChannelsCard />
      <SectionCard title="Account" noPadding bodyClassName="p-0">
        <div className="overflow-x-auto p-2 sm:p-4">
          <UserProfile routing="hash" />
        </div>
      </SectionCard>
    </div>
  );
}
