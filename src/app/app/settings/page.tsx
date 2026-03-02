"use client";

import { useState, useEffect, useCallback } from "react";
import { UserProfile } from "@clerk/nextjs";
import { formatDistanceToNow } from "date-fns";
import { useApi, createTokensApi, APIToken, CreateTokenResponse } from "@/lib/api";
import { Button } from "@/components/ui/button";

// ─── New-token inline form ────────────────────────────────────────────────────

function NewTokenForm({ onCreated }: { onCreated: (res: CreateTokenResponse) => void }) {
  const { apiFetch } = useApi();
  const api = createTokensApi(apiFetch);
  const [name, setName] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!name.trim()) return;
    setLoading(true);
    setError(null);
    try {
      const res = await api.create(name.trim());
      setName("");
      onCreated(res);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to create token");
    } finally {
      setLoading(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="flex gap-2">
      <input
        required
        maxLength={256}
        value={name}
        onChange={(e) => setName(e.target.value)}
        placeholder="Token name (e.g. production server)"
        className="flex-1 rounded-md border border-white/10 bg-white/5 px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-white/20"
      />
      <Button type="submit" size="sm" disabled={loading || !name.trim()}>
        {loading ? "Creating…" : "Create"}
      </Button>
      {error && (
        <p className="text-xs text-red-400 mt-1">{error}</p>
      )}
    </form>
  );
}

// ─── One-time raw-token reveal banner ────────────────────────────────────────

function NewTokenBanner({ token, onDismiss }: { token: CreateTokenResponse; onDismiss: () => void }) {
  const [copied, setCopied] = useState(false);

  function handleCopy() {
    navigator.clipboard.writeText(token.token).catch(() => null);
    setCopied(true);
  }

  return (
    <div className="rounded-lg border border-yellow-500/30 bg-yellow-500/5 p-4 flex flex-col gap-3">
      <div className="flex items-start justify-between gap-2">
        <div>
          <p className="text-sm font-medium text-yellow-300">
            Copy your token now — it won&apos;t be shown again
          </p>
          <p className="text-xs text-white/50 mt-0.5">
            <span className="font-medium text-white/70">{token.name}</span>
            {" · "}
            {token.prefix}…
          </p>
        </div>
        <Button size="sm" variant="ghost" className="text-white/40 hover:text-white/60 flex-shrink-0" onClick={onDismiss}>
          Dismiss
        </Button>
      </div>
      <div className="flex gap-2 items-center">
        <code className="flex-1 rounded border border-white/10 bg-black/40 px-3 py-2 text-xs font-mono text-white/80 break-all">
          {token.token}
        </code>
        <Button size="sm" variant="outline" onClick={handleCopy} className="flex-shrink-0 border-white/10">
          {copied ? "Copied ✓" : "Copy"}
        </Button>
      </div>
    </div>
  );
}

// ─── Token row ────────────────────────────────────────────────────────────────

function TokenRow({ token, onRevoked }: { token: APIToken; onRevoked: () => void }) {
  const { apiFetch } = useApi();
  const api = createTokensApi(apiFetch);
  const [revoking, setRevoking] = useState(false);

  async function handleRevoke() {
    setRevoking(true);
    try {
      await api.revoke(token.id);
      onRevoked();
    } catch {
      setRevoking(false);
    }
  }

  return (
    <div className="flex items-center justify-between gap-4 py-3 border-b border-white/5 last:border-0">
      <div className="min-w-0">
        <p className="text-sm font-medium truncate">{token.name}</p>
        <p className="text-xs text-white/40 font-mono mt-0.5">
          {token.prefix}…
          {token.last_used_at
            ? ` · last used ${formatDistanceToNow(new Date(token.last_used_at), { addSuffix: true })}`
            : " · never used"}
          {" · created "}
          {formatDistanceToNow(new Date(token.created_at), { addSuffix: true })}
        </p>
      </div>
      <Button
        size="sm"
        variant="ghost"
        className="text-red-400 hover:text-red-300 flex-shrink-0"
        disabled={revoking}
        onClick={handleRevoke}
      >
        {revoking ? "Revoking…" : "Revoke"}
      </Button>
    </div>
  );
}

// ─── API Tokens card ──────────────────────────────────────────────────────────

function APITokensCard() {
  const { apiFetch } = useApi();
  const api = createTokensApi(apiFetch);
  const [tokens, setTokens] = useState<APIToken[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [newToken, setNewToken] = useState<CreateTokenResponse | null>(null);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const list = await api.list();
      setTokens(list ?? []);
    } catch {
      // silently ignore — user sees empty state
    } finally {
      setLoading(false);
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => { load(); }, [load]);

  function handleCreated(res: CreateTokenResponse) {
    setNewToken(res);
    setShowForm(false);
    load();
  }

  return (
    <div className="rounded-lg border border-white/10 bg-white/5 p-6 flex flex-col gap-4">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="font-medium">API Tokens</h3>
          <p className="text-sm text-white/40 mt-0.5">
            Long-lived credentials for scripts and server integrations.
          </p>
        </div>
        {!showForm && (
          <Button size="sm" onClick={() => setShowForm(true)}>
            New token
          </Button>
        )}
      </div>

      {newToken && (
        <NewTokenBanner token={newToken} onDismiss={() => setNewToken(null)} />
      )}

      {showForm && (
        <div className="flex flex-col gap-2">
          <NewTokenForm onCreated={handleCreated} />
          <button
            className="text-xs text-white/30 hover:text-white/50 text-left"
            onClick={() => setShowForm(false)}
          >
            Cancel
          </button>
        </div>
      )}

      {loading ? (
        <p className="text-sm text-white/30 py-2">Loading…</p>
      ) : tokens.length === 0 ? (
        <p className="text-sm text-white/30 py-2">No tokens yet.</p>
      ) : (
        <div>
          {tokens.map((tok) => (
            <TokenRow key={tok.id} token={tok} onRevoked={load} />
          ))}
        </div>
      )}
    </div>
  );
}

// ─── Page ─────────────────────────────────────────────────────────────────────

export default function SettingsPage() {
  return (
    <div className="flex flex-col gap-8 max-w-2xl">
      <h2 className="text-lg font-semibold">Settings</h2>

      <div className="flex flex-col gap-2">
        <h3 className="text-sm font-medium text-white/80">API Tokens</h3>
        <APITokensCard />
      </div>

      <div className="flex flex-col gap-2">
        <h3 className="text-sm font-medium text-white/80">Account</h3>
        <UserProfile routing="hash" />
      </div>
    </div>
  );
}
