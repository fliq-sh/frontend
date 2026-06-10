"use client";

import { createContext, useCallback, useContext, useEffect, useState } from "react";
import { useApi, createBillingApi, BillingBalance } from "@/lib/api";

interface BalanceState {
  balance: BillingBalance | null;
  loading: boolean;
  error: boolean;
  refresh: () => void;
}

const BalanceContext = createContext<BalanceState | null>(null);

/**
 * Fetches the credit balance once for the whole dashboard and shares it (header
 * pill + Overview + Billing) so we don't fire three identical requests on every
 * navigation. Call `refresh()` after an action that changes the balance.
 */
export function BalanceProvider({ children }: { children: React.ReactNode }) {
  const { apiFetch } = useApi();
  const [balance, setBalance] = useState<BillingBalance | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  const refresh = useCallback(() => {
    const api = createBillingApi(apiFetch);
    setLoading(true);
    api
      .getBalance()
      .then((b) => {
        setBalance(b);
        setError(false);
      })
      .catch(() => setError(true))
      .finally(() => setLoading(false));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    refresh();
  }, [refresh]);

  return (
    <BalanceContext.Provider value={{ balance, loading, error, refresh }}>{children}</BalanceContext.Provider>
  );
}

export function useBalance(): BalanceState {
  const ctx = useContext(BalanceContext);
  if (!ctx) throw new Error("useBalance must be used within a BalanceProvider");
  return ctx;
}
